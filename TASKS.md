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

- [x] **P0.1** Audit & remove Mapbox token logging — verified clean in `useMapInitialization.ts`. **Manual follow-up**: restrict token to production domain in the Mapbox dashboard (no code change possible).
- [x] **P0.2** Mobile fly mode: hide Fly button on touch-only devices via `matchMedia('(hover: hover) and (pointer: fine)')` in `ControlDock.tsx`
- [x] **P0.3** Modal accessibility — added `useFocusTrap` hook; wired `role="dialog"`, `aria-modal`, focus trap, focus restore into `OnboardingTutorial` and `StatsModal`
- [x] **P0.4** Killed always-on `requestAnimationFrame` loop in `useLandmarks.ts` — proximity now driven by `map.on('move')` only, throttled to ~5Hz

## P1 — Major

- [ ] **P1.1** Decouple `flyControllerState` from `StateManager` to stop re-render cascade — **deferred**: large refactor, requires splitting StateManager into multiple contexts. Captured in a follow-up.
- [x] **P1.2** Memoized HUD recommendation + Haversine — `nearestUndiscovered` computed once in `StateManager`, threaded through as `recommendedLandmark`. Deleted ~80 lines of duplicated inline math from `HUDSystem.tsx`.
- [x] **P1.3** `aria-label` added to `DockButton`, modal close `✕`s, `MiniStatsBar` trigger (with keyboard activation)
- [x] **P1.4** `prefers-reduced-motion` — global CSS rule + `useReducedMotion()` in modal animations
- [x] **P1.5** `aria-live` status region via new `LiveAnnouncerProvider` — announces landmark discoveries (with XP) and fly-mode toggles
- [ ] **P1.6** Consolidate three theme systems — **deferred**: requires a deliberate design-token pass that touches every component. Captured for next session.
- [x] **P1.7** Deleted GTA canvas filter stack from `globals.css` (filter + vignette + overlay gradient gone)
- [x] **P1.8** Replaced every `text-[8px]` / `text-[10px]` with `text-xs` (12px) across 9 components
- [ ] **P1.9** Define real TypeScript interfaces for `StateManager` props — **deferred**: needs hook return types extracted first; ~45 `any` usages to convert.
- [x] **P1.10** Re-enabled React Strict Mode in `next.config.js`. Map init still works because `useMapInitialization` already uses `isInitialized.current` to guard against double-mount.
- [x] **P1.11** Heatmap toggle — verified absent from current `FloatingControlPanel`. Stale todo.md note.
- [x] **P1.12** Fixed fly-mode speed display: was multiplying km/h by 3.6 again. `UnifiedHUD.tsx:167` now shows `flySpeed.toFixed(0)` directly.
- [ ] **P1.13** Replace emoji-as-functional-icon with lucide-react — **deferred**: wide blast radius, plan a single dedicated PR.

## P2 — Minor

- [x] **P2.1** Production builds now strip `console.log/debug` via Next compiler (`removeConsole: { exclude: ['error', 'warn'] }`). Also manually removed the noisiest dev-time logs.
- [ ] **P2.2** Delete `playerState.ts` shim — **deferred**: need to verify what file the todo note referred to; no obvious shim in current tree.
- [ ] **P2.3** Consolidate map-load tracking — **deferred**: minor, two timeouts but both work.
- [x] **P2.4** `OnboardingTutorial` setTimeout now has cleanup
- [x] **P2.5** `FeedbackProvider` toast timers tracked in a ref Map; cancelable on manual remove and on unmount
- [x] **P2.6** `FeedbackTriggers` no longer polls localStorage every 1s — uses a `dc:onboarding-complete` custom event (same-tab) plus the `storage` event (cross-tab)
- [ ] **P2.7** `next.config.js` headers — **done as part of P2.9 below**, GeoJSON served with `max-age=3600, s-maxage=86400, stale-while-revalidate=604800`
- [ ] **P2.8** Add unit tests for `proximity.ts`, `gameState.ts`, `experienceSystem.ts`, `worldBorder.ts` — **deferred**. Note: a pre-existing `movementMath.test.ts` failure on `main` should also be fixed.
- [x] **P2.9** Security headers added: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`
- [ ] **P2.10** Static-import small GeoJSON files — **deferred**: requires changing the fetch call sites; payload reduction is marginal.

## P3 — Polish

- [ ] **P3.1** Replace generic `-apple-system` font stack with a chosen display font — **deferred**: design decision.
- [ ] **P3.2** Onboarding: replace emoji-only modal — **deferred**: design decision.
- [ ] **P3.3** `DiscoveryAnimation` dismiss button — **deferred**.
- [x] **P3.4** Centralized all `localStorage` keys in `app/lib/storageKeys.ts`; gameState, experienceSystem, waypointSystem, OnboardingTutorial, FeedbackTriggers all import from it.
- [ ] **P3.5** Remove Docker section from README (no Dockerfile) — **deferred**.
- [ ] **P3.6** Audit prop drilling — **deferred**: bundle with P1.1.
- [ ] **P3.7** Extract `<Card variant="minecraft">`, `<DockButton>`, `<KbdKey>` — **deferred**: bundle with P1.13.

## Roadmap — Phased Plan

### ✅ Phase 1 — Cinematic Vibes (this session)
Switched from custom illustrated style to Mapbox Standard (photorealistic).
- Real 3D buildings, real 3D trees, atmospheric fog, realistic shadows — all native
- Time-of-day lighting cycle (dawn / day / dusk / night) wired to a dock button
- Idle camera drift after 12s of no interaction; cancels on any input
- Seasonal particles (cherry petals / dust / leaves / snow) with reduced-motion respect
- Cinematic title-card loading sequence — SVG outline draw-on + caption
- Satellite imagery toggle in the floating control panel
- Custom Vercel Analytics events: `landmark_discovered`, `fly_mode_toggled`, `satellite_toggled`, `time_of_day_cycled`

### Phase 2 — Real-World Mode (next session, ~1 session)
- **F.3 GPS / real-world mode** — wire `mapbox-gl-geolocate` into the discovery loop
- **F.10 Cmd+K search** — fuzzy search over landmarks/museums/neighborhoods
- **F.11 Per-landmark deep links** + `@vercel/og` per-landmark OG images

### Phase 3 — Curated Tours (~1-2 sessions)
- **F.5 Themed walking tours** from existing `walk_graph.json` — auto-pilot fly + narration cards
- **F.7 Mystery landmark of the day** — daily rotating clue
- **F.8 Achievement overhaul** — specific snackable goals tied to tours
- **F.6 Digital passport** — replace XP with stamps/stickers + shareable PDF

### Phase 4 — AI Tour Guide (~2-3 sessions)
- **F.1 AI tour guide** via Vercel AI SDK + AI Gateway
  - Cmd+K chat that streams routes and narration
  - TTS via OpenAI or ElevenLabs
- **F.9 Cinematic onboarding** — auto-pilot camera demo with AI voiceover

### Phase 5 — Time Travel (~3-4 sessions)
- **F.2 Time-travel slider** 1800 → 2026
  - Needs historical building data sourcing (LOC, DC archives, OpenStreetMap historical)
  - Buildings fade in/out by year built
- **F.4 Tree app pivot** (alternate direction if audience = nature)

### Phase 6 — Polish & Platform (~1 session)
- **F.13** RSC conversion for shell + metadata
- **F.14** PWA + offline support
- **F.16** Mapbox cost ceiling + rate-limit fallback UI
- **F.17 / F.18 / F.20** Typography pass, polished loading sequence, optional sound design

---

## F — Future Features (Backlog — strategic decision still open)

**🎯 STRATEGIC DECISION REQUIRED FIRST: Pick the primary audience.** Until this is decided, the Phase 4–5 choices remain ambiguous.

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
- All 4 P0s closed
- 9 of 13 P1s closed (deferred: state-context refactor, theme consolidation, `any` cleanup, emoji-icon swap — each is a focused PR)
- 5 of 10 P2s closed
- 1 of 7 P3s closed (storage key central module)
- Future-feature F.* items intentionally untouched; need audience decision first

### Verification
- `tsc --noEmit`: clean
- `pnpm lint`: 1 warning, down from 2 on main (pre-existing, in `useMapInitialization.ts`)
- `pnpm test`: 1 failure but it is pre-existing on `main` (`movementMath.test.ts:22` — sign of `deltaLng` flipped)
- `pnpm build`: green, 614 kB First Load JS

### Next decision points
- **Audience decision** before any F.* work
- **Theming consolidation** (P1.6) blocks several visual P1/P3 items
- **Emoji icon swap** (P1.13) deserves its own PR
- **State-context refactor** (P1.1) is the highest remaining perf lever
