# Home Gold Destination No-Shadow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove every hover shadow from Top Destination cards on dark `/home-gold` while retaining their permanent antique-gold edge and preserving all other routes and themes.

**Architecture:** Keep the existing route-scoped destination selector because deleting it would expose `CityCard`'s shared neutral Tailwind hover shadow. Replace the gold shadow stack with the existing ring/base-shadow stack only, remove shadow-specific transition tuning and carousel gutter CSS, and lock the behavior with the existing PostCSS contract test.

**Tech Stack:** Next.js 16, Tailwind CSS, PostCSS, Jest, agent-browser

---

### Task 1: Specify the no-shadow contract

**Files:**

- Modify: `src/app/__tests__/deepForestTheme.test.js:489-542`

- [ ] **Step 1: Update the destination contract before production CSS**

Keep the dark destination base assertions for `border-color`, `--tw-ring-color`, and `--tw-shadow`. Remove the three route-specific transition assertions. Change the dark hover expectation to:

```js
expect(destinationHoverContract).toMatchObject({
  'box-shadow': {
    important: false,
    value: 'var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)',
  },
});
```

Replace the destination carousel declaration contract with an absence check:

```js
const destinationCarouselSelector = '.dark .home-gold-theme .carousel-shell-wrapper:has(.weelp-destination-card)';
expect(() => findExactRule(destinationCarouselSelector)).toThrow();
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npx jest src/app/__tests__/deepForestTheme.test.js --runInBand
```

Expected: one failing contract test because production CSS still contains the two gold shadow layers and the destination carousel gutter rule.

### Task 2: Remove the destination hover shadow

**Files:**

- Modify: `src/app/globals.css:302-322`

- [ ] **Step 1: Apply the minimal route-scoped CSS**

Keep the permanent edge declarations in the base rule, but remove its shadow-only transition declarations:

```css
.dark .home-gold-theme .weelp-destination-card {
  --tw-ring-color: var(--weelp-card-border);
  --tw-shadow: 0 0 #0000;
  border-color: var(--weelp-card-border);
}
```

Retain a scoped hover override so the component's shared neutral Tailwind hover shadow cannot return:

```css
.dark .home-gold-theme .weelp-destination-card:hover {
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
```

Delete the complete `.dark .home-gold-theme .carousel-shell-wrapper:has(.weelp-destination-card)` rule because its padding and negative margins exist only to make room for the removed shadow.

- [ ] **Step 2: Run the focused test and verify GREEN**

Run:

```bash
npx jest src/app/__tests__/deepForestTheme.test.js --runInBand
```

Expected: 70 tests pass.

### Task 3: Verify behavior and isolation

**Files:**

- Verify: `src/app/globals.css`
- Verify: `src/app/__tests__/deepForestTheme.test.js`

- [ ] **Step 1: Review error-handling impact**

Invoke `error-handling-patterns`. Confirm that the CSS-only change adds no error or control-flow path.

- [ ] **Step 2: Run the mandatory static checks**

Run these commands in order:

```bash
npm run type-check
npm run lint
```

Expected: type-check and lint/dark guard pass.

- [ ] **Step 3: Verify in the mandatory visible browser**

Use named headed session `weelp-visible` against `http://localhost:3000`.

At 1440x900 and 390x844, inspect dark `/home-gold` and confirm:

- Top Destination computed `box-shadow` is identical before, during, and after hover;
- the permanent gold border remains unchanged;
- no gold or neutral depth shadow, white flash, edge jump, clipping, or overflow appears;
- removing the gutter does not clip card borders or alter carousel spacing.
- keyboard focus, including focus plus hover, retains the visible ring while adding no depth shadow.

Check light `/home-gold` and canonical `/` to confirm their existing City Card hover behavior is unchanged.

- [ ] **Step 4: Run related tests, build, and diff hygiene**

```bash
npx jest --runTestsByPath src/app/__tests__/deepForestTheme.test.js 'src/app/(frontend)/__tests__/FrontendShell.test.jsx' src/app/components/__tests__/CityCard.test.jsx --runInBand
npm run build
git diff --check
```

Expected: 75 related tests, the production build, and diff hygiene pass.

### Task 4: Review, simplify, commit, and push

**Files:**

- Modify: `src/app/globals.css`
- Modify: `src/app/__tests__/deepForestTheme.test.js`
- Add: `docs/superpowers/plans/2026-08-18-home-gold-destination-no-shadow.md`

- [ ] **Step 1: Run the mandatory final review gates**

Dispatch the code-reviewer agent, address any findings, and re-review if needed. Invoke `simplify` if available; otherwise perform a manual minimality pass.

- [ ] **Step 2: Run fresh post-review verification**

Run the following after review and simplification:

```bash
npm run type-check
npm run lint
npx jest --runTestsByPath src/app/__tests__/deepForestTheme.test.js 'src/app/(frontend)/__tests__/FrontendShell.test.jsx' src/app/components/__tests__/CityCard.test.jsx --runInBand
npm run build
git diff --check
```

Expected: type-check, lint/dark guard, all 75 related tests, production build, and diff hygiene pass with the reviewed files.

- [ ] **Step 3: Commit and push directly to `main`**

Stage the exact implementation and plan files, commit with:

```text
remove destination hover shadow
```

Push `main`, then confirm the worktree is clean and `HEAD` equals `origin/main`.
