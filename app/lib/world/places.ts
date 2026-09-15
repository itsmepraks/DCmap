import { geographicPosition, DC_ORIGIN } from './districtPlaces'

export type PlaceCategory = 'Food & drink' | 'Shopping' | 'Culture' | 'Hotels' | 'Outdoors' | 'Services' | 'Buildings'
export interface WorldPlace {
  id:string; name:string; category:PlaceCategory; kind:string; x:number; z:number
  address?:string; website?:string; phone?:string; hours?:string; cuisine?:string
}
export interface PlaceDataset {places:WorldPlace[]; fetchedAt:string; mapUpdatedAt?:string; source:string; license:string}
export interface OsmElement {type:string;id:number;lat?:number;lon?:number;center?:{lat:number;lon:number};tags?:Record<string,string>}
export const PLACE_CATEGORIES:PlaceCategory[]=['Food & drink','Shopping','Culture','Hotels','Outdoors','Services','Buildings']
export const PLACE_SOURCE='https://www.openstreetmap.org/copyright'
export function safePlaceWebsite(value?:string) {
  if(!value)return undefined
  try {const url=new URL(/^https?:\/\//i.test(value)?value:`https://${value}`);return /^https?:$/.test(url.protocol)&&!url.username&&!url.password&&url.hostname.includes('.')?url.href:undefined} catch{return undefined}
}
export function normalizePlaces(elements:OsmElement[]):WorldPlace[] {
  const places:WorldPlace[]=[],seen=new Set<string>()
  for(const element of elements){
    const t=element.tags??{},lat=element.lat??element.center?.lat,lon=element.lon??element.center?.lon
    if(!t.name||!Number.isFinite(lat)||!Number.isFinite(lon)||lat!<38.79||lat!>39||lon!< -77.13||lon!> -76.9)continue
    if(!['node','way','relation'].includes(element.type)||!Number.isSafeInteger(element.id)||element.id<=0)continue
    if(t.disused==='yes'||t.abandoned==='yes'||t.shop==='vacant'||t.amenity==='construction')continue
    const kind=t.amenity??t.shop??t.tourism??t.office??t.leisure??t.historic??t.building??'building'
    const category:PlaceCategory=/^(restaurant|cafe|bar|pub|fast_food|food_court|ice_cream|biergarten)$/.test(kind)?'Food & drink':t.shop?'Shopping':/^(hotel|hostel|motel|guest_house|apartment)$/.test(t.tourism??'')?'Hotels':t.tourism||t.historic||/^(library|theatre|cinema|arts_centre)$/.test(kind)?'Culture':t.leisure?'Outdoors':t.amenity||t.office?'Services':'Buildings'
    const {x,z}=geographicPosition(lon!,lat!),key=`${t.name.toLowerCase()}|${Math.round(x/10)}|${Math.round(z/10)}`
    if(seen.has(key))continue;seen.add(key)
    const address=[t['addr:housenumber'],t['addr:street']].filter(Boolean).join(' ')||t['addr:full']
    places.push({id:`${element.type}/${element.id}`,name:t.name.slice(0,160),category,kind:kind.replace(/_/g,' '),x:Math.round(x*10)/10,z:Math.round(z*10)/10,address:address?.slice(0,240),website:safePlaceWebsite(t.website??t['contact:website']),phone:(t.phone??t['contact:phone'])?.slice(0,80),hours:t.opening_hours?.slice(0,400),cuisine:t.cuisine?.replace(/;/g,', ').replace(/_/g,' ').slice(0,150)})
  }
  return places.sort((a,b)=>a.name.localeCompare(b.name))
}
export function placeCell(x:number,z:number){return `${Math.floor(x/1000)}_${Math.floor(z/1000)}`}
export function placeCellBounds(cell:string) {
  if(!/^-?\d{1,2}_-?\d{1,2}$/.test(cell))return null
  const [x,z]=cell.split('_').map(Number)
  if(x< -7||x>12||z< -12||z>9)return null
  const lon=(value:number)=>DC_ORIGIN.longitude+value/(111320*Math.cos(DC_ORIGIN.latitude*Math.PI/180)),lat=(value:number)=>DC_ORIGIN.latitude-value/111320
  return [lat((z+1)*1000),lon(x*1000),lat(z*1000),lon((x+1)*1000)]
}
export function placesQuery(selector:string) {
  return `[out:json][timeout:20];(${['amenity','shop','tourism','office','building','leisure','historic'].map(key=>`nwr(${selector})["name"]["${key}"];`).join('')});out center tags;`
}
export function searchWorldPlaces(places:WorldPlace[],query:string,category:PlaceCategory|'All',position:{x:number;z:number},limit=40) {
  const words=query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean)
  return places.filter(p=>(category==='All'||p.category===category)&&words.every(word=>`${p.name} ${p.address??''} ${p.kind}`.toLocaleLowerCase().includes(word)))
    .sort((a,b)=>Math.hypot(a.x-position.x,a.z-position.z)-Math.hypot(b.x-position.x,b.z-position.z)).slice(0,limit)
}
export function placeInsideFootprint(place:{x:number;z:number},p:number[][]){
  let inside=false
  for(let i=0,j=p.length-1;i<p.length;j=i++)if((p[i][1]>place.z)!==(p[j][1]>place.z)&&place.x<(p[j][0]-p[i][0])*(place.z-p[i][1])/(p[j][1]-p[i][1])+p[i][0])inside=!inside
  return inside
}
