import { NextRequest, NextResponse } from 'next/server'
import { normalizePlaces, placeCellBounds, placesQuery, PLACE_SOURCE } from '@/app/lib/world/places'
export const maxDuration=30
export async function GET(request:NextRequest) {
  const id=request.nextUrl.searchParams.get('id'),cell=request.nextUrl.searchParams.get('cell')
  let query:string
  if(id&&/^(node|way|relation)\/[1-9]\d{0,15}$/.test(id)){
    const [type,number]=id.split('/');query=`[out:json][timeout:20];${type}(${number});out center tags;`
  }else if(cell&&placeCellBounds(cell))query=placesQuery(placeCellBounds(cell)!.map(v=>v.toFixed(6)).join(','))
  else return NextResponse.json({error:'Choose a place or an area within DC.'},{status:400})
  try {
    const response=await fetch('https://overpass-api.de/api/interpreter',{method:'POST',body:new URLSearchParams({data:query}),headers:{'Content-Type':'application/x-www-form-urlencoded','User-Agent':'DC-Explorer/1.0 (public place lookup)'},signal:AbortSignal.timeout(24000),cache:'force-cache',next:{revalidate:900}})
    if(!response.ok)throw new Error('Place provider unavailable')
    const data=await response.json()
    if(data.remark||!Array.isArray(data.elements))throw new Error('Incomplete place response')
    return NextResponse.json({places:normalizePlaces(data.elements),fetchedAt:new Date().toISOString(),mapUpdatedAt:data.osm3s?.timestamp_osm_base,source:PLACE_SOURCE,license:'https://opendatacommons.org/licenses/odbl/1-0/'},{headers:{'Cache-Control':'public, max-age=60, s-maxage=900'}})
  }catch{return NextResponse.json({error:'Live map updates are temporarily unavailable. Saved place details remain available.'},{status:503})}
}
