# Project Anima DC - TODO List

## Phase 1: MVP Implementation ✅ **COMPLETE - October 24, 2025**

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

### Custom Map Style ✅
- [x] Create dc-illustrated-style.json with custom colors
- [x] Upload to Mapbox Studio
- [x] Configure custom style in .env.local
- [x] Test and verify illustrated map renders correctly

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

### User Testing ✅
- [x] Test custom map style rendering
- [x] Verify museum popups display correctly
- [x] Confirm all animations working smoothly

---

## Phase 2: Post-MVP Features

### Greenery Layer (F4) ✅ **COMPLETE - October 24, 2025**
- [x] Obtain real dc_trees.geojson with 50 trees across D.C.
- [x] Clean and validate tree data properties (COMMON_NAME, SPECIES, DBH, CONDITION, SEASON_TYPE)
- [x] Create seasonal SVG icons (spring/cherry-blossom, summer/leaf-green, fall/leaf-orange, winter/bare)
- [x] Implement TreesLayer with clustering
  - [x] Configure cluster settings (maxZoom: 14, radius: 50)
  - [x] Create cluster circle layer with graduated sizes and colors
  - [x] Create cluster count layer
  - [x] Create unclustered point layer with seasonal icons
  - [x] Add cluster click to zoom functionality
- [x] Implement seasonal icon switching logic with map.setLayoutProperty()
- [x] Integrate SeasonalControls in Sidebar (appears when Greenery layer is active)
- [x] Add tree popup with species info (Common Name, Species, DBH, Condition)
- [x] Add hover cursor changes for better UX
- [x] Test performance with full dataset

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

- [ ] Walk controller state re-renders the entire `Map` tree every animation frame; `useWalkController` should stop calling `setControllerState` on each tick or move the state into refs/workers.
- [ ] `Realistic3DAvatars` rebuilds huge `innerHTML` strings and audio graphs every frame, which is tanking FPS on mid-range devices.
- [ ] HUD distance readouts (`CompassHUD`, `ConsolidatedHUD`) label raw meter values as “km”, so 200 m shows up as “200.0 km”.
- [ ] The Mapbox init hook logs token existence/length/preview to the console, effectively leaking the access token.
- [ ] Heatmap toggle is exposed in the sidebar but `HeatmapLayer` is still a stub—toggling does nothing.
- [ ] `playerState.ts` shim was meant to re-export the `.tsx` provider but currently duplicates the entire implementation and violates module boundaries.

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
- Custom illustrated map style successfully uploaded and tested

### Reflection on F4 (Greenery Layer) Implementation - October 24, 2025

**What Went Well:**
- Followed PRD specifications precisely for clustering configuration
- Reused existing pattern from MuseumsLayer for consistency
- Clean separation of concerns: TreesLayer handles rendering, SeasonalControls handles UI, page.tsx manages state
- Proper lifecycle management with useRef to prevent double initialization
- All existing functionality remained intact - no regressions

**Technical Decisions:**
- Used `createImageBitmap()` for loading SVG icons - provides better performance than base64
- Implemented 3 separate useEffects for initialization, visibility, and season changes - cleaner than one monolithic effect
- Graduated cluster colors (#7ED957 → #66BB6A → #4CAF50) match the greenery theme
- Season state managed at page level for potential future cross-layer interactions

**Architecture Improvements:**
- TreesLayer is fully self-contained and can be easily removed or modified
- SeasonalControls component is reusable for other time-based visualizations
- Type-safe season prop prevents invalid season values

**What Could Be Enhanced (Future):**
- Could add more trees (currently 50, could scale to 1000+ with real Open Data DC dataset)
- Could add filtering by tree species
- Could add tree health visualization (color-code by condition)
- Could add "Find trees near me" geolocation feature

**Performance:**
- Clustering works smoothly with 50 trees
- Icon switching is instantaneous with no lag
- No memory leaks - proper cleanup in useEffect return function

---

### UI Cleanup and Overlap Fixes - January 12, 2026 ✅

**User Feedback:**
- "all of the divs feel cluttered, cannot view the information properly"
- "overlap, which hides most of the info"
- "Quests", "Available", "The White House" overlap issues

**Problem Identified:**
- `QuestPanel` (top-right) overlapped with `UnifiedHUD` stack (Recommendation, Quest Objective cards) also top-right
- Multiple independent fixed-position elements competing for the same screen space
- Lack of a layout manager for HUD notifications

**Solution Implemented:**

1. **Relocated Quest Panel (COMPLETED)** ✅
   - Moved `QuestPanel` from `top-4 right-4` to `top-20 left-4`
   - Positioned below the `MiniStatsBar` (top-left) to balance the screen layout
   - Updated drag constraints to reflect left-side positioning

2. **Consolidated UnifiedHUD Stack (COMPLETED)** ✅
   - Created a flexible vertical stack container in `UnifiedHUD.tsx`
   - Position: `fixed top-20 right-4 sm:top-24 sm:right-6`
   - All right-side notifications (Recommendation, Fly Stats, Quest Objective, Nearest Undiscovered) now stack automatically
   - Removed hardcoded absolute positions for individual cards
   - Added `pointer-events-none` to container so clicks pass through empty space

**Result:**
- **Zero overlap** between Quests and HUD notifications
- **Clean layout**: Stats (Top-Left), Quests (Left), Notifications (Top-Right Stack), Controls (Bottom)
- **Automatic stacking** for multiple notifications
- **Balanced screen usage**

**Files Modified:**
- `app/components/game/QuestPanel.tsx`
- `app/components/ui/hud/UnifiedHUD.tsx`

---

### Progressive Waypoint System - January 2, 2026 ✅

**Problem Identified:**
- All waypoints/markers rendered at the same time
- No "game-ish" logic for progressive objective display
- Nearest waypoint HUD not reflective of quest progress
- No visual hierarchy between current and upcoming objectives

**Solution: Progressive Waypoint Revelation System**

1. **Created `progressiveWaypointSystem.ts`** ✅
   - `getCurrentObjective(quest)` - Gets the first uncompleted objective
   - `getUpcomingObjectives(quest)` - Gets remaining objectives after current
   - `calculateWaypointOpacity(distance, isPrimary)` - Fades waypoints based on proximity
   - `isWaypointVisible(distance, isPrimary)` - Distance-based visibility check (500m reveal radius)
   - `buildProgressiveWaypoints()` - Constructs waypoint list with visibility/opacity
   - `getCurrentObjectiveInfo()` - Detailed info for HUD display

2. **Refactored `QuestWaypoints.tsx`** ✅
   - Changed from "add all waypoints" to progressive system
   - Primary waypoint: Current objective (100% opacity, always visible)
   - Secondary waypoints: Within 500m (50% opacity, faded)
   - Hidden: Beyond 500m (not rendered)
   - Uses `onWaypointsUpdate` callback for state management

3. **Enhanced `WaypointLayer.tsx`** ✅
   - Added `isPrimary`, `opacity`, `isVisible` properties
   - CSS animations for primary waypoints (pulsing glow)
   - Fade-in animation for secondary waypoints appearing in range
   - Different sizes: 40px primary, 28px secondary
   - Dynamic z-index based on priority

4. **Updated `UnifiedHUD.tsx`** ✅
   - New "Quest Progress Card" showing:
     * Current objective description
     * Distance to target
     * Progress bar (X/Y objectives)
   - New "Nearest Undiscovered Landmark" card
   - Both cards clickable to navigate
   - Dismissible with X button

5. **Extended `useQuestSystem.ts`** ✅
   - Added `getObjectiveInfo()` helper for HUD
   - Added `getQuestProgressPercentage()` helper

6. **Wired `StateManager.tsx`** ✅
   - Tracks `playerPosition` from fly controller or map center
   - Computes `currentObjective` info for HUD
   - Computes `nearestUndiscovered` landmark
   - Manages `progressiveWaypoints` state
   - Passes all new props through render prop pattern

**Waypoint Visibility Rules:**

| Type | Condition | Opacity | Visual |
|------|-----------|---------|--------|
| Primary | Current objective | 100% | Pulsing glow, larger icon (40px) |
| Secondary | Within 500m, not current | 30-60% | Faded, smaller icon (28px) |
| Hidden | Beyond 500m, not current | 0% | Not rendered |

**HUD Layout (Top Right):**
1. Quest Progress Card (if active quest)
   - Quest icon + progress count (e.g., "2/4")
   - 🎯 Current objective description
   - Distance in meters/km
   - Progress bar with gradient

2. Nearest Undiscovered Card (below quest card)
   - 🧭 Landmark name
   - Distance to nearest unvisited

**Technical Implementation:**

```typescript
// Progressive waypoint visibility
const REVEAL_RADIUS_METERS = 500

// Primary waypoint - always visible
if (isPrimary) return { opacity: 1.0, isVisible: true }

// Secondary waypoints - distance-based reveal
if (distance <= REVEAL_RADIUS_METERS) {
  const normalizedDistance = distance / REVEAL_RADIUS_METERS
  return { 
    opacity: 0.6 - (normalizedDistance * 0.3),
    isVisible: true 
  }
}
return { opacity: 0, isVisible: false }
```

**Files Created:**
- `app/lib/progressiveWaypointSystem.ts` - Core utility functions

**Files Modified:**
- `app/components/game/QuestWaypoints.tsx` - Progressive waypoint generation
- `app/components/map/WaypointLayer.tsx` - Enhanced rendering with animations
- `app/components/ui/hud/UnifiedHUD.tsx` - Quest objective + nearest landmark cards
- `app/hooks/useQuestSystem.ts` - Current objective helpers
- `app/components/layout/StateManager.tsx` - Position tracking + state management
- `app/components/layout/MapSection.tsx` - Progressive waypoint props
- `app/components/layout/HUDSystem.tsx` - New HUD props
- `app/page.tsx` - Wire up all new props

**Result:**
🎯 **Sequential objective targeting** - Only current objective is primary
🌫️ **Distance-based fog of war** - Upcoming objectives fade in within 500m
📍 **Clear visual hierarchy** - Primary waypoints pulse, secondary fade
🎮 **Game-like progression** - Focus on one objective at a time
📊 **Quest progress HUD** - Shows current objective + distance + progress bar
🧭 **Nearest landmark HUD** - Always shows closest undiscovered landmark
✨ **Smooth animations** - Pulsing primary, fade-in secondary
🔧 **Zero linting errors** - Clean TypeScript implementation

---

### Season, Trees, Parks, and Museum Fixes - January 12, 2026 ✅

**User Feedback:**
- "Trees and parks not rendering properly according to live data"
- "When we change season, it doesn't show properly"
- "Clicking on tree or park, we could gain info - not happening"
- "Live trees in DC not populating like before"
- "Museum should have visible icon from far apart"

**Problems Identified:**
1. TreesLayer was loading from `dmv_trees.geojson` (few generic entries) instead of `dc_trees.geojson` (47 trees with COMMON_NAME, SPECIES, etc.)
2. Spring season colors were GREEN instead of PINK (cherry blossom theme)
3. Tree icons too small and clustered too aggressively
4. Museum icons too small at lower zoom levels, not distinctive
5. TreesLayer and ParksLayer waiting for `style.load` event that had already fired

**Solutions Implemented:**

1. **Fixed TreesLayer Data Source** ✅
   - Changed from `/data/dmv_trees.geojson` to `/data/dc_trees.geojson`
   - Now loads 47 trees with proper properties (COMMON_NAME, SPECIES, DBH, CONDITION)
   - Reduced cluster radius (40 vs 60) for better visibility
   - Reduced clusterMaxZoom (13 vs 15) to show individual trees sooner

2. **Fixed Spring Season Colors** ✅
   - Trees: Changed spring base color from `#4E7A4E` (green) to `#FFB7C5` (cherry blossom pink)
   - Parks: Changed spring fill color from `#7FB37F` (green) to `#FFCDD2` (light pink)
   - Now properly shows cherry blossom theme for DC's famous spring cherry blossoms

3. **Increased Tree Icon Sizes** ✅
   - At zoom 10: 1.0 (was 0.7)
   - At zoom 14: 1.5 (was 1.1)
   - At zoom 16: 2.0 (new)
   - At zoom 18: 2.5 (was 1.8)
   - Added `icon-ignore-placement: true` to ensure icons always show

4. **Improved Museum Icon Visibility** ✅
   - Created new 64x64 museum SVG icon with prominent blue circle and Greek temple design
   - Icon sizes significantly increased at all zoom levels:
     * Zoom 8: 0.8 (was 0.4)
     * Zoom 10: 1.0 (new)
     * Zoom 12: 1.2 (was 0.6)
     * Zoom 14: 1.4 (new)
     * Zoom 16: 1.6 (was 0.8)
     * Zoom 18: 1.8 (was 1.0)
   - Added `icon-ignore-placement: true` for visibility

5. **Fixed Map Initialization Race Condition** ✅
   - Changed from `map.once('style.load', ...)` to `map.once('idle', ...)`
   - This ensures layers initialize even when style has already loaded

**Files Modified:**
- `app/components/map/layers/TreesLayer.tsx` - Data source, colors, icon sizes, init fix
- `app/components/map/layers/ParksLayer.tsx` - Season colors, init fix
- `app/components/map/layers/MuseumsLayer.tsx` - Icon sizes, loading
- `public/icons/museum.svg` - New 64x64 distinctive icon

**Result:**
🌸 **Cherry Blossom Spring** - Pink trees and parks for DC's famous spring season
🌳 **47 Real Trees** - Loading from proper DC tree dataset with species info
🏛️ **Distinctive Museums** - Large blue icons visible from far away
📍 **Better Tree Visibility** - Larger icons, less aggressive clustering
✅ **Season Changes Working** - Trees update color properly when season changes
🖱️ **Tree Info on Click** - Shows Common Name, Species, Diameter, Condition
