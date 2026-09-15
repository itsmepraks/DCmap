import * as THREE from 'three'
import {ROUTE} from './mallRoute'
import {DISTRICT_PLACES} from './districtPlaces'
import {MUSEUMS} from '../museums/catalog'
/** A small, culled label layer; no extra Three.js geometry or frame-rate React updates. */
export function createMapLabels(host:HTMLElement,camera:THREE.Camera,heightAt:(x:number,z:number)=>number){
 const layer=document.createElement('div');layer.className='world-map-labels';layer.setAttribute('aria-hidden','true');host.appendChild(layer)
 const anchors=[...ROUTE.map(p=>({name:p.shortName,x:p.position.x,z:p.position.z,y:p.id==='washington-monument'?172:p.id==='us-capitol'?80:28})),...MUSEUMS.map(m=>({name:m.shortName,x:m.entrance.x,z:m.entrance.z,y:32})),...DISTRICT_PLACES.map(p=>({name:p.name,x:p.position.x,z:p.position.z,y:24}))]
 const items=anchors.map(anchor=>{const el=document.createElement('span');el.textContent=anchor.name;layer.appendChild(el);return{...anchor,el}})
 const point=new THREE.Vector3();let last=0
 return {update:(now:number,x:number,z:number,flying:boolean)=>{if(now-last<180)return;last=now;const w=host.clientWidth,h=host.clientHeight,used:{x:number;y:number;w:number}[]=[]
  const candidates=items.map(item=>({...item,d:Math.hypot(item.x-x,item.z-z)})).sort((a,b)=>a.d-b.d)
  for(const item of candidates){item.el.hidden=true;if(item.d<100||item.d>(flying?2600:850)||used.length>=4)continue
   point.set(item.x,heightAt(item.x,item.z)+item.y,item.z).project(camera);if(point.z<0||point.z>1)continue
   const sx=(point.x*.5+.5)*w,sy=(-point.y*.5+.5)*h,width=item.name.length*7+20
   if(sx<width/2+16||sx>w-width/2-16||sy<150||sy>h-180||used.some(p=>Math.abs(sx-p.x)<(width+p.w)/2+12&&Math.abs(sy-p.y)<36))continue
   item.el.hidden=false;item.el.style.transform=`translate(${Math.round(sx)}px,${Math.round(sy)}px) translate(-50%,-50%)`;used.push({x:sx,y:sy,w:width})
  }
 },dispose:()=>layer.remove()}
}
