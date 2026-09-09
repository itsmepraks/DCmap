type Point=number[]
type Rings=Point[][]
export function insideRing(x:number,z:number,ring:Point[]) {
  let inside=false
  for(let i=0,j=ring.length-1;i<ring.length;j=i++) {
    const a=ring[i],b=ring[j]
    if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])inside=!inside
  }
  return inside
}
export function insideWater(x:number,z:number,rings:Rings) {return rings.reduce((inside,ring)=>inside!==insideRing(x,z,ring),false)}
export function createDistrictNavigation(water:Rings[],roads:{p:Point[];kind?:string;name:string}[]) {
  const waterCells=new Map<string,Rings[]>(),roadCells=new Map<string,{a:Point;b:Point;width:number}[]>()
  const key=(x:number,z:number)=>`${Math.floor(x/256)}_${Math.floor(z/256)}`
  const index=<T>(map:Map<string,T[]>,value:T,x0:number,z0:number,x1:number,z1:number)=>{
    for(let x=Math.floor(x0/256);x<=Math.floor(x1/256);x++)for(let z=Math.floor(z0/256);z<=Math.floor(z1/256);z++){
      const k=`${x}_${z}`,list=map.get(k)??[];list.push(value);map.set(k,list)
    }
  }
  for(const rings of water) {
    const p=rings.flat();if(!p.length)continue
    const xs=p.map(v=>v[0]),zs=p.map(v=>v[1])
    // The hand-authored reflecting pool owns its lower bed and water.
    if(Math.min(...xs)>100&&Math.max(...xs)<820&&Math.min(...zs)>-40&&Math.max(...zs)<40)continue
    index(waterCells,rings,Math.min(...xs),Math.min(...zs),Math.max(...xs),Math.max(...zs))
  }
  for(const road of roads)for(let i=1;i<road.p.length;i++) {
    const a=road.p[i-1],b=road.p[i],width=/avenue/i.test(road.name)?12:9
    index(roadCells,{a,b,width},Math.min(a[0],b[0])-width,Math.min(a[1],b[1])-width,Math.max(a[0],b[0])+width,Math.max(a[1],b[1])+width)
  }
  return (x:number,z:number)=>{
    const k=key(x,z)
    if(!(waterCells.get(k)??[]).some(rings=>insideWater(x,z,rings)))return true
    return (roadCells.get(k)??[]).some(({a,b,width})=>{
      const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)))
      return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)<width
    })
  }
}


/** Nearest public street/path point for arrivals, with a direction along the street. */
export function createStreetArrivals(roads:{p:Point[];name:string}[]) {
  const cells=new Map<string,{a:Point;b:Point}[]>()
  for(const road of roads)for(let i=1;i<road.p.length;i++){
    const a=road.p[i-1],b=road.p[i]
    if(Math.hypot(a[0]-b[0],a[1]-b[1])<1)continue
    for(let x=Math.floor(Math.min(a[0],b[0])/256);x<=Math.floor(Math.max(a[0],b[0])/256);x++)for(let z=Math.floor(Math.min(a[1],b[1])/256);z<=Math.floor(Math.max(a[1],b[1])/256);z++){
      const key=`${x}_${z}`,list=cells.get(key)??[];list.push({a,b});cells.set(key,list)
    }
  }
  return (x:number,z:number)=>{
    let best:{x:number;z:number;y:number;yaw:number}|null=null,distance=120
    for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)for(const {a,b} of cells.get(`${Math.floor(x/256)+dx}_${Math.floor(z/256)+dz}`)??[]){
      const vx=b[0]-a[0],vz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*vx+(z-a[1])*vz)/(vx*vx+vz*vz)))
      const px=a[0]+vx*t,pz=a[1]+vz*t,d=Math.hypot(x-px,z-pz)
      if(d<distance){distance=d;best={x:px,z:pz,y:1,yaw:Math.atan2(-vx,-vz)}}
    }
    return best
  }
}
