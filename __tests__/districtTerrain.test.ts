import fs from 'fs'
import * as THREE from 'three'
import RAPIER from '@dimforge/rapier3d-compat'
import { buildDistrictTerrain, createTerrainField, drapeGeometry, type TerrainData } from '../app/lib/world/terrain'
import { DISTRICT_PLACES } from '../app/lib/world/districtPlaces'
import { buildingCharacter } from '../app/lib/world/architecture'

const data:TerrainData=JSON.parse(fs.readFileSync('public/world/terrain.json','utf8'))
it('uses a finite District terrain and keeps landmark arrivals playable',()=>{
  const field=createTerrainField(data)
  expect(data.heights).toHaveLength(data.size**2)
  expect(data.heights.every(Number.isFinite)).toBe(true)
  expect(field.heightAt(80,34)).toBe(0)
  expect(field.heightAt(3200,25)).toBe(0)
  const heights=DISTRICT_PLACES.map(p=>field.heightAt(p.arrival.x,p.arrival.z))
  expect(Math.max(...heights)).toBeGreaterThan(100)
  expect(new Set(heights).size).toBeGreaterThan(15)
})
it('lands on the rendered hillside surface at destinations throughout DC',async()=>{
  await RAPIER.init()
  const physics=new RAPIER.World({x:0,y:-20,z:0}),scene=new THREE.Scene()
  const terrain=buildDistrictTerrain(scene,physics,RAPIER,data)
  physics.step()
  for(const place of DISTRICT_PLACES){
    const {x,z}=place.arrival
    const hit=physics.castRay(new RAPIER.Ray({x,y:2000,z},{x:0,y:-1,z:0}),2010,true)
    expect(hit).not.toBeNull()
    expect(2000-hit!.timeOfImpact).toBeCloseTo(terrain.heightAt(x,z),2)
  }
  terrain.dispose();expect(scene.children).toHaveLength(0);physics.free()
})
it('drapes long street triangles while retaining crossing UVs and upward normals',()=>{
  const source=new THREE.BufferGeometry()
  source.setAttribute('position',new THREE.Float32BufferAttribute([0,.2,0,0,.2,500,500,.2,0],3))
  source.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,0,500,500,0],2))
  const geometry=drapeGeometry(source,(x,z)=>x*.1+z*.05,60)
  const p=geometry.getAttribute('position'),uv=geometry.getAttribute('uv'),normal=geometry.getAttribute('normal')
  expect(p.count).toBeGreaterThan(3)
  for(let i=0;i<p.count;i++){
    expect(p.getY(i)).toBeCloseTo(.2+p.getX(i)*.1+p.getZ(i)*.05,4)
    expect(uv.getX(i)).toBeCloseTo(p.getX(i),4)
    expect(uv.getY(i)).toBeCloseTo(p.getZ(i),4)
    expect(normal.getY(i)).toBeGreaterThan(.9)
  }
  geometry.dispose()
})
it('preserves measured maximum heights without decorative random variation',()=>{
  const p=[[0,0],[6,0],[6,18],[0,18],[0,0]]
  expect(buildingCharacter(p,10.731,true).height).toBe(10.731)
  const report=JSON.parse(fs.readFileSync('public/world/elevation-source.json','utf8'))
  let count=0
  for(const name of fs.readdirSync('public/world/tiles')){
    const buildings=JSON.parse(fs.readFileSync(`public/world/tiles/${name}`,'utf8')) as {s?:number}[]
    for(const b of buildings)if(b.s!==undefined){expect(b.s).toBeGreaterThanOrEqual(1);expect(b.s).toBeLessThanOrEqual(200);count++}
  }
  expect(count).toBe(report.matched)
  expect(count).toBeGreaterThan(130000)
})

it('keeps street interiors above terrain when a face crosses grid diagonals',()=>{
  const field=createTerrainField(data),source=new THREE.BufferGeometry()
  source.setAttribute('position',new THREE.Float32BufferAttribute([-1600,.15,-1600,-1600,.15,-2200,-1000,.15,-1600],3))
  source.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,0,600,600,0],2))
  const geometry=drapeGeometry(source,field.heightAt),p=geometry.getAttribute('position')
  for(let i=0;i<p.count;i+=3){
    const x=(p.getX(i)+p.getX(i+1)+p.getX(i+2))/3,z=(p.getZ(i)+p.getZ(i+1)+p.getZ(i+2))/3
    const y=(p.getY(i)+p.getY(i+1)+p.getY(i+2))/3
    expect(Math.abs(y-field.heightAt(x,z)-.15)).toBeLessThan(.001)
  }
  geometry.dispose()
})
