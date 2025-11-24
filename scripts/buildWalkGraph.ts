import fs from 'fs'
import path from 'path'
import type { FeatureCollection, LineString, MultiLineString, Position } from 'geojson'
import { distance as turfDistance, point as turfPoint } from '@turf/turf'

interface WalkGraphEdge {
  id: string
  distance: number
  width: number
  speed: {
    human: number
    scooter: number
  }
  scooterAllowed: boolean
  class: string | null
  surface: string | null
}

interface WalkGraphNode {
  id: string
  lng: number
  lat: number
  classes: string[]
  surfaces: string[]
  neighbors: WalkGraphEdge[]
}

interface WalkGraphFile {
  metadata: {
    generatedAt: string
    source: string
    totalNodes: number
  }
  nodes: WalkGraphNode[]
}

interface NodeBuilder {
  id: string
  lng: number
  lat: number
  classes: Set<string>
  surfaces: Set<string>
  neighbors: Map<string, WalkGraphEdge>
}

const CLASS_WIDTH_MAP: Record<string, number> = {
  motorway: 12,
  trunk: 11,
  primary: 9,
  secondary: 8,
  tertiary: 7,
  residential: 6,
  pedestrian: 5,
  path: 3,
  sidewalk: 4,
  service: 4,
  default: 5
}

const HUMAN_SPEEDS = {
  fast: 1.7,
  normal: 1.4,
  slow: 1.1
}

const SCOOTER_SPEEDS = {
  fast: 8,
  normal: 6,
  slow: 4
}

const RAW_SOURCE_PATH = path.join(process.cwd(), 'public', 'data', 'dc_walkable_roads.geojson')
const OUTPUT_PATH = path.join(process.cwd(), 'public', 'data', 'walk_graph.json')

const SCOOTER_BANNED_CLASSES = new Set(['pedestrian', 'sidewalk'])
const SCOOTER_BANNED_SURFACES = new Set(['gravel', 'dirt', 'stairs'])

let nodeCounter = 0
const nodes = new Map<string, NodeBuilder>()

function coordKey([lng, lat]: Position) {
  return `${lng.toFixed(6)},${lat.toFixed(6)}`
}

function inferWidth(className?: string | null) {
  if (!className) return CLASS_WIDTH_MAP.default
  return CLASS_WIDTH_MAP[className] ?? CLASS_WIDTH_MAP.default
}

function inferSpeedProfile(className?: string | null, surface?: string | null) {
  let humanProfile = HUMAN_SPEEDS.normal
  let scooterProfile = SCOOTER_SPEEDS.normal

  if (className === 'primary' || className === 'secondary') {
    humanProfile = HUMAN_SPEEDS.fast
    scooterProfile = SCOOTER_SPEEDS.fast
  } else if (className === 'path' || surface === 'gravel') {
    humanProfile = HUMAN_SPEEDS.slow
    scooterProfile = SCOOTER_SPEEDS.slow
  } else if (className === 'pedestrian') {
    humanProfile = HUMAN_SPEEDS.normal
    scooterProfile = SCOOTER_SPEEDS.slow
  }

  return {
    human: humanProfile,
    scooter: scooterProfile
  }
}

function inferScooterAllowed(className?: string | null, surface?: string | null) {
  if (className && SCOOTER_BANNED_CLASSES.has(className)) return false
  if (surface && SCOOTER_BANNED_SURFACES.has(surface)) return false
  return true
}

function ensureNode(position: Position, featureProps: Record<string, any>): NodeBuilder {
  const key = coordKey(position)
  const existing = nodes.get(key)
  if (existing) {
    if (featureProps?.class) existing.classes.add(featureProps.class)
    if (featureProps?.surface) existing.surfaces.add(featureProps.surface)
    return existing
  }

  nodeCounter += 1
  const node: NodeBuilder = {
    id: `node-${nodeCounter.toString().padStart(4, '0')}`,
    lng: position[0],
    lat: position[1],
    classes: new Set(featureProps?.class ? [featureProps.class] : []),
    surfaces: new Set(featureProps?.surface ? [featureProps.surface] : []),
    neighbors: new Map()
  }

  nodes.set(key, node)
  return node
}

function connectNodes(
  a: Position,
  b: Position,
  featureProps: Record<string, any>
) {
  const nodeA = ensureNode(a, featureProps)
  const nodeB = ensureNode(b, featureProps)

  const className = featureProps?.class ?? null
  const surface = featureProps?.surface ?? null
  const width = inferWidth(className)
  const speed = inferSpeedProfile(className, surface)
  const scooterAllowed = inferScooterAllowed(className, surface)
  const segmentDistance = turfDistance(turfPoint(a), turfPoint(b), { units: 'meters' })

  const edgeFromA: WalkGraphEdge = {
    id: nodeB.id,
    distance: parseFloat(segmentDistance.toFixed(2)),
    width,
    speed,
    scooterAllowed,
    class: className,
    surface
  }

  const edgeFromB: WalkGraphEdge = {
    ...edgeFromA,
    id: nodeA.id
  }

  nodeA.neighbors.set(nodeB.id, edgeFromA)
  nodeB.neighbors.set(nodeA.id, edgeFromB)
}

function processFeatureCollection(collection: FeatureCollection<LineString | MultiLineString>) {
  for (const feature of collection.features) {
    if (!feature.geometry) continue
    const props = feature.properties ?? {}

    if (feature.geometry.type === 'LineString') {
      const coords = feature.geometry.coordinates
      for (let i = 0; i < coords.length - 1; i++) {
        connectNodes(coords[i], coords[i + 1], props)
      }
    } else if (feature.geometry.type === 'MultiLineString') {
      for (const line of feature.geometry.coordinates) {
        for (let i = 0; i < line.length - 1; i++) {
          connectNodes(line[i], line[i + 1], props)
        }
      }
    }
  }
}

function serializeGraph(): WalkGraphFile {
  const serializedNodes: WalkGraphNode[] = Array.from(nodes.values()).map((node) => ({
    id: node.id,
    lng: node.lng,
    lat: node.lat,
    classes: Array.from(node.classes),
    surfaces: Array.from(node.surfaces),
    neighbors: Array.from(node.neighbors.values())
  }))

  return {
    metadata: {
      generatedAt: new Date().toISOString(),
      source: 'public/data/dc_walkable_roads.geojson',
      totalNodes: serializedNodes.length
    },
    nodes: serializedNodes
  }
}

function buildWalkGraph() {
  console.log('🛣️  Building walk graph…')

  if (!fs.existsSync(RAW_SOURCE_PATH)) {
    throw new Error(`Missing source GeoJSON at ${RAW_SOURCE_PATH}`)
  }

  const raw = fs.readFileSync(RAW_SOURCE_PATH, 'utf-8')
  const geojson = JSON.parse(raw) as FeatureCollection<LineString | MultiLineString>
  processFeatureCollection(geojson)

  const graph = serializeGraph()
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(graph, null, 2))

  console.log(`✅ Walk graph generated with ${graph.metadata.totalNodes} nodes`)
  console.log(`📄 Output: ${OUTPUT_PATH}`)
}

buildWalkGraph()






