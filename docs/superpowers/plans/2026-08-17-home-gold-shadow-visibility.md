# Home Gold Shadow Visibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the dark `/home-gold` Top Destinations hover shadow slightly more noticeable without changing its border intensity or reintroducing light spill onto neighboring cards.

**Architecture:** Keep the existing route-scoped CSS selector and Tailwind ring stack. Change only the two gold shadow layers, preserving the `0.72` hover border and negative spread; protect the exact declaration with the existing PostCSS contract test.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS, PostCSS, Jest, agent-browser

---

### Task 1: Lock the stronger contained shadow contract

**Files:**

- Test: `src/app/__tests__/deepForestTheme.test.js:518-529`

- [ ] **Step 1: Change the exact expected shadow while keeping the border assertion unchanged**

```js
'border-color': {
  important: false,
  value: 'rgb(var(--weelp-gold-edge-rgb) / 0.72)',
},
'box-shadow': {
  important: false,
  value: 'var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow), 0 8px 16px -7px rgb(var(--weelp-gold-edge-rgb) / 0.22), 0 3px 6px -2px rgb(var(--weelp-gold-edge-rgb) / 0.12)',
},
```

- [ ] **Step 2: Run the focused theme test and verify the new contract fails before CSS changes**

Run:

```bash
npx jest src/app/__tests__/deepForestTheme.test.js --runInBand
```

Expected: one failure showing the old `14px/-8px` and `4px/-2px` shadow values, with the other tests passing.

### Task 2: Implement only the approved shadow lift

**Files:**

- Modify: `src/app/globals.css:313-321`
- Test: `src/app/__tests__/deepForestTheme.test.js`

- [ ] **Step 1: Replace only the two gold shadow layers**

```css
.dark .home-gold-theme .weelp-destination-card:hover {
  border-color: rgb(var(--weelp-gold-edge-rgb) / 0.72);
  box-shadow:
    var(--tw-ring-offset-shadow),
    var(--tw-ring-shadow),
    var(--tw-shadow),
    0 8px 16px -7px rgb(var(--weelp-gold-edge-rgb) / 0.22),
    0 3px 6px -2px rgb(var(--weelp-gold-edge-rgb) / 0.12);
}
```

Do not change the border value, selector scope, transition, carousel gutter, or light-mode rules.

- [ ] **Step 2: Run the focused theme test and verify it passes**

Run:

```bash
npx jest src/app/__tests__/deepForestTheme.test.js --runInBand
```

Expected: 70 tests pass and no failures.

- [ ] **Step 3: Run the related destination tests**

Run:

```bash
npx jest src/app/__tests__/deepForestTheme.test.js src/app/components/__tests__/CityCard.test.jsx src/app/components/Pages/FRONT_END/home/__tests__/BrowseDestinationsSection.test.jsx --runInBand
```

Expected: 3 suites and 73 tests pass.

### Task 3: Verify visual isolation and project quality

**Files:**

- Verify: `src/app/globals.css`
- Verify: `src/app/__tests__/deepForestTheme.test.js`

- [ ] **Step 1: Review error-handling impact**

Invoke `error-handling-patterns` and confirm this CSS/test-only change adds no input, async, failure, cleanup, or control-flow path that requires new error handling.

- [ ] **Step 2: Run static verification**

Run:

```bash
npm run type-check
npm run lint
git diff --check
```

Expected: all commands exit successfully; the dark-mode guard reports no new hardcoded colour findings.

- [ ] **Step 3: Inspect dark `/home-gold` in the visible headed browser at desktop width**

Run:

```bash
agent-browser --session weelp-visible --headed open http://localhost:3000/home-gold
agent-browser --session weelp-visible set viewport 1440 900
```

Hover a middle Top Destination card and verify its shadow is more noticeable than the previous contained shadow. Confirm the computed hover border remains `rgba(194, 163, 91, 0.72)`, sibling card styles remain unchanged, and visible light does not reach neighboring cards.

- [ ] **Step 4: Verify mobile containment and sibling isolation**

At `390x844`, measure the visible gap between adjacent destination cards, confirm there is no horizontal overflow, and hover the visible card to verify the shadow stays inside the carousel gutter without touching or changing its sibling.

- [ ] **Step 5: Compare `/home-gold` with canonical `/` in both themes and widths**

At `1440x900` and `390x844`, inspect both `/home-gold` and `/`. In light mode, confirm Top Destinations rest and hover border/shadow values match the canonical homepage. In dark mode, confirm the stronger gold shadow appears only on `/home-gold` and the canonical homepage remains unchanged.

- [ ] **Step 6: Run the production build**

Run:

```bash
npm run build
```

Expected: build exits successfully and includes `/home-gold` in the route output.

### Task 4: Review, simplify, commit, and push

**Files:**

- Review: `src/app/globals.css`
- Review: `src/app/__tests__/deepForestTheme.test.js`
- Modify: `docs/superpowers/specs/2026-08-17-home-gold-design.md`

- [ ] **Step 1: Request final code review**

Review spec compliance first, then CSS cascade, dark-only route isolation, border invariance, ring-stack preservation, test quality, mobile paint reach, security, and performance. Address any critical or major finding and re-review.

- [ ] **Step 2: Simplify the diff**

Keep the implementation to the two shadow-value changes and their exact test contract. Do not introduce a new token or component abstraction for a single route-scoped declaration.

- [ ] **Step 3: Run fresh verification after review**

Run:

```bash
npx jest src/app/__tests__/deepForestTheme.test.js src/app/components/__tests__/CityCard.test.jsx src/app/components/Pages/FRONT_END/home/__tests__/BrowseDestinationsSection.test.jsx --runInBand
npm run type-check
npm run lint
npm run build
git diff --check
```

Expected: 73 focused tests pass and every command exits successfully.

- [ ] **Step 4: Commit and push `main`**

```bash
git add src/app/globals.css src/app/__tests__/deepForestTheme.test.js docs/superpowers/plans/2026-08-17-home-gold-shadow-visibility.md docs/superpowers/specs/2026-08-17-home-gold-design.md
git commit -m "increase contained gold destination shadow"
git push origin main
```

Confirm `HEAD` equals `origin/main` and the worktree is clean.
