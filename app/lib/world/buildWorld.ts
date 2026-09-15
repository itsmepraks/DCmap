import { MAP_STYLE, lawnColor } from './mapStyle'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { Reflector } from 'three/examples/jsm/objects/Reflector.js'
import { parkBenchParts } from './parkBench'
import { crownGeometry, branchGeometry } from './treeGeometry'
import { treeStyle, type WorldSeason } from './atmosphere'
import type RAPIER from '@dimforge/rapier3d-compat'

export interface WorldChunk { group: THREE.Group; x: number; radius: number }
export interface BuiltWorld { chunks: WorldChunk[]; water: Reflector; flags: THREE.Mesh[]; setSeason:(season:WorldSeason)=>void; setNight:(amount:number)=>void; dispose: () => void }

export function buildWorld(scene: THREE.Scene, physics: RAPIER.World, rapier: typeof RAPIER, terrainEnabled = false): BuiltWorld {
  const materials = {
    sandstone: new THREE.MeshStandardMaterial({ color: '#a4654d', roughness: 0.95 }),
    marble: new THREE.MeshStandardMaterial({ color: MAP_STYLE.marble, roughness: 0.78 }),
    trim: new THREE.MeshStandardMaterial({ color: MAP_STYLE.trim, roughness: 0.65 }),
    stone: new THREE.MeshStandardMaterial({ color: MAP_STYLE.stone, roughness: 0.9 }),
    path: new THREE.MeshStandardMaterial({ color: MAP_STYLE.path, roughness: 1 }),
    grass: new THREE.MeshStandardMaterial({ color: MAP_STYLE.park, roughness: 1 }),
    dark: new THREE.MeshStandardMaterial({ color: '#263e39', roughness: 0.65 }),
    bronze: new THREE.MeshStandardMaterial({ color: '#6d6245', metalness: 0.6, roughness: 0.5 }),
    trunk: new THREE.MeshStandardMaterial({ color: '#67503a', roughness: 1 }),
    leaves: new THREE.MeshStandardMaterial({ color: '#4e713e', roughness: 1 }),
    leafLight: new THREE.MeshStandardMaterial({ color: '#739354', roughness: 1 }),
    wood: new THREE.MeshStandardMaterial({ color: '#8b6241', roughness: 0.9 }),
    lamp: new THREE.MeshStandardMaterial({color:'#eee4cb',emissive:'#ffc37d',emissiveIntensity:0,roughness:.4}),
    water: new THREE.MeshStandardMaterial({ color: MAP_STYLE.water, metalness: 0.45, roughness: 0.22 }),
  }
  // Locally authored surface textures: meter-scaled UVs keep paving and stone
  // grain consistent across the architecture, rather than stretching one image.
  const textures: THREE.CanvasTexture[] = []
  const surfaceTexture = (kind: 'paving' | 'grass' | 'marble') => {
    const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 256
    const context = canvas.getContext('2d')!
    const pixels = context.createImageData(256, 256)
    let seed = 917
    for (let i = 0; i < pixels.data.length; i += 4) {
      seed = (seed * 1664525 + 1013904223) >>> 0
      const shade = (kind === 'paving' ? 239 : 244) + seed % (kind === 'paving' ? 15 : 10)
      pixels.data[i] = shade; pixels.data[i + 1] = shade; pixels.data[i + 2] = shade; pixels.data[i + 3] = 255
    }
    context.putImageData(pixels, 0, 0)
    if (kind === 'paving') {
      context.strokeStyle = '#c5c0b3'; context.lineWidth = 1.1
      for (let row = 0; row < 4; row++) {
        context.beginPath(); context.moveTo(0, row * 64); context.lineTo(256, row * 64); context.stroke()
        for (let x = row % 2 ? 64 : 0; x < 256; x += 128) { context.beginPath(); context.moveTo(x, row * 64); context.lineTo(x, row * 64 + 64); context.stroke() }
      }
    }
    const texture = new THREE.CanvasTexture(canvas); texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 8; textures.push(texture); return texture
  }
  materials.path.map = surfaceTexture('paving')
  materials.grass.map = surfaceTexture('grass')
  materials.marble.map = surfaceTexture('marble')
  const chunks: WorldChunk[] = []
  const flags: THREE.Mesh[] = []
  const chunk = (name: string, x: number, radius: number) => {
    const group = new THREE.Group(); group.name = name; scene.add(group)
    chunks.push({ group, x, radius }); return group
  }
  const solid = (x: number, y: number, z: number, w: number, h: number, d: number) => {
    physics.createCollider(rapier.ColliderDesc.cuboid(w / 2, h / 2, d / 2).setTranslation(x, y, z))
  }
  const box = (group: THREE.Group, mat: THREE.Material, x: number, y: number, z: number, w: number, h: number, d: number, collision = false) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
    if (mat === materials.path || mat === materials.grass || mat === materials.marble) {
      const position = mesh.geometry.attributes.position, normal = mesh.geometry.attributes.normal, uv = mesh.geometry.attributes.uv
      const scale = mat === materials.grass ? 6 : 3
      for (let i = 0; i < position.count; i++) {
        const horizontal = Math.abs(normal.getY(i)) > 0.5
        uv.setXY(i, (Math.abs(normal.getX(i)) > 0.5 ? position.getZ(i) + z : position.getX(i) + x) / scale, (horizontal ? position.getZ(i) + z : position.getY(i) + y) / scale)
      }
    }
    mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh)
    if (collision) solid(x, y, z, w, h, d)
    return mesh
  }
  const cylinder = (group: THREE.Group, mat: THREE.Material, x: number, y: number, z: number, top: number, bottom: number, height: number, sides = 16) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(top, bottom, height, sides), mat)
    mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh); return mesh
  }
  if (!terrainEnabled) {
  const district=chunk('District ground',3000,25000)
  box(district,materials.stone,3100,-1.02,-1100,18800,2,22200)
  solid(-3070,-0.5,-1100,6460,1,22200)
  solid(6595,-0.5,-1100,11610,1,22200)
  solid(475,-0.5,-6062.5,630,1,12075)
  solid(475,-0.5,4912.5,630,1,9775)
  }
  const ground = chunk('The National Mall', 650, 2000)
  box(ground, materials.grass, -125, -1, 0, 570, 2, 800)
  box(ground, materials.grass, 1245, -1, 0, 910, 2, 800)
  for (const z of [-212.5, 212.5]) box(ground, materials.grass, 475, -1, z, 630, 2, 375)
  // The pool has its own lower bed; the collision ground deliberately excludes it.
  solid(-125, -0.5, 0, 570, 1, 800)
  solid(1245, -0.5, 0, 910, 1, 800)
  solid(475, -0.5, -212.5, 630, 1, 375)
  solid(475, -0.5, 212.5, 630, 1, 375)
  solid(475, -1.2, 0, 630, 1, 50)
  for (const z of [-36, 36]) box(ground, materials.path, 520, -0.02, z, 850, 0.08, 17)
  box(ground, materials.path, 1090, -0.02, 0, 350, 0.08, 24)
  box(ground, materials.path, 95, -0.02, 0, 95, 0.08, 120)
  for (const z of [-130, 130]) {
    box(ground, materials.path, 650, -0.03, z, 1800, 0.06, 8)
    box(ground, materials.dark, 650, -0.04, z + Math.sign(z) * 24, 1800, 0.06, 18)
    for (let x = -100; x < 1500; x += 16) box(ground, materials.trim, x, 0.005, z + Math.sign(z) * 24, 6, 0.015, 0.13)
  }
  // Lincoln Memorial: stepped plinth, a complete colonnade, coffered entablature,
  // accessible central chamber, and an original simplified seated sculpture.
  const lincoln = chunk('Lincoln Memorial', 0, 250)
  for (let i = 0; i < 24; i++) {
    const h = 0.22, x = 54 - i * 1.25
    box(lincoln, i % 4 === 0 ? materials.trim : materials.marble, x, i * h + h / 2, 0, 1.26, h, 40 + (24 - i) * 0.45, true)
    // Fill below each tread, so there are no unsupported collision surfaces.
    if (i) solid(x, i * h / 2, 0, 1.26, i * h, 40 + (24 - i) * 0.45)
  }
  box(lincoln, materials.stone, -1, 2.65, 0, 49, 5.3, 72, true)
  box(lincoln, materials.marble, 24, 2.65, 0, 3, 5.3, 40, true)
  box(lincoln, materials.trim, -1, 5.45, 0, 47, 0.3, 69, true)
  const column = (x: number, z: number) => {
    cylinder(lincoln, materials.trim, x, 5.95, z, 1.25, 1.4, 0.7)
    cylinder(lincoln, materials.marble, x, 12.45, z, 0.8, 1.02, 12.3, 20)
    cylinder(lincoln, materials.trim, x, 18.8, z, 1.24, 1.08, 0.65)
    box(lincoln, materials.trim, x, 19.2, z, 2.6, 0.4, 2.6)
    physics.createCollider(rapier.ColliderDesc.cylinder(6.8, 1.08).setTranslation(x, 12.1, z))
  }
  for (let i = 0; i < 12; i++) { column(-20, -30 + i * 60 / 11); column(18, -30 + i * 60 / 11) }
  for (let i = 1; i < 7; i++) { column(-20 + i * 38 / 7, -30); column(-20 + i * 38 / 7, 30) }
  for (const z of [-22, 22]) box(lincoln, materials.marble, -2, 12.2, z, 30, 13, 1.5, true)
  box(lincoln, materials.marble, -16, 12.2, 0, 1.5, 13, 45, true)
  box(lincoln, materials.marble, -1, 20, 0, 43, 1.4, 65)
  box(lincoln, materials.trim, -1, 21, 0, 46, 0.65, 68)
  box(lincoln, materials.marble, -1, 22.25, 0, 43, 1.9, 65)
  box(lincoln, materials.trim, -1, 23.5, 0, 45, 0.6, 67)
  box(lincoln, materials.stone, -1, 24.1, 0, 39, 0.7, 61)
  for (let z = -30; z <= 30; z += 3.3) box(lincoln, materials.stone, 20.55, 22.25, z, 0.1, 1.35, 0.36)
  for (let x = -18; x < 19; x += 3.3) for (const z of [-32.55, 32.55]) box(lincoln, materials.stone, x, 22.25, z, 0.36, 1.35, 0.1)
  box(lincoln, materials.trim, -7, 6.7, 0, 7, 2.2, 8, true)
  box(lincoln, materials.marble, -9, 9.8, 0, 2.5, 5, 5)
  box(lincoln, materials.trim, -6.9, 10.6, 0, 2.5, 3.4, 3.7)
  cylinder(lincoln, materials.trim, -6.6, 13.1, 0, 0.7, 0.9, 1.65, 12)
  for (const z of [-2.6, 2.6]) { box(lincoln, materials.marble, -6.7, 9.3, z, 4.6, 1.1, 1.4); box(lincoln, materials.trim, -4.5, 8, z * 0.48, 2, 2.2, 1.35) }
  // Reflecting Pool, edged by coping stones and longitudinal paving joints.
  const pool = chunk('Reflecting Pool', 475, 750)
  box(pool, materials.stone, 475, -0.76, 0, 630, 0.12, 50)
  for (const z of [-25.5, 25.5]) box(pool, materials.trim, 475, 0.1, z, 634, 0.3, 1, true)
  for (const x of [159.5, 790.5]) box(pool, materials.trim, x, 0.1, 0, 1, 0.3, 52, true)
  for (let x = 110; x < 800; x += 7) for (const z of [-36, 36]) box(pool, materials.stone, x, 0.028, z, 0.035, 0.01, 16)
  const water = new Reflector(new THREE.PlaneGeometry(630, 50), { color: 0xb8dce8, textureWidth: 1024, textureHeight: 256, clipBias: 0.004 })
  water.rotation.x = -Math.PI / 2; water.position.set(475, -0.23, 0); pool.add(water)
  // WWII Memorial: ring of pillars, wreaths, and two taller pavilions.
  const wwii = chunk('World War II Memorial', 870, 180)
  cylinder(wwii, materials.path, 870, 0, 0, 57, 57, 0.16, 80)
  cylinder(wwii, materials.trim, 870, 0.22, 0, 25, 25, 0.42, 64)
  cylinder(wwii, materials.water, 870, 0.46, 0, 23.8, 23.8, 0.08, 64)
  physics.createCollider(rapier.ColliderDesc.cylinder(0.24, 25).setTranslation(870, 0.22, 0))
  for (let i = 0; i < 56; i++) {
    const a = i / 56 * Math.PI * 2, x = 870 + Math.cos(a) * 48, z = Math.sin(a) * 48
    if (Math.abs(z) < 6) continue
    box(wwii, materials.marble, x, 2.9, z, 1.4, 5.8, 1.4, true)
    box(wwii, materials.trim, x, 5.9, z, 1.65, 0.25, 1.65)
    const wreath = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.11, 5, 12), materials.bronze)
    wreath.position.set(x, 4.7, z + (z > 0 ? -0.72 : 0.72)); wwii.add(wreath)
  }
  for (const z of [-48, 48]) {
    for (const x of [865, 875]) box(wwii, materials.marble, x, 5.5, z, 2.5, 11, 7, true)
    box(wwii, materials.trim, 870, 11.2, z, 13, 1, 8)
  }
  for (let i = 0; i < 12; i++) {
    const angle = i / 12 * Math.PI * 2
    const points = Array.from({ length: 9 }, (_, j) => {
      const t = j / 8, r = 17 - t * 10
      return new THREE.Vector3(870 + Math.cos(angle) * r, 0.5 + Math.sin(t * Math.PI) * 3.2, Math.sin(angle) * r)
    })
    const jet = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 16, 0.065, 5, false), materials.water)
    wwii.add(jet)
  }
  // Obelisk uses tapered geometry rather than a rectangular building extrusion.
  const monument = chunk('Washington Monument', 1280, 350)
  cylinder(monument, materials.path, 1280, 0, 0, 64, 64, 0.12, 80)
  box(monument, materials.trim, 1280, 0.45, 0, 21, 0.9, 21, true)
  const shaft = cylinder(monument, materials.marble, 1280, 76.5, 0, 5.3 * Math.SQRT2, 8.4 * Math.SQRT2, 151.2, 4)
  shaft.rotation.y = Math.PI / 4
  const tip = cylinder(monument, materials.trim, 1280, 160.5, 0, 0, 5.3 * Math.SQRT2, 17, 4)
  tip.rotation.y = Math.PI / 4
  solid(1280, 76.5, 0, 16.8, 153, 16.8)
  // Quiet stone courses, economical geometry with a single merged draw call.
  for (let y = 2; y < 151; y += 2.2) {
    const width = 16.8 - (y / 151) * 6.2
    for (const side of [-1, 1]) {
      box(monument, materials.stone, 1280, y, side * width / 2, width, 0.026, 0.02)
      box(monument, materials.stone, 1280 + side * width / 2, y, 0, 0.02, 0.026, width)
    }
  }
  box(monument, materials.dark, 1288.42, 1.5, 0, 0.03, 2.6, 1.3)
  // Original stylized flag texture, generated locally (no external image assets).
  const flagCanvas = document.createElement('canvas'); flagCanvas.width = 130; flagCanvas.height = 70
  const ctx = flagCanvas.getContext('2d')!
  for (let i = 0; i < 13; i++) { ctx.fillStyle = i % 2 ? '#f0e8d5' : '#a74d3e'; ctx.fillRect(0, i * 70 / 13, 130, 70 / 13 + 1) }
  ctx.fillStyle = '#344d66'; ctx.fillRect(0, 0, 55, 38)
  ctx.fillStyle = '#f0e8d5'; for (let y = 4; y < 36; y += 6) for (let x = 4; x < 54; x += 7) ctx.fillRect(x, y, 1.6, 1.6)
  const flagTexture = new THREE.CanvasTexture(flagCanvas); flagTexture.colorSpace = THREE.SRGBColorSpace
  const flagMaterial = new THREE.MeshStandardMaterial({ map: flagTexture, side: THREE.DoubleSide, roughness: 0.85 })
  for (let i = 0; i < 30; i++) {
    const a = i / 30 * Math.PI * 2, x = 1280 + Math.cos(a) * 47, z = Math.sin(a) * 47
    cylinder(monument, materials.bronze, x, 4.6, z, 0.045, 0.07, 9.2, 6)
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.5, 8, 2), flagMaterial)
    flag.position.set(x + 1.4, 8.2, z); flag.userData.phase = i; monument.add(flag); flags.push(flag)
  }
  // Repeated street furniture and vegetation use shared geometry and instancing.
  const seed = (n: number) => { const t = Math.sin(n * 78.233 + 11) * 43758.5453; return t - Math.floor(t) }
  for (let section = 0; section < 7; section++) {
    const start = section * 220 - 70
    const grove = chunk(`Grove ${section}`, start + 110, 350)
    const count = 64
    const crowns = new THREE.InstancedMesh(crownGeometry(), materials.leaves, count)
    const accents = new THREE.InstancedMesh(crownGeometry(), materials.leafLight, count)
    const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.18, 0.3, 5, 6), materials.trunk, count)
    const dummy = new THREE.Object3D()
    for (let i = 0; i < count; i++) {
      const row = i % 4, side = row < 2 ? -1 : 1
      const x = start + Math.floor(i / 4) * 14 + seed(i + section * 70) * 3
      const z = side * (row % 2 ? 98 : 64) + seed(i + 19) * 7
      const size = 3.8 + seed(i * 9 + section) * 2.5
      dummy.position.set(x, 2.5, z); dummy.scale.set(1, 1, 1); dummy.updateMatrix(); trunks.setMatrixAt(i, dummy.matrix)
      dummy.position.set(x, 7.5, z); dummy.scale.set(size, size * 1.15, size * 0.9); dummy.rotation.y = seed(i) * 6; dummy.updateMatrix(); crowns.setMatrixAt(i, dummy.matrix)
      dummy.position.set(x + 1.6, 8.2, z - 1); dummy.scale.multiplyScalar(0.65); dummy.updateMatrix(); accents.setMatrixAt(i, dummy.matrix)
      physics.createCollider(rapier.ColliderDesc.cylinder(2.5, 0.3).setTranslation(x, 2.5, z))
    }
    for (const mesh of [trunks, crowns, accents]) { mesh.castShadow = true; mesh.receiveShadow = true; grove.add(mesh) }
    for (let i = 0; i < 5; i++) for (const side of [-1, 1]) {
      const x = start + 20 + i * 44, z = side * 47
      // A continuous steel frame supports the seat, back slats, and arms.
      for(const part of parkBenchParts(side))box(grove,materials[part.material],x+part.x,part.y,z+part.z,part.w,part.h,part.d)
      solid(x,.49,z,2,.98,.65)
      cylinder(grove, materials.dark, x + 8, 2.9, z, 0.065, 0.11, 5.8, 8)
      box(grove, materials.dark, x + 8, 5.9, z, 0.7, 0.85, 0.7)
      box(grove, materials.lamp, x + 8, 5.9, z, 0.61, 0.62, 0.72)
      cylinder(grove, materials.dark, x + 8, 6.48, z, 0, 0.55, 0.45, 4)
    }
  }
  // East Mall: continuous walking surface, cross streets and gravel promenades.
  // The civic background now comes from streamed DC GIS building footprints.
  const east = chunk('East Mall and Capitol grounds', 2700, 2200)
  box(east, materials.grass, 2900, -1, 0, 2400, 2, 800)
  solid(2900, -0.5, 0, 2400, 1, 800)
  for (const z of terrainEnabled ? [] : [-675, 675]) {
    box(east, materials.grass, 1850, -1, z, 4500, 2, 550)
    solid(1850, -0.5, z, 4500, 1, 550)
  }
  for (const z of [-90, 90]) box(east, materials.path, 2340, 0.025, z, 1400, 0.05, 14)
  box(east, materials.path, 2960, 0.025, 0, 740, 0.05, 24)
  for (const z of [-125, 125]) box(east, materials.path, 2310, 0.025, z, 1280, 0.05, 10)
  // Smithsonian Castle: red sandstone, an elongated Romanesque body and
  // asymmetric square towers. This footprint replaces the generic GIS extrusion.
  const castle=chunk('Smithsonian Castle',2100,250)
  box(castle,materials.sandstone,2100,8,54,132,16,28,true)
  box(castle,materials.stone,2100,16.5,54,134,1,30)
  for(const [x,z,h,w] of [[2070,43,38,13],[2096,39,31,12],[2138,55,24,16],[2043,55,24,16]]) {
    box(castle,materials.sandstone,x,h/2,z,w,h,w,true)
    box(castle,materials.sandstone,x,h,z,w+1.3,1.4,w+1.3)
    for(const dx of [-w/2,w/2]) for(const dz of [-w/2,w/2]) {
      cylinder(castle,materials.sandstone,x+dx,h+2,z+dz,0.8,0.8,4,8)
      cylinder(castle,materials.dark,x+dx,h+4.8,z+dz,0,1.3,2,8)
    }
    for(const y of [h-6,h-12]) for(const dx of [-2.4,2.4]) box(castle,materials.dark,x+dx,y,z-w/2-0.04,1.3,3.8,0.1)
  }
  for(let x=2040;x<2162;x+=6) for(const y of [4.5,11]) {
    box(castle,materials.stone,x,y,39.8,2.4,4.1,0.35)
    box(castle,materials.dark,x,y,39.55,1.8,3.6,0.12)
    cylinder(castle,materials.sandstone,x,14,39.5,0,1.6,1.2,3)
  }
  box(castle,materials.dark,2097,3,32.8,3,6,0.15)
  box(castle,materials.path,2097,0.035,4,8,0.06,60)
  // Elm avenues restore the human scale of the east Mall promenades.
  const eastTrees=chunk('East Mall elms',2250,1000)
  const treePositions: [number,number][]=[]
  for(let x=1670;x<2880;x+=22) for(const z of [-105,105]) treePositions.push([x,z])
  const crowns=new THREE.InstancedMesh(crownGeometry(),materials.leaves,treePositions.length)
  const trunks=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.2,0.35,5,6),materials.trunk,treePositions.length)
  const treeTransform=new THREE.Object3D()
  treePositions.forEach(([x,z],i)=>{
    treeTransform.position.set(x,2.5,z);treeTransform.scale.set(1,1,1);treeTransform.updateMatrix();trunks.setMatrixAt(i,treeTransform.matrix)
    treeTransform.position.set(x,8,z);treeTransform.scale.set(4.5,5.5,4);treeTransform.updateMatrix();crowns.setMatrixAt(i,treeTransform.matrix)
    physics.createCollider(rapier.ColliderDesc.cylinder(2.5,0.35).setTranslation(x,2.5,z))
  })
  crowns.castShadow=true;trunks.castShadow=true;eastTrees.add(crowns,trunks)
  // An original Capitol interpretation: wings, west portico, drum and ribbed dome.
  const capitol = chunk('United States Capitol', 3330, 400)
  box(capitol, materials.path, 3210, 0.02, 0, 180, 0.04, 200)
  box(capitol, materials.stone, 3330, 1.5, 0, 105, 3, 235, true)
  box(capitol, materials.marble, 3330, 15, 0, 75, 24, 70, true)
  for (const z of [-82,82]) {
    box(capitol, materials.marble,3335,14,z,80,22,78,true)
    box(capitol, materials.trim,3335,26,z,85,2,83)
    box(capitol, materials.stone,3335,28,z,70,2,68)
    for (let dz=-30;dz<=30;dz+=7.5) for (const y of [8,16,23]) box(capitol,materials.dark,3294.9,y,z+dz,0.06,3.5,2)
    for (let dz=-30;dz<=30;dz+=6) cylinder(capitol,materials.trim,3292,16,z+dz,0.65,0.8,18,12)
  }
  for (let i=0;i<15;i++) box(capitol,materials.trim,3260+i*1.1,0.1+i*0.2,0,1.11,0.2,55,true)
  box(capitol,materials.marble,3285,1.5,0,18,3,55,true)
  for (let z=-24;z<=24;z+=6) cylinder(capitol,materials.trim,3283,14,z,0.85,1,22,16)
  box(capitol,materials.trim,3283,26,0,10,2,59)
  const pedimentShape=new THREE.Shape([new THREE.Vector2(-29.5,0),new THREE.Vector2(29.5,0),new THREE.Vector2(0,7)])
  const pedimentGeometry=new THREE.ExtrudeGeometry(pedimentShape,{depth:8,bevelEnabled:false})
  pedimentGeometry.rotateY(Math.PI/2);pedimentGeometry.translate(3279,27,0)
  capitol.add(new THREE.Mesh(pedimentGeometry,materials.trim))
  cylinder(capitol,materials.trim,3330,33,0,21,23,12,64)
  for (let i=0;i<32;i++) {
    const a=i/32*Math.PI*2
    cylinder(capitol,materials.marble,3330+Math.cos(a)*21.5,37,Math.sin(a)*21.5,0.55,0.7,12,10)
  }
  for(let z=-24;z<=24;z+=6) for(const y of [9,18]) box(capitol,materials.dark,3292.45,y,z,0.08,4,2.2)
  for(let i=0;i<24;i++) {
    const a=i/24*Math.PI*2
    const window=box(capitol,materials.dark,3330+Math.cos(a)*21.6,34,Math.sin(a)*21.6,1.3,4,0.08)
    window.rotation.y=Math.PI/2-a
  }
  cylinder(capitol,materials.trim,3330,44,0,23,23,2,64)
  const dome = new THREE.Mesh(new THREE.SphereGeometry(22,48,24,0,Math.PI*2,0,Math.PI/2),materials.marble)
  dome.position.set(3330,45,0); dome.scale.y=1.35; capitol.add(dome)
  for(let i=0;i<24;i++) {
    const a=i/24*Math.PI*2
    const points=Array.from({length:17},(_,j)=>{const t=j/16*Math.PI/2;return new THREE.Vector3(3330+22.15*Math.sin(t)*Math.cos(a),45+29.8*Math.cos(t),22.15*Math.sin(t)*Math.sin(a))})
    capitol.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),24,0.14,5,false),materials.trim))
  }
  cylinder(capitol,materials.trim,3330,77,0,3.5,4,7,16)
  cylinder(capitol,materials.bronze,3330,83,0,0.4,1.1,5,10)
  const seasonalTrees:{mesh:THREE.InstancedMesh;matrices:THREE.Matrix4[];points:{x:number;z:number}[]}[]=[]
  const branches=branchGeometry()
  for(const {group} of chunks)for(const child of [...group.children]){
    if(!(child instanceof THREE.InstancedMesh)||(child.material!==materials.leaves&&child.material!==materials.leafLight))continue
    const matrices:THREE.Matrix4[]=[],points:{x:number;z:number}[]=[]
    const limbs=child.material===materials.leaves?new THREE.InstancedMesh(branches,materials.trunk,child.count):null
    for(let i=0;i<child.count;i++){
      const m=new THREE.Matrix4();child.getMatrixAt(i,m);matrices.push(m);points.push({x:m.elements[12],z:m.elements[14]})
      limbs?.setMatrixAt(i,new THREE.Matrix4().makeTranslation(m.elements[12],0,m.elements[14]))
    }
    if(limbs){limbs.castShadow=true;limbs.computeBoundingSphere();group.add(limbs)}
    seasonalTrees.push({mesh:child,matrices,points})
  }
  materials.leaves.color.set('#ffffff');materials.leafLight.color.set('#ffffff')
  const setSeason=(season:WorldSeason)=>{
    materials.grass.color.set(lawnColor(season))
    const color=new THREE.Color(),hidden=new THREE.Matrix4().makeScale(0,0,0)
    for(const {mesh,matrices,points} of seasonalTrees){
      points.forEach(({x,z},i)=>{const style=treeStyle(x,z,season);mesh.setMatrixAt(i,style.bare?hidden:matrices[i]);mesh.setColorAt(i,color.set(style.color))})
      mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;mesh.computeBoundingSphere()
    }
  }
  setSeason('summer')
  // Merge static architectural pieces by material per spatial chunk. Trees stay
  // instanced, flags and reflective water stay independent and animated.
  for (const { group } of chunks) {
    const byMaterial = new Map<THREE.Material, THREE.BufferGeometry[]>()
    for (const child of [...group.children]) {
      if (!(child instanceof THREE.Mesh) || child instanceof THREE.InstancedMesh || child === water || flags.includes(child) || Array.isArray(child.material)) continue
      child.updateMatrix()
      const geometry = (child.geometry.index ? child.geometry.toNonIndexed() : child.geometry.clone()).applyMatrix4(child.matrix)
      const list = byMaterial.get(child.material) ?? []; list.push(geometry); byMaterial.set(child.material, list)
      child.geometry.dispose(); group.remove(child)
    }
    for (const [material, geometries] of byMaterial) {
      const merged = mergeGeometries(geometries)
      geometries.forEach(geometry => geometry.dispose())
      const mesh = new THREE.Mesh(merged, material); mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh)
    }
  }
  return { chunks, water, flags, setSeason, setNight:(amount:number)=>{materials.lamp.emissiveIntensity=amount*3}, dispose: () => {
    const geometries = new Set<THREE.BufferGeometry>()
    for (const { group } of chunks) { group.traverse(object => { if (object instanceof THREE.Mesh) geometries.add(object.geometry); if(object instanceof THREE.InstancedMesh)object.dispose() }); scene.remove(group) }
    geometries.forEach(geometry => geometry.dispose()); Object.values(materials).forEach(material => material.dispose())
    textures.forEach(texture => texture.dispose()); flagTexture.dispose(); flagMaterial.dispose(); water.dispose()
  } }
}
