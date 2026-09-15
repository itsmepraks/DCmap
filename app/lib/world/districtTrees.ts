import * as THREE from 'three'
import type RAPIER from '@dimforge/rapier3d-compat'
import { crownGeometry as makeCrown, branchGeometry } from './treeGeometry'
import { treeStyle, treeSeed, blossomDistrict, type WorldSeason } from './atmosphere'
import { flatGround, type GroundHeight } from './terrain'
import { nearbyCityTiles } from './cityTiles'
export function createDistrictTrees(scene:THREE.Scene,physics:RAPIER.World,rapier:typeof RAPIER,tiles:Record<string,number[][]>,heightAt: GroundHeight = flatGround) {
  const crownGeometry=makeCrown(),branchesGeometry=branchGeometry(),trunkGeometry=new THREE.CylinderGeometry(0.2,0.3,5,9)
  const leaves=new THREE.MeshStandardMaterial({color:'#ffffff',roughness:1}),wood=new THREE.MeshStandardMaterial({color:'#715640',roughness:1})
  const loaded=new Map<string,{group:THREE.Group;colliders:RAPIER.Collider[]}>(),transform=new THREE.Object3D()
  let season:WorldSeason='summer'
  const color=new THREE.Color()
  const applySeason=(group:THREE.Group,points:number[][])=>{
    const crowns=group.children[0] as THREE.InstancedMesh
    points.forEach(([x,z],i)=>{const style=treeStyle(x,z,season,blossomDistrict(x,z)&&treeSeed(x,z)%3===0);transform.position.set(x,heightAt(x,z)+7.3,z);transform.scale.set(style.bare?0:3.3*style.scale,style.bare?0:3.8*style.scale,style.bare?0:3.3*style.scale);transform.rotation.set(0,0,0);transform.updateMatrix();crowns.setMatrixAt(i,transform.matrix);crowns.setColorAt(i,color.set(style.color))})
    crowns.instanceMatrix.needsUpdate=true;if(crowns.instanceColor)crowns.instanceColor.needsUpdate=true;crowns.computeBoundingSphere()
  }
  const remove=(key:string)=>{const item=loaded.get(key);if(!item)return;scene.remove(item.group);item.group.traverse(o=>{if(o instanceof THREE.InstancedMesh)o.dispose()});item.colliders.forEach(c=>physics.removeCollider(c,true));loaded.delete(key)}
  return {
    setSeason:(value:WorldSeason)=>{season=value;for(const [key,tile] of loaded)applySeason(tile.group,tiles[key])},
    update:(x:number,z:number)=>{
      const wanted=new Set(nearbyCityTiles(x,z,1).filter(key=>tiles[key]))
      for(const key of loaded.keys())if(!wanted.has(key))remove(key)
      const key=[...wanted].find(key=>!loaded.has(key));if(!key)return
      const points=tiles[key],group=new THREE.Group(),colliders:RAPIER.Collider[]=[]
      const crowns=new THREE.InstancedMesh(crownGeometry,leaves,points.length),trunks=new THREE.InstancedMesh(trunkGeometry,wood,points.length),branches=new THREE.InstancedMesh(branchesGeometry,wood,points.length)
      points.forEach(([px,pz],i)=>{
        const base=heightAt(px,pz)
        transform.position.set(px,base,pz);transform.scale.set(1,1,1);transform.updateMatrix();branches.setMatrixAt(i,transform.matrix)
        transform.position.set(px,base+2.5,pz);transform.scale.set(1,1,1);transform.updateMatrix();trunks.setMatrixAt(i,transform.matrix)
        transform.position.set(px,base+7.3,pz);transform.scale.set(3.3,4.2,3.3);transform.updateMatrix();crowns.setMatrixAt(i,transform.matrix)
        colliders.push(physics.createCollider(rapier.ColliderDesc.cylinder(2.5,0.3).setTranslation(px,base+2.5,pz)))
      })
      crowns.castShadow=true;trunks.castShadow=true;crowns.computeBoundingSphere();trunks.computeBoundingSphere();branches.castShadow=true;branches.computeBoundingSphere();group.add(crowns,trunks,branches);applySeason(group,points);scene.add(group);loaded.set(key,{group,colliders})
    },
    dispose:()=>{[...loaded.keys()].forEach(remove);crownGeometry.dispose();branchesGeometry.dispose();trunkGeometry.dispose();leaves.dispose();wood.dispose()},
  }
}
