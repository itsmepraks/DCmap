"""Sample public 2024 terrain and export attributed 2025 orthoimagery for the test area."""
import concurrent.futures,json,pathlib,subprocess,urllib.parse,math
ROOT=pathlib.Path(__file__).resolve().parents[1];OUT=ROOT/'public/world/survey';CACHE=pathlib.Path('/tmp/dc-3d-audit')
B=[-77.069,38.902,-77.058,38.911];N=65
TERRAIN='https://imagery.dcgis.dc.gov/dcgis/rest/services/Lidar/Hydro_Enforced_DTM_2024/ImageServer'
ORTHO='https://imagery.dcgis.dc.gov/dcgis/rest/services/Ortho/Ortho_2025/ImageServer'
points=[[B[0]+(B[2]-B[0])*x/(N-1),B[3]-(B[3]-B[1])*z/(N-1)] for z in range(N) for x in range(N)]
def sample(start):
 f=CACHE/f'terrain-grid-{start}.json';form=CACHE/f'terrain-grid-{start}.form'
 if not f.exists():
  form.write_text(urllib.parse.urlencode(dict(f='json',geometry=json.dumps(dict(points=points[start:start+256],spatialReference=dict(wkid=4326))),geometryType='esriGeometryMultipoint',returnFirstValueOnly='true')))
  subprocess.run(['curl','--fail','--retry','3','-sS','--data-binary','@'+str(form),TERRAIN+'/getSamples','-o',str(f)],check=True)
 d=json.loads(f.read_text());samples=d.get('samples',[])
 if len(samples)!=len(points[start:start+256]):raise RuntimeError(f'Incomplete terrain {start}: {str(d)[:200]}')
 values=[None]*len(samples)
 for p in samples:values[p['locationId']]=round(float(p['value']),3)
 if any(v is None or not math.isfinite(v) for v in values):raise RuntimeError('Missing terrain values')
 return values
values=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 for chunk in pool.map(sample,range(0,len(points),256)):values.extend(chunk)
(OUT/'terrain.json').write_text(json.dumps(dict(source=TERRAIN,license='https://creativecommons.org/publicdomain/zero/1.0/',bounds=B,size=N,heights=values),separators=(',',':')))
params=dict(f='image',bbox=','.join(map(str,B)),bboxSR=4326,imageSR=4326,size='4096,4096',format='jpg',bandIds='0,1,2',interpolation='RSP_BilinearInterpolation',adjustAspectRatio='false')
subprocess.run(['curl','--fail','--retry','3','-sS',ORTHO+'/exportImage?'+urllib.parse.urlencode(params),'-o',str(OUT/'aerial.jpg')],check=True)
if (OUT/'aerial.jpg').read_bytes()[:2]!=b'\xff\xd8':raise RuntimeError('Imagery export did not return JPEG')
print('Terrain',len(values),'samples',min(values),max(values),'Imagery bytes',(OUT/'aerial.jpg').stat().st_size)
