import * as THREE from 'three'
import { createFacadeKit } from '../app/lib/world/buildingFacades'
it('puts entrances on the street side and batches a row of houses into six or fewer meshes', () => {
  const kit=createFacadeKit([{name:'DC street',p:[[-50,-8],[100,-8]]}])
  const buildings=Array.from({length:10},(_,i)=>({p:[[i*8,0],[i*8+6,0],[i*8+6,18],[i*8,18],[i*8,0]],h:9}))
  const group=kit.build(buildings)
  expect(group.children.length).toBeLessThanOrEqual(6)
  const doors=group.children.find(m=>(m as THREE.InstancedMesh).instanceColor) as THREE.InstancedMesh
  expect(doors.count).toBe(10)
  const matrix=new THREE.Matrix4()
  for(let i=0;i<doors.count;i++){
    doors.getMatrixAt(i,matrix)
    expect(matrix.elements.every(Number.isFinite)).toBe(true)
    expect(matrix.elements[14]).toBeLessThan(0)
  }
  group.children.forEach(m=>(m as THREE.InstancedMesh).dispose());kit.dispose()
})
