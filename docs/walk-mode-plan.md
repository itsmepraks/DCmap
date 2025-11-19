# Walk Mode Overhaul – Implementation Notes

This document tracks the Escape Road-style traversal work. Each phase corresponds to a repo change so future contributors can reason about the pipeline quickly.

## Phase 1 – Core Architecture
- Introduced `PlayerProvider` (`app/lib/playerState.ts`) to centralize pose, locomotion, and camera rig configuration.
- Added `useMapInitialization` to keep Mapbox bootstrap logic in one place.

## Phase 2 – Walkable Graph
- Curated `public/data/dc_walkable_roads.geojson` to define the walk+ride network.
- Script: `npm run build:walk-graph` executes `scripts/buildWalkGraph.ts` (Turf-driven) and regenerates `public/data/walk_graph.json`.

## Phase 3 – Locomotion Controller
- `useWalkController` owns WASD input, dt-based acceleration, nav-graph snapping, and proximity checks.
- Movement events update `PlayerContext`, so HUD + minimap stay in sync without prop drilling.

## Phase 4 – Chase Camera Rig
- `useChaseCamera` converts player pose to Mapbox free-camera coordinates (meters → Mercator units) and lerps using avatar-specific rig presets.
- Enable/disable via walk toggle; cleanup restores the classic pitch/bearing.

## Phase 5 – Avatar & Scooter Assets
- Added the 🛵 moped avatar with CSS/HTML rendering, glowing wheels, and audio cues.
- `Realistic3DAvatars` now synthesizes footsteps (triangle blips) and engine loops (sawtooth oscillator) via Web Audio.
- Avatar selector/instructions updated to surface the new locomotion profile.

## Phase 6 – HUD & Telemetry
- `ConsolidatedHUD`, `Minimap`, and `WalkTelemetry` consume `PlayerContext` directly.
- Debug overlay toggled with `NEXT_PUBLIC_DEBUG_WALK=1`.

## Phase 7 – Testing & QA Notes
- Manual pass checklist:
  - Walk + sprint along Constitution Ave (human) and verify snapping.
  - Swap to scooter, confirm turbo audio + chase cam smoothing.
  - Enable `NEXT_PUBLIC_DEBUG_WALK=1` and confirm telemetry updates.
  - Rebuild the graph (`npm run build:walk-graph`) to ensure script output is deterministic.

> Tip: If Mapbox refuses to resume audio (autoplay policies), trigger movement with a mouse click first to resume the `AudioContext`.




