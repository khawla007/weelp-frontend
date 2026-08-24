# Home Top Destinations Stagger Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the existing opt-in `stagger-right` entrance to the main homepage's `Top Destinations` carousel without changing other `BrowseDestinationsSection` callers or Swiper behavior.

**Architecture:** The homepage opts the shared destination section into the existing carousel entrance contract. `BrowseDestinationsSection` mirrors `ProductSliderSection`: its outer `Reveal` becomes the single observer for opted-in motion, its header becomes a plain marked descendant, and `CarouselShell` receives `entrance="stagger-right"` with `observeReveal={false}`. Default callers retain the current outer, header, and carousel reveal structure.

**Tech Stack:** Next.js 16 App Router, React 19, JavaScript/JSX, Swiper, Jest, Testing Library, CSS reveal primitives

---

## Required workflow before implementation

Before editing application or test code:

1. invoke `superpowers:executing-plans` to execute this reviewed plan;
2. invoke `superpowers:test-driven-development` before writing the failing tests;
3. invoke `next-best-practices`, `vercel-react-best-practices`, and `vercel-composition-patterns` before changing the Next.js/React files;
4. commit the reviewed plan and approved spec status before implementation:

```bash
git add docs/superpowers/plans/2026-08-24-home-top-destinations-stagger.md docs/superpowers/specs/2026-08-24-home-top-destinations-stagger-design.md
git commit -m "docs: plan top destinations stagger"
```

After every application or test code change, invoke `error-handling-patterns` before the required type-check, lint, tests, and visible-browser verification. After implementation verification, dispatch the required code-review agent and use `simplify` before committing application code.

## File map

- Modify `src/app/(frontend)/page.js` to enable the entrance only for the main homepage destination section.
- Modify `src/app/(frontend)/__tests__/page.test.jsx` to lock the homepage opt-in contract.
- Modify `src/app/components/Pages/FRONT_END/home/BrowseDestinationsSection.jsx` to accept and coordinate the optional entrance.
- Modify `src/app/components/Pages/FRONT_END/home/__tests__/BrowseDestinationsSection.test.jsx` to cover the default and opted-in structures.
- Reuse `src/app/components/ui/CarouselShell.jsx` and `src/app/globals.css` unchanged; their entrance, delay cap, and reduced-motion behavior are already covered by existing tests.

### Task 1: Lock the homepage and shared-component contracts

**Files:**

- Modify: `src/app/(frontend)/__tests__/page.test.jsx`
- Modify: `src/app/components/Pages/FRONT_END/home/__tests__/BrowseDestinationsSection.test.jsx`

- [ ] **Step 1: Add the failing homepage opt-in test**

Append this test to `src/app/(frontend)/__tests__/page.test.jsx`:

```jsx
test('opts the homepage Top destinations carousel into the staggered entrance', async () => {
  const cities = [{ id: 1, name: 'Paris', slug: 'paris' }];

  getAllFeaturedActivities.mockResolvedValue([]);
  getAllFeaturedCities.mockResolvedValue(cities);
  getPublicReviews.mockResolvedValue({ data: [] });
  publicApi.get.mockResolvedValue({ data: { data: [] } });

  const page = await HomePage();
  const destinationSection = Children.toArray(page.props.children).find((child) => child.props?.cities === cities);

  expect(destinationSection).toBeDefined();
  expect(destinationSection.props.carouselEntrance).toBe('stagger-right');
});
```

- [ ] **Step 2: Upgrade the destination test doubles so they expose the motion contract**

Replace the `CarouselShell` mock in `BrowseDestinationsSection.test.jsx` with:

```jsx
const mockCarouselShell = jest.fn(() => <div data-testid="carousel-shell" />);

jest.mock('@/app/components/ui/CarouselShell', () => ({
  __esModule: true,
  default: (props) => mockCarouselShell(props),
}));
```

Replace the `Reveal` mock with an inspectable test double:

```jsx
const mockReveal = jest.fn(({ children, className = '', as: Component = 'div', initialHidden, ...props }) => (
  <Component className={className} data-initial-hidden={initialHidden ? 'true' : undefined} {...props}>
    {children}
  </Component>
));

jest.mock('@/app/components/ui/Reveal', () => ({
  __esModule: true,
  default: (props) => mockReveal(props),
}));
```

Add this reset before the tests:

```jsx
beforeEach(() => {
  mockCarouselShell.mockClear();
  mockReveal.mockClear();
});
```

- [ ] **Step 3: Add failing default and opted-in component assertions**

Append these tests to `BrowseDestinationsSection.test.jsx`:

```jsx
test('preserves the existing reveal structure when no carousel entrance is requested', () => {
  const { container } = render(<BrowseDestinationsSection cities={cities} />);

  expect(mockReveal).toHaveBeenCalledTimes(2);
  expect(mockReveal.mock.calls[0][0]).toEqual(expect.objectContaining({ as: 'section', initialHidden: true }));
  expect(mockReveal.mock.calls[1][0]).toEqual(expect.objectContaining({ variant: 'lift' }));
  expect(container.querySelector('[data-carousel-section-entrance]')).not.toBeInTheDocument();
  expect(container.querySelector('[data-carousel-section-header]')).not.toBeInTheDocument();
  expect(mockCarouselShell.mock.calls.at(-1)[0].entrance).toBeUndefined();
  expect(mockCarouselShell.mock.calls.at(-1)[0].observeReveal).toBeUndefined();
});

test('uses one section reveal to coordinate the staggered destination header and carousel', () => {
  render(<BrowseDestinationsSection cities={cities} carouselEntrance="stagger-right" />);

  const section = screen.getByRole('region', { name: 'Top Destinations' });
  expect(mockReveal).toHaveBeenCalledTimes(1);
  expect(mockReveal.mock.calls[0][0]).toEqual(expect.objectContaining({ as: 'section', initialHidden: true }));
  expect(section).toHaveAttribute('data-carousel-section-entrance', 'stagger-right');
  expect(section).toHaveAttribute('data-initial-hidden', 'true');
  expect(section.querySelector('[data-carousel-section-header]')).toBeInTheDocument();
  expect(mockCarouselShell.mock.calls.at(-1)[0]).toEqual(expect.objectContaining({ entrance: 'stagger-right', observeReveal: false }));
});
```

- [ ] **Step 4: Run the focused tests and verify the new assertions fail**

Run:

```bash
npx jest --runTestsByPath 'src/app/(frontend)/__tests__/page.test.jsx' src/app/components/Pages/FRONT_END/home/__tests__/BrowseDestinationsSection.test.jsx --runInBand
```

Expected: FAIL because the homepage does not pass `carouselEntrance`, the opted-in destination section lacks the scoped hooks, and `CarouselShell` does not receive the entrance props.

### Task 2: Implement the opt-in destination entrance

**Files:**

- Modify: `src/app/(frontend)/page.js`
- Modify: `src/app/components/Pages/FRONT_END/home/BrowseDestinationsSection.jsx`
- Test: `src/app/(frontend)/__tests__/page.test.jsx`
- Test: `src/app/components/Pages/FRONT_END/home/__tests__/BrowseDestinationsSection.test.jsx`

- [ ] **Step 1: Enable the entrance on the main homepage only**

Replace the main homepage destination call in `src/app/(frontend)/page.js` with:

```jsx
<BrowseDestinationsSection cities={featuredCities} cardTextTone="theme" carouselEntrance="stagger-right" className="pb-12 md:pb-16 lg:pb-24" />
```

Do not change the `BrowseDestinationsSection` calls on Home Gold, Holiday, Tours & Experiences, or Region pages.

- [ ] **Step 2: Add the optional prop and derive the coordinated roots**

Add `carouselEntrance` to the `BrowseDestinationsSection` parameter list after `cardTextTone`:

```jsx
export default function BrowseDestinationsSection({
  cities = [],
  title = 'Top Destinations',
  subtitleMode = 'count',
  navigationPrefix = 'browse-destinations',
  className = '',
  cardTextTone = 'overlay',
  carouselEntrance,
}) {
```

After the empty-items guard, add:

```jsx
const usesStaggeredEntrance = carouselEntrance === 'stagger-right';
const HeaderRoot = usesStaggeredEntrance ? 'div' : Reveal;
const sectionRootProps = usesStaggeredEntrance
  ? {
      'aria-label': title,
      'data-carousel-section-entrance': carouselEntrance,
    }
  : {};
const headerRootProps = usesStaggeredEntrance ? { 'data-carousel-section-header': '' } : { variant: 'lift' };
```

The outer root remains `Reveal` for both modes because that is already the destination component's section observer.

- [ ] **Step 3: Wire the outer reveal, header descendant, and carousel observer ownership**

Change the opening section and header tags to:

```jsx
<Reveal as="section" initialHidden {...sectionRootProps} className={`container-page flex flex-col gap-8 pb-10 md:pb-16 lg:pb-24 ${className}`}>
  <HeaderRoot {...headerRootProps} className="flex items-center justify-between">
```

Change the matching header closing tag from `</Reveal>` to `</HeaderRoot>`.

Add these props to `CarouselShell` before `renderSlide`:

```jsx
entrance={usesStaggeredEntrance ? carouselEntrance : undefined}
observeReveal={usesStaggeredEntrance ? false : undefined}
```

- [ ] **Step 4: Run the focused tests and verify they pass**

Run:

```bash
npx jest --runTestsByPath 'src/app/(frontend)/__tests__/page.test.jsx' src/app/components/Pages/FRONT_END/home/__tests__/BrowseDestinationsSection.test.jsx src/app/components/ui/__tests__/CarouselShell.test.jsx src/app/components/ui/__tests__/CarouselMotionStyles.test.js --runInBand
```

Expected: PASS, 4 suites. This confirms the homepage opt-in, default-call preservation, shared observer contract, slide delay cap, and reduced-motion CSS remain intact.

### Task 3: Verify behavior and complete the review gates

**Files:**

- Verify: `src/app/(frontend)/page.js`
- Verify: `src/app/components/Pages/FRONT_END/home/BrowseDestinationsSection.jsx`
- Verify: `src/app/(frontend)/__tests__/page.test.jsx`
- Verify: `src/app/components/Pages/FRONT_END/home/__tests__/BrowseDestinationsSection.test.jsx`

- [ ] **Step 1: Review the changed code with the required error-handling skill**

Invoke `error-handling-patterns` and inspect the changed component boundaries for invalid props, empty data, unsupported entrance values, and observer ownership. The expected result is no new failure branch: unsupported or omitted values retain the existing default behavior, while an empty city list still returns `null` before motion setup affects rendering.

- [ ] **Step 2: Run static verification in the mandated order**

Run:

```bash
npm run type-check
npm run lint
git diff --check
```

Expected: all commands exit zero and lint reports no new dark-mode findings.

- [ ] **Step 3: Run the full test suite and record unrelated baseline failures separately**

Run:

```bash
npm run test:ci -- --runInBand
```

Expected for this change: every destination and carousel-related suite passes. If the previously observed `deepForestTheme.test.js` or `DashboardResponsiveLayout.test.js` stale content contracts still fail, confirm their source and test files are untouched with `git diff --name-only HEAD -- <paths>` and report them without editing unrelated code.

- [ ] **Step 4: Verify the entrance in the required visible local browser**

Open or restart a named headed session:

```bash
agent-browser --session weelp-top-destinations --headed --args "--no-sandbox" open http://localhost:3000
agent-browser --session weelp-top-destinations set viewport 1440 900
agent-browser --session weelp-top-destinations reload
```

Before scrolling, inspect the section and expect `data-reveal="pending"`, a hidden marked header, and hidden destination slides. Scroll the section into view, then verify:

- the section becomes `data-reveal="shown"`;
- the header reaches opacity 1;
- the first five slide delays are `0s`, `0.09s`, `0.18s`, `0.27s`, and `0.36s`;
- each visible slide settles at opacity 1 and an identity transform;
- arrow navigation changes Swiper's active index without replaying the reveal;
- scrolling away and back leaves the section shown.

Repeat at `390x844` and confirm the mobile peek/pagination remain usable with no horizontal document overflow.

- [ ] **Step 5: Verify reduced motion and browser errors**

Run:

```bash
agent-browser --session weelp-top-destinations set media reduced-motion
agent-browser --session weelp-top-destinations reload
agent-browser --session weelp-top-destinations errors
```

Expect the marked header and destination slides to report `animation-name: none`, opacity 1, transform `none`, and `will-change: auto`. Expect no browser errors. Reset media to `no-preference` afterward.

- [ ] **Step 6: Complete the mandatory code review and simplification gates**

Dispatch the code-review agent over the final diff. Resolve every critical or important finding and re-run the affected checks. Invoke the `simplify` skill if available; if it is unavailable, perform a focused manual pass that removes duplication without broadening scope, then re-run focused tests, type-check, and lint.

- [ ] **Step 7: Commit and push the reviewed implementation to main**

Run:

```bash
git add -u
git commit -m "feat(home): stagger destination carousel entrance"
git push origin main
```

The design, plan, and implementation commits must land directly on the frontend `main` branch. Confirm `git status --short` is empty after the push.
