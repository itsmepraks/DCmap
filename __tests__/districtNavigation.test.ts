import { createDistrictNavigation,insideWater } from '../app/lib/world/districtNavigation'
import { DISTRICT_PLACES } from '../app/lib/world/districtPlaces'
import { clampWorldPosition } from '../app/lib/world/mallRoute'
const outer=[[0,0],[100,0],[100,100],[0,100],[0,0]], island=[[40,40],[60,40],[60,60],[40,60],[40,40]]
it('preserves islands and allows bridge crossings but prevents walking on open water',()=>{
 expect(insideWater(20,20,[outer,island])).toBe(true)
 expect(insideWater(50,50,[outer,island])).toBe(false)
 const canWalk=createDistrictNavigation([[outer,island]],[{name:'Bridge',p:[[-50,30],[150,30]]}])
 expect(canWalk(20,80)).toBe(false)
 expect(canWalk(20,30)).toBe(true)
 expect(canWalk(50,50)).toBe(true)
 expect(canWalk(150,50)).toBe(true)
})
it('includes the northern, eastern and southern District within travel bounds',()=>{
 for(const place of DISTRICT_PLACES)expect(clampWorldPosition(place.arrival)).toEqual(place.arrival)
 expect(DISTRICT_PLACES.some(p=>p.id==='congress-heights')).toBe(true)
 expect(DISTRICT_PLACES.some(p=>p.id==='deanwood')).toBe(true)
})

it('finds the nearest street arrival without confusing proximity with source IDs',()=>{
 const {createStreetArrivals}=require('../app/lib/world/districtNavigation')
 const nearest=createStreetArrivals([{name:'M Street',p:[[-100,0],[100,0]]},{name:'Side street',p:[[50,-100],[50,100]]}])
 expect(nearest(0,20)).toEqual({x:0,z:0,y:1,yaw:-Math.PI/2})
 expect(nearest(1000,1000)).toBeNull()
})
