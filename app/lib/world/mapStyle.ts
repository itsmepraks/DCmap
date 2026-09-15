import type {WorldSeason} from './atmosphere'
/** Outdoor cartographic art direction; geography and collision data stay unchanged. */
export const MAP_STYLE={terrain:'#dedfd4',water:'#78bce0',park:'#9bbd89',forest:'#86ad7f',road:'#7d8990',sidewalk:'#e9e9df',crosswalk:'#fffdf4',island:'#b3c5a2',marble:'#eeeee7',trim:'#faf9f1',stone:'#c7c9bf',path:'#deded0'}
export function lawnColor(season:WorldSeason){return season==='winter'?'#d9e0db':season==='autumn'?'#b9b58a':season==='spring'||season==='blossom'?'#a5c88d':'#98bc86'}
