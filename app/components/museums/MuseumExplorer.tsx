'use client'
import {useEffect,useRef,useState} from 'react'
import {museumComplete,passportXP,type Museum,type MuseumProgress} from '@/app/lib/museums/catalog'
import type {createMuseumRuntime,MuseumSnapshot} from '@/app/lib/museums/runtime'
import './museum.css'
type Props={museum:Museum;progress:MuseumProgress;onRecord:(id:string,solved?:boolean)=>void;onExit:()=>void}
export default function MuseumExplorer({museum,progress,onRecord,onExit}:Props){
 const host=useRef<HTMLDivElement>(null),engine=useRef<ReturnType<typeof createMuseumRuntime>|null>(null),dialog=useRef<HTMLDialogElement>(null)
 const [ready,setReady]=useState(false),[error,setError]=useState(''),[snapshot,setSnapshot]=useState<MuseumSnapshot|null>(null),[selected,setSelected]=useState<string|null>(null),[feedback,setFeedback]=useState(''),[passportOpen,setPassportOpen]=useState(false),[speaking,setSpeaking]=useState(false)
 const handlers=useRef({onRecord,onExit});handlers.current={onRecord,onExit}
 const exhibit=museum.exhibits.find(e=>e.id===selected)
 const nearest=museum.exhibits.find(e=>e.id===snapshot?.near)
 const next=museum.exhibits.find(e=>!progress.solved.includes(e.id))
 const complete=museumComplete(museum,progress)
 const inspect=(id:string)=>{if(id==='exit'){handlers.current.onExit();return}handlers.current.onRecord(id);setSelected(id);setFeedback('')}
 const inspectRef=useRef(inspect);inspectRef.current=inspect
 useEffect(()=>{let cancelled=false;import('@/app/lib/museums/runtime').then(({createMuseumRuntime})=>{if(cancelled||!host.current)return;engine.current=createMuseumRuntime(host.current,museum,setSnapshot,id=>inspectRef.current(id));setReady(true)}).catch(e=>setError(e instanceof Error?e.message:'The gallery could not start.'));return()=>{cancelled=true;engine.current?.dispose();engine.current=null;window.speechSynthesis?.cancel()}},[museum])
 useEffect(()=>{if(selected){engine.current?.setBlocked(true);dialog.current?.showModal()}else{dialog.current?.close();engine.current?.setBlocked(false);window.speechSynthesis?.cancel();setSpeaking(false)}},[selected])
 const narrate=()=>{if(!exhibit||!window.speechSynthesis)return;window.speechSynthesis.cancel();if(speaking){setSpeaking(false);return}const speech=new SpeechSynthesisUtterance(`${exhibit.name}. ${exhibit.story}`);speech.rate=.92;speech.onend=()=>setSpeaking(false);speech.onerror=()=>setSpeaking(false);window.speechSynthesis.speak(speech);setSpeaking(true)}
 return <section className="museum-explorer" aria-label={`${museum.name} interior`}>
  <div className="museum-canvas" ref={host}/>
  <header className="museum-header"><div className="museum-brand"><span className="world-brand-mark">DC</span><div><h1>{museum.shortName}</h1><p>Smithsonian · {museum.theme}</p></div></div><button onClick={onExit}>Return to DC <span aria-hidden="true">↗</span></button></header>
  <div className="museum-mission"><button className="museum-passport-toggle" aria-expanded={passportOpen} onClick={()=>setPassportOpen(!passportOpen)}><span>{complete?'Museum stamp earned':'Smithsonian passport'}</span><strong>{passportXP(progress)} XP · {museum.exhibits.filter(e=>progress.solved.includes(e.id)).length}/3</strong></button>
   {passportOpen?<div className="museum-passport"><p>Inspect each exhibit for 25 XP. Answer its discovery question for 50 XP. Complete all three to earn this museum’s stamp.</p>{museum.exhibits.map(e=><div key={e.id}><span>{progress.solved.includes(e.id)?'✓':progress.seen.includes(e.id)?'◦':'○'} {e.name}</span><button onClick={()=>{engine.current?.guide(e.id);setPassportOpen(false)}}>Guide me</button></div>)}<small>Your passport is saved on this device.</small></div>:<div className="museum-next"><span>{next?`Next: ${next.name}`:'All three discoveries complete.'}</span>{next&&<button onClick={()=>engine.current?.guide(next.id)}>Guide me</button>}</div>}
  </div>
  <div className="world-crosshair" aria-hidden="true"/>
  {snapshot?.near&&<button className="museum-interact" onClick={()=>inspect(snapshot.near!)}><kbd>E</kbd>{snapshot.near==='exit'?'Return to the Mall':`Inspect ${nearest?.name}`}<span aria-hidden="true">→</span></button>}
  <div className="museum-bottom"><span>{snapshot?.guiding?'Following the gallery path · move to take control':'WASD to walk · drag to look · Shift to hurry · Space to jump'}</span><small>Interpretive galleries & models · exhibit facts from Smithsonian sources</small></div>
  <div className="museum-floorplan" aria-label="Gallery map"><span>Gallery map <b>N</b></span><svg viewBox="-25 -29 50 49" aria-hidden="true"><path d="M-23 18V-27H23V18H5M-5 18H-23M-23-9H-20M-8-9H8M20-9H23M0-9V-27" fill="#ede3cd" stroke="#8d7c60" strokeWidth=".6"/>{museum.exhibits.map((e,i)=><g key={e.id}><circle cx={e.x} cy={e.z} r="2.7" fill={progress.solved.includes(e.id)?'#647b43':museum.color}/><text x={e.x} y={e.z+1} textAnchor="middle" fontSize="3" fill="#fff4dc">{i+1}</text></g>)}<path d="m0-2 1.5 4L0 1-1.5 2Z" fill="#d4501e" stroke="#fff4dc" strokeWidth=".5" transform={`translate(${snapshot?.x??0} ${snapshot?.z??13}) rotate(${snapshot?.heading??0})`}/></svg></div>
  <div className="museum-touch">{[['w','↑','Forward'],['a','←','Left'],['s','↓','Back'],['d','→','Right']].map(([key,label,name])=><button key={key} aria-label={`Walk ${name}`} onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);engine.current?.input(key,true)}} onPointerUp={()=>engine.current?.input(key,false)} onPointerCancel={()=>engine.current?.input(key,false)} onLostPointerCapture={()=>engine.current?.input(key,false)}>{label}</button>)}</div>
  {!ready&&<div className="museum-loading" role="status"><h2>{error?'The gallery could not open.':'Opening the gallery…'}</h2><p>{error||museum.name}</p>{error&&<button onClick={onExit}>Return to DC</button>}</div>}
  <dialog ref={dialog} aria-label={exhibit?.name??'Exhibit discovery'} className="museum-exhibit-dialog" onCancel={()=>setSelected(null)}>
   {exhibit&&<><div className="world-route-title"><h2>{exhibit.name}</h2><button aria-label="Close exhibit" onClick={()=>setSelected(null)}>×</button></div><p className="museum-gallery-name">{exhibit.gallery} · {progress.solved.includes(exhibit.id)?'Discovery complete':'Exhibit discovered · 25 XP'}</p><p>{exhibit.story}</p><div className="museum-source"><button onClick={narrate}>{speaking?'Stop narration':'Listen to story'}</button><a href={exhibit.source} target="_blank" rel="noreferrer">Smithsonian source ↗</a></div>
   <fieldset><legend>{exhibit.question}</legend>{exhibit.choices.map((choice,i)=><button key={choice} disabled={progress.solved.includes(exhibit.id)} className={progress.solved.includes(exhibit.id)&&i===exhibit.answer?'is-correct':''} onClick={()=>{if(i===exhibit.answer){onRecord(exhibit.id,true);setFeedback('Correct — 50 XP earned.')}else setFeedback('Not quite. Look back at the exhibit story and try again.')}}>{choice}</button>)}</fieldset><p role="status" className="museum-feedback">{feedback||(progress.solved.includes(exhibit.id)?'Challenge complete. Your passport keeps this discovery.':'Read the story, then make your discovery.')}</p>{complete&&<div className="museum-stamp">✓ {museum.shortName} stamp earned</div>}<button className="world-travel" onClick={()=>setSelected(null)}>Continue exploring →</button></>}
  </dialog>
 </section>
}
