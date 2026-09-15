"""Bake public street-tree locations into the same neighborhood grid."""
import pathlib
exec(pathlib.Path(__file__).with_name('build-district.py').read_text().split("buildings=download('buildings')")[0])
SOURCES['trees']=BASE+'DCGIS_APPS/DDOT_TOPS/MapServer/22'
tiles={};count=0
import sys
features=[f for file in sorted(CACHE.glob('trees-*.json')) for f in json.loads(file.read_text())['features']] if '--cached' in sys.argv else download('trees')
for f in features:
 a=f['attributes'];g=f.get('geometry',{})
 if 'x' not in g:continue
 if a.get('TBOX_STAT') != 'Plant':continue
 x,z=point([g['x'],g['y']])
 if not (-6200<x<12400 and -12000<z<9800):continue
 if -150<x<3100 and abs(z)<115:continue # curated Mall trees
 key=f'{math.floor(x/256)}_{math.floor(z/256)}';tiles.setdefault(key,[]).append([x,z]);count+=1
(OUT/'trees.json').write_text(json.dumps(dict(source=SOURCES['trees'],count=count,tiles=tiles),separators=(',',':')))
print('TREE LOCATIONS',count,flush=True)
