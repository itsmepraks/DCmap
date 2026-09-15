"""Bake the entire District from official DC GIS layers; cached, paginated, reproducible."""
import concurrent.futures, json, math, pathlib, time, urllib.parse, urllib.request
ROOT=pathlib.Path(__file__).resolve().parents[1]; OUT=ROOT/'public/world'; CACHE=pathlib.Path('/tmp/dc-district-source');CACHE.mkdir(exist_ok=True)
LON,LAT=-77.05018,38.88927; SX=111320*math.cos(math.radians(LAT))
BASE='https://maps2.dcgis.dc.gov/dcgis/rest/services/'
SOURCES={'buildings':BASE+'DCGIS_DATA/Facility_and_Structure_WebMercator/MapServer/1','roads':BASE+'DCGIS_APPS/DDOT_TOPS/MapServer/5','water':BASE+'DCGIS_DATA/Planimetrics_2021/MapServer/14','parks':BASE+'DCGIS_DATA/Recreation_WebMercator/MapServer/9','national-parks':BASE+'DCGIS_DATA/Recreation_WebMercator/MapServer/10'}
def get(url,params):
 for attempt in range(5):
  try:
   with urllib.request.urlopen(url+'/query?'+urllib.parse.urlencode(dict(f='json',**params)),timeout=90) as r: d=json.load(r)
   if 'error'in d:raise RuntimeError(d['error'])
   return d
  except Exception:
   if attempt==4:raise
   time.sleep(2**attempt)
def download(name):
 url=SOURCES[name]; ids=get(url,{'where':'1=1','returnIdsOnly':'true'})['objectIds']; ids.sort()
 batches=[ids[i:i+500] for i in range(0,len(ids),500)]
 def batch(pair):
  index,values=pair; f=CACHE/f'{name}-{index}.json'
  if f.exists():return json.loads(f.read_text())
  d=get(url,{'objectIds':','.join(map(str,values)),'outSR':4326,'outFields':'*','returnGeometry':'true','maxAllowableOffset':0.000015 if name=='buildings' else 0.00003})
  if d.get('exceededTransferLimit'):raise RuntimeError('Truncated batch')
  f.write_text(json.dumps(d));return d
 features=[]
 with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
  for i,d in enumerate(pool.map(batch,enumerate(batches))):
   features.extend(d.get('features',[]))
   if i%20==0: print(name,i+1,'/',len(batches),flush=True)
 if len(features)!=len(ids):raise RuntimeError(f'{name}: expected {len(ids)}, received {len(features)}')
 return features
def point(p):return [round((p[0]-LON)*SX,1),round((LAT-p[1])*111320,1)]
def area(r):return abs(sum(r[i][0]*r[i+1][1]-r[i+1][0]*r[i][1] for i in range(len(r)-1)))/2
buildings=download('buildings');tiles={};skyline={};count=0
for f in buildings:
 a=f['attributes'];oid=a.get('OBJECTID');rings=f.get('geometry',{}).get('rings',[])
 if not rings or oid==86863:continue
 p=[point(v) for v in max(rings,key=area)];xs=[v[0] for v in p];zs=[v[1] for v in p];x=(min(xs)+max(xs))/2;z=(min(zs)+max(zs))/2
 if any(math.hypot(x-lx,z-lz)<r for lx,lz,r in [(0,0,65),(1280,0,35),(3330,-5,150)]):continue
 desc=(a.get('DESCRIPTION') or '').lower()
 if any(w in desc for w in ['fountain','bleacher','memorial']):continue
 size=area(p)
 if size<9:continue
 h=4 if size<50 else 9 if size<350 else 18 if size<2000 else 30
 key=f'{math.floor(x/256)}_{math.floor(z/256)}'
 tiles.setdefault(key,[]).append(dict(id=oid,p=p,h=h)); count+=1
 skyline.setdefault(key,[]).append([round(x,1),round(z,1),round(max(xs)-min(xs),1),round(max(zs)-min(zs),1),h])
for key,data in tiles.items():
 (OUT/'tiles').mkdir(exist_ok=True);(OUT/'tiles'/f'{key}.json').write_text(json.dumps(data,separators=(',',':')))
(OUT/'skyline.json').write_text(json.dumps(skyline,separators=(',',':')))
(OUT/'manifest.json').write_text(json.dumps(dict(version=2,tileSize=256,origin=[LON,LAT],source=SOURCES['buildings'],coverage='Entire District of Columbia',sourceBuildings=len(buildings),buildings=count,tiles=list(tiles),attribution='DC GIS / OCTO. Footprints are sourced; heights are illustrative.'),separators=(',',':')))
print('BUILDINGS COMPLETE',count,len(tiles),flush=True)
roads=[]
for f in download('roads'):
 a=f['attributes'];roadtype=str(a.get('ROADTYPE','1'))
 for line in f.get('geometry',{}).get('paths',[]):
  roads.append(dict(name=a.get('ROUTENAME') or 'DC street',kind=roadtype,p=[point(v) for v in line]))
(OUT/'roads.json').write_text(json.dumps(dict(source=SOURCES['roads'],roads=roads),separators=(',',':')))
land={}
for name in ['water','parks','national-parks']:
 land[name]=[[[point(p) for p in r] for r in f.get('geometry',{}).get('rings',[])] for f in download(name)]
(OUT/'land.json').write_text(json.dumps(dict(sources=SOURCES,polygons=land),separators=(',',':')))
print('DISTRICT COMPLETE',count,'buildings',len(roads),'roads',flush=True)
# Same source geometry drives the compact citywide UI map.
svg=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6200 -12000 18600 21800"><rect x="-6200" y="-12000" width="18600" height="21800" fill="#e8ebe4"/>']
for kind,color in [('parks','#abd09a'),('national-parks','#92bd88'),('water','#8ac8e9')]:
 for rings in land[kind]:
  d=' '.join('M'+' L'.join(f'{x:.0f},{z:.0f}' for x,z in r)+'Z' for r in rings if len(r)>3)
  svg.append(f'<path d="{d}" fill="{color}" fill-rule="evenodd"/>')
for r in roads:
 if r.get('kind') not in ['1','2']:continue
 d='M'+' L'.join(f'{x:.0f},{z:.0f}' for x,z in r['p'])
 svg.append(f'<path d="{d}" fill="none" stroke="#fafbf6" stroke-width="12"/>')
svg.append('</svg>');(OUT/'overview.svg').write_text(''.join(svg))
