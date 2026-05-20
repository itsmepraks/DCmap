# DC Map — Audit & Improvement Tasks

Generated from the full technical audit + brainstorm on 2026-05-20.
**Health score at audit time: 7/20 (Poor).** Goal: reach 14+/20 (Good).

Severity legend:
- **P0** blocking — fix immediately
- **P1** major — fix before release
- **P2** minor — next pass
- **P3** polish — when time permits
- **F** future feature (brainstorm) — requires strategic decision before building

---

## P0 — Blocking

- [ ] **P0.1** Audit & remove any Mapbox token logging in `useMapInitialization.ts` + restrict token to production domain in Mapbox dashboard
- [ ] **P0.2** Mobile fly mode: hide Fly button on touch-only devices (or add on-screen joystick later)
- [ ] **P0.3** Modal accessibility — add `role="dialog"`, `aria-modal`, focus trap, focus restore to `OnboardingTutorial` and `StatsModal`
- [ ] **P0.4** Kill always-on `requestAnimationFrame` loop in `useLandmarks.ts` — drive proximity updates from `map.on('move')` + `currentPosition` changes only

## P1 — Major

- [ ] **P1.1** Decouple `flyControllerState` from `StateManager` to stop re-render cascade (separate context, or use `use-context-selector`)
- [ ] **P1.2** Memoize HUD recommendation + Haversine math once in `StateManager`; delete the duplicated inline math in `HUDSystem.tsx:125-204`; use `calculateDistance` from `lib/proximity.ts`
- [ ] **P1.3** Add `aria-label` to all icon-only buttons (`DockButton`, modal close `✕`s, `MiniStatsBar` triggers)
- [ ] **P1.4** Add `prefers-reduced-motion` support — global CSS + `useReducedMotion()` for Framer Motion components
- [ ] **P1.5** Add `aria-live="polite"` status region for landmark discoveries, XP gains, fly-mode toggles
- [ ] **P1.6** Consolidate three theme systems (`globals.css :root`, `tailwind.config.ts`, `lib/theme.ts` `minecraftTheme`) into single CSS-variable source of truth
- [ ] **P1.7** Delete GTA canvas filter stack in `globals.css:177-235` (filter + vignette + overlay gradient). Personality belongs in Mapbox style JSON.
- [ ] **P1.8** Replace all `text-[8px]` / `text-[10px]` usages with minimum 12px (`text-xs` / `text-sm`) — primarily in `UnifiedHUD`, `ControlDock`, fly-mode bottom panel
- [ ] **P1.9** Define real TypeScript interfaces for `StateManager` props — drop 45+ `any` usages (`gameState: any`, `landmarksState: any`, etc.)
- [ ] **P1.10** Re-enable React Strict Mode in `next.config.js`; make `useMapInitialization` idempotent
- [ ] **P1.11** Remove heatmap toggle from `FloatingControlPanel` (or implement `HeatmapLayer`; toggle currently is a no-op per `todo.md:7`)
- [ ] **P1.12** Fix HUD distance label bug — meters labeled as "km" (per `todo.md:6`)
- [ ] **P1.13** Replace emoji-as-functional-icon with a real icon set (lucide-react) for `DockButton`, `MiniStatsBar`, `UnifiedHUD` cards. Keep emoji for landmark fun facts only.

## P2 — Minor

- [ ] **P2.1** Gate all 75+ `console.log/warn/error/debug` with `NODE_ENV !== 'production'` (or extract a `logger` helper). Strip emojis from logs.
- [ ] **P2.2** Delete `playerState.ts` shim if it duplicates `lib/playerState.tsx` (per `todo.md:9`)
- [ ] **P2.3** Consolidate map-load tracking — currently duplicated in `Map.tsx` and `StateManager.tsx`. Move single source of truth into `MapContext`.
- [ ] **P2.4** Add cleanup to `setTimeout` in `OnboardingTutorial.tsx:39`
- [ ] **P2.5** Make `FeedbackProvider.addToast` setTimeout cancelable on manual dismiss
- [ ] **P2.6** Replace `localStorage` polling in `FeedbackTriggers.tsx:43-52` with `storage` event or context-driven completion
- [ ] **P2.7** Add caching headers for static GeoJSON in `next.config.js` (immutable, max-age=31536000)
- [ ] **P2.8** Add unit tests for `proximity.ts`, `gameState.ts`, `experienceSystem.ts`, `worldBorder.ts`
- [ ] **P2.9** Add `headers()` in `next.config.js`: CSP, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`
- [ ] **P2.10** Static-import small GeoJSON files (`landmarks.geojson` is 8KB — bundle it, save a fetch)

## P3 — Polish

- [ ] **P3.1** Replace generic `-apple-system` font stack with a chosen display font (e.g. Inter for UI + Tiempos for headings)
- [ ] **P3.2** Onboarding: replace emoji-only modal with map-screenshot or short looping video preview
- [ ] **P3.3** `DiscoveryAnimation` — replace fixed 3s auto-dismiss with a dismiss button or pause-on-hover
- [ ] **P3.4** Centralize all `localStorage` keys (`dc-game-progress`, `dc-experience`, `dc-waypoints`, `dc-explorer-onboarding-completed`) in one constants module
- [ ] **P3.5** Remove Docker section from README (no Dockerfile exists) or add one
- [ ] **P3.6** Audit `landmarksState`, `gameState` prop drilling — push into focused contexts (`PlayerCtx`, `GameProgressCtx`, `MapUICtx`)
- [ ] **P3.7** Extract `<Card variant="minecraft">`, `<DockButton>`, `<KbdKey>` — kill duplicated inline-style blocks

## F — Future Features (Brainstorm — requires strategic decision)

**🎯 STRATEGIC DECISION REQUIRED FIRST: Pick the primary audience.** Until this is decided, every feature below pulls in five directions.

Audience options: Tourists · Game players · History students · Geocachers/IRL · Tree & nature enthusiasts.

### Big swings (pick one as signature feature)

- [ ] **F.1** AI tour guide — Cmd+K chat, streams route + narration via Vercel AI SDK + AI Gateway + TTS
- [ ] **F.2** Time-travel slider — drag 1800 → 2026, buildings fade in/out by year built, period photos pin to coordinates
- [ ] **F.3** GPS / real-world mode — wire `mapbox-gl-geolocate` into discovery loop, daily walking goals, share trail
- [ ] **F.4** Become *the* DC tree app — pivot to species filter + canopy heatmap + citizen reporting + bloom tracker
- [ ] **F.5** Themed walking tours from existing `walk_graph.json` — 5-8 curated routes with auto-pilot fly + narration

### UX wins

- [ ] **F.6** Replace XP/level system with digital passport (stamps, stickers, downloadable share image)
- [ ] **F.7** Mystery landmark of the day — daily clue, find it, earn stamp, rotates at UTC midnight
- [ ] **F.8** Achievement overhaul — specific, snackable ("Visit during cherry blossom season," "Fly under a bridge," "Reach max altitude")
- [ ] **F.9** Cinematic onboarding — auto-pilot camera demo replaces emoji modal
- [ ] **F.10** Cmd+K fuzzy search over landmarks/museums/neighborhoods
- [ ] **F.11** Per-landmark deep links (`/landmark/[id]`) + `@vercel/og` per-landmark OG images
- [ ] **F.12** Active idle state — gentle camera drift, seasonal particles (petals/leaves/snow), floating "never visited" tooltips

### Tech / architecture

- [ ] **F.13** Convert shell + metadata to RSC; keep map interactive components as client islands
- [ ] **F.14** PWA + offline support — service worker, manifest, installable
- [ ] **F.15** Emit custom Vercel Analytics events (`landmark_discovered`, `fly_mode_duration`, etc.)
- [ ] **F.16** Mapbox cost ceiling — set monthly budget alarm + rate-limited fallback UI

### Brand / visual

- [ ] **F.17** Choose typography voice (display + UI font)
- [ ] **F.18** Loading sequence as feature — SVG DC outline draw-on + building pop-up animation
- [ ] **F.19** Satellite / photo mode toggle alongside seasons
- [ ] **F.20** Optional sound design (off by default) — fly whoosh, discovery chime, ambient city

---

## Session Log

### Session 1 (2026-05-20)
- Branch `fixes` created off `main`
- This `TASKS.md` written
- Working through P0 → P3

### Next decision points
- **Audience decision** before any F.* work
- **Theming consolidation** (P1.6) blocks several visual P1/P3 items — sequence it early
- **Removing emoji icons** (P1.13) is wide blast radius — plan a single PR for it
