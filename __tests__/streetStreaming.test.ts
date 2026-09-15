import * as THREE from 'three'
import { buildStreetSurfaces } from '../app/lib/world/streetSurfaces'
jest.mock('three/examples/jsm/utils/BufferGeometryUtils.js',()=>({mergeGeometries:jest.fn()}))
it('keeps at most nine street cells, replaces old areas and releases the scene', async () => {
  const original = global.fetch
  const tiles: Record<string, unknown[]> = {}
  for(let x=-1;x<=5;x++) for(let z=-1;z<=1;z++) tiles[`${x}_${z}`]=[{key:`${x}_${z}_road`,kind:'road',offset:0,count:3}]
  global.fetch=jest.fn(async url => ({ok:true,json:async()=>({tiles}),arrayBuffer:async()=>new Float32Array([0,.12,0,0,0,0,.12,1,0,1,1,.12,0,1,0]).buffer}) as Response)
  try {
    const scene=new THREE.Scene(), streets=await buildStreetSurfaces(scene,new AbortController().signal,[])
    for(let i=0;i<15;i++){streets.update(0,0);await new Promise(r=>setTimeout(r,0))}
    expect(streets.loading()).toBe(0)
    expect(scene.children.filter(o=>o.name.startsWith('DC GIS streets'))).toHaveLength(9)
    streets.update(4500,0)
    expect(scene.children.filter(o=>o.name.startsWith('DC GIS streets'))).toHaveLength(0)
    for(let i=0;i<15;i++){streets.update(4500,0);await new Promise(r=>setTimeout(r,0))}
    expect(scene.children.filter(o=>o.name.startsWith('DC GIS streets'))).toHaveLength(9)
    streets.dispose()
    expect(scene.children).toHaveLength(0)
  } finally {global.fetch=original}
})
