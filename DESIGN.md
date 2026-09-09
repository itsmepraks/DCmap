# DC Explorer design handoff

This records the existing interface choices preserved for the first National Mall world. The user explicitly approved the incumbent design language and requested improvements to exploration, performance, and 3D architecture. This document does not establish a redesign.

## Product and scope

Follow `PRODUCT.md`: a playable first route connects Lincoln Memorial, the Reflecting Pool, the World War II Memorial, and Washington Monument. Describe the world as an original architectural interpretation at approximate scale. The wider Mapbox explorer remains reachable through **City map**. Discovery progress and landmark stories remain part of the experience.

## Color and surface character

Keep the warm cream surfaces, terracotta borders and active controls, brown text, and earthy supporting colors. `app/lib/theme.ts` defines the incumbent cream (`#EFE6D5`), terracotta (`#C1604A`), brown (`#5D4037`), and raised tactile treatment. The world applies the same family through scoped values in `app/components/world/world.css`: paper `#f3ead7`, ink `#302c22`, muted text `#665e4c`, and edge `#b85c37`.

Panels and controls retain visible borders, modest rounded corners, and short solid lower shadows with softer ambient shadows behind them. Terracotta fills identify the selected movement mode and primary travel action. Muted green marks discoveries; blue provides visible keyboard focus. Keep these roles consistent with the existing implementation rather than replacing the shared theme palette.

## Typography and controls

The world uses Georgia for the DC mark and principal headings, with Arial/Helvetica for compact interface labels and descriptions. Numeric progress and speed use tabular numerals. Preserve the short labels, lightweight outline icons, compact supporting copy, and tactile button faces already implemented in `WorldExplorer.tsx` and `world.css`.

## Composition

The 3D world fills the viewport. The upper-left brand establishes location; the upper-right City map link provides access to the wider explorer. A collapsible route guide sits on the left, the compass on the right, and the movement/time/sound dock along the bottom. The small route overview and speed readout occupy the lower-right corner on larger screens. A subtle center marker assists looking around. Discovery notifications sit above the controls without taking pointer input.

The route guide retains four numbered stops, visited checks, a short description, **Travel here**, and **Listen** where a story exists. Help and visual quality settings remain in the cream, terracotta-bordered modal. Loading and failure states use the same typography and palette.

## Responsive and interaction treatment

Preserve the implemented responsive reductions: the center location label disappears at narrower desktop widths; the minimap disappears on small screens; branding and controls become more compact. The route guide starts collapsed below 700px and can be reopened. Coarse-pointer devices show directional and height controls using the same raised surface treatment.

Keep visible focus rings, labeled icon buttons, selected-state semantics, discovery announcements, and the reduced-motion override. Existing decorative motion is limited to short control/compass transitions and the loading indicator; the reduced-motion preference removes those transitions and animations.

## Sources of truth

- `PRODUCT.md`: approved scope and product constraints.
- `app/lib/theme.ts`: incumbent palette and tactile interface tokens.
- `app/components/world/world.css`: implemented world styles and breakpoints.
- `app/components/world/WorldExplorer.tsx`: implemented layout, labels, states, and controls.

## Expansion correction

The original `ControlDock.tsx` uses `minecraftTheme` (cream `#EFE6D5`, terracotta `#D4501E`, dark edge `#B8431A`). WorldExplorer now injects these shared values as CSS variables; controls use compact monospace labels and tighter corners. Preserve these shared tokens rather than the earlier independently chosen world palette. The user's detailed New York street reference guides depth and facade articulation only: keep DC geography and architecture, and retain the original DC interface identity.

## District navigation

The left guide now switches between the curated Mall route and searchable neighborhoods. Keep the shared paper/terracotta treatment. The destination list scrolls independently so the selected place and travel button remain reachable. The minimap uses the complete DC street/water/park coverage, replacing the linear Mall-only diagram.

## Game HUD refinement

Keep the visible Mall discovery journal and earned six-slot stamps under the journal toggle. Its next undiscovered landmark and distance are derived from actual progress and position; its travel action is functional. Opening the journal replaces this compact objective with the existing destination list. The right movement panel shows live speed and heading, flight altitude, and pace adjustment. Flight uses the original HUD's muted blue instrument treatment. Mobile retains the journal and hotbar while movement settings remain in Help. These are refinements of the incumbent gamified interface, not a replacement identity.

## Survey comparison surface

The `/survey` prototype preserves the world's cream panels, terracotta controls, compact monospace control labels and serif place title. Its data panel explains survey versus estimated heights, selected-building values and sources. Mobile collapses that panel to prioritize the geographic scene. This is an explicit real-data inspection surface, not a replacement HUD or a claim of photographed facades.

## Playable-world integration

Keep the existing tactile cream/terracotta HUD, including the movement hotbar, journal, compass, and travel map. The survey prototype is no longer promoted in the game header. The existing discovery card now links to persistent neighborhood discoveries. Sourced 2024 maximum building heights and resampled terrain are integrated into the stylized world; facade materials and authored landmarks retain their art direction. Ground elevations are shared by streets, parks, trees, buildings, flight clearance and landing checks. The authored Mall is blended into the terrain rather than rebuilding its established playable architecture.

## Seasonal atmosphere controls

The existing sun slot in the game hotbar opens a compact cream-and-terracotta panel above the dock. Time and season are independent, with visible selected states and short descriptions. Keep the tactile buttons, serif panel title and compact labels. A blossom-scene travel action goes to the basin; an optional Mall-life checkbox controls ambient pedestrians/cyclists. The panel dismisses with its close button or Escape and remains scrollable on small screens. Scene changes preserve position and exploration progress.

### Exploration HUD hierarchy
Keep the cream, terracotta, serif heading, and tactile control language. Default to an unobstructed world: compact brand/location, journal trigger, movement readout, travel entry, and bottom dock. Journal, scene, and movement details share one mutually exclusive side panel. Discovery stamps, next-stop guidance, neighborhood search, stories, and progress live inside the journal. Full travel remains accessible when the minimap is hidden on narrower screens. Escape and close buttons return focus to the panel trigger.

The minimap is a north-up local radar centered on the player: 900 m across on foot and 2.2 km in flight. Keep equal horizontal and vertical scale, a fixed center heading arrow, nearby discovery markers, and a metric scale bar. Clicking opens the full travel map; it never teleports directly. Narrow layouts keep the radar above the dock and hide it while a detail panel is open.

### Smithsonian interiors

Keep the museum experience inside the same cream-and-terracotta game language. Museums are entered through the journal or nearby exterior prompts. Inside, prioritize the walkable gallery, a compact passport/next-discovery panel, an indoor map, and a contextual inspect action. Exhibit facts, explicit source links, narration, and a short challenge live in an inspection dialog that pauses movement. XP rewards are one-time (25 inspection, 50 solved challenge); each museum awards a saved stamp after three solved discoveries. Keep the interpretive nature of the architecture and models visible; never present these compact galleries as full scans or the entire Smithsonian collection.

### Outdoor cartographic finish

Use the clarity of Apple Maps' detailed city view as a reference, without using Apple tiles or assets: fresh sage parks, blue water, cool pale stone, quiet roof tones, and distinct road/pavement colors. Preserve DC's brick rowhouse variation, real footprints, mapped street surfaces, terrain, and the original game HUD. Daylight is the default; all other times and seasons remain available. Nearby place labels are capped at four and culled for viewport overlap. Keep this pass material-driven instead of adding full-screen rendering effects or more geometry.
