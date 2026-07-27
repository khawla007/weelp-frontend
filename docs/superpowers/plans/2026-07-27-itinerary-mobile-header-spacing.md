# Itinerary Mobile Header Spacing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce the itinerary detail page’s mobile gap between the product tab bar and itinerary heading/action row from 70px to 32px without changing other product types or larger breakpoints.

**Architecture:** Keep responsive spacing owned by the existing `tab_1` wrapper in `SingleProductTabSection`. Select the wrapper classes from `productType`, using Tailwind’s `pt-8` on mobile and restoring the current `md:pt-[70px]` value for itinerary pages at tablet/desktop widths.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS, Jest, Testing Library

---

### Task 1: Add responsive itinerary first-section spacing

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/singleproduct/SingleProductTabSection.jsx:238-248`
- Test: `src/app/components/Pages/FRONT_END/singleproduct/__tests__/SingleProductTabSectionInclusions.test.jsx`

- [ ] **Step 0: Capture and protect the existing dirty state**

Run:

```bash
git status --short
git diff -- src/app/components/Pages/FRONT_END/singleproduct/SingleProductTabSection.jsx \
  src/app/components/Pages/FRONT_END/singleproduct/__tests__/SingleProductTabSectionInclusions.test.jsx
```

Expected: both files already contain the uncommitted FAQ visibility work. Preserve those hunks exactly and add only the spacing test and responsive spacing class described below.

- [ ] **Step 1: Write the failing responsive-spacing test**

Add this test inside the existing `SingleProductTabSection activity inclusions` describe block:

```jsx
it('uses compact mobile spacing before itinerary details without changing larger breakpoints', () => {
  const { unmount } = render(
    <SingleProductTabSection
      productType="itinerary"
      productId={2}
      productData={{
        schedules: [{ day: 1, title: 'Day 1', activities: [], transfers: [] }],
        inclusions_exclusions: [],
        review_summary: { total_reviews: 0 },
        faqs: [],
      }}
    />,
  );

  const itinerarySection = document.getElementById('tab_1');
  expect(itinerarySection).toHaveClass('pt-8', 'md:pt-[70px]');
  expect(itinerarySection).not.toHaveClass('pt-[70px]');

  unmount();

  render(
    <SingleProductTabSection
      productType="activity"
      productId={1}
      productData={{
        description: 'Activity description',
        inclusions_exclusions: [],
        review_summary: { total_reviews: 0 },
        faqs: [],
      }}
    />,
  );

  const activitySection = document.getElementById('tab_1');
  expect(activitySection).toHaveClass('pt-[70px]');
  expect(activitySection).not.toHaveClass('pt-8');
  expect(activitySection).not.toHaveClass('md:pt-[70px]');
});
```

- [ ] **Step 2: Run the focused test and verify the red state**

Run:

```bash
npm run test:ci -- --runInBand src/app/components/Pages/FRONT_END/singleproduct/__tests__/SingleProductTabSectionInclusions.test.jsx
```

Expected: FAIL because `tab_1` still has `pt-[70px]` and does not have `pt-8` or `md:pt-[70px]`.

- [ ] **Step 3: Load the required Next.js and React implementation guidance**

Before editing the component, invoke and follow:

- `next-best-practices`
- `vercel-react-best-practices`
- `vercel-composition-patterns`

Expected: confirm the change remains a render-time class selection with no new state, effects, client boundary, or component abstraction.

- [ ] **Step 4: Apply the mobile-only itinerary spacing**

In `SingleProductTabSection.jsx`, derive the first-section spacing alongside the other product-type values:

```jsx
const firstSectionSpacing = productType === 'itinerary' ? 'pt-8 md:pt-[70px]' : 'pt-[70px]';
```

Use it on the existing first section wrapper:

```jsx
<div
  id="tab_1"
  ref={(el) => (sectionRefs.current['tab_1'] = el)}
  className={`${firstSectionSpacing} lg:mb-[35px]`}
>
```

Do not alter the itinerary header row, sticky offsets, horizontal padding, activity/package behavior, or the existing uncommitted FAQ visibility changes.

- [ ] **Step 5: Run the focused test and verify the green state**

Run:

```bash
npm run test:ci -- --runInBand src/app/components/Pages/FRONT_END/singleproduct/__tests__/SingleProductTabSectionInclusions.test.jsx
```

Expected: PASS.

- [ ] **Step 6: Run the complete single-product regression suite**

Run:

```bash
npm run test:ci -- --runInBand src/app/components/Pages/FRONT_END/singleproduct/__tests__
```

Expected: all single-product suites and tests pass.

- [ ] **Step 7: Review error and fallback behavior**

Invoke `error-handling-patterns` and confirm the class-only change introduces no error path, async work, fallback, or user-input handling. No new error-handling code should be added.

- [ ] **Step 8: Run static verification**

Run:

```bash
npm run type-check
npm run lint
git diff --check
```

Expected: all commands exit with code 0, and the dark-mode guard reports no new hardcoded color findings.

- [ ] **Step 9: Verify the measured spacing in the visible browser**

Restart the named browser as a visible headed session if necessary, then open the provided itinerary:

```bash
agent-browser --session weelp-visible close
agent-browser --session weelp-visible --headed --args "--no-sandbox" open \
  http://localhost:3000/cities/dubai/itineraries/creator-dubai-weekend
agent-browser --session weelp-visible set viewport 390 844
```

Measure the vertical distance from the bottom of the product tab bar to the top of the itinerary section header row. Repeat at a 768×900 viewport:

```bash
agent-browser --session weelp-visible set viewport 768 900
```

Expected:

- Mobile gap is 32px.
- The `Itinerary` heading and customization action remain aligned on one row.
- No overlap occurs with the product tab bar.
- At a 768px viewport, the gap remains 70px.

- [ ] **Step 10: Review the final scoped diff**

Run:

```bash
git diff --check
git diff -- src/app/components/Pages/FRONT_END/singleproduct/SingleProductTabSection.jsx \
  src/app/components/Pages/FRONT_END/singleproduct/__tests__/SingleProductTabSectionInclusions.test.jsx
```

Expected: the original FAQ visibility hunks remain intact, and the only new implementation hunks are the responsive spacing constant/class and its regression test.

- [ ] **Step 11: Complete review, simplification, and handoff**

Run the required independent code review. Address critical findings and re-review until approved. Invoke `simplify`; if that skill remains unavailable in the installed skill catalog, perform and document the equivalent manual KISS/DRY/YAGNI pass instead of inventing a tool. If review or simplification changes code, rerun the focused and full single-product tests, `error-handling-patterns`, type-check, lint, diff check, and both visible-browser breakpoint measurements.

Report the uncommitted implementation files separately from the already committed design documentation.
