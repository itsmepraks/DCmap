import { MAP_STYLE } from './mapStyle'
import * as THREE from 'three'
import type RAPIER from '@dimforge/rapier3d-compat'
import { surveyPoint } from './surveyMath'

type TerrainGrid = {x0:number;z0:number;dx:number;dz:number;size:number}
export type GroundHeight = ((x: number, z: number) => number) & {grid?:TerrainGrid}
export type TerrainData = { bounds: number[]; size: number; heights: number[] }
export const flatGround: GroundHeight = () => 0

/** Preserve the authored, playable Mall; blend its edge into the sampled District. */
export function mallTerrainWeight(x: number, z: number) {
  const distance = Math.hypot(Math.max(-410-x, 0, x-4100), Math.max(Math.abs(z)-400, 0))
  const t = Math.min(1, distance/400)
  return t*t*(3-2*t)
}
export function createTerrainField(data: TerrainData) {
  const a = surveyPoint(data.bounds[0], data.bounds[3]), b = surveyPoint(data.bounds[2], data.bounds[1]), n = data.size
  if (n < 2 || data.heights.length !== n*n || data.heights.some(h => !Number.isFinite(h))) throw new Error('Invalid District terrain')
  const heights = data.heights.map((h,i) => Math.max(0,h)*mallTerrainWeight(a.x+(b.x-a.x)*(i%n)/(n-1), a.z+(b.z-a.z)*Math.floor(i/n)/(n-1)))
  const heightAt: GroundHeight = (x,z) => {
    // The Mall's exact ground/steps and pool are supplied by buildWorld.
    if (mallTerrainWeight(x,z) === 0) return 0
    const u=Math.max(0,Math.min(n-1,(x-a.x)/(b.x-a.x)*(n-1))),v=Math.max(0,Math.min(n-1,(z-a.z)/(b.z-a.z)*(n-1)))
    const ix=Math.min(n-2,Math.floor(u)),iz=Math.min(n-2,Math.floor(v)),fx=u-ix,fz=v-iz
    const h00=heights[iz*n+ix],h10=heights[iz*n+ix+1],h01=heights[(iz+1)*n+ix],h11=heights[(iz+1)*n+ix+1]
    return fx+fz<=1?h00+(h10-h00)*fx+(h01-h00)*fz:h11+(h01-h11)*(1-fx)+(h10-h11)*(1-fz)
  }
  heightAt.grid={x0:a.x,z0:a.z,dx:(b.x-a.x)/(n-1),dz:(b.z-a.z)/(n-1),size:n}
  return { a,b,n,heights,heightAt }
}
export function buildDistrictTerrain(scene:THREE.Scene, physics:RAPIER.World, rapier:typeof RAPIER, data:TerrainData) {
  const field=createTerrainField(data),{a,b,n,heights}=field
  const positions=new Float32Array(n*n*3),uv=new Float32Array(n*n*2),indices:number[]=[]
  for(let z=0;z<n;z++)for(let x=0;x<n;x++) {
    const i=z*n+x,px=a.x+(b.x-a.x)*x/(n-1),pz=a.z+(b.z-a.z)*z/(n-1)
    positions.set([px,heights[i],pz],i*3);uv.set([px/8,pz/8],i*2)
    if(x===n-1||z===n-1)continue
    const nx=a.x+(b.x-a.x)*(x+1)/(n-1),nz=a.z+(b.z-a.z)*(z+1)/(n-1)
    // Leave the reflecting pool and its immediate ground to the authored scene.
    if(px<795&&nx>155&&pz<30&&nz> -30)continue
    indices.push(i,i+n,i+1,i+1,i+n,i+n+1)
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals()
  const material=new THREE.MeshStandardMaterial({color:MAP_STYLE.terrain,roughness:1,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1})
  const mesh=new THREE.Mesh(geometry,material);mesh.name='DC 2024 terrain';mesh.receiveShadow=true;scene.add(mesh)
  const collider=physics.createCollider(rapier.ColliderDesc.trimesh(positions,new Uint32Array(indices)))
  return {heightAt:field.heightAt,dispose:()=>{scene.remove(mesh);geometry.dispose();material.dispose();physics.removeCollider(collider,true)}}
}

/** Subdivide long triangles before draping so parks/roads follow hills, not chords. */
export function drapeGeometry(source:THREE.BufferGeometry, heightAt:GroundHeight, maxEdge=100) {
  if(heightAt===flatGround)return source
  const geometry=source.index?source.toNonIndexed():source
  const pos=geometry.getAttribute('position'),uv=geometry.getAttribute('uv'),positions:number[]=[],uvs:number[]=[]
  type Vertex=[number,number,number,number,number]
  const read=(i:number):Vertex=>[pos.getX(i),pos.getY(i),pos.getZ(i),uv?.getX(i)??0,uv?.getY(i)??0]
  const emit=(a:Vertex,b:Vertex,c:Vertex,depth:number)=>{
    const vertices=[a,b,c],distances=vertices.map((p,i)=>{const q=vertices[(i+1)%3];return Math.hypot(p[0]-q[0],p[2]-q[2])})
    const longest=Math.max(...distances)
    if(longest>maxEdge&&depth<12){
      const i=distances.indexOf(longest),p=vertices[i],q=vertices[(i+1)%3],r=vertices[(i+2)%3],m=p.map((v,j)=>(v+q[j])/2) as Vertex
      emit(p,m,r,depth+1);emit(m,q,r,depth+1);return
    }
    for(const p of vertices){positions.push(p[0],p[1]+heightAt(p[0],p[2]),p[2]);uvs.push(p[3],p[4])}
  }
  // Clip at every terrain cell AND its diagonal. Each resulting face lies on
  // one plane of the collision mesh; merely subdividing leaves visible cracks.
  const grid=heightAt.grid
  const clip=(polygon:Vertex[],distance:(p:Vertex)=>number)=>{
    const result:Vertex[]=[]
    for(let i=0;i<polygon.length;i++){
      const a=polygon[i],b=polygon[(i+1)%polygon.length],da=distance(a),db=distance(b)
      if(da>=-1e-7)result.push(a)
      if((da<0&&db>0)||(da>0&&db<0)){const t=da/(da-db);result.push(a.map((v,j)=>v+(b[j]-v)*t) as Vertex)}
    }
    return result
  }
  for(let i=0;i<pos.count;i+=3){
    const triangle=[read(i),read(i+1),read(i+2)]
    if(!grid){emit(...triangle as [Vertex,Vertex,Vertex],0);continue}
    const {x0,z0,dx,dz,size}=grid
    const xs=triangle.map(p=>p[0]),zs=triangle.map(p=>p[2]),clamp=(v:number)=>Math.max(0,Math.min(size-2,v))
    const minX=clamp(Math.floor((Math.min(...xs)-x0)/dx)),maxX=clamp(Math.floor((Math.max(...xs)-x0)/dx))
    const minZ=clamp(Math.floor((Math.min(...zs)-z0)/dz)),maxZ=clamp(Math.floor((Math.max(...zs)-z0)/dz))
    for(let iz=minZ;iz<=maxZ;iz++)for(let ix=minX;ix<=maxX;ix++){
      const left=x0+ix*dx,top=z0+iz*dz
      let polygon=triangle
      if(ix>0)polygon=clip(polygon,p=>p[0]-left)
      if(ix<size-2)polygon=clip(polygon,p=>left+dx-p[0])
      if(iz>0)polygon=clip(polygon,p=>p[2]-top)
      if(iz<size-2)polygon=clip(polygon,p=>top+dz-p[2])
      if(polygon.length<3)continue
      for(const side of [-1,1]){
        const half=clip(polygon,p=>side*(1-(p[0]-left)/dx-(p[2]-top)/dz))
        for(let j=1;j<half.length-1;j++){
          for(const p of [half[0],half[j],half[j+1]]){positions.push(p[0],p[1]+heightAt(p[0],p[2]),p[2]);uvs.push(p[3],p[4])}
        }
      }
    }
  }
  const result=new THREE.BufferGeometry();result.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));result.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));result.computeVertexNormals();result.computeBoundingSphere()
  if(geometry!==source)geometry.dispose();source.dispose();return result
}
