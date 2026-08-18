# Home Gold Stable Hover Borders Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop every hover interaction on dark `/home-gold` from changing border colour while preserving shadows, image motion, focus rings, and selected/open state edges.

**Architecture:** Remove the broad route-scoped hover-border override and remove the destination card's hover border declaration. Two shared homepage controls already carry Tailwind `hover:border-*` utilities, so add one dark `/home-gold` stabilizer for controls whose resting edge is `border-border`; it restores `hsl(var(--border))` on hover without touching their text, background, shadow, focus ring, or selected/open state rules. Keep the destination shadow and enforce both the removed rules and the stabilizer through the parsed CSS contract test.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS, PostCSS, Jest, agent-browser

---

### Task 1: Write the failing stable-border contract

**Files:**

- Test: `src/app/__tests__/deepForestTheme.test.js:443-529`

- [ ] **Step 1: Rename the interaction contract and require the broad hover-border rule to be absent**

Rename the test to:

```js
it('strengthens gold borders only for dark focus and selected states while keeping hover borders stable', () => {
```

Then replace the current positive broad-hover contract with:

Replace the current positive contract with:

```js
expect(() => findExactRule(darkHoverSelectors)).toThrow();
```

- [ ] **Step 2: Require a scoped stabilizer for existing Tailwind hover-border utilities**

The homepage inventory has exactly two shared control sources that combine `border-border` with `hover:border-weelp-sage-deep`: `src/app/components/ui/sliderNavigationClasses.js:2` for carousel navigation and `src/app/components/Home/BuddyChat.jsx:128` for Travel Buddy prompts. Require the route-scoped mechanism that restores their semantic resting border:

```js
const darkStableHoverSelector = ".dark .home-gold-theme :where([class~='border-border'][class*='hover:border-']):hover";
expect(extractDeclarationContract(darkStableHoverSelector)).toMatchObject({
  'border-color': {
    important: false,
    value: 'hsl(var(--border))',
  },
});
expect(() => findExactRule(darkStableHoverSelector.replace('.dark ', ''))).toThrow();
```

`:where(...)` keeps the stabilizer at lower specificity than the selected/pressed/open selectors while still outranking Tailwind's component hover utility. The later `.82` state edge therefore wins when those states are hovered. Focus-visible keeps its independent `.82` ring token.

- [ ] **Step 3: Require the destination hover rule to contain only its shadow**

```js
const destinationHoverContract = extractDeclarationContract(darkDestinationHoverSelector);
expect(destinationHoverContract['border-color']).toBeUndefined();
expect(destinationHoverContract).toMatchObject({
  'box-shadow': {
    important: false,
    value: 'var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow), 0 8px 16px -7px rgb(var(--weelp-gold-edge-rgb) / 0.22), 0 3px 6px -2px rgb(var(--weelp-gold-edge-rgb) / 0.12)',
  },
});
```

Also change the base destination transition expectation from `border-color, box-shadow` to `box-shadow`.

- [ ] **Step 4: Run the focused test and verify RED**

```bash
npx jest src/app/__tests__/deepForestTheme.test.js --runInBand
```

Expected: the theme suite stops at the first changed contract because the broad hover-border rule still exists. As the production rules are corrected, the same test also guards the stabilizer and destination-shadow-only contract before reaching GREEN.

### Task 2: Remove only hover-driven border colour changes

**Files:**

- Modify: `src/app/globals.css:296-316`
- Test: `src/app/__tests__/deepForestTheme.test.js`

- [ ] **Step 1: Delete the broad hover-border rule**

Remove this complete selector block:

```css
.dark .home-gold-theme a:not(.weelp-destination-card):hover,
.dark .home-gold-theme button:not(:disabled):not([aria-disabled='true']):not([aria-invalid='true']):hover,
.dark .home-gold-theme [role='button']:not([aria-disabled='true']):not([aria-invalid='true']):hover {
  --border: 42 43% 56% / 0.72;
  border-color: rgb(var(--weelp-gold-edge-rgb) / 0.72);
}
```

- [ ] **Step 2: Stabilize the two shared `border-border` controls**

Add this rule where the removed broad hover rule was, before the selected/pressed/open state rule:

```css
.dark .home-gold-theme :where([class~='border-border'][class*='hover:border-']):hover {
  border-color: hsl(var(--border));
}
```

This neutralizes only the component-level hover border utility on carousel navigation and Buddy prompt controls. It remains dark-route-scoped, so light `/home-gold` and canonical `/` keep their existing hover styling. Do not change those shared component files.

- [ ] **Step 3: Keep destination shadow but remove its border hover declaration**

```css
.dark .home-gold-theme .weelp-destination-card {
  --tw-ring-color: var(--weelp-card-border);
  --tw-shadow: 0 0 #0000;
  border-color: var(--weelp-card-border);
  transition-property: box-shadow;
  transition-duration: 420ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.dark .home-gold-theme .weelp-destination-card:hover {
  box-shadow:
    var(--tw-ring-offset-shadow),
    var(--tw-ring-shadow),
    var(--tw-shadow),
    0 8px 16px -7px rgb(var(--weelp-gold-edge-rgb) / 0.22),
    0 3px 6px -2px rgb(var(--weelp-gold-edge-rgb) / 0.12);
}
```

Do not change focus-visible, selected, pressed, or open-state rules. Keep the selected/pressed/open block after the stabilizer so it continues to win in combined hover states.

- [ ] **Step 4: Run GREEN and related tests**

```bash
npx jest src/app/__tests__/deepForestTheme.test.js --runInBand
npx jest src/app/__tests__/deepForestTheme.test.js src/app/components/__tests__/CityCard.test.jsx src/app/components/Pages/FRONT_END/home/__tests__/BrowseDestinationsSection.test.jsx --runInBand
```

Expected: theme suite 70/70 and related suites 73/73 pass.

### Task 3: Verify behaviour and integrate

**Files:**

- Verify: `src/app/globals.css`
- Verify: `src/app/__tests__/deepForestTheme.test.js`
- Add: `docs/superpowers/plans/2026-08-17-home-gold-stable-hover-borders.md`

- [ ] **Step 1: Review error-handling impact, then run static checks**

Invoke `error-handling-patterns` and confirm this CSS-only change adds no error or control-flow path. Then run:

```bash
npm run type-check
npm run lint
git diff --check
```

- [ ] **Step 2: Verify in the visible headed browser**

Open `http://localhost:3000/home-gold` in the named headed session. At both `1440x900` and `390x844`, compare computed border colour before and during hover for a generic bordered link, carousel navigation control, Travel Buddy prompt, filter/search control, Top Activity card, and Top Destination card. Every pair must be identical. Confirm the destination shadow and image motion still work and no overflow occurs.

Also verify combined interaction states: focus a hover-stabilized control while it remains hovered and confirm the focus ring stays visible; hover a selected/pressed/open control and confirm its stronger `.82` edge remains visible rather than reverting to the resting edge.

At both viewports, switch `/home-gold` to light mode and compare representative controls with canonical `/`; their existing hover behavior must match. Also inspect canonical `/` in dark mode and confirm the gold route rules do not apply.

- [ ] **Step 3: Request final code review and simplify**

Review spec compliance first, then CSS cascade, hover coverage, combined accessibility states, route isolation, tests, security, and performance. Resolve critical/major findings and re-review. Keep the implementation to the rule removal, the one semantic stabilizer, and exact contracts.

- [ ] **Step 4: Run fresh verification**

```bash
npx jest src/app/__tests__/deepForestTheme.test.js src/app/components/__tests__/CityCard.test.jsx src/app/components/Pages/FRONT_END/home/__tests__/BrowseDestinationsSection.test.jsx --runInBand
npm run type-check
npm run lint
npm run build
git diff --check
```

- [ ] **Step 5: Commit and push `main`**

```bash
git add src/app/globals.css src/app/__tests__/deepForestTheme.test.js docs/superpowers/plans/2026-08-17-home-gold-stable-hover-borders.md
git commit -m "keep gold borders stable on hover"
git push origin main
```

Confirm `HEAD` equals `origin/main`, the worktree is clean, and the visible browser remains on dark `/home-gold`.
