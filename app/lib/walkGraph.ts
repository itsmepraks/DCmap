'use client'

export interface WalkGraphEdge {
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

export interface WalkGraphNode {
  id: string
  lng: number
  lat: number
  classes: string[]
  surfaces: string[]
  neighbors: WalkGraphEdge[]
}

export interface WalkGraph {
  metadata: {
    generatedAt: string
    source: string
    totalNodes: number
  }
  nodes: WalkGraphNode[]
}

export interface WalkGraphSegment {
  id: string
  start: {
    id: string
    lng: number
    lat: number
  }
  end: {
    id: string
    lng: number
    lat: number
  }
  width: number
  speed: {
    human: number
    scooter: number
  }
  scooterAllowed: boolean
  class: string | null
  surface: string | null
}

let cachedGraphPromise: Promise<WalkGraph> | null = null

export const loadWalkGraph = async () => {
  if (!cachedGraphPromise) {
    cachedGraphPromise = fetch('/data/walk_graph.json').then((res) => {
      if (!res.ok) {
        throw new Error('Failed to load walk graph')
      }
      return res.json()
    })
  }
  return cachedGraphPromise
}

export const buildGraphSegments = (graph: WalkGraph): WalkGraphSegment[] => {
  const segments: WalkGraphSegment[] = []
  const seenKeys = new Set<string>()
  const nodeMap = new Map(graph.nodes.map((node) => [node.id, node]))

  graph.nodes.forEach((node) => {
    node.neighbors.forEach((edge) => {
      const key = [node.id, edge.id].sort().join(':')
      if (seenKeys.has(key)) return
      seenKeys.add(key)

      const targetNode = nodeMap.get(edge.id)
      if (!targetNode) return

      segments.push({
        id: key,
        start: {
          id: node.id,
          lng: node.lng,
          lat: node.lat
        },
        end: {
          id: targetNode.id,
          lng: targetNode.lng,
          lat: targetNode.lat
        },
        width: edge.width,
        speed: edge.speed,
        scooterAllowed: edge.scooterAllowed,
        class: edge.class,
        surface: edge.surface
      })
    })
  })

  return segments
}


