# Dashboard Dark Surface Hierarchy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the admin dashboard use Weelp's global dark page background while preserving its existing light-mode canvas and card surfaces.

**Architecture:** Keep the change at the shared admin layout boundary, where every admin route receives its page canvas. Add a focused source-contract assertion to the existing dashboard layout test suite, then add the dark-mode Tailwind override without changing global tokens or individual cards.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS, Jest

---

### Task 1: Align the admin dark-mode canvas

**Files:**

- Modify: `src/app/components/DashboardShared/__tests__/DashboardResponsiveLayout.test.js`
- Modify: `src/app/(dashboard)/dashboard/admin/layout.js:15`

- [ ] **Step 1: Write the failing surface-hierarchy regression test**

Add this adjacent suite after the existing `dashboard mobile overflow contracts` suite:

```js
describe('dashboard surface hierarchy', () => {
  it('uses the public dark canvas while preserving the muted light canvas', () => {
    const layoutSource = readSource('src/app/(dashboard)/dashboard/admin/layout.js');

    expect(layoutSource).toContain('className="flex min-h-screen w-full min-w-0 bg-muted dark:bg-background"');
  });
});
```

- [ ] **Step 2: Run the focused test and confirm the regression is exposed**

Run:

```bash
npx jest src/app/components/DashboardShared/__tests__/DashboardResponsiveLayout.test.js --runInBand
```

Expected: FAIL because the shared admin wrapper contains `bg-muted` but does not yet contain `dark:bg-background`.

- [ ] **Step 3: Apply the minimal shared-layout fix**

Change the outer admin layout wrapper to:

```jsx
<div className="flex min-h-screen w-full min-w-0 bg-muted dark:bg-background">
```

Do not alter the global `background`, `muted`, or `card` values, and do not add page-level dashboard overrides.

- [ ] **Step 4: Run the focused test and confirm it passes**

Run:

```bash
npx jest src/app/components/DashboardShared/__tests__/DashboardResponsiveLayout.test.js --runInBand
```

Expected: PASS for every test in `DashboardResponsiveLayout.test.js`.

- [ ] **Step 5: Apply the error-handling review and run the full relevant test set**

Invoke the `error-handling-patterns` skill and confirm this token-only layout change does not add an error boundary, async failure path, or recovery behavior that needs implementation.

Run:

```bash
npx jest src/app/components/DashboardShared/__tests__/DashboardResponsiveLayout.test.js src/app/__tests__/deepForestTheme.test.js --runInBand
```

Expected: both the dashboard layout contracts and the existing dark-theme contract pass.

- [ ] **Step 6: Run static verification**

Run:

```bash
npm run type-check
npm run lint
git diff --check
```

Expected: all commands exit successfully with no TypeScript errors, lint warnings, or whitespace errors.

- [ ] **Step 7: Verify the rendered theme hierarchy in the visible browser**

Open or reuse the named visible session with `agent-browser --session weelp-visible --headed open http://localhost:3000/dashboard/admin`, confirm the browser is visibly open, and inspect the page in dark mode at desktop width. Confirm the admin canvas computes to the global dark background (`rgb(8, 17, 14)`) and a representative dashboard card computes to the lighter card surface (`rgb(16, 30, 25)`).

Switch to light mode and confirm the admin canvas remains the muted light surface while cards remain white. Return to dark mode, set the viewport to 320 by 900, and confirm there is no horizontal overflow or unintended background gap.

- [ ] **Step 8: Review, simplify, re-verify, and commit**

Run the mandatory code-review gate. Fix critical or major findings and re-run review until approved. Then invoke the `simplify` skill on the implementation.

After review and simplify, repeat Steps 5 through 7 so the final implementation passes the focused and theme tests, type-check, lint, `git diff --check`, and visible desktop/mobile theme verification. If review or simplify makes no code change, the repeated verification is still required before committing.

Stage only the test and admin layout files:

```bash
git add 'src/app/components/DashboardShared/__tests__/DashboardResponsiveLayout.test.js' 'src/app/(dashboard)/dashboard/admin/layout.js'
git commit -m "fix(dashboard): align dark surface hierarchy"
```

Push the verified commit to `main`.
