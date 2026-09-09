import { explorationSpeed,findLandingPoint,mapDestination,flightMovement } from '../app/lib/world/travelControls'
import { WORLD_BOUNDS } from '../app/lib/world/mallRoute'
it('maps arbitrary clicks across the entire world and clamps edges',()=>{
 expect(mapDestination(-1,2)).toEqual({x:WORLD_BOUNDS.minX,y:100,z:WORLD_BOUNDS.maxZ})
 expect(mapDestination(0.5,0.5).x).toBe((WORLD_BOUNDS.minX+WORLD_BOUNDS.maxX)/2)
})
it('finds a nearby valid landing instead of failing on the clicked building or water',()=>{
 const point=findLandingPoint(0,0,(x,z)=>x>=15&&Math.abs(z)<1?0:null)
 expect(point).toEqual({x:16,y:0.9,z:0})
 expect(findLandingPoint(0,0,()=>null)).toBeNull()
})
it('flies toward the view and keeps combined input within the speed budget',()=>{
 const up=flightMovement(1,0,0,0,Math.PI/4,120)
 expect(up.y).toBeGreaterThan(80);expect(up.z).toBeLessThan(-80)
 const diagonal=flightMovement(1,1,1,0,0,120)
 expect(Math.hypot(diagonal.x,diagonal.y,diagonal.z)).toBeCloseTo(120)
 expect(explorationSpeed('walk',true,3)).toBe(54)
})
