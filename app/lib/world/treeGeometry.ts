import * as THREE from 'three'
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js'
/** Rounded, asymmetric lobes instead of a single faceted polyhedron. */
export function crownGeometry(){
 const parts:THREE.BufferGeometry[]=[]
 for(const [x,y,z,s] of [[0,0,0,.82],[-.43,-.12,.2,.58],[.38,.06,-.2,.64],[.08,.43,.1,.57]]){
  const g=new THREE.SphereGeometry(s,12,8);g.scale(1,.96,.92);g.translate(x,y,z);parts.push(g)
 }
 const result=mergeGeometries(parts);parts.forEach(g=>g.dispose());return result
}
/** Branches share one geometry per forest and remain visible after leaf fall. */
export function branchGeometry(){
 const parts:THREE.BufferGeometry[]=[],up=new THREE.Vector3(0,1,0)
 const branch=(a:THREE.Vector3,b:THREE.Vector3,width:number)=>{
  const direction=b.clone().sub(a),g=new THREE.CylinderGeometry(width*.35,width,direction.length(),5)
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(up,direction.clone().normalize()));g.translate(...a.clone().add(b).multiplyScalar(.5).toArray());parts.push(g)
 }
 branch(new THREE.Vector3(0,2,0),new THREE.Vector3(.12,7.5,0),.21)
 for(let i=0;i<7;i++){
  const a=i*2.4,base=new THREE.Vector3(0,3.2+i*.45,0),tip=new THREE.Vector3(Math.cos(a)*(1.6+i*.12),6+i*.27,Math.sin(a)*(1.6+i*.12))
  branch(base,tip,.10);branch(tip,tip.clone().add(new THREE.Vector3(Math.cos(a+.7)*.7,1.3,Math.sin(a+.7)*.7)),.045)
 }
 const result=mergeGeometries(parts);parts.forEach(g=>g.dispose());return result
}
