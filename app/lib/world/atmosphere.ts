export type WorldTime='dawn'|'day'|'sunset'|'dusk'|'night'
export type WorldSeason='spring'|'blossom'|'summer'|'autumn'|'winter'
export const TIMES:{id:WorldTime;name:string}[]=[{id:'dawn',name:'Dawn'},{id:'day',name:'Daylight'},{id:'sunset',name:'Golden hour'},{id:'dusk',name:'Blue hour'},{id:'night',name:'Night'}]
export const SEASONS:{id:WorldSeason;name:string;description:string}[]=[
 {id:'spring',name:'Spring',description:'Fresh greens and soft morning air.'},
 {id:'blossom',name:'Cherry blossoms',description:'Pale pink and white blossoms around the Tidal Basin.'},
 {id:'summer',name:'Summer',description:'Full green canopies and warm, hazy distance.'},
 {id:'autumn',name:'Fall',description:'Gold, rust and red foliage, with drifting leaves.'},
 {id:'winter',name:'Winter',description:'Bare branches, muted lawns and a light snowfall.'},
]
export const LIGHTING:Record<WorldTime,{sun:string;sky:string;fog:string;ground:string;strength:number;ambient:number;elevation:number;azimuth:number;exposure:number;lamps:number}>={
 dawn:{sun:'#ffd3b0',sky:'#d2dcec',fog:'#d6c8c1',ground:'#79725d',strength:1.5,ambient:1.7,elevation:.14,azimuth:1.2,exposure:1.05,lamps:.18},
 day:{sun:'#fffaf0',sky:'#b9ddf2',fog:'#d3e3eb',ground:'#b8c5b4',strength:1.85,ambient:2.5,elevation:.9,azimuth:.7,exposure:1.05,lamps:0},
 sunset:{sun:'#ffcf98',sky:'#d3dcec',fog:'#cfbea9',ground:'#8b7960',strength:2.15,ambient:1.9,elevation:.32,azimuth:-1.1,exposure:1.08,lamps:.12},
 dusk:{sun:'#c5c9ef',sky:'#7489b6',fog:'#7989a4',ground:'#55576b',strength:.45,ambient:1.15,elevation:-.035,azimuth:-1.3,exposure:1.12,lamps:.8},
 night:{sun:'#afc7ed',sky:'#1e3152',fog:'#172941',ground:'#202838',strength:.28,ambient:.65,elevation:.5,azimuth:-1.7,exposure:1.3,lamps:1},
}
export function treeSeed(x:number,z:number){return (Math.abs(Math.imul(Math.round(x),73856093)^Math.imul(Math.round(z),19349663))>>>0)}
/** Regional art direction, not an assertion of an individual tree's species. */
export function blossomDistrict(x:number,z:number){return x>500&&x<1950&&z>350&&z<2500}
export function treeStyle(x:number,z:number,season:WorldSeason,cherry=false){
 const seed=treeSeed(x,z),evergreen=!cherry&&seed%17===0
 const palette=season==='autumn'?['#ad512f','#c08a32','#b66a2d','#8e462f','#d0a54c']:season==='spring'?['#8dbc7e','#9bc987','#77ae76']:['#60996c','#71a576','#83b280','#579270']
 return {color:evergreen?'#487c66':cherry&&season==='blossom'?['#f5e3df','#ebc7d0','#f2dadd'][seed%3]:palette[seed%palette.length],bare:season==='winter'&&!evergreen,scale:.85+(seed%31)/100}
}
