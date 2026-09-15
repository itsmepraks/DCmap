/** Run after fetching the Overpass query below; output is distributed under ODbL. */
import fs from 'node:fs'
import {normalizePlaces,PLACE_SOURCE} from '../app/lib/world/places'
const source=JSON.parse(fs.readFileSync('/tmp/dc-places-source.json','utf8'))
if(source.remark||!Array.isArray(source.elements))throw new Error('Incomplete Overpass response')
const places=normalizePlaces(source.elements)
if(places.length<1000)throw new Error('Unexpectedly low District place coverage')
fs.writeFileSync('public/world/places.json',JSON.stringify({places,fetchedAt:new Date().toISOString(),mapUpdatedAt:source.osm3s?.timestamp_osm_base,source:PLACE_SOURCE,license:'https://opendatacommons.org/licenses/odbl/1-0/'}))
console.log(places.length,'named places;',places.filter(p=>p.hours).length,'with mapped hours')
