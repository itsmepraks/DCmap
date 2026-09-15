export const SURVEY_ORIGIN = {longitude:-77.05018, latitude:38.88927}
export function surveyPoint(lon:number,lat:number) {
  return {x:(lon-SURVEY_ORIGIN.longitude)*111320*Math.cos(SURVEY_ORIGIN.latitude*Math.PI/180),z:(SURVEY_ORIGIN.latitude-lat)*111320}
}
export function sampleSurveyTerrain(x:number,z:number,terrain:{bounds:number[];size:number;heights:number[]}) {
  const a=surveyPoint(terrain.bounds[0],terrain.bounds[3]),b=surveyPoint(terrain.bounds[2],terrain.bounds[1]),n=terrain.size
  const u=Math.max(0,Math.min(n-1,(x-a.x)/(b.x-a.x)*(n-1))),v=Math.max(0,Math.min(n-1,(z-a.z)/(b.z-a.z)*(n-1)))
  const ix=Math.min(n-2,Math.floor(u)),iz=Math.min(n-2,Math.floor(v)),fx=u-ix,fz=v-iz
  const h=(dx:number,dz:number)=>terrain.heights[(iz+dz)*n+ix+dx]
  return (h(0,0)*(1-fx)+h(1,0)*fx)*(1-fz)+(h(0,1)*(1-fx)+h(1,1)*fx)*fz
}
export function previousHeightRule(area:number){return area<50?4:area<350?9:area<2000?18:30}
