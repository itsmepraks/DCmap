'use client'

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { MUSEUMS, MUSEUM_SAVE_KEY, normalizeProgress, recordDiscovery, passportXP, museumComplete, type Museum, type MuseumProgress } from '@/app/lib/museums/catalog'
import '../museums/museum.css'
const MuseumExplorer=dynamic(()=>import('../museums/MuseumExplorer'),{ssr:false})
import { mapDestination } from '@/app/lib/world/travelControls'
import { DISTRICT_PLACES } from '@/app/lib/world/districtPlaces'
import { ROUTE } from '@/app/lib/world/mallRoute'
import type { WorldRuntime, WorldSnapshot } from '@/app/lib/world/runtime'
import { loadGameProgress, visitLandmark } from '@/app/lib/gameState'
import { TIMES, SEASONS, type WorldTime, type WorldSeason } from '@/app/lib/world/atmosphere'
import { minecraftTheme } from '@/app/lib/theme'
import './world.css'

function Icon({ name }: { name: 'walk' | 'fly' | 'sun' | 'sound' | 'map' | 'arrow' | 'close' }) {
  const paths = {
    walk: <><circle cx="13" cy="4" r="2" /><path d="m7 12 3-5 4 2 3 4h3M10 8l-1 7-4 6m4-6 5 1 2 5" /></>,
    fly: <path d="m3 11 7-1 1-7 3 7 7 3-7 1-1 7-3-7-7-3Z" />,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M19 5l-1.5 1.5m-11 11L5 19" /></>,
    sound: <><path d="M4 9h4l5-4v14l-5-4H4V9Zm12-1c3 2 3 6 0 8m3-11c5 4 5 10 0 14" /></>,
    map: <path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Zm6-2v16m6-14v16" />,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
  }
  return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

export default function WorldExplorer() {
  const host = useRef<HTMLDivElement>(null)
  const engine = useRef<WorldRuntime | null>(null)
  const worldVisited = useRef(new Set<string>())
  const audio = useRef<HTMLAudioElement>(null)
  const progress = useRef<ReturnType<typeof loadGameProgress> | null>(null)
  const [mapOpen,setMapOpen]=useState(false)
  const [pace,setPace]=useState(1)
  const travelMap=useRef<HTMLDialogElement>(null)
  const [mapCursor,setMapCursor]=useState({u:0.4,v:0.55})
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [snapshot, setSnapshot] = useState<WorldSnapshot | null>(null)
  const [visited, setVisited] = useState<string[]>([])
  const [districtOpen,setDistrictOpen]=useState(false)
  const [museumsOpen,setMuseumsOpen]=useState(false)
  const [activeMuseum,setActiveMuseum]=useState<Museum|null>(null)
  const [museumProgress,setMuseumProgress]=useState<MuseumProgress>({seen:[],solved:[]})
  const [placeQuery,setPlaceQuery]=useState('')
  const allPlaces=[...ROUTE,...DISTRICT_PLACES]
  const [selected, setSelected] = useState(ROUTE[0].id)
  const [panel, setPanel] = useState<'journal' | 'atmosphere' | 'movement' | null>(null)
  const routeOpen = panel === 'journal'
  const atmosphereOpen = panel === 'atmosphere'
  const closePanel = () => {
    setPanel(null)
    document.querySelector<HTMLButtonElement>(`[data-panel-trigger="${panel}"]`)?.focus()
  }
  const setRouteOpen = (open: boolean) => open ? setPanel('journal') : closePanel()
  const setAtmosphereOpen = (open: boolean) => open ? setPanel('atmosphere') : closePanel()
  const [time, setTime] = useState<WorldTime>('day')
  const [season,setSeason]=useState<WorldSeason>('summer')
  const [lifeEnabled,setLifeEnabled]=useState(true)
  const [sound, setSound] = useState(false)
  const [quality, setQuality] = useState<'auto' | 'high' | 'low'>('auto')
  const [toast, setToast] = useState('')
  const [tourPlaying, setTourPlaying] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const help = useRef<HTMLDialogElement>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout>>()
  const notify = useCallback((message: string) => {
    setToast(message); clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 4000)
  }, [])
  const onSnapshot = useCallback((state: WorldSnapshot) => {
    setSnapshot(state)
    const place=[...ROUTE,...DISTRICT_PLACES].find(stop=>stop.id===state.nearest)
    if (!place) return
    const radius=DISTRICT_PLACES.some(stop=>stop.id===state.nearest)?120:45
    if (state.mode !== 'walk' || state.distance > radius || !state.grounded || !progress.current) return
    if (!worldVisited.current.has(state.nearest)) {
      worldVisited.current.add(state.nearest)
      if (state.nearest === 'lincoln-memorial' || state.nearest === 'washington-monument' || state.nearest === 'us-capitol') progress.current = visitLandmark(state.nearest, progress.current)
      setVisited([...worldVisited.current])
      try { localStorage.setItem('dc-world-route-progress', JSON.stringify([...worldVisited.current])) } catch {}
      notify(`Discovered ${place.name}`)
    }
  }, [notify])
  useEffect(() => {
    try {
      progress.current = loadGameProgress()
      const stored: unknown = JSON.parse(localStorage.getItem('dc-world-route-progress') || '[]')
      worldVisited.current = new Set(Array.isArray(stored) ? stored.filter(id => [...ROUTE,...DISTRICT_PLACES].some(stop => stop.id === id)) : [])
      for (const id of ['lincoln-memorial', 'washington-monument', 'us-capitol']) if (progress.current.visitedLandmarks.has(id)) worldVisited.current.add(id)
    } catch { progress.current = { visitedLandmarks: new Set(), visitedLandmarksWithTime: [], timestamp: Date.now() } }
    setVisited([...worldVisited.current])
    const cancellation = new AbortController()
    import('@/app/lib/world/runtime').then(async ({ createWorldRuntime }) => {
      if (cancellation.signal.aborted || !host.current) return
      const runtime = await createWorldRuntime(host.current, onSnapshot, cancellation.signal)
      if (cancellation.signal.aborted) { runtime.dispose(); return }
      engine.current = runtime; setReady(true)
    }).catch(cause => { if (!cancellation.signal.aborted) setError(cause instanceof Error ? cause.message : 'The 3D renderer could not start.') })
    return () => { cancellation.abort(); engine.current?.dispose(); engine.current = null; clearTimeout(toastTimer.current) }
  }, [onSnapshot])
  useEffect(()=>{try{setMuseumProgress(normalizeProgress(JSON.parse(localStorage.getItem(MUSEUM_SAVE_KEY)||'null')))}catch{}},[])
  const saveMuseumDiscovery=(id:string,solved=false)=>{
    setMuseumProgress(current=>{const next=recordDiscovery(current,id,solved);try{localStorage.setItem(MUSEUM_SAVE_KEY,JSON.stringify(next))}catch{}return next})
  }
  const enterMuseum=(museum:Museum,travelFirst=false)=>{
    if(!engine.current)return
    if(travelFirst)engine.current.travelTo(museum.entrance)
    audio.current?.pause();setTourPlaying(false);setPanel(null);setMapOpen(false);setHelpOpen(false)
    engine.current.setPaused(true);setActiveMuseum(museum)
  }
  const leaveMuseum=()=>{setActiveMuseum(null);engine.current?.setPaused(false)}
  useEffect(() => {
    if (helpOpen) { setPanel(null); help.current?.showModal() }
    else help.current?.close()
  }, [helpOpen])
  useEffect(()=>{
    if(mapOpen){setPanel(null);travelMap.current?.showModal()}else travelMap.current?.close()
  },[mapOpen])
  useEffect(()=>{
    const shortcut=(event:KeyboardEvent)=>{
      if(activeMuseum)return
      if(event.key==='Escape'){setPanel(null);document.querySelector<HTMLButtonElement>(`[data-panel-trigger="${panel}"]`)?.focus()}
      if(event.key.toLowerCase()==='m'&&!event.ctrlKey&&!event.metaKey&&!(event.target as HTMLElement)?.closest('input,textarea,select,dialog')) {event.preventDefault();setMapOpen(value=>!value)}
    }
    window.addEventListener('keydown',shortcut);return()=>window.removeEventListener('keydown',shortcut)
  },[panel,activeMuseum])
  useEffect(()=>{
    if(panel) document.querySelector<HTMLElement>('[data-world-panel] button')?.focus()
  },[panel])
  const goAnywhere=(u:number,v:number)=>{
    engine.current?.travelTo(mapDestination(u,v));setMapOpen(false);setRouteOpen(false)
    audio.current?.pause();setTourPlaying(false);notify('Moved to your chosen location.')
  }
  const stop = allPlaces.find(item => item.id === selected) ?? ROUTE[0]
  const mode = snapshot?.mode ?? 'walk'
  const discoveredCount = ROUTE.filter(item => visited.includes(item.id)).length
  const neighborhoodCount = DISTRICT_PLACES.filter(item => visited.includes(item.id)).length
  const nextDiscovery = ROUTE.filter(item => !visited.includes(item.id)).map(item => ({
    ...item, distance: Math.hypot(item.position.x - (snapshot?.position.x ?? 80), item.position.z - (snapshot?.position.z ?? 34)),
  })).sort((a, b) => a.distance - b.distance)[0]
  const heading = Math.round(snapshot?.heading ?? 0)
  const cardinal = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(((heading % 360 + 360) % 360) / 45) % 8]
  const nearbyMuseum = MUSEUMS.find(m=>snapshot&&Math.hypot(m.entrance.x-snapshot.position.x,m.entrance.z-snapshot.position.z)<140)
  const radarSpan = mode === 'fly' ? 2200 : 900
  const radarX = snapshot?.position.x ?? 80
  const radarZ = snapshot?.position.z ?? 34
  const radarScale = mode === 'fly' ? 500 : 200
  const changePace = (value: number) => { setPace(value); engine.current?.setPace(value) }
  const travel = (id: string) => {
    engine.current?.travel(id); setSelected(id); setRouteOpen(false)
    audio.current?.pause(); setTourPlaying(false)
    notify(`Traveling to ${allPlaces.find(item => item.id === id)?.name}`)
  }
  const toggleTour = async () => {
    if (!audio.current || !stop.audio) return
    if (tourPlaying) { audio.current.pause(); setTourPlaying(false); return }
    try { await audio.current.play(); setTourPlaying(true) }
    catch { notify('Audio is unavailable. You can still read the route guide.') }
  }
  const setInput = (key: string, down: boolean) => engine.current?.input(key, down)

  return (
    <main className={`world-shell ${panel ? 'has-world-panel' : ''}`} style={{ '--paper': minecraftTheme.colors.beige.base, '--ink': minecraftTheme.colors.text.primary, '--muted': minecraftTheme.colors.text.secondary, '--edge': minecraftTheme.colors.terracotta.base, '--edge-dark': minecraftTheme.colors.terracotta.dark } as CSSProperties}>
      <div className="world-outdoor" aria-hidden={!!activeMuseum}>
      <div ref={host} className="world-canvas" />
      <header className="world-header">
        <div className="world-brand"><span className="world-brand-mark" aria-hidden="true">DC</span><div><h1>Washington, D.C.</h1><p title="The whole District · A world to wander">{ready ? allPlaces.find(item => item.id === snapshot?.nearest)?.name ?? 'A world to wander' : 'A world to wander'}</p></div></div>
        <div className="world-header-actions"><button onClick={()=>setMapOpen(true)} aria-label="Travel anywhere on the map" className="world-map-link"><Icon name="map" /><span>Go anywhere · M</span></button></div>
      </header>

      {ready && <>
        <button className="world-route-toggle" data-panel-trigger="journal" onClick={() => setRouteOpen(!routeOpen)} aria-expanded={routeOpen} aria-controls="world-route"><Icon name="map" />Explorer journal <span>{discoveredCount} / {ROUTE.length}</span></button>
        {routeOpen && <aside id="world-route" className="world-route" data-world-controls data-world-panel>
          <div className="world-route-title"><h2>Explorer journal</h2><button aria-label="Close route guide" onClick={() => setRouteOpen(false)}><Icon name="close" /></button></div>
          {!museumsOpen&&<section className="world-quest" aria-label="Discovery progress">
          <div className="world-quest-heading"><Icon name="map" /><h2>Mall discoveries</h2><strong>{discoveredCount}<span> / {ROUTE.length}</span></strong></div>
          <div className="world-discovery-slots" aria-label={`${discoveredCount} of ${ROUTE.length} landmarks discovered`}>
            {ROUTE.map((item, index) => <button key={item.id} className={visited.includes(item.id) ? 'is-discovered' : ''} aria-label={`${item.name}: ${visited.includes(item.id) ? 'discovered' : 'not discovered'}. Open in journal.`} title={item.name} onClick={() => { setSelected(item.id); setDistrictOpen(false); setRouteOpen(true) }}>{visited.includes(item.id) ? '✓' : index + 1}</button>)}
          </div>
          {nextDiscovery ? <><p className="world-quest-target">{nextDiscovery.name}</p><p className="world-quest-distance">{nextDiscovery.distance >= 1000 ? `${(nextDiscovery.distance / 1000).toFixed(1)} km` : `${Math.round(nextDiscovery.distance)} m`} away · Discover on foot</p><button className="world-quest-travel" onClick={() => travel(nextDiscovery.id)}>Go to next discovery <Icon name="arrow" /></button></> : <><p className="world-quest-target">The Mall, explored.</p><button className="world-quest-travel" onClick={() => { setDistrictOpen(true); setRouteOpen(true) }}>Explore the neighborhoods <Icon name="arrow" /></button></>}

        </section>}
          <div className="world-place-tabs" role="group" aria-label="Choose destinations"><button aria-pressed={!districtOpen&&!museumsOpen} onClick={()=>{setDistrictOpen(false);setMuseumsOpen(false)}}>The Mall · {discoveredCount}/{ROUTE.length}</button><button aria-pressed={districtOpen&&!museumsOpen} onClick={()=>{setDistrictOpen(true);setMuseumsOpen(false)}}>Neighborhoods · {neighborhoodCount}/{DISTRICT_PLACES.length}</button><button aria-pressed={museumsOpen} onClick={()=>setMuseumsOpen(true)}>Museums</button></div>
          {museumsOpen?<div className="world-museum-list"><p className="world-route-intro">Your Smithsonian passport · {passportXP(museumProgress)} XP<br/>Walk inside, inspect exhibits, and earn a stamp at each museum.</p>{MUSEUMS.map(m=><article key={m.id}><h3>{m.shortName} {museumComplete(m,museumProgress)?'✓':''}</h3><p>{m.theme}<br/>{m.exhibits.filter(e=>museumProgress.solved.includes(e.id)).length}/3 discoveries complete</p><div><button className="world-travel" onClick={()=>enterMuseum(m,true)}>Enter museum →</button><button className="world-listen" onClick={()=>{engine.current?.travelTo(m.entrance);setRouteOpen(false);notify(`Traveling to ${m.name}`)}}>Go outside</button></div></article>)}<p className="world-route-note">Three interpretive galleries with Smithsonian-sourced exhibit stories. Layouts and models are recreations, not exact interior scans.</p></div>:<>
          {districtOpen && <label className="world-place-search">Find a neighborhood<input value={placeQuery} onChange={event=>setPlaceQuery(event.target.value)} placeholder="Georgetown, Anacostia…" /></label>}
          <p className="world-route-intro">{districtOpen?'Choose a neighborhood, or use the travel map to go anywhere. Your movement mode is preserved.':'Lincoln to the Capitol. Take the paths, or take to the sky.'}</p>
          {districtOpen && !DISTRICT_PLACES.some(place=>place.name.toLowerCase().includes(placeQuery.toLowerCase())) && <p className="world-route-intro">No matching neighborhoods. Try another name.</p>}
          <nav aria-label="Places on the route" className="world-stops">
            {(districtOpen?DISTRICT_PLACES.filter(place=>place.name.toLowerCase().includes(placeQuery.toLowerCase())):ROUTE).map((item, index) => <button key={item.id} aria-pressed={selected === item.id} onClick={() => { setSelected(item.id); audio.current?.pause(); setTourPlaying(false) }}>
              <span className={visited.includes(item.id) ? 'world-stop-number is-visited' : 'world-stop-number'}>{visited.includes(item.id) ? '✓' : index + 1}</span>
              <span>{item.name}<small>{districtOpen?(visited.includes(item.id)?'Discovered on foot':'Explore neighborhood'):index === 0 ? 'Marble & memory' : index === 1 ? 'Water & shade' : index === 2 ? 'A circle of remembrance' : index === 3 ? 'The city from above' : index === 4 ? 'Museums along the green' : 'The east end of the Mall'}</small></span>
              <span className="world-stop-arrow">›</span>
            </button>)}
          </nav>
          <div className="world-stop-detail"><p>{stop.description}</p><div><button className="world-travel" onClick={() => travel(stop.id)}>Travel here <Icon name="arrow" /></button>{stop.audio && <button className="world-listen" onClick={toggleTour}>{tourPlaying ? 'Pause story' : 'Listen'}</button>}</div></div>
          <p className="world-route-note">District-wide geography · illustrative architecture</p></>}
        </aside>}

        <button className="world-movement-toggle" data-panel-trigger="movement" aria-expanded={panel==='movement'} aria-controls="world-movement" aria-label="Movement speed and compass" onClick={()=>setPanel(panel==='movement'?null:'movement')}>
          <Icon name={mode==='fly'?'fly':'walk'} /><span>{snapshot?.cruising ? 'Cruising' : mode==='fly'?'Flying':'Walking'}</span><strong>{Math.round((snapshot?.speed??0)*3.6)} <small>km/h</small></strong><span>{cardinal}</span><span aria-hidden="true">⌄</span>
        </button>
        {panel==='movement' && <aside id="world-movement" data-world-controls data-world-panel className={`world-telemetry ${mode === 'fly' ? 'is-flying' : ''}`} aria-label="Movement instruments">
          <div className="world-route-title"><h2>Make your own pace.</h2><button aria-label="Close movement settings" onClick={closePanel}><Icon name="close" /></button></div>
          <div className="world-telemetry-title"><Icon name={mode === 'fly' ? 'fly' : 'walk'} /><strong>{mode === 'fly' ? 'Free flight' : 'On foot'}</strong><span>{snapshot?.cruising ? 'Cruise' : 'Manual'}</span></div>
          <div className="world-instruments"><div><strong>{Math.round((snapshot?.speed ?? 0) * 3.6)}<small>km/h</small></strong><span>{mode === 'fly' ? `${Math.max(0, Math.round(snapshot?.position.y ?? 0))} m altitude` : snapshot?.grounded ? 'On the ground' : 'In the air'}</span></div><div className="world-compass" aria-label={`Heading ${heading} degrees ${cardinal}`}><span>{cardinal} · {heading}°</span><svg width="46" height="46" viewBox="0 0 52 52" aria-hidden="true" style={{ transform: `rotate(${-heading}deg)` }}><circle cx="26" cy="26" r="23" fill="none" stroke="currentColor" strokeOpacity=".2" /><path d="m26 8-6 22 6-4 6 4Z" fill="#b55432" /><path d="m26 44-6-14 6 4 6-4Z" fill="#7e8d74" /></svg></div></div>
          <div className="world-pace-controls"><button aria-label="Decrease movement speed" disabled={pace <= 0.5} onClick={() => changePace(Math.max(0.5, pace - 0.5))}>−</button><span>Travel speed <strong>{pace}×</strong></span><button aria-label="Increase movement speed" disabled={pace >= 3} onClick={() => changePace(Math.min(3, pace + 0.5))}>+</button></div>
          <p className="world-movement-note">Use Shift to sprint or boost. Cruise keeps you moving; drag to steer.</p>
        </aside>}

        {nearbyMuseum&&!panel&&<button className="world-museum-entry" onClick={()=>enterMuseum(nearbyMuseum)}>Enter {nearbyMuseum.shortName} →<small>Smithsonian · explore exhibits & earn discoveries</small></button>}
        {snapshot?.navigation && <div className="world-navigation" role="status">{snapshot.navigation}</div>}
        {snapshot && !snapshot.navigation && snapshot.city.loading > 0 && <div className="world-streaming" role="status">{snapshot.city.failed ? 'Some city blocks are unavailable. Retrying…' : 'Preparing nearby city blocks…'}</div>}
        <div className="world-crosshair" aria-hidden="true" />
        <div className="world-bottom">
          <div className="world-controls-hint">{mode === 'walk' ? <><kbd>W A S D</kbd> walk <span>·</span><kbd>Shift</kbd> sprint <span>·</span><kbd>Space</kbd> jump</> : <><kbd>W A S D</kbd> fly <span>·</span><kbd>E / Q</kbd> rise / descend <span>·</span><kbd>Shift</kbd> boost</>}<span className="world-look-hint"> · Drag to look · R cruise · M map</span></div>
          <div className="world-control-dock" role="group" aria-label="World controls">
            <button className={mode === 'walk' ? 'is-active' : ''} aria-pressed={mode === 'walk'} onClick={() => engine.current?.setMode('walk')}><Icon name="walk" /><span>Walk</span></button>
            <button className={mode === 'fly' ? 'is-active' : ''} aria-pressed={mode === 'fly'} onClick={() => engine.current?.setMode('fly')}><Icon name="fly" /><span>Fly</span></button>
            <button aria-pressed={snapshot?.cruising??false} className={snapshot?.cruising?'is-active':''} onClick={()=>engine.current?.toggleCruise(!snapshot?.cruising)}><Icon name="arrow" /><span>{snapshot?.cruising?'Stop':'Cruise'}</span></button>
            <div className="world-dock-divider" />
            <button onClick={() => setAtmosphereOpen(!atmosphereOpen)} data-panel-trigger="atmosphere" aria-expanded={atmosphereOpen} aria-controls="world-atmosphere" aria-label="Choose time of day and season" title={`${TIMES.find(item=>item.id===time)?.name} · ${SEASONS.find(item=>item.id===season)?.name}`}><Icon name="sun" /><span>Scene</span></button>
            <button aria-pressed={sound} onClick={() => { setSound(!sound); engine.current?.setSound(!sound) }}><Icon name="sound" /><span>Sound {sound ? 'on' : 'off'}</span></button>
            <button onClick={() => setHelpOpen(true)} className="world-help-button" aria-label="Open controls and quality settings">?</button>
          </div>
        </div>
        {atmosphereOpen && <section id="world-atmosphere" className="world-atmosphere" aria-label="Time of day and seasons" data-world-controls data-world-panel>
          <div className="world-route-title"><h2>Set the scene.</h2><button aria-label="Close time and seasons" onClick={()=>setAtmosphereOpen(false)}><Icon name="close" /></button></div>
          <h3>Time of day</h3><div className="world-atmosphere-options" role="group" aria-label="Time of day">{TIMES.map(item=><button key={item.id} aria-pressed={time===item.id} onClick={()=>{setTime(item.id);engine.current?.setTime(item.id)}}>{item.name}</button>)}</div>
          <h3>Season</h3><div className="world-atmosphere-options" role="group" aria-label="Season">{SEASONS.map(item=><button key={item.id} aria-pressed={season===item.id} onClick={()=>{setSeason(item.id);engine.current?.setSeason(item.id)}}>{item.name}</button>)}</div>
          <p>{SEASONS.find(item=>item.id===season)?.description}</p>
          {season==='blossom'&&<button className="world-travel" onClick={()=>{engine.current?.visitBlossoms();setAtmosphereOpen(false)}}>Explore the blossoms <Icon name="arrow" /></button>}
          <label className="world-life-toggle"><input type="checkbox" checked={lifeEnabled} onChange={event=>{setLifeEnabled(event.target.checked);engine.current?.setLife(event.target.checked)}} />Pedestrians & cyclists on the Mall</label>
          <small>Seasonal scenes, not live weather. Cherry plantings and tree species are illustrative.</small>
        </section>}
        <button className="world-minimap world-radar" onClick={()=>setMapOpen(true)} aria-label="Nearby area. Open the full DC travel map" title="Open the full travel map · M">
          <span className="world-radar-heading"><span>Nearby</span><Icon name="map" /></span>
          <span className="world-radar-view">
            <svg viewBox={`${radarX-radarSpan/2} ${radarZ-radarSpan/2} ${radarSpan} ${radarSpan}`} aria-hidden="true">
              <image href="/world/overview.svg" x="-6200" y="-12000" width="18600" height="21800" />
              {MUSEUMS.filter(m=>Math.abs(m.entrance.x-radarX)<radarSpan*.46&&Math.abs(m.entrance.z-radarZ)<radarSpan*.46).map(m=><rect key={m.id} x={m.entrance.x-radarSpan*.018} y={m.entrance.z-radarSpan*.018} width={radarSpan*.036} height={radarSpan*.036} fill="#496d88" stroke="#fff4dc" strokeWidth={radarSpan*.006}/>)}
              {allPlaces.filter(place=>Math.abs(place.position.x-radarX)<radarSpan*.46&&Math.abs(place.position.z-radarZ)<radarSpan*.46).map(place=><circle key={place.id} cx={place.position.x} cy={place.position.z} r={radarSpan*.018} fill={visited.includes(place.id)?'#647b43':'#8c694a'} stroke="#fff4dc" strokeWidth={radarSpan*.007} />)}
            </svg>
            <span className="world-radar-north">N</span>
            <svg className="world-radar-player" viewBox="0 0 24 24" aria-hidden="true" style={{transform:`translate(-50%,-50%) rotate(${heading}deg)`}}><path d="m12 3 7 17-7-4-7 4Z" fill="#D4501E" stroke="#fff7e7" strokeWidth="2" strokeLinejoin="round" /></svg>
            <span className="world-radar-scale" style={{width:`${radarScale/radarSpan*100}%`}}>{radarScale} m</span>
          </span>
        </button>
        <div className="world-touch-pad" aria-label="Touch movement controls">{[['w', '↑'], ['a', '←'], ['s', '↓'], ['d', '→'], ['shift','⚡']].map(([key, label]) => <button key={key} aria-label={{ w: 'Move forward', a: 'Move left', s: 'Move backward', d: 'Move right', shift:'Sprint or boost' }[key]} onPointerDown={event => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); setInput(key, true) }} onPointerUp={() => setInput(key, false)} onPointerCancel={() => setInput(key, false)} onLostPointerCapture={() => setInput(key, false)}>{label}</button>)}</div>
        <div className="world-touch-height">{[[mode === 'walk' ? ' ' : 'e', mode === 'walk' ? 'Jump' : 'Rise'], ['q', 'Down']].filter(([key]) => mode === 'fly' || key !== 'q').map(([key, label]) => <button key={key} onPointerDown={event => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); setInput(key, true) }} onPointerUp={() => setInput(key, false)} onPointerCancel={() => setInput(key, false)} onLostPointerCapture={() => setInput(key, false)}>{label}</button>)}</div>
      </>}
      {!ready && <div className="world-loading" role="status"><div className="world-loading-mark">DC</div><h2>{error ? 'The world could not open.' : 'A little closer to the city.'}</h2><p>{error ? 'Your browser may not support WebGL 2, or the world could not finish loading.' : 'Preparing the Mall, its paths, and its monuments…'}</p>{error ? <div><button onClick={() => window.location.reload()}>Try again</button><Link href="/map">Open city map</Link><details><summary>Technical details</summary>{error}</details></div> : <span className="world-loading-line" />}</div>}
      <div className="world-toast" role="status" aria-live="polite">{toast}</div>
      <audio ref={audio} src={stop.audio} preload="none" onEnded={() => setTourPlaying(false)} onError={() => { if (tourPlaying) notify('This story could not be loaded.'); setTourPlaying(false) }} />
      <dialog ref={travelMap} className="world-travel-map" onCancel={()=>setMapOpen(false)}>
        <div className="world-route-title"><h2>Where do you want to go?</h2><button aria-label="Close travel map" onClick={()=>setMapOpen(false)}><Icon name="close" /></button></div>
        <p>Click anywhere to travel. {mode==='walk'?'We’ll find clear ground nearby.':'You’ll arrive in flight.'} Arrow keys move the marker; Enter travels.</p>
        <svg preserveAspectRatio="none" viewBox="0 0 620 640" tabIndex={0} role="button" aria-label="Choose any destination on the DC map" onClick={event=>{const r=event.currentTarget.getBoundingClientRect();goAnywhere((event.clientX-r.left)/r.width,(event.clientY-r.top)/r.height)}} onKeyDown={event=>{
          const d=event.shiftKey?0.1:0.02
          if(event.key==='Enter'||event.key===' '){event.preventDefault();goAnywhere(mapCursor.u,mapCursor.v)}
          else if(event.key.startsWith('Arrow')){event.preventDefault();setMapCursor(p=>({u:Math.max(0,Math.min(1,p.u+(event.key==='ArrowRight'?d:event.key==='ArrowLeft'?-d:0))),v:Math.max(0,Math.min(1,p.v+(event.key==='ArrowDown'?d:event.key==='ArrowUp'?-d:0)))}))}
        }}>
          <image href="/world/overview.svg" width="620" height="640" preserveAspectRatio="none" />
          {MUSEUMS.map(m=><g key={m.id}><rect x={(m.entrance.x+6200)/18600*620-3} y={(m.entrance.z+12000)/21800*640-3} width="6" height="6" fill="#496d88"/><text x={(m.entrance.x+6200)/18600*620+6} y={(m.entrance.z+12000)/21800*640-7} fontSize="8" fill="#334b60">{m.shortName}</text></g>)}
          {allPlaces.map(place=><g key={place.id}><circle cx={(place.arrival.x+6200)/18600*620} cy={(place.arrival.z+12000)/21800*640} r="3" fill="#5D4037"/><text x={(place.arrival.x+6200)/18600*620+6} y={(place.arrival.z+12000)/21800*640} fontSize="9" fill="#33251b">{place.shortName}</text></g>)}
          <circle cx={((snapshot?.position.x??80)+6200)/18600*620} cy={((snapshot?.position.z??34)+12000)/21800*640} r="6" fill="#D4501E" stroke="white" strokeWidth="2" />
          <circle className="world-keyboard-marker" cx={mapCursor.u*620} cy={mapCursor.v*640} r="9" fill="none" stroke="#335e77" strokeWidth="3" />
        </svg>
      </dialog>
      <dialog ref={help} className="world-help" onCancel={() => setHelpOpen(false)} onClick={event => { if (event.target === event.currentTarget) setHelpOpen(false) }}>
        <div className="world-route-title"><h2>Make yourself at home.</h2><button aria-label="Close controls" onClick={() => setHelpOpen(false)}><Icon name="close" /></button></div>
        <p>Walk with WASD or the arrow keys. Drag to look around. Open the sun control for five times of day and five seasonal scenes. Double-click the world to lock the mouse; Escape releases it.</p>
        <dl><dt>Shift</dt><dd>Sprint, or boost flight</dd><dt>R</dt><dd>Toggle hands-free cruise</dd><dt>M</dt><dd>Open the travel map</dd><dt>Space</dt><dd>Jump when walking; rise when flying</dd><dt>F</dt><dd>Switch between walking and flying</dd><dt>E / Q</dt><dd>Rise / descend in flight</dd></dl>
        <label htmlFor="world-pace">Movement speed · {pace}×</label><input id="world-pace" type="range" min="0.5" max="3" step="0.5" value={pace} onChange={event=>{changePace(Number(event.target.value))}} />
        <label htmlFor="world-quality">Visual detail</label><select id="world-quality" value={quality} onChange={event => { const next = event.target.value as typeof quality; setQuality(next); engine.current?.setQuality(next) }}><option value="auto">Auto — adapt to this device</option><option value="high">High — sharper shadows and edges</option><option value="low">Low — prioritize smooth movement</option></select>
        <p className="world-performance">{snapshot?.fps ?? '—'} FPS · {snapshot?.city.loaded ?? 0} neighborhood tiles · {snapshot?.grounded ? 'Grounded' : mode === 'fly' ? 'Free flight' : 'In the air'}</p>
        <p>District-wide buildings, streets, water and parks use official DC GIS data. Detailed blocks load around you; distant buildings stay visible. Street edges, sidewalks, intersections and crossing extents use DC’s 2021 mapped polygons. Matched buildings use DC’s 2024 measured maximum heights. Hills use the 2024 terrain model, resampled for smooth play with a blended, authored Mall. Unmatched heights, facade details and stripe spacing remain illustrative. Travel preserves your movement mode. Walking arrivals find clear ground nearby; water-only destinations remain in flight. The City map opens the original explorer.</p>
        <p><Link href="/map">Open the original city map</Link></p>
        <p><a href="https://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_DATA/Facility_and_Structure_WebMercator/MapServer/1" target="_blank" rel="noreferrer">Building footprints: DC GIS / OCTO</a> · <a href="https://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_DATA/Planimetrics_2021/MapServer" target="_blank" rel="noreferrer">Street surfaces: DC GIS, 2021</a> · <a href="https://catalog.data.gov/dataset/buildings-3d-scene-2024" target="_blank" rel="noreferrer">Heights: DC GIS / OCTO, 2024 (CC BY 4.0)</a> · <a href="https://catalog.data.gov/dataset/2024-lidar-hydro-enforced-digital-terrain-model" target="_blank" rel="noreferrer">Terrain: DC GIS / OCTO, 2024 (CC0)</a> · Centerlines: DDOT</p>
        <button className="world-travel" onClick={() => setHelpOpen(false)}>Back to the world <Icon name="arrow" /></button>
      </dialog>
      </div>
      {activeMuseum&&<MuseumExplorer key={activeMuseum.id} museum={activeMuseum} progress={museumProgress} onRecord={saveMuseumDiscovery} onExit={leaveMuseum}/>}
    </main>
  )
}
