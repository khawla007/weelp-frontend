# Dark-Mode Button Hover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every enabled button and every button-shaped anchor the Dubai Tours sage-shadow hover treatment in dark mode without changing light mode or plain text links.

**Architecture:** Extend the existing global dark-control contract in `src/app/globals.css` with one shared selector list for the resting transition and a matching hover selector list for the shadow. Native buttons are selected by element semantics. Button-shaped anchors opt in with `data-weelp-button-link`: non-link `Button asChild` usage receives it automatically, while direct controls carry it at audited callsites. Existing `role="button"` and filled-surface selectors remain compatibility paths. Preserve Tailwind focus rings by layering the new shadow behind the ring variables, and use exact PostCSS, DOM-selection, shared-component, and callsite-count tests to keep disabled controls, cards, plain links, and ordinary navigation outside the contract.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS, PostCSS, Jest 30, agent-browser

Run every command from `/run/media/ashish-khawla/Website data/Fanatic Developement/weelp/frontend`.

---

### Task 1: Lock the selector contract with a failing test

**Files:**

- Modify: `src/app/__tests__/deepForestTheme.test.js:563-610`
- Test: `src/components/ui/__tests__/button.test.jsx`
- Test: `src/app/components/ui/__tests__/ProductSliderSection.test.jsx`
- Reference: `docs/superpowers/specs/2026-08-03-dark-mode-button-hover-design.md`

- [ ] **Step 1: Add exact selector constants near the dark button tests**

```js
const darkInteractiveControlSelectors = [
  ".dark button:not(:disabled):not([aria-disabled='true'])",
  ".dark a[role='button']:not([aria-disabled='true'])",
  ".dark a[data-weelp-button-link]:not([aria-disabled='true'])",
  ".dark a[class~='bg-weelp-sage-deep']:not([aria-disabled='true'])",
  ".dark a[class~='bg-primary']:not([aria-disabled='true'])",
];

const darkInteractiveControlHoverSelectors = darkInteractiveControlSelectors.map((selector) => `${selector}:hover`);
```

This list is intentionally exhaustive for the approved semantics. Future button-shaped anchors must opt in through the marker or the shared non-link `Button asChild` path. `role="button"` and the two filled button surface tokens remain compatibility selectors. Border and layout classes are deliberately ignored because they also appear on cards and ordinary navigation links.

- [ ] **Step 2: Add the failing interaction contract test**

```js
it('gives enabled dark buttons and button-shaped anchors the Dubai Tours hover shadow', () => {
  const restingRule = extractSelectorContract(darkInteractiveControlSelectors);
  const hoverRule = extractSelectorContract(darkInteractiveControlHoverSelectors);
  const { rule: reducedMotionRule } = findExactRule(['*', '*::before', '*::after']);
  const reducedTransitionDuration = reducedMotionRule.nodes.find((node) => node.type === 'decl' && node.prop === 'transition-duration');

  expect(restingRule.declarations).toMatchObject({
    'transition-property': {
      important: true,
      value: 'color, background-color, border-color, box-shadow, opacity, transform',
    },
    'transition-duration': { important: true, value: '200ms' },
    'transition-timing-function': {
      important: true,
      value: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  });
  expect(hoverRule.declarations).toMatchObject({
    'box-shadow': {
      important: true,
      value: 'var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 4px 4px 15px rgba(88, 143, 122, 0.3)',
    },
  });
  expect(reducedMotionRule.parent).toMatchObject({
    type: 'atrule',
    name: 'media',
    params: '(prefers-reduced-motion: reduce)',
  });
  expect(reducedTransitionDuration).toMatchObject({
    important: true,
    value: '0.01ms',
  });

  for (const selector of [...darkInteractiveControlSelectors, ...darkInteractiveControlHoverSelectors]) {
    expect(selector).toContain('.dark ');
    expect(selector).toContain("[aria-disabled='true']");
  }
  expect(darkInteractiveControlSelectors[0]).toContain(':not(:disabled)');
  expect(darkInteractiveControlSelectors).not.toContain('.dark a');
  expect(extractRulesContainingSelector(stylesheet, '.dark a:hover')).toHaveLength(0);
});
```

Add a representative DOM fixture beneath a `.dark` root and query it with `darkInteractiveControlSelectors.join(',')`. It must prove that an enabled native button, a marker anchor, and a filled anchor match, while a bordered card anchor, bordered navigation anchor, plain text anchor, `aria-disabled` marker anchor, and disabled native button do not.

Add an audited direct-marker table that asserts exact `data-weelp-button-link` counts in the CMS CTA, cities pagination, city-item pagination, city controls, wishlist, checkout state, product slider CTA, reset-password actions, and mobile-menu action files. Exact counts make both missing markers and accidental card/navigation markers reviewable.

- [ ] **Step 3: Confirm the test fails before implementation**

Run `npx jest src/app/__tests__/deepForestTheme.test.js --runInBand`.

Expected: FAIL because the exact resting and hover rules do not exist. The reduced-motion assertions should already pass against the existing global accessibility rule and prove that it is nested under the correct media query.

### Task 2: Implement the dark-only global hover treatment

**Files:**

- Modify: `src/app/globals.css:309-333`
- Modify: `src/components/ui/button.jsx`
- Modify: audited direct button-shaped anchor callsites
- Test: `src/app/__tests__/deepForestTheme.test.js`
- Test: `src/components/ui/__tests__/button.test.jsx`
- Test: `src/app/components/ui/__tests__/ProductSliderSection.test.jsx`

- [ ] **Step 1: Add the resting transition contract after the existing dark button surface rule**

```css
.dark button:not(:disabled):not([aria-disabled='true']),
.dark a[role='button']:not([aria-disabled='true']),
.dark a[data-weelp-button-link]:not([aria-disabled='true']),
.dark a[class~='bg-weelp-sage-deep']:not([aria-disabled='true']),
.dark a[class~='bg-primary']:not([aria-disabled='true']) {
  transition-duration: 200ms !important;
  transition-property: color, background-color, border-color, box-shadow, opacity, transform !important;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
}
```

- [ ] **Step 2: Add the matching hover shadow while preserving focus rings**

```css
.dark button:not(:disabled):not([aria-disabled='true']):hover,
.dark a[role='button']:not([aria-disabled='true']):hover,
.dark a[data-weelp-button-link]:not([aria-disabled='true']):hover,
.dark a[class~='bg-weelp-sage-deep']:not([aria-disabled='true']):hover,
.dark a[class~='bg-primary']:not([aria-disabled='true']):hover {
  box-shadow:
    var(--tw-ring-offset-shadow, 0 0 #0000),
    var(--tw-ring-shadow, 0 0 #0000),
    4px 4px 15px rgba(88, 143, 122, 0.3) !important;
}
```

The Tailwind ring layers remain intact when a keyboard-focused control is also hovered.

- [ ] **Step 3: Add the shared `Button asChild` semantic marker**

Update `src/components/ui/button.jsx` so non-`link` variants using `asChild` forward `data-weelp-button-link` through the Radix slot. Native buttons and `variant="link"` remain unmarked, and passed props, ref, and composed classes remain intact.

Add `src/components/ui/__tests__/button.test.jsx` first: the default `Button asChild` anchor must have the marker, while `Button asChild variant="link"` must not. Confirm RED before changing the component, then GREEN afterward.

- [ ] **Step 4: Mark audited direct button-shaped anchors**

Add `data-weelp-button-link` only to direct anchors rendered as controls: CMS hero CTAs, cities and city-item pagination, Cities `Clear all`, wishlist `View`, checkout result actions, ProductSliderSection's supported CTA, reset-password actions, and the Account/Search trips/compact Sign in mobile actions. Do not mark cards, breadcrumbs, simple inline links, `HEADER_NAV_ITEMS`, city navigation rows, or other ordinary navigation entries.

Add focused component coverage for ProductSliderSection's `headerAction="cta"` path before marking its Link, then register it in the audited direct-marker counts.

- [ ] **Step 5: Confirm the focused tests pass**

Run the focused ProductSliderSection test, `src/components/ui/__tests__/button.test.jsx`, and the dark hover/surface/audit tests in `src/app/__tests__/deepForestTheme.test.js`.

Expected: PASS, including the dark-only selector contract, disabled-state and card/navigation exclusions, semantic marker propagation, audited callsite counts, focus-ring layering, and existing global reduced-motion assertions. Do not add a competing components-layer reduced-motion override; the base-layer important rule intentionally wins the important cascade and reduces the 200ms transition to `0.01ms`.

### Task 3: Run required static verification

**Files:**

- Verify: `src/app/globals.css`
- Verify: `src/app/__tests__/deepForestTheme.test.js`
- Verify: `src/components/ui/button.jsx`
- Verify: `src/components/ui/__tests__/button.test.jsx`
- Verify: audited direct anchor callsites and focused component tests

- [ ] **Step 1: Invoke `error-handling-patterns`**

Confirm no runtime error handling is needed because this is declarative CSS with a static PostCSS contract test.

- [ ] **Step 2: Run type-check**

Run `npm run type-check`.

Expected: exit code 0 with no TypeScript errors.

- [ ] **Step 3: Run lint and the dark-mode guard**

Run `npm run lint`.

Expected: exit code 0, no ESLint warnings, and `Dark-mode guard: no new hardcoded color findings.` If the requested existing shadow value is flagged, use the guard's documented allowlist instead of weakening the CSS selector.

- [ ] **Step 4: Re-run the focused Jest suite**

Run `npx jest src/app/__tests__/deepForestTheme.test.js --runInBand`.

Expected: PASS.

- [ ] **Step 5: Check formatting and scope**

Run `git diff --check` and `git status --short`.

Expected: no whitespace errors. Preserve and report any unrelated pre-existing user changes; do not stage or rewrite them. The task-owned changes should be limited to the CSS contract, shared Button marker behavior, audited direct anchor callsites, focused tests, and these approved design/plan documents.

### Task 4: Verify the interaction in the required visible browser

**Files:**

- Verify URL: `http://localhost:3000/cities/dubai`
- Verify URL: `http://localhost:3000/user/reset-password`

- [ ] **Step 1: Open the page visibly**

Run `agent-browser --session weelp-visible --headed open http://localhost:3000/cities/dubai`. If Chrome requires the container workaround, restart the named session and reopen with `--args "--no-sandbox"`. The window must remain visible.

- [ ] **Step 2: Hover representative controls**

Use the snapshot-and-ref workflow on the Dubai page to test the enabled `All`, `Sort`, and `View on Map` buttons, a header icon button, an enabled pagination or carousel button, the disabled `Previous page` button, a semantic `data-weelp-button-link` CTA, a bordered product/card anchor without the marker, an ordinary mobile navigation entry without the marker, and the plain `Home` breadcrumb anchor.

Expected: enabled buttons and the semantic marker CTA gain the sage shadow; the disabled button, unmarked card/navigation anchors, and Home breadcrumb do not.

- [ ] **Step 3: Verify deterministic boxed anchors on a second page**

Open `http://localhost:3000/user/reset-password` in the same visible session without a token. Hover the `Request a new reset link` filled anchor and the `Back to login` bordered anchor.

Expected: both anchors expose `data-weelp-button-link` and gain the sage shadow. Any simple inline login or help link remains shadow-free.

- [ ] **Step 4: Verify focus visibility and measure computed styles after 200ms**

Keyboard-focus an enabled button using `Tab` (or `focus` only when the browser preserves `:focus-visible`), then hover it. Inspect both `outline` and `boxShadow`.

Expected: the sage focus outline/ring remains visible while the enabled hover `boxShadow` includes `rgba(88, 143, 122, 0.3) 4px 4px 15px 0px`. Disabled and plain-link values do not gain the shadow. Keep dark mode active throughout.

### Task 5: Complete review, simplify, and integration gates

**Files:**

- Review: `src/app/globals.css`
- Review: `src/app/__tests__/deepForestTheme.test.js`
- Review: `src/components/ui/button.jsx`
- Review: `src/components/ui/__tests__/button.test.jsx`
- Review: audited direct anchor callsites and focused tests
- Review: `docs/superpowers/specs/2026-08-03-dark-mode-button-hover-design.md`
- Review: `docs/superpowers/plans/2026-08-03-dark-mode-button-hover.md`

- [ ] **Step 1: Dispatch the required `code-reviewer` agent**

Review against the approved spec, selector scope, disabled behavior, focus rings, reduced motion, and test quality. Fix critical or major findings, repeat Tasks 3-4, and request re-review.

- [ ] **Step 2: Invoke the required `simplify` skill**

Refine duplication or unclear naming without expanding scope. Re-run Tasks 3-4 after material changes. If the named skill remains unavailable, record that and perform the same clarity/reuse/efficiency pass manually.

- [ ] **Step 3: Run final verification**

Run `npm run type-check`, `npm run lint`, `npx jest src/app/__tests__/deepForestTheme.test.js --runInBand`, and `git diff --check`.

Expected: every command exits 0 and the visible-browser findings remain valid.

- [ ] **Step 4: Commit on `main` after all gates pass**

```bash
git add src/app/globals.css src/app/__tests__/deepForestTheme.test.js src/components/ui/button.jsx src/components/ui/__tests__/button.test.jsx src/app/components/ui/ProductSliderSection.jsx src/app/components/ui/__tests__/ProductSliderSection.test.jsx src/app/\(frontend\)/cms-page-template.js src/app/\(frontend\)/cities/page.js src/app/components/Pages/FRONT_END/city/CityItemsListing.jsx src/app/components/Pages/FRONT_END/cities/CitiesListingControls.jsx src/app/\(dashboard\)/dashboard/customer/wishlist/WishlistClient.jsx src/app/components/Pages/FRONT_END/checkout/CheckoutResultState.jsx src/app/components/Form/FormResetPassword.jsx src/app/components/Layout/MobileMenu.jsx docs/superpowers/specs/2026-08-03-dark-mode-button-hover-design.md docs/superpowers/plans/2026-08-03-dark-mode-button-hover.md
git commit -m "feat: add dark button hover shadow"
```

- [ ] **Step 5: Push and verify `main`**

Run `git push origin main` followed by `git status --short`.

Expected: the remote main branch includes both the spec and implementation commits, and the working tree is clean.
