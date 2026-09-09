type Position = number[]
type Polygon = { type: 'Polygon'; coordinates: Position[][] }
type MultiPolygon = { type: 'MultiPolygon'; coordinates: Position[][][] }

function insideRing(point: Position, ring: Position[]) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [x, y] = ring[i]
    const [previousX, previousY] = ring[j]
    if ((y > point[1]) !== (previousY > point[1]) &&
      point[0] < (previousX - x) * (point[1] - y) / (previousY - y) + x) inside = !inside
  }
  return inside
}

/** Footprints include holes: courtyards must remain navigable. */
export function insideBuilding(point: Position, geometry: Polygon | MultiPolygon) {
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
  return polygons.some(rings => rings.length > 0 && insideRing(point, rings[0]) && !rings.slice(1).some(ring => insideRing(point, ring)))
}
