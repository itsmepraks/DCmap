# Phase 2 Implementation Guide

This document outlines the implementation strategy for Phase 2 features of Project Anima DC.

## Overview

Phase 2 adds two advanced data visualization layers:
1. **Animated Greenery Layer** - Tree canopy with seasonal variations
2. **Dynamic Heat Map** - Urban temperature visualization by month

## Architecture Extension Points

The Phase 1 architecture was designed with Phase 2 in mind. Here are the key extension points:

### 1. Layer System
- **Location**: `app/components/map/layers/`
- **Pattern**: Each layer is a self-contained component that uses the `useMap` hook
- **Lifecycle**: Layers initialize when map is ready, cleanup on unmount
- **Visibility**: Controlled via props from parent state

### 2. UI Controls
- **Location**: `app/components/ui/controls/`
- **Integration**: Render conditionally in `Sidebar.tsx` based on active layer
- **State**: Managed in `page.tsx` and passed to layer components

### 3. Type Definitions
- **Location**: `app/types/map.ts`
- **Existing types**: `TreeProperties`, `HeatmapProperties` already defined
- **Extend as needed**: Add new interfaces for layer-specific data

### 4. State Management
- **Location**: `app/page.tsx`
- **Current structure**:
  ```typescript
  const [layersVisible, setLayersVisible] = useState({
    museums: false,
    trees: false,
    heatmap: false,
  })
  ```
- **Add layer-specific state** (e.g., `selectedSeason`, `selectedMonth`)

## Feature 4: Animated Greenery Layer

### Data Preparation

#### Step 1: Obtain Tree Data
1. Visit [Open Data DC - Urban Forestry Street Trees](https://opendata.dc.gov/datasets/urban-forestry-street-trees)
2. Download as GeoJSON
3. Expected properties:
   - `COMMON_NAME` - Tree species common name
   - `SPECIES` - Scientific name
   - `DBH` - Diameter at breast height
   - `CONDITION` - Tree health status

#### Step 2: Data Validation & Cleaning
```python
# Python script example using geopandas
import geopandas as gpd

# Load data
trees = gpd.read_file('raw_trees.geojson')

# Clean properties
trees['COMMON_NAME'] = trees['COMMON_NAME'].fillna('Unknown')
trees['SPECIES'] = trees['SPECIES'].str.lower()

# Keep only necessary columns
trees = trees[['geometry', 'COMMON_NAME', 'SPECIES', 'DBH', 'CONDITION']]

# Save cleaned version
trees.to_file('public/data/dc_trees.geojson', driver='GeoJSON')
```

### Implementation Steps

#### Step 1: Create Seasonal Icons
Create SVG icons in `/public/icons/`:
- `tree-spring.svg` - Light green, blossoms for cherry
- `tree-summer.svg` - Dark green, full foliage
- `tree-fall.svg` - Orange/red, autumn colors
- `tree-winter.svg` - Brown/grey, bare branches
- `cherry-blossom.svg` - Special icon for cherry trees in spring

Icon specifications:
- 32x32px viewBox
- Use consistent color schemes
- Optimize with SVGO

#### Step 2: Implement TreesLayer Component

Replace stub in `app/components/map/layers/TreesLayer.tsx`:

```typescript
'use client'

import { useEffect, useRef } from 'react'
import { useMap } from '@/app/lib/MapContext'
import type mapboxgl from 'mapbox-gl'

interface TreesLayerProps {
  visible: boolean
  season: 'spring' | 'summer' | 'fall' | 'winter'
}

const LAYER_ID_CLUSTERS = 'trees-clusters'
const LAYER_ID_CLUSTER_COUNT = 'trees-cluster-count'
const LAYER_ID_UNCLUSTERED = 'trees-unclustered'
const SOURCE_ID = 'trees-source'

export default function TreesLayer({ visible, season }: TreesLayerProps) {
  const { map } = useMap()
  const layerInitialized = useRef(false)

  useEffect(() => {
    if (!map || layerInitialized.current) return

    const initializeLayer = async () => {
      // Load seasonal icons
      await loadSeasonalIcons(map)

      // Fetch tree data
      const response = await fetch('/data/dc_trees.geojson')
      const data = await response.json()

      // Add source with clustering
      map.addSource(SOURCE_ID, {
        type: 'geojson',
        data: data,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      })

      // Add cluster circles layer
      map.addLayer({
        id: LAYER_ID_CLUSTERS,
        type: 'circle',
        source: SOURCE_ID,
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51bbd6', 100,
            '#f1f075', 250,
            '#f28cb1'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20, 100,
            30, 250,
            40
          ]
        },
        layout: {
          visibility: visible ? 'visible' : 'none',
        },
      })

      // Add cluster count labels
      map.addLayer({
        id: LAYER_ID_CLUSTER_COUNT,
        type: 'symbol',
        source: SOURCE_ID,
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-size': 12,
          visibility: visible ? 'visible' : 'none',
        },
      })

      // Add unclustered points
      map.addLayer({
        id: LAYER_ID_UNCLUSTERED,
        type: 'symbol',
        source: SOURCE_ID,
        filter: ['!', ['has', 'point_count']],
        layout: {
          'icon-image': getSeasonalIconExpression(season),
          'icon-size': 0.8,
          'icon-allow-overlap': false,
          visibility: visible ? 'visible' : 'none',
        },
      })

      // Add click handlers
      setupInteractions(map)

      layerInitialized.current = true
    }

    initializeLayer()
  }, [map])

  // Update visibility
  useEffect(() => {
    if (!map || !layerInitialized.current) return
    
    const visibility = visible ? 'visible' : 'none'
    map.setLayoutProperty(LAYER_ID_CLUSTERS, 'visibility', visibility)
    map.setLayoutProperty(LAYER_ID_CLUSTER_COUNT, 'visibility', visibility)
    map.setLayoutProperty(LAYER_ID_UNCLUSTERED, 'visibility', visibility)
  }, [map, visible])

  // Update seasonal icons
  useEffect(() => {
    if (!map || !layerInitialized.current) return
    
    map.setLayoutProperty(
      LAYER_ID_UNCLUSTERED,
      'icon-image',
      getSeasonalIconExpression(season)
    )
  }, [map, season])

  return null
}

// Helper functions
async function loadSeasonalIcons(map: mapboxgl.Map) {
  const icons = ['spring', 'summer', 'fall', 'winter', 'cherry-blossom']
  for (const icon of icons) {
    const img = await loadImage(`/icons/tree-${icon}.svg`)
    if (!map.hasImage(`tree-${icon}`)) {
      map.addImage(`tree-${icon}`, img)
    }
  }
}

function getSeasonalIconExpression(season: string) {
  return [
    'case',
    ['==', ['get', 'SPECIES'], 'cherry'],
    season === 'spring' ? 'tree-cherry-blossom' : `tree-${season}`,
    `tree-${season}`
  ]
}

function setupInteractions(map: mapboxgl.Map) {
  // Zoom into cluster on click
  map.on('click', LAYER_ID_CLUSTERS, (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: [LAYER_ID_CLUSTERS]
    })
    const clusterId = features[0].properties.cluster_id
    const source = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource
    
    source.getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) return
      map.easeTo({
        center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
        zoom: zoom
      })
    })
  })

  // Show popup for individual trees
  map.on('click', LAYER_ID_UNCLUSTERED, (e) => {
    if (!e.features || e.features.length === 0) return
    
    const feature = e.features[0]
    const { COMMON_NAME, SPECIES, CONDITION } = feature.properties
    
    new mapboxgl.Popup()
      .setLngLat((feature.geometry as GeoJSON.Point).coordinates as [number, number])
      .setHTML(`
        <div class="tree-popup">
          <h3 class="font-bold">${COMMON_NAME}</h3>
          <p class="text-sm text-gray-600">${SPECIES}</p>
          <p class="text-xs">Condition: ${CONDITION}</p>
        </div>
      `)
      .addTo(map)
  })

  // Change cursor
  map.on('mouseenter', LAYER_ID_CLUSTERS, () => {
    map.getCanvas().style.cursor = 'pointer'
  })
  map.on('mouseleave', LAYER_ID_CLUSTERS, () => {
    map.getCanvas().style.cursor = ''
  })
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}
```

#### Step 3: Integrate SeasonalControls

Update `app/page.tsx`:
```typescript
const [selectedSeason, setSelectedSeason] = useState<'spring' | 'summer' | 'fall' | 'winter'>('summer')
```

Update `app/components/ui/Sidebar.tsx` to show SeasonalControls when trees layer is active.

#### Step 4: Update Map Component

In `app/components/map/Map.tsx`, import and render TreesLayer:
```typescript
import TreesLayer from './layers/TreesLayer'

// In JSX
{map && <TreesLayer visible={layersVisible.trees} season={selectedSeason} />}
```

## Feature 5: Dynamic Heat Map

### Data Preparation

This is the most complex data preparation task, requiring satellite data processing.

#### Step 1: Obtain Satellite Data

**Option A: NASA MODIS LST**
1. Visit [NASA Earthdata](https://earthdata.nasa.gov/)
2. Search for MODIS Land Surface Temperature products
3. Download for D.C. region (lat: 38.8-39.0, lon: -77.1 to -76.9)
4. Get monthly averages for all 12 months

**Option B: Landsat Thermal Data**
1. Use Google Earth Engine or USGS Earth Explorer
2. Filter by D.C. bounding box and date range
3. Calculate thermal band averages

#### Step 2: Process Raster Data

Use Python with QGIS or command-line tools:

```python
import rasterio
import geopandas as gpd
from shapely.geometry import box
import numpy as np

# Create grid over D.C.
def create_grid(bounds, cell_size=0.005):
    """Create a grid of polygons"""
    minx, miny, maxx, maxy = bounds
    
    polygons = []
    for x in np.arange(minx, maxx, cell_size):
        for y in np.arange(miny, maxy, cell_size):
            polygons.append(box(x, y, x + cell_size, y + cell_size))
    
    return gpd.GeoDataFrame({'geometry': polygons}, crs='EPSG:4326')

# Process each month's raster
def extract_temperature(grid, raster_path):
    """Extract average temperature for each grid cell"""
    with rasterio.open(raster_path) as src:
        temps = []
        for idx, poly in grid.iterrows():
            # Get raster values within polygon
            values = []
            # ... extraction logic
            temps.append(np.mean(values))
    return temps

# Main processing
dc_bounds = (-77.12, 38.79, -76.91, 39.00)
grid = create_grid(dc_bounds)

# Process each month
for month in range(1, 13):
    raster_path = f'lst_data/month_{month:02d}.tif'
    temps = extract_temperature(grid, raster_path)
    grid[f'temp_{month_names[month-1].lower()[:3]}'] = temps

# Save as GeoJSON
grid.to_file('public/data/dc_heat_monthly.geojson', driver='GeoJSON')
```

### Implementation Steps

#### Step 1: Implement HeatmapLayer Component

Replace stub in `app/components/map/layers/HeatmapLayer.tsx`:

```typescript
'use client'

import { useEffect, useRef } from 'react'
import { useMap } from '@/app/lib/MapContext'

interface HeatmapLayerProps {
  visible: boolean
  month: number // 1-12
}

const LAYER_ID = 'heatmap-layer'
const SOURCE_ID = 'heatmap-source'

const monthProperties = [
  'temp_jan', 'temp_feb', 'temp_mar', 'temp_apr',
  'temp_may', 'temp_jun', 'temp_jul', 'temp_aug',
  'temp_sep', 'temp_oct', 'temp_nov', 'temp_dec'
]

export default function HeatmapLayer({ visible, month }: HeatmapLayerProps) {
  const { map } = useMap()
  const layerInitialized = useRef(false)

  useEffect(() => {
    if (!map || layerInitialized.current) return

    const initializeLayer = async () => {
      const response = await fetch('/data/dc_heat_monthly.geojson')
      const data = await response.json()

      map.addSource(SOURCE_ID, {
        type: 'geojson',
        data: data,
      })

      map.addLayer({
        id: LAYER_ID,
        type: 'heatmap',
        source: SOURCE_ID,
        paint: {
          // Weight based on selected month property
          'heatmap-weight': ['get', monthProperties[month - 1]],
          
          // Intensity increases with zoom
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 1,
            12, 3
          ],
          
          // Color gradient
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(33,102,172,0)',
            0.2, 'rgb(103,169,207)',
            0.4, 'rgb(209,229,240)',
            0.6, 'rgb(253,219,199)',
            0.8, 'rgb(239,138,98)',
            1, 'rgb(178,24,43)'
          ],
          
          // Radius
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 2,
            12, 20
          ],
        },
        layout: {
          visibility: visible ? 'visible' : 'none',
        },
      })

      layerInitialized.current = true
    }

    initializeLayer()
  }, [map])

  // Update visibility
  useEffect(() => {
    if (!map || !layerInitialized.current) return
    
    map.setLayoutProperty(
      LAYER_ID,
      'visibility',
      visible ? 'visible' : 'none'
    )
  }, [map, visible])

  // Update month weight
  useEffect(() => {
    if (!map || !layerInitialized.current) return
    
    map.setPaintProperty(
      LAYER_ID,
      'heatmap-weight',
      ['get', monthProperties[month - 1]]
    )
  }, [map, month])

  return null
}
```

#### Step 2: Integrate MonthSlider

Update `app/page.tsx`:
```typescript
const [selectedMonth, setSelectedMonth] = useState(7) // July
```

Update Sidebar to show MonthSlider when heatmap layer is active.

#### Step 3: Update Map Component

```typescript
import HeatmapLayer from './layers/HeatmapLayer'

// In JSX
{map && <HeatmapLayer visible={layersVisible.heatmap} month={selectedMonth} />}
```

## Testing Strategy

### Performance Testing
1. Load all layers simultaneously
2. Toggle layers rapidly
3. Test on various zoom levels
4. Monitor FPS in Chrome DevTools

### Data Validation
1. Verify GeoJSON structure with geojson.io
2. Check coordinate ranges (D.C. bounds)
3. Validate property types and values
4. Test with partial data (subset)

### UI/UX Testing
1. Smooth animations on layer toggle
2. Clear visual hierarchy
3. Intuitive controls
4. Responsive on different screen sizes

## Performance Optimization Tips

### For Trees Layer
- Use `icon-allow-overlap: false` to reduce markers
- Adjust `clusterRadius` based on data density
- Consider zoom-dependent icon sizing
- Implement layer caching if data doesn't change

### For Heatmap Layer
- Grid resolution affects performance (larger cells = faster)
- Use appropriate `heatmap-intensity` values
- Test `heatmap-radius` at different zoom levels
- Consider pre-aggregating data

## Troubleshooting

### Trees Layer Issues
- **Icons not loading**: Check icon file paths and `map.hasImage()`
- **Clustering not working**: Verify source configuration
- **Poor performance**: Reduce cluster radius or increase `clusterMaxZoom`

### Heatmap Issues
- **Heatmap too intense/faint**: Adjust `heatmap-intensity` or `heatmap-weight`
- **Month slider not updating**: Check paint property is being set
- **Colors incorrect**: Verify `heatmap-color` interpolation steps

## Next Steps After Phase 2

- Custom 3D building extrusions
- Time-series animations (seasonal tree changes automatically cycling)
- Combined layer effects (e.g., heat + tree density correlation)
- Export/share specific map views
- User annotations and bookmarks

---

**Document Version**: 1.0
**Last Updated**: October 17, 2025
**Status**: Ready for Phase 2 Implementation

