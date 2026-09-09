"""Bake DDOT public street centerlines into local metric geometry."""
import json, math, pathlib, urllib.request, urllib.parse
base='https://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_APPS/DDOT_TOPS/MapServer/5'
roads=[];offset=0
while True:
    params=dict(f='json',where="ROADTYPE = '1'",geometry='-77.054,38.881,-77.003,38.897',geometryType='esriGeometryEnvelope',inSR=4326,outSR=4326,spatialRel='esriSpatialRelIntersects',outFields='ROUTENAME',returnGeometry='true',resultOffset=offset,resultRecordCount=1000)
    with urllib.request.urlopen(base+'/query?'+urllib.parse.urlencode(params),timeout=90) as r: data=json.load(r)
    if 'error' in data: raise RuntimeError(data['error'])
    for feature in data.get('features',[]):
        for path in feature['geometry']['paths']:
            points=[[round((p[0]+77.05018)*111320*math.cos(math.radians(38.88927)),1),round((38.88927-p[1])*111320,1)] for p in path]
            if all(-350<x<4050 and -900<z<900 for x,z in points): roads.append(dict(name=feature['attributes'].get('ROUTENAME','DC street'),p=points))
    if not data.get('exceededTransferLimit'):break
    offset+=len(data['features'])
pathlib.Path('public/world/roads.json').write_text(json.dumps(dict(source=base,attribution='Street centerlines: DC District Department of Transportation. Road widths are illustrative.',roads=roads),separators=(',',':')))
print(f'Baked {len(roads)} street segments')
