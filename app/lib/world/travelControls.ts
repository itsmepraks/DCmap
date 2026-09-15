import { WORLD_BOUNDS } from './mallRoute'
export function explorationSpeed(mode:'walk'|'fly',boost:boolean,multiplier=1) {
  return (mode==='walk'?(boost?18:7):(boost?500:120))*Math.max(0.5,Math.min(3,multiplier))
}
export function mapDestination(u:number,v:number) {
  return {x:WORLD_BOUNDS.minX+Math.max(0,Math.min(1,u))*(WORLD_BOUNDS.maxX-WORLD_BOUNDS.minX),y:100,z:WORLD_BOUNDS.minZ+Math.max(0,Math.min(1,v))*(WORLD_BOUNDS.maxZ-WORLD_BOUNDS.minZ)}
}
export function findLandingPoint(x:number,z:number,ground:(x:number,z:number)=>number|null) {
  const at=(px:number,pz:number)=>{const y=ground(px,pz);return y===null?null:{x:px,y:y+0.9,z:pz}}
  const direct=at(x,z);if(direct)return direct
  for(let radius=8;radius<=120;radius+=8)for(let i=0;i<16;i++) {
    const a=i/16*Math.PI*2,result=at(x+Math.cos(a)*radius,z+Math.sin(a)*radius)
    if(result)return result
  }
  return null
}
export function flightMovement(forward:number,right:number,up:number,yaw:number,pitch:number,speed:number) {
  const x=-Math.sin(yaw)*Math.cos(pitch)*forward+Math.cos(yaw)*right
  const y=Math.sin(pitch)*forward+up
  const z=-Math.cos(yaw)*Math.cos(pitch)*forward-Math.sin(yaw)*right
  const scale=speed/Math.max(1,Math.hypot(x,y,z))
  return {x:x*scale,y:y*scale,z:z*scale}
}
