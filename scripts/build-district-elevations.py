"""Join public DC 2024 maximum heights to existing footprints by geometry, never row IDs.
The two services use unrelated object IDs. Reject ambiguous/non-overlapping matches.
Downloads are cached; source data and original estimated h are retained.
"""
import concurrent.futures,gzip,json,math,pathlib,struct,time,urllib.request
ROOT=pathlib.Path(__file__).resolve().parents[1];CACHE=pathlib.Path('/tmp/dc-3d-audit');CACHE.mkdir(exist_ok=True)
BASE='https://services.arcgis.com/neT9SoYxizqTHZPH/arcgis/rest/services/3D_Buildings_2024_Maximum_Height_Web_Scene_WSL1/SceneServer/layers/0'
R=6378137;LON,LAT=-77.05018,38.88927;SX=111320*math.cos(math.radians(LAT))
def get(path,binary=False):
 f=CACHE/('i3s-'+path.replace('/','_')+('.bin' if binary else '.json'))
 if f.exists():return f.read_bytes() if binary else json.loads(f.read_text())
 for attempt in range(4):
  try:
   b=urllib.request.urlopen(BASE+'/'+path+('' if binary else '?f=json'),timeout=40).read()
   if b[:2]==b'\x1f\x8b':b=gzip.decompress(b)
   if binary:f.write_bytes(b);return b
   d=json.loads(b)
   if 'error' in d:raise RuntimeError(str(d['error']))
   f.write_text(json.dumps(d));return d
  except Exception:
   if attempt==3:raise
   time.sleep(2**attempt)
pages={0:get('nodepages/0')};todo=[0];nodes={n['index']:n for n in pages[0]['nodes']}
while todo:
 for child in nodes[todo.pop()].get('children',[]):
  page=child//64
  if page not in pages:pages[page]=get('nodepages/'+str(page));nodes.update({v['index']:v for v in pages[page]['nodes']})
  todo.append(child)
leaves=[n for n in nodes.values() if not n.get('children') and n.get('mesh')]
print('Reading',len(leaves),'leaf nodes',flush=True)
def decode(n):
 b=get(f"nodes/{n['mesh']['geometry']['resource']}/geometries/0",True);nv,nf=struct.unpack_from('<II',b)
 if nv!=n['mesh']['geometry']['vertexCount'] or len(b)<8+nv*36+nf*16:raise RuntimeError('Invalid I3S buffer')
 ids=struct.unpack_from('<'+'Q'*nf,b,8+nv*36);ranges=struct.unpack_from('<'+'I'*nf*2,b,8+nv*36+nf*8)
 out=[];cx,cy,cz=n['obb']['center']
 for j,fid in enumerate(ids):
  first,last=ranges[j*2:j*2+2]
  if last*3+2>=nv:raise RuntimeError('Invalid face range')
  pts=list(struct.iter_unpack('<fff',b[8+first*36:8+(last+1)*36]))
  xs=[p[0]+cx for p in pts];zs=[p[1]+cy for p in pts];ys=[p[2]+cz for p in pts]
  x1,x2=[(math.degrees(x/R)-LON)*SX for x in (min(xs),max(xs))]
  z1,z2=[(LAT-math.degrees(2*math.atan(math.exp(y/R))-math.pi/2))*111320 for y in (max(zs),min(zs))]
  h=max(ys)-min(ys)
  if 1<=h<=200:out.append([fid,(x1+x2)/2,(z1+z2)/2,x2-x1,z2-z1,round(h,3)])
 return out
survey=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 for i,rows in enumerate(pool.map(decode,leaves)):
  survey.extend(rows)
  if i%40==0:print('Decoded',i+1,'/',len(leaves),flush=True)
# Deduplicate source IDs across leaves.
survey=list({row[0]:row for row in survey}.values());index={}
for row in survey:index.setdefault((math.floor(row[1]/4),math.floor(row[2]/4)),[]).append(row)
matched=total=0;used=set();sky=json.load(open(ROOT/'public/world/skyline.json'));changes={}
for file in sorted((ROOT/'public/world/tiles').glob('*.json')):
 buildings=json.loads(file.read_text());tile_heights=[]
 for b in buildings:
  total+=1;xs=[p[0] for p in b['p']];zs=[p[1] for p in b['p']];x=(min(xs)+max(xs))/2;z=(min(zs)+max(zs))/2;w=max(xs)-min(xs);d=max(zs)-min(zs)
  candidates=[]
  for dx in (-1,0,1):
   for dz in (-1,0,1):
    for row in index.get((math.floor(x/4)+dx,math.floor(z/4)+dz),[]):
     _,sx,sz,sw,sd,h=row;distance=math.hypot(x-sx,z-sz)
     if distance<2 and abs(w-sw)<max(.5,w*.06) and abs(d-sd)<max(.5,d*.06):candidates.append((distance,row))
  candidates.sort(key=lambda a:a[0]);b.pop('s',None)
  if candidates and (len(candidates)==1 or candidates[1][0]-candidates[0][0]>.5):
   row=candidates[0][1];b['s']=row[5];matched+=1;used.add(row[0]);tile_heights.append([x,z,row[5]])
 file.write_text(json.dumps(buildings,separators=(',',':')))
 # Skyline ordering is not assumed to match the footprint tiles.
 for box in sky.get(file.stem,[]):
  box[:]=box[:5]
  for x,z,h in tile_heights:
   if abs(box[0]-x)<.2 and abs(box[1]-z)<.2:box[4]=h;box.append(1);break
(ROOT/'public/world/skyline.json').write_text(json.dumps(sky,separators=(',',':')))
report=dict(source=BASE,license='https://creativecommons.org/licenses/by/4.0/',year=2024,sourceFeatures=len(survey),matched=matched,total=total,method='Bounding-box center within 2m, dimensions within 6% (0.5m minimum tolerance), ambiguous matches rejected. IDs are not shared.',attribution='Building heights: DC GIS / OCTO, 2024. CC BY 4.0. Geometry matched and reprojected; unmatched heights remain illustrative.')
(ROOT/'public/world/elevation-source.json').write_text(json.dumps(report,separators=(',',':')))
print(report,flush=True)
