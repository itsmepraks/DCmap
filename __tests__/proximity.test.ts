import { getNearbyLandmarks, isVisitedPlace } from '@/app/lib/proximity'

describe('visited place matching', () => {
  it('matches landmarks by id, slug, and display name', () => {
    const visited = new Set(['Washington Monument'])

    expect(isVisitedPlace(visited, 'washington-monument', 'Washington Monument')).toBe(true)
    expect(isVisitedPlace(visited, 'washington-monument')).toBe(true)
    expect(isVisitedPlace(visited, undefined, 'Washington Monument')).toBe(true)
  })

  it('matches museums across prefixed ids and names', () => {
    const visited = new Set(['museum-national-air-and-space-museum'])

    expect(isVisitedPlace(visited, 'national-air-and-space-museum', 'National Air & Space Museum')).toBe(true)
    expect(isVisitedPlace(visited, 'National Air & Space Museum')).toBe(true)
    expect(isVisitedPlace(visited, undefined, 'National Air & Space Museum')).toBe(true)
  })

  it('does not return already visited places in nearby suggestions', () => {
    const visited = new Set(['museum-national-air-and-space-museum'])
    const nearby = getNearbyLandmarks(
      [-77.0199, 38.8882],
      [
        {
          id: 'national-air-and-space-museum',
          name: 'National Air & Space Museum',
          icon: 'museum',
          coordinates: [-77.0199, 38.8882],
        },
        {
          id: 'national-gallery-of-art',
          name: 'National Gallery of Art',
          icon: 'museum',
          coordinates: [-77.0205, 38.8913],
        },
      ],
      1000,
      visited
    )

    expect(nearby.map((place) => place.name)).toEqual(['National Gallery of Art'])
  })
})
