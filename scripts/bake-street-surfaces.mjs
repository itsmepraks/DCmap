/** Pre-triangulate sourced polygons so the browser does no city-wide triangulation. */
import fs from 'node:fs'
import * as THREE from 'three'
const source=JSON.parse(fs.readFileSync('/tmp/dc-street-surfaces/surfaces.json','utf8'))
const groups=new Map(), counts={road:0,sidewalk:0,crosswalk:0,island:0}
for(const feature of source){
 const {code,rings}=feature
 const kind=code===1483?'crosswalk':code>=1480?'sidewalk':[1055,1056,1057,1058,1092].includes(code)?'island':'road'
 counts[kind]++
 const shapes=[]
 for(const ring of rings){
  if(ring.length<4)continue
  const points=ring.map(([x,z])=>new THREE.Vector2(x,-z))
  if(THREE.ShapeUtils.isClockWise(points)||!shapes.length)shapes.push(new THREE.Shape(points))
  else shapes[shapes.length-1].holes.push(new THREE.Path(points))
 }
 for(const shape of shapes){
  const geo=new THREE.ShapeGeometry(shape),pos=geo.attributes.position,index=geo.index
  let dx=1,dz=0,longest=0
  const points=shape.getPoints()
  for(let i=1;i<points.length;i++){
   const x=points[i].x-points[i-1].x,z=-(points[i].y-points[i-1].y),len=Math.hypot(x,z)
   if(len>longest){longest=len;dx=x/len;dz=z/len}
  }
  // Clip triangles to 1 km cells so loaded surfaces replace the matching fallback exactly.
  const height=kind==='road'?0.12:kind==='crosswalk'?0.135:0.17
  const clip=(poly,axis,bound,greater)=>{
    const out=[]
    for(let k=0;k<poly.length;k++){
      const a=poly[k],b=poly[(k+1)%poly.length],insideA=greater?a[axis]>=bound:a[axis]<=bound,insideB=greater?b[axis]>=bound:b[axis]<=bound
      if(insideA)out.push(a)
      if(insideA!==insideB){const t=(bound-a[axis])/(b[axis]-a[axis]);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t])}
    }
    return out
  }
  for(let i=0;i<index.count;i+=3){
    const triangle=[0,1,2].map(k=>[pos.getX(index.getX(i+k)),-pos.getY(index.getX(i+k))])
    const xs=triangle.map(p=>p[0]),zs=triangle.map(p=>p[1])
    for(let tx=Math.floor(Math.min(...xs)/1024);tx<=Math.floor(Math.max(...xs)/1024);tx++)for(let tz=Math.floor(Math.min(...zs)/1024);tz<=Math.floor(Math.max(...zs)/1024);tz++){
      let poly=clip(triangle,0,tx*1024,true);poly=clip(poly,0,(tx+1)*1024,false);poly=clip(poly,1,tz*1024,true);poly=clip(poly,1,(tz+1)*1024,false)
      if(poly.length<3)continue
      const key=`${tx}_${tz}_${kind}`
      if(!groups.has(key))groups.set(key,[])
      const values=groups.get(key)
      for(let j=1;j<poly.length-1;j++){
        const t=[poly[0],poly[j],poly[j+1]].map(p=>p.map(Math.fround))
        const n=(t[1][1]-t[0][1])*(t[2][0]-t[0][0])-(t[1][0]-t[0][0])*(t[2][1]-t[0][1])
        if(Math.abs(n)<.005)continue
        if(n<0)[t[1],t[2]]=[t[2],t[1]]
        for(const [x,z] of t)values.push(x,height,z,kind==='crosswalk'?x*dx+z*dz:x,z)
      }
    }
  }
  geo.dispose()
 }
}
const output='public/world/streets';fs.mkdirSync(output,{recursive:true})
const cells=new Map();let total=0
for(const [key,values] of groups){
 const data=new Float32Array(values),kind=key.split('_').at(-1),cell=key.split('_').slice(0,2).join('_')
 if(!cells.has(cell))cells.set(cell,{chunks:[],arrays:[],offset:0})
 const tile=cells.get(cell)
 tile.chunks.push({key,kind,offset:tile.offset,count:data.length/5});tile.arrays.push(Buffer.from(data.buffer));tile.offset+=data.length;total+=data.length
}
const tiles={}
for(const [key,tile] of cells){fs.writeFileSync(`${output}/${key}.bin`,Buffer.concat(tile.arrays));tiles[key]=tile.chunks}
fs.writeFileSync(`${output}/manifest.json`,JSON.stringify({source:'https://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_DATA/Planimetrics_2021/MapServer',captureYear:2021,counts,stride:5,tiles,attribution:'DC GIS / OCTO 2021 road and sidewalk polygons. Crosswalk extents are sourced; stripe spacing and surface materials are illustrative.'}))
if(fs.existsSync(`${output}/surfaces.bin`))fs.unlinkSync(`${output}/surfaces.bin`)
console.log(counts,`${cells.size} streamed cells; ${(total*4/1024/1024).toFixed(1)} MiB total; ${total/15} triangles`)
