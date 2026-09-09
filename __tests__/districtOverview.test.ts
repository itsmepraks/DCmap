import * as THREE from 'three'
import { buildDistrictOverview } from '../app/lib/world/districtOverview'
import { DISTRICT_PLACES } from '../app/lib/world/districtPlaces'
import { nearbyCityTiles } from '../app/lib/world/cityTiles'
import fs from 'fs'
it('keeps distant city blocks while replacing only the loaded tile, then restores them',()=>{
 const scene=new THREE.Scene(),overview=buildDistrictOverview(scene,{'0_0':[[10,10,5,5,9]],'1_0':[[270,10,5,5,9]],'12_0':[[3080,10,5,5,9]]})
 expect(scene.children).toHaveLength(2)
 const near=scene.children[0] as THREE.InstancedMesh, matrix=new THREE.Matrix4()
 overview.setDetailed('0_0',true);near.getMatrixAt(0,matrix);expect(matrix.elements[0]).toBe(0)
 near.getMatrixAt(1,matrix);expect(matrix.elements[0]).toBe(5)
 overview.setDetailed('0_0',false);near.getMatrixAt(0,matrix);expect(matrix.elements[0]).toBe(5)
 overview.dispose();expect(scene.children).toHaveLength(0)
})
it('includes real building coverage around every District destination and every skyline entry',()=>{
 const manifest=JSON.parse(fs.readFileSync('public/world/manifest.json','utf8'))
 const skyline=JSON.parse(fs.readFileSync('public/world/skyline.json','utf8')) as Record<string,number[][]>
 expect(Object.values(skyline).reduce((sum,buildings)=>sum+buildings.length,0)).toBe(manifest.buildings)
 expect(manifest.buildings).toBeGreaterThan(150000)
 const keys=new Set(manifest.tiles)
 for(const place of DISTRICT_PLACES)expect(nearbyCityTiles(place.arrival.x,place.arrival.z).some(key=>keys.has(key))).toBe(true)
})
