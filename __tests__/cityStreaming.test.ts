import * as THREE from 'three'
import type RAPIER from '@dimforge/rapier3d-compat'
import { createCityStreaming } from '../app/lib/world/cityStreaming'
jest.mock('three/examples/jsm/utils/BufferGeometryUtils.js',()=>({mergeGeometries:jest.fn()}))
jest.mock('../app/lib/world/districtTrees',()=>({createDistrictTrees:()=>({update:jest.fn(),dispose:jest.fn()})}))
jest.mock('../app/lib/world/districtOverview',()=>({buildDistrictOverview:()=>({setDetailed:jest.fn(),dispose:jest.fn()})}))
jest.mock('../app/lib/world/districtLand',()=>({buildDistrictLand:()=>jest.fn()}))
jest.mock('../app/lib/world/cityRoads',()=>({buildCityRoads:()=>jest.fn()}))
jest.mock('../app/lib/world/buildingFacades',()=>({
  masonryTexture:()=>({dispose:jest.fn()}),
  createFacadeKit:()=>({build:()=>new (require('three').Group)(),dispose:jest.fn()})
}))
it('reads each response once, loads tiles, evicts old neighborhoods and disposes',async()=>{
  const original=global.fetch
  const response=(value:unknown)=>{
    let read=false
    return {ok:true,json:async()=>{if(read)throw new Error('body already read');read=true;return value}} as Response
  }
  global.fetch=jest.fn(async (url)=>response(String(url).includes('/streets/manifest')?{tiles:{}}:String(url).includes('manifest')?{tiles:['0_0','13_0']}:String(url).includes('roads')?{roads:[]}:String(url).includes('land.json')?{polygons:{water:[]}}:String(url).includes('skyline')?{}:String(url).includes('trees')?{tiles:{}}:[]))
  try {
    const scene=new THREE.Scene()
    const city=await createCityStreaming(scene,{} as RAPIER.World,{} as typeof RAPIER,new AbortController().signal)
    city.update(80,34)
    await new Promise(resolve=>setTimeout(resolve,0))
    city.update(80,34)
    expect(city.status()).toEqual({loaded:1,loading:0,failed:false})
    expect(city.canWalk(80,34)).toBe(true)
    city.update(3330,0)
    expect(city.status().loaded).toBe(0)
    await new Promise(resolve=>setTimeout(resolve,0))
    city.update(3330,0)
    expect(city.status()).toEqual({loaded:1,loading:0,failed:false})
    city.dispose()
    expect(scene.children).toHaveLength(0)
  } finally {global.fetch=original}
})
