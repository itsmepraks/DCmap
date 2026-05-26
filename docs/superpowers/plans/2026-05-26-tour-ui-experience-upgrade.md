# Tour UI Experience Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the DC guide experience by making museums visible from the start, enriching museum audio-guide content, tightening the game-like controls, and improving responsive behavior.

**Architecture:** Keep Mapbox Standard as the visual foundation. Add curated guide metadata in a focused data module consumed by the existing tour factory. Update UI controls in place without changing the core map lifecycle.

**Tech Stack:** Next.js 15, React 18, Mapbox GL, Tailwind CSS, browser SpeechSynthesis.

---

### Task 1: Museums Visible By Default

**Files:**
- Modify: `app/components/layout/StateManager.tsx`

- [ ] Set `layersVisible.museums` to `true`.
- [ ] Verify the museum layer loads on initial page load.

### Task 2: Rich Museum Guide Content

**Files:**
- Create: `app/lib/museumGuideFacts.ts`
- Modify: `app/lib/tours.ts`

- [ ] Add curated facts keyed by museum name pattern.
- [ ] Update `createMuseumTour` to use signature object, hidden detail, visit strategy, nearby pairing, and tone-specific voice lines.
- [ ] Keep generic fallback for museums without curated metadata.

### Task 3: Dock Clarity And Responsiveness

**Files:**
- Modify: `app/components/ui/ControlDock.tsx`

- [ ] Replace unclear emoji-first controls with compact text/icon badges.
- [ ] Keep touch targets at least 44px.
- [ ] Reduce dock width on desktop and prevent cramped overflow on tablet/mobile.
- [ ] Keep fly mode desktop-only.

### Task 4: 3D Foundation

**Files:**
- Modify: `app/hooks/useMapInitialization.ts`

- [ ] Enable Mapbox Standard facade rendering where supported.
- [ ] Keep Standard 3D buildings, trees, landmarks, and pedestrian roads enabled.

### Task 5: Verification

**Files:**
- No code files.

- [ ] Run `pnpm exec tsc --noEmit`.
- [ ] Run `pnpm lint`.
- [ ] Run `pnpm exec jest --runInBand`.
- [ ] Run `pnpm build`.
- [ ] Restart dev server cleanly with `rm -rf .next && pnpm dev`.
- [ ] Verify `http://localhost:3000/` returns `200 OK`.
- [ ] Browser-check console errors and responsive dock dimensions.
