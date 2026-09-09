import * as THREE from 'three'
import { flatGround, type GroundHeight } from './terrain'
import { buildingCharacter } from './architecture'

/** Original, reusable facade vocabulary. Footprints are GIS; elevations are stylized. */
export function masonryTexture(brick: boolean) {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256
  const context = canvas.getContext('2d')!
  context.fillStyle = brick ? '#dbd5cc' : '#d8d7d0'; context.fillRect(0, 0, 256, 256)
  const rows = brick ? 48 : 8, height = 256 / rows, width = brick ? 16 : 96
  for (let row = 0; row < rows; row++) for (let col = -1; col < (brick ? 18 : 7); col++) {
    const tone = 239 + Math.abs((row * 17 + col * 31 + 77) % 10)
    context.fillStyle = `rgb(${tone},${tone},${tone})`
    context.fillRect(col * width + (row % 2) * width / 2 + .5, row * height + .5, width - 1, height - 1)
  }
  const texture = new THREE.CanvasTexture(canvas); texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 8
  return texture
}
export function createFacadeKit(roads: {name: string; p:number[][]}[] = [], heightAt: GroundHeight = flatGround) {
  const cube = new THREE.BoxGeometry(1,1,1)
  const materials = [
    new THREE.MeshStandardMaterial({color:'#e5e5db',roughness:.85}),
    new THREE.MeshStandardMaterial({color:'#718f9f',roughness:.35,metalness:.2}),
    new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.8}),
    new THREE.MeshStandardMaterial({color:'#6d7b7c',roughness:.8}),
    new THREE.MeshStandardMaterial({color:'#b4bcb8',roughness:1}),
    new THREE.MeshStandardMaterial({color:'#6e493a',roughness:1}),
  ]
  const streetGrid=new Map<string,number[][]>()
  for(const road of roads)for(let i=1;i<road.p.length;i++){
    const a=road.p[i-1],b=road.p[i],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/20))
    for(let j=0;j<=n;j++){const point=[a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n],key=`${Math.floor(point[0]/64)}_${Math.floor(point[1]/64)}`;const cell=streetGrid.get(key)??[];cell.push(point);streetGrid.set(key,cell)}
  }
  const streetDistance=(x:number,z:number)=>{
    let nearest=Infinity
    for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)for(const p of streetGrid.get(`${Math.floor(x/64)+dx}_${Math.floor(z/64)+dz}`)??[])nearest=Math.min(nearest,Math.hypot(p[0]-x,p[1]-z))
    return nearest
  }
  const matrix=new THREE.Object3D()
  return {
    setNight:(amount:number)=>{materials[1].emissive.set('#e8b36c');materials[1].emissiveIntensity=amount*.8},
    build(buildings:{p:number[][];h:number;s?:number}[]) {
      let base=0
      const buckets:{matrix:THREE.Matrix4;color?:string}[][]=materials.map(()=>[])
      const add=(bucket:number,x:number,y:number,z:number,w:number,h:number,d:number,angle:number,color?:string)=>{
        matrix.position.set(x,y+base,z);matrix.rotation.set(0,angle,0);matrix.scale.set(w,h,d);matrix.updateMatrix();buckets[bucket].push({matrix:matrix.matrix.clone(),color})
      }
      for(const {p,h:rawHeight,s} of buildings){
        const c=buildingCharacter(p,s??rawHeight,s!==undefined),h=c.height
        base=heightAt(c.x,c.z)
        const signed=p.reduce((sum,a,i)=>{const b=p[(i+1)%p.length];return sum+a[0]*b[1]-b[0]*a[1]},0)
        let front=-1,nearest=Infinity
        for(let i=0;i<p.length-1;i++){
          const a=p[i],b=p[i+1],length=Math.hypot(b[0]-a[0],b[1]-a[1]);if(length<3)continue
          const distance=streetDistance((a[0]+b[0])/2,(a[1]+b[1])/2)
          if(distance<nearest){nearest=distance;front=i}
        }
        if(front<0)front=0
        for(let i=0;i<p.length-1;i++){
          const [ax,az]=p[i],[bx,bz]=p[i+1],dx=bx-ax,dz=bz-az,length=Math.hypot(dx,dz)
          if(length<3)continue
          const nx=(signed>0?dz:-dz)/length,nz=(signed>0?-dx:dx)/length,angle=-Math.atan2(dz,dx),cx=(ax+bx)/2,cz=(az+bz)/2,isFront=i===front
          const part=(bucket:number,t:number,y:number,w:number,height:number,depth:number,out:number,color?:string)=>add(bucket,ax+dx*t+nx*out,y,az+dz*t+nz*out,w,height,depth,angle,color)
          // Layered cornices and dark roof coping replace the identical cream roof bands.
          part(0,.5,h-.15,length,.18,.32,.08)
          part(3,.5,h+.04,length+.08,.12,.44,.08)
          if(isFront&&c.house){
            part(0,.5,h-.4,length,.24,.4,.12)
            for(let tooth=.4;tooth<length;tooth+=.55)part(0,tooth/length,h-.6,.16,.22,.36,.14)
            // Chimneys are decorative and remain just inside the existing footprint.
            part(5,.22,h+.65,.65,1.3,.7,-.65)
            part(0,.22,h+1.3,.82,.12,.86,-.65)
          }
          const bays=Math.max(1,Math.floor(length/(c.house?2.6:c.waterfront?3:4.2))),doorBay=c.seed%bays
          for(let bay=0;bay<bays;bay++){
            const t=(bay+.5)/bays,width=Math.min(c.house?1.05:c.waterfront?2.35:1.7,length/bays-.8)
            for(let y=c.house?2.25:2.1;y<h-1.1;y+=c.house?3.05:3.6){
              if(isFront&&bay===doorBay&&y<3){
                const color=['#354b3e','#623f34','#294857','#7a4930','#8a7b54'][c.seed%5]
                part(0,t,1.65,1.3,2.65,.22,.1)
                part(2,t,1.55,1.05,2.4,.12,.24,color)
                part(1,t,2.4,.72,.4,.06,.32)
                part(0,t,2.8,1.5,.2,.4,.17)
                for(const yPanel of [.85,1.55])part(3,t,yPanel,.7,.48,.05,.32)
                part(0,t+.25/length,1.5,.07,.09,.07,.35)
                if(c.house){
                  for(let step=0;step<3;step++)part(4,t,.09+step*.09,1.5,.18+step*.18,1.15-step*.3,.45+step*.15)
                  for(const side of [-1,1]){
                    part(3,t+side*.72/length,.72,.04,.85,.04,.85)
                    part(3,t+side*.72/length,1.12,.045,.045,1.1,.75)
                  }
                }
                continue
              }
              const bayFront=c.house&&!c.federal&&isFront&&bay!==doorBay&&c.seed%3!==0
              const out=bayFront?.48:.13,windowHeight=c.house?1.75:2.25
              if(bayFront)part(5,t,y,width+.36,windowHeight+.45,.5,.2)
              part(0,t,y,width+.2,windowHeight+.2,.16,out)
              part(1,t,y,width,windowHeight,.07,out+.12)
              part(0,t,y,width,.055,.05,out+.18)
              if(c.house)part(0,t,y,.045,windowHeight,.05,out+.18)
              part(0,t,y-windowHeight/2-.16,width+.38,.12,.4,out+.08)
              part(0,t,y+windowHeight/2+.17,width+.25,.14,.2,out)
              if(c.federal&&isFront)for(const side of [-1,1])part(3,t+side*(width/2+.3)/length,y,.38,windowHeight+.15,.1,.17)
            }
          }
          if(isFront&&!c.house){
            // A recessed shop/office entrance and canopy give the ground floor its own scale.
            part(3,.5,3.65,Math.min(length,12),.15,1.2,.45)
            part(0,.5,4.15,length,.28,.35,.12)
          }
        }
      }
      const group=new THREE.Group();group.name='Nearby facade detail'
      buckets.forEach((instances,i)=>{
        if(!instances.length)return
        const mesh=new THREE.InstancedMesh(cube,materials[i],instances.length)
        instances.forEach((v,j)=>{mesh.setMatrixAt(j,v.matrix);if(i===2)mesh.setColorAt(j,new THREE.Color(v.color??'#ffffff'))})
        mesh.computeBoundingSphere();mesh.castShadow=true;group.add(mesh)
      })
      return group
    },
    dispose:()=>{cube.dispose();materials.forEach(m=>m.dispose());streetGrid.clear()},
  }
}
