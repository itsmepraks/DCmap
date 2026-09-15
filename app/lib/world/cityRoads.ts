import { MAP_STYLE } from './mapStyle'
import * as THREE from 'three'
import { drapeGeometry, flatGround, type GroundHeight } from './terrain'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
export function buildCityRoads(scene: THREE.Scene, roads: {name: string; kind?: string; p: number[][]}[], detailedCells?: { value: THREE.Vector4[] }, detailedCount?: { value: number }, heightAt: GroundHeight = flatGround) {
  const group=new THREE.Group(); group.name='DDOT street network'
  const asphalt=new THREE.MeshStandardMaterial({color:MAP_STYLE.road,roughness:1})
  const paving=new THREE.MeshStandardMaterial({color:MAP_STYLE.sidewalk,roughness:1})
  if (detailedCells && detailedCount) for (const material of [asphalt, paving]) {
    material.onBeforeCompile = shader => {
      shader.uniforms.detailedCells = detailedCells; shader.uniforms.detailedCount = detailedCount
      shader.vertexShader = 'varying vec2 streetPosition;\n' + shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nstreetPosition = position.xz;')
      shader.fragmentShader = 'varying vec2 streetPosition; uniform vec4 detailedCells[9]; uniform int detailedCount;\n' + shader.fragmentShader.replace('#include <alphatest_fragment>', '#include <alphatest_fragment>\nfor (int i=0; i<9; i++) { if (i>=detailedCount) break; vec4 b=detailedCells[i]; if(streetPosition.x>=b.x && streetPosition.y>=b.y && streetPosition.x<b.z && streetPosition.y<b.w) discard; }')
    }
    material.customProgramCacheKey = () => 'dc-street-fallback-mask-v1'
  }
  const roadGeometry: THREE.BufferGeometry[]=[], sidewalkGeometry: THREE.BufferGeometry[]=[]
  const segment=(list:THREE.BufferGeometry[],ax:number,az:number,bx:number,bz:number,width:number,y:number)=>{
    const dx=bx-ax,dz=bz-az,length=Math.hypot(dx,dz); if(length<0.1)return
    const geometry=new THREE.PlaneGeometry(length+0.15,width)
    geometry.rotateX(-Math.PI/2);geometry.rotateY(-Math.atan2(dz,dx));geometry.translate((ax+bx)/2,y,(az+bz)/2);list.push(geometry)
  }
  for(const road of roads) for(let i=0;i<road.p.length-1;i++) {
    const [ax,az]=road.p[i],[bx,bz]=road.p[i+1]
    const x=(ax+bx)/2,z=(az+bz)/2
    // Existing memorial plazas retain their hand-authored surfaces.
    if(x>-150&&x<1450&&Math.abs(z)<180)continue
    const width=road.kind==='6'||road.kind==='7'?3:road.kind==='4'?5:/avenue/i.test(road.name)?18:12
    segment(sidewalkGeometry,ax,az,bx,bz,width+5,0.10)
    segment(roadGeometry,ax,az,bx,bz,width,0.12)
  }
  for(const [list,material] of [[sidewalkGeometry,paving],[roadGeometry,asphalt]] as const) {
    if(!list.length)continue
    const mesh=new THREE.Mesh(drapeGeometry(mergeGeometries(list),heightAt,60),material);list.forEach(g=>g.dispose());mesh.receiveShadow=true;group.add(mesh)
  }
  scene.add(group)
  return ()=>{scene.remove(group);group.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose()});asphalt.dispose();paving.dispose()}
}
