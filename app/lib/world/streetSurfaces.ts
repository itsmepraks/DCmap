import { MAP_STYLE } from './mapStyle'
import * as THREE from 'three'
import { drapeGeometry, flatGround, type GroundHeight } from './terrain'
import { buildCityRoads } from './cityRoads'

type SurfaceKind = 'road' | 'sidewalk' | 'crosswalk' | 'island'
type Chunk = { key: string; kind: SurfaceKind; offset: number; count: number }
interface SurfaceManifest { tiles: Record<string, Chunk[]> }
/** Sourced road edges and intersections, triangulated at build time and spatially batched. */
export async function buildStreetSurfaces(scene: THREE.Scene, signal: AbortSignal, roads: {name: string; kind?: string; p: number[][]}[], heightAt: GroundHeight = flatGround) {
  const metadata = await fetch('/world/streets/manifest.json', { signal })
  if (!metadata.ok) throw new Error('DC street surfaces unavailable')
  const manifest: SurfaceManifest = await metadata.json()
  if (signal.aborted) throw new DOMException('Cancelled', 'AbortError')
  const detailedCells = { value: Array.from({length: 9}, () => new THREE.Vector4()) }, detailedCount = { value: 0 }
  const disposeFallback = buildCityRoads(scene, roads, detailedCells, detailedCount, heightAt)
  const materials = {
    road: new THREE.MeshStandardMaterial({ color: MAP_STYLE.road, roughness: 1 }),
    sidewalk: new THREE.MeshStandardMaterial({ color: MAP_STYLE.sidewalk, roughness: 1 }),
    crosswalk: new THREE.MeshStandardMaterial({ color: MAP_STYLE.crosswalk, roughness: 1 }),
    island: new THREE.MeshStandardMaterial({ color: MAP_STYLE.island, roughness: 1 }),
  }
  const texture = (joints: boolean) => {
    const data = new Uint8Array(64*64*4)
    for(let y=0;y<64;y++) for(let x=0;x<64;x++) {
      const i=(y*64+x)*4, grain=((x*173+y*337+x*y*13)%17)-8
      const shade=joints && (x===0 || y===0) ? 184 : 240+grain
      data[i]=data[i+1]=data[i+2]=shade; data[i+3]=255
    }
    const map=new THREE.DataTexture(data,64,64);map.wrapS=map.wrapT=THREE.RepeatWrapping
    map.repeat.setScalar(joints?.5:3);map.magFilter=THREE.LinearFilter;map.minFilter=THREE.LinearMipmapLinearFilter;map.generateMipmaps=true;map.needsUpdate=true
    return map
  }
  const asphaltTexture=texture(false), sidewalkTexture=texture(true)
  materials.road.map=asphaltTexture;materials.sidewalk.map=sidewalkTexture
  materials.crosswalk.onBeforeCompile = shader => {
    shader.vertexShader = 'varying vec2 streetUv;\n' + shader.vertexShader.replace('#include <uv_vertex>', '#include <uv_vertex>\nstreetUv = uv;')
    shader.fragmentShader = 'varying vec2 streetUv;\n' + shader.fragmentShader.replace('#include <alphatest_fragment>', '#include <alphatest_fragment>\nif (fract(streetUv.x / 1.15) > 0.55) discard;')
  }
  materials.crosswalk.customProgramCacheKey = () => 'dc-crosswalk-stripes-v1'
  const loaded = new Map<string, THREE.Group>(), pending = new Map<string, AbortController>(), ready = new Map<string, ArrayBuffer>(), failed = new Map<string, number>()
  let wanted = new Set<string>(), alive = true
  const refreshMask = () => {
    detailedCount.value = loaded.size
    let i = 0
    for (const key of loaded.keys()) { const [x,z] = key.split('_').map(Number); detailedCells.value[i++].set(x*1024,z*1024,(x+1)*1024,(z+1)*1024) }
  }
  const remove = (key: string) => {
    const group = loaded.get(key); if (!group) return
    scene.remove(group); group.children.forEach(mesh => (mesh as THREE.Mesh).geometry.dispose()); loaded.delete(key)
  }
  const build = (key: string, buffer: ArrayBuffer) => {
    const group = new THREE.Group(); group.name = `DC GIS streets ${key}`
    for (const chunk of manifest.tiles[key]) {
      const geometry = new THREE.BufferGeometry()
      const vertices = new THREE.InterleavedBuffer(new Float32Array(buffer, chunk.offset * 4, chunk.count * 5), 5)
      geometry.setAttribute('position', new THREE.InterleavedBufferAttribute(vertices, 3, 0))
      geometry.setAttribute('uv', new THREE.InterleavedBufferAttribute(vertices, 2, 3))
      const normals = new Float32Array(chunk.count * 3)
      for (let i = 1; i < normals.length; i += 3) normals[i] = 1
      geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3)); geometry.computeBoundingSphere()
      const mesh = new THREE.Mesh(drapeGeometry(geometry,heightAt,60), materials[chunk.kind]); mesh.name = chunk.key; mesh.receiveShadow = true; group.add(mesh)
    }
    loaded.set(key, group); scene.add(group)
  }
  return {
    update: (x: number, z: number) => {
      const tx = Math.floor(x/1024), tz = Math.floor(z/1024), keys: string[] = []
      for (let dx=-1;dx<=1;dx++) for (let dz=-1;dz<=1;dz++) { const key=`${tx+dx}_${tz+dz}`; if (manifest.tiles[key]) keys.push(key) }
      keys.sort((a,b) => { const distance=(key:string)=>{const [cx,cz]=key.split('_').map(Number);return Math.hypot((cx+.5)*1024-x,(cz+.5)*1024-z)}; return distance(a)-distance(b) })
      wanted = new Set(keys)
      for (const key of loaded.keys()) if (!wanted.has(key)) remove(key)
      for (const [key, controller] of pending) if (!wanted.has(key)) { controller.abort(); pending.delete(key) }
      for (const key of ready.keys()) if (!wanted.has(key)) ready.delete(key)
      const next = keys.find(key => ready.has(key))
      if (next) { build(next, ready.get(next)!); ready.delete(next) }
      refreshMask()
      for (const key of keys) {
        if (pending.size >= 2) break
        if (loaded.has(key) || pending.has(key) || ready.has(key) || (failed.get(key)??0)>performance.now()) continue
        const controller = new AbortController(); pending.set(key, controller)
        fetch(`/world/streets/${key}.bin`, { signal: controller.signal }).then(async response => {
          if (!response.ok) throw new Error('Street tile unavailable')
          const buffer = await response.arrayBuffer()
          if (alive && !controller.signal.aborted && wanted.has(key)) ready.set(key, buffer)
        }).catch(() => { if (!controller.signal.aborted) failed.set(key,performance.now()+10000) }).finally(() => { if (pending.get(key)===controller) pending.delete(key) })
      }
    },
    loading: () => [...wanted].filter(key => !loaded.has(key)).length,
    dispose: () => { alive=false; pending.forEach(c=>c.abort()); ready.clear(); [...loaded.keys()].forEach(remove); Object.values(materials).forEach(material=>material.dispose()); disposeFallback(); asphaltTexture.dispose(); sidewalkTexture.dispose() },
  }
}
