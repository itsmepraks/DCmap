import type { RouteStop } from './mallRoute'
export const DC_ORIGIN = {longitude:-77.05018,latitude:38.88927}
export function geographicPosition(longitude:number,latitude:number) {
  return {x:(longitude-DC_ORIGIN.longitude)*111320*Math.cos(DC_ORIGIN.latitude*Math.PI/180),y:1,z:(DC_ORIGIN.latitude-latitude)*111320}
}
// Neighborhood arrival points are approximate public street locations, not building entrances.
const places: [string,string,number,number,string][] = [
 ['georgetown','Georgetown',-77.0632,38.9053,'Brick streetscapes and the waterfront in northwest DC.'],
 ['dupont-circle','Dupont Circle',-77.0434,38.9096,'Explore the circle and the avenues radiating into northwest DC.'],
 ['adams-morgan','Adams Morgan',-77.042,38.9214,'Follow the streets around 18th Street and Columbia Road.'],
 ['columbia-heights','Columbia Heights',-77.0325,38.9285,'Explore the blocks around 14th Street in upper northwest.'],
 ['tenleytown','Tenleytown',-77.0795,38.948,'Explore the Wisconsin Avenue corridor in upper northwest.'],
 ['chevy-chase','Chevy Chase DC',-77.072,38.969,'Residential streets in the northern District.'],
 ['petworth','Petworth',-77.025,38.943,'Rowhouse blocks and neighborhood streets in northwest DC.'],
 ['takoma','Takoma DC',-77.018,38.974,'Explore the northern edge of the District.'],
 ['brookland','Brookland',-76.994,38.933,'Explore northeast DC around 12th Street.'],
 ['woodridge','Woodridge',-76.973,38.932,'Residential blocks along the Rhode Island Avenue corridor.'],
 ['h-street','H Street NE',-76.991,38.900,'Follow the H Street corridor through northeast DC.'],
 ['deanwood','Deanwood',-76.934,38.907,'Explore the eastern District’s residential streets.'],
 ['capitol-hill','Capitol Hill',-76.996,38.887,'Explore the neighborhood east of the Capitol.'],
 ['navy-yard','Navy Yard',-77.003,38.876,'Explore southeast DC near the Anacostia waterfront.'],
 ['anacostia','Anacostia',-76.989,38.867,'Explore the streets east of the Anacostia River.'],
 ['congress-heights','Congress Heights',-76.987,38.845,'Explore the southern District around Martin Luther King Jr. Avenue.'],
 ['fort-dupont','Fort Dupont',-76.947,38.877,'Parkland and residential streets in southeast DC.'],
 ['penn-quarter','Penn Quarter',-77.022,38.897,'Explore central DC’s dense civic and commercial blocks.'],
]
export const DISTRICT_PLACES:RouteStop[]=places.map(([id,name,longitude,latitude,description])=>{
 const arrival=geographicPosition(longitude,latitude)
 return {id,name,shortName:name,position:arrival,arrival,lookAt:{...arrival,x:arrival.x+80,y:10},description}
})
