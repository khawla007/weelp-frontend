# Single Activity Responsive Spacing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace oversized mobile/tablet spacing at the bottom of single activity pages with Weelp's 16px/24px/32px responsive rhythm while preserving desktop layout and the fixed booking action.

**Architecture:** Keep the existing single-product structure and select activity-only spacing class strings inside `SingleProductTabSection.jsx`; itinerary and package pages retain their current classes. Lock both the new activity contract and the unchanged non-activity contract in the existing component suite, then verify real computed geometry on both the reported Yacht Cruise page and the data-rich Desert Safari page.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS, Jest, Testing Library, agent-browser.

---

### Task 1: Lock the responsive spacing contract

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/singleproduct/__tests__/SingleProductTabSectionInclusions.test.jsx`
- Reference: `docs/superpowers/specs/2026-08-10-single-activity-responsive-spacing-design.md`

- [ ] **Step 1: Make the Similar Experiences mock observable**

Replace the null mock with a stable test marker:

```jsx
jest.mock('../SimilarExperiences', () => {
  const MockSimilarExperiences = () => <div data-testid="similar-experiences" />;
  MockSimilarExperiences.displayName = 'MockSimilarExperiences';
  return MockSimilarExperiences;
});
```

- [ ] **Step 2: Replace the old `pb-28` assertion with the responsive contract**

In the existing narrow-layout test, replace:

```jsx
expect(layout.closest('section')).toHaveClass('pb-28', 'xl:pb-0');
```

with:

```jsx
expect(layout.closest('section')).toHaveClass('pb-4', 'md:pb-6', 'lg:pb-8', 'xl:pb-0');
expect(layout.closest('section')).not.toHaveClass('pb-28');
```

- [ ] **Step 3: Add a focused FAQ and Similar Experiences spacing test**

Add this test inside `SingleProductTabSection activity inclusions`:

```jsx
it('uses the mobile spacing scale between FAQs, Similar Experiences, and the page end', () => {
  render(
    <SingleProductTabSection
      productType="activity"
      productId={1}
      productData={{
        description: 'Activity description',
        inclusions_exclusions: [],
        review_summary: { total_reviews: 0 },
        faqs: [{ id: 1, question: 'Is pickup included?', answer: 'Yes.' }],
      }}
      similarActivities={[{ id: 10, name: 'Desert Safari' }]}
    />,
  );

  const faqSection = document.getElementById('tab_4');
  const [tabletSimilar] = screen.getAllByTestId('similar-experiences');
  const tabletSimilarWrapper = tabletSimilar.parentElement;

  expect(faqSection).toHaveClass('pb-4', 'md:pb-6', 'lg:pb-8', 'xl:pb-0', 'xl:mb-[35px]');
  expect(faqSection).not.toHaveClass('lg:mb-[35px]');
  expect(tabletSimilarWrapper).toHaveClass('hidden', 'md:block', 'xl:mb-[70px]');
  expect(tabletSimilarWrapper).not.toHaveClass('lg:mb-[70px]');
});
```

- [ ] **Step 4: Add non-activity regression coverage**

Add this parameterized test so the shared component cannot silently change
itinerary or package spacing:

```jsx
it.each(['itinerary', 'package'])('preserves existing %s page-end spacing', (productType) => {
  render(
    <SingleProductTabSection
      productType={productType}
      productId={1}
      productData={{
        schedules: [],
        inclusions_exclusions: [],
        review_summary: { total_reviews: 0 },
        faqs: [{ id: 1, question: 'Is pickup included?', answer: 'Yes.' }],
      }}
      similarActivities={[{ id: 10, name: 'Desert Safari' }]}
    />,
  );

  const section = screen.getByTestId('single-product-layout').closest('section');
  const faqSection = document.getElementById('tab_4');
  const [tabletSimilar] = screen.getAllByTestId('similar-experiences');

  expect(section).toHaveClass('pb-28', 'xl:pb-0');
  expect(faqSection).toHaveClass('pt-[35px]', 'lg:mb-[35px]');
  expect(faqSection).not.toHaveClass('pb-4');
  expect(faqSection).not.toHaveClass('md:pb-6');
  expect(faqSection).not.toHaveClass('lg:pb-8');
  expect(faqSection).not.toHaveClass('xl:mb-[35px]');
  expect(tabletSimilar.parentElement).toHaveClass('lg:mb-[70px]');
});
```

- [ ] **Step 5: Run the focused suite and confirm RED**

Run:

```bash
npm run test:ci -- --runInBand src/app/components/Pages/FRONT_END/singleproduct/__tests__/SingleProductTabSectionInclusions.test.jsx
```

Expected: the new activity assertions FAIL because the section still has `pb-28`, the FAQ still has `lg:mb-[35px]` without responsive bottom padding, and Similar Experiences still has `lg:mb-[70px]`. The itinerary/package assertions PASS.

### Task 2: Apply the established responsive spacing scale

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/singleproduct/SingleProductTabSection.jsx:203`
- Modify: `src/app/components/Pages/FRONT_END/singleproduct/SingleProductTabSection.jsx:294`
- Modify: `src/app/components/Pages/FRONT_END/singleproduct/SingleProductTabSection.jsx:301`
- Test: `src/app/components/Pages/FRONT_END/singleproduct/__tests__/SingleProductTabSectionInclusions.test.jsx`

- [ ] **Step 1: Invoke the mandatory Next.js and React skill gates**

Before editing the component, invoke and apply:

- `next-best-practices`
- `vercel-react-best-practices`
- `vercel-composition-patterns`

Confirm that the change stays inside the existing client component, adds no
new client/server boundary, creates no new render-time state or effect, and
uses the existing product-type predicate instead of adding a component API.

- [ ] **Step 2: Define activity-only spacing variants before the return statement**

After `bottomImage`, add these strings using the existing
`isActivityProduct` predicate declared near the top of the component:

```jsx
const sectionBottomSpacing = isActivityProduct ? 'pb-4 md:pb-6 lg:pb-8 xl:pb-0' : 'pb-28 xl:pb-0';
const faqSectionSpacing = isActivityProduct ? 'pb-4 pt-[35px] md:pb-6 lg:pb-8 xl:mb-[35px] xl:pb-0' : 'pt-[35px] lg:mb-[35px]';
const desktopSimilarSpacing = isActivityProduct ? 'hidden md:block xl:mb-[70px]' : 'hidden md:block lg:mb-[70px]';
```

- [ ] **Step 3: Apply activity-only section-end padding**

Change the root section to:

```jsx
<section className={`w-full bg-background ${sectionBottomSpacing}`}>
```

This gives Similar Experiences 16px at mobile, 24px at tablet, 32px at large tablet, and keeps the current desktop behavior.

- [ ] **Step 4: Give activity FAQs responsive bottom spacing**

Change the FAQ section wrapper to:

```jsx
<div id="tab_4" ref={(el) => (sectionRefs.current['tab_4'] = el)} className={faqSectionSpacing}>
  <FaqPanel faqs={faqs} />
</div>
```

The FAQ-to-Similar gap becomes 16px/24px/32px below `xl`; desktop retains its existing 35px margin.

- [ ] **Step 5: Keep the activity 70px Similar Experiences margin desktop-only**

Change the tablet/desktop wrapper to:

```jsx
<Reveal variant="lift" className={desktopSimilarSpacing}>
  <SimilarExperiences activities={similarActivities} />
</Reveal>
```

- [ ] **Step 6: Run the focused suite and confirm GREEN**

Run:

```bash
npm run test:ci -- --runInBand src/app/components/Pages/FRONT_END/singleproduct/__tests__/SingleProductTabSectionInclusions.test.jsx
```

Expected: PASS with no warnings or failures.

### Task 3: Verify related FAQ behavior and code quality

**Files:**

- Verify: `src/app/components/Pages/FRONT_END/singleproduct/__tests__/TabSectionModules.test.jsx`
- Verify: `src/app/components/__tests__/Faq.test.jsx`
- Verify: `src/app/components/Pages/FRONT_END/Global/__tests__/ReviewSection.test.jsx`

- [ ] **Step 1: Invoke the required error-handling-patterns pass**

Review the class-selection logic and fallback paths. Confirm that an unknown
or non-activity `productType` keeps the existing `pb-28`, `lg:mb-[35px]`, and
`lg:mb-[70px]` behavior and that no runtime exception path was introduced.

- [ ] **Step 2: Run all affected FAQ and single-product suites**

Run:

```bash
npm run test:ci -- --runInBand src/app/components/Pages/FRONT_END/singleproduct/__tests__/SingleProductTabSectionInclusions.test.jsx src/app/components/Pages/FRONT_END/singleproduct/__tests__/TabSectionModules.test.jsx src/app/components/__tests__/Faq.test.jsx src/app/components/Pages/FRONT_END/Global/__tests__/ReviewSection.test.jsx
```

Expected: all suites and tests PASS.

- [ ] **Step 3: Run static verification**

Run these independently:

```bash
npm run type-check
npm run lint
git diff --check
```

Expected: all commands exit 0 with no TypeScript, ESLint, dark-mode guard, or whitespace errors.

### Task 4: Verify real responsive geometry in the visible browser

**Files:**

- Verify route: `http://localhost:3000/cities/dubai/activities/dubai-marina-yacht-cruise`
- Verify route: `http://localhost:3000/cities/dubai/activities/dubai-desert-safari-with-bbq`

- [ ] **Step 1: Verify the reported Yacht Cruise page**

Restart the named session as an explicitly visible headed browser, then inspect at 390px, 768px, 1024px, and 1280px:

```bash
XDG_RUNTIME_DIR=/run/user/1000 agent-browser --session weelp-visible close
XDG_RUNTIME_DIR=/run/user/1000 agent-browser --session weelp-visible --headed --args "--no-sandbox" open http://localhost:3000/cities/dubai/activities/dubai-marina-yacht-cruise
XDG_RUNTIME_DIR=/run/user/1000 agent-browser --session weelp-visible set viewport 390 844
XDG_RUNTIME_DIR=/run/user/1000 agent-browser --session weelp-visible set viewport 768 900
XDG_RUNTIME_DIR=/run/user/1000 agent-browser --session weelp-visible set viewport 1024 900
XDG_RUNTIME_DIR=/run/user/1000 agent-browser --session weelp-visible set viewport 1280 900
```

At each width, read computed geometry for `#tab_4`, the visible Similar Experiences wrapper, the root single-product section, and `[data-testid="mobile-booking-bar"]`.

Expected:

- 390px: FAQ and section bottom padding are 16px.
- 768px: FAQ and section bottom padding are 24px; Similar Experiences has no 70px margin.
- 1024px: FAQ and section bottom padding are 32px; Similar Experiences has no 70px margin.
- 1280px: FAQ bottom padding is 0px with a 35px margin; Similar Experiences retains its 70px desktop margin; root section padding is 0px.
- The fixed booking action remains visible when the inline action is outside the viewport.
- `document.documentElement.scrollWidth <= document.documentElement.clientWidth` at every width.

At 390px, 768px, and 1024px, scroll to the document end and compare the final
visible Similar Experiences card with the fixed booking bar:

```js
window.scrollTo(0, document.documentElement.scrollHeight);
const visibleSimilarHeading = Array.from(document.querySelectorAll('h2')).find((heading) => heading.textContent.trim() === 'Similar Experiences' && heading.getBoundingClientRect().height > 0);
const similarSection = visibleSimilarHeading?.parentElement?.parentElement;
const lastSimilarCard = similarSection?.querySelector('a:last-of-type');
const bookingBar = document.querySelector('[data-testid="mobile-booking-bar"]');
({
  cardBottom: lastSimilarCard?.getBoundingClientRect().bottom,
  barTop: bookingBar?.getBoundingClientRect().top,
  clearsBar: !bookingBar || lastSimilarCard.getBoundingClientRect().bottom <= bookingBar.getBoundingClientRect().top,
});
```

Expected: `clearsBar` is `true` at all three widths. At 1280px,
`[data-testid="mobile-booking-bar"]` is absent or computed as `display: none`.

- [ ] **Step 2: Verify the data-rich Desert Safari page**

Repeat the 390px, 768px, and 1024px checks on:

```text
http://localhost:3000/cities/dubai/activities/dubai-desert-safari-with-bbq
```

Open the final FAQ at each width. Expected: reviews and FAQs render, the final question remains anchored, no reserved mobile blank space returns, and the same 16px/24px/32px gaps apply before Similar Experiences and the footer.

### Task 5: Complete review, simplification, and integration gates

**Files:**

- Review the full frontend diff.
- Commit only after every gate below passes.

- [ ] **Step 1: Dispatch the mandatory code-reviewer agent**

Ask it to review the diff against the approved design, responsive behavior, existing fixed-booking-bar contract, test quality, and project conventions. If it requests changes, fix them and re-run Tasks 3 and 4 before re-review.

- [ ] **Step 2: Run the required simplify pass**

Use the `simplify` skill if available. If it remains unavailable, record that
limitation and manually verify that the production change is limited to the
three activity-only spacing strings and their existing layout bindings from
Task 2.

- [ ] **Step 3: Run final fresh verification**

Repeat Tasks 3 and 4 after review and simplification. Expected: all commands
exit 0 and the final visible-browser geometry still matches the approved
responsive spacing.

- [ ] **Step 4: Commit the earlier reviewed FAQ fixes separately on `main`**

Confirm the branch first:

```bash
git branch --show-current
```

Expected: `main`.

Stage the earlier user-approved and reviewed FAQ-height/city-padding fixes:

```bash
git add src/hooks/useStableFaqHeight.js src/app/components/__tests__/Faq.test.jsx src/app/components/Pages/FRONT_END/Global/ReviewSection.jsx src/app/components/Pages/FRONT_END/Global/__tests__/ReviewSection.test.jsx src/app/components/Pages/FRONT_END/singleproduct/__tests__/TabSectionModules.test.jsx
git commit -m "fix(faq): refine responsive layout"
```

Expected: one reviewed commit containing only the earlier FAQ fixes.

- [ ] **Step 5: Commit the activity responsive-spacing work**

```bash
git add src/app/components/Pages/FRONT_END/singleproduct/SingleProductTabSection.jsx src/app/components/Pages/FRONT_END/singleproduct/__tests__/SingleProductTabSectionInclusions.test.jsx docs/superpowers/specs/2026-08-10-single-activity-responsive-spacing-design.md docs/superpowers/plans/2026-08-10-single-activity-responsive-spacing.md
git commit -m "fix(activity): tighten responsive section spacing"
```

Expected: a second reviewed commit containing only the approved activity-page
spacing change, regression test, spec, and plan.

- [ ] **Step 6: Push `main`**

```bash
git push origin main
```

Expected: the frontend `main` branch updates successfully.
