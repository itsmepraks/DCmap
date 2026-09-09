import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { createDistrictTrees } from './districtTrees'
import { createDistrictNavigation, createStreetArrivals } from './districtNavigation'
import { buildDistrictOverview } from './districtOverview'
import { buildDistrictLand, type DistrictLand } from './districtLand'
import { buildStreetSurfaces } from './streetSurfaces'
import { createFacadeKit, masonryTexture } from './buildingFacades'
import type RAPIER from '@dimforge/rapier3d-compat'

import type { WorldSeason } from './atmosphere'
import { placeInsideFootprint } from './places'
import { buildingCharacter, WALL_PALETTE } from './architecture'
import { flatGround, type GroundHeight } from './terrain'
import { cityTileKey, nearbyCityTiles } from './cityTiles'
type Footprint = { id: number; p: number[][]; h: number; s?: number }
export type WorldBuilding = {id:number;p:number[][];height:number;base:number;measured:boolean}
type Loaded = { group: THREE.Group; colliders: RAPIER.Collider[]; buildings:Footprint[] }

/** At most 25 neighborhood tiles, four requests, and one geometry upload per frame. */
export async function createCityStreaming(scene: THREE.Scene, physics: RAPIER.World, rapier: typeof RAPIER, signal: AbortSignal, heightAt: GroundHeight = flatGround) {
  const [response,roadResponse,skyResponse,landResponse,treeResponse] = await Promise.all([fetch('/world/manifest.json', { signal }),fetch('/world/roads.json', { signal }),fetch('/world/skyline.json', { signal }),fetch('/world/land.json', { signal }),fetch('/world/trees.json', { signal })])
  if (!treeResponse.ok) throw new Error('DC street trees unavailable')
  const treeData:{tiles:Record<string,number[][]>}=await treeResponse.json()
  if (!skyResponse.ok || !landResponse.ok) throw new Error('District coverage unavailable')
  const [skyData,landData]: [Record<string,number[][]>,DistrictLand]=await Promise.all([skyResponse.json(),landResponse.json()])
  if (!roadResponse.ok) throw new Error('DC streets unavailable')
  const roadData: { roads: {name: string; p: number[][]}[] } = await roadResponse.json()
  if (!response.ok) throw new Error('City manifest unavailable')
  const manifest: { tiles: string[] } = await response.json()
  const trees=createDistrictTrees(scene,physics,rapier,treeData.tiles,heightAt)
  const onLand=createDistrictNavigation(landData.polygons.water??[],roadData.roads)
  const streetArrival=createStreetArrivals(roadData.roads)
  const overview=buildDistrictOverview(scene,skyData,heightAt)
  const disposeLand=buildDistrictLand(scene,landData,heightAt)
  const streets=await buildStreetSurfaces(scene,signal,roadData.roads,heightAt)
  const available = new Set(manifest.tiles), loaded = new Map<string, Loaded>()
  const pending = new Map<string, AbortController>(), ready = new Map<string, Footprint[]>()
  const failed = new Map<string, number>()
  const byCollider=new Map<number,Footprint>()
  let highlight:THREE.LineSegments|null=null
  const clearHighlight=()=>{if(highlight){scene.remove(highlight);highlight.geometry.dispose();(highlight.material as THREE.Material).dispose();highlight=null}}
  const describe=(building:Footprint):WorldBuilding=>{const c=buildingCharacter(building.p,building.s??building.h,building.s!==undefined);return {id:building.id,p:building.p,height:c.height,base:heightAt(c.x,c.z),measured:building.s!==undefined}}
  const textures = [masonryTexture(true), masonryTexture(false)]
  const materials = WALL_PALETTE.map((color, i) => new THREE.MeshStandardMaterial({ color, map: textures[i<7?0:1], roughness: 0.9, vertexColors: true }))
  const facades = createFacadeKit(roadData.roads,heightAt)
  let wanted = new Set<string>(), alive = true
  const remove = (key: string) => {
    const tile = loaded.get(key); if (!tile) return
    scene.remove(tile.group)
    tile.group.traverse(object => { if (object instanceof THREE.InstancedMesh) object.dispose(); else if (object instanceof THREE.Mesh) object.geometry.dispose() })
    for (const collider of tile.colliders) {byCollider.delete(collider.handle);physics.removeCollider(collider, true)}
    loaded.delete(key); overview.setDetailed(key,false)
  }
  const build = (key: string, buildings: Footprint[]) => {
    const group = new THREE.Group(); group.name = `DC GIS block ${key}`
    const geometries: THREE.BufferGeometry[][] = materials.map(() => [])
    const colliders: RAPIER.Collider[] = []
    for (const building of buildings) {
      if (building.p.length < 4) continue
      const character = buildingCharacter(building.p, building.s ?? building.h, building.s !== undefined)
      const base=heightAt(character.x,character.z)
      const foundation=Math.min(base,...building.p.map(([x,z])=>heightAt(x,z)))-.15
      const shape = new THREE.Shape(building.p.map(([x, z]) => new THREE.Vector2(x, -z)))
      const geometry = new THREE.ExtrudeGeometry(shape, { depth: character.height+base-foundation, bevelEnabled: false, steps: 1, curveSegments: 1 })
      geometry.rotateX(-Math.PI / 2)
      geometry.translate(0,foundation,0)
      const pos = geometry.attributes.position, normal = geometry.attributes.normal, uv = geometry.attributes.uv
      const colors=new Float32Array(pos.count*3)
      for (let i=0;i<pos.count;i++) {
        const roof=normal.getY(i)>.5
        uv.setXY(i, (Math.abs(normal.getX(i)) > 0.5 ? pos.getZ(i) : pos.getX(i))/4, (roof?pos.getZ(i):pos.getY(i))/4)
        const tone=roof?.78:1;colors.set([tone,tone,tone],i*3)
      }
      geometry.setAttribute('color',new THREE.BufferAttribute(colors,3))
      geometries[character.wall].push(geometry)
      const vertices = geometry.attributes.position.array as Float32Array
      const indices = new Uint32Array(vertices.length / 3)
      for (let i = 0; i < indices.length; i++) indices[i] = i
      const collider=physics.createCollider(rapier.ColliderDesc.trimesh(vertices, indices))
      colliders.push(collider);byCollider.set(collider.handle,building)
    }
    geometries.forEach((list, index) => {
      if (!list.length) return
      const mesh = new THREE.Mesh(mergeGeometries(list), materials[index]); list.forEach(g => g.dispose())
      mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh)
    })
    group.add(facades.build(buildings))
    scene.add(group); loaded.set(key, { group, colliders, buildings }); overview.setDetailed(key,true)
  }
  const update = (x: number, z: number) => {
    trees.update(x,z)
    streets.update(x,z)
    wanted = new Set(nearbyCityTiles(x, z).filter(key => available.has(key)))
    for (const key of loaded.keys()) if (!wanted.has(key)) remove(key)
    for (const [key, controller] of pending) if (!wanted.has(key)) { controller.abort(); pending.delete(key) }
    for (const key of ready.keys()) if (!wanted.has(key)) ready.delete(key)
    for (const [key,tile] of loaded) {
      const [tx,tz]=key.split('_').map(Number)
      const detail=tile.group.getObjectByName('Nearby facade detail')
      if(detail) detail.visible=Math.hypot((tx+0.5)*256-x,(tz+0.5)*256-z)<450
    }
    const next = [...wanted].find(key => ready.has(key))
    if (next) { build(next, ready.get(next)!); ready.delete(next) }
    for (const key of wanted) {
      if (pending.size >= 4) break
      if (loaded.has(key) || pending.has(key) || ready.has(key) || (failed.get(key) ?? 0) > performance.now()) continue
      const controller = new AbortController(); pending.set(key, controller)
      fetch(`/world/tiles/${key}.json`, { signal: controller.signal }).then(async response => {
        if (!response.ok) throw new Error('Neighborhood unavailable')
        const data: Footprint[] = await response.json()
        if (alive && !controller.signal.aborted && wanted.has(key)) ready.set(key, data)
      }).catch(error => { if (!controller.signal.aborted) { console.warn('City tile failed', key, error); failed.set(key, performance.now() + 10000) } })
        .finally(() => { if (pending.get(key) === controller) pending.delete(key) })
    }
  }
  return {
    water:landData.polygons.water??[],
    update,
    setSeason:(season:WorldSeason)=>trees.setSeason(season),
    setNight:(amount:number)=>facades.setNight(amount),
    streetArrival,
    buildingForCollider:(handle:number)=>{const b=byCollider.get(handle);return b?describe(b):null},
    buildingAt:(x:number,z:number)=>{
      for(const tile of loaded.values())for(const b of tile.buildings)if(placeInsideFootprint({x,z},b.p))return describe(b)
      return null
    },
    highlight:(building:WorldBuilding|null)=>{
      clearHighlight();if(!building)return
      const geometry=new THREE.ExtrudeGeometry(new THREE.Shape(building.p.map(([x,z])=>new THREE.Vector2(x,-z))),{depth:building.height,bevelEnabled:false,steps:1,curveSegments:1})
      geometry.rotateX(-Math.PI/2);geometry.translate(0,building.base+.08,0)
      highlight=new THREE.LineSegments(new THREE.EdgesGeometry(geometry),new THREE.LineBasicMaterial({color:'#f4b04c'}));geometry.dispose();scene.add(highlight)
    },
    canWalk: (x: number, z: number) => onLand(x,z) && (!available.has(cityTileKey(x, z)) || loaded.has(cityTileKey(x, z))),
    status: () => ({ loaded: loaded.size, loading: [...wanted].filter(key => !loaded.has(key)).length + streets.loading(), failed: [...wanted].some(key => (failed.get(key) ?? 0) > performance.now()) }),
    dispose: () => { clearHighlight(); byCollider.clear(); alive = false; pending.forEach(c => c.abort()); pending.clear(); ready.clear(); [...loaded.keys()].forEach(remove); materials.forEach(m => m.dispose()); textures.forEach(t=>t.dispose()); facades.dispose(); streets.dispose(); disposeLand(); overview.dispose(); trees.dispose() },
  }
}
