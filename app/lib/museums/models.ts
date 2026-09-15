import * as T from 'three'
import type { ExhibitKind } from './catalog'
export function exhibitModel(kind:ExhibitKind):T.Group{
 const g=new T.Group()
 const mats=new Map<string,T.MeshStandardMaterial>()
 const mat=(c:string,metal=0)=>{if(!mats.has(c))mats.set(c,new T.MeshStandardMaterial({color:c,roughness:.65,metalness:metal}));return mats.get(c)!}
 const mesh=(geo:T.BufferGeometry,c:string,x:number,y:number,z:number,sx=1,sy=1,sz=1)=>{const m=new T.Mesh(geo,mat(c));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=m.receiveShadow=true;g.add(m);return m}
 const box=(c:string,x:number,y:number,z:number,w:number,h:number,d:number)=>mesh(new T.BoxGeometry(w,h,d),c,x,y,z)
 const ell=(c:string,x:number,y:number,z:number,rx:number,ry:number,rz:number)=>mesh(new T.SphereGeometry(1,24,16),c,x,y,z,rx,ry,rz)
 const rod=(c:string,a:number[],b:number[],r:number)=>{const from=new T.Vector3(...a),to=new T.Vector3(...b);const m=mesh(new T.CylinderGeometry(r,r,from.distanceTo(to),10),c,0,0,0);m.position.copy(from.add(to).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(...b).sub(new T.Vector3(...a)).normalize());return m}
 if(kind==='elephant'){
  ell('#777d79',0,2.9,0,1.8,1.7,2.55);ell('#858a82',0,3.7,2,1.22,1.3,1.1)
  for(const x of [-1.1,1.1])for(const z of [-1.4,1.2]){mesh(new T.CylinderGeometry(.48,.38,2.4,18),'#737b77',x,1.3,z);ell('#8b9189',x,.22,z,.49,.24,.55)}
  for(const x of [-1,1]){ell('#858a82',x*1.35,3.6,1.4,.85,1.35,.22);ell('#171f1d',x*.67,4,2.85,.08,.08,.08);const tusk=new T.CatmullRomCurve3([new T.Vector3(x*.7,3,2.6),new T.Vector3(x*.9,2.65,3.4),new T.Vector3(x*1.05,3,3.9)]);mesh(new T.TubeGeometry(tusk,18,.10,8,false),'#e5dfc9',0,0,0)}
  const trunk=new T.CatmullRomCurve3([new T.Vector3(0,3.8,2.8),new T.Vector3(0,2.5,3.2),new T.Vector3(0,1,3.45),new T.Vector3(.45,.7,3.65)]);mesh(new T.TubeGeometry(trunk,28,.27,12,false),'#7b827b',0,0,0);rod('#626b65',[0,3,-2.2],[.3,1.4,-2.8],.08)
 }else if(kind==='diamond'){
  box('#253940',0,1.2,0,2.8,2.4,2.8);const gem=mesh(new T.OctahedronGeometry(.7,0),'#4288d4',0,3,0,1,.75,1);(gem.material as T.MeshStandardMaterial).metalness=.7;(gem.material as T.MeshStandardMaterial).roughness=.12
  const necklace=mesh(new T.TorusGeometry(.94,.055,8,48),'#e7e1c7',0,3.25,0);necklace.rotation.x=.15
  for(let i=0;i<16;i++){const a=i/16*Math.PI*2;ell('#d8e4e5',Math.sin(a)*.92,3.25+Math.cos(a)*.92,0,.095,.095,.06)}
 }else if(kind==='fossil'){
  const bone='#d9c9a4';for(let i=0;i<15;i++){const z=-3+i*.43;ell(bone,0,2.5+Math.sin(i*.18)*.7,z,.19,.19,.2);if(i>3&&i<11)for(const side of [-1,1]){rod(bone,[0,3.1,z],[side*.8,2.5,z+.1],.075);rod(bone,[side*.8,2.5,z+.1],[side*.45,1.95,z+.15],.055)}}
  for(const side of [-1,1]){rod(bone,[side*.55,2.8,-.5],[side*1.1,1.5,.2],.18);rod(bone,[side*1.1,1.5,.2],[side*.85,.3,-.5],.12);for(let i=0;i<3;i++)rod(bone,[side*.85,.2,-.5],[side*.85+(i-1)*.25,.15,.6],.07);rod(bone,[side*.5,3.1,1.2],[side*.9,2.7,1.8],.08)}
  ell(bone,0,3.4,3,.63,.65,.95);box('#665d4a',0,3.3,3.73,.85,.25,.1);for(const side of [-1,1])ell('#423e35',side*.54,3.6,3.2,.04,.22,.24)
  rod(bone,[0,2.5,-3],[0,1.6,-5],.12);rod('#544f45',[0,.1,0],[0,2.3,0],.06)
 }else if(kind==='flyer'){
  for(const y of [1.7,3]){box('#e1d5b3',0,y,0,10,.13,1.65);for(let i=-5;i<=5;i++)box('#aa895b',i,y+.075,0,.035,.025,1.7)}
  for(const x of [-4,-2,0,2,4])for(const z of [-.65,.65])rod('#8d6c46',[x,1.7,z],[x,3,z],.035)
  for(const x of [-1,1]){rod('#836544',[x,.6,-1],[x,1.7,1],.05);rod('#836544',[x,.6,1.8],[x,.6,-1.4],.06);rod('#836544',[x,1.8,0],[x,1.3,3.4],.04)}
  box('#e1d5b3',0,1.3,3.4,3,.1,.75);box('#5d635a',.6,1.9,0,.8,.3,.7)
  for(const x of [-1.7,1.7]){const prop=box('#6d5237',x,2.4,-1.1,.14,2,.07);prop.rotation.z=.5}
 }else if(kind==='capsule'){
  mesh(new T.CylinderGeometry(.55,2.1,2.7,48),'#b8b5a8',0,2,0);mesh(new T.CylinderGeometry(2.13,2.13,.22,48),'#655e52',0,.58,0);box('#283b45',0,2.2,1.22,.7,.5,.15);box('#ded7bd',-.85,1.65,1.5,.65,.9,.15)
  for(let i=0;i<18;i++){const a=i/18*Math.PI*2;rod('#8d8b81',[Math.sin(a)*2,.7,Math.cos(a)*2],[Math.sin(a)*.57,3.3,Math.cos(a)*.57],.018)}
 }else if(kind==='suit'){
  const c='#e7e2cc';box(c,0,2,0,1.2,1.4,.75);ell(c,0,3.15,0,.65,.65,.62);ell('#615239',0,3.15,.47,.48,.43,.24);box('#9b9b8d',0,2,-.55,1.05,1.2,.45)
  for(const side of [-1,1]){rod(c,[side*.42,1.5,0],[side*.5,.35,.08],.25);ell('#c8cbbd',side*.5,.2,.25,.29,.22,.48);rod(c,[side*.65,2.5,0],[side*1.15,1.65,.1],.22);ell(c,side*1.15,1.55,.1,.22,.25,.22);box('#b8543a',side*.49,.7,.09,.51,.12,.51)}box('#879ea2',0,2.3,.42,.7,.45,.1)
 }else if(kind==='flag'){
  box('#332d2a',0,3.3,-.3,9.5,5.5,.45);for(let i=0;i<15;i++)box(i%2?'#d8ccb1':'#a64e3e',0,5.55-i*.31,0,8.5,.31,.05);box('#354960',-2.3,4.4,.04,3.9,2.65,.05)
  for(let row=0;row<3;row++)for(let col=0;col<5;col++){const shape=new T.Shape();for(let i=0;i<10;i++){const a=i/10*Math.PI*2,r=i%2?.055:.13;const x=Math.sin(a)*r,y=Math.cos(a)*r;if(i===0)shape.moveTo(x,y);else shape.lineTo(x,y)}shape.closePath();mesh(new T.ShapeGeometry(shape),'#e5dcc4',-3.8+col*.7,3.65+row*.73,.08)}
 }else if(kind==='train'){
  const boiler=mesh(new T.CylinderGeometry(.8,.8,4.3,24),'#35433c',0,1.8,0);boiler.rotation.x=Math.PI/2;box('#554333',0,1,0,2.5,.3,5.5)
  for(const side of [-1,1])for(const z of [-1.5,1.5]){const wheel=mesh(new T.TorusGeometry(.75,.12,8,24),'#373b34',side*1.25,.75,z);wheel.rotation.y=Math.PI/2;for(let j=0;j<8;j++){const a=j/8*Math.PI*2;rod('#867c59',[side*1.25,.75,z],[side*1.25,.75+Math.sin(a)*.7,z+Math.cos(a)*.7],.035)}}
  mesh(new T.CylinderGeometry(.45,.23,1.7,16),'#3d4036',0,3,1.5);box('#86633e',0,2.8,-2,2.2,2,.3);box('#6c5439',0,3.9,-1.7,2.6,.16,1.6)
 }else{
  box('#544a41',0,1,0,2.7,2,2);for(const side of [-1,1]){ell('#a5272b',side*.48,2.2,0,.3,.18,.7);box('#961e29',side*.48,2.12,-.45,.28,.35,.24);ell('#cd4643',side*.48,2.38,.35,.28,.12,.14)}
 }
 return g
}
