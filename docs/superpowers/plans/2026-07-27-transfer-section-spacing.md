# Transfer Section Spacing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the redundant shared wrapper from `/transfers`, give Featured Reviews explicit 40px/64px/96px bottom padding, and keep the FAQ section free of top margin.

**Architecture:** Featured Reviews and FAQs become sibling semantic sections that each own `container-page` and their responsive bottom spacing. Existing data fetching, conditional review rendering, typography, and component behavior remain unchanged.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS, Jest, Testing Library

---

### Task 1: Lock the section ownership and spacing into tests

**Files:**

- Modify: `src/app/(frontend)/transfers/__tests__/page.test.jsx:134-155`

- [ ] **Step 1: Add failing assertions for the FAQ-only state**

Extend the existing empty-review test so the FAQ section owns its container and
page-bottom spacing without a top-margin utility:

```jsx
const { container, queryByRole, queryByTestId, getByTestId } = render(<TransfersPage />);
const faqSection = getByTestId('faq-accordion').closest('section');

expect(faqSection).toHaveClass('container-page', 'pb-10', 'md:pb-16', 'lg:pb-24');
expect([...faqSection.classList]).not.toEqual(expect.arrayContaining([expect.stringMatching(/^(-?mt-)|:-?mt-/)]));
expect(faqSection.parentElement).toBe(container);
```

- [ ] **Step 2: Add failing assertions for the populated-review state**

Extend the populated-review test so the review section owns its horizontal
container and approved 40px/64px/96px bottom padding:

```jsx
const { container, getByRole, getByTestId } = render(<TransfersPage />);
const reviewHeading = getByRole('heading', { name: 'Featured Reviews' });
const reviewSection = reviewHeading.closest('section');
const faqSection = getByTestId('faq-accordion').closest('section');

expect(reviewSection).toHaveClass('container-page', 'productSlider', 'pb-10', 'md:pb-16', 'lg:pb-24');
expect(reviewSection).toHaveClass('relative');
expect(reviewSection).not.toHaveClass('space-y-8');
expect(faqSection).toHaveClass('container-page', 'pb-10', 'md:pb-16', 'lg:pb-24');
expect([...faqSection.classList]).not.toEqual(expect.arrayContaining([expect.stringMatching(/^(-?mt-)|:-?mt-/)]));
expect(reviewSection.parentElement).toBe(container);
expect(faqSection.parentElement).toBe(container);
expect(reviewSection.nextElementSibling).toBe(faqSection);
```

- [ ] **Step 3: Run the focused test and confirm it fails for the current wrapper**

Run:

```bash
npm run test:ci -- --runTestsByPath 'src/app/(frontend)/transfers/__tests__/page.test.jsx' --runInBand
```

Expected: FAIL because `container-page` and responsive bottom-padding classes
still belong to the shared parent `div`, not the two semantic sections.

### Task 2: Move layout ownership to the semantic sections

**Files:**

- Modify: `src/app/(frontend)/transfers/page.js:122-137`

- [ ] **Step 1: Load the required Next.js implementation guidance**

Before modifying the page, invoke and follow:

- `next-best-practices`
- `vercel-react-best-practices`
- `vercel-composition-patterns`

- [ ] **Step 2: Replace the shared wrapper with sibling sections**

Replace the current wrapper block with:

```jsx
<>
  {hasFeaturedReviews ? (
    <Reveal as="section" initialHidden className="container-page productSlider relative pb-10 md:pb-16 lg:pb-24">
      <Reveal as="h2" variant="lift" className="text-2xl font-semibold text-foreground sm:text-3xl">
        Featured Reviews
      </Reveal>
      <Reveal variant="lift" delay={120}>
        <ReviewSlider reviews={featuredReviews} />
      </Reveal>
    </Reveal>
  ) : null}

  <Reveal as="section" initialHidden variant="lift" delay={hasFeaturedReviews ? 200 : 0} className="container-page pb-10 md:pb-16 lg:pb-24">
    <Accordion items={faqItems} headingClassName="py-6 text-2xl font-semibold text-[var(--weelp-home-ink)] sm:text-3xl" />
  </Reveal>
</>
```

Do not add `mt-*`, `space-y-*`, or another wrapper around both sections.
`productSlider > h2` already provides the existing 32px heading-to-slider gap,
so adding `space-y-8` here would incorrectly double it.

- [ ] **Step 3: Run the focused test and confirm it passes**

Run:

```bash
npm run test:ci -- --runTestsByPath 'src/app/(frontend)/transfers/__tests__/page.test.jsx' --runInBand
```

Expected: PASS.

### Task 3: Validate, review, and commit

**Files:**

- Verify: `src/app/(frontend)/transfers/page.js`
- Verify: `src/app/(frontend)/transfers/__tests__/page.test.jsx`

- [ ] **Step 1: Apply the required post-change error-handling review**

Invoke `error-handling-patterns` and confirm this structural-only edit does not
introduce or alter an error path.

- [ ] **Step 2: Run required static checks**

Run:

```bash
npm run type-check
npm run lint
git diff --check
```

Expected: all commands exit successfully with no new errors or warnings.

- [ ] **Step 3: Run the focused regression test again**

Run:

```bash
npm run test:ci -- --runTestsByPath 'src/app/(frontend)/transfers/__tests__/page.test.jsx' --runInBand
```

Expected: PASS.

- [ ] **Step 4: Verify the local page in the visible browser**

Open the local page in a named visible headed session:

```bash
agent-browser --session weelp-transfer-spacing-visible --headed open http://localhost:3000/transfers
```

At 320px, 768px, and 1280px viewport widths, verify:

- Seeded transfer reviews are visible before measuring the conditional review
  section.
- Featured Reviews bottom padding computes to 40px, 64px, and 96px.
- The FAQ section has `margin-top: 0px`.
- Both sections share the same horizontal container alignment.
- `document.body.scrollWidth <= window.innerWidth`.
- Review visibility and FAQ rendering remain unchanged.

- [ ] **Step 5: Complete the required code-review and simplification gates**

Dispatch the project’s code-reviewer agent against the implementation diff.
Address critical findings and request re-review if code changes are required.
Then run the available simplification workflow, or perform the equivalent
focused clarity/reuse pass if that skill is unavailable.

If either gate changes code, repeat Steps 1–5 so error handling, static checks,
tests, visible-browser validation, review, and simplification all cover the
latest implementation.

- [ ] **Step 6: Run verification-before-completion**

Invoke `verification-before-completion`, inspect the final diff, and confirm the
focused test, type-check, lint, and browser checks have fresh passing evidence.

- [ ] **Step 7: Commit the verified implementation**

```bash
git add 'src/app/(frontend)/transfers/page.js' \
  'src/app/(frontend)/transfers/__tests__/page.test.jsx' \
  'docs/superpowers/plans/2026-07-27-transfer-section-spacing.md'
git commit -m "fix: refine transfer section spacing"
```

- [ ] **Step 8: Push the verified frontend main branch**

Confirm the current branch is `main`, then run:

```bash
git push origin main
```

Expected: the remote `main` branch receives the approved specification,
implementation plan, and verified implementation commits.
