/** An illustrative DC architectural palette, not an inventory of individual elevations. */
export const WALL_PALETTE = ['#ad7765','#c78f78','#976d62','#d09b80','#d4baa1','#aebfb4','#c9c5b2','#e0ded3','#cfcec4','#a1bbc6']
export function buildingCharacter(p: number[][], height: number, measured = false) {
  const xs=p.map(v=>v[0]),zs=p.map(v=>v[1]),x=(Math.min(...xs)+Math.max(...xs))/2,z=(Math.min(...zs)+Math.max(...zs))/2
  const seed=Math.abs(Math.imul(Math.round(x*10),73856093)^Math.imul(Math.round(z*10),19349663))>>>0
  const area=Math.abs(p.reduce((sum,a,i)=>{const b=p[(i+1)%p.length];return sum+a[0]*b[1]-b[0]*a[1]},0))/2
  const house=height<=12&&area>=35&&area<650
  const federal=house&&x<0&&z< -950
  const waterfront=!house&&x>2900&&z>600&&z<2500
  const wall=house ? (federal?seed%5:seed%7) : waterfront?9:7+seed%2
  return {x,z,seed,house,federal,waterfront,wall, height:house&&!measured?height+(seed%5-2)*.3:height}
}
