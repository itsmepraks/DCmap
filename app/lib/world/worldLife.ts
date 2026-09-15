import * as THREE from 'three'
import type RAPIER from '@dimforge/rapier3d-compat'
import {crownGeometry,branchGeometry} from './treeGeometry'
import {insideWater} from './districtNavigation'
import {treeStyle,type WorldSeason} from './atmosphere'
import type {GroundHeight} from './terrain'

export function createWorldLife(scene:THREE.Scene,heightAt:GroundHeight,water:number[][][][],physics:RAPIER.World,rapier:typeof RAPIER){
 const group=new THREE.Group();group.name='Seasonal landscape and Mall life';scene.add(group)
 const geometries:THREE.BufferGeometry[]=[],materials:THREE.Material[]=[],colliders:RAPIER.Collider[]=[]
 const material=(color:string)=>{const m=new THREE.MeshStandardMaterial({color,roughness:.9});materials.push(m);return m}
 const instances=(geometry:THREE.BufferGeometry,mat:THREE.Material,count:number)=>{geometries.push(geometry);const mesh=new THREE.InstancedMesh(geometry,mat,count);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh}
 const matrix=new THREE.Object3D(),color=new THREE.Color()
 // Shoreline-derived, illustrative cherry plantings; this is not a species survey.
 const cherries:{x:number;z:number}[]=[]
 shore: for(const rings of water)for(const ring of rings)for(let i=1;i<ring.length;i++){
   if(ring.length<50)continue
   const a=ring[i-1],b=ring[i],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz)
   const steps=Math.max(1,Math.ceil(length/18))
   for(let j=0;j<steps;j++){
     const x=a[0]+dx*j/steps,z=a[1]+dz*j/steps
     if(x<300||x>1550||z<190||z>1250||length<.1)continue
     let px=x+dz/length*7,pz=z-dx/length*7
     if(insideWater(px,pz,rings)){px=x-dz/length*7;pz=z+dx/length*7}
     if(insideWater(px,pz,rings)||cherries.some(p=>Math.hypot(p.x-px,p.z-pz)<17))continue
     cherries.push({x:px,z:pz});if(cherries.length>=160)break shore
   }
   if(cherries.length>=160)break shore
 }
 const crown=instances(crownGeometry(),material('#ffffff'),cherries.length),limbs=instances(branchGeometry(),material('#66533f'),cherries.length),trunks=instances(new THREE.CylinderGeometry(.17,.27,4,9),material('#66533f'),cherries.length)
 cherries.forEach(({x,z},i)=>{
   const base=heightAt(x,z);matrix.position.set(x,base,z);matrix.scale.set(.8,.7,.8);matrix.updateMatrix();limbs.setMatrixAt(i,matrix.matrix)
   matrix.position.y=base+2;matrix.scale.set(1,1,1);matrix.updateMatrix();trunks.setMatrixAt(i,matrix.matrix)
   colliders.push(physics.createCollider(rapier.ColliderDesc.cylinder(2,.27).setTranslation(x,base+2,z)))
 });limbs.computeBoundingSphere();trunks.computeBoundingSphere()
 const people=36
 const heads=instances(new THREE.SphereGeometry(.13,9,6),material('#ffffff'),people)
 const bodies=instances(new THREE.CapsuleGeometry(.17,.38,3,7),material('#ffffff'),people)
 const legs=instances(new THREE.CylinderGeometry(.065,.075,.9,7),material('#39414a'),people*2)
 const arms=instances(new THREE.CylinderGeometry(.045,.055,.5,6),material('#ffffff'),people*2)
 for(let i=0;i<people;i++){
   heads.setColorAt(i,color.set(['#d4a077','#9a684a','#624436','#e1b797'][i%4]));bodies.setColorAt(i,color.set(['#556f86','#a75944','#bdab79','#577867','#aaa5a0','#685a76'][i%6]))
   for(let side=0;side<2;side++)arms.setColorAt(i*2+side,color.set(['#556f86','#a75944','#bdab79','#577867','#aaa5a0','#685a76'][i%6]))
 }
 // A small number of cyclists use the parallel Mall promenade.
 const wheels=instances(new THREE.TorusGeometry(.34,.028,5,16),material('#333a3c'),16)
 const bikeFrames=instances(new THREE.BoxGeometry(1,.045,.06),material('#87969b'),8)
 const riders=instances(new THREE.CapsuleGeometry(.16,.43,3,7),material('#bd744b'),8)
 const riderLegs=instances(new THREE.CylinderGeometry(.055,.07,.62,6),material('#3c4753'),16)
 const riderArms=instances(new THREE.CylinderGeometry(.04,.045,.5,6),material('#bd744b'),16)
 const riderHeads=instances(new THREE.SphereGeometry(.14,9,6),material('#d7b596'),8)
 const particlesCount=160,particlePositions=new Float32Array(particlesCount*3),particleGeometry=new THREE.BufferGeometry();particleGeometry.setAttribute('position',new THREE.BufferAttribute(particlePositions,3));geometries.push(particleGeometry)
 const sprite=new Uint8Array(16*16*4)
 for(let y=0;y<16;y++)for(let x=0;x<16;x++){const i=(y*16+x)*4;sprite[i]=sprite[i+1]=sprite[i+2]=255;sprite[i+3]=Math.round(Math.max(0,1-Math.hypot(x-7.5,y-7.5)/7.5)*220)}
 const texture=new THREE.DataTexture(sprite,16,16);texture.needsUpdate=true
 const particleMaterial=new THREE.PointsMaterial({size:.14,map:texture,color:'#ffffff',transparent:true,depthWrite:false,opacity:.8});materials.push(particleMaterial)
 const particles=new THREE.Points(particleGeometry,particleMaterial);particles.frustumCulled=false;group.add(particles)
 let season:WorldSeason='summer',enabled=true,motion=true
 const setSeason=(value:WorldSeason)=>{
   season=value
   cherries.forEach(({x,z},i)=>{const style=treeStyle(x,z,season,true);matrix.position.set(x,heightAt(x,z)+5.1,z);matrix.rotation.set(0,0,0);matrix.scale.setScalar(style.bare?0:3.4*style.scale);matrix.scale.y*=.8;matrix.updateMatrix();crown.setMatrixAt(i,matrix.matrix);crown.setColorAt(i,color.set(style.color))})
   crown.instanceMatrix.needsUpdate=true;if(crown.instanceColor)crown.instanceColor.needsUpdate=true;crown.computeBoundingSphere()
   particleMaterial.color.set(value==='winter'?'#f2f5fa':value==='blossom'?'#f1d1d8':'#ba7c3e');particleMaterial.size=value==='winter'?.12:.16
 }
 setSeason('summer')
 const place=(mesh:THREE.InstancedMesh,i:number,x:number,y:number,z:number,angle=0)=>{matrix.position.set(x,y,z);matrix.scale.set(1,1,1);matrix.rotation.set(0,0,angle);matrix.updateMatrix();mesh.setMatrixAt(i,matrix.matrix)}
 const liveMeshes=[heads,bodies,legs,arms,wheels,bikeFrames,riders,riderHeads,riderLegs,riderArms]
 const bloomTarget=[...cherries].sort((a,b)=>Math.hypot(a.x-420,a.z-820)-Math.hypot(b.x-420,b.z-820))[0]??{x:350,z:800}
 const neighbor=[...cherries].filter(p=>p!==bloomTarget).sort((a,b)=>Math.hypot(a.x-bloomTarget.x,a.z-bloomTarget.z)-Math.hypot(b.x-bloomTarget.x,b.z-bloomTarget.z))[0]
 return {
   bloomTarget,
   bloomArrival:neighbor?{x:(bloomTarget.x+neighbor.x)/2,z:(bloomTarget.z+neighbor.z)/2}:{x:bloomTarget.x+8,z:bloomTarget.z},
   setSeason,setEnabled:(value:boolean)=>{enabled=value;liveMeshes.forEach(m=>m.visible=value)},setMotion:(value:boolean)=>{motion=value},
   update:(time:number,position:{x:number;y:number;z:number})=>{
     const t=motion?time/1000:0
     const nearMall=position.x> -200&&position.x<1650&&Math.abs(position.z)<550
     liveMeshes.forEach(m=>m.visible=enabled&&nearMall)
     if(enabled&&nearMall){
       for(let i=0;i<people;i++){
         const direction=i%2?1:-1,phase=(i*37+t*(1+i%3*.15))%610,x=direction>0?180+phase:790-phase,z=(i%4<2?-36:36)+(i%3-1)*2.1,base=heightAt(x,z),swing=Math.sin(t*4+i)*.42
         place(heads,i,x,base+1.63,z);place(bodies,i,x,base+1.18,z)
         for(let side=0;side<2;side++){const sign=side?1:-1;place(legs,i*2+side,x+Math.sin(swing*sign)*.25,base+.44,z+sign*.1,swing*sign);place(arms,i*2+side,x-Math.sin(swing*sign)*.2,base+1.14,z+sign*.25,-swing*sign)}
       }
       for(let i=0;i<8;i++){
         const x=140+(i*153+t*(3+i%2))%1270,z=i%2?130:-130,base=heightAt(x,z)
         place(wheels,i*2,x-.52,base+.35,z);place(wheels,i*2+1,x+.52,base+.35,z);place(bikeFrames,i,x,base+.65,z,-.15);place(riders,i,x,base+1.1,z,-.3);place(riderHeads,i,x+.2,base+1.53,z)
         for(let side=0;side<2;side++){const sign=side?1:-1;place(riderLegs,i*2+side,x-.12,base+.68,z+sign*.12,Math.sin(t*5+i+side*Math.PI)*.25);place(riderArms,i*2+side,x+.35,base+1.05,z+sign*.18,-.7)}
       }
       liveMeshes.forEach(m=>{m.instanceMatrix.needsUpdate=true;m.computeBoundingSphere()})
     }
     particles.visible=motion&&(season==='winter'||season==='autumn'||season==='blossom'&&position.x>250&&position.x<1600&&position.z>150&&position.z<1400)&&position.y-heightAt(position.x,position.z)<45
     if(particles.visible){
       const base=heightAt(position.x,position.z)
       for(let i=0;i<particlesCount;i++){
         const x=position.x+((i*17.37+t*.6)%48)-24,z=position.z+((i*11.73+t*.25)%48)-24,y=base+((i*3.31-t*(season==='winter'?.65:.3))%12+12)%12
         particlePositions.set([x+Math.sin(t+i)*.5,y,z],i*3)
       }
       particleGeometry.attributes.position.needsUpdate=true
     }
   },
   dispose:()=>{scene.remove(group);group.traverse(o=>{if(o instanceof THREE.InstancedMesh)o.dispose()});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());texture.dispose();colliders.forEach(c=>physics.removeCollider(c,true))},
 }
}
