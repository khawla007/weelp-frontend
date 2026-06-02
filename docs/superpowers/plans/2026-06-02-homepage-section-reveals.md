# §7 Homepage Section Reveals Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add editorial scroll-reveal to four named below-fold homepage sections plus an AI-card hover-scale and a recommendation-link underline-reveal, reusing the existing `Reveal` infra, reduced-motion- and hydration-safe.

**Architecture:** Wrap each section's top-level `<section>` in the existing client `<Reveal as="section" initialHidden …>` (IntersectionObserver, reduced-motion-safe, SSR-safe). Server sections render the client `Reveal` with their existing server children — no section becomes a client component. Two micro-enhancements are plain Tailwind class changes. No edits to `Reveal.jsx`, `globals.css`, or `motion.js`.

**Tech Stack:** Next.js 16 (App Router, RSC), React 19, Tailwind, existing `Reveal` + `weelpFadeUp`/`[data-reveal]` CSS, jest + RTL.

Spec: `docs/superpowers/specs/2026-06-02-homepage-section-reveals-design.md`.

---

## File structure

All paths under `frontend/`. Reuse only — these are NOT edited: `src/app/components/ui/Reveal.jsx`, `src/app/globals.css`, `src/lib/motion.js`.

| File                                                                    | Responsibility          | Change                                     |
| ----------------------------------------------------------------------- | ----------------------- | ------------------------------------------ |
| `src/app/components/Pages/FRONT_END/home/AiSection.jsx`                 | AI travel-buddy section | Reveal wrap + Save-Money image hover-scale |
| `src/app/components/Pages/FRONT_END/home/__tests__/AiSection.test.jsx`  | AiSection test (exists) | Add wrap + hover-scale assertions          |
| `src/app/components/Pages/FRONT_END/home/BrowseDestinationsSection.jsx` | destinations carousel   | Reveal wrap                                |
| `src/app/components/Pages/FRONT_END/home/WanderersBanner.jsx`           | wanderers CTA banner    | Reveal wrap (preserve `aria-labelledby`)   |
| `src/app/components/Pages/FRONT_END/home/WeelpRecommendations.jsx`      | itinerary link grid     | Reveal wrap + link underline-reveal        |
| `docs/frontend-animation-implementation-steps-2026-05-15.md`            | roadmap                 | Tick §7 + verification notes               |

Import style for every section (match About pages, e.g. `AboutStory.jsx`): `import Reveal from '@/app/components/ui/Reveal';`.

**Testing note (no silent gap):** `AiSection` is the only one of the four with an existing test harness (mocks for its data fetch + dynamic children already in place), so it gets real unit assertions. `WanderersBanner`, `BrowseDestinationsSection`, and `WeelpRecommendations` have no existing tests and pull data fetches / `CarouselShell` / `dynamic()` children that would need heavy bespoke mocking for a pure CSS-wrap change; their wrap + micro-enhancement are verified in the browser sweep (Task 5) instead of brittle new unit harnesses. The full suite staying 144/144 guards against regressions.

---

### Task 1: AiSection — Reveal wrap + Save-Money image hover-scale

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/home/AiSection.jsx`
- Test: `src/app/components/Pages/FRONT_END/home/__tests__/AiSection.test.jsx`

- [ ] **Step 1: Read the existing test** to learn how AiSection is rendered/mocked.

Run: `sed -n '1,80p' "src/app/components/Pages/FRONT_END/home/__tests__/AiSection.test.jsx"`
Note the render helper and existing mocks (data service, TravelBuddyWidget, PersonalisedGlobe). Reuse them.

- [ ] **Step 2: Add the failing assertions** to `AiSection.test.jsx` (inside the existing describe, reusing its render/mocks). The section is async — match how the existing tests await/render it.

```jsx
it('wraps the section in a Reveal (data-reveal present) and gives the Save-Money image a capped hover-zoom', async () => {
  const ui = await AiSection(); // async server component returns an element
  const { container } = render(ui);

  const section = container.querySelector('section');
  expect(section).toHaveAttribute('data-reveal'); // Reveal wrapper

  const moneyImg = container.querySelector('img[alt="AI suggesting price-aware combinations"]');
  expect(moneyImg).toBeTruthy();
  expect(moneyImg.className).toContain('group-hover:scale-[1.02]');
  expect(moneyImg.className).toContain('motion-reduce:group-hover:scale-100');
});
```

If the existing tests already call `AiSection()` differently (e.g. a shared `renderAiSection()` helper), use that helper instead of calling `AiSection()` directly.

- [ ] **Step 3: Run it — expect FAIL** (no `data-reveal`; no hover-scale classes yet).

Run: `NEXT_UNHANDLED_REJECTION_FILTER=disabled npx jest AiSection --runInBand`
Expected: FAIL on the new assertions (existing tests still pass).

- [ ] **Step 4: Implement.** Edit `AiSection.jsx`:

(a) Add the import after line 6:

```jsx
import Reveal from '@/app/components/ui/Reveal';
```

(b) Change the section open tag (line 16) from:

```jsx
    <section className="container-page flex flex-col items-center gap-12 pb-10 md:pb-16 lg:pb-24">
```

to:

```jsx
    <Reveal as="section" initialHidden className="container-page flex flex-col items-center gap-12 pb-10 md:pb-16 lg:pb-24">
```

and the matching closing `</section>` (line 54) to `</Reveal>`.

(c) Add the hover-scale to the Save-Money `<Image>` className (line 30) — from `"object-cover"` to:

```jsx
className = 'object-cover transition-transform duration-500 ease-[var(--weelp-ease-out)] group-hover:scale-[1.02] motion-reduce:group-hover:scale-100';
```

Do NOT touch the second (`data-personalised-card` / globe) article — hover-scale there would fight the Cobe globe. The Save-Money `<article>` already has `group` and `SHARED_CARD` (line 8) already has `overflow-hidden`, so the zoom clips and the `data-overlay` slide/fade is unchanged.

- [ ] **Step 5: Run tests — expect PASS** (new + existing).

Run: `NEXT_UNHANDLED_REJECTION_FILTER=disabled npx jest AiSection --runInBand`
Expected: PASS, all AiSection tests green.

- [ ] **Step 6: tsc + lint the file.**

Run: `npx tsc --noEmit && npx eslint src/app/components/Pages/FRONT_END/home/AiSection.jsx "src/app/components/Pages/FRONT_END/home/__tests__/AiSection.test.jsx" --max-warnings=0`
Expected: exit 0 both.

- [ ] **Step 7: Commit.**

```bash
git add src/app/components/Pages/FRONT_END/home/AiSection.jsx "src/app/components/Pages/FRONT_END/home/__tests__/AiSection.test.jsx"
git commit -m "feat(home): reveal AiSection + hover-zoom the Save-Money card (§7)"
```

---

### Task 2: BrowseDestinationsSection — Reveal wrap

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/home/BrowseDestinationsSection.jsx`

- [ ] **Step 1: Add the import** after the existing imports (top of file, below the `CityCard` import):

```jsx
import Reveal from '@/app/components/ui/Reveal';
```

- [ ] **Step 2: Wrap the section.** Change the open tag (line 29) from:

```jsx
    <section className={`container-page flex flex-col gap-8 pb-10 md:pb-16 lg:pb-24 ${className}`}>
```

to:

```jsx
    <Reveal as="section" initialHidden className={`container-page flex flex-col gap-8 pb-10 md:pb-16 lg:pb-24 ${className}`}>
```

and the matching closing `</section>` to `</Reveal>`. (This file is already `'use client'`.) Leave the early `if (!items.length) return null;` guard above the return untouched.

- [ ] **Step 3: tsc + lint.**

Run: `npx tsc --noEmit && npx eslint src/app/components/Pages/FRONT_END/home/BrowseDestinationsSection.jsx --max-warnings=0`
Expected: exit 0.

- [ ] **Step 4: Commit.**

```bash
git add src/app/components/Pages/FRONT_END/home/BrowseDestinationsSection.jsx
git commit -m "feat(home): reveal BrowseDestinationsSection on scroll (§7)"
```

---

### Task 3: WanderersBanner — Reveal wrap

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/home/WanderersBanner.jsx`

- [ ] **Step 1: Add the import** at the top of the file:

```jsx
import Reveal from '@/app/components/ui/Reveal';
```

- [ ] **Step 2: Wrap the section.** Change the open tag (line 10) from:

```jsx
    <section aria-labelledby="wanderers-heading" className="relative h-[260px] w-full overflow-hidden bg-white md:h-[300px] mb-10 md:mb-16 lg:mb-24">
```

to:

```jsx
    <Reveal as="section" initialHidden aria-labelledby="wanderers-heading" className="relative h-[260px] w-full overflow-hidden bg-white md:h-[300px] mb-10 md:mb-16 lg:mb-24">
```

and the matching closing `</section>` to `</Reveal>`. `aria-labelledby` forwards through Reveal's `...rest`. (Server component renders the client Reveal with its static children — no `'use client'` needed.)

- [ ] **Step 3: tsc + lint.**

Run: `npx tsc --noEmit && npx eslint src/app/components/Pages/FRONT_END/home/WanderersBanner.jsx --max-warnings=0`
Expected: exit 0.

- [ ] **Step 4: Commit.**

```bash
git add src/app/components/Pages/FRONT_END/home/WanderersBanner.jsx
git commit -m "feat(home): reveal WanderersBanner on scroll (§7)"
```

---

### Task 4: WeelpRecommendations — Reveal wrap + link underline-reveal

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/home/WeelpRecommendations.jsx`

- [ ] **Step 1: Add the import** at the top:

```jsx
import Reveal from '@/app/components/ui/Reveal';
```

- [ ] **Step 2: Wrap the section.** Change the open tag (line 37) from:

```jsx
    <section className="w-full bg-[#f8faf9] pb-10 md:pb-16 lg:pb-24">
```

to:

```jsx
    <Reveal as="section" initialHidden className="w-full bg-[#f8faf9] pb-10 md:pb-16 lg:pb-24">
```

and the matching closing `</section>` (line 59) to `</Reveal>`. Do NOT change the `SectionFallback` early-return branch (it stays as-is — the empty/error state is not a section reveal).

- [ ] **Step 3: Underline-reveal on the links.** Change the `<Link>` className (line 50) from:

```jsx
className = 'text-[16px] text-[#71717a] transition hover:text-[#18181b]';
```

to:

```jsx
className =
  'text-[16px] text-[#71717a] bg-gradient-to-r from-[#18181b] to-[#18181b] bg-[length:0%_1px] bg-no-repeat bg-[position:0_100%] transition-[color,background-size] duration-300 ease-[var(--weelp-ease-out)] hover:text-[#18181b] hover:bg-[length:100%_1px] motion-reduce:transition-none';
```

This draws a 1px bottom underline (solid `#18181b` gradient bar) that grows left→right on hover via `background-size`; `motion-reduce:transition-none` makes it snap under reduced motion (and the global reduced-motion block already neutralizes transitions). The existing inline `style` (fontFamily/weight/letterSpacing/lineHeight) stays unchanged.

- [ ] **Step 4: tsc + lint.**

Run: `npx tsc --noEmit && npx eslint src/app/components/Pages/FRONT_END/home/WeelpRecommendations.jsx --max-warnings=0`
Expected: exit 0.

- [ ] **Step 5: Commit.**

```bash
git add src/app/components/Pages/FRONT_END/home/WeelpRecommendations.jsx
git commit -m "feat(home): reveal WeelpRecommendations + link underline (§7)"
```

---

### Task 5: Full verification + roadmap update

**Files:**

- Modify: `docs/frontend-animation-implementation-steps-2026-05-15.md`

- [ ] **Step 1: Type-check + lint whole repo.**

Run: `npx tsc --noEmit ; npm run lint`
Expected: both clean (exit 0).

- [ ] **Step 2: Full jest suite stays green.**

Run: `NEXT_UNHANDLED_REJECTION_FILTER=disabled NODE_OPTIONS="--max-old-space-size=8192" npx jest --runInBand --watchAll=false`
Expected: `Tests: 144 passed, 144 total` (the 4 wraps must not regress any suite; AiSection gains the new case → 145, confirm the count and that 0 fail).

- [ ] **Step 3: Browser verification** (dev server on :3000, backend :8000). Use `agent-browser --session weelp-sweep-7`, headed if possible else headless+screenshots. Verify on the homepage `/`:
  1. Scroll down — each of AiSection, BrowseDestinations, WanderersBanner, WeelpRecommendations reveals ONCE (opacity 0→1 + ~12px translateY over ~520ms) as it enters the viewport; the hero is unaffected. Read a section's computed style / `data-reveal` to confirm it transitions `pending`→`shown`.
  2. Reduced-motion: emulate `prefers-reduced-motion: reduce`, reload — all four sections render fully visible immediately (`data-reveal` flattened by the global reset), no animation, no console error; the Save-Money image holds `scale(1)` on hover.
  3. AI overlay intact: hover the Save-Money card — the `data-overlay` still slides down + fades, and the image now zooms to ≤1.02 (clipped, no bleed).
  4. WeelpRecommendations links: hover one — the underline grows left→right; text color shifts.
  5. Console clean; NO React hydration / "server/client mismatch" warning.
  6. Network: the `@tsparticles` / `cobe` / `maplibre` chunks are not requested until AiSection nears the viewport (scroll slowly and watch requests).

Record evidence (final state + any error verbatim). PASS = all six hold.

- [ ] **Step 4: Update the roadmap.** In `docs/frontend-animation-implementation-steps-2026-05-15.md` §7: flip `Status: [ ] Not started` to `[x]`, tick the implemented step checkboxes (Reveal wrapper reused; hero kept; section reveal on the 4; opacity+12px/520ms via Reveal default; AI image hover-scale; recommendation underline; reduced-motion fallback; heavy modules left deferred), tick the acceptance checks, and fill "Verification evidence" with the Task-5 browser results. Note the two NOT-done sub-steps that were out of scope by decision (no per-section deferral changes beyond existing lazy/gated state).

- [ ] **Step 5: Commit the roadmap update.**

```bash
git add docs/frontend-animation-implementation-steps-2026-05-15.md
git commit -m "docs(roadmap): mark §7 homepage section reveals complete"
```

---

## Self-review (planner)

- **Spec coverage:** Reveal wrap on the named 4 → Tasks 1-4. Hero kept → untouched (no task edits it). opacity+12px/520ms → Reveal default (Task 1-4 wraps). AI hover-scale → Task 1. Underline-reveal → Task 4. Reduced-motion → reused (verified Task 5 step 2). Heavy modules left as-is → no task touches them (verified Task 5 step 6). Hydration safety → `initialHidden` in every wrap (verified Task 5 step 5). All acceptance checks → Task 5 browser steps. No gaps.
- **Placeholders:** none — every code step shows the exact before/after.
- **Type/name consistency:** `import Reveal from '@/app/components/ui/Reveal'` and `<Reveal as="section" initialHidden …>` identical across Tasks 1-4; `data-reveal` attribute name matches `Reveal.jsx`'s output and the Task-1 assertion.
