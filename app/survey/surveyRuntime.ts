import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { previousHeightRule, sampleSurveyTerrain, surveyPoint } from '../lib/world/surveyMath'
type Feature={id:number;base:number;height:number;center:number[];start:number;count:number;estimate?:number}
type Manifest={features:Feature[];vertices:number;bytes:number}
type Terrain={bounds:number[];size:number;heights:number[]}
export async function createSurveyRuntime(host:HTMLElement,signal:AbortSignal,onPick:(value:{id:number;height:number;estimate:number})=>void){
  const started=performance.now()
  const responses=await Promise.all(['manifest.json','buildings.bin','terrain.json','aerial.jpg'].map(file=>fetch(`/world/survey/${file}`,{signal})))
  if(responses.some(r=>!r.ok))throw new Error('A survey asset could not be downloaded.')
  const [manifest,buffer,terrain,blob]=await Promise.all([responses[0].json() as Promise<Manifest>,responses[1].arrayBuffer(),responses[2].json() as Promise<Terrain>,responses[3].blob()])
  const bitmap=await createImageBitmap(blob,{imageOrientation:'flipY'})
  if(signal.aborted){bitmap.close();throw new DOMException('Cancelled','AbortError')}
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'})
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor('#c8d6d6');renderer.outputColorSpace=THREE.SRGBColorSpace
  host.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','Interactive Georgetown survey. Drag to orbit, scroll to zoom, or use arrow keys to pan.');renderer.domElement.tabIndex=0
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(50,1,.3,5000),controls=new OrbitControls(camera,renderer.domElement)
  controls.enableDamping=true;controls.maxPolarAngle=Math.PI*.49;controls.minDistance=8;controls.maxDistance=1800;controls.listenToKeyEvents(renderer.domElement)
  scene.add(new THREE.HemisphereLight('#fff8ee','#777968',2.4))
  const sun=new THREE.DirectionalLight('#ffffff',2.2);sun.position.set(-700,1200,500);scene.add(sun)
  const aerial=new THREE.Texture(bitmap);aerial.colorSpace=THREE.SRGBColorSpace;aerial.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());aerial.needsUpdate=true
  const a=surveyPoint(terrain.bounds[0],terrain.bounds[3]),b=surveyPoint(terrain.bounds[2],terrain.bounds[1])
  const raw=new Float32Array(buffer),geometry=new THREE.BufferGeometry(),position=new THREE.BufferAttribute(raw.slice(),3)
  geometry.setAttribute('position',position);geometry.computeVertexNormals()
  const uv=new Float32Array(position.count*2),colors=new Float32Array(position.count*3),normals=geometry.attributes.normal
  for(let i=0;i<position.count;i++){
    uv[i*2]=(raw[i*3]-a.x)/(b.x-a.x);uv[i*2+1]=1-(raw[i*3+2]-a.z)/(b.z-a.z)
    const roof=normals.getY(i)>.6;colors.set(roof?[1,1,1]:[.78,.73,.64],i*3)
  }
  geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));geometry.setAttribute('color',new THREE.BufferAttribute(colors,3))
  const baseColors=colors.slice()
  const material=new THREE.MeshStandardMaterial({map:aerial,vertexColors:true,roughness:1,side:THREE.DoubleSide})
  material.onBeforeCompile=shader=>{
    shader.vertexShader='varying float surveyRoof;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nsurveyRoof = step(0.6,normal.y);')
    shader.fragmentShader='varying float surveyRoof;\n'+shader.fragmentShader.replace('#include <map_fragment>','if(surveyRoof>0.5){\n#include <map_fragment>\n}')
  }
  const mesh=new THREE.Mesh(geometry,material);scene.add(mesh)
  for(const f of manifest.features){
    let area=0
    for(let i=f.start;i<f.start+f.count;i+=3){
      const j=i*3,k=j+3,l=j+6
      const n=(raw[k+2]-raw[j+2])*(raw[l]-raw[j])-(raw[k]-raw[j])*(raw[l+2]-raw[j+2])
      if(n>0)area+=n/2
    }
    f.estimate=previousHeightRule(area)
  }
  const groundGeometry=new THREE.BufferGeometry(),n=terrain.size,groundPositions=new Float32Array(n*n*3),groundUV=new Float32Array(n*n*2),indices=[]
  for(let z=0;z<n;z++)for(let x=0;x<n;x++){
    const i=z*n+x;groundPositions.set([a.x+(b.x-a.x)*x/(n-1),terrain.heights[i],a.z+(b.z-a.z)*z/(n-1)],i*3);groundUV.set([x/(n-1),1-z/(n-1)],i*2)
    if(x<n-1&&z<n-1)indices.push(i,i+n,i+1,i+1,i+n,i+n+1)
  }
  groundGeometry.setAttribute('position',new THREE.BufferAttribute(groundPositions,3));groundGeometry.setAttribute('uv',new THREE.BufferAttribute(groundUV,2));groundGeometry.setIndex(indices);groundGeometry.computeVertexNormals()
  const groundMaterial=new THREE.MeshBasicMaterial({map:aerial,side:THREE.DoubleSide});scene.add(new THREE.Mesh(groundGeometry,groundMaterial))
  let frame=0,alive=true,estimated=false
  const draw=()=>{frame=0;if(!alive)return;controls.update();renderer.render(scene,camera)}
  const invalidate=()=>{if(alive&&!frame)frame=requestAnimationFrame(draw)}
  controls.addEventListener('change',invalidate)
  const resize=new ResizeObserver(()=>{const {width,height}=host.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/Math.max(1,height);camera.updateProjectionMatrix();invalidate()});resize.observe(host)
  const preset=(value:'overview'|'street'|'north')=>{
    const p=surveyPoint(-77.0637,value==='street'?38.9052:38.9065),y=sampleSurveyTerrain(p.x,p.z,terrain)
    controls.target.set(p.x,y+10,p.z)
    if(value==='street')camera.position.set(p.x+65,y+48,p.z+65)
    else if(value==='north')camera.position.set(p.x,y+180,p.z+470)
    else camera.position.set(p.x+420,y+650,p.z+660)
    controls.update();invalidate()
  }
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let down={x:0,y:0}
  const pointerDown=(e:PointerEvent)=>{down={x:e.clientX,y:e.clientY}}
  const pointerUp=(e:PointerEvent)=>{
    if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>5)return
    const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera)
    const hit=ray.intersectObject(mesh)[0];if(hit?.faceIndex==null)return
    const index=hit.faceIndex*3,f=manifest.features.find(f=>index>=f.start&&index<f.start+f.count)
    if(f){
      const attribute=geometry.attributes.color as THREE.BufferAttribute
      attribute.copyArray(baseColors)
      for(let i=f.start;i<f.start+f.count;i++)attribute.setXYZ(i,.9,.48,.22)
      attribute.needsUpdate=true;invalidate()
      onPick({id:f.id,height:f.height,estimate:f.estimate!})
    }
  }
  renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointerup',pointerUp)
  preset('overview')
  return {stats:{count:manifest.features.length,mb:(buffer.byteLength+blob.size+JSON.stringify(terrain).length+JSON.stringify(manifest).length)/1e6,ms:performance.now()-started},runtime:{
    preset,
    setEstimated:(value:boolean)=>{
      estimated=value
      for(const f of manifest.features)for(let i=f.start;i<f.start+f.count;i++)position.setY(i,f.base+(raw[i*3+1]-f.base)*(estimated?f.estimate!/f.height:1))
      position.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingSphere();invalidate()
    },
    setAerial:(value:boolean)=>{material.map=value?aerial:null;groundMaterial.map=value?aerial:null;material.needsUpdate=true;groundMaterial.needsUpdate=true;groundMaterial.color.set(value?'#ffffff':'#98a182');invalidate()},
    dispose:()=>{alive=false;cancelAnimationFrame(frame);resize.disconnect();controls.removeEventListener('change',invalidate);controls.dispose();renderer.domElement.removeEventListener('pointerdown',pointerDown);renderer.domElement.removeEventListener('pointerup',pointerUp);geometry.dispose();groundGeometry.dispose();material.dispose();groundMaterial.dispose();aerial.dispose();bitmap.close();renderer.dispose();renderer.domElement.remove()},
  }}
}
