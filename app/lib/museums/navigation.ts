export type Point={x:number;z:number}
export type Barrier={x:number;z:number;w:number;d:number}
export function canStand(p:Point,barriers:Barrier[],radius=.4){return Math.abs(p.x)<=22.4&&p.z>=-26.4&&p.z<=17.4&&!barriers.some(b=>Math.abs(p.x-b.x)<b.w/2+radius&&Math.abs(p.z-b.z)<b.d/2+radius)}
export function moveVisitor(p:Point,delta:Point,barriers:Barrier[]):Point {
 const next={...p};const steps=Math.max(1,Math.ceil(Math.hypot(delta.x,delta.z)/.2))
 for(let i=0;i<steps;i++){if(canStand({x:next.x+delta.x/steps,z:next.z},barriers))next.x+=delta.x/steps;if(canStand({x:next.x,z:next.z+delta.z/steps},barriers))next.z+=delta.z/steps}
 return next
}
export function galleryPath(start:Point,end:Point,barriers:Barrier[]):Point[]{
 const key=(p:Point)=>`${p.x},${p.z}`,a={x:Math.round(start.x),z:Math.round(start.z)},b={x:Math.round(end.x),z:Math.round(end.z)}
 const queue=[a],parents=new Map<string,Point|null>([[key(a),null]])
 for(let i=0;i<queue.length;i++){const p=queue[i];if(key(p)===key(b)){const route:Point[]=[];let at:Point|null=p;while(at){route.push(at);at=parents.get(key(at))??null}return route.reverse().slice(1)}
 for(const d of [{x:1,z:0},{x:-1,z:0},{x:0,z:1},{x:0,z:-1}]){const n={x:p.x+d.x,z:p.z+d.z};if(!parents.has(key(n))&&canStand(n,barriers,.6)){parents.set(key(n),p);queue.push(n)}}}
 return []
}
