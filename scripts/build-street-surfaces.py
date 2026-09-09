"""Download official 2021 DC street surfaces. Run before bake-street-surfaces.mjs."""
import concurrent.futures,json,math,pathlib,time,urllib.request,urllib.parse
ROOT=pathlib.Path(__file__).resolve().parents[1]
CACHE=pathlib.Path('/tmp/dc-street-surfaces');CACHE.mkdir(exist_ok=True)
BASE='https://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_DATA/Planimetrics_2021/MapServer/'
def query(layer,params):
 for attempt in range(4):
  try:
   with urllib.request.urlopen(BASE+str(layer)+'/query?'+urllib.parse.urlencode(dict(f='json',**params)),timeout=90) as r:d=json.load(r)
   if 'error' in d:raise RuntimeError(d['error'])
   return d
  except Exception:
   if attempt==3:raise
   time.sleep(2**attempt)
result=[]
for layer in [10,11]:
 ids=sorted(query(layer,dict(where='1=1',returnIdsOnly='true'))['objectIds'])
 def batch(start):
  path=CACHE/f'{layer}-{start}.json'
  if path.exists():return json.loads(path.read_text())
  d=query(layer,dict(objectIds=','.join(map(str,ids[start:start+500])),outFields='OBJECTID,FEATURECODE',outSR=4326,returnGeometry='true',maxAllowableOffset=0.000003))
  if d.get('exceededTransferLimit') or len(d['features'])!=len(ids[start:start+500]):raise RuntimeError('Incomplete street batch')
  path.write_text(json.dumps(d));return d
 count=0
 with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
  for d in pool.map(batch,range(0,len(ids),500)):
   for f in d['features']:
    rings=[[[round((p[0]+77.05018)*111320*math.cos(math.radians(38.88927)),2),round((38.88927-p[1])*111320,2)] for p in r] for r in f.get('geometry',{}).get('rings',[])]
    if rings:result.append(dict(code=f['attributes']['FEATURECODE'],rings=rings))
   count+=len(d['features'])
 print(layer,count,flush=True)
(CACHE/'surfaces.json').write_text(json.dumps(result,separators=(',',':')))
print('Ready to triangulate',len(result),flush=True)
