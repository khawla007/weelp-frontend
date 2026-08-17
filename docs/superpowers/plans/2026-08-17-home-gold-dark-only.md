# Home Gold Dark-Only Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply every `/home-gold` gold border, ring, and shadow only while dark mode is active, leaving light mode identical to the canonical homepage.

**Architecture:** Keep the existing route hook on the body and page wrapper, but gate the gold token block and every unlayered interaction rule behind `.dark .home-gold-theme`. Light mode then falls through to the original root tokens and component utilities without compensating overrides.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS, PostCSS, Jest, agent-browser

---

### Task 1: Lock the dark-only CSS contract

**Files:**

- Modify: `src/app/__tests__/deepForestTheme.test.js`

- [ ] **Step 1: Change the existing gold-token assertion to require `.dark .home-gold-theme`**

Read the gold declarations from `extractDeclarations('.dark .home-gold-theme')`. Assert that `extractDeclarations('.home-gold-theme')` throws because no light-mode gold token block may remain.

- [ ] **Step 2: Prefix every gold interaction selector contract with `.dark`**

Require these selector families:

```js
'.dark .home-gold-theme a:focus-visible';
'.dark .home-gold-theme a:not(.weelp-destination-card):hover';
".dark .home-gold-theme [aria-selected='true']:not([aria-invalid='true'])";
".dark .home-gold-theme [aria-pressed='true']:not([aria-invalid='true'])";
".dark .home-gold-theme [data-state='open']:not([aria-invalid='true'])";
'.dark .home-gold-theme .weelp-destination-card:hover';
'.dark .home-gold-theme .weelp-home-hero-eyebrow'`.dark .home-gold-theme [class~='border-weelp-hero-foreground/10']`;
```

Keep the exact existing single-quote spelling for every attribute selector. Keep all grouped button/input/selected selectors, declarations, and root-layer assertions; only add the `.dark` gate. The destination hover contract retains the neutral dark border and gold shadow in one rule.

- [ ] **Step 3: Prove that no light-mode gold rule remains**

Keep arrays for the old unprefixed focus, generic hover, and selected/open selectors. Add `expect(() => findExactRule(oldSelectors)).toThrow()` for each grouped rule, plus the old destination hover, hero eyebrow, and fixed hero-border selectors. These negative assertions must accompany the bare-token-block absence assertion so dark and light copies cannot coexist.

- [ ] **Step 4: Run the theme test and confirm it fails against the current light-and-dark selectors**

Run:

```bash
npx jest --runTestsByPath src/app/__tests__/deepForestTheme.test.js --runInBand
```

Expected: failure because `.dark .home-gold-theme` token and interaction rules do not yet exist.

### Task 2: Gate all gold CSS behind dark mode

**Files:**

- Modify: `src/app/globals.css`

- [ ] **Step 1: Gate the token block**

Change `.home-gold-theme` inside `@layer base` to `.dark .home-gold-theme`. Do not add any light-mode reset declarations.

- [ ] **Step 2: Gate every unlayered gold interaction selector**

Prefix all focus, generic hover, selected/open, fixed hero-border, destination-hover, and hero-eyebrow selectors with `.dark`. Merge the existing dark destination-border rule into the destination-hover rule so there is one exact selector:

```css
.dark .home-gold-theme .weelp-destination-card:hover {
  border-color: rgb(255 255 255 / 0.1);
  box-shadow:
    0 12px 30px rgb(var(--weelp-gold-edge-rgb) / 0.2),
    0 2px 10px rgb(var(--weelp-gold-edge-rgb) / 0.12);
}
```

- [ ] **Step 3: Run the focused test**

Expected: all 70 theme tests pass.

### Task 3: Verify and publish

**Files:**

- Review: `src/app/globals.css`
- Review: `src/app/__tests__/deepForestTheme.test.js`

- [ ] **Step 1: Run required automated checks**

Run type-check, lint, the focused theme/home tests, production build, and `git diff --check`.

- [ ] **Step 2: Verify dark mode in the visible browser**

At `http://localhost:3000/home-gold`, confirm the hero eyebrow and standard controls use gold borders and a hovered Top Destinations card uses the gold shadow.

- [ ] **Step 3: Verify light-mode parity in the visible browser**

Compare computed border and shadow values for matching elements on `/home-gold` and `/` in light mode. Confirm the gold token is absent and values match. Check 390px width for overflow.

- [ ] **Step 4: Complete review and simplify gates**

Run the independent code review. Apply and re-review any critical findings. If `simplify` remains unavailable, perform a manual clarity/reuse/efficiency pass.

- [ ] **Step 5: Commit and push**

Commit the implementation to `main`, push `origin/main`, and confirm local `HEAD` matches `origin/main`.
