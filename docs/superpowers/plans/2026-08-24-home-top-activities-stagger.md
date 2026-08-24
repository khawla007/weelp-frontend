# Home Top Activities Stagger Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the homepage `Top activities` carousel a one-time, right-origin card cascade that complements the Steel Nova-inspired hero motion without changing any carousel interaction or other page.

**Architecture:** Add an opt-in `stagger-right` entrance at the homepage call site and let `ProductSliderSection` replace its two nested reveal observers with one section-level `Reveal` root for that mode. The shared root drives a scoped header lift and card cascade; `CarouselShell` skips its own observer only for this opt-in mode while still assigning capped delay indexes to the `SwiperSlide` elements it owns. Swiper's wrapper transform remains untouched.

**Tech Stack:** Next.js 16 App Router, React 19, JavaScript/JSX, Swiper, Tailwind CSS, plain CSS keyframes, Jest, React Testing Library.

Spec: `docs/superpowers/specs/2026-08-24-home-top-activities-stagger-design.md`

---

## File map

- Modify `src/app/(frontend)/page.js`: opt the homepage `Top activities` section into `stagger-right`.
- Modify `src/app/(frontend)/__tests__/page.test.jsx`: prove only the homepage call requests the animation.
- Modify `src/app/components/ui/ProductSliderSection.jsx`: use one opt-in section-level reveal root and mark the header for its scoped lift.
- Modify `src/app/components/ui/__tests__/ProductSliderSection.test.jsx`: prove the shared-root contract while retaining default behavior.
- Modify `src/app/components/ui/CarouselShell.jsx`: optionally skip its observer and assign capped slide-delay indexes.
- Modify `src/app/components/ui/__tests__/CarouselShell.test.jsx`: lock observer ownership, index cap, and unchanged default reveal.
- Create `src/app/components/ui/__tests__/CarouselMotionStyles.test.js`: lock exact motion and reduced-motion CSS contracts.
- Modify `src/app/globals.css`: define the 32-pixel/0.985-scale, 850-millisecond stagger and its reduced-motion reset.

## Required execution workflow

Before implementation, invoke `test-driven-development`, `next-best-practices`, `vercel-react-best-practices`, and `vercel-composition-patterns`. Execute with `executing-plans`. After production-code changes, invoke `error-handling-patterns`, then run focused tests, type-check, lint, and a named visible-browser verification. When implementation is complete, run the required code-reviewer and simplification gates, address findings, rerun verification, commit on `main`, and push `main`.

### Task 1: Lock the opt-in component contract

**Files:**

- Modify: `src/app/(frontend)/__tests__/page.test.jsx`
- Modify: `src/app/components/ui/__tests__/ProductSliderSection.test.jsx`
- Modify: `src/app/components/ui/__tests__/CarouselShell.test.jsx`
- Create: `src/app/components/ui/__tests__/CarouselMotionStyles.test.js`

- [ ] **Step 1: Add the failing homepage opt-in test**

Append this test to `src/app/(frontend)/__tests__/page.test.jsx`:

```jsx
test('opts the homepage Top activities carousel into the staggered entrance', async () => {
  const activities = [{ id: 1, item_type: 'activity', name: 'Desert safari', slug: 'desert-safari', city_slug: 'dubai' }];

  getAllFeaturedActivities.mockResolvedValue(activities);
  getAllFeaturedCities.mockResolvedValue([]);
  getPublicReviews.mockResolvedValue({ data: [] });
  publicApi.get.mockResolvedValue({ data: { data: [] } });

  const page = await HomePage();
  const activitiesSection = Children.toArray(page.props.children).find((child) => child.props?.title === 'Top activities');

  expect(activitiesSection).toBeDefined();
  expect(activitiesSection.props.carouselEntrance).toBe('stagger-right');
});
```

- [ ] **Step 2: Make the ProductSliderSection carousel mock inspectable**

Replace the current `CarouselShell` mock in `ProductSliderSection.test.jsx` with:

```jsx
const mockCarouselShell = jest.fn(() => <div data-testid="carousel-shell" />);

jest.mock('../CarouselShell', () => ({
  __esModule: true,
  default: (props) => mockCarouselShell(props),
}));

beforeEach(() => mockCarouselShell.mockClear());
```

Update the `Reveal` mock to forward structural props while remaining inspectable:

```jsx
jest.mock(
  '../Reveal',
  () =>
    function MockReveal({ as: Tag = 'div', children, className = '', initialHidden, ...props }) {
      return (
        <Tag className={className} data-initial-hidden={initialHidden ? 'true' : undefined} {...props}>
          {children}
        </Tag>
      );
    },
);
```

Append this failing test:

```jsx
test('uses one section reveal to coordinate the staggered header and carousel', () => {
  const { rerender } = render(<ProductSliderSection items={items} title="Top activities" navigationId="top-activities" />);
  expect(mockCarouselShell.mock.calls.at(-1)[0].observeReveal).toBeUndefined();

  rerender(<ProductSliderSection items={items} title="Top activities" navigationId="top-activities" carouselEntrance="stagger-right" />);

  const section = screen.getByRole('region', { name: 'Top activities' });
  expect(section).toHaveAttribute('data-carousel-section-entrance', 'stagger-right');
  expect(section).toHaveAttribute('data-initial-hidden', 'true');
  expect(section.querySelector('[data-carousel-section-header]')).toBeInTheDocument();
  expect(mockCarouselShell.mock.calls.at(-1)[0]).toEqual(expect.objectContaining({ entrance: 'stagger-right', observeReveal: false }));
});
```

Add `aria-label={title}` to the section-root implementation in Task 2 so this structural assertion and the real section landmark stay accessible.

- [ ] **Step 3: Add the failing CarouselShell contract test**

Append this test to `CarouselShell.test.jsx`:

```jsx
test('emits a stagger-right entrance with capped slide delay indexes', () => {
  const items = Array.from({ length: 7 }, (_, index) => ({ id: index + 1, title: `Card ${index + 1}` }));
  render(<CarouselShell items={items} entrance="stagger-right" observeReveal={false} renderSlide={(item) => <article>{item.title}</article>} />);

  const root = screen.getByText('Card 1').closest('.carousel-shell-wrapper');
  const slides = root.querySelectorAll('.swiper-slide');

  expect(root).toHaveAttribute('data-carousel-entrance', 'stagger-right');
  expect(root).not.toHaveAttribute('data-reveal');
  expect(slides[0].style.getPropertyValue('--weelp-carousel-reveal-index')).toBe('0');
  expect(slides[4].style.getPropertyValue('--weelp-carousel-reveal-index')).toBe('4');
  expect(slides[6].style.getPropertyValue('--weelp-carousel-reveal-index')).toBe('4');
});
```

Keep the existing `carousel reveals as one unit without per-card reveal wrappers` test unchanged; it protects all non-opted-in callers.

- [ ] **Step 4: Add the failing CSS contract test**

Create `CarouselMotionStyles.test.js`:

```js
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');

test('defines the approved homepage carousel entrance contract', () => {
  expect(css).toContain('@keyframes weelpCarouselRevealRight');
  expect(css).toContain('transform: translate3d(32px, 0, 0) scale(0.985)');
  expect(css).toContain("[data-carousel-section-entrance='stagger-right'][data-reveal='pending'] [data-carousel-section-header]");
  expect(css).toContain("[data-carousel-section-entrance='stagger-right'][data-reveal='shown'] .swiper-slide");
  expect(css).toContain('animation: weelpCarouselRevealRight 850ms var(--weelp-ease-out) both');
  expect(css).toContain('animation-delay: calc(var(--weelp-carousel-reveal-index, 0) * 90ms)');
});

test('removes carousel entrance motion for reduced-motion users', () => {
  const reducedMotionBlock = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));
  const reducedCarouselRule =
    /\[data-carousel-section-entrance='stagger-right'\]\[data-reveal\] \[data-carousel-section-header\],\s*\[data-carousel-section-entrance='stagger-right'\]\[data-reveal\] \.swiper-slide\s*\{[^}]*opacity: 1;[^}]*transform: none;[^}]*animation: none;[^}]*will-change: auto;[^}]*\}/s;

  expect(reducedMotionBlock).toMatch(reducedCarouselRule);
});
```

- [ ] **Step 5: Run the focused tests and confirm failure**

Run:

```bash
npx jest --runTestsByPath \
  'src/app/(frontend)/__tests__/page.test.jsx' \
  src/app/components/ui/__tests__/ProductSliderSection.test.jsx \
  src/app/components/ui/__tests__/CarouselShell.test.jsx \
  src/app/components/ui/__tests__/CarouselMotionStyles.test.js \
  --runInBand
```

Expected: FAIL on the new section-level reveal, observer ownership, entrance/index, and CSS contract assertions; existing tests remain green.

### Task 2: Implement the opt-in stagger

**Files:**

- Modify: `src/app/(frontend)/page.js`
- Modify: `src/app/components/ui/ProductSliderSection.jsx`
- Modify: `src/app/components/ui/CarouselShell.jsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Opt in at the homepage call site**

Expand the existing `ProductSliderSection` call in `page.js` and add only this prop:

```jsx
carouselEntrance = 'stagger-right';
```

Do not add the prop to `/home-gold` or any shared/city carousel.

- [ ] **Step 2: Add the single section-level reveal**

Add `carouselEntrance` to the `ProductSliderSection` parameter list and its JSDoc:

```jsx
 * @param {'stagger-right'} [carouselEntrance] - Optional slide entrance treatment
```

Define:

```jsx
const usesStaggeredEntrance = carouselEntrance === 'stagger-right';
```

Use `Reveal as="section" initialHidden` as the outer section only when `usesStaggeredEntrance`; otherwise retain the existing plain `<section>`. Give the opted-in root `aria-label={title}` and `data-carousel-section-entrance={carouselEntrance}`. Use a plain `<div data-carousel-section-header>` for the header in that mode; otherwise retain its existing `Reveal initialHidden variant="lift"`. Pass these props to `CarouselShell`:

```jsx
entrance={usesStaggeredEntrance ? carouselEntrance : undefined}
observeReveal={usesStaggeredEntrance ? false : undefined}
```

Keep all existing classes, buttons, CTA behavior, and default caller markup unchanged.

- [ ] **Step 3: Add scoped slide indexes in CarouselShell**

Add `entrance` and `observeReveal = true` to `CarouselShell`'s parameter list and define:

```jsx
const usesStaggeredEntrance = entrance === 'stagger-right';
```

Use a conditional root that preserves the existing `Reveal` by default and becomes a plain `div` when its parent owns the observer:

```jsx
const Root = observeReveal ? Reveal : 'div';
const revealProps = observeReveal ? { initialHidden: true, variant: 'lift' } : {};

<Root
  {...revealProps}
  data-carousel-entrance={usesStaggeredEntrance ? entrance : undefined}
  className={`carousel-shell-wrapper ${showMobilePagination ? 'has-mobile-pagination' : ''}`}
>
```

Give each `SwiperSlide` a capped custom property without replacing any existing slide style:

```jsx
style={usesStaggeredEntrance ? { '--weelp-carousel-reveal-index': Math.min(index, 4) } : undefined}
```

- [ ] **Step 4: Add the scoped CSS animation**

Place this keyframe next to the existing directional reveal keyframes in `globals.css`:

```css
@keyframes weelpCarouselRevealRight {
  from {
    opacity: 0;
    transform: translate3d(32px, 0, 0) scale(0.985);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}
```

Place these scoped rules beside the existing `[data-reveal-cards]` rules. The opted-in section root stays visually present while its marked descendants consume the single shared state:

```css
[data-carousel-section-entrance='stagger-right'][data-reveal='pending'],
[data-carousel-section-entrance='stagger-right'][data-reveal='shown'] {
  opacity: 1;
  transform: none;
  animation: none;
}

[data-carousel-section-entrance='stagger-right'][data-reveal='pending'] [data-carousel-section-header] {
  opacity: 0;
  transform: translate3d(0, 40px, 0);
  will-change: transform, opacity;
}

[data-carousel-section-entrance='stagger-right'][data-reveal='shown'] [data-carousel-section-header] {
  animation: weelpRevealUp var(--weelp-duration-reveal) var(--weelp-ease-out) both;
}

[data-carousel-section-entrance='stagger-right'][data-reveal='pending'] .swiper-slide {
  opacity: 0;
  transform: translate3d(32px, 0, 0) scale(0.985);
  will-change: transform, opacity;
}

[data-carousel-section-entrance='stagger-right'][data-reveal='shown'] .swiper-slide {
  animation: weelpCarouselRevealRight 850ms var(--weelp-ease-out) both;
  animation-delay: calc(var(--weelp-carousel-reveal-index, 0) * 90ms);
}
```

Add this selector to the existing reduced-motion reset list:

```css
[data-carousel-section-entrance='stagger-right'] [data-carousel-section-header],
[data-carousel-section-entrance='stagger-right'] .swiper-slide,
```

- [ ] **Step 5: Run focused tests and confirm they pass**

Run:

```bash
npx jest --runTestsByPath \
  'src/app/(frontend)/__tests__/page.test.jsx' \
  src/app/components/ui/__tests__/ProductSliderSection.test.jsx \
  src/app/components/ui/__tests__/CarouselShell.test.jsx \
  src/app/components/ui/__tests__/CarouselMotionStyles.test.js \
  --runInBand
```

Expected: PASS with all new and existing assertions green.

### Task 3: Required review and verification gates

**Files:** All files changed by Tasks 1 and 2.

- [ ] **Step 1: Review error handling**

Invoke `error-handling-patterns`. Confirm the change introduces no asynchronous work, error state, or new failure boundary; invalid or absent entrance values retain the existing whole-carousel lift.

- [ ] **Step 2: Run static verification**

Run:

```bash
npm run type-check
npm run lint
git diff --check
```

Expected: all commands exit 0 with no warnings or whitespace errors.

- [ ] **Step 3: Verify in the required visible browser**

Use the existing named headed session at `http://localhost:3000`, reload at the top, and scroll into `Top activities`.

Verify:

1. The header lifts once while cards cascade horizontally with approximately 90-millisecond spacing.
2. At desktop width, each initially visible card is present by the end of the 1.21-second total sequence.
3. Arrow navigation still moves the Swiper track in 300 milliseconds and does not replay the entrance.
4. Scrolling away and back does not replay the entrance.
5. Mobile shows the first card and its peek without waiting for off-screen cards.
6. Emulated reduced motion shows every card immediately with no transform or animation.
7. The console has no hydration, React, or Swiper errors.

- [ ] **Step 4: Run the code-reviewer gate**

Dispatch the required code-reviewer agent against the spec, plan, and working-tree diff. Fix critical or important findings, then re-review until clear.

- [ ] **Step 5: Run simplification and final verification**

Invoke the available simplification workflow. Keep the prop surface opt-in and remove any unnecessary branching without broadening the effect. Rerun focused tests, type-check, lint, `git diff --check`, and the visible-browser checks after any simplification edit.

- [ ] **Step 6: Commit and push main**

After every gate passes:

```bash
git add -u
git add docs/superpowers/plans/2026-08-24-home-top-activities-stagger.md
git commit -m "feat(home): stagger activity carousel entrance"
git push origin main
```

Expected: the commit lands on `main`, the working tree is clean, and `origin/main` contains the implementation.

## Planner self-review

- **Spec coverage:** homepage-only opt-in, one shared reveal trigger, 32-pixel translation, 0.985 scale, 850-millisecond duration, 90-millisecond stagger, cap at index four, once-only observer behavior, unchanged 300-millisecond Swiper navigation, CSS contract coverage, and reduced-motion reset all have explicit implementation and verification steps.
- **Placeholder scan:** no `TBD`, `TODO`, deferred implementation, or ambiguous “handle as needed” steps remain.
- **Type and naming consistency:** `carouselEntrance` is the section-facing prop, `entrance` is the shell-facing prop, and the only accepted value used across route, components, tests, and CSS is `stagger-right`.
