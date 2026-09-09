import * as THREE from 'three'
import type {WorldPlace} from './places'
import type {WorldBuilding} from './cityStreaming'
import type {GroundHeight} from './terrain'

/** A small reusable DOM label pool; transforms update with the camera, outside React. */
export function createPlaceLabels(container:HTMLElement,camera:THREE.Camera,heightAt:GroundHeight,buildingAt:(x:number,z:number)=>WorldBuilding|null,select:(id:string)=>void,visible:(target:THREE.Vector3)=>boolean){
  const root=document.createElement('div');root.className='world-place-labels';root.setAttribute('aria-label','Nearby places in the world');container.appendChild(root)
  const pool=Array.from({length:8},()=>{
    const button=document.createElement('button');button.className='world-place-label';button.hidden=true
    const name=document.createElement('span'),distance=document.createElement('small');button.append(name,distance);root.appendChild(button)
    button.addEventListener('click',event=>{event.stopPropagation();if(button.dataset.place)select(button.dataset.place)})
    return {button,name,distance}
  })
  let cells=new Map<string,WorldPlace[]>(),candidates:{place:WorldPlace;anchor:THREE.Vector3;clear:boolean}[]=[],lastQuery=0,lastSight=0,enabled=true
  const projected=new THREE.Vector3(),position=new THREE.Vector3()
  return {
    setPlaces:(places:WorldPlace[])=>{cells=new Map();for(const place of places){const key=`${Math.floor(place.x/512)}_${Math.floor(place.z/512)}`,list=cells.get(key)??[];list.push(place);cells.set(key,list)}lastQuery=0},
    setEnabled:(value:boolean)=>{enabled=value;root.hidden=!value},
    update:(now:number)=>{
      if(!enabled)return
      camera.getWorldPosition(position)
      if(now-lastQuery>650||lastQuery===0){
        const nearby:WorldPlace[]=[]
        for(let x=-1;x<=1;x++)for(let z=-1;z<=1;z++)nearby.push(...cells.get(`${Math.floor(position.x/512)+x}_${Math.floor(position.z/512)+z}`)??[])
        candidates=nearby.map(place=>({place,distance:Math.hypot(place.x-position.x,place.z-position.z)})).filter(p=>p.distance<700).sort((a,b)=>a.distance-b.distance).slice(0,32).map(({place})=>{
          const building=buildingAt(place.x,place.z)
          return {place,anchor:new THREE.Vector3(place.x,building?building.base+building.height+3:heightAt(place.x,place.z)+4,place.z),clear:true}
        });lastQuery=now;lastSight=0
      }
      if(now-lastSight>250||lastSight===0){for(const candidate of candidates)candidate.clear=visible(candidate.anchor);lastSight=now}
      const width=container.clientWidth,height=container.clientHeight,occupied:{x:number;y:number}[]=[]
      let index=0
      for(const {place,anchor,clear} of candidates){
        if(!clear)continue
        projected.copy(anchor).project(camera)
        if(projected.z< -1||projected.z>1||Math.abs(projected.x)>.92||Math.abs(projected.y)>.68)continue
        const x=(projected.x+1)*width/2,y=(1-projected.y)*height/2
        if(occupied.some(p=>Math.abs(p.x-x)<175&&Math.abs(p.y-y)<46))continue
        const label=pool[index++];label.button.hidden=false;label.button.dataset.place=place.id;label.name.textContent=place.name;label.distance.textContent=`${Math.round(Math.hypot(place.x-position.x,place.z-position.z))} m`;label.button.setAttribute('aria-label',`View ${place.name}`);label.button.style.transform=`translate(${x}px,${y}px) translate(-50%,-100%)`
        occupied.push({x,y});if(index===pool.length)break
      }
      for(;index<pool.length;index++)pool[index].button.hidden=true
    },
    dispose:()=>root.remove(),
  }
}
