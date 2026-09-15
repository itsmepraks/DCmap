# Exploration overhaul

The existing visual language and streamed Mapbox Standard world are preserved. Flight now uses a physical Mercator camera instead of approximating altitude with map zoom and resetting pitch on every movement frame.

## Controls

- WASD / arrow keys: move relative to the camera. Diagonal movement has the same maximum speed as straight movement.
- Drag the map: look around; pitch remains independent of movement.
- Space / E: rise. Shift / Q: descend. R: boost.
- Street: descend to 8 meters, subject to building clearance, and tilt toward the horizon. Movement slows below 20 meters.
- Skyline: rise to 100 meters for a wider view.
- Escape or Fly: return to native map navigation. Overview, zoom, and orbit controls also leave flight so two camera controllers cannot fight.
- Touch devices: hold the on-screen direction/altitude buttons and drag the map to look.

## Rendering and state

Camera changes run on animation frames. React telemetry, player context, and proximity updates are limited to 5 Hz and do not publish identical hover snapshots. Acceleration and braking use exponential damping independent of display refresh rate. Input resets on blur and visibility changes.

Building footprints are loaded only during flight. Vector tile changes invalidate a local cache; clearance checks run on their own 250 ms timer and account for polygon holes and a short forward look-ahead. The HUD reads back applied camera height. Discovery checks run every 500 ms.

Discovery and trail inputs are memoized, preventing layer/source recreation on each flight telemetry update. Their pending load callbacks are cleaned up, and layers rebuild after style replacement. Proximity timers are cancelled on effect cleanup and refresh rounded distance as well as landmark identity. Returning to map mode clears the old flight position.

Native 3D trees, landmarks, facades, and buildings remain enabled. High-DPI displays avoid redundant MSAA, and the WebGL canvas uses normal image sampling rather than pixel-art scaling. Model loading errors are no longer silently discarded.

## Verification

- Production build, TypeScript, and build-time ESLint passed.
- 15 tests passed, including diagonal speed, frame-rate independence, braking, courtyards, controller cleanup, altitude changes while hovering, and HUD update frequency.
- Chrome checked against the development Mapbox configuration from Vercel: map and monument rendering, flight entry, descent to 8 meters, drag-to-look, keyboard input, and skyline transition. No browser runtime errors observed during these checks.
- These checks establish behavior and update budgets; they are not a measured before/after FPS benchmark across hardware.

## Limits

This remains a streamed map world, not a hand-authored city or a pedestrian navigation simulation. Generic buildings depend on the detail in Mapbox's data. No replacement landmark assets were introduced. Clearance uses loaded building footprints, not model meshes, trees, bridges, or interiors, and cannot guarantee collision protection before tiles arrive. Street mode is a low flying camera, not sidewalk pathfinding. Touch controls are implemented but still need real-device playtesting.
