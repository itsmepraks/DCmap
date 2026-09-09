'use client'
import Link from 'next/link'
import { useEffect,useRef,useState } from 'react'
import './survey.css'

type Pick = {id:number;height:number;estimate:number}
type Runtime = {setEstimated(value:boolean):void;setAerial(value:boolean):void;preset(value:'overview'|'street'|'north'):void;dispose():void}
export default function SurveyExplorer(){
  const host=useRef<HTMLDivElement>(null),runtime=useRef<Runtime|null>(null)
  const [ready,setReady]=useState(false),[error,setError]=useState(''),[estimated,setEstimated]=useState(false),[aerial,setAerial]=useState(true),[picked,setPicked]=useState<Pick|null>(null),[stats,setStats]=useState({count:0,mb:0,ms:0}),[sources,setSources]=useState(false),[panelOpen,setPanelOpen]=useState(true)
  useEffect(()=>{
    setPanelOpen(!window.matchMedia('(max-width:750px)').matches)
    const controller=new AbortController()
    import('./surveyRuntime').then(async({createSurveyRuntime})=>{
      if(!host.current||controller.signal.aborted)return
      const result=await createSurveyRuntime(host.current,controller.signal,setPicked)
      if(controller.signal.aborted){result.runtime.dispose();return}
      runtime.current=result.runtime;setStats(result.stats);setReady(true)
    }).catch(e=>{if(!controller.signal.aborted)setError(e instanceof Error?e.message:'Could not load the survey')})
    return()=>{controller.abort();runtime.current?.dispose();runtime.current=null}
  },[])
  return <main className="survey-shell">
    <div className="survey-canvas" ref={host}/>
    <header className="survey-header"><div className="survey-brand"><span>DC</span><div><h1>Georgetown, measured.</h1><p>Real-data neighborhood test</p></div></div><Link href="/">Back to the world</Link></header>
    <button className="survey-panel-toggle" aria-expanded={panelOpen} aria-controls="survey-details" onClick={()=>setPanelOpen(!panelOpen)}>Survey controls {panelOpen?'−':'+'}</button>
    <aside id="survey-details" className={`survey-panel ${panelOpen?'':'is-collapsed'}`}>
      <h2>{estimated?'The old height rule':'The 2024 building survey'}</h2>
      <p>{estimated?'The same building shapes, resized using our previous area-based height estimates.':'Actual DC building meshes, aligned with LiDAR terrain. No generated windows or facade decorations.'}</p>
      <div className="survey-toggle" role="group" aria-label="Compare building heights"><button disabled={!ready} aria-pressed={!estimated} onClick={()=>{setEstimated(false);runtime.current?.setEstimated(false)}}>Survey geometry</button><button disabled={!ready} aria-pressed={estimated} onClick={()=>{setEstimated(true);runtime.current?.setEstimated(true)}}>Old height rule</button></div>
      <button className="survey-texture" disabled={!ready} aria-pressed={aerial} onClick={()=>{setAerial(!aerial);runtime.current?.setAerial(!aerial)}}>{aerial?'✓ ':''}2025 aerial imagery</button>
      <p className="survey-limit">Aerial imagery covers ground and roofs. Walls are untextured; this is not street-level photogrammetry.</p>
      <div className="survey-readout">{ready?<><strong>{stats.count.toLocaleString()} buildings</strong><span>{stats.mb.toFixed(1)} MB assets · {(stats.ms/1000).toFixed(1)} s loaded</span></>:<span role="status">{error?'Unable to load the survey.':'Loading survey geometry…'}</span>}</div>
      {error&&<p role="alert">{error} <button onClick={()=>location.reload()}>Retry</button></p>}
      {picked?<div className="survey-picked"><h3>Building {picked.id}</h3><dl><dt>Survey height</dt><dd>{picked.height.toFixed(1)} m</dd><dt>Old height rule</dt><dd>{picked.estimate} m</dd></dl></div>:<p className="survey-pick-hint">Click a building to compare its height.</p>}
      <button className="survey-sources-toggle" aria-expanded={sources} onClick={()=>setSources(!sources)}>Data sources & limitations {sources?'−':'+'}</button>
      {sources&&<div className="survey-sources"><p><a href="https://catalog.data.gov/dataset/buildings-3d-scene-2024" target="_blank" rel="noreferrer">2024 building meshes</a> · DC GIS / OCTO · CC BY 4.0. Maximum-height models do not reproduce every roof feature.</p><p><a href="https://catalog.data.gov/dataset/2024-lidar-hydro-enforced-digital-terrain-model" target="_blank" rel="noreferrer">2024 terrain</a> · DC GIS / OCTO · CC0. Sampled onto a 65 × 65 grid.</p><p><a href="https://catalog.data.gov/dataset/aerial-photography-orthophoto-2025" target="_blank" rel="noreferrer">2025 aerial photography</a> · DC GIS / OCTO · CC BY 4.0. Resampled for this test. Capture dates differ.</p></div>}
    </aside>
    <div className="survey-dock"><p>Drag to orbit · Scroll to zoom · Right-drag to pan</p><div role="group" aria-label="Camera views"><button disabled={!ready} onClick={()=>runtime.current?.preset('overview')}>Neighborhood</button><button disabled={!ready} onClick={()=>runtime.current?.preset('street')}>M Street</button><button disabled={!ready} onClick={()=>runtime.current?.preset('north')}>Look north</button></div></div>
    <footer className="survey-credit">DC GIS / OCTO · Buildings & imagery <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a> · Terrain CC0 · Reprojected and resampled</footer>
  </main>
}
