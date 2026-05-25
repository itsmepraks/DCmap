# DC Map Project Vision

## Product North Star

Build an immersive 3D Washington, DC guide that feels like a playful tourist companion: realistic enough to understand the city, guided enough that new visitors know what to do, and fun enough that exploring monuments and museums feels rewarding.

The app should open in a clear 3D DC view, give the user obvious next actions, and never make the map feel broken, empty, or fake.

## Experience Principles

- Real map first: Mapbox Standard 3D buildings, landmarks, roads, water, terrain, trees, lighting, and labels are the foundation. Effects must enhance that foundation, not cover it.
- No fake stickers: Do not add oversized flat objects, decorative tree stamps, or broad color washes that sit on top of the map and make DC look artificial.
- Camera guardrails: Users can zoom, rotate, fly, and use 360, but the app should keep them inside useful DC viewpoints. The map should not drift into a pale, distant, empty model view.
- Seasonal realism: Seasons should be represented through subtle, believable differences: vegetation tone, ground warmth, atmospheric particles, and route/tour context. Until proper 3D seasonal vegetation exists, keep native 3D trees visible.
- Time-of-day realism: Dawn, midday, dusk, and night should use Mapbox lighting plus restrained cinematic grading. Night should emphasize lit monuments and city lights without turning the entire scene black.
- Guide-first tourism: Every landmark and museum should be discoverable, navigable, and explainable with an audio guide that sounds like a real human guide, not a robotic fact dump.
- UI clarity: Controls should feel game-like but not confusing. Every visible button needs an immediate, predictable result.

## Current Track

The project is on the right track when these are true:

- The first screen shows a useful 3D view of central DC.
- 3D buildings, landmarks, roads, trees, and museums remain visible while visual effects are active.
- Season and time controls visibly change mood without hiding real map detail.
- 360 works from the current location, not from a fixed landmark.
- Landmark and museum guide prompts appear near relevant places and play reliable browser speech.
- Layer controls only exist when they create meaningful visual or informational change.
- Console errors are treated as release blockers unless they are confirmed third-party Mapbox internals that cannot be fixed locally.

## Roadmap

1. Stabilize the base map and camera.
   Keep Mapbox Standard content visible, clamp disorienting zoom levels, and provide reliable recovery to a useful 3D DC view.

2. Make seasons believable.
   Use subtle map-layer styling and lightweight ambience now. Later, add real seasonal vegetation through a dedicated 3D vegetation data pipeline instead of screen-space overlays.

3. Make time of day cinematic but readable.
   Tune dawn, midday, dusk, and night as lighting states. Monument lights should be visible from a distance, but the city must stay navigable.

4. Make the guide feel alive.
   Use free browser speech synthesis, better scripts, short guide chapters, and museum coverage. The guide should explain what the user is seeing and include surprising details.

5. Clean the UI.
   Keep the HUD compact, make controls obvious, remove toggles that do not change anything, and verify desktop and mobile layouts.

6. Add deeper tourism features.
   Guided routes, nearby recommendations, walking-time context, museum collections, photo spots, accessibility notes, and “what to see next” moments.

## Non-Negotiables

- Do not solve realism by tinting the entire screen.
- Do not hide or overwrite Mapbox Standard 3D content to show a custom effect.
- Do not add features without testing the loaded app after the change.
- Do not ship a control unless its effect is visible and understandable.
- Do not make guide audio depend on paid API keys.
