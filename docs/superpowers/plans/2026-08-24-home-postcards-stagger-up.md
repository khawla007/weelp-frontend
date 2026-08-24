# Home Postcards Stagger Up Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the main homepage `Postcards from travelers.` cards a coordinated one-time stagger-up entrance without changing Home Gold or the testimonial slider's autoplay behavior.

**Architecture:** The main homepage opts `TestimonialSection` into `stagger-up`. Its existing outer `Reveal` becomes the single observer, while a marked heading and an observer-free `TestmonialSlider` read the parent's state. The slider marks slides with capped delay indexes, and scoped global CSS supplies the vertical keyframe and reduced-motion reset.

**Tech Stack:** Next.js 16 App Router, React 19, JavaScript/JSX, Swiper Autoplay, Jest, Testing Library, CSS reveal primitives

---

## Required workflow before implementation

Before editing application, test, or CSS files:

1. invoke `superpowers:executing-plans` to execute this reviewed plan;
2. invoke `superpowers:test-driven-development` before writing failing tests;
3. invoke `next-best-practices`, `vercel-react-best-practices`, and `vercel-composition-patterns` before changing the Next.js/React files;
4. commit the reviewed plan and approved spec status:

```bash
git add docs/superpowers/plans/2026-08-24-home-postcards-stagger-up.md docs/superpowers/specs/2026-08-24-home-postcards-stagger-up-design.md
git commit -m "docs: plan postcards stagger"
```

After application, test, or CSS changes, invoke `error-handling-patterns` before type-check, lint, tests, and the visible-browser verification. After implementation verification, dispatch the required code-review agent and use `simplify` before committing application code.

## File map

- Modify `src/app/(frontend)/page.js` and its test to opt in only the main homepage.
- Modify `src/app/(frontend)/home-gold/__tests__/page.test.jsx` to lock Home Gold out of the new option.
- Modify `src/app/components/Pages/FRONT_END/Global/TestimonialSection.jsx` and create its component test to coordinate one observer.
- Modify `src/app/components/sliders/TestimonialSlider.jsx` and create its component test to support observer ownership and capped delay indexes without changing autoplay.
- Modify `src/app/globals.css` and create `src/app/components/ui/__tests__/TestimonialMotionStyles.test.js` for the scoped motion contract.

### Task 1: Lock route and component contracts

**Files:**

- Modify: `src/app/(frontend)/__tests__/page.test.jsx`
- Modify: `src/app/(frontend)/home-gold/__tests__/page.test.jsx`
- Create: `src/app/components/Pages/FRONT_END/Global/__tests__/TestimonialSection.test.jsx`
- Create: `src/app/components/sliders/__tests__/TestimonialSlider.test.jsx`
- Create: `src/app/components/ui/__tests__/TestimonialMotionStyles.test.js`

- [ ] **Step 1: Add the failing main-homepage opt-in test**

Append this test to `src/app/(frontend)/__tests__/page.test.jsx`:

```jsx
test('opts the homepage Postcards carousel into the stagger-up entrance', async () => {
  const reviews = [{ id: 1, review_text: 'Wonderful trip' }];

  getAllFeaturedActivities.mockResolvedValue([]);
  getAllFeaturedCities.mockResolvedValue([]);
  getPublicReviews.mockResolvedValue({ data: reviews });
  publicApi.get.mockResolvedValue({ data: { data: [] } });

  const page = await HomePage();
  const testimonialSection = Children.toArray(page.props.children).find((child) => child.props?.reviews === reviews);

  expect(testimonialSection).toBeDefined();
  expect(testimonialSection.props.entrance).toBe('stagger-up');
});
```

- [ ] **Step 2: Lock Home Gold out of the new entrance**

In the `preserves non-target section order and key props` test in `src/app/(frontend)/home-gold/__tests__/page.test.jsx`, add this assertion after the existing review-prop assertion:

```jsx
expect(children[3].props.entrance).toBeUndefined();
```

This assertion passes before and after implementation and guards route isolation while the main-homepage test supplies the failing route contract.

- [ ] **Step 3: Create failing `TestimonialSection` observer tests**

Create `src/app/components/Pages/FRONT_END/Global/__tests__/TestimonialSection.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react';

import TestimonialSection from '../TestimonialSection';

const mockTestimonialSlider = jest.fn(() => <div data-testid="testimonial-slider" />);
const mockReveal = jest.fn(({ children, className = '', as: Component = 'div', initialHidden, ...props }) => (
  <Component className={className} data-initial-hidden={initialHidden ? 'true' : undefined} {...props}>
    {children}
  </Component>
));

jest.mock('@/app/components/sliders/TestimonialSlider', () => ({
  TestmonialSlider: (props) => mockTestimonialSlider(props),
}));

jest.mock('@/app/components/ui/Reveal', () => ({
  __esModule: true,
  default: (props) => mockReveal(props),
}));

const reviews = [{ id: 1, review_text: 'Wonderful trip' }];

beforeEach(() => {
  mockTestimonialSlider.mockClear();
  mockReveal.mockClear();
});

test('preserves independent heading and slider reveals by default', () => {
  const { container } = render(<TestimonialSection reviews={reviews} />);

  expect(mockReveal).toHaveBeenCalledTimes(2);
  expect(mockReveal.mock.calls[0][0]).toEqual(expect.objectContaining({ as: 'section', initialHidden: true }));
  expect(mockReveal.mock.calls[1][0]).toEqual(expect.objectContaining({ as: 'h2', variant: 'lift' }));
  expect(container.querySelector('[data-testimonial-section-entrance]')).not.toBeInTheDocument();
  expect(mockTestimonialSlider.mock.calls.at(-1)[0].entrance).toBeUndefined();
  expect(mockTestimonialSlider.mock.calls.at(-1)[0].observeReveal).toBeUndefined();
});

test('uses one section reveal to coordinate the stagger-up heading and cards', () => {
  render(<TestimonialSection reviews={reviews} entrance="stagger-up" />);

  const section = screen.getByRole('region', { name: 'Postcards from travelers.' });
  expect(mockReveal).toHaveBeenCalledTimes(1);
  expect(section).toHaveAttribute('data-testimonial-section-entrance', 'stagger-up');
  expect(section).toHaveAttribute('data-initial-hidden', 'true');
  expect(section.querySelector('[data-testimonial-section-heading]')).toBeInTheDocument();
  expect(mockTestimonialSlider.mock.calls.at(-1)[0]).toEqual(expect.objectContaining({ entrance: 'stagger-up', observeReveal: false }));
});
```

- [ ] **Step 4: Create failing slider ownership, delay, and autoplay tests**

Create `src/app/components/sliders/__tests__/TestimonialSlider.test.jsx` with Swiper, Reveal, and media-query test doubles:

```jsx
import { render, screen } from '@testing-library/react';

import { TestmonialSlider } from '../TestimonialSlider';

let latestSwiperProps;
const mockReveal = jest.fn(({ children, className = '', ...props }) => (
  <div className={className} data-testid="testimonial-slider-reveal" {...props}>
    {children}
  </div>
));

jest.mock('swiper/react', () => ({
  Swiper: ({ children, className, ...props }) => {
    latestSwiperProps = props;
    return <div className={`swiper ${className || ''}`}>{children}</div>;
  },
  SwiperSlide: ({ children, style }) => (
    <div className="swiper-slide" style={style}>
      {children}
    </div>
  ),
}));

jest.mock('swiper/modules', () => ({ Autoplay: {} }));
jest.mock('@/app/components/Testimonial', () => ({
  __esModule: true,
  default: ({ username }) => <article>{username}</article>,
}));
jest.mock('@/app/components/ui/Reveal', () => ({
  __esModule: true,
  default: (props) => mockReveal(props),
}));

const reviews = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  user: { name: `Traveler ${index + 1}` },
}));

const setReducedMotion = (matches) => {
  window.matchMedia = jest.fn().mockReturnValue({
    matches,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  });
};

beforeEach(() => {
  latestSwiperProps = undefined;
  mockReveal.mockClear();
  setReducedMotion(false);
});

test('preserves the existing Reveal wrapper and autoplay configuration by default', () => {
  render(<TestmonialSlider reviews={reviews} />);

  expect(mockReveal).toHaveBeenCalledTimes(1);
  expect(mockReveal.mock.calls[0][0]).toEqual(expect.objectContaining({ initialHidden: true, variant: 'lift' }));
  expect(latestSwiperProps.speed).toBe(8000);
  expect(latestSwiperProps.autoplay).toEqual(expect.objectContaining({ delay: 0, disableOnInteraction: true, pauseOnMouseEnter: true }));
});

test('uses a plain marked wrapper and caps stagger-up indexes at three', () => {
  render(<TestmonialSlider reviews={reviews} entrance="stagger-up" observeReveal={false} />);

  const root = screen.getByText('Traveler 1').closest('.testimonial-slider');
  const slides = root.querySelectorAll('.swiper-slide');
  expect(mockReveal).not.toHaveBeenCalled();
  expect(root).toHaveAttribute('data-testimonial-entrance', 'stagger-up');
  expect(root).not.toHaveAttribute('data-reveal');
  expect(slides[0].style.getPropertyValue('--weelp-testimonial-reveal-index')).toBe('0');
  expect(slides[3].style.getPropertyValue('--weelp-testimonial-reveal-index')).toBe('3');
  expect(slides[5].style.getPropertyValue('--weelp-testimonial-reveal-index')).toBe('3');
  expect(latestSwiperProps.speed).toBe(8000);
  expect(latestSwiperProps.autoplay).toEqual(expect.objectContaining({ delay: 0, disableOnInteraction: true, pauseOnMouseEnter: true }));
  expect(latestSwiperProps.loop).toBe(true);
});

test('retains the existing reduced-motion autoplay behavior', () => {
  setReducedMotion(true);
  render(<TestmonialSlider reviews={reviews} entrance="stagger-up" observeReveal={false} />);

  expect(latestSwiperProps.autoplay).toBe(false);
  expect(latestSwiperProps.speed).toBe(0);
});
```

- [ ] **Step 5: Create the failing CSS contract test**

Create `src/app/components/ui/__tests__/TestimonialMotionStyles.test.js`:

```js
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');

test('defines the approved homepage testimonial stagger-up contract', () => {
  expect(css).toContain('@keyframes weelpTestimonialRevealUp');
  expect(css).toContain('transform: translate3d(0, 16px, 0) scale(0.985)');
  expect(css).toContain("[data-testimonial-section-entrance='stagger-up'][data-reveal='pending'] [data-testimonial-section-heading]");
  expect(css).toContain("[data-testimonial-section-entrance='stagger-up'][data-reveal='shown'] .swiper-slide");
  expect(css).toContain('animation: weelpTestimonialRevealUp 850ms var(--weelp-ease-out) both');
  expect(css).toContain('animation-delay: calc(var(--weelp-testimonial-reveal-index, 0) * 90ms)');
});

test('removes testimonial entrance motion for reduced-motion users', () => {
  const reducedMotionBlock = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));
  const reducedTestimonialRule =
    /\[data-testimonial-section-entrance='stagger-up'\]\[data-reveal\] \[data-testimonial-section-heading\],\s*\[data-testimonial-section-entrance='stagger-up'\]\[data-reveal\] \.swiper-slide\s*\{[^}]*opacity: 1;[^}]*transform: none;[^}]*animation: none;[^}]*will-change: auto;[^}]*\}/s;

  expect(reducedMotionBlock).toMatch(reducedTestimonialRule);
});
```

- [ ] **Step 6: Run the new contract suites and verify the intended failures**

Run:

```bash
npx jest --runTestsByPath 'src/app/(frontend)/__tests__/page.test.jsx' 'src/app/(frontend)/home-gold/__tests__/page.test.jsx' src/app/components/Pages/FRONT_END/Global/__tests__/TestimonialSection.test.jsx src/app/components/sliders/__tests__/TestimonialSlider.test.jsx src/app/components/ui/__tests__/TestimonialMotionStyles.test.js --runInBand
```

Expected: the Home Gold isolation assertion passes, while the main route prop, coordinated section hooks, slider ownership/indexes, and CSS motion-contract assertions fail because `stagger-up` is not implemented.

### Task 2: Implement the coordinated testimonial entrance

**Files:**

- Modify: `src/app/(frontend)/page.js`
- Modify: `src/app/components/Pages/FRONT_END/Global/TestimonialSection.jsx`
- Modify: `src/app/components/sliders/TestimonialSlider.jsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Opt in only the main homepage**

Replace the main homepage call with:

```jsx
<TestimonialSection reviews={reviews} entrance="stagger-up" />
```

Leave `src/app/(frontend)/home-gold/page.js` unchanged.

- [ ] **Step 2: Coordinate the section and heading from one observer**

Replace `TestimonialSection.jsx` with:

```jsx
import { TestmonialSlider } from '../../../sliders/TestimonialSlider';
import Reveal from '@/app/components/ui/Reveal';

const SECTION_TITLE = 'Postcards from travelers.';

const TestimonialSection = ({ reviews = [], entrance }) => {
  const usesStaggeredEntrance = entrance === 'stagger-up';
  const HeadingRoot = usesStaggeredEntrance ? 'h2' : Reveal;
  const sectionRootProps = usesStaggeredEntrance
    ? {
        'aria-label': SECTION_TITLE,
        'data-testimonial-section-entrance': entrance,
      }
    : {};
  const headingRootProps = usesStaggeredEntrance ? { 'data-testimonial-section-heading': '' } : { as: 'h2', variant: 'lift' };

  return (
    <Reveal as="section" initialHidden {...sectionRootProps} className="container-page relative flex flex-col gap-8 pb-12 md:pb-16 lg:pb-24">
      <HeadingRoot {...headingRootProps} className="text-center text-[28px] font-medium text-foreground">
        {SECTION_TITLE}
      </HeadingRoot>
      <TestmonialSlider reviews={reviews} entrance={usesStaggeredEntrance ? entrance : undefined} observeReveal={usesStaggeredEntrance ? false : undefined} />
    </Reveal>
  );
};

export default TestimonialSection;
```

- [ ] **Step 3: Add observer ownership and capped indexes to the slider**

Change the slider signature and root setup:

```jsx
export const TestmonialSlider = ({ reviews = [], entrance, observeReveal = true }) => {
```

After the empty-review guard, add:

```jsx
const usesStaggeredEntrance = entrance === 'stagger-up';
const Root = observeReveal ? Reveal : 'div';
const revealProps = observeReveal ? { initialHidden: true, variant: 'lift' } : {};
```

Replace the root tags with:

```jsx
<Root {...revealProps} data-testimonial-entrance={usesStaggeredEntrance ? entrance : undefined} className="carousel-shell-wrapper testimonial-slider">
```

and `</Root>`. Change the slide map to include a capped index:

```jsx
{reviews.map((review, index) => (
  <SwiperSlide key={review.id} style={usesStaggeredEntrance ? { '--weelp-testimonial-reveal-index': Math.min(index, 3) } : undefined}>
```

Do not change `autoplayConfig`, Swiper `speed`, loop, breakpoints, spacing, or card props.

- [ ] **Step 4: Add the scoped keyframe and section rules**

In `src/app/globals.css`, add alongside `weelpCarouselRevealRight`:

```css
@keyframes weelpTestimonialRevealUp {
  from {
    opacity: 0;
    transform: translate3d(0, 16px, 0) scale(0.985);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}
```

Add alongside the existing carousel entrance rules:

Keep the vertical travel at or below the carousel wrapper's 16-pixel vertical padding. A larger transform makes the shared `overflow-x: hidden` wrapper compute `overflow-y: auto` and creates an internal scrollbar while the section is pending.

```css
[data-testimonial-section-entrance='stagger-up'][data-reveal='pending'],
[data-testimonial-section-entrance='stagger-up'][data-reveal='shown'] {
  opacity: 1;
  transform: none;
  animation: none;
}

[data-testimonial-section-entrance='stagger-up'][data-reveal='pending'] [data-testimonial-section-heading] {
  opacity: 0;
  transform: translate3d(0, 40px, 0);
  will-change: transform, opacity;
}

[data-testimonial-section-entrance='stagger-up'][data-reveal='shown'] [data-testimonial-section-heading] {
  animation: weelpRevealUp var(--weelp-duration-reveal) var(--weelp-ease-out) both;
}

[data-testimonial-section-entrance='stagger-up'][data-reveal='pending'] .swiper-slide {
  opacity: 0;
  transform: translate3d(0, 16px, 0) scale(0.985);
  will-change: transform, opacity;
}

[data-testimonial-section-entrance='stagger-up'][data-reveal='shown'] .swiper-slide {
  animation: weelpTestimonialRevealUp 850ms var(--weelp-ease-out) both;
  animation-delay: calc(var(--weelp-testimonial-reveal-index, 0) * 90ms);
}
```

Append these selectors to the existing grouped reduced-motion rule before its declaration block:

```css
[data-testimonial-section-entrance='stagger-up'][data-reveal] [data-testimonial-section-heading],
[data-testimonial-section-entrance='stagger-up'][data-reveal] .swiper-slide
```

This keeps the stronger section-state specificity needed to override pending styles.

- [ ] **Step 5: Run focused tests and verify green**

Run:

```bash
npx jest --runTestsByPath 'src/app/(frontend)/__tests__/page.test.jsx' 'src/app/(frontend)/home-gold/__tests__/page.test.jsx' src/app/components/Pages/FRONT_END/Global/__tests__/TestimonialSection.test.jsx src/app/components/sliders/__tests__/TestimonialSlider.test.jsx src/app/components/ui/__tests__/TestimonialMotionStyles.test.js src/app/components/__tests__/Testimonial.test.jsx --runInBand
```

Expected: PASS, 6 suites. This proves route isolation, observer ownership, capped delays, autoplay preservation, CSS accessibility, and testimonial-card rendering.

### Task 3: Verify and complete review gates

**Files:**

- Verify all files listed in Tasks 1 and 2.

- [ ] **Step 1: Invoke the required error-handling review**

Use `error-handling-patterns` to inspect empty reviews, unsupported or omitted entrance values, media-query changes, observer ownership, and non-serializable props. Expected: empty reviews still return `null` in the slider; unsupported values retain the current reveals; the server passes only a string to client components; media-query cleanup remains unchanged.

- [ ] **Step 2: Run static verification**

```bash
npm run type-check
npm run lint
git diff --check
```

Expected: all commands exit zero with no new dark-mode findings.

- [ ] **Step 3: Run the full suite and isolate baseline failures**

```bash
npm run test:ci -- --runInBand
```

Expected for this change: all testimonial, homepage, and motion suites pass. If the existing `deepForestTheme.test.js` or `DashboardResponsiveLayout.test.js` content contracts fail, confirm their source and test files are untouched and report them without editing unrelated code.

- [ ] **Step 4: Verify in the required visible browser**

Use the named headed session at `http://localhost:3000`:

```bash
agent-browser --session weelp-postcards --headed --args "--no-sandbox" open http://localhost:3000
agent-browser --session weelp-postcards set viewport 1440 900
agent-browser --session weelp-postcards set media no-preference
agent-browser --session weelp-postcards reload
```

Before scrolling, verify the Postcards section is `pending`, its heading is at opacity 0 with a 40-pixel downward transform, and its first four slides are at opacity 0 with a 16-pixel downward transform and `scale(0.985)`. Confirm the testimonial wrapper has no vertical overflow or internal scrollbar. Scroll into view and verify delays of 0, 90, 180, and 270 milliseconds; after 1.2 seconds the heading and cards must be opaque at identity transforms.

Confirm the Swiper speed remains 8000, autoplay remains enabled, the wrapper keeps moving horizontally, and the section stays `shown` after scrolling away and back. At `390x844`, confirm the single-card layout remains usable and the document has no horizontal overflow.

- [ ] **Step 5: Verify reduced motion and errors**

Set reduced motion, reload, and inspect the heading and a slide. Both must report `animation-name: none`, opacity 1, transform `none`, and `will-change: auto`; Swiper must report speed 0 and autoplay disabled. Run `agent-browser --session weelp-postcards errors` and expect no browser errors. Reset media to `no-preference` afterward.

- [ ] **Step 6: Complete code review and simplification**

Dispatch the required code-review agent over the final diff. Resolve every critical or important finding and re-review. Invoke `simplify` if available; if unavailable, perform a manual scope/duplication pass, then rerun focused tests, type-check, lint, and `git diff --check`.

- [ ] **Step 7: Commit and push directly to main**

```bash
git add -u
git add src/app/components/Pages/FRONT_END/Global/__tests__/TestimonialSection.test.jsx src/app/components/sliders/__tests__/TestimonialSlider.test.jsx src/app/components/ui/__tests__/TestimonialMotionStyles.test.js
git commit -m "feat(home): stagger testimonial card entrance"
git push origin main
```

Confirm the production build hook passes, the remote `main` update succeeds, and `git status --short` is empty.
