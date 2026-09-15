export const CITY_TILE_SIZE = 256
export function cityTileKey(x: number, z: number) { return `${Math.floor(x / CITY_TILE_SIZE)}_${Math.floor(z / CITY_TILE_SIZE)}` }
export function nearbyCityTiles(x: number, z: number, radius = 2) {
  const tx = Math.floor(x / CITY_TILE_SIZE), tz = Math.floor(z / CITY_TILE_SIZE)
  const keys: string[] = []
  for (let dx = -radius; dx <= radius; dx++) for (let dz = -radius; dz <= radius; dz++) keys.push(`${tx + dx}_${tz + dz}`)
  return keys.sort((a, b) => {
    const distance = (key: string) => { const [i, j] = key.split('_').map(Number); return (i - tx) ** 2 + (j - tz) ** 2 }
    return distance(a) - distance(b)
  })
}
