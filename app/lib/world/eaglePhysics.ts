export interface EagleState {vx:number;vy:number;vz:number;yaw:number;pitch:number;bank:number;flapping:number;stalled:boolean}
export interface EagleInput {heading:number;pitch:number;throttle:number;brake:boolean;power:boolean}
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n))
const angle=(n:number)=>Math.atan2(Math.sin(n),Math.cos(n))
export function launchEagle(yaw:number,pitch=.08):EagleState{return{vx:-Math.sin(yaw)*14,vy:2,vz:-Math.cos(yaw)*14,yaw,pitch,bank:0,flapping:0,stalled:false}}
/** Point-mass aerodynamic game model in metres, seconds, Newtons. Coefficients are tuned, not measured eagle biomechanics. */
export function stepEagle(s:EagleState,input:EagleInput,dt:number):EagleState {
 const h=clamp(dt,0,1/15),speed=Math.max(.5,Math.hypot(s.vx,s.vy,s.vz)),horizontal=Math.hypot(s.vx,s.vz)
 const flightPath=Math.atan2(s.vy,Math.max(.1,horizontal)),pitch=s.pitch+(clamp(input.pitch,-1.05,.7)-s.pitch)*(1-Math.exp(-3*h))
 const bank=s.bank+(clamp(-angle(input.heading-s.yaw)*1.7,-1.05,1.05)-s.bank)*(1-Math.exp(-4*h))
 const aoa=pitch-flightPath,stalled=Math.abs(aoa)>.4||speed<6
 const cl=clamp(.25+4.5*aoa,-.6,1.45)*(Math.abs(aoa)>.4?Math.max(.15,1-(Math.abs(aoa)-.4)*2):1)
 const q=.5*1.225*speed*speed*.7,mass=4.5
 const lift=clamp(q*cl,-mass*9.81,mass*9.81*3),drag=q*(.045+.085*cl*cl+(input.brake?.65:0)+(stalled?.2:0))
 const thrust=Math.max(0,input.throttle)*(input.power?35:19)
 const fx=s.vx/speed,fy=s.vy/speed,fz=s.vz/speed
 // Project world-up perpendicular to velocity, then bank that lift vector.
 let ux=-fx*fy,uy=1-fy*fy,uz=-fz*fy;const ul=Math.max(.001,Math.hypot(ux,uy,uz));ux/=ul;uy/=ul;uz/=ul
 const rx=Math.cos(s.yaw),rz=-Math.sin(s.yaw)
 const lx=ux*Math.cos(bank)+rx*Math.sin(bank),ly=uy*Math.cos(bank),lz=uz*Math.cos(bank)+rz*Math.sin(bank)
 const nx=-Math.sin(s.yaw)*Math.cos(pitch),ny=Math.sin(pitch),nz=-Math.cos(s.yaw)*Math.cos(pitch)
 let vx=s.vx+(lift*lx-drag*fx+thrust*nx)/mass*h,vy=s.vy+(lift*ly-drag*fy+thrust*ny-mass*9.81)/mass*h,vz=s.vz+(lift*lz-drag*fz+thrust*nz)/mass*h
 const maximum=65,v=Math.hypot(vx,vy,vz);if(v>maximum){vx*=maximum/v;vy*=maximum/v;vz*=maximum/v}
 const yaw=Math.hypot(vx,vz)>1?Math.atan2(-vx,-vz):s.yaw
 return{vx,vy,vz,yaw,pitch,bank,flapping:Math.max(0,input.throttle),stalled}
}
