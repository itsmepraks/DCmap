'use client'

import mapboxgl from 'mapbox-gl'

export const WALKABLE_LAYER_IDS = [
  'open-world-road-highlight',
  'open-world-paths',
  'sidewalks-left',
  'sidewalks-right',
  'road-center-lines',
  'road-edge-lines'
]

const SNAP_SEARCH_RADIUS = 38

export const snapLngLatToRoad = (mapInstance: mapboxgl.Map | null, lngLat: [number, number]) => {
  if (!mapInstance) return null
  try {
    const availableLayers = WALKABLE_LAYER_IDS.filter((layerId) => Boolean(mapInstance.getLayer(layerId)))
    if (!availableLayers.length) {
      return null
    }

    const targetPoint = mapInstance.project(lngLat)
    const bbox: [[number, number], [number, number]] = [
      [targetPoint.x - SNAP_SEARCH_RADIUS, targetPoint.y - SNAP_SEARCH_RADIUS],
      [targetPoint.x + SNAP_SEARCH_RADIUS, targetPoint.y + SNAP_SEARCH_RADIUS]
    ]
    const features = mapInstance.queryRenderedFeatures(bbox, { layers: availableLayers })
    if (!features.length) {
      return null
    }

    let closest: mapboxgl.LngLat | null = null
    let minDistance = Number.POSITIVE_INFINITY

    const projectToSegment = (a: [number, number], b: [number, number]) => {
      const aPoint = mapInstance.project(a)
      const bPoint = mapInstance.project(b)
      const abx = bPoint.x - aPoint.x
      const aby = bPoint.y - aPoint.y
      const abSquared = abx * abx + aby * aby
      if (abSquared === 0) return

      const apx = targetPoint.x - aPoint.x
      const apy = targetPoint.y - aPoint.y
      let t = (apx * abx + apy * aby) / abSquared
      t = Math.max(0, Math.min(1, t))

      const closestPoint = {
        x: aPoint.x + abx * t,
        y: aPoint.y + aby * t
      }

      const distance = Math.hypot(targetPoint.x - closestPoint.x, targetPoint.y - closestPoint.y)
      if (distance < minDistance) {
        minDistance = distance
        closest = mapInstance.unproject(closestPoint)
      }
    }

    features.forEach((feature) => {
      const geometry: any = feature.geometry
      if (!geometry) return
      if (geometry.type === 'LineString') {
        const coords = geometry.coordinates as [number, number][]
        for (let i = 0; i < coords.length - 1; i++) {
          projectToSegment(coords[i], coords[i + 1])
        }
      } else if (geometry.type === 'MultiLineString') {
        geometry.coordinates.forEach((line: [number, number][]) => {
          for (let i = 0; i < line.length - 1; i++) {
            projectToSegment(line[i], line[i + 1])
          }
        })
      }
    })

    if (!closest) {
      return null
    }
    return [closest.lng, closest.lat] as [number, number]
  } catch (error) {
    console.warn('Road snapping skipped:', error)
    return null
  }
}



