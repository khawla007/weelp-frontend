# City Hero Dark-Mode Arrow Color Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the decorative arrow on the single city page match the solid `#588f7a` bottom shape in dark mode without changing light mode or shared SVG behavior.

**Architecture:** Keep the change local to `CityHeroBanner.jsx` by replacing only the arrow's dark-mode text utility. Protect the scope with a focused component test, then run the project checks and verify the computed local-browser color.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS, Jest, Testing Library, agent-browser

---

### Task 1: Lock the city-only dark arrow color with a regression test

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/city/__tests__/CityHeroBanner.test.jsx`

- [ ] **Step 1: Add the failing regression test**

Append this test inside the existing `describe('CityHeroBanner', ...)` block:

```jsx
it('matches the dark-mode arrow to the solid teal bottom vector', () => {
  const { getByTestId } = render(<CityHeroBanner city={{ name: 'Dubai' }} />);

  const bottomVector = getByTestId('vector-2');
  const arrow = getByTestId('vector-arrow');

  expect(bottomVector).toHaveClass('dark:text-white/10');
  expect(arrow).toHaveClass('dark:text-[var(--weelp-city-brand)]');
  expect(arrow).not.toHaveClass('dark:text-white/10');
});
```

- [ ] **Step 2: Run the focused test and confirm the regression fails**

Run:

```bash
npm run test:ci -- --runInBand src/app/components/Pages/FRONT_END/city/__tests__/CityHeroBanner.test.jsx
```

Expected: FAIL because the arrow still has `dark:text-white/10` instead of the exact city-brand color utility.

### Task 2: Apply the scoped arrow color change

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/city/CityHeroBanner.jsx:49`

- [ ] **Step 1: Replace only the arrow's dark-mode utility**

Change the decorative arrow from:

```jsx
<Icons.VectorArrow aria-hidden="true" className="pointer-events-none absolute bottom-[125px] left-[167.1px] z-0 hidden -rotate-[27.247deg] text-weelp-sage-deep/70 dark:text-white/10 lg:block" />
```

to:

```jsx
<Icons.VectorArrow
  aria-hidden="true"
  className="pointer-events-none absolute bottom-[125px] left-[167.1px] z-0 hidden -rotate-[27.247deg] text-weelp-sage-deep/70 dark:text-[var(--weelp-city-brand)] lg:block"
/>
```

The existing `--weelp-city-brand` variable resolves to the same fixed `#588f7a` used by `Vector2`, without introducing a new hardcoded-color guard exemption. Do not edit `VectorArrow` in `public/assets/Icons/Icons.jsx` or the `Vector2` instance immediately above it.

- [ ] **Step 2: Run the focused test and confirm it passes**

Run:

```bash
npm run test:ci -- --runInBand src/app/components/Pages/FRONT_END/city/__tests__/CityHeroBanner.test.jsx
```

Expected: PASS with both `CityHeroBanner` tests passing.

### Task 3: Verify quality and the local dark-mode result

**Files:**

- Verify: `src/app/components/Pages/FRONT_END/city/CityHeroBanner.jsx`
- Verify: `src/app/components/Pages/FRONT_END/city/__tests__/CityHeroBanner.test.jsx`

- [ ] **Step 1: Apply the required error-handling review**

Use the `error-handling-patterns` skill to confirm this static presentation change introduces no new error path or exception handling requirement.

- [ ] **Step 2: Run type checking**

Run:

```bash
npm run type-check
```

Expected: PASS with no TypeScript errors.

- [ ] **Step 3: Run linting**

Run:

```bash
npm run lint
```

Expected: PASS with no ESLint warnings and no dark-mode guard failure.

- [ ] **Step 4: Verify the local page in the visible browser**

Open `http://localhost:3000/cities/dubai` in the named headed `weelp-visible` session at desktop width with dark mode active. Read the computed styles for the city hero decoration and confirm:

```text
Vector2 path fill: rgb(88, 143, 122)
VectorArrow color and path fill: rgb(88, 143, 122)
```

Also confirm the arrow remains positioned above the bottom-left teal shape and no other hero decoration changed.

- [ ] **Step 5: Complete the code-review and simplify loop**

Dispatch the required code-review agent against the final diff. Address every requested change, then dispatch the reviewer again. Repeat fix → re-review until the reviewer has no remaining actionable findings. Invoke the `simplify` skill only after the review loop is clear, and apply any in-scope clarity or reuse improvement it identifies.

- [ ] **Step 6: Run final verification unconditionally**

After review and simplification, run all three checks even when those gates made no code changes:

```bash
npm run test:ci -- --runInBand src/app/components/Pages/FRONT_END/city/__tests__/CityHeroBanner.test.jsx
npm run type-check
npm run lint
```

Expected: the focused suite passes, TypeScript reports no errors, ESLint reports no warnings, and the dark-mode guard passes.

Then re-open `http://localhost:3000/cities/dubai` in the visible headed `weelp-visible` session with dark mode active. Confirm again that both decorative paths compute to `rgb(88, 143, 122)` and that the arrow's position is unchanged. This final browser pass is required even when review and simplification did not change code.

- [ ] **Step 7: Inspect the final diff and commit to `main`**

Run:

```bash
git diff --check
git status --short
git branch --show-current
```

Expected: no whitespace errors, only the design/plan, city hero, and city hero test are changed, and the branch is `main`.

Then commit the verified files:

```bash
git add src/docs/superpowers/specs/2026-08-04-city-hero-dark-arrow-color-design.md src/docs/superpowers/plans/2026-08-04-city-hero-dark-arrow-color.md src/app/components/Pages/FRONT_END/city/CityHeroBanner.jsx src/app/components/Pages/FRONT_END/city/__tests__/CityHeroBanner.test.jsx
git commit -m "fix: match city hero arrow to teal shape"
git push origin main
```

Expected: the commit succeeds on `main` and `origin/main` receives it.
