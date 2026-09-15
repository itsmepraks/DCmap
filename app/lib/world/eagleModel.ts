import * as T from 'three'
import type {EagleState} from './eaglePhysics'
/** Original articulated bald eagle. Wingspan ~2.3 m, with layered flight feathers. */
export function createEagle(scene:T.Scene){
 const root=new T.Group();root.name='Player bald eagle';scene.add(root);root.visible=false
 const brown=new T.MeshStandardMaterial({color:'#39291f',roughness:.85}),feather=new T.MeshStandardMaterial({color:'#524031',roughness:.9}),white=new T.MeshStandardMaterial({color:'#f4f0de',roughness:.8}),gold=new T.MeshStandardMaterial({color:'#d99d28',roughness:.6}),black=new T.MeshStandardMaterial({color:'#171b18',roughness:.3})
 const geos=new Set<T.BufferGeometry>()
 const add=(parent:T.Group,geo:T.BufferGeometry,mat:T.Material,x:number,y:number,z:number,sx=1,sy=1,sz=1)=>{geos.add(geo);const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=m.receiveShadow=true;parent.add(m);return m}
 const ball=new T.SphereGeometry(1,20,14)
 add(root,ball,brown,0,0,0,.21,.22,.48);add(root,ball,feather,0,-.1,-.17,.18,.17,.28)
 add(root,ball,white,0,.10,-.43,.16,.17,.21);add(root,ball,white,0,.12,-.62,.14,.145,.17)
 const beak=add(root,new T.ConeGeometry(.085,.24,16),gold,0,.09,-.83);beak.rotation.x=-Math.PI/2
 const hook=add(root,new T.ConeGeometry(.045,.1,10),gold,0,.015,-.91);hook.rotation.x=Math.PI
 for(const side of [-1,1]){add(root,ball,gold,side*.127,.155,-.68,.033,.034,.017);add(root,ball,black,side*.145,.155,-.685,.014,.023,.012);const brow=add(root,ball,white,side*.13,.195,-.68,.055,.023,.075);brow.rotation.z=side*.16
  add(root,ball,gold,side*.09,-.22,.2,.033,.055,.11);for(let t=0;t<3;t++){const claw=add(root,new T.ConeGeometry(.013,.09,7),black,side*.09+(t-1)*.024,-.26,.27);claw.rotation.x=-.7}}
 // Individual tapered feathers create a readable, fingered wing silhouette.
 function blade(parent:T.Group,mat:T.Material,x:number,z:number,length:number,width:number,rotation:number){const shape=new T.Shape();shape.moveTo(-width/2,0);shape.quadraticCurveTo(-width*.65,length*.55,0,length);shape.quadraticCurveTo(width*.65,length*.55,width/2,0);shape.closePath();const geometry=new T.ExtrudeGeometry(shape,{depth:.018,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.009,bevelThickness:.008});geometry.rotateX(Math.PI/2);const m=add(parent,geometry,mat,x,0,z);m.rotation.y=rotation;return m}
 const wings=[new T.Group(),new T.Group()];wings.forEach((wing,i)=>{const side=i?1:-1;wing.position.set(side*.16,.065,-.06);root.add(wing);add(wing,ball,brown,side*.34,0,.015,.44,.07,.22)
  for(let f=0;f<9;f++)blade(wing,f%3?brown:feather,side*(.12+f*.09),.03,.36+(f/9)*.16,.12,side*(.15+f*.075))
  for(let f=0;f<6;f++)blade(wing,f%2?brown:feather,side*(.72+f*.052),-.10+f*.03,.43-f*.035,.095,side*(.85+f*.13))
  for(let f=0;f<7;f++)add(wing,ball,feather,side*(.13+f*.1),.055,-.07,.09,.022,.15)
 })
 const tail=new T.Group();tail.position.z=.35;root.add(tail);for(let f=0;f<7;f++)blade(tail,white,(f-3)*.035,0,.38-Math.abs(f-3)*.015,.075,(f-3)*.07)
 let phase=0
 return{group:root,update:(p:T.Vector3,s:EagleState,dt:number,visible:boolean,reduced=false)=>{root.visible=visible;if(!visible)return;root.position.copy(p);root.rotation.set(s.pitch,s.yaw,-s.bank,'YXZ');phase+=dt*(s.flapping>0?8.5:1.4);const flap=reduced?0:Math.sin(phase)*(s.flapping>0?.65:.035);wings[0].rotation.z=flap+.10;wings[1].rotation.z=-flap-.10;wings.forEach(w=>{w.rotation.y=s.pitch<-.4?.28:0});tail.rotation.x=-s.pitch*.25;tail.rotation.z=s.bank*.15},dispose:()=>{scene.remove(root);geos.forEach(g=>g.dispose());[brown,feather,white,gold,black].forEach(m=>m.dispose())}}
}
