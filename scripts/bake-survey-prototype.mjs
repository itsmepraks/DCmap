import fs from 'node:fs'
const root='public/world/survey',source=JSON.parse(fs.readFileSync(`${root}/source.json`)),positions=[],features=[]
for(const feature of source.features){
 const start=positions.length/3
 for(const p of feature.vertices)positions.push(...p)
 features.push({id:feature.id,base:feature.base,height:feature.height,center:feature.center,start,count:feature.vertices.length})
}
fs.writeFileSync(`${root}/buildings.bin`,Buffer.from(new Float32Array(positions).buffer))
fs.writeFileSync(`${root}/manifest.json`,JSON.stringify({source:source.source,license:source.license,captureYear:2024,bounds:source.bounds,features,vertices:positions.length/3,bytes:positions.length*4,attribution:'Buildings: DC GIS / OCTO, 2024 (CC BY 4.0). Reprojected to local meters; source elevations retained.'}))
fs.renameSync(`${root}/source.json`,'/tmp/dc-3d-audit/georgetown-source.json')
console.log(features.length,'buildings;',positions.length/9,'triangles;',positions.length*4,'bytes')
