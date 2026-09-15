import { MAP_STYLE } from './mapStyle'
import * as THREE from 'three'
import { drapeGeometry, flatGround, type GroundHeight } from './terrain'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
export type DistrictLand = {polygons:Record<string,number[][][][]>}
export function buildDistrictLand(scene: THREE.Scene, data: DistrictLand, heightAt: GroundHeight = flatGround) {
  const group=new THREE.Group();group.name='DC waterways and parks'
  const materials:THREE.Material[]=[]
  for(const [kind,features] of Object.entries(data.polygons)) {
    const water=kind==='water'
    const material=new THREE.MeshStandardMaterial({color:water?MAP_STYLE.water:kind==='parks'?MAP_STYLE.park:MAP_STYLE.forest,roughness:water?0.42:1,metalness:water?0.03:0,side:THREE.DoubleSide})
    material.userData.seasonalLand=water?'water':'grass';material.userData.originalColor=material.color.getHex()
    materials.push(material)
    const geometries:THREE.BufferGeometry[]=[]
    for(const rings of features) {
      if(water) {const points=rings.flat();if(points.length&&points.every(([x,z])=>x>100&&x<820&&z>-40&&z<40))continue}
      // ArcGIS exterior rings clockwise; interiors counterclockwise. Preserve islands.
      const shapes:THREE.Shape[]=[]
      for(const ring of rings) {
        if(ring.length<4)continue
        const points=ring.map(([x,z])=>new THREE.Vector2(x,-z))
        if(THREE.ShapeUtils.isClockWise(points)||!shapes.length) shapes.push(new THREE.Shape(points))
        else shapes[shapes.length-1].holes.push(new THREE.Path(points))
      }
      for(const shape of shapes) {
        const geometry=new THREE.ShapeGeometry(shape);geometry.rotateX(-Math.PI/2);geometry.translate(0,water?0.07:0.01,0);geometries.push(geometry)
      }
    }
    if(geometries.length) {
      const mesh=new THREE.Mesh(drapeGeometry(mergeGeometries(geometries),heightAt,100),material);geometries.forEach(g=>g.dispose());mesh.receiveShadow=true;group.add(mesh)
    }
  }
  scene.add(group)
  return ()=>{scene.remove(group);group.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose()});materials.forEach(m=>m.dispose())}
}
