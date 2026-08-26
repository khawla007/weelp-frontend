# Destination Explore CTA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the destination card's standalone glass arrow with an Explore pill that matches the Top Activities card and rotates its arrow on whole-card hover.

**Architecture:** Keep the interaction local to the shared `CityCard`, which already propagates to every destination-card consumer. Reuse the Top Activities CTA dimensions and nested-pill structure with photography-safe overlay colors; keep the outer `NavigationLink` as the only interactive element.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS, Lucide React, Jest, Testing Library

---

## File map

- Modify `src/app/components/CityCard.jsx` to render the approved Explore pill and whole-card hover rotation.
- Modify `src/app/components/__tests__/CityCard.test.jsx` to lock the CTA structure, styles, motion behavior, and link semantics.

No route, carousel, data, or CSS files change. Every existing city-card location inherits the result from `CityCard`.

### Task 1: Lock the Explore CTA contract

**Files:**

- Test: `src/app/components/__tests__/CityCard.test.jsx`

- [ ] **Step 1: Replace the standalone-arrow assertions with the approved pill contract**

In `renders the accessible Weelp Postcard treatment`, retain the outer-link, heading, subtitle, image, and no-button assertions. Replace the current action assertions with:

```jsx
const action = screen.getByTestId('destination-card-action');
expect(action).toHaveAttribute('aria-hidden', 'true');
expect(action).toHaveTextContent('Explore');
expect(action).toHaveClass(
  'inline-flex',
  'h-10',
  'rounded-full',
  'border-white/55',
  'bg-white/15',
  'text-white',
  'backdrop-blur-md',
);

const arrow = screen.getByTestId('destination-card-arrow');
expect(arrow).toHaveClass(
  'size-8',
  'rounded-full',
  'text-amber-400',
  'group-hover:-rotate-45',
  'motion-reduce:group-hover:rotate-0',
);
expect(arrow.querySelector('.lucide-arrow-right')).toBeInTheDocument();
expect(action.querySelector('.lucide-arrow-up-right')).not.toBeInTheDocument();
expect(screen.queryByRole('button')).not.toBeInTheDocument();
```

- [ ] **Step 2: Run the component test and verify the new contract fails**

Run:

```bash
npx jest --runTestsByPath src/app/components/__tests__/CityCard.test.jsx --runInBand
```

Expected: FAIL because the current card has no Explore text or nested `ArrowRight` and still renders `ArrowUpRight`.

### Task 2: Implement the Top Activities-style CTA

**Files:**

- Modify: `src/app/components/CityCard.jsx`
- Test: `src/app/components/__tests__/CityCard.test.jsx`

- [ ] **Step 1: Change the Lucide icon import**

Replace:

```jsx
import { ArrowUpRight } from 'lucide-react';
```

with:

```jsx
import { ArrowRight } from 'lucide-react';
```

- [ ] **Step 2: Replace the standalone action class with overlay-pill classes**

Replace `DESTINATION_ACTION_CLASS` with:

```jsx
const DESTINATION_ACTION_CLASS =
  // dark-mode-exempt: translucent white Explore pill remains legible over the permanent image overlay
  'inline-flex h-10 shrink-0 items-center gap-3 rounded-full border border-white/55 bg-white/15 pl-4 pr-1 text-sm font-medium text-white shadow-sm backdrop-blur-md';

const DESTINATION_ARROW_CLASS =
  // dark-mode-exempt: the inset circle uses the same permanent photographic-overlay treatment as its parent pill
  'grid size-8 place-items-center rounded-full border border-white/55 bg-white/15 text-amber-400 transition-transform duration-300 group-hover:-rotate-45 motion-reduce:transition-none motion-reduce:group-hover:rotate-0';
```

These module-level constants remain static across renders and place the dark-mode lint exemption directly above each intentional translucent-white source line.

- [ ] **Step 3: Render the Explore label and nested arrow circle**

Replace the existing action span with:

```jsx
<span data-testid="destination-card-action" aria-hidden="true" className={DESTINATION_ACTION_CLASS}>
  Explore
  <span data-testid="destination-card-arrow" className={DESTINATION_ARROW_CLASS}>
    <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2.5} />
  </span>
</span>
```

Do not add a button, secondary link, state, or event handler. The outer `NavigationLink` remains responsible for hover, focus, and navigation.

- [ ] **Step 4: Run the focused component test**

Run:

```bash
npx jest --runTestsByPath src/app/components/__tests__/CityCard.test.jsx --runInBand
```

Expected: PASS with 4 tests.

- [ ] **Step 5: Apply the per-change quality gate**

Audit the change against `error-handling-patterns`: it introduces no asynchronous work, failure path, or recoverable runtime operation. Then run:

```bash
npm run type-check
npm run lint
```

Expected: both commands exit 0 and the dark-mode guard reports no new hardcoded-color findings.

- [ ] **Step 6: Verify the component in the visible headed browser**

Keep the named headed session on localhost and verify:

1. At 1500px, scroll Top Activities and Top Destinations into view and compare the Explore-pill structure.
2. Hover a destination card and confirm the nested arrow computes to approximately `rotate(-45deg)` while the image still scales to `1.05`.
3. Switch between light and dark themes and confirm the overlay CTA remains readable.
4. Check 800px and 390px widths for clipping or overlap with long city names.
5. Confirm the browser console has no new errors.

### Task 3: Review, simplify, verify, and deliver

**Files:**

- Review all current implementation and test diffs.

- [ ] **Step 1: Run the mandatory independent implementation review**

Dispatch the project code-reviewer agent against the approved specification and current diff. Address every critical or major finding and request re-review until the verdict is Approve.

- [ ] **Step 2: Run the simplification gate**

Invoke the repository's `simplify` skill if available. If it remains unavailable, perform the already accepted manual clarity/reuse/efficiency pass, limiting changes to the two CTA constants and markup. Re-run the component test after any edit.

- [ ] **Step 3: Run fresh final verification**

Run:

```bash
npx jest --runTestsByPath \
  src/app/components/__tests__/CityCard.test.jsx \
  src/app/components/Pages/FRONT_END/home/__tests__/BrowseDestinationsSection.test.jsx \
  src/app/__tests__/deepForestTheme.test.js \
  'src/app/(frontend)/__tests__/page.test.jsx' \
  'src/app/(frontend)/home-gold/__tests__/page.test.jsx' \
  --runInBand
npm run type-check
npm run lint
npm run build
git diff --check
```

Expected: 5 Jest suites pass, type-check and lint exit 0, the dark-mode guard is clean, the Next.js production build succeeds, and `git diff --check` emits no output.

- [ ] **Step 4: Commit only the reviewed implementation files**

```bash
git add src/app/components/CityCard.jsx src/app/components/__tests__/CityCard.test.jsx
git commit -m "Match destination CTA to activity cards"
```

Inspect `git status --short` immediately after the hook. Reverse only verified hook-generated formatter side effects; preserve any unrelated user changes.

- [ ] **Step 5: Push the required main branch**

Confirm the current branch is `main`, then run:

```bash
git push origin main
```

Expected: the push hook build passes and `origin/main` advances to the implementation commit. Finish by confirming `git status --short` is clean.
