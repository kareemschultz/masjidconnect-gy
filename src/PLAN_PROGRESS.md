# MasjidConnect Plan Progress

Last updated: 2026-02-21  
Branch: `main`  
PR: `https://github.com/kareemschultz/masjidconnect-gy/pull/3`

## Scope and Constraints
- Work limited to `/src` for product changes.
- No database schema changes.
- No deployment/CI config changes.
- Keep existing architecture intact (incremental refactor only).

## Original Plan (Condensed)
- Stabilize runtime/lint issues and dead code.
- Keep hybrid-by-route layout strategy.
- Improve spacing consistency and form feedback UX.
- Improve accessibility and micro-interactions.
- Apply performance cleanup and low-risk product QoL.
- Verify with lint/build/E2E.

## Locked Layout Decisions
- Hybrid by route (single layout tree, no duplicated route trees).
- Wide layout (`>=1024px`) for content-heavy routes:
  - `/admin`, `/masjids`, `/map`, `/events`, `/resources`, `/quran`, `/quran/:surahNumber`, `/timetable`
- Shell-first for form/auth/profile/edit/create flows.
- Mobile-first preserved below `1024px`.

## Progress by Category

### 1) Stability and Runtime
Status: **Done**
- Lint/runtime-risk cleanup across `/src`.
- Hook/context refactors and broken import cleanup.
- Dead code and unused variable cleanup.
- Logging utility standardized (`src/utils/logger.js`).

### 2) Hybrid Layout Architecture
Status: **Done**
- Route layout metadata centralized (`src/layout/routeLayout.js`).
- App + nav + more-sheet aligned to shared layout behavior.
- Shared primitives introduced (`src/components/ui/layoutPrimitives.js`).

### 3) UI/UX Polish
Status: **Done (full-route overhaul pass complete)**
- Spacing/token baseline and visual facelift pass applied to key screens.
- Navigation/category structure centralized (`src/config/navigation.js`).
- Form validation UX improved on key forms (inline + touched/error feedback).
- Motion/reduced-motion improvements applied.
- Worship-tool visual redesign pass completed for `TasbihCounter`, `Adhkar`, and `Duas` with a shared atmospheric canvas/surface system (`.worship-canvas`, `.worship-surface`).
- Design consistency sweep extended to `PrayerTracker` and `ZakatCalculator` using the same responsive hero/surface language.
- Added app-wide premium surface system for non-worship routes (`.faith-canvas`, `.faith-hero`, `.faith-section`, `.faith-chip`, `.faith-tab`).
- Extended full redesign pass across `Resources`, `Timetable`, `QiblaCompass`, `Settings`, `Madrasa`, `UserProfile`, `AdminPanel`, `MasjidDirectory`, and `QuranReader`.
- Bottom nav + Explore sheet restructured into clearer category IA (Daily Essentials / Worship Tools / Education / Community / Account).
- New Explore enhancements: quick access modules, search, and pin/unpin shortcuts persisted to localStorage.
- New quality-of-life actions: timetable "Share Today" copy action and Admin announcement search/priority filters.

### 4) Accessibility
Status: **Partially Done**
- Focus-visible and ARIA improvements in major flows.
- Semantic/landmark compatibility improved and E2E assertions stabilized.
- Dynamic Island/safe-area handling improved (`pt-safe`, `px-safe`, `pb-safe`).
- Skip link added to jump directly to `#main-content`.
- Route-change screen-reader announcements added via polite `aria-live` status updates.
- More sheet now has improved dialog semantics + keyboard trapping (`Tab` loop, `Esc` close, focus restore).
- Worship screens now include stronger semantic tabs/panels, expanded/collapsed disclosure states, labeled dialog forms, and minimum touch-target sizing (`min-h-11`).
- Explore search has explicit labeling and keyboard-safe focus behavior preserved under modal trap.
- Remaining opportunity: full audit pass on every modal/sheet interaction path.

### 5) Performance
Status: **Partially Done**
- Debounced search on masjid directory.
- Map marker update optimized (memoized lookup map).
- Historical submissions short-lived cache added.
- Render-cost cleanup on worship screens with memoized derived state/filtering (`useMemo`) and reduced per-render recomputation.
- Explore menu filtering/pinned lookups and admin announcement filtering use memoized selectors to avoid repeated heavy recomputation.
- Remaining opportunity: broader list virtualization/caching strategy beyond current hotspots.

### 6) Security
Status: **Partially Done**
- Map popup HTML now escaped (XSS risk reduction).
- Safer storage parsing utility added and integrated in key flows.
- Push-notification storage/error handling hardened.
- Remaining opportunity: full threat-model + route-by-route security checklist sweep.

## Verification Snapshot
- `npx eslint src` -> passing.
- `npx vite build --outDir /tmp/masjidconnect-buildcheck` -> passing.
- `npx playwright test --reporter=line` -> **180 passed, 0 failed** (post-redesign re-run).
- `npx playwright test e2e/full-verification.spec.js e2e/verify-new-features.spec.js e2e/zakat-verify.spec.js --reporter=line` -> **42 passed, 0 failed**.
- `npx eslint src/App.jsx src/components/MoreSheet.jsx` -> passing.
- `npx eslint src/components/PrayerTracker.jsx src/components/ZakatCalculator.jsx src/components/TasbihCounter.jsx src/components/Adhkar.jsx src/components/Duas.jsx src/App.jsx src/components/MoreSheet.jsx` -> passing.
- `npm run build` -> passing.

## Key Commits
- `834da8e` refactor(layout): centralize hybrid route layout configuration
- `c1dd8cb` fix(core): resolve src runtime/lint issues and stabilize shared hooks
- `ebecc6d` feat(ux): enhance form validation feedback and motion accessibility
- `8bdeb40` test(e2e): align route/nav expectations and stabilize flaky flows
- `fe6c286` feat(ui): overhaul navigation, spacing system, and notch-safe layout
- `0af22bc` fix(security-perf): harden map popup rendering and optimize fetch/storage

## Remaining High-Value Next Iterations
1. Route-level micro-polish pass (copy refinement, spacing harmonization, and icon consistency).
2. Comprehensive accessibility audit (keyboard traps, aria-live, labels, contrast checks).
3. Broader performance pass (long-list rendering strategy and deeper fetch/cache policy).
4. Formal security threat model document tied to current architecture.
