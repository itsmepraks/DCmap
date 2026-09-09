"""Download public DC GIS footprints and bake small, local metric JSON tiles.
No credentials required. Heights are deliberately estimated, not surveyed.
"""
import json, math, pathlib, urllib.parse, urllib.request
BASE = 'https://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_DATA/Facility_and_Structure_WebMercator/MapServer/1'
OUT = pathlib.Path(__file__).resolve().parents[1] / 'public/world'
# Lincoln origin; x east, z south. The existing artistic Mall remains aligned here.
LON, LAT = -77.05018, 38.88927
sx = 111320 * math.cos(math.radians(LAT))
tiles = {}; count = 0; offset = 0
while True:
    params = dict(f='json',where='1=1',geometry='-77.055,38.881,-77.003,38.898',geometryType='esriGeometryEnvelope',inSR=4326,spatialRel='esriSpatialRelIntersects',outSR=4326,outFields='OBJECTID,DESCRIPTION',returnGeometry='true',resultOffset=offset,resultRecordCount=1000,orderByFields='OBJECTID',maxAllowableOffset=0.000015)
    with urllib.request.urlopen(BASE+'/query?'+urllib.parse.urlencode(params), timeout=90) as r: data=json.load(r)
    if 'error' in data: raise RuntimeError(data['error'])
    for feature in data.get('features',[]):
        if feature['attributes']['OBJECTID'] == 86863: continue # curated Smithsonian Castle
        rings = feature.get('geometry',{}).get('rings',[])
        if not rings: continue
        ring = max(rings, key=lambda r: abs(sum(r[i][0]*r[i+1][1]-r[i+1][0]*r[i][1] for i in range(len(r)-1))))
        points=[[round((p[0]-LON)*sx,1),round((LAT-p[1])*111320,1)] for p in ring]
        x=sum(p[0] for p in points)/len(points); z=sum(p[1] for p in points)/len(points)
        # Hand-authored landmarks own their footprints; avoid overlapping meshes.
        if any(math.hypot(x-lx,z-lz)<r for lx,lz,r in [(0,0,95),(1280,0,80),(3330,-5,180)]): continue
        if not (-350<x<4100 and -950<z<950): continue
        desc=feature['attributes'].get('DESCRIPTION','') or ''
        if any(word in desc.lower() for word in ['fountain','bleacher','memorial']): continue
        area=abs(sum(points[i][0]*points[i+1][1]-points[i+1][0]*points[i][1] for i in range(len(points)-1)))/2
        if area<30: continue
        height=12 if area<350 else 22 if area<2000 else 30
        key=f'{math.floor(x/256)}_{math.floor(z/256)}'
        tiles.setdefault(key,[]).append(dict(id=feature['attributes']['OBJECTID'],p=points,h=height))
        count+=1
    if not data.get('exceededTransferLimit'): break
    offset+=len(data['features'])
OUT.joinpath('tiles').mkdir(parents=True,exist_ok=True)
for key,buildings in tiles.items(): OUT.joinpath('tiles',key+'.json').write_text(json.dumps(buildings,separators=(',',':')))
OUT.joinpath('manifest.json').write_text(json.dumps(dict(version=1,tileSize=256,origin=[LON,LAT],source=BASE,attribution='Building footprints: DC GIS / OCTO. Heights are illustrative estimates.',buildings=count,tiles=list(tiles)),separators=(',',':')))
print(f'Baked {count} real footprints into {len(tiles)} tiles')
