"""Extract a bounded, attributed Georgetown test from DC's public 2024 I3S scene."""
import concurrent.futures,gzip,json,math,pathlib,struct,time,urllib.request
ROOT=pathlib.Path(__file__).resolve().parents[1];CACHE=pathlib.Path('/tmp/dc-3d-audit');OUT=ROOT/'public/world/survey';OUT.mkdir(exist_ok=True)
BASE='https://services.arcgis.com/neT9SoYxizqTHZPH/arcgis/rest/services/3D_Buildings_2024_Maximum_Height_Web_Scene_WSL1/SceneServer/layers/0'
LON,LAT=-77.05018,38.88927;SX=111320*math.cos(math.radians(LAT));R=6378137
# Complete features with centers inside this test area are retained.
BOUNDS=[-77.068,38.903,-77.059,38.910]
def get(path,binary=False):
 f=CACHE/('i3s-'+path.replace('/','_')+('.bin' if binary else '.json'))
 if f.exists():return f.read_bytes() if binary else json.loads(f.read_text())
 for attempt in range(4):
  try:
   b=urllib.request.urlopen(BASE+'/'+path+('' if binary else '?f=json'),timeout=60).read()
   if b[:2]==b'\x1f\x8b':b=gzip.decompress(b)
   if binary:f.write_bytes(b);return b
   d=json.loads(b);f.write_text(json.dumps(d));return d
  except Exception:
   if attempt==3:raise
   time.sleep(2**attempt)
def ll(x,y):return [math.degrees(x/R),math.degrees(2*math.atan(math.exp(y/R))-math.pi/2)]
def local(x,y):
 lon,lat=ll(x,y);return [(lon-LON)*SX,(LAT-lat)*111320]
# The root lists all hierarchy children, so discover pages without assuming an object count.
pages={0:get('nodepages/0')};todo=[0];nodes={n['index']:n for n in pages[0]['nodes']}
while todo:
 i=todo.pop();n=nodes[i]
 for child in n.get('children',[]):
  page=child//64
  if page not in pages:
   pages[page]=get('nodepages/'+str(page));nodes.update({v['index']:v for v in pages[page]['nodes']})
  todo.append(child)
minx=R*math.radians(BOUNDS[0]);maxx=R*math.radians(BOUNDS[2]);miny=R*math.log(math.tan(math.pi/4+math.radians(BOUNDS[1])/2));maxy=R*math.log(math.tan(math.pi/4+math.radians(BOUNDS[3])/2))
leaves=[]
for n in nodes.values():
 if n.get('children') or not n.get('mesh'):continue
 cx,cy,_=n['obb']['center'];radius=math.hypot(*n['obb']['halfSize'][:2])
 if cx+radius>=minx and cx-radius<=maxx and cy+radius>=miny and cy-radius<=maxy:leaves.append(n)
print('Hierarchy',len(nodes),'nodes; candidate leaves',len(leaves),flush=True)
features=[];seen=set()
for node in leaves:
 resource=node['mesh']['geometry']['resource']; b=get(f'nodes/{resource}/geometries/0',True);nv,nf=struct.unpack_from('<II',b)
 if nv!=node['mesh']['geometry']['vertexCount']:raise RuntimeError('Vertex count mismatch')
 # I3S uncompressed schema: header, positions, normals, UV, RGBA, feature IDs, inclusive face ranges.
 positions=struct.unpack_from('<'+'f'*(nv*3),b,8);offset=8+nv*36
 ids=struct.unpack_from('<'+'Q'*nf,b,offset);ranges=struct.unpack_from('<'+'I'*(nf*2),b,offset+nf*8)
 center=node['obb']['center']
 for j,fid in enumerate(ids):
  if fid in seen:continue
  first,last=ranges[j*2:j*2+2];verts=[]
  for k in range(first*3,(last+1)*3):
   wx=positions[k*3]+center[0];wy=positions[k*3+1]+center[1];height=positions[k*3+2]+center[2]
   x,z=local(wx,wy);verts.append([x,height,z])
  if not verts:continue
  xs=[v[0] for v in verts];zs=[v[2] for v in verts];cx=(min(xs)+max(xs))/2;cz=(min(zs)+max(zs))/2
  lon=cx/SX+LON;lat=LAT-cz/111320
  if not (BOUNDS[0]<=lon<=BOUNDS[2] and BOUNDS[1]<=lat<=BOUNDS[3]):continue
  ys=[v[1] for v in verts];ground=min(ys);height=max(ys)-ground
  if height<1 or height>150:continue
  features.append(dict(id=fid,base=round(ground,3),height=round(height,3),center=[cx,cz],vertices=verts));seen.add(fid)
 print('leaf',resource,'retained',len(features),flush=True)
(OUT/'source.json').write_text(json.dumps(dict(source=BASE,license='https://creativecommons.org/licenses/by/4.0/',captureYear=2024,bounds=BOUNDS,features=features),separators=(',',':')))
print('Saved',len(features),'buildings',flush=True)
