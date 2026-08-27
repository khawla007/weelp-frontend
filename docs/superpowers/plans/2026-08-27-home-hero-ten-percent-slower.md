# Home Hero Ten Percent Slower Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Slow the current homepage hero entrance by exactly 10 percent without changing its first-paint trigger or choreography.

**Architecture:** Keep the server-rendered CSS-first entrance unchanged. Update only the existing CSS custom-property timings in `HeroSection.jsx` and the character animation timings in `globals.css`, with focused tests locking all four values.

**Tech Stack:** Next.js 16, React 19, CSS animations, Jest, Testing Library, PostCSS

---

### Task 1: Scale the hero timing contract by 1.10

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/home/__tests__/HeroSection.test.jsx`
- Modify: `src/app/components/Pages/FRONT_END/home/__tests__/HeroMotionStyles.test.js`
- Modify: `src/app/components/Pages/FRONT_END/home/HeroSection.jsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Write the failing supporting-element timing assertions**

Change the four `toHaveStyle` expectations in `HeroSection.test.jsx` to require `935ms` durations and `275ms` delayed offsets while keeping immediate offsets at `0ms`:

```jsx
expect(eyebrow).toHaveStyle({ '--weelp-motion-delay': '0ms', '--weelp-motion-duration': '935ms', '--weelp-motion-ease': 'ease', '--weelp-reveal-y': '20px' });
expect(subtitle).toHaveStyle({ '--weelp-motion-delay': '275ms', '--weelp-motion-duration': '935ms', '--weelp-motion-ease': 'ease', '--weelp-reveal-y': '20px' });
expect(searchWrapper).toHaveStyle({ '--weelp-motion-delay': '0ms', '--weelp-motion-duration': '935ms', '--weelp-motion-ease': 'ease', '--weelp-reveal-y': '20px' });
expect(trustList).toHaveStyle({ '--weelp-motion-delay': '275ms', '--weelp-motion-duration': '935ms', '--weelp-motion-ease': 'ease', '--weelp-reveal-y': '20px' });
```

- [ ] **Step 2: Write the failing headline timing assertions**

Change the ready-state character expectations in `HeroMotionStyles.test.js` to:

```js
expect(declarations("[data-home-hero-motion='ready'] .weelp-home-hero-blur-character")).toMatchObject({
  animation: 'weelpHomeHeroBlurReveal 770ms cubic-bezier(0.33, 1, 0.68, 1) both',
  'animation-delay': 'calc(var(--weelp-hero-character-index, 0) * 38.5ms)',
});
```

- [ ] **Step 3: Run the focused tests and verify RED**

Run:

```bash
npx jest src/app/components/Pages/FRONT_END/home/__tests__/HeroSection.test.jsx src/app/components/Pages/FRONT_END/home/__tests__/HeroMotionStyles.test.js --runInBand
```

Expected: both suites fail only where the old `850ms`, `250ms`, `700ms`, and `35ms` values differ from the new assertions.

- [ ] **Step 4: Load the required Next.js implementation guidance**

Invoke `next-best-practices`, `vercel-react-best-practices`, and `vercel-composition-patterns`. Confirm the change keeps `HeroSection.jsx` server-rendered, introduces no client boundary, and adds no runtime JavaScript.

- [ ] **Step 5: Implement the exact 10 percent timing scale**

In `HeroSection.jsx`, update the timing constants to:

```js
const HERO_OBJECT_MOTION = {
  '--weelp-motion-duration': '935ms',
  '--weelp-motion-ease': 'ease',
  '--weelp-reveal-y': '20px',
};

const HERO_OBJECT_MOTION_IMMEDIATE = { ...HERO_OBJECT_MOTION, '--weelp-motion-delay': '0ms' };
const HERO_OBJECT_MOTION_DELAYED = { ...HERO_OBJECT_MOTION, '--weelp-motion-delay': '275ms' };
```

In `globals.css`, update the ready-state character animation to:

```css
[data-home-hero-motion='ready'] .weelp-home-hero-blur-character {
  animation: weelpHomeHeroBlurReveal 770ms cubic-bezier(0.33, 1, 0.68, 1) both;
  animation-delay: calc(var(--weelp-hero-character-index, 0) * 38.5ms);
}
```

- [ ] **Step 6: Invoke error-handling guidance and verify GREEN**

Invoke `error-handling-patterns` immediately after the code change. This timing-only change introduces no new failure path; confirm the existing reduced-motion fallback remains untouched.

Run the command from Step 3.

Expected: 2 suites pass with 11 tests and no warnings.

- [ ] **Step 7: Run static verification**

Run:

```bash
npm run type-check
npm run lint
git diff --check
```

Expected: all commands exit successfully; the dark-mode guard reports no new hardcoded color findings.

- [ ] **Step 8: Verify in the visible local browser**

Reload `http://localhost:3000` in the named headed `weelp-visible` session. Inspect character indices `0` and `1`: both must report a `770ms` duration, while index `0` reports zero delay and index `1` reports `38.5ms` (or the equivalent browser serialization `0.0385s`). Inspect one immediate and one delayed `.weelp-hero-ui-rise` element: both must report `935ms`, with delays of zero and `275ms` (or `0.275s`). Confirm all hero content reaches opacity `1`, `scrollWidth <= clientWidth`, reduced-motion users receive static visible content, and browser errors are empty.

- [ ] **Step 9: Run review and simplify gates**

Dispatch the required code-reviewer agent against the final diff. Address critical or major findings and re-review if changed. Invoke the `simplify` skill after approval.

- [ ] **Step 10: Run unconditional post-simplify verification**

Whether or not simplify changes code, re-run the focused Jest command, `npm run type-check`, `npm run lint`, and `git diff --check`. Repeat the normal-motion and reduced-motion checks in the visible `weelp-visible` browser session and confirm browser errors remain empty.

- [ ] **Step 11: Commit and push only the scoped hero work on `main`**

Confirm the current branch is `main`. Stage only the task-owned hero implementation, focused tests, and approved plan:

```bash
git add src/app/components/Pages/FRONT_END/home/HeroSection.jsx src/app/components/Pages/FRONT_END/home/HeroMotionReady.jsx src/app/components/Pages/FRONT_END/home/__tests__/HeroMotionReady.test.jsx src/app/components/Pages/FRONT_END/home/__tests__/HeroMotionStyles.test.js src/app/components/Pages/FRONT_END/home/__tests__/HeroSection.test.jsx src/app/globals.css docs/superpowers/plans/2026-08-27-home-hero-ten-percent-slower.md
git commit -m "fix: tune home hero entrance timing"
git push origin main
```

Before committing, inspect `git diff --cached --stat` and `git diff --cached` to confirm no unrelated user changes are staged. Expected: the previously approved first-paint hero fix plus this exact 10 percent slowdown, its focused tests, and this implementation plan only.
