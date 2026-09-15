# DC real-data audit and Georgetown prototype

Audited September 4, 2026. The deliverable is a bounded, working comparison at `/survey`, reachable through **Real-data test** in the world HUD. It is not a claim that the whole city has been converted or that these datasets contain photorealistic facades.

## Source decision

| Source | Verified availability and content | License / access | Decision |
| --- | --- | --- | --- |
| [DC Buildings 3D Scene, 2024](https://catalog.data.gov/dataset/buildings-3d-scene-2024) | Public I3S scene; 1,018 hierarchy nodes inspected; 13 candidate leaf meshes downloaded for Georgetown; 1,485 retained building features | CC BY 4.0, no key needed for scene access | Use as the prototype's authoritative building geometry. It is a maximum-height model, not detailed roof photogrammetry. |
| [DC Hydro Enforced DTM, 2024](https://catalog.data.gov/dataset/2024-lidar-hydro-enforced-digital-terrain-model) | Public 1 m terrain ImageServer; 4,225 ground samples retrieved; NAVD88 elevation in meters | CC0 | Use real ground elevations on a 65 × 65 grid. This test resamples the original 1 m terrain to roughly 15 m spacing. |
| [DC aerial photography, 2025](https://catalog.data.gov/dataset/aerial-photography-orthophoto-2025) | Public imagery; March 27, 2025 capture; bounded 4,096 × 4,096 export successfully retrieved | CC BY 4.0 | Apply geographically aligned imagery to ground and upward-facing roofs; walls remain untextured. Export resolution is reduced from the original 0.08 m source. |
| [DC Buildings 3D Scene, 2022](https://catalog.data.gov/dataset/buildings-3d-scene-2022) | Another maximum-height scene; same broad content class | CC BY 4.0 | Prefer the verified newer 2024 capture for this test. |
| [Older BldgPly_3D](https://services.arcgis.com/neT9SoYxizqTHZPH/ArcGIS/rest/services/BldgPly_3D/FeatureServer) | Public query worked; default geometry returns only footprints. `multipatchOption=stripMaterials` returns proprietary binary patches. | Full provenance/license requires additional review before reuse | Keep as a further roof-model research candidate; not decoded or shipped in this prototype. |
| [Google Photorealistic 3D Tiles](https://developers.google.com/maps/documentation/tile/overview) | Product supports imagery-textured meshes. DC coverage and neighborhood visual quality have **not** been verified through authenticated tile requests. | Requires a configured Cloud project/API key and applicable billing; [attribution and caching policies](https://developers.google.com/maps/documentation/tile/policies) apply | Candidate for photographed facades, not a verified replacement. No paid service enabled and no Google imagery copied into the app. |

The associated 2024 FeatureServer returned `499 Token Required` for an attempted independent attribute comparison. Its public SceneServer was usable. No restricted endpoint was bypassed. Geometry-preservation checks validate our transformation, not independent field accuracy.

## What the test demonstrates

- The imported geometry retains individual source height and absolute elevation rather than assigning four height bands based on footprint area.
- Real elevation makes Georgetown slope; the existing main world still has flat ground.
- Aerial imagery supplies real street markings, roof surfaces, vegetation patterns and ground color, rather than simulated road paint everywhere.
- Clicking a building compares its source mesh height with the old area-based height rule. This comparison holds source shape and base elevation fixed, changing only height. It does not pretend to recreate the full previous renderer.
- The previous height rule uses the roof's upward-projected area in the source mesh; it is a diagnostic comparison, not a per-address historical record.

## Rendering and data pipeline

Run `python3 scripts/build-survey-prototype.py`, `node scripts/bake-survey-prototype.mjs`, and `python3 scripts/build-survey-context.py`. Raw source responses are cached under `/tmp/dc-3d-audit`. The app serves only bounded processed assets under `public/world/survey`.

I3S geometry buffer 0 is decoded according to the layer's declared uncompressed schema. Node-relative EPSG:3857 positions are restored, inverse-projected to longitude/latitude, and converted to the existing local metric origin. Source elevation is retained in meters. Feature IDs and inclusive face ranges are preserved. The selected area is west/east -77.068/-77.059 and south/north 38.903/38.910; the terrain/image export includes a surrounding margin.

The resulting building mesh has 51,260 triangles and 1,845,360 bytes of positions. Including the aerial image and metadata, the test is approximately 5.9 MB. It renders buildings and terrain in two mesh draws, using demand-driven rendering and OrbitControls. There is no whole-city download in this test. The route loads its Three.js runtime dynamically and fetches assets in parallel; cleanup releases controls, observers, animation frames, geometry, textures, and the bitmap.

The existing cream/terracotta game interface is preserved. The test offers neighborhood, M Street and north-looking camera presets, source/estimate comparison, an imagery toggle, a building-height readout, and visible attribution.

## Limits and next decision

This is **not** a complete photorealistic open world. Maximum-height models simplify roofs; aerial images cannot reconstruct facades; capture years differ; terrain is resampled; feature bases can intersect terrain locally; and trees are imagery rather than 3D objects. This prototype is an orbit/inspection surface, not a collision-tested walking route. It deliberately exposes those distinctions instead of covering them with invented windows.

The recommended next foundation is the reusable DC geometry/terrain pipeline. Before migrating the main walking world, tile terrain and imagery, align collision meshes and building foundations, and validate transitions and memory on target devices. Photographed facades require separately licensed imagery-textured meshes or a capture/reconstruction workflow. A paid photogrammetry provider should only be selected after a real DC coverage test confirms that it solves that missing detail.

## Verification results

The production build and all 38 tests pass. The data checks cover every imported building's retained vertical span/base elevation, unique source IDs, binary size, and terrain grid/georeferencing. Desktop browser verification loaded 1,485 features and 5.9 MB of assets in about 1.5 seconds on localhost; that is a local observation, not a cross-device/network performance guarantee. Source/estimate toggling, imagery toggling, camera presets, and click selection worked; building 17838 reported 34.1 m survey height versus the old 30 m rule. The browser error/warning log was empty. The mobile controls panel collapses to leave the scene visible.

The design detector flagged the existing Arial fallback only; the incumbent typography was intentionally retained under the user's design-language constraint.

## Integration into the playable world

The game at `/` now uses measured maximum heights for **139,817 / 160,879** existing footprints. `scripts/build-district-elevations.py` reads all 678 leaf nodes of the public 2024 scene (156,645 valid unique source features), then joins by bounding-box center/dimensions with ambiguity rejection. Object IDs differ between services and are deliberately not used as join keys. Each footprint retains its estimated `h`; optional `s` holds its matched measured height. Skyline instances and nearby geometry use the same value without decorative height jitter. This is a conservative geometric match, not proof of exact building identity or a facade inventory.

`/world/elevation-source.json` records provenance, matching rules and coverage. Heights remain estimates for the 21,062 unmatched footprints. No photographic walls or detailed surveyed roofs are claimed.

`/world/terrain.json` contains a 257 × 257 resampling of the 2024 DTM over the District and surrounding backdrop. 30,814 samples are available from the source; the boolean `measured` mask distinguishes those from nearest-edge extensions outside coverage. Rendered terrain clamps negative elevations to zero and blends the authored Mall into the wider hills over 400 m. It is explicitly adapted for the game and is not a survey-grade surface. The source resolution is 1 m; the shipped grid is approximately 74 × 91 m. This asset adds under 1 MB rather than shipping raw LiDAR.

The same triangle interpolation drives terrain collision, building foundations, tree positions, road/park surfaces, arrival altitude and flight clearance. Street and land triangles are clipped at terrain grid boundaries and diagonals so their interiors cannot cut through hills. The reflecting pool retains its authored bed. Building facades remain original stylized artwork, with foundations extended to meet sloping ground.

The `/survey` experiment remains available for developer comparison but is no longer promoted in the playable HUD. The game's journal now saves discoveries at all 18 neighborhood destinations as well as the six Mall stops. Walking fast travel prefers a nearby mapped street and neighborhood arrivals face along it.
