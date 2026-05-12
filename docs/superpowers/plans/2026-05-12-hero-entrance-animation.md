# Hero Section Entrance Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a calm, staggered entrance animation to the homepage hero section's content (heading, subtitle, FilterBar) on initial page mount, without disturbing layout or centering.

**Architecture:** Pure CSS keyframe animation defined in `globals.css` (single source for the curve + stagger). Element-level class hooks added to `HeroSection.jsx`. No new dependencies — `tailwindcss-animate` exists but the project's existing pattern (custom keyframes in `globals.css`, see `shadowPulse` at line 835) is followed for consistency. Motion is transform + opacity only; no layout properties animate. `prefers-reduced-motion` disables the motion globally.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS, plain CSS keyframes.

---

## Background and constraints

### Previous failure (do not repeat)

A prior attempt wrapped `<FilterBar />` in `<div className="w-full animate-in ...">`. The wrapper's `w-full` overrode `FilterBar`'s natural width and broke center alignment because `FilterBar` is internally a flex row that sizes to its content within an `items-center` parent. **Any wrapper added around `FilterBar` MUST NOT change its computed width or display behavior.** Use `inline-block` for the wrapper so it shrink-wraps `FilterBar`'s intrinsic width and the parent's `items-center` continues to center it.

### Hard constraints

1. **No layout-property animation.** Only `transform` (translateY) and `opacity` animate.
2. **No wrapper that changes FilterBar's width.** Wrapper must be `inline-block` or use `display: contents` (avoid `contents` — it forfeits the animation). `inline-block` is the chosen approach.
3. **Center alignment preserved.** The hero `<div>` already uses `flex flex-col items-center`; child centering must remain visually identical to current state.
4. **Curve:** `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo). No bounce, no elastic.
5. **Duration:** 700 ms.
6. **Stagger:** h1 at 0 ms, subtitle at 120 ms, FilterBar at 240 ms.
7. **Translate distance:** 8 px (`translateY(8px) → translateY(0)`). Small, editorial — not a "swoosh".
8. **`animation-fill-mode: both`** — holds the final state to prevent post-animation flicker.
9. **`prefers-reduced-motion: reduce`** disables the animation (sets it to 0.01 ms, end state immediate).
10. **No new dependencies.** No Framer Motion. No GSAP.
11. **No other files touched** — only `HeroSection.jsx` and `globals.css`.

### Files

| File                                                                              | Action | Why                                                                                                         |
| --------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------- |
| `frontend/src/app/components/Pages/FRONT_END/home/HeroSection.jsx`                | Modify | Apply animation class to h1, p, and a thin `inline-block` wrapper around `<FilterBar />`.                   |
| `frontend/src/app/globals.css`                                                    | Modify | Add `@keyframes heroRise` and `.hero-rise` utility with stagger via `--hero-rise-delay` custom property.    |
| `frontend/src/app/components/Pages/FRONT_END/home/__tests__/HeroSection.test.jsx` | Modify | Assert the three children carry the `hero-rise` class and the wrapper around `FilterBar` is `inline-block`. |

---

## Task 1: Add the keyframe and utility class to globals.css

**Files:**

- Modify: `frontend/src/app/globals.css` (append near the existing `@keyframes shadowPulse` block, around line 835)

- [ ] **Step 1: Locate the existing keyframe block**

Run: `grep -n "@keyframes shadowPulse" frontend/src/app/globals.css`
Expected: a single match at or near line 835.

- [ ] **Step 2: Append the new keyframe and utility class**

Add the following block immediately after the closing `}` of the `shadowPulse` keyframe (do not place it inside any `@layer`; it must be a top-level rule so the existing project pattern is preserved):

```css
@keyframes heroRise {
  from {
    opacity: 0;
    transform: translate3d(0, 8px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

.hero-rise {
  opacity: 0;
  animation: heroRise 700ms cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: var(--hero-rise-delay, 0ms);
  will-change: transform, opacity;
}

@media (prefers-reduced-motion: reduce) {
  .hero-rise {
    animation-duration: 0.01ms;
    animation-delay: 0ms;
  }
}
```

Rationale notes (do not include in the CSS comment — comments are forbidden by project rules unless non-obvious):

- `opacity: 0` on `.hero-rise` covers the pre-animation paint before the first keyframe applies, so the elements do not flash visible for one frame on slow mounts.
- `translate3d` (vs `translateY`) promotes the element to its own layer in older Chromium without forcing `will-change` to do all the work.
- `will-change` is kept because this runs once on mount and is GC-friendly; the cost is acceptable for three elements.

- [ ] **Step 3: Sanity-check the CSS file parses**

Run: `cd frontend && npm run lint -- src/app/globals.css 2>&1 | tail -20`
Expected: no new errors introduced by the appended rules. If the lint command does not lint CSS in this project, run `cd frontend && npx stylelint src/app/globals.css 2>&1 | tail -20` instead; if neither runs CSS, skip this step and rely on the dev-server boot in Task 4 as the validation gate.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/globals.css
git commit -m "feat(home): add hero-rise keyframe utility for hero entrance"
```

---

## Task 2: Apply the animation class in HeroSection.jsx

**Files:**

- Modify: `frontend/src/app/components/Pages/FRONT_END/home/HeroSection.jsx`

- [ ] **Step 1: Read the current file**

Run: `cat frontend/src/app/components/Pages/FRONT_END/home/HeroSection.jsx`
Expected: the component matches the structure below before this edit:

```jsx
'use client';

import FilterBar from './FilterBar';

const HeroSection = () => {
  return (
    <section
      className="relative w-full flex items-center justify-center mb-10 lg:mb-24"
      style={{
        backgroundImage: 'url(/assets/images/hero_illustration.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#f2f7f5',
        height: '615px',
      }}
    >
      <div className="container-page relative z-0 flex flex-col items-center justify-center text-center">
        <h1 className="mb-3 text-[28px] sm:text-[28px] md:text-[38px]">Plan and Book</h1>
        <p className="mb-8 max-w-[44ch] text-[20px] font-medium leading-[1.4] text-[#71717a] sm:text-[24px]">The best experiences around you.</p>
        <FilterBar />
      </div>
    </section>
  );
};

export default HeroSection;
```

If the structure is different (e.g. someone added wrappers), STOP and re-baseline before editing.

- [ ] **Step 2: Apply the animation hooks**

Replace the inner `<div className="container-page ...">` block with the version below. The three changes are: `hero-rise` on `<h1>`, `hero-rise` + delay on `<p>`, and a single `inline-block` wrapper around `<FilterBar />` carrying `hero-rise` + delay.

```jsx
<div className="container-page relative z-0 flex flex-col items-center justify-center text-center">
  <h1 className="hero-rise mb-3 text-[28px] sm:text-[28px] md:text-[38px]">Plan and Book</h1>
  <p className="hero-rise mb-8 max-w-[44ch] text-[20px] font-medium leading-[1.4] text-[#71717a] sm:text-[24px]" style={{ '--hero-rise-delay': '120ms' }}>
    The best experiences around you.
  </p>
  <span className="hero-rise inline-block" style={{ '--hero-rise-delay': '240ms' }}>
    <FilterBar />
  </span>
</div>
```

Critical detail: the wrapper around `<FilterBar />` is a `<span>` with `inline-block`, not a `<div>` with `w-full`. This guarantees the wrapper shrink-wraps `FilterBar`'s intrinsic width so the parent's `items-center` keeps centering it exactly as before. A `<span>` is valid here because `FilterBar`'s root is itself a block-formatting element; the `inline-block` on the wrapper forces a new block formatting context so the nested block content renders correctly.

If `FilterBar` later asserts it must be a direct flex child for some reason, this wrapper would be a problem — but reading the file confirms it uses no parent-flex-dependent layout.

- [ ] **Step 3: Type-check and lint**

```bash
cd frontend && npm run type-check 2>&1 | tail -20
cd frontend && npm run lint 2>&1 | tail -20
```

Expected: no new errors in `HeroSection.jsx`. The inline `style={{ '--hero-rise-delay': '...' }}` is a known React 19 pattern for CSS custom properties and is allowed by the project's existing config (it does NOT need the legacy `as React.CSSProperties` cast in `.jsx` files).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/components/Pages/FRONT_END/home/HeroSection.jsx
git commit -m "feat(home): stagger hero heading, subtitle, and FilterBar entrance"
```

---

## Task 3: Update the existing test

**Files:**

- Modify: `frontend/src/app/components/Pages/FRONT_END/home/__tests__/HeroSection.test.jsx`

- [ ] **Step 1: Read the current test**

Run: `cat frontend/src/app/components/Pages/FRONT_END/home/__tests__/HeroSection.test.jsx`

Examine which testing library is in use (Jest + RTL or Vitest + RTL — both are supported in the project). Confirm `FilterBar` is mocked or rendered as-is.

- [ ] **Step 2: Add assertions for the animation hooks**

Append these tests inside the existing `describe` block (do not replace existing tests):

```jsx
it('applies hero-rise to the heading', () => {
  const { container } = render(<HeroSection />);
  const heading = container.querySelector('h1');
  expect(heading).toHaveClass('hero-rise');
});

it('applies hero-rise with 120ms delay to the subtitle', () => {
  const { container } = render(<HeroSection />);
  const subtitle = container.querySelector('p');
  expect(subtitle).toHaveClass('hero-rise');
  expect(subtitle.getAttribute('style')).toContain('--hero-rise-delay: 120ms');
});

it('wraps FilterBar in an inline-block span with hero-rise and 240ms delay', () => {
  const { container } = render(<HeroSection />);
  const wrapper = container.querySelector('span.hero-rise');
  expect(wrapper).not.toBeNull();
  expect(wrapper).toHaveClass('inline-block');
  expect(wrapper.getAttribute('style')).toContain('--hero-rise-delay: 240ms');
});
```

If the existing test file does not yet import `@testing-library/jest-dom`'s `toHaveClass`, ensure the setup file already loads it (the project uses a shared jest setup — verify before adding an import). If not present, add:

```jsx
import '@testing-library/jest-dom';
```

at the top of the test file.

- [ ] **Step 3: Run the suite for this file**

```bash
cd frontend && npx jest src/app/components/Pages/FRONT_END/home/__tests__/HeroSection.test.jsx 2>&1 | tail -30
```

Expected: all three new assertions pass plus the previously-passing tests. If the project uses Vitest instead of Jest, run:

```bash
cd frontend && npx vitest run src/app/components/Pages/FRONT_END/home/__tests__/HeroSection.test.jsx 2>&1 | tail -30
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/components/Pages/FRONT_END/home/__tests__/HeroSection.test.jsx
git commit -m "test(home): cover hero entrance animation hooks"
```

---

## Task 4: Visual verification with Chrome DevTools MCP

**Files:** none (verification only)

- [ ] **Step 1: Ensure the dev server is running**

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/
```

Expected: `200`. If not 200, start the server:

```bash
cd frontend && (npm run dev > /tmp/weelp-fe.log 2>&1 &) && sleep 8
```

Then re-curl and expect `200`.

- [ ] **Step 2: Open the homepage in Chrome DevTools MCP**

```text
mcp__chrome-devtools__new_page url=http://localhost:3000/
```

Then:

```text
mcp__chrome-devtools__take_screenshot fullPage=false
```

Capture the hero region. The screenshot is for the human review gate; do not parse it programmatically.

- [ ] **Step 3: Confirm the elements carry the class at runtime**

```text
mcp__chrome-devtools__evaluate_script
  function: () => {
    const sec = document.querySelector('h1')?.closest('section');
    const h1 = sec?.querySelector('h1');
    const p = sec?.querySelector('p');
    const wrapper = sec?.querySelector('span.hero-rise');
    return {
      h1Class: h1?.className ?? null,
      pStyle: p?.getAttribute('style') ?? null,
      wrapperTag: wrapper?.tagName ?? null,
      wrapperDisplay: wrapper ? getComputedStyle(wrapper).display : null,
      filterBarLeft: wrapper?.firstElementChild?.getBoundingClientRect().left,
      heroCenter: sec?.getBoundingClientRect().width / 2 + sec?.getBoundingClientRect().left,
    };
  }
```

Expected:

- `h1Class` contains `hero-rise`
- `pStyle` contains `--hero-rise-delay: 120ms`
- `wrapperTag === 'SPAN'`
- `wrapperDisplay === 'inline-block'`
- The FilterBar's left edge plus half its width approximately equals `heroCenter` (i.e. it is still horizontally centered). Tolerance: ±2 px.

If FilterBar is not centered to within 2 px, STOP — the wrapper is breaking layout. The most likely cause is `inline-block` interacting badly with `FilterBar`'s root width. Switch the wrapper to a `<div className="hero-rise w-fit">` and re-verify. If that also fails, remove the wrapper entirely and apply `.hero-rise` directly to `FilterBar`'s root by adding a `className` prop to `FilterBar` and forwarding it (this is a larger change and should be flagged for review before doing).

- [ ] **Step 4: Verify the animation plays once on load**

```text
mcp__chrome-devtools__navigate_page url=http://localhost:3000/
```

Then within 1 second:

```text
mcp__chrome-devtools__evaluate_script
  function: () => {
    const h1 = document.querySelector('section h1');
    const anim = h1.getAnimations()[0];
    return {
      name: anim?.animationName,
      playState: anim?.playState,
      currentTime: anim?.currentTime,
    };
  }
```

Expected: `name === 'heroRise'`, `playState === 'running'` (or `finished` if the script runs after 700 ms). If no animation is reported on the heading, the keyframe was not applied — re-check globals.css and the class name.

- [ ] **Step 5: Verify prefers-reduced-motion behavior**

```text
mcp__chrome-devtools__emulate
  prefersReducedMotion: 'reduce'
```

Then reload and re-run the `getAnimations()` check. Expected: animation either does not run or its `currentTime` immediately jumps past `0.01ms`. The end state (opacity 1, no translate) must be the visible state.

Reset the emulation when done:

```text
mcp__chrome-devtools__emulate
  prefersReducedMotion: 'no-preference'
```

- [ ] **Step 6: Performance sanity check (optional but recommended)**

```text
mcp__chrome-devtools__performance_start_trace
mcp__chrome-devtools__navigate_page url=http://localhost:3000/
mcp__chrome-devtools__performance_stop_trace
```

Inspect the trace for the hero load. Expected: no layout (purple) work on the animated elements during the 700 ms window — only composite (green). If layout shows up, transform/opacity was not the only animating property; re-check the CSS.

- [ ] **Step 7: Document the verification in the daily report**

Append a sub-section to `frontend/Reports/daily-work-report.md` under the existing 2026-05-12 entry summarizing: classes applied, prefers-reduced-motion verified, no layout work in trace, FilterBar centered within tolerance. One short paragraph, no marketing language.

- [ ] **Step 8: Commit the report update**

```bash
git add frontend/Reports/daily-work-report.md
git commit -m "docs(reports): log hero entrance animation verification 2026-05-12"
```

---

## Task 5: Push to main

**Files:** none (git only)

- [ ] **Step 1: Confirm the branch is `main` and all four commits are present**

```bash
cd frontend && git status && git log --oneline -5
```

Expected: HEAD is on `main`, working tree clean, last commits include the four created by Tasks 1–4.

- [ ] **Step 2: Push**

```bash
cd frontend && git push origin main
```

Expected: push succeeds; CI (if any) is green for the new commits.

---

## Self-Review

**Spec coverage:**

- Entrance animation on h1, subtitle, FilterBar → Tasks 1 and 2.
- ease-out-expo curve at 700 ms → Task 1, keyframe + class definition.
- Stagger 0/120/240 ms → Task 2, custom property per element.
- No layout-property animation → only `opacity` and `transform` keyframe — confirmed.
- No alignment regression → Task 2 uses `<span className="inline-block">` wrapper; Task 4 step 3 verifies center within ±2 px.
- prefers-reduced-motion respected → Task 1 includes the `@media` block; Task 4 step 5 verifies in DevTools.
- Chrome DevTools verification → Task 4 covers it in five sub-steps.
- Test coverage → Task 3 adds three assertions to the existing test.
- Push to main per CLAUDE.md rule 8 → Task 5.

**Placeholder scan:** None of "TBD", "implement later", "similar to Task N", or "handle edge cases" appear. Every code block is concrete.

**Type / name consistency:** Class name `hero-rise` is identical across Tasks 1, 2, 3, and 4. Custom property `--hero-rise-delay` is identical across Tasks 1, 2, and 4. Keyframe `heroRise` appears only in Task 1 (definition) and Task 4 step 4 (`getAnimations()` assertion). Wrapper element is `<span>` consistently (Tasks 2, 3, 4).

Plan complete.
