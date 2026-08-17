# Home Gold Hover Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep Top Destinations cards and the “Plan calmer escapes” eyebrow free of gold borders while giving destination cards a soft gold shadow on hover.

**Architecture:** Add stable semantic classes to the shared `CityCard` and hero eyebrow, then use route-scoped rules under `.home-gold-theme`. Exclude destination cards from the existing generic gold-link hover border so the canonical homepage and every other card remain unchanged.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS, PostCSS tests, Jest, Testing Library

---

### Task 1: Lock the two scoped treatment hooks

**Files:**

- Modify: `src/app/components/CityCard.jsx`
- Modify: `src/app/components/__tests__/CityCard.test.jsx`
- Modify: `src/app/components/Pages/FRONT_END/home/HeroSection.jsx`
- Modify: `src/app/components/Pages/FRONT_END/home/__tests__/HeroSection.test.jsx`

- [ ] **Step 1: Write failing component tests**

Add assertions that the city link has `weelp-destination-card` and that the “Plan calmer escapes” element has `weelp-home-hero-eyebrow`.

- [ ] **Step 2: Run the component tests and confirm they fail**

Run:

```bash
npx jest --runTestsByPath src/app/components/__tests__/CityCard.test.jsx src/app/components/Pages/FRONT_END/home/__tests__/HeroSection.test.jsx --runInBand
```

Expected: both new class assertions fail.

- [ ] **Step 3: Add the minimal semantic classes**

Add `weelp-destination-card` to the `NavigationLink` class list in `CityCard.jsx`. Add `weelp-home-hero-eyebrow` to the hero eyebrow span. Do not alter layout, copy, imagery, or canonical colour utilities.

- [ ] **Step 4: Re-run the component tests**

Expected: both suites pass.

### Task 2: Replace the destination hover edge with a gold shadow

**Files:**

- Modify: `src/app/globals.css`
- Modify: `src/app/__tests__/deepForestTheme.test.js`

- [ ] **Step 1: Write the failing CSS contract test**

Update the existing home-gold interaction test to require:

```js
const hoverSelectors = [
  '.home-gold-theme a:not(.weelp-destination-card):hover',
  ".home-gold-theme button:not(:disabled):not([aria-disabled='true']):not([aria-invalid='true']):hover",
  ".home-gold-theme [role='button']:not([aria-disabled='true']):not([aria-invalid='true']):hover",
];

expect(findExactRule(hoverSelectors).rule).toBeDefined();
expect(extractDeclarationContract(hoverSelectors)).toMatchObject({
  '--border': { important: false, value: '42 43% 56% / 0.72' },
  'border-color': { important: false, value: 'rgb(var(--weelp-gold-edge-rgb) / 0.72)' },
});

const destinationHoverRule = findExactRule('.home-gold-theme .weelp-destination-card:hover').rule;
expect(destinationHoverRule.parent.type).toBe('root');
expect(extractDeclarationContract('.home-gold-theme .weelp-destination-card:hover')).toMatchObject({
  'border-color': { important: false, value: 'rgb(255 255 255 / 0.8)' },
  'box-shadow': {
    important: false,
    value: '0 12px 30px rgb(var(--weelp-gold-edge-rgb) / 0.2), 0 2px 10px rgb(var(--weelp-gold-edge-rgb) / 0.12)',
  },
});
expect(extractDeclarationContract('.dark .home-gold-theme .weelp-destination-card:hover')).toMatchObject({
  'border-color': { important: false, value: 'rgb(255 255 255 / 0.1)' },
});
expect(extractDeclarationContract('.home-gold-theme .weelp-home-hero-eyebrow')).toMatchObject({
  'border-color': { important: false, value: 'transparent' },
});
expect(findExactRule('.dark .home-gold-theme .weelp-destination-card:hover').rule.parent.type).toBe('root');
expect(findExactRule('.home-gold-theme .weelp-home-hero-eyebrow').rule.parent.type).toBe('root');
```

- [ ] **Step 2: Run the theme test and confirm it fails**

Run:

```bash
npx jest --runTestsByPath src/app/__tests__/deepForestTheme.test.js --runInBand
```

Expected: the new selector contracts are missing.

- [ ] **Step 3: Add the route-scoped CSS**

In the existing unlayered home-gold interaction block before `@layer components`, change the generic anchor selector to `.home-gold-theme a:not(.weelp-destination-card):hover`. Add the following rules to that same unlayered root block so they outrank Tailwind hover utilities and dark-mode shadow normalization:

```css
.home-gold-theme .weelp-destination-card:hover {
  border-color: rgb(255 255 255 / 0.8);
  box-shadow:
    0 12px 30px rgb(var(--weelp-gold-edge-rgb) / 0.2),
    0 2px 10px rgb(var(--weelp-gold-edge-rgb) / 0.12);
}

.dark .home-gold-theme .weelp-destination-card:hover {
  border-color: rgb(255 255 255 / 0.1);
}

.home-gold-theme .weelp-home-hero-eyebrow {
  border-color: transparent;
}
```

Keep the existing scale animation and neutral canonical hover shadow. Do not add a permanent gold border or modify `/`.

- [ ] **Step 4: Re-run focused tests**

Run:

```bash
npx jest --runTestsByPath src/app/components/__tests__/CityCard.test.jsx src/app/components/Pages/FRONT_END/home/__tests__/HeroSection.test.jsx src/app/__tests__/deepForestTheme.test.js --runInBand
```

Expected: all suites pass.

### Task 3: Review and verify

**Files:**

- Review all files changed in Tasks 1 and 2

- [ ] **Step 1: Run the mandatory checks**

Run `npm run type-check`, `npm run lint`, the focused Jest command, `npm run build`, and `git diff --check`.

- [ ] **Step 2: Inspect in the visible browser**

At `http://localhost:3000/home-gold`, inspect a Top Destinations card before and during hover in dark and light mode. Confirm its border remains neutral, its hover shadow is soft gold, and “Plan calmer escapes” has no gold border. Check `/` to confirm unchanged behaviour and check 390px width for overflow.

- [ ] **Step 3: Complete review and simplify gates**

Run the required independent code review. Apply critical findings and re-review. If the named `simplify` skill is still unavailable, perform a manual clarity/reuse/efficiency pass and record the limitation.

- [ ] **Step 4: Commit and push**

Commit the implementation to `main` and push `origin/main` after verification.
