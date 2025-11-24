import { buildGraphSegments, type WalkGraph } from '@/app/lib/walkGraph'

const mockGraph: WalkGraph = {
  metadata: {
    generatedAt: new Date().toISOString(),
    source: 'test',
    totalNodes: 2
  },
  nodes: [
    {
      id: 'node-a',
      lng: -77.0,
      lat: 38.9,
      classes: ['primary'],
      surfaces: ['paved'],
      neighbors: [
        {
          id: 'node-b',
          distance: 120,
          width: 9,
          speed: { human: 1.7, scooter: 8 },
          scooterAllowed: true,
          class: 'primary',
          surface: 'paved'
        }
      ]
    },
    {
      id: 'node-b',
      lng: -77.01,
      lat: 38.91,
      classes: ['primary'],
      surfaces: ['paved'],
      neighbors: [
        {
          id: 'node-a',
          distance: 120,
          width: 9,
          speed: { human: 1.7, scooter: 8 },
          scooterAllowed: true,
          class: 'primary',
          surface: 'paved'
        }
      ]
    }
  ]
}

describe('buildGraphSegments', () => {
  it('deduplicates bidirectional edges', () => {
    const segments = buildGraphSegments(mockGraph)
    expect(segments).toHaveLength(1)
    const segment = segments[0]
    expect(segment.start.id).toBe('node-a')
    expect(segment.end.id).toBe('node-b')
    expect(segment.width).toBe(9)
    expect(segment.speed.scooter).toBe(8)
  })
})






