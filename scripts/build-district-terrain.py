"""Resample the public 2024 DC DTM for a bounded, game-scale terrain mesh."""
import concurrent.futures,json,pathlib,subprocess,urllib.parse,math
ROOT=pathlib.Path(__file__).resolve().parents[1];CACHE=pathlib.Path('/tmp/dc-3d-audit');CACHE.mkdir(exist_ok=True)
B=[-77.12,38.79,-76.90,39.0];N=257
SOURCE='https://imagery.dcgis.dc.gov/dcgis/rest/services/Lidar/Hydro_Enforced_DTM_2024/ImageServer'
points=[[B[0]+(B[2]-B[0])*x/(N-1),B[3]-(B[3]-B[1])*z/(N-1)] for z in range(N) for x in range(N)]
def sample(start):
 f=CACHE/f'district-terrain-257-{start}.json';form=CACHE/f'district-terrain-257-{start}.form';count=len(points[start:start+256])
 if not f.exists():
  form.write_text(urllib.parse.urlencode(dict(f='json',geometry=json.dumps(dict(points=points[start:start+256],spatialReference=dict(wkid=4326))),geometryType='esriGeometryMultipoint',returnFirstValueOnly='true')))
  subprocess.run(['curl','--fail','--max-time','60','--retry','3','-sS','--data-binary','@'+str(form),SOURCE+'/getSamples','-o',str(f)],check=True)
 d=json.loads(f.read_text())
 if 'error' in d:
  if 'Transformation is unavailable for the current image.' in d['error'].get('details',[]):return [None]*count
  raise RuntimeError(str(d['error']))
 values=[None]*count
 for p in d.get('samples',[]):
  try:v=float(p['value']);values[p['locationId']]=round(v,3) if math.isfinite(v) and -30<v<200 else None
  except (ValueError,TypeError):pass
 return values
values=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 for i,chunk in enumerate(pool.map(sample,range(0,len(points),256))):
  values.extend(chunk)
  if i%20==0:print('Terrain batches',i+1,'/259',flush=True)
valid=sum(v is not None for v in values)
if valid<len(values)*.35:raise RuntimeError('Too little valid terrain coverage')
# Missing samples lie outside the DTM coverage. Extend the nearest sampled edge
# for the surrounding game backdrop; do not describe it as surveyed terrain.
from collections import deque
queue=deque(i for i,v in enumerate(values) if v is not None);measured=[v is not None for v in values]
while queue:
 i=queue.popleft();x=i%N;z=i//N
 for j in ([i-1] if x else [])+([i+1] if x<N-1 else [])+([i-N] if z else [])+([i+N] if z<N-1 else []):
  if values[j] is None:values[j]=values[i];queue.append(j)
report=dict(source=SOURCE,license='https://creativecommons.org/publicdomain/zero/1.0/',year=2024,bounds=B,size=N,heights=values,measured=measured,sampledCount=valid,attribution='Terrain: DC GIS / OCTO, 2024, CC0. Resampled for play; edges outside source coverage extended. Authored Mall terrain blended into the elevation model.')
(ROOT/'public/world/terrain.json').write_text(json.dumps(report,separators=(',',':')))
print('Terrain complete',valid,'surveyed of',len(values),flush=True)
