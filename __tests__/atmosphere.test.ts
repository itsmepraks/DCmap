import {LIGHTING,TIMES,treeStyle,SEASONS} from '../app/lib/world/atmosphere'
import {parkBenchParts,type BenchPart} from '../app/lib/world/parkBench'
it('offers distinct dawn, day, golden hour, blue hour and night lighting',()=>{
 expect(new Set(TIMES.map(t=>t.id)).size).toBe(5)
 expect(LIGHTING.night.lamps).toBe(1)
 expect(LIGHTING.day.lamps).toBe(0)
 expect(LIGHTING.night.strength).toBeLessThan(LIGHTING.day.strength)
 expect(LIGHTING.dawn.azimuth).toBeGreaterThan(0)
 expect(LIGHTING.sunset.azimuth).toBeLessThan(0)
 for(const p of Object.values(LIGHTING))expect(p.ambient).toBeGreaterThan(.5)
})
it('retains bare cherry branches in winter and distinct fall and blossom palettes',()=>{
 expect(SEASONS).toHaveLength(5)
 expect(treeStyle(600,800,'winter',true).bare).toBe(true)
 expect(treeStyle(600,800,'blossom',true).bare).toBe(false)
 expect(treeStyle(600,800,'blossom',true).color).not.toBe(treeStyle(600,800,'summer',true).color)
 expect(treeStyle(600,800,'autumn',true).color).not.toBe(treeStyle(600,800,'summer',true).color)
})
it.each([-1,1])('connects every bench element to a grounded support in orientation %s',side=>{
 const parts=parkBenchParts(side)
 const touches=(a:BenchPart,b:BenchPart)=>Math.abs(a.x-b.x)<=(a.w+b.w)/2+.001&&Math.abs(a.y-b.y)<=(a.h+b.h)/2+.001&&Math.abs(a.z-b.z)<=(a.d+b.d)/2+.001
 const grounded=new Set(parts.map((p,i)=>p.y-p.h/2<=.001?i:-1).filter(i=>i>=0))
 let changed=true
 while(changed){changed=false;parts.forEach((p,i)=>{if(!grounded.has(i)&&[...grounded].some(j=>touches(p,parts[j]))){grounded.add(i);changed=true}})}
 expect(grounded.size).toBe(parts.length)
})
