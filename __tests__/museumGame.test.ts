import { MUSEUMS, museumComplete, normalizeProgress, passportXP, recordDiscovery } from '../app/lib/museums/catalog'
import {canStand,galleryPath,moveVisitor} from '../app/lib/museums/navigation'
describe('Smithsonian passport',()=>{
 test('repeated inspection and answers cannot farm XP',()=>{let p=normalizeProgress(null);for(let i=0;i<10;i++){p=recordDiscovery(p,'henry');p=recordDiscovery(p,'henry',true)}expect(passportXP(p)).toBe(75);expect(museumComplete(MUSEUMS[0],p)).toBe(false);for(const e of MUSEUMS[0].exhibits)p=recordDiscovery(p,e.id,true);expect(passportXP(p)).toBe(225);expect(museumComplete(MUSEUMS[0],p)).toBe(true)})
 test('corrupt saves cannot introduce unknown discoveries or unearned solved entries',()=>{expect(normalizeProgress({seen:['henry','henry',4,'fake'],solved:['hope','fake','henry']})).toEqual({seen:['henry'],solved:['henry']});expect(normalizeProgress('bad')).toEqual({seen:[],solved:[]})})
 test('all nine discoveries have unique IDs, valid questions, and Smithsonian sources',()=>{const exhibits=MUSEUMS.flatMap(m=>m.exhibits);expect(new Set(exhibits.map(e=>e.id)).size).toBe(9);for(const e of exhibits){expect(e.answer).toBeLessThan(e.choices.length);expect(new URL(e.source).hostname.endsWith('.si.edu')).toBe(true)}})
})
describe('gallery movement',()=>{
 const walls=[{x:0,z:-9,w:16,d:.5},{x:0,z:-18,w:.5,d:18}]
 test('movement cannot tunnel through a wall at large frame deltas',()=>{const p=moveVisitor({x:0,z:0},{x:0,z:-20},walls);expect(p.z).toBeGreaterThan(-8.4);expect(canStand(p,walls)).toBe(true)})
 test('guided paths reach both gallery rooms through their doorways',()=>{for(const x of [-14,14]){const path=galleryPath({x:0,z:13},{x,z:-12},walls);expect(path.length).toBeGreaterThan(0);expect(path[path.length-1]).toEqual({x,z:-12});for(const p of path)expect(canStand(p,walls,.6)).toBe(true)}})
 test('visitor stays inside the museum boundary',()=>{expect(moveVisitor({x:22,z:17},{x:100,z:100},[]).x).toBeLessThanOrEqual(22.4)})
})
