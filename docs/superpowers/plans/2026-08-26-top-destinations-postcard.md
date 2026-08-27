# Top Destinations Postcard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every public city card with the approved image-led Weelp Postcard and make destination carousels use the same one/two/three/four-card responsive progression as Top Activities.

**Architecture:** Keep `CityCard` as the only public destination-card renderer and `BrowseDestinationsSection` as the only destination-carousel wrapper. Remove the obsolete theme-text prop path, retain each existing subtitle mode, and let shared card tokens control borders, focus, and hover across standard and home-gold themes.

**Tech Stack:** Next.js 16 App Router, React 19, JavaScript/JSX, Tailwind CSS, Lucide React, Swiper through `CarouselShell`, Jest, React Testing Library.

---

## Required execution skills and per-change gate

Before writing the first failing test, invoke `test-driven-development`. Before editing any Next.js or React source, read and apply `next-best-practices`, `vercel-react-best-practices`, and `vercel-composition-patterns`. Execute the approved plan with `executing-plans`.

Run every command in this plan from `/run/media/ashish-khawla/Website data/Fanatic Developement/weelp/frontend`; the paths and commands below are frontend-repository-relative.

After each task that changes production code, invoke `error-handling-patterns`, run `npm run type-check`, run `npm run lint`, and verify the affected local surface in the named headed `agent-browser` session. Keep all implementation changes uncommitted until the mandatory code review, simplify/manual simplification, and fresh verification gates pass. Focused Jest commands remain the red/green proof inside each task; the full build and cross-page browser matrix remain in the final gate.

## File map

- `src/app/components/CityCard.jsx` — render the approved shared postcard card and normalize singular/plural subtitle labels.
- `src/app/components/__tests__/CityCard.test.jsx` — protect link semantics, image fallback, subtitle modes, visual contract, and action affordance.
- `src/app/components/Pages/FRONT_END/home/BrowseDestinationsSection.jsx` — mirror the product-carousel breakpoints and stop forwarding the removed text-tone prop.
- `src/app/components/Pages/FRONT_END/home/__tests__/BrowseDestinationsSection.test.jsx` — protect the shared responsive carousel contract and `CityCard` props.
- `src/app/(frontend)/page.js` and `src/app/(frontend)/__tests__/page.test.jsx` — remove the obsolete homepage prop and its assertion.
- `src/app/(frontend)/home-gold/page.js` and `src/app/(frontend)/home-gold/__tests__/page.test.jsx` — remove the obsolete home-gold prop and its assertion.
- `src/app/globals.css` — remove the destination-only home-gold hover shadow so `--weelp-card-hover-shadow` controls all shared cards.
- `src/app/__tests__/deepForestTheme.test.js` — replace the obsolete gold-hover contract with the shared-shadow contract.

### Task 0: Establish the mandatory visible localhost baseline

**Files:**

- No repository files change.

- [ ] **Step 1: Confirm the local frontend is available**

```bash
curl --max-time 20 -I http://localhost:3000
```

Expected: an HTTP response from the local Next.js frontend. If the request cannot connect, run `npm run dev` in a dedicated long-lived terminal from the frontend working directory and wait until Next.js reports port 3000 ready.

- [ ] **Step 2: Reopen the named session as an explicitly headed browser**

```bash
agent-browser --session weelp-visible close
agent-browser --session weelp-visible --headed --args "--no-sandbox" open http://localhost:3000
agent-browser --session weelp-visible get url
```

Expected: a browser window visible to the user and the final command reports `http://localhost:3000/`. Keep this named headed session open for the required after-task checks and reopen it again during final verification.

### Task 1: Lock the shared destination-carousel contract

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/home/__tests__/BrowseDestinationsSection.test.jsx`
- Modify: `src/app/components/Pages/FRONT_END/home/BrowseDestinationsSection.jsx`

- [ ] **Step 1: Write the failing responsive-contract test**

Extend the mocked `CityCard` so its received props can be inspected:

```jsx
const mockCityCard = jest.fn(({ city }) => <article>{city.name}</article>);

jest.mock('@/app/components/CityCard', () => ({
  __esModule: true,
  default: (props) => mockCityCard(props),
}));
```

Reset `mockCityCard` in `beforeEach`, then add:

```jsx
test('matches the product carousel responsive card count and spacing', () => {
  render(<BrowseDestinationsSection cities={cities} />);

  expect(mockCarouselShell.mock.calls.at(-1)[0]).toEqual(
    expect.objectContaining({
      slidesPerView: 1,
      breakpoints: {
        450: { slidesPerView: 1, spaceBetween: 18 },
        640: { slidesPerView: 2, spaceBetween: 18 },
        768: { slidesPerView: 2, spaceBetween: 18 },
        1024: { slidesPerView: 3, spaceBetween: 18 },
        1440: { slidesPerView: 4, spaceBetween: 18 },
      },
    }),
  );
});

test('forwards city data and subtitle mode without a theme-text override', () => {
  render(<BrowseDestinationsSection cities={cities} subtitleMode="price" />);

  const mappedCity = mockCarouselShell.mock.calls.at(-1)[0].items[0];
  render(mockCarouselShell.mock.calls.at(-1)[0].renderSlide(mappedCity));

  expect(mappedCity.blogsCount).toBe(2);
  expect(mockCityCard).toHaveBeenCalledWith(expect.objectContaining({ city: mappedCity, subtitleMode: 'price' }));
  expect(mockCityCard.mock.calls.at(-1)[0]).not.toHaveProperty('textTone');
});
```

Add `blogs_count: 2` to the shared `cities` fixture used by this test.

- [ ] **Step 2: Run the focused test and verify the new assertions fail**

Run:

```bash
npx jest src/app/components/Pages/FRONT_END/home/__tests__/BrowseDestinationsSection.test.jsx --runInBand
```

Expected: FAIL because the destination breakpoints still contain fractional values and `slidesPerView` is not explicitly `1`.

- [ ] **Step 3: Implement the shared carousel progression**

Replace `DESTINATION_BREAKPOINTS` with:

```js
const DESTINATION_BREAKPOINTS = {
  450: { slidesPerView: 1, spaceBetween: 18 },
  640: { slidesPerView: 2, spaceBetween: 18 },
  768: { slidesPerView: 2, spaceBetween: 18 },
  1024: { slidesPerView: 3, spaceBetween: 18 },
  1440: { slidesPerView: 4, spaceBetween: 18 },
};
```

Remove `cardTextTone` from the component parameters. Pass `slidesPerView={1}` to `CarouselShell`, and simplify the renderer to:

```jsx
renderSlide={(city) => <CityCard city={city} subtitleMode={subtitleMode} />}
```

While mapping API cities, preserve a real blog total when available:

```js
blogsCount: c.blogs_count ?? c.blogsCount ?? 0,
```

- [ ] **Step 4: Run the focused test and verify it passes**

Run the Task 1 Jest command again.

Expected: PASS for all destination-section tests.

- [ ] **Step 5: Leave the reviewed carousel changes uncommitted**

Confirm `git diff --check` passes. Do not commit yet; the repository requires the final code-review, simplification, and verification gates first.

### Task 2: Build the approved Weelp Postcard

**Files:**

- Modify: `src/app/components/__tests__/CityCard.test.jsx`
- Modify: `src/app/components/CityCard.jsx`

- [ ] **Step 1: Replace the legacy text-tone tests with behavior tests**

Mock no child internals. Replace the current two tests with:

```jsx
test('renders the approved full-image postcard as one city link', () => {
  render(<CityCard city={city} />);

  const link = screen.getByRole('link', { name: /dubai/i });
  expect(link).toHaveAttribute('href', '/cities/dubai');
  expect(link).toHaveClass(
    'weelp-destination-card',
    'rounded-[24px]',
    'border-[var(--weelp-card-border)]',
    'hover:[box-shadow:var(--weelp-card-hover-shadow)]',
    'focus-visible:ring-2',
    'motion-reduce:transition-none',
  );
  expect(screen.getByRole('heading', { name: 'Dubai' })).toHaveClass('text-white');
  expect(screen.getByText('13 Activities')).toHaveClass('text-white/90');
  const action = screen.getByTestId('destination-card-action');
  expect(action).toHaveAttribute('aria-hidden', 'true');
  expect(action.querySelector('.lucide-arrow-up-right')).toBeInTheDocument();
  expect(action).toHaveClass('motion-reduce:group-hover:translate-x-0', 'motion-reduce:group-hover:translate-y-0');
  expect(screen.getByRole('img', { name: 'Dubai' })).toHaveClass('motion-reduce:group-hover:scale-100');
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

test('uses correct singular labels for activity and blog modes', () => {
  const { rerender } = render(<CityCard city={{ ...city, activities_count: 1 }} />);
  expect(screen.getByText('1 Activity')).toBeInTheDocument();

  rerender(<CityCard city={{ ...city, activities_count: 13, blogs_count: 1 }} subtitleMode="blogs" />);
  expect(screen.getByText('1 Blog')).toBeInTheDocument();
});

test('keeps price mode optional and formats an available starting price', () => {
  const { rerender } = render(<CityCard city={{ ...city, starting_price: null }} subtitleMode="price" />);
  expect(screen.queryByText(/starting at/i)).not.toBeInTheDocument();

  rerender(<CityCard city={{ ...city, starting_price: 130, currency: 'USD' }} subtitleMode="price" />);
  expect(screen.getByText('Starting at $130.00')).toBeInTheDocument();
});

test('uses the shared fallback image when city media is absent', () => {
  render(<CityCard city={{ id: 2, name: 'Fallback City', slug: 'fallback-city', activities_count: 0 }} />);

  expect(screen.getByRole('img', { name: 'Fallback City' })).toHaveAttribute('src', expect.stringContaining('Card.webp'));
});
```

- [ ] **Step 2: Run the focused card test and verify it fails**

Run:

```bash
npx jest src/app/components/__tests__/CityCard.test.jsx --runInBand
```

Expected: FAIL because the current card uses the legacy smaller radius, has no diagonal action, has no heading semantics, and pluralizes `1 Activities`.

- [ ] **Step 3: Implement the postcard component**

Add the Lucide import:

```jsx
import { ArrowUpRight } from 'lucide-react';
```

Change the signature to remove `textTone`:

```jsx
export default function CityCard({ city, className = '', subtitleMode = 'count' }) {
```

Use singular-aware subtitle construction:

```js
const activityLabel = `${activitiesCount} ${activitiesCount === 1 ? 'Activity' : 'Activities'}`;
const blogsCount = city.blogs_count ?? city.blogsCount ?? 0;

let subtitle = null;
if (subtitleMode === 'price') {
  if (hasPrice) subtitle = `Starting at ${formatCurrency(city.starting_price, city.currency)}`;
} else if (subtitleMode === 'blogs') {
  subtitle = `${blogsCount} ${blogsCount === 1 ? 'Blog' : 'Blogs'}`;
} else {
  subtitle = activityLabel;
}
```

Replace the rendered card with this structure, retaining the existing image source selection and `IMAGE_BLUR_DATA_URL`:

```jsx
<NavigationLink
  href={`/cities/${city.slug}`}
  className={cn(
    'weelp-destination-card group relative block h-[280px] overflow-hidden rounded-[24px] border border-[var(--weelp-card-border)] bg-weelp-sage-wash transition-shadow duration-300 hover:[box-shadow:var(--weelp-card-hover-shadow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none sm:h-[320px] xl:h-[360px]',
    className,
  )}
>
  <Image
    src={image}
    alt={city.name}
    fill
    sizes="(max-width: 639px) 90vw, (max-width: 1023px) 50vw, (max-width: 1439px) 33vw, 25vw"
    placeholder="blur"
    blurDataURL={IMAGE_BLUR_DATA_URL}
    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
  />
  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
  <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-3 p-4 pt-20 sm:p-5 sm:pt-24">
    <div className="min-w-0">
      <h3 className="line-clamp-2 text-[20px] leading-tight text-white drop-shadow-md" style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 600 }}>
        {city.name}
      </h3>
      {subtitle ? (
        <p className="mt-1 truncate text-[13px] text-white/90 drop-shadow-md" style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif' }}>
          {subtitle}
        </p>
      ) : null}
    </div>
    <span
      data-testid="destination-card-action"
      aria-hidden="true"
      className="grid size-10 shrink-0 place-items-center rounded-full border border-white/55 bg-white/15 text-white shadow-sm backdrop-blur-md transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0"
    >
      <ArrowUpRight className="size-4" strokeWidth={2.25} />
    </span>
  </div>
</NavigationLink>
```

- [ ] **Step 4: Run the focused test and verify it passes**

Run the Task 2 Jest command again.

Expected: PASS for all `CityCard` tests.

- [ ] **Step 5: Leave the reviewed postcard changes uncommitted**

Confirm `git diff --check` passes. Do not commit before the final review, simplification, and verification gates.

### Task 3: Remove obsolete route-level theme props

**Files:**

- Modify: `src/app/(frontend)/page.js`
- Modify: `src/app/(frontend)/__tests__/page.test.jsx`
- Modify: `src/app/(frontend)/home-gold/page.js`
- Modify: `src/app/(frontend)/home-gold/__tests__/page.test.jsx`

- [ ] **Step 1: Update route composition tests first**

In the standard homepage test, replace the `cardTextTone` expectation with:

```jsx
expect(destinationSection.props).not.toHaveProperty('cardTextTone');
```

In the home-gold test, remove `cardTextTone: 'theme'` from the expected destination props and add:

```jsx
expect(children[2].props).not.toHaveProperty('cardTextTone');
```

- [ ] **Step 2: Run both route tests and verify they fail**

Run:

```bash
npx jest 'src/app/(frontend)/__tests__/page.test.jsx' 'src/app/(frontend)/home-gold/__tests__/page.test.jsx' --runInBand
```

Expected: FAIL because both routes still pass `cardTextTone="theme"`.

- [ ] **Step 3: Remove the obsolete props from both routes**

Render the standard destination section as:

```jsx
<BrowseDestinationsSection cities={featuredCities} carouselEntrance="stagger-right" className="pb-12 md:pb-16 lg:pb-24" />
```

Render the home-gold destination section as:

```jsx
<BrowseDestinationsSection cities={featuredCities} className="pb-12 md:pb-16 lg:pb-24" />
```

- [ ] **Step 4: Run both route tests and verify they pass**

Run the Task 3 Jest command again.

Expected: PASS for both homepage composition suites.

- [ ] **Step 5: Leave the reviewed route cleanup uncommitted**

Confirm `git diff --check` passes. Defer the commit until the final review and verification gate.

### Task 4: Unify destination hover styling and run code-quality gates

**Files:**

- Modify: `src/app/globals.css`
- Modify: `src/app/__tests__/deepForestTheme.test.js`
- Test: all files changed in Tasks 1–3

- [ ] **Step 1: Rewrite the destination hover contract first**

In `deepForestTheme.test.js`, keep the assertions for `.dark .home-gold-theme .weelp-destination-card` border and ring tokens. Replace the exact destination-hover rule assertions with:

```js
expect(() => findExactRule(darkDestinationHoverSelector)).toThrow();
expect(readSource('src/app/components/CityCard.jsx')).toContain('hover:[box-shadow:var(--weelp-card-hover-shadow)]');
```

- [ ] **Step 2: Run the theme contract and verify it fails**

```bash
npx jest src/app/__tests__/deepForestTheme.test.js --runInBand
```

Expected: FAIL because the destination-only dark home-gold hover rule still exists.

- [ ] **Step 3: Remove the destination-only home-gold hover rule**

Delete only this block:

```css
.dark .home-gold-theme .weelp-destination-card:hover {
  box-shadow:
    var(--tw-ring-offset-shadow),
    var(--tw-ring-shadow),
    var(--tw-shadow),
    0 16px 16px -16px rgb(var(--weelp-gold-edge-rgb) / 0.22),
    0 7px 6px -6px rgb(var(--weelp-gold-edge-rgb) / 0.12);
}
```

Keep the nearby home-gold border and backface-visibility rules; they still prevent dark-theme image flicker and source their border from `--weelp-card-border`.

- [ ] **Step 4: Re-run the theme contract**

Run the Task 4 Jest command again.

Expected: PASS while the dark home-gold border and ring token assertions remain intact.

- [ ] **Step 5: Invoke `error-handling-patterns` and audit graceful UI paths**

Confirm the completed code preserves the image fallback, does not render an invented price, does not nest a button inside the link, constrains long text, and leaves the action visible on non-hover devices. Apply only findings within this feature's scope.

- [ ] **Step 6: Run the complete focused test group**

```bash
npx jest src/app/components/__tests__/CityCard.test.jsx src/app/components/Pages/FRONT_END/home/__tests__/BrowseDestinationsSection.test.jsx src/app/__tests__/deepForestTheme.test.js 'src/app/(frontend)/__tests__/page.test.jsx' 'src/app/(frontend)/home-gold/__tests__/page.test.jsx' --runInBand
```

Expected: all suites PASS.

- [ ] **Step 7: Run type-check**

```bash
npm run type-check
```

Expected: exit code 0.

- [ ] **Step 8: Run lint**

```bash
npm run lint
```

Expected: exit code 0 and no new dark-mode guard findings.

- [ ] **Step 9: Run the production build**

```bash
npm run build
```

Expected: Next.js build completes and public routes generate successfully.

- [ ] **Step 10: Leave the reviewed style and test changes uncommitted**

Confirm `git diff --check` passes. Keep the complete implementation diff uncommitted for Task 5's mandatory review.

### Task 5: Review, simplify, visually verify, and ship

**Files:**

- Modify: only files named by concrete code-review or simplify findings.

- [ ] **Step 1: Dispatch the mandatory code-reviewer agent**

Have the reviewer compare the implementation diff with `docs/superpowers/specs/2026-08-26-top-destinations-postcard-design.md`, focusing on shared-component coverage, invalid nested interactions, responsive counts, theme isolation, accessibility, test behavior, and unrelated changes. Fix every critical or major issue and re-review until approved.

- [ ] **Step 2: Invoke the mandatory `simplify` skill or record its unavailable fallback**

The current skill catalog does not expose `simplify`. Record that limitation, then perform the permitted fallback: a scoped manual clarity/reuse/efficiency pass over only the changed destination files. Re-run the complete focused test group after any simplification.

- [ ] **Step 3: Invoke `verification-before-completion` and repeat automated verification**

Run the focused Jest group, `npm run type-check`, `npm run lint`, `npm run build`, and `git diff --check`. Do not claim completion from earlier output.

- [ ] **Step 4: Verify in the required visible browser**

Ensure the local frontend is running on port 3000, then explicitly open the required named visible session:

```bash
agent-browser --session weelp-visible --headed open http://localhost:3000
```

If the existing daemon was not headed, close only `weelp-visible` and reopen it with `--headed --args "--no-sandbox"`. Then inspect:

- Homepage Top Activities followed by a four-card Top Destinations row at 1440px and above.
- Homepage light and dark themes.
- Hover scale, diagonal action movement, keyboard focus ring, and reduced-motion behavior.
- Two-card tablet and one-card mobile layouts with pagination/navigation intact.
- `/holiday`, `/tours-experiences`, one populated `/region/[region]` route, and `/cities` to prove the shared card reaches every consumer.
- Browser console for new errors during the tested interactions.

- [ ] **Step 5: Commit the reviewed implementation**

Stage only the plan-approved implementation and test files, inspect the staged diff, and commit after every prior gate has passed:

```bash
git add src/app/components/CityCard.jsx src/app/components/__tests__/CityCard.test.jsx src/app/components/Pages/FRONT_END/home/BrowseDestinationsSection.jsx src/app/components/Pages/FRONT_END/home/__tests__/BrowseDestinationsSection.test.jsx 'src/app/(frontend)/page.js' 'src/app/(frontend)/__tests__/page.test.jsx' 'src/app/(frontend)/home-gold/page.js' 'src/app/(frontend)/home-gold/__tests__/page.test.jsx' src/app/globals.css src/app/__tests__/deepForestTheme.test.js
git diff --cached --check
git commit -m "feat(destinations): redesign city postcard cards"
```

Before committing, inspect `git status --short`. If the approved review or manual simplification pass required an additional file outside the original map, inspect its diff and stage that exact reviewer-approved path explicitly; do not use a broad add command.

- [ ] **Step 6: Ensure main is clean**

```bash
git status --short
git branch --show-current
```

Expected: clean status on `main`.

- [ ] **Step 7: Push the verified frontend main branch**

```bash
git push origin main
```

Expected: the verified implementation commits are present on `origin/main`.
