# Website-wide Blog Carousel Stagger-right Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every shared blog carousel use the same `stagger-right` entrance as Top Activities, Top Destinations, and Postcards.

**Architecture:** Put the entrance contract inside `BlogSection` so every current and future caller inherits it automatically. Reuse the existing generic carousel markers and CSS, remove the obsolete guide-only variant, and remove the Latest Blogs wrapper animation that would otherwise layer a second entrance.

**Tech Stack:** Next.js 16, React 19, Jest, Testing Library, Tailwind CSS, shared `Reveal` and `CarouselShell` components.

---

### Task 1: Lock the website-wide shared entrance with failing tests

**Files:**

- Modify: `src/app/components/ui/__tests__/BlogSection.test.jsx`
- Modify: `src/app/components/ui/__tests__/BlogSectionMotionStyles.test.js`
- Modify: `src/app/(frontend)/home-gold/__tests__/page.test.jsx`
- Create: `src/app/(frontend)/cities/[city]/__tests__/page.test.jsx`
- Create: `src/app/components/Pages/FRONT_END/Global/__tests__/BlogSliderSection.test.jsx`
- Modify: `src/app/components/ui/__tests__/CarouselShell.test.jsx`
- Modify: `src/app/components/ui/__tests__/CarouselMotionStyles.test.js`

- [ ] **Step 0: Load the mandatory execution guidance**

Invoke and apply `executing-plans`, `systematic-debugging`, `next-best-practices`, `vercel-react-best-practices`, and `vercel-composition-patterns` before editing tests or production code. Record that the investigated difference is the route-specific `editorial-right` branch versus the established shared `stagger-right` contract.

- [ ] **Step 1: Change the `BlogSection` coordinated-entrance test**

Render without an `entrance` prop and assert that the section always uses the shared contract:

```jsx
test('always uses the shared stagger-right carousel entrance', () => {
  render(<BlogSection blogs={[blog]} navigationId="guide-blog" />);

  const section = screen.getByTestId('reveal');
  expect(section.tagName).toBe('SECTION');
  expect(section).toHaveAttribute('data-initial-hidden', 'true');
  expect(section).toHaveAttribute('data-carousel-section-entrance', 'stagger-right');
  expect(section.querySelector('[data-carousel-section-header]')).toBeInTheDocument();
  expect(screen.getAllByTestId('reveal')).toHaveLength(1);
  expect(mockCarouselShell).toHaveBeenLastCalledWith(expect.objectContaining({ entrance: 'stagger-right', observeReveal: false }), undefined);
});
```

Delete the old test that expects two independent reveals when `entrance` is omitted. Retain mapping, navigation, breakpoints, pagination, compact-card, and empty-list assertions in the coordinated test.

- [ ] **Step 2: Replace the guide-only CSS tests**

Collapse `BlogSectionMotionStyles.test.js` to the removal/shared-contract regression:

```js
test('uses the shared carousel motion instead of a guide-only contract', () => {
  expect(css).toContain('@keyframes weelpCarouselRevealRight');
  expect(css).toContain("data-carousel-section-entrance='stagger-right'");
  expect(css).not.toContain('weelpGuideCardReveal');
  expect(css).not.toContain("data-guide-section-entrance='editorial-right'");
});
```

The existing `CarouselMotionStyles.test.js` remains the source of detailed shared keyframe and reduced-motion assertions.

- [ ] **Step 3: Update route-composition coverage**

Replace the Home/Home Gold editorial-only test with:

```jsx
it('leaves blog entrance ownership to the shared BlogSection', async () => {
  publicApi.get.mockResolvedValue({ data: { data: [{ id: 3, title: 'A local guide' }] } });
  const homeChildren = await getHomeChildren();
  const goldChildren = await getGoldChildren();
  const homeGuide = homeChildren.find((child) => child.type.sectionName === 'BlogSection');
  const goldGuide = goldChildren.find((child) => child.type.sectionName === 'BlogSection');

  expect(homeGuide).toBeDefined();
  expect(goldGuide).toBeDefined();
  expect(homeGuide.props.entrance).toBeUndefined();
  expect(goldGuide.props.entrance).toBeUndefined();
});
```

- [ ] **Step 4: Add Latest Blogs coverage**

Mock `useBlogs` and `BlogSection`, render `BlogSliderSection`, and assert the shared component receives blogs/title/navigation without the old animation class:

```jsx
import { render } from '@testing-library/react';
import BlogSliderSection from '../BlogSliderSection';
import { useBlogs } from '@/hooks/api/public/blogs/useBlogs';

const mockBlogSection = jest.fn(() => <section data-testid="blog-section" />);

jest.mock('@/hooks/api/public/blogs/useBlogs', () => ({ useBlogs: jest.fn() }));
jest.mock('@/app/components/ui/BlogSection', () => ({
  __esModule: true,
  default: (props) => mockBlogSection(props),
}));

test('delegates Latest Blogs motion to the shared BlogSection', () => {
  const blogs = [{ id: 1, title: 'Paris guide' }];
  useBlogs.mockReturnValue({ blogs: { data: blogs }, error: null, isLoading: false });

  render(<BlogSliderSection />);

  const props = mockBlogSection.mock.calls.at(-1)[0];
  expect(props).toEqual(expect.objectContaining({ blogs, title: 'Latest Blogs', navigationId: 'latest-blogs' }));
  expect(props).not.toHaveProperty('className');
});
```

- [ ] **Step 5: Add city-page composition coverage**

Create `src/app/(frontend)/cities/[city]/__tests__/page.test.jsx` with service mocks, a `next/dynamic` mock that exposes `sectionName`, and this assertion after rendering `CityPage({ params: Promise.resolve({ city: 'paris' }) })`:

```jsx
const children = Children.toArray(page.props.children);
const cityBlogs = children.find((child) => child.type?.sectionName === 'BlogSection');

expect(cityBlogs).toBeDefined();
expect(cityBlogs.props).toEqual(expect.objectContaining({ blogs, title: 'Blogs', navigationId: 'city-blogs' }));
expect(cityBlogs.props).not.toHaveProperty('entrance');
```

Mock `getCityData` with `{ data: { name: 'Paris' } }`, activities and itineraries with `{ data: [] }`, blogs with `{ data: blogs }`, and reviews with `{ data: [] }`. Mock `notFound`, `CityHeroBanner`, `CitySection`, and `SharedToursSection` so the async page can be called without browser APIs.

- [ ] **Step 6: Extend shared fallback coverage**

Add this regression to `CarouselMotionStyles.test.js`:

```js
test('bypasses carousel entrance motion when observation is unavailable', () => {
  const bypassRule =
    /\[data-carousel-section-entrance='stagger-right'\]\[data-reveal-motion='bypassed'\] \[data-carousel-section-header\],\s*\[data-carousel-section-entrance='stagger-right'\]\[data-reveal-motion='bypassed'\] \.swiper-slide\s*\{[^}]*opacity: 1;[^}]*transform: none;[^}]*animation: none;[^}]*animation-delay: 0ms;[^}]*will-change: auto;[^}]*\}/s;

  expect(css).toMatch(bypassRule);
});
```

- [ ] **Step 7: Remove the obsolete editorial entrance unit test from `CarouselShell.test.jsx`**

Keep the existing `stagger-right` indexing test, which already verifies capped shared delay indexes.

- [ ] **Step 8: Run the focused tests and verify RED**

Run:

```bash
npx jest --runInBand --runTestsByPath \
  'src/app/components/ui/__tests__/BlogSection.test.jsx' \
  'src/app/components/ui/__tests__/BlogSectionMotionStyles.test.js' \
  'src/app/components/ui/__tests__/CarouselMotionStyles.test.js' \
  'src/app/(frontend)/home-gold/__tests__/page.test.jsx' \
  'src/app/(frontend)/cities/[city]/__tests__/page.test.jsx' \
  'src/app/components/Pages/FRONT_END/Global/__tests__/BlogSliderSection.test.jsx' \
  'src/app/components/ui/__tests__/CarouselShell.test.jsx'
```

Expected: failures show the old `editorial-right`, optional entrance, and `weelp-fade-up` behavior.

### Task 2: Move all blog carousels onto the shared entrance

**Files:**

- Modify: `src/app/components/ui/BlogSection.jsx`
- Modify: `src/app/components/ui/CarouselShell.jsx`
- Modify: `src/app/components/Pages/FRONT_END/Global/BlogSliderSection.jsx`
- Modify: `src/app/(frontend)/page.js`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Make `BlogSection` own `stagger-right` unconditionally**

Remove the `entrance` parameter and all conditional roots. Use one coordinated structure:

```jsx
export default function BlogSection({ blogs = [], title = 'Your Guide', navigationId = 'blog-section', className = '' }) {
  const items = blogs.map((blog) => mapBlogToItemCard(blog));
  if (!items.length) return null;

  return (
    <Reveal as="section" initialHidden data-carousel-section-entrance="stagger-right" className={`container-page flex flex-col gap-6 md:gap-8 pb-10 md:pb-16 lg:pb-24 ${className}`}>
      <div data-carousel-section-header className="flex items-center justify-between">
        <SectionHeader title={title} />
        <div className="hidden sm:flex items-center gap-2">
          <button type="button" className={`${navigationId}-prev ${COMPACT_SLIDER_NAV_BUTTON_CLASS}`} aria-label="Previous blog post">
            <ChevronLeft className="size-4" />
          </button>
          <button type="button" className={`${navigationId}-next ${COMPACT_SLIDER_NAV_BUTTON_CLASS}`} aria-label="Next blog post">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div>
        <CarouselShell
          items={items}
          navigationPrefix={navigationId}
          breakpoints={BLOG_BREAKPOINTS}
          slideClassName="!h-auto"
          showMobilePagination
          entrance="stagger-right"
          observeReveal={false}
          renderSlide={(item) => <ItemCard href={item.href} image={item.image} title={item.title} category={item.category} publishedAt={item.publishedAt} variant="compact" />}
        />
      </div>
    </Reveal>
  );
}
```

Update the JSDoc to remove the obsolete entrance parameter. Keep all mapping, card, navigation, breakpoint, spacing, and empty-list behavior unchanged.

- [ ] **Step 2: Remove caller-specific animation props**

In `src/app/(frontend)/page.js`, remove `entrance="editorial-right"` from Your Guide. In `BlogSliderSection.jsx`, remove `className="weelp-fade-up"` from Latest Blogs. Home Gold and city callers require no changes because they already omit entrance props.

- [ ] **Step 3: Retire `editorial-right` from `CarouselShell`**

Change indexed entrance detection to:

```js
const usesIndexedEntrance = entrance === 'stagger-right';
```

- [ ] **Step 4: Remove guide-only CSS and preserve observation fallback**

Delete `@keyframes weelpGuideCardReveal` and every selector rooted at `[data-guide-section-entrance='editorial-right']`, including desktop overrides, reveal-bypass resets, and reduced-motion resets. Keep the generic `stagger-right` and reduced-motion selectors, and add the shared bypass rule:

```css
[data-carousel-section-entrance='stagger-right'][data-reveal-motion='bypassed'] [data-carousel-section-header],
[data-carousel-section-entrance='stagger-right'][data-reveal-motion='bypassed'] .swiper-slide {
  opacity: 1;
  transform: none;
  animation: none;
  animation-delay: 0ms;
  will-change: auto;
}
```

- [ ] **Step 5: Run the focused tests and verify GREEN**

Run the Task 1 command.

Expected: all suites pass with zero failures.

### Task 3: Review, verify, and ship

**Files:**

- Modify only files named by concrete review findings.

- [ ] **Step 1: Apply `error-handling-patterns`**

Confirm the existing empty-list early return and blog-fetch error behavior remain unchanged; this motion-only change introduces no new failure boundary.

- [ ] **Step 2: Run static verification**

```bash
npm run type-check
npm run lint
git diff --check
```

Expected: every command exits 0 and the dark-mode guard reports no new hardcoded colors.

- [ ] **Step 3: Run the mandatory code-review and simplify gates**

Dispatch the project code-reviewer agent against the complete diff. Fix every requested critical, major, or otherwise blocking finding, then re-review. Invoke `simplify` if available; otherwise record its absence and perform an inline duplication/clarity review.

- [ ] **Step 4: Verify in the visible local browser**

Open the site visibly first with `agent-browser --session weelp-visible --headed open http://localhost:3000`. If Chromium's Linux sandbox blocks launch, restart the same headed session with the documented `--args "--no-sandbox"` fallback and report it. Refresh and scroll Your Guide into view; confirm its section and carousel markers are `stagger-right`. Open a local city page that renders Blogs and confirm the same markers. Open `/blogs` and confirm Latest Blogs uses the shared entrance without a second `weelp-fade-up` class. Do not use production.

- [ ] **Step 5: Repeat focused tests, type-check, lint, and diff check**

Run the Task 1 Jest command, `npm run type-check`, `npm run lint`, `npm run build`, and `git diff --check` after all review-driven edits.

- [ ] **Step 6: Commit and push `main`**

Commit only the scoped source/test/plan changes with:

```bash
git status --short
git add -- \
  'src/app/(frontend)/page.js' \
  'src/app/(frontend)/home-gold/__tests__/page.test.jsx' \
  'src/app/(frontend)/cities/[city]/__tests__/page.test.jsx' \
  'src/app/components/Pages/FRONT_END/Global/BlogSliderSection.jsx' \
  'src/app/components/Pages/FRONT_END/Global/__tests__/BlogSliderSection.test.jsx' \
  'src/app/components/ui/BlogSection.jsx' \
  'src/app/components/ui/CarouselShell.jsx' \
  'src/app/components/ui/__tests__/BlogSection.test.jsx' \
  'src/app/components/ui/__tests__/BlogSectionMotionStyles.test.js' \
  'src/app/components/ui/__tests__/CarouselMotionStyles.test.js' \
  'src/app/components/ui/__tests__/CarouselShell.test.jsx' \
  'src/app/globals.css' \
  'docs/superpowers/plans/2026-08-26-blog-carousel-stagger-right.md'
git diff --cached --check
git diff --cached --stat
git commit -m "Unify blog carousel entrance motion"
git push origin main
```

Confirm `HEAD`, `origin/main`, and a clean worktree point to the same commit.
