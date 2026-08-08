# Sidebar Support Bottom Placement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the Questions card at the bottom of the full-height desktop booking column so it enters view near the end of the main content, while the booking card remains independently sticky above it.

**Architecture:** Turn the existing `ProductSidebar` layout into a vertical flex container. Place the sticky booking card inside a flexible upper region whose boundary ends before Questions, then render Questions as the final normal-flow child. This lets CSS sticky containment prevent overlap without scroll listeners, fixed positioning, absolute positioning, or duplicated responsive markup.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS, Radix-based UI primitives, Jest, React Testing Library, agent-browser.

---

## File structure

- Modify `src/app/components/Pages/FRONT_END/singleproduct/ProductSidebar.jsx` to separate the sticky booking card and bottom Questions card into distinct layout regions.
- Modify `src/app/components/Pages/FRONT_END/singleproduct/__tests__/SidebarLayering.test.jsx` to lock the new containment and bottom-flow contract.

No new component, hook, stylesheet, or runtime state is needed.

### Task 1: Separate the sticky and support regions

**Files:**
- Modify: `src/app/components/Pages/FRONT_END/singleproduct/__tests__/SidebarLayering.test.jsx:94-104`
- Modify: `src/app/components/Pages/FRONT_END/singleproduct/ProductSidebar.jsx:226-522`

- [ ] **Step 1: Load the required implementation guidance before editing JSX**

Invoke and follow these skills in order before changing the component or test:

1. `next-best-practices`
2. `vercel-react-best-practices`
3. `vercel-composition-patterns`
4. `test-driven-development`

Keep the solution CSS-only and compositional. Do not add client state, effects,
scroll listeners, duplicated markup, or a new component API.

- [ ] **Step 2: Replace the old sticky-group assertion with the failing bottom-placement contract**

Replace the test named `keeps the Questions card directly below the booking card in the sticky group` with:

```jsx
it('keeps Questions at the bottom outside the dedicated sticky region', () => {
  render(<ProductSidebar productId={3} productType="activity" productData={{ id: 3, pricing: { regular_price: 244, currency: 'USD' }, addons: [] }} />);

  const layout = screen.getByTestId('product-sidebar-layout');
  const stickyRegion = screen.getByTestId('booking-sticky-region');
  const stickyCard = screen.getByTestId('booking-sticky-card');
  const questions = screen.getByRole('heading', { name: 'Questions?' }).closest('[data-testid="booking-support"]');

  expect(layout).toHaveClass('flex', 'h-full', 'flex-col', 'px-6', 'xl:px-10');
  expect(stickyRegion).toHaveClass('flex-1');
  expect(stickyRegion).toContainElement(stickyCard);
  expect(stickyRegion).not.toContainElement(questions);
  expect(stickyCard).not.toContainElement(questions);
  expect(layout.lastElementChild).toBe(questions);
});
```

- [ ] **Step 3: Run the focused test and verify the expected failure**

Run:

```bash
npx jest src/app/components/Pages/FRONT_END/singleproduct/__tests__/SidebarLayering.test.jsx --runInBand
```

Expected: FAIL because `booking-sticky-region` does not exist and Questions is still a descendant of `booking-sticky-card`.

- [ ] **Step 4: Add the dedicated sticky region and move Questions into bottom document flow**

Change the beginning of the sidebar layout to:

```jsx
<div data-testid="product-sidebar-layout" className="relative z-[1] flex h-full flex-col px-6 py-8 xl:px-10 xl:pb-12 xl:pt-10">
  <div data-testid="booking-sticky-region" className="flex-1">
    <div data-testid="booking-sticky-card" className="weelp-booking-sticky relative z-[2]">
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
```

Immediately after the existing booking-card surface closes, close both the sticky element and its flexible region before rendering Questions:

```jsx
      </div>
    </div>
  </div>

  {/* Questions Card */}
  <div data-testid="booking-support" className="relative z-[1] mt-6 border border-border rounded-xl p-7 bg-background">
```

Keep the complete existing Questions markup unchanged. Remove the former closing tag that placed Questions inside `booking-sticky-card`, leaving only the closing tag for `product-sidebar-layout` after Questions.

This must not change `.weelp-booking-sticky`, its `top: 142px` desktop offset, the Questions card styling, the decorative image layer, mobile ordering, form state, or help-panel behavior.

- [ ] **Step 5: Apply the required post-change error-handling review**

Invoke `error-handling-patterns` immediately after the JSX change. Confirm that
the structural CSS change introduces no new async operation, failure path,
exception boundary, or error state requiring handling. Do not add speculative
error logic to a layout-only change.

- [ ] **Step 6: Run the focused test and verify the new contract passes**

Run:

```bash
npx jest src/app/components/Pages/FRONT_END/singleproduct/__tests__/SidebarLayering.test.jsx --runInBand
```

Expected: PASS with all `SidebarLayering` tests green.

- [ ] **Step 7: Run the related single-product regression suite**

Run:

```bash
npx jest \
  src/app/components/Pages/FRONT_END/singleproduct/__tests__/BookingAction.test.jsx \
  src/app/components/Pages/FRONT_END/singleproduct/__tests__/SidebarLayering.test.jsx \
  src/app/components/Pages/FRONT_END/singleproduct/__tests__/ProductSidebarMobileAction.test.jsx \
  src/app/components/Pages/FRONT_END/singleproduct/__tests__/ProductSidebarCartEdit.test.jsx \
  src/app/components/Pages/FRONT_END/singleproduct/__tests__/ProductSidebarHelp.test.jsx \
  src/app/components/Pages/FRONT_END/singleproduct/__tests__/SingleProductTabSectionInclusions.test.jsx \
  src/app/components/Form/__tests__/SingleProductFormResponsive.test.jsx \
  src/app/__tests__/deepForestTheme.test.js \
  --runInBand
```

Expected: all eight suites pass with no failed tests.

- [ ] **Step 8: Run static and production verification**

Run:

```bash
npm run type-check
npm run lint
git diff --check
npm run build
```

Expected: TypeScript exits 0, ESLint and the dark-mode guard report no errors, the diff check is empty, and the Next.js production build exits 0.

- [ ] **Step 9: Verify scrolling and responsive flow in the visible local browser**

Open the local activity route in the mandatory headed browser:

```bash
agent-browser --session weelp-visible --headed --args '--no-sandbox' open http://localhost:3000/cities/dubai/activities/dubai-desert-safari-with-bbq
```

Use these representative local routes:

- activity: `http://localhost:3000/cities/dubai/activities/dubai-desert-safari-with-bbq`
- itinerary: `http://localhost:3000/cities/dubai/itineraries/creator-dubai-weekend`
- package: `http://localhost:3000/cities/dubai/packages/holidays-in-kerala`

Check every route at 320 x 900, 390 x 900, 768 x 900, 1280 x 900, and
1440 x 900. Different product types have different booking-card heights, so
none may be inferred from another.

At 1280 x 900 and 1440 x 900, visually verify:

- while the booking card is stuck at 142px, Questions is outside the viewport;
- Questions enters the viewport only near the bottom of the two-column content;
- the sticky card releases above Questions with a visible gap and no overlap;
- Questions remains above the decorative background and does not pass behind the booking card;
- the booking action and Help Center remain interactive in light and dark themes.

At the beginning, middle, and end of the two-column scroll range, collect DOM
geometry for `booking-sticky-card`, `booking-support`, and
`single-product-booking-column`. Confirm objectively that:

```text
Questions start: questions.top >= window.innerHeight
No overlap: stickyCard.bottom <= questions.top
End visibility: questions.top < window.innerHeight && questions.bottom > 0
Bottom placement: abs(bookingColumn.bottom - questions.bottom) <= 50px
```

The 50px tolerance accounts for the existing 48px desktop bottom padding. Log
the measured values for both desktop widths and all three product types.

At 320 x 900, 390 x 900, and 768 x 900, confirm the normal narrow-screen order
remains booking card followed by Questions with no large artificial gap. At
1440 x 700, confirm the existing `<760px` height gate disables sticky behavior,
both cards remain in normal flow, and no overlap occurs.

- [ ] **Step 10: Run the mandatory independent code-review loop**

Dispatch the `code-reviewer` agent to review the two-file implementation against
the approved design, test evidence, responsive matrix, security, performance,
and project conventions. If it reports any critical or major finding, make the
smallest corrective change, rerun the affected tests and browser checks, and
dispatch a fresh re-review. Repeat until the verdict is Approve.

- [ ] **Step 11: Run the mandatory simplify pass**

Invoke the available simplify workflow (`impeccable distill` when no standalone
`simplify` skill is installed). Remove only unnecessary complexity introduced
by this change. Do not extract a component or add a shared abstraction for this
single layout boundary. If the simplify pass changes code, rerun Steps 6–9 and
the code-review loop.

- [ ] **Step 12: Run fresh verification on the final stable diff**

Invoke `verification-before-completion`, then rerun the complete commands from
Steps 7 and 8. Recheck the final headed-browser geometry at 1280 x 900,
1440 x 900, and 1440 x 700. Confirm `git diff --check` is empty and inspect
`git status --short` so only the two planned implementation files are staged.

- [ ] **Step 13: Commit and push the verified implementation**

After code review reports no blocking findings and the simplify pass introduces no regressions, run:

```bash
git add src/app/components/Pages/FRONT_END/singleproduct/ProductSidebar.jsx src/app/components/Pages/FRONT_END/singleproduct/__tests__/SidebarLayering.test.jsx
git commit -m "fix: place sidebar support at bottom"
git push origin main
```

Expected: the commit and pre-push build succeed, `origin/main` resolves to the new commit, and unrelated working-tree changes remain unstaged and untouched.
