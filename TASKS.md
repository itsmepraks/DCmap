# DC Map todo

My running notes for cleaning up and growing the app. Started a `fixes` branch off main on 2026-05-20. It was in rough shape back then; the urgent stuff is mostly sorted now. Keeping this so I remember what's done and what I punted on.

## Done

Bugs and correctness:
- [x] Checked that the Mapbox init code isn't logging the access token anywhere (it's fine in `useMapInitialization.ts`). Still want to lock the token to the prod domain in the Mapbox dashboard, but that's a dashboard setting, not code.
- [x] Fly-mode speed readout was wrong, it was multiplying km/h by 3.6 a second time. `UnifiedHUD.tsx` shows `flySpeed.toFixed(0)` directly now.
- [x] Landmark completion now actually requires reaching the landmark instead of just getting close-ish.
- [x] Re-enabled React Strict Mode in `next.config.js`. Map init survives the double-mount because `useMapInitialization` already guards on `isInitialized.current`.

Performance:
- [x] Killed the always-on `requestAnimationFrame` loop in `useLandmarks.ts`. Proximity is driven off `map.on('move')` now, throttled to about 5Hz.
- [x] Memoized the HUD recommendation and the Haversine math. `nearestUndiscovered` is computed once in `StateManager` and passed down as `recommendedLandmark`. Deleted ~80 lines of duplicated inline math from `HUDSystem.tsx`.
- [x] `FeedbackTriggers` no longer polls localStorage every second. It listens for a `dc:onboarding-complete` custom event (same tab) plus the `storage` event (cross tab).
- [x] `OnboardingTutorial` setTimeout now gets cleaned up.
- [x] `FeedbackProvider` toast timers live in a ref Map and get cancelled on manual remove and on unmount.

Accessibility:
- [x] Modals are keyboard-safe now: new `useFocusTrap` hook, plus `role="dialog"`, `aria-modal`, focus trap and focus restore on `OnboardingTutorial` and `StatsModal`.
- [x] Added `aria-label`s to `DockButton`, the modal close buttons, and the `MiniStatsBar` trigger (which is keyboard-activatable too).
- [x] `prefers-reduced-motion` respected, both a global CSS rule and `useReducedMotion()` in the modal animations.
- [x] Added an `aria-live` status region via a new `LiveAnnouncerProvider`. It announces landmark discoveries (with XP) and fly-mode toggles.

Cleanup and visual:
- [x] Ripped out the GTA-style canvas filter stack from `globals.css` (the filter, vignette, and overlay gradient are all gone).
- [x] Replaced every `text-[8px]`/`text-[10px]` with `text-xs` (12px) across nine components.
- [x] Centralized the localStorage keys in `app/lib/storageKeys.ts`. gameState, experienceSystem, waypointSystem, OnboardingTutorial and FeedbackTriggers all import from there now.
- [x] Production builds strip `console.log`/`console.debug` through the Next compiler (`removeConsole: { exclude: ['error', 'warn'] }`), and I pulled the noisiest dev logs by hand.
- [x] Security headers added in `next.config.js`: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`. GeoJSON is served with `max-age=3600, s-maxage=86400, stale-while-revalidate=604800`.
- [x] Confirmed the old heatmap toggle is gone from `FloatingControlPanel` (the todo.md note about it was stale).
- [x] Removed a pile of dead code in a later pass: the unused `movementMath` module and its test, three orphan components (`MonthSlider`, `SeasonalControls`, `LoadingSpinner`), and a couple of unused helpers. Also dropped the duplicate `package-lock.json` so pnpm is the only lockfile.

## Still on the list

- [ ] Pull `flyControllerState` out of `StateManager` so it stops re-rendering everything. This is the big perf win left, but it's a real refactor (need to split StateManager into a few contexts), so I'm doing it on its own.
- [ ] Collapse the three theme systems into one. Needs a proper design-token pass that touches every component, so not a quick one.
- [ ] Write real TypeScript interfaces for the `StateManager` props. Have to extract the hook return types first; there are around 45 `any`s to convert.
- [ ] Swap the emoji-as-functional-icons for lucide-react. Wide blast radius, wants its own PR.
- [ ] Look at whether the two map-load timeouts can be merged. Minor, both work fine as is.
- [ ] More unit tests for `gameState.ts`, `experienceSystem.ts`, `worldBorder.ts`. (`proximity.ts` and `safeStorage.ts` are covered.)
- [ ] Static-import the small GeoJSON files instead of fetching them. The payload win is marginal and it means changing the fetch call sites, so low priority.
- [ ] Pick a real display font instead of the generic `-apple-system` stack. Design call.
- [ ] Redo the onboarding modal so it isn't emoji-only. Design call.
- [ ] Give `DiscoveryAnimation` a dismiss button.
- [ ] Drop the Docker section from the README (there's no Dockerfile).
- [ ] Audit the prop drilling, probably bundle this with the StateManager refactor.
- [ ] Extract shared UI bits (`Card variant="minecraft"`, `DockButton`, `KbdKey`). Bundle with the lucide swap.

## Roadmap

Phase 1 (done): switched from the custom illustrated style to Mapbox Standard for the photoreal look. Real 3D buildings and trees, fog, shadows, all native. Time-of-day lighting (dawn/day/dusk/night) on a dock button. Idle camera drift after 12s, cancels on any input. Seasonal particles (petals/dust/leaves/snow) that respect reduced motion. Cinematic loading sequence with an SVG outline draw-on. Satellite toggle. Custom analytics events for discoveries, fly mode, satellite, and time-of-day.

Phase 2, real-world mode: wire `mapbox-gl-geolocate` into the discovery loop, Cmd+K fuzzy search over landmarks/museums/neighborhoods, per-landmark deep links plus `@vercel/og` images.

Phase 3, curated tours: themed walking routes off the existing `walk_graph.json` with auto-pilot fly and narration cards, daily mystery landmark, an achievement overhaul tied to the tours, and maybe a passport (stamps instead of XP, shareable PDF).

Phase 4, AI tour guide. Scope is locked, doing it as a focused session on its own:
1. `pnpm add ai @ai-sdk/openai`
2. New `app/api/tour/route.ts`, streamText with a system prompt scoped to DC landmarks
3. A `navigateToLandmark(name)` tool returning `{ id, coordinates, blurb }`; the assistant message renders a "Take me there" button that calls the existing `handleNavigateToLandmark`
4. Add an "Ask the guide" mode to `SearchPalette` (same Cmd+K, second tab)
5. Streaming markdown via `useChat`
6. Document `OPENAI_API_KEY` in env.example
7. Optional, separate PR: TTS through OpenAI tts-1-hd behind a "Speak" button per message

Phase 5, time travel: a 1800 to 2026 slider with buildings fading in and out by year built. Needs historical building data (LOC, DC archives, OSM history). There's also an alternate "tree app" direction if the audience turns out to be nature people.

Phase 6, polish and platform: RSC for the shell and metadata, PWA and offline support, a Mapbox cost ceiling with a rate-limit fallback UI, typography pass, the loading sequence as a real feature, optional sound design.

## Backlog ideas (not committed yet)

Still need to decide who this is actually for before picking a signature feature: tourists, game players, history students, geocachers, or tree/nature folks. That choice settles a lot of the Phase 4-5 ambiguity.

Big swings, pick one:
- [ ] AI tour guide: Cmd+K chat that streams a route plus narration
- [ ] Time-travel slider with period photos pinned to coordinates
- [ ] GPS real-world mode with daily walking goals and shareable trails
- [ ] Pivot to being the DC tree app (species filter, canopy heatmap, citizen reporting, bloom tracker)
- [ ] Themed walking tours, five to eight curated routes with auto-pilot and narration

UX:
- [ ] Replace XP/levels with a passport (stamps, stickers, downloadable share image)
- [ ] Mystery landmark of the day, rotates at UTC midnight
- [ ] Snackable achievements ("visit during cherry blossom season", "fly under a bridge", "max altitude")
- [ ] Cinematic onboarding, an auto-pilot camera demo instead of the emoji modal
- [ ] Active idle state: gentle drift, seasonal particles, floating "never visited" tooltips

Tech:
- [ ] RSC for the shell, keep the map as client islands
- [ ] PWA, installable, offline
- [ ] Mapbox monthly budget alarm and a rate-limited fallback

Brand:
- [ ] Settle on a display and UI font
- [ ] Make the loading sequence a feature (DC outline draw-on, buildings popping up)
- [ ] Optional sound design, off by default (fly whoosh, discovery chime, ambient city)
