import * as T from 'three'
import type { Museum } from './catalog'
import { exhibitModel } from './models'
import { galleryPath, moveVisitor, type Barrier, type Point } from './navigation'
export type MuseumSnapshot={x:number;z:number;heading:number;near:string|null;guiding:boolean}
export function createMuseumRuntime(host:HTMLElement,museum:Museum,publish:(s:MuseumSnapshot)=>void,interact:(id:string)=>void){
 const scene=new T.Scene();scene.background=new T.Color('#e0d6c0');scene.fog=new T.Fog('#e0d6c0',50,110)
 const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(host.clientWidth,host.clientHeight);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap
 const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label',`${museum.name} gallery. WASD to walk, drag to look, E to inspect, Space to jump.`);host.appendChild(canvas)
 const camera=new T.PerspectiveCamera(65,host.clientWidth/Math.max(1,host.clientHeight),.08,140);camera.rotation.order='YXZ'
 scene.add(new T.HemisphereLight('#fff2d7','#89897e',2.3));const sun=new T.DirectionalLight('#fff1d4',3);sun.position.set(8,16,12);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-25,right:25,top:28,bottom:-28,near:1,far:80});sun.shadow.normalBias=.02;scene.add(sun)
 const barriers:Barrier[]=[]
 const materials=new Map<string,T.MeshStandardMaterial>()
 const mat=(c:string)=>{if(!materials.has(c))materials.set(c,new T.MeshStandardMaterial({color:c,roughness:.8}));return materials.get(c)!}
 function box(c:string,x:number,y:number,z:number,w:number,h:number,d:number,solid=false){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat(c));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;scene.add(m);if(solid)barriers.push({x,z,w,d});return m}
 function label(text:string,x:number,y:number,z:number,w:number,color='#423b31',back='#eee3c9'){
  const c=document.createElement('canvas');c.width=1024;c.height=192;const ctx=c.getContext('2d')!;ctx.fillStyle=back;ctx.fillRect(0,0,1024,192);ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='48px Georgia';ctx.fillText(text,512,96,940);const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());const m=new T.Mesh(new T.PlaneGeometry(w,w*192/1024),new T.MeshBasicMaterial({map:texture}));m.position.set(x,y,z);scene.add(m);return m
 }
 const wall=museum.id==='air-space'?'#d2d9d8':museum.id==='american-history'?'#c9bda8':'#e0d4bb'
 box('#cec5b1',0,-.18,-4.5,46,.36,45)
 for(let x=-22;x<=22;x+=2)box('#b7b19f',x,.003,-4.5,.016,.006,45)
 for(let z=-26;z<=18;z+=2)box('#b7b19f',0,.004,z,46,.006,.016)
 box(wall,-23,5,-4.5,.5,10,45,true);box(wall,23,5,-4.5,.5,10,45,true);box(wall,0,5,-27,46,10,.5,true)
 box(wall,-14,5,18,18,10,.5,true);box(wall,14,5,18,18,10,.5,true);box(wall,0,7,18,10,6,.5)
 box('#81745d',0,2.2,18.1,8,4.4,.2);label('EXIT · RETURN TO THE MALL',0,3,17.94,7).rotation.y=Math.PI
 box(wall,0,4,-9,16,8,.5,true);box(wall,-21.5,4,-9,3,8,.5,true);box(wall,21.5,4,-9,3,8,.5,true);box(wall,0,4,-18,.5,8,18,true)
 label(museum.shortName.toUpperCase(),0,6,-8.7,13,museum.color)
 label(museum.exhibits[1].gallery,-14,6,-9,10,museum.color);label(museum.exhibits[2].gallery,14,6,-9,10,museum.color)
 // A high skylit hall; the museum-specific architecture is an interpretation.
 for(const x of [-18,-6,6,18]){box('#f4ead5',x,10,-4,10,.2,40);box('#9b927d',x-5.2,9.7,-4,.25,.45,40)}
 if(museum.id==='natural-history'){
  for(const x of [-9,9])for(const z of [-5,6]){const col=new T.Mesh(new T.CylinderGeometry(.48,.65,7.5,24),mat('#d9cbb0'));col.position.set(x,3.75,z);scene.add(col);barriers.push({x,z,w:1.3,d:1.3});box('#c1b394',x,.2,z,1.6,.4,1.6);box('#c1b394',x,7.5,z,1.6,.4,1.6)}
  const rim=new T.Mesh(new T.TorusGeometry(8,.18,8,72),mat('#a58e60'));rim.rotation.x=Math.PI/2;rim.position.y=8.8;scene.add(rim)
 }else if(museum.id==='air-space'){for(const x of [-21,21])for(let z=-24;z<18;z+=5){box('#536f7d',x,4,z,.22,8,.22);box('#89a7ac',x,4,z+2,.12,6,3.4)}}
 else{box('#625148',0,4,-8.6,14,7,.2);label('A FLAG. A JOURNEY. A STORY.',0,7.1,-8.4,12,'#e8dcc2','#625148')}
 for(const e of museum.exhibits){
  const model=exhibitModel(e.kind);model.position.set(e.x,.35,e.z);model.userData.exhibit=e.id;scene.add(model)
  const w=e.kind==='flyer'?11:e.kind==='flag'?10:e.kind==='elephant'?6:e.kind==='fossil'?4:5,d=e.kind==='fossil'?11:e.kind==='elephant'?8:6
  box('#b4a78c',e.x,.15,e.z,w,.3,d,true).userData.exhibit=e.id
  label(e.name,e.x,1.05,e.z+d/2+.15,Math.min(w*.5,2.8)).userData.exhibit=e.id
  const lamp=new T.PointLight('#ffedd1',35,14,2);lamp.position.set(e.x,6,e.z+3);scene.add(lamp)
  const ring=new T.Mesh(new T.TorusGeometry(.12,.018,8,24),new T.MeshBasicMaterial({color:museum.color}));ring.position.set(e.x,1.95,e.z+d/2+.2);scene.add(ring)
 }
 let position:Point={x:0,z:13},yaw=0,pitch=0,velocity={x:0,z:0},height=1.65,vertical=0,previous=performance.now(),lastPublish=0,alive=true,blocked=false,near:string|null=null,path:Point[]=[],guideTarget:Point|null=null
 const keys=new Set<string>();let pointer:number|null=null,lastX=0,lastY=0,dragDistance=0
 const clear=()=>{keys.clear();velocity={x:0,z:0};pointer=null;path=[]}
 const look=(dx:number,dy:number)=>{yaw-=dx*.0025;pitch=T.MathUtils.clamp(pitch-dy*.0025,-1.15,1.15)}
 const down=(e:PointerEvent)=>{if(blocked||e.button!==0)return;pointer=e.pointerId;lastX=e.clientX;lastY=e.clientY;dragDistance=0;canvas.setPointerCapture(e.pointerId);canvas.focus()}
 const move=(e:PointerEvent)=>{if(blocked)return;if(document.pointerLockElement===canvas)look(e.movementX,e.movementY);else if(pointer===e.pointerId){const dx=e.clientX-lastX,dy=e.clientY-lastY;dragDistance+=Math.abs(dx)+Math.abs(dy);look(dx,dy);lastX=e.clientX;lastY=e.clientY}}
 const up=(e:PointerEvent)=>{if(e.pointerId!==pointer)return;pointer=null;if(dragDistance<5&&near&&!blocked)interact(near)}
 const keydown=(e:KeyboardEvent)=>{if(blocked||e.ctrlKey||e.metaKey||(e.target as HTMLElement)?.closest('button,input,dialog,a'))return;const key=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift',' '].includes(key)){e.preventDefault();keys.add(key);path=[]}if(key==='e'&&!e.repeat&&near){e.preventDefault();interact(near)}if(key==='escape')clear()}
 const keyup=(e:KeyboardEvent)=>keys.delete(e.key.toLowerCase())
 const resize=()=>{renderer.setSize(host.clientWidth,host.clientHeight);camera.aspect=host.clientWidth/Math.max(1,host.clientHeight);camera.updateProjectionMatrix()};const observer=new ResizeObserver(resize);observer.observe(host)
 const focus=(e:FocusEvent)=>{if(e.target!==canvas)clear()}
 window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('blur',clear);window.addEventListener('focusin',focus);document.addEventListener('visibilitychange',clear)
 canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',clear)
 const lock=()=>{if(!blocked)void canvas.requestPointerLock?.()?.catch(()=>{})};canvas.addEventListener('dblclick',lock)
 // Interaction uses a clear line to the display, so open skeletal models remain inspectable.
 const visible=(e:{x:number;z:number})=>!barriers.some(b=>{if(b.x===e.x&&b.z===e.z)return false;const steps=Math.ceil(Math.hypot(position.x-e.x,position.z-e.z)*5);for(let i=1;i<steps;i++){const t=i/steps;if(Math.abs(position.x+(e.x-position.x)*t-b.x)<b.w/2&&Math.abs(position.z+(e.z-position.z)*t-b.z)<b.d/2)return true}return false})
 let frame=0
 function tick(now:number){if(!alive)return;const dt=Math.min(.035,(now-previous)/1000);previous=now
  if(!blocked&&!document.hidden){let forward=Number(keys.has('w')||keys.has('arrowup'))-Number(keys.has('s')||keys.has('arrowdown')),right=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'));const speed=keys.has('shift')?6:3.8
   if(path.length){const target=path[0],dx=target.x-position.x,dz=target.z-position.z;if(Math.hypot(dx,dz)<.22){path.shift();if(!path.length&&guideTarget)yaw=Math.atan2(position.x-guideTarget.x,position.z-guideTarget.z)}else{yaw=Math.atan2(-dx,-dz);pitch=0;forward=1;right=0}}
   const length=Math.max(1,Math.hypot(forward,right));const vx=(-Math.sin(yaw)*forward+Math.cos(yaw)*right)/length*speed,vz=(-Math.cos(yaw)*forward-Math.sin(yaw)*right)/length*speed
   velocity.x=T.MathUtils.damp(velocity.x,vx,22,dt);velocity.z=T.MathUtils.damp(velocity.z,vz,22,dt);position=moveVisitor(position,{x:velocity.x*dt,z:velocity.z*dt},barriers)
   if(keys.has(' ')&&height<=1.651){vertical=4;keys.delete(' ')}vertical-=12*dt;height=Math.max(1.65,height+vertical*dt);if(height===1.65)vertical=0
  }
  camera.position.set(position.x,height,position.z);camera.rotation.set(pitch,yaw,0)
  if(now-lastPublish>100){near=null;let distance=8
   for(const e of museum.exhibits){const d=Math.hypot(position.x-e.x,position.z-e.z);const facing=(-Math.sin(yaw)*(e.x-position.x)-Math.cos(yaw)*(e.z-position.z))/Math.max(.001,d);if(d<distance&&facing>.05&&visible(e)){near=e.id;distance=d}}
   if(Math.hypot(position.x,position.z-16)<2.5&&Math.cos(yaw)<-.2)near='exit'
   publish({x:position.x,z:position.z,heading:((-yaw*180/Math.PI)%360+360)%360,near,guiding:path.length>0});lastPublish=now
  }
  if(!document.hidden)renderer.render(scene,camera);frame=requestAnimationFrame(tick)
 }
 frame=requestAnimationFrame(tick);canvas.focus()
 return {input:(key:string,on:boolean)=>{path=[];if(on){keys.add(key);canvas.focus()}else keys.delete(key)},setBlocked:(value:boolean)=>{blocked=value;clear();if(value&&document.pointerLockElement===canvas)document.exitPointerLock();if(!value)canvas.focus()},guide:(id:string)=>{const e=museum.exhibits.find(e=>e.id===id);if(!e)return;guideTarget=e;path=galleryPath(position,{x:e.x,z:e.z+(e.kind==='elephant'?7:e.kind==='fossil'?7:6)},barriers);canvas.focus()},dispose:()=>{alive=false;cancelAnimationFrame(frame);observer.disconnect();if(document.pointerLockElement===canvas)document.exitPointerLock();window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',clear);window.removeEventListener('focusin',focus);document.removeEventListener('visibilitychange',clear);canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',clear);canvas.removeEventListener('dblclick',lock);const geometries=new Set<T.BufferGeometry>(),mats=new Set<T.Material>();scene.traverse(o=>{if(o instanceof T.Mesh){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])mats.add(m)}});geometries.forEach(g=>g.dispose());mats.forEach(m=>{const t=(m as T.MeshBasicMaterial).map;t?.dispose();m.dispose()});sun.shadow.map?.dispose();renderer.dispose();canvas.remove()}}
}
