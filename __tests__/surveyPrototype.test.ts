import fs from 'node:fs'
import { sampleSurveyTerrain,surveyPoint } from '../app/lib/world/surveyMath'
it('preserves the recorded height and elevation of every survey building',()=>{
  const m=JSON.parse(fs.readFileSync('public/world/survey/manifest.json','utf8'))
  const bytes=fs.readFileSync('public/world/survey/buildings.bin'),p=new Float32Array(bytes.buffer,bytes.byteOffset,bytes.byteLength/4)
  expect(m.features.length).toBeGreaterThan(1000)
  expect(new Set(m.features.map((f:{id:number})=>f.id)).size).toBe(m.features.length)
  expect(bytes.byteLength).toBe(m.bytes)
  for(const f of m.features){
    let min=Infinity,max=-Infinity
    for(let i=f.start;i<f.start+f.count;i++){
      if(![p[i*3],p[i*3+1],p[i*3+2]].every(Number.isFinite))throw new Error(`Non-finite building ${f.id}`)
      min=Math.min(min,p[i*3+1]);max=Math.max(max,p[i*3+1])
    }
    expect(min).toBeCloseTo(f.base,2);expect(max-min).toBeCloseTo(f.height,2)
  }
})
it('maps terrain samples to the same north-up local coordinates as buildings',()=>{
  const t=JSON.parse(fs.readFileSync('public/world/survey/terrain.json','utf8'))
  expect(t.heights).toHaveLength(t.size*t.size)
  expect(t.heights.every((n:number)=>Number.isFinite(n)&&n>-20&&n<150)).toBe(true)
  const nw=surveyPoint(t.bounds[0],t.bounds[3]),se=surveyPoint(t.bounds[2],t.bounds[1])
  expect(sampleSurveyTerrain(nw.x,nw.z,t)).toBe(t.heights[0])
  expect(sampleSurveyTerrain(se.x,se.z,t)).toBe(t.heights.at(-1))
  expect(nw.z).toBeLessThan(se.z)
})
