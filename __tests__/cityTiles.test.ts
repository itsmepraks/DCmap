import { cityTileKey, nearbyCityTiles } from '../app/lib/world/cityTiles'
import fs from 'fs'
import path from 'path'
describe('City neighborhood streaming', () => {
  it('handles negative coordinates and prioritizes the occupied tile', () => {
    expect(cityTileKey(-1,-257)).toBe('-1_-2')
    expect(nearbyCityTiles(3330,0)[0]).toBe('13_0')
    expect(new Set(nearbyCityTiles(3330,0)).size).toBe(25)
  })
  it('keeps the resident neighborhood bounded when crossing the city', () => {
    const old=new Set(nearbyCityTiles(80,34)), next=new Set(nearbyCityTiles(3330,0))
    expect([...old].filter(key=>next.has(key))).toHaveLength(0)
    expect(next.size).toBe(25)
  })
  it('ships every manifest tile with finite, closed footprint geometry', () => {
    const root=path.join(process.cwd(),'public/world')
    const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'))
    let count=0
    for(const key of manifest.tiles) {
      const buildings=JSON.parse(fs.readFileSync(path.join(root,'tiles',key+'.json'),'utf8'))
      for(const building of buildings) {
        count++
        expect(building.p.length).toBeGreaterThanOrEqual(4)
        expect(building.p[0]).toEqual(building.p[building.p.length-1])
        expect(building.p.flat().every(Number.isFinite)).toBe(true)
        expect(building.h).toBeGreaterThan(0)
      }
    }
    expect(count).toBe(manifest.buildings)
  })
})
