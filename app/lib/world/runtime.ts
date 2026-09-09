import { createMapLabels } from './mapLabels'
import { lawnColor } from './mapStyle'
import * as THREE from 'three'
import RAPIER from '@dimforge/rapier3d-compat'
import { explorationSpeed, findLandingPoint, flightMovement } from './travelControls'
import { Sky } from 'three/examples/jsm/objects/Sky.js'
import { buildDistrictTerrain, type TerrainData } from './terrain'
import { LIGHTING, type WorldTime, type WorldSeason } from './atmosphere'
import { createWorldLife } from './worldLife'
import { createPlaceLabels } from './placeLabels'
import type { WorldPlace } from './places'
import { createCityStreaming, type WorldBuilding } from './cityStreaming'
import { buildWorld } from './buildWorld'
import { DISTRICT_PLACES } from './districtPlaces'
import { ROUTE, clampWorldPosition, movementVector, type WorldPosition } from './mallRoute'

export interface WorldSnapshot {
  position: WorldPosition
  heading: number
  speed: number
  mode: 'walk' | 'fly'
  nearest: string
  distance: number
  fps: number
  grounded: boolean
  locked: boolean
  cruising: boolean
  navigation: string
  city: { loaded: number; loading: number; failed: boolean }
}
export type WorldSelection = {placeId:string} | {building:WorldBuilding}
export interface WorldRuntime {
  setPlaces(places:WorldPlace[]):void
  setInspectHandler(handler:((selection:WorldSelection)=>void)|null):void
  clearInspection():void
  setPlaceLabels(enabled:boolean):void
  setPaused(paused:boolean):void
  dispose(): void
  input(key: string, down: boolean): void
  setMode(mode: 'walk' | 'fly'): void
  travel(id: string): void
  travelTo(position: WorldPosition): void
  setPace(multiplier:number): void
  toggleCruise(enabled?:boolean): void
  setTime(time: WorldTime): void
  setSeason(season:WorldSeason):void
  setLife(enabled:boolean):void
  visitBlossoms():void
  setQuality(quality: 'auto' | 'high' | 'low'): void
  setSound(enabled: boolean): void
}

export async function createWorldRuntime(container: HTMLElement, publish: (snapshot: WorldSnapshot) => void, signal: AbortSignal): Promise<WorldRuntime> {
  await RAPIER.init()
  if (signal.aborted) throw new DOMException('Cancelled', 'AbortError')
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#bed0d5')
  scene.fog = new THREE.Fog('#bed0d5', 1800, 16000)
  const camera = new THREE.PerspectiveCamera(65, 1, 0.1, 22000)
  camera.rotation.order = 'YXZ'
  const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.shadowMap.autoUpdate = false
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.domElement.tabIndex = 0
  renderer.domElement.setAttribute('aria-label', '3D Washington, DC. Use WASD to move, drag to look, Space to jump, F to fly, and Escape to release the mouse.')
  container.appendChild(renderer.domElement)
  const physics = new RAPIER.World({ x: 0, y: -20, z: 0 })
  const terrain = await (async () => {
    const response = await fetch('/world/terrain.json', {signal})
    if (!response.ok) throw new Error('District terrain unavailable')
    const data: TerrainData = await response.json()
    if (signal.aborted) throw new DOMException('Cancelled', 'AbortError')
    return buildDistrictTerrain(scene, physics, RAPIER, data)
  })().catch(error => {physics.free(); renderer.dispose(); renderer.domElement.remove(); throw error})
  const city = await createCityStreaming(scene, physics, RAPIER, signal, terrain.heightAt).catch(error => { terrain.dispose(); physics.free(); renderer.dispose(); renderer.domElement.remove(); throw error })
  if (signal.aborted) { city.dispose(); terrain.dispose(); physics.free(); renderer.dispose(); renderer.domElement.remove(); throw new DOMException('Cancelled', 'AbortError') }
  const world = buildWorld(scene, physics, RAPIER, true)
  const mapLabels=createMapLabels(container,camera,terrain.heightAt)
  const sky = new Sky(); sky.scale.setScalar(40000); scene.add(sky)
  const skyUniforms = sky.material.uniforms
  skyUniforms.turbidity.value = 2.2
  skyUniforms.rayleigh.value = 1.1
  skyUniforms.mieCoefficient.value = 0.003
  skyUniforms.mieDirectionalG.value = 0.8
  const ambient = new THREE.HemisphereLight('#cfe0eb', '#647445', 2.1); scene.add(ambient)
  const sun = new THREE.DirectionalLight('#fff0d1', 3.2)
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048)
  Object.assign(sun.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, near: 1, far: 450 })
  sun.shadow.radius = 3.5; sun.shadow.normalBias = 0.025; sun.shadow.bias = -0.00008
  scene.add(sun, sun.target)
  let sunDirection = new THREE.Vector3(-0.7, 0.6, 0.3).normalize()
  const life=createWorldLife(scene,terrain.heightAt,city.water,physics,RAPIER)
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)')
  life.setMotion(!reducedMotion.matches)
  const motionChanged=()=>life.setMotion(!reducedMotion.matches)
  reducedMotion.addEventListener('change',motionChanged)
  let currentTime:WorldTime='day',season:WorldSeason='summer'
  const moon=new THREE.Mesh(new THREE.SphereGeometry(65,16,12),new THREE.MeshBasicMaterial({color:'#e3eafa'}));scene.add(moon)
  const lamps=[new THREE.PointLight('#ffc88b',0,20,2),new THREE.PointLight('#ffc88b',0,20,2)];lamps.forEach(lamp=>scene.add(lamp))
  const monumentLights=[new THREE.SpotLight('#ffdfb5',0,240,.85,.7,2),new THREE.SpotLight('#ffdfb5',0,240,.85,.7,2)];monumentLights.forEach(light=>scene.add(light,light.target))
  const setTime=(time:WorldTime)=>{currentTime=time}
  const setSeason=(value:WorldSeason)=>{
    season=value;world.setSeason(value);city.setSeason(value);life.setSeason(value)
    scene.traverse(object=>{if(!(object instanceof THREE.Mesh))return;for(const material of Array.isArray(object.material)?object.material:[object.material]){
      if(!(material instanceof THREE.MeshStandardMaterial)||!material.userData.seasonalLand)continue
      if(material.userData.seasonalLand==='grass')material.color.set(lawnColor(value))
    }})
  }
  const lightColor=new THREE.Color(),skyColor=new THREE.Color(),fogColor=new THREE.Color(),groundColor=new THREE.Color(),targetDirection=new THREE.Vector3()
  let lampAmount=0
  const updateAtmosphere=(dt:number,p:WorldPosition)=>{
    const preset=LIGHTING[currentTime],mix=reducedMotion.matches?1:1-Math.exp(-dt*3)
    targetDirection.set(Math.sin(preset.azimuth),preset.elevation,Math.cos(preset.azimuth)).normalize();sunDirection.lerp(targetDirection,mix).normalize()
    skyUniforms.sunPosition.value.copy(sunDirection)
    skyUniforms.turbidity.value=season==='summer'?2.4:season==='winter'?2:2.2
    skyUniforms.rayleigh.value=season==='winter'?1.1:1.2
    sun.color.lerp(lightColor.set(preset.sun),mix);sun.intensity=THREE.MathUtils.lerp(sun.intensity,preset.strength,mix)
    ambient.color.lerp(skyColor.set(currentTime==='night'?'#9cabc8':preset.sky),mix);ambient.groundColor.lerp(groundColor.set(preset.ground),mix);ambient.intensity=THREE.MathUtils.lerp(ambient.intensity,preset.ambient,mix)
    ;(scene.fog as THREE.Fog).color.lerp(fogColor.set(preset.fog),mix);(scene.background as THREE.Color).lerp(skyColor.set(preset.sky),mix)
    renderer.toneMappingExposure=THREE.MathUtils.lerp(renderer.toneMappingExposure,preset.exposure,mix)
    sky.visible=currentTime!=='night';moon.visible=currentTime==='night';moon.position.set(p.x,p.y,p.z).addScaledVector(sunDirection,9000)
    lampAmount=THREE.MathUtils.lerp(lampAmount,preset.lamps,mix);world.setNight(lampAmount);city.setNight(lampAmount)
    const nearMonument=ROUTE.reduce((a,b)=>Math.hypot(a.lookAt.x-p.x,a.lookAt.z-p.z)<Math.hypot(b.lookAt.x-p.x,b.lookAt.z-p.z)?a:b).lookAt
    monumentLights.forEach((light,i)=>{light.intensity=Math.hypot(nearMonument.x-p.x,nearMonument.z-p.z)<350?lampAmount*16000:0;light.position.set(nearMonument.x+55,5,nearMonument.z+(i?45:-45));light.target.position.set(nearMonument.x,nearMonument.y,nearMonument.z)})
    const nearMall=p.x> -100&&p.x<1500&&Math.abs(p.z)<80
    lamps.forEach((lamp,i)=>{lamp.intensity=nearMall?lampAmount*24:0;lamp.position.set(Math.round((p.x+42)/44)*44-42,5.9,i?47:-47)})
  }
  setTime('day')
  const body = physics.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(80, 1, 34))
  const collider = physics.createCollider(RAPIER.ColliderDesc.capsule(0.55, 0.3), body)
  let inspectHandler:((selection:WorldSelection)=>void)|null=null
  const labels=createPlaceLabels(container,camera,terrain.heightAt,city.buildingAt,id=>{city.highlight(null);inspectHandler?.({placeId:id})},target=>{
    const direction=target.clone().sub(camera.position),distance=direction.length();direction.normalize()
    const hit=physics.castRay(new RAPIER.Ray(camera.position,direction),Math.max(0,distance-1),true,undefined,undefined,collider)
    return !hit
  })
  const controller = physics.createCharacterController(0.025)
  controller.enableAutostep(0.4, 0.3, false)
  controller.enableSnapToGround(0.4)
  controller.setMaxSlopeClimbAngle(Math.PI / 4)
  let mode: 'walk' | 'fly' = 'walk'
  let grounded = false, verticalVelocity = 0, velocityX = 0, velocityZ = 0
  let yaw = 0, pitch = 0, flyPosition = new THREE.Vector3(), travelTarget: string | null = null
  const keys = new Set<string>()
  let pace=1,cruising=false,navigation='',pendingLanding:WorldPosition|null=null
  const land = (position:WorldPosition) => {
    physics.step()
    const point=findLandingPoint(position.x,position.z,(x,z)=>{
      const bounded=clampWorldPosition({x,y:0,z});if(bounded.x!==x||bounded.z!==z||!city.canWalk(x,z))return null
      const hit=physics.castRay(new RAPIER.Ray({x,y:2000,z},{x:0,y:-1,z:0}),2010,true,undefined,undefined,collider)
      if(!hit)return null
      const floor=2000-hit.timeOfImpact
      const ground=terrain.heightAt(x,z)
      return floor<=ground+3&&floor>=ground-2?floor:null
    })
    if(!point)return false
    body.setEnabled(true);body.setTranslation(point,true);body.setNextKinematicTranslation(point)
    mode='walk';pitch=Math.max(-0.15,Math.min(0.15,pitch));grounded=false;verticalVelocity=0
    travelTarget='landing';return true
  }
  const setMode = (next: 'walk' | 'fly') => {
    keys.clear(); cruising=false; velocityX=0;velocityZ=0;verticalVelocity=0
    pendingLanding=null;navigation=''
    if(mode===next)return
    if(next==='fly'){flyPosition.copy(camera.position);body.setEnabled(false);mode='fly'}
    else {pendingLanding={x:camera.position.x,y:camera.position.y,z:camera.position.z};navigation='Finding a clear place to walk…'}
    renderer.domElement.focus({preventScroll:true})
  }
  const travelTo = (position:WorldPosition) => {
    const street=mode==='walk'?city.streetArrival(position.x,position.z):null
    const destination=clampWorldPosition(street??position),arrivalMode=mode
    if(street)yaw=street.yaw
    keys.clear();cruising=false;velocityX=0;velocityZ=0;verticalVelocity=0;navigation=''
    body.setEnabled(false);mode='fly';flyPosition.set(destination.x,Math.max(terrain.heightAt(destination.x,destination.z)+100,destination.y),destination.z)
    city.update(destination.x,destination.z)
    pendingLanding=arrivalMode==='walk'?destination:null
    navigation=pendingLanding?'Preparing your arrival…':''
    travelTarget='destination';pitch=-0.25
    renderer.domElement.focus({preventScroll:true})
  }
  const travel = (id: string) => {
    const stop=[...ROUTE,...DISTRICT_PLACES].find(item=>item.id===id);if(!stop)return
    const neighborhood=DISTRICT_PLACES.some(item=>item.id===id)
    const street=neighborhood?city.streetArrival(stop.arrival.x,stop.arrival.z):null
    travelTo(stop.arrival)
    if(!neighborhood&&pendingLanding){pendingLanding=stop.arrival;flyPosition.x=stop.arrival.x;flyPosition.z=stop.arrival.z}
    const dx=stop.lookAt.x-stop.arrival.x,dz=stop.lookAt.z-stop.arrival.z
    yaw=street?.yaw??Math.atan2(-dx,-dz)
    if(!pendingLanding)pitch=Math.atan2(terrain.heightAt(stop.lookAt.x,stop.lookAt.z)+stop.lookAt.y-flyPosition.y,Math.hypot(dx,dz))
  }
  // Start on the known clear Lincoln arrival, without waiting for district travel.
  yaw=Math.atan2(80,34);pitch=0.12
  let quality: 'auto' | 'high' | 'low' = 'auto'
  const setQuality = (next: typeof quality) => {
    quality = next
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, next === 'high' ? 2.5 : next === 'low' ? 1 : 2))
    renderer.shadowMap.enabled = next !== 'low'
  }
  // Audio is synthesized locally and starts only after the user's Sound action.
  let audio: AudioContext | null = null, sound = false, lastFootstep = 0
  let fountainGain: GainNode | null = null
  const setSound = (enabled: boolean) => {
    sound = enabled
    if (enabled && !audio) {
      audio = new AudioContext()
      const buffer = audio.createBuffer(1, audio.sampleRate * 2, audio.sampleRate)
      const samples = buffer.getChannelData(0)
      for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1
      const noise = audio.createBufferSource(); noise.buffer = buffer; noise.loop = true
      const wind = audio.createBiquadFilter(); wind.type = 'lowpass'; wind.frequency.value = 250
      const windGain = audio.createGain(); windGain.gain.value = 0.025
      const water = audio.createBiquadFilter(); water.type = 'bandpass'; water.frequency.value = 1600; water.Q.value = 0.35
      fountainGain = audio.createGain(); fountainGain.gain.value = 0
      noise.connect(wind); wind.connect(windGain); windGain.connect(audio.destination)
      noise.connect(water); water.connect(fountainGain); fountainGain.connect(audio.destination); noise.start()
    }
    if (enabled) void audio?.resume()
    else void audio?.suspend()
  }
  const footstep = () => {
    if (!audio || !sound) return
    const buffer = audio.createBuffer(1, audio.sampleRate * 0.055, audio.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
    const source = audio.createBufferSource(); source.buffer = buffer
    const filter = audio.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 450
    const gain = audio.createGain(); gain.gain.value = 0.065
    source.connect(filter); filter.connect(gain); gain.connect(audio.destination); source.start()
    source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect() }
  }
  const canvas = renderer.domElement
  let dragging = false, lastX = 0, lastY = 0, startX=0, startY=0, moved=false, lookPointer: number | null = null
  const clearInput = () => { keys.clear(); cruising=false; dragging = false; lookPointer = null; velocityX = 0; velocityZ = 0 }
  const look = (dx: number, dy: number) => {
    yaw -= dx * 0.0025
    pitch = THREE.MathUtils.clamp(pitch - dy * 0.002, -1.45, 1.45)
  }
  const pointerDown = (event: PointerEvent) => {
    if (event.button !== 0) return
    if (lookPointer !== null) return
    lookPointer = event.pointerId
    dragging = true; startX=lastX=event.clientX; startY=lastY=event.clientY; moved=false
    canvas.setPointerCapture(event.pointerId); canvas.focus({ preventScroll: true })
  }
  const pointerMove = (event: PointerEvent) => {
    if(dragging&&Math.hypot(event.clientX-startX,event.clientY-startY)>5)moved=true
    if (document.pointerLockElement === canvas) look(event.movementX, event.movementY)
    else if (dragging && event.pointerId === lookPointer) { look(event.clientX - lastX, event.clientY - lastY); lastX = event.clientX; lastY = event.clientY }
  }
  const pointerUp = (event: PointerEvent) => {
    if(event.pointerId!==lookPointer)return
    dragging=false;lookPointer=null
    if(moved||event.type==='pointercancel')return
    const rect=canvas.getBoundingClientRect(),raycaster=new THREE.Raycaster()
    raycaster.setFromCamera(document.pointerLockElement===canvas?new THREE.Vector2():new THREE.Vector2((event.clientX-rect.left)/rect.width*2-1,1-(event.clientY-rect.top)/rect.height*2),camera)
    const hit=physics.castRay(new RAPIER.Ray(raycaster.ray.origin,raycaster.ray.direction),1600,true,undefined,undefined,collider)
    const building=hit?city.buildingForCollider(hit.collider.handle):null
    if(building){city.highlight(building);inspectHandler?.({building})}
  }
  const lockMouse = () => { const request = canvas.requestPointerLock?.(); if (request instanceof Promise) request.catch(() => {}) }
  const lockChanged = () => { if (document.pointerLockElement !== canvas) clearInput() }
  const controlKeys = new Set(['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift', ' ', 'q', 'e'])
  let paused=false
  const keyDown = (event: KeyboardEvent) => {
    if(paused)return
    if ((event.target as HTMLElement)?.closest?.('input, textarea, select, a, dialog, [role="dialog"], [data-world-controls]') || event.metaKey || event.ctrlKey || event.altKey) return
    const key = event.key.toLowerCase()
    if (key === ' ' && (event.target as HTMLElement)?.closest?.('button')) return
    if (key === 'r' && !event.repeat) {event.preventDefault();cruising=!cruising}
    if (key === 'f' && !event.repeat) { event.preventDefault(); setMode(mode === 'walk' ? 'fly' : 'walk') }
    if(key==='s'||key==='arrowdown')cruising=false
    if (controlKeys.has(key)) { event.preventDefault(); keys.add(key) }
    if (key === 'escape') clearInput()
  }
  const keyUp = (event: KeyboardEvent) => { keys.delete(event.key.toLowerCase()) }
  const focusChanged = (event: FocusEvent) => { if (event.target !== canvas) clearInput() }
  window.addEventListener('keydown', keyDown); window.addEventListener('keyup', keyUp)
  window.addEventListener('blur', clearInput); window.addEventListener('focusin', focusChanged)
  document.addEventListener('visibilitychange', clearInput); document.addEventListener('pointerlockchange', lockChanged)
  canvas.addEventListener('pointerdown', pointerDown); window.addEventListener('pointermove', pointerMove)
  window.addEventListener('pointerup', pointerUp); canvas.addEventListener('pointercancel', pointerUp)
  canvas.addEventListener('dblclick', lockMouse)
  const resize = () => { const { width, height } = container.getBoundingClientRect(); renderer.setSize(width, height); camera.aspect = width / Math.max(height, 1); camera.updateProjectionMatrix() }
  const observer = new ResizeObserver(resize); observer.observe(container); resize()
  let previous = performance.now(), accumulator = 0, frameId = 0, lastPublish = 0, frames = 0, fps = 60, frameWindow = previous
  let lastShadow=0
  let smoothedEye = 1.75, lastQualityCheck = previous, slowWindows = 0
  const desired = new THREE.Vector3(), corrected = new THREE.Vector3()
  const step = 1 / 60
  let alive = true
  const tick = (now: number) => {
    if (!alive) return
    const dt = Math.min((now - previous) / 1000, 0.05); previous = now
    if (paused || document.hidden) { accumulator = 0; frameId = requestAnimationFrame(tick); return }
    const streamingPosition = mode === 'walk' ? body.translation() : flyPosition
    city.update(streamingPosition.x, streamingPosition.z)
    accumulator += dt
    if(pendingLanding) {
      if(keys.size||cruising){pendingLanding=null;navigation=''}
      else if(city.canWalk(pendingLanding.x,pendingLanding.z)||city.status().loading===0){navigation=land(pendingLanding)?'':'No clear ground nearby. Keep flying or pick another spot.';pendingLanding=null}
    }
    const forward = Number(cruising || keys.has('w') || keys.has('arrowup')) - Number(keys.has('s') || keys.has('arrowdown'))
    const right = Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft'))
    const speed = explorationSpeed(mode,keys.has('shift'),pace)
    const input = mode==='fly'?flightMovement(forward,right,Number(keys.has(' ')||keys.has('e'))-Number(keys.has('q')),yaw,pitch,speed):{...movementVector(forward,right,yaw,speed),y:0}
    while (accumulator >= step) {
      velocityX = THREE.MathUtils.damp(velocityX, input.x, 24, step)
      velocityZ = THREE.MathUtils.damp(velocityZ, input.z, 24, step)
      if (Math.abs(velocityX) < 0.005) velocityX = 0
      if (Math.abs(velocityZ) < 0.005) velocityZ = 0
      if (mode === 'walk') {
        if (keys.has(' ') && grounded) { verticalVelocity = 6; grounded = false; keys.delete(' ') }
        verticalVelocity = Math.max(-35, verticalVelocity - 20 * step)
        desired.set(velocityX * step, verticalVelocity * step, velocityZ * step)
        controller.computeColliderMovement(collider, desired)
        corrected.copy(controller.computedMovement())
        grounded = controller.computedGrounded()
        if (grounded) verticalVelocity = -0.5
        const p = body.translation()
        const next = clampWorldPosition({ x: p.x + corrected.x, y: p.y + corrected.y, z: p.z + corrected.z })
        if (!city.canWalk(next.x, next.z)) { next.x = p.x; next.z = p.z }
        body.setNextKinematicTranslation(next)
      } else {
        flyPosition.x += velocityX * step; flyPosition.z += velocityZ * step
        verticalVelocity=THREE.MathUtils.damp(verticalVelocity,input.y,24,step)
        flyPosition.y += verticalVelocity*step
        flyPosition.copy(clampWorldPosition(flyPosition)); flyPosition.y = Math.max(terrain.heightAt(flyPosition.x,flyPosition.z)+1.7, flyPosition.y)
      }
      physics.timestep = step; physics.step(); accumulator -= step
    }
    const p = mode === 'walk' ? body.translation() : flyPosition
    if (travelTarget) { smoothedEye = p.y + (mode === 'walk' ? 0.75 : 0); travelTarget = null }
    smoothedEye = THREE.MathUtils.damp(smoothedEye, p.y + (mode === 'walk' ? 0.75 : 0), 22, dt)
    camera.position.set(p.x, smoothedEye, p.z)
    camera.rotation.set(pitch, yaw, 0, 'YXZ')
    updateAtmosphere(dt,p)
    life.update(now,p)
    const texel=120/2048
    sun.target.position.set(Math.round(p.x/texel)*texel, terrain.heightAt(p.x,p.z), Math.round(p.z/texel)*texel)
    sun.position.copy(sun.target.position).addScaledVector(sunDirection, 220)
    // Spatial chunks keep draw calls bounded. Landmark silhouettes remain visible;
    // detailed groves and furniture are culled beyond their local neighborhood.
    for (const chunk of world.chunks) chunk.group.visible = !chunk.group.name.startsWith('Grove') || Math.abs(p.x - chunk.x) < 480
    world.water.visible=Math.hypot(p.x-475,p.z)<1800
    for (const flag of world.flags) {
      if (!flag.parent?.visible) continue
      const positions = flag.geometry.attributes.position
      for (let i = 0; i < positions.count; i++) positions.setZ(i, Math.sin(now * 0.0025 + positions.getX(i) * 2 + flag.userData.phase) * 0.16 * (positions.getX(i) + 1.4) / 2.8)
      positions.needsUpdate = true
    }
    if (sound && fountainGain && audio) fountainGain.gain.setTargetAtTime(0.055 * Math.max(0, 1 - Math.hypot(p.x - 870, p.z) / 90), audio.currentTime, 0.2)
    labels.update(now)
    mapLabels.update(now,p.x,p.z,mode==='fly')
    if(now-lastShadow>33){renderer.shadowMap.needsUpdate=true;lastShadow=now}
    renderer.render(scene, camera)
    const actualSpeed = mode === 'walk' ? Math.hypot(corrected.x, corrected.z) / step : Math.hypot(velocityX, verticalVelocity, velocityZ)
    if (mode === 'walk' && grounded && actualSpeed > 0.4 && now - lastFootstep > (keys.has('shift') ? 270 : 440)) { footstep(); lastFootstep = now }
    frames++
    if (now - frameWindow >= 1000) { fps = Math.round(frames * 1000 / (now - frameWindow)); frames = 0; frameWindow = now }
    if (quality === 'auto' && now - lastQualityCheck > 4000) {
      lastQualityCheck = now
      slowWindows = fps < 55 ? slowWindows + 1 : 0
      if (slowWindows >= 2) renderer.shadowMap.enabled = false
      if (slowWindows >= 4) renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5))
    }
    if (now - lastPublish > 200) {
      lastPublish = now
      const near = [...ROUTE,...DISTRICT_PLACES].map(stop=>({stop,distance:Math.hypot(stop.position.x-p.x,stop.position.z-p.z)})).sort((a,b)=>a.distance-b.distance)[0]
      publish({ position: { x: p.x, y: p.y, z: p.z }, heading: ((-yaw * 180 / Math.PI) % 360 + 360) % 360, speed: actualSpeed, mode, nearest: near.stop.id, distance: near.distance, fps, grounded, locked: document.pointerLockElement === canvas, city: city.status(), cruising, navigation })
    }
    frameId = requestAnimationFrame(tick)
  }
  frameId = requestAnimationFrame(tick)
  return {
    setPaused:(value)=>{paused=value;clearInput();if(value){if(document.pointerLockElement===canvas)document.exitPointerLock();void audio?.suspend()}else{previous=performance.now();accumulator=0;if(sound)void audio?.resume();canvas.focus({preventScroll:true})}},
    setPlaces:labels.setPlaces,setInspectHandler:handler=>{inspectHandler=handler},clearInspection:()=>city.highlight(null),setPlaceLabels:labels.setEnabled,
    input: (key, down) => { if (down) keys.add(key); else keys.delete(key) }, setMode, travel, travelTo, setPace:(value)=>{pace=value}, toggleCruise:(enabled)=>{canvas.focus({preventScroll:true});cruising=enabled??!cruising}, setTime, setSeason, setLife:life.setEnabled, visitBlossoms:()=>{const destination={...life.bloomArrival,y:1};travelTo(destination);flyPosition.x=destination.x;flyPosition.z=destination.z;if(pendingLanding)pendingLanding=destination;yaw=Math.atan2(destination.x-life.bloomTarget.x,destination.z-life.bloomTarget.z);pitch=pendingLanding?.1:-.5}, setQuality, setSound,
    dispose: () => {
      alive = false; cancelAnimationFrame(frameId); observer.disconnect()
      if (document.pointerLockElement === canvas) document.exitPointerLock()
      window.removeEventListener('keydown', keyDown); window.removeEventListener('keyup', keyUp)
      window.removeEventListener('blur', clearInput); window.removeEventListener('focusin', focusChanged)
      document.removeEventListener('visibilitychange', clearInput); document.removeEventListener('pointerlockchange', lockChanged)
      canvas.removeEventListener('pointerdown', pointerDown); window.removeEventListener('pointermove', pointerMove)
      window.removeEventListener('pointerup', pointerUp); canvas.removeEventListener('pointercancel', pointerUp); canvas.removeEventListener('dblclick', lockMouse)
      reducedMotion.removeEventListener('change',motionChanged);life.dispose();moon.geometry.dispose();moon.material.dispose();labels.dispose(); mapLabels.dispose(); city.dispose(); world.dispose(); terrain.dispose(); sky.geometry.dispose(); sky.material.dispose(); sun.shadow.map?.dispose()
      physics.free(); renderer.dispose(); canvas.remove(); void audio?.close()
    },
  }
}
