import fs from 'node:fs'
import path from 'node:path'

test('street cells contain finite, upward-facing triangles inside their replacement bounds', () => {
  const root = path.join(process.cwd(), 'public/world/streets')
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'))
  expect(manifest.counts.crosswalk).toBeGreaterThan(10000)
  for (const [key, chunks] of Object.entries(manifest.tiles) as [string, {offset:number;count:number}[]][]) {
    const [x,z] = key.split('_').map(Number)
    const bytes = fs.readFileSync(path.join(root, `${key}.bin`))
    const data = new Float32Array(bytes.buffer, bytes.byteOffset, bytes.byteLength/4)
    for (const chunk of chunks) {
      if (chunk.offset + chunk.count*5 > data.length || chunk.count%3) throw new Error(`Invalid buffer ${key}`)
      for (let i=chunk.offset;i<chunk.offset+chunk.count*5;i+=15) {
        for (let j=0;j<15;j+=5) {
          const px=data[i+j],pz=data[i+j+2]
          if (!Number.isFinite(px) || !Number.isFinite(pz) || px<x*1024-.01 || px>(x+1)*1024+.01 || pz<z*1024-.01 || pz>(z+1)*1024+.01) throw new Error(`Triangle outside cell ${key}`)
        }
        const normalY=(data[i+7]-data[i+2])*(data[i+10]-data[i])-(data[i+5]-data[i])*(data[i+12]-data[i+2])
        if (normalY < -.01) throw new Error(`Downward triangle ${key}`)
      }
    }
  }
})
