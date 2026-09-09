import * as THREE from 'three'
import { flatGround, type GroundHeight } from './terrain'
import { buildingCharacter, WALL_PALETTE } from './architecture'
type Skyline = Record<string, number[][]>
/** Always-resident silhouettes, batched into 2km cells; details replace them locally. */
export function buildDistrictOverview(scene: THREE.Scene, data: Skyline, heightAt: GroundHeight = flatGround) {
  const geometry=new THREE.BoxGeometry(1,1,1)
  const material=new THREE.MeshStandardMaterial({color:'#ffffff',roughness:1})
  const cells=new Map<string,{key:string;buildings:number[][]}[]>()
  for(const [key,buildings] of Object.entries(data)) {
    const [x,z]=key.split('_').map(Number),cell=`${Math.floor(x/8)}_${Math.floor(z/8)}`
    const list=cells.get(cell)??[];list.push({key,buildings});cells.set(cell,list)
  }
  const meshes:THREE.InstancedMesh[]=[]
  const tiles=new Map<string,{mesh:THREE.InstancedMesh;start:number;matrices:THREE.Matrix4[]}>()
  const transform=new THREE.Object3D(),hidden=new THREE.Matrix4().makeScale(0,0,0)
  for(const cell of cells.values()) {
    const mesh=new THREE.InstancedMesh(geometry,material,cell.reduce((sum,t)=>sum+t.buildings.length,0));let index=0
    for(const {key,buildings} of cell) {
      const start=index,matrices:THREE.Matrix4[]=[]
      for(const [x,z,w,d,h,measured] of buildings) {
        const character=buildingCharacter([[x-w/2,z-d/2],[x+w/2,z-d/2],[x+w/2,z+d/2],[x-w/2,z+d/2]],h,Boolean(measured))
        transform.position.set(x,heightAt(x,z)+character.height/2,z);transform.scale.set(Math.max(w,1),character.height,Math.max(d,1));transform.updateMatrix()
        mesh.setColorAt(index,new THREE.Color(WALL_PALETTE[character.wall]))
        const matrix=transform.matrix.clone();matrices.push(matrix);mesh.setMatrixAt(index++,matrix)
      }
      tiles.set(key,{mesh,start,matrices})
    }
    mesh.computeBoundingSphere();scene.add(mesh);meshes.push(mesh)
  }
  return {
    setDetailed:(key:string,detailed:boolean)=>{const tile=tiles.get(key);if(!tile)return;tile.matrices.forEach((m,i)=>tile.mesh.setMatrixAt(tile.start+i,detailed?hidden:m));tile.mesh.instanceMatrix.needsUpdate=true},
    dispose:()=>{meshes.forEach(mesh=>{scene.remove(mesh);mesh.dispose()});geometry.dispose();material.dispose()},
  }
}
