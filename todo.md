# Project Anima DC - TODO List

## Phase 1: MVP Implementation ✅

### Project Setup ✅
- [x] Initialize Next.js project with TypeScript
- [x] Install dependencies (mapbox-gl, framer-motion)
- [x] Configure environment variables
- [x] Set up Tailwind CSS and global styles
- [x] Create project structure

### Core Map Canvas (F1) ✅
- [x] Create Map component with Mapbox integration
- [x] Configure default view (center on D.C., zoom 11)
- [x] Set up MapContext for state sharing
- [x] Add navigation controls
- [x] Implement full-screen responsive layout

### Animated UI Shell (F2) ✅
- [x] Create SidebarToggle component with animations
- [x] Create Sidebar component with slide-in effect
- [x] Implement staggerChildren animation for layer items
- [x] Create LayerToggle component with switch UI
- [x] Connect state management in main page

### Museums Data Layer (F3) ✅
- [x] Create mock museums.geojson with 8 D.C. museums
- [x] Design and create museum.svg icon
- [x] Implement MuseumsLayer component
- [x] Load custom icon to map
- [x] Add click handlers for popups
- [x] Style popups with museum information

### Phase 2 Scaffolding ✅
- [x] Create TreesLayer.tsx stub
- [x] Create HeatmapLayer.tsx stub
- [x] Create SeasonalControls.tsx component
- [x] Create MonthSlider.tsx component
- [x] Add placeholder GeoJSON files

### Documentation ✅
- [x] Write comprehensive README.md
- [x] Create todo.md file
- [x] Document data acquisition process
- [x] Add Mapbox setup guide
- [x] Create phase2-guide.md

---

## Phase 2: Post-MVP Features (Upcoming)

### Greenery Layer (F4) 🔄
- [ ] Obtain real dc_trees.geojson from Open Data DC
- [ ] Clean and validate tree data properties
- [ ] Create seasonal SVG icons (spring, summer, fall, winter)
- [ ] Implement TreesLayer with clustering
  - [ ] Configure cluster settings (maxZoom: 14, radius: 50)
  - [ ] Create cluster circle layer
  - [ ] Create unclustered point layer
  - [ ] Add cluster click to zoom
- [ ] Implement seasonal icon switching logic
- [ ] Integrate SeasonalControls in Sidebar
- [ ] Add tree popup with species info
- [ ] Test performance with full dataset

### Heat Map Layer (F5) 🔄
- [ ] Acquire NASA MODIS LST data for D.C. area
- [ ] Process satellite data using QGIS/Python
  - [ ] Convert raster to grid polygons
  - [ ] Calculate monthly averages
  - [ ] Create properties: temp_jan through temp_dec
  - [ ] Export as GeoJSON
- [ ] Implement HeatmapLayer component
  - [ ] Configure heatmap type layer
  - [ ] Set up dynamic heatmap-weight expression
  - [ ] Create color gradient
- [ ] Integrate MonthSlider in Sidebar
- [ ] Add month change event handler
- [ ] Update heatmap dynamically on slider change
- [ ] Test with different zoom levels

### Polish & Optimization 🔄
- [ ] Performance testing with all layers active
- [ ] Mobile responsive improvements
- [ ] Add loading states for data fetching
- [ ] Implement error boundaries
- [ ] Add analytics (optional)
- [ ] Accessibility improvements (ARIA labels, keyboard nav)
- [ ] Cross-browser testing

---

## Known Issues / Bugs 🐛

_No critical issues at this time_

---

## Future Enhancements (Beyond Phase 2) 💡

- [ ] Search functionality for locations
- [ ] Share map view URL
- [ ] Custom map style in Mapbox Studio
- [ ] 3D building extrusions
- [ ] Real-time data integration (buses, bikes)
- [ ] User preference saving
- [ ] Additional data layers (crime, demographics)
- [ ] Print/export map functionality
- [ ] Tour mode with predefined viewpoints
- [ ] Dark mode toggle

---

## Environment Setup Checklist 🔧

- [x] Node.js 18+ installed
- [ ] Mapbox account created
- [ ] NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN configured in .env.local
- [ ] Custom Mapbox style created (optional)
- [ ] Real GeoJSON data obtained from Open Data DC (Phase 2)

---

## Notes 📝

- Phase 1 focused on core functionality and clean architecture
- Code is structured for easy Phase 2 integration
- All components are properly typed with TypeScript
- Animation performance is smooth on modern browsers
- Map loads with placeholder token - replace before deployment

---

**Last Updated**: October 17, 2025
**Current Phase**: Phase 1 Complete ✅
**Next Up**: Phase 2 Planning & Data Acquisition

