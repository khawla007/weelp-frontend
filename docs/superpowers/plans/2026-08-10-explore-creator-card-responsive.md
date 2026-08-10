# Explore Creator Card Responsive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make creator itineraries read as complete bordered cards, remove the heart control's generic dark-mode border, give it a coral hover shadow, and improve the Explore Creators mobile control layout.

**Architecture:** Keep the change inside the existing Explore Creators components. `CreatorItineraryCard` owns card containment and heart interaction styling; `SectionCreatorFilter` owns responsive control placement; the global dark-button selector receives one semantic exclusion so the heart can use its local color contract. Existing component and parsed-CSS tests lock the visual classes and selector behavior before implementation.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS, PostCSS, Jest 30, Testing Library, agent-browser

Run every command from `/run/media/ashish-khawla/Website data/Fanatic Developement/weelp/frontend`.

Project policy requires one final implementation commit only after the code-review, simplify, and full verification gates. Do not create intermediate implementation commits.

---

### Task 0: Load the required implementation workflows

**Files:**

- Read-only: current skill instructions

- [ ] **Step 1: Load the implementation skills before touching Next.js code**

Invoke these project-required skills in order:

```text
superpowers:systematic-debugging (already invoked for the root-cause investigation in this task)
superpowers:test-driven-development
next-best-practices
vercel-react-best-practices
vercel-composition-patterns
```

Use their guidance while executing Tasks 1–4. Keep `CreatorItineraryCard` and `SectionCreatorFilter` as focused existing components; do not add a new abstraction unless a concrete repeated responsibility appears.

- [ ] **Step 2: Load the post-change error-handling workflow**

Invoke `error-handling-patterns` before the first implementation change. After every implementation task, review the affected async/error paths, then run type-check, lint, and a headed-browser checkpoint as listed in that task.

---

### Task 1: Lock the card and heart contracts with failing tests

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/explore/__tests__/CreatorItineraryCard.test.jsx:31-118`
- Modify: `src/app/__tests__/deepForestTheme.test.js:574-686`
- Reference: `docs/superpowers/specs/2026-08-10-explore-creator-card-responsive-design.md`

- [ ] **Step 1: Add the complete-card regression test**

Append this test inside `describe('CreatorItineraryCard', ...)`:

```jsx
it('renders a complete responsive card with a borderless coral heart control', () => {
  const { container } = render(
    <CreatorItineraryCard
      isLoggedIn={false}
      itinerary={{
        id: 12,
        name: 'A long creator itinerary title for mobile travelers',
        slug: 'long-creator-route',
        views_count: 21,
        likes_count: 4,
        locations: [{ city: { name: 'Dubai', slug: 'dubai' } }],
        creator: { name: 'Nora Field Notes' },
      }}
    />,
  );

  const card = container.firstElementChild;
  const imageFrame = screen.getByRole('link').firstElementChild;
  const likeButton = screen.getByRole('button', { name: 'Like A long creator itinerary title for mobile travelers. 4 likes' });

  expect(card).toHaveClass('overflow-hidden', 'rounded-xl', 'border', 'border-border', 'bg-background');
  expect(card).toHaveClass('hover:-translate-y-0.5', 'focus-within:-translate-y-0.5', 'motion-reduce:hover:translate-y-0');
  expect(imageFrame).toHaveClass('aspect-[4/3]', 'sm:aspect-[93/100]');
  expect(likeButton).toHaveClass('weelp-creator-like-button', 'min-h-11', 'min-w-11', 'justify-center', 'border-0', 'bg-transparent');
  expect(likeButton.className).toContain('hover:shadow-[0_4px_14px_hsl(var(--weelp-discount)/0.32)]');
  expect(screen.getByRole('heading', { name: 'A long creator itinerary title for mobile travelers' })).toHaveClass('line-clamp-2');
});
```

- [ ] **Step 2: Extend the parsed dark-button selector contract**

In both native-button selector strings used by `darkInteractiveControlSelectors` and the `sets the dark site-wide button surface and border` test, add the semantic exclusion immediately after `.review-featured-switch`:

```js
:not(.weelp-creator-like-button)
```

Add the excluded control to the DOM fixture:

```html
<button data-testid="creator-like-button" class="weelp-creator-like-button">Like itinerary</button>
```

Keep the expected selected controls unchanged:

```js
expect(selectedControls).toEqual(['enabled-button', 'marked-anchor', 'filled-anchor']);
```

This proves the creator heart does not inherit the generic dark background, border, or green hover shadow.

Update the `NavigationLink` mock to forward its visual class:

```jsx
default: ({ href, children, onClick, className }) => (
  <a
    href={href}
    className={className}
    onClick={(event) => {
      event.preventDefault();
      onClick?.(event);
    }}
  >
    {children}
  </a>
),
```

Then add this assertion to the complete-card test:

```jsx
expect(screen.getByRole('link')).toHaveClass('block');
```

- [ ] **Step 3: Run the focused tests and confirm they fail for the intended reasons**

Run:

```bash
npx jest --runInBand src/app/components/Pages/FRONT_END/explore/__tests__/CreatorItineraryCard.test.jsx src/app/__tests__/deepForestTheme.test.js
```

Expected: `CreatorItineraryCard.test.jsx` fails because the card, image, title, and heart classes are absent; `deepForestTheme.test.js` fails because `globals.css` does not yet contain the new selector exclusion.

---

### Task 2: Implement the complete responsive creator card

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/explore/CreatorItineraryCard.jsx:68-124`
- Test: `src/app/components/Pages/FRONT_END/explore/__tests__/CreatorItineraryCard.test.jsx`

- [ ] **Step 1: Turn the root into the complete card surface**

Replace the root wrapper class with:

```jsx
<div className="flex h-full w-full max-w-full flex-col overflow-hidden rounded-xl border border-border bg-background transition-[transform,box-shadow] duration-200 ease-[var(--weelp-ease-out)] hover:-translate-y-0.5 hover:shadow-[var(--weelp-card-hover-shadow)] focus-within:-translate-y-0.5 focus-within:shadow-[var(--weelp-card-hover-shadow)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:focus-within:translate-y-0">
```

This uses existing theme tokens and keeps equal-height grid items without adding a new component abstraction.

- [ ] **Step 2: Make the image mobile-landscape and card-edge aligned**

Give the navigation link a block wrapper and replace the image frame class:

```jsx
<NavigationLink href={href} className="block">
  <div className="group/image relative aspect-[4/3] w-full overflow-hidden sm:aspect-[93/100]">
```

Update the price overlay's hover selector from `group-hover:` to `group-hover/image:` so only the image interaction controls the overlay:

```jsx
<div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/70 to-transparent px-3 py-2 transition-transform duration-300 group-hover/image:translate-y-0">
```

- [ ] **Step 3: Consolidate metadata into a padded card body**

Wrap the engagement and title rows in:

```jsx
<div className="flex flex-1 flex-col gap-2 px-3 pb-3 pt-2.5">
```

Use these inner classes:

```jsx
<div className="flex items-center gap-4">
```

```jsx
<div className="flex min-w-0 items-center justify-between gap-3">
```

```jsx
<TitleTag className="line-clamp-2 min-w-0 flex-1 text-base font-medium leading-snug text-foreground sm:text-lg">
```

Remove the old per-row `px-2`, `pt-2`, `pt-1`, `mr-2`, and `line-clamp-1` classes.

- [ ] **Step 4: Give the heart its own accessible interaction treatment**

Replace the heart button class with:

```jsx
className =
  'weelp-creator-like-button -m-1 flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-md border-0 bg-transparent p-1 text-sm text-muted-foreground shadow-none transition-[color,box-shadow,transform] duration-200 hover:shadow-[0_4px_14px_hsl(var(--weelp-discount)/0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-discount/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100';
```

Keep the existing `aria-label`, click handler, icon fill state, and count rendering unchanged.

- [ ] **Step 5: Run the card test and confirm the component contract passes**

Run:

```bash
npx jest --runInBand src/app/components/Pages/FRONT_END/explore/__tests__/CreatorItineraryCard.test.jsx
```

Expected: all `CreatorItineraryCard` tests pass.

- [ ] **Step 6: Run the required post-change checkpoint**

Review the existing failed-like rollback and guest-auth paths against `error-handling-patterns`, then run:

```bash
npm run type-check
npm run lint
agent-browser --session weelp-visible --headed open http://localhost:3000/explore-creators
agent-browser --session weelp-visible set viewport 390 844
```

Expected: type-check and lint exit `0`; the visible browser shows the new complete card with no horizontal overflow at 390px.

---

### Task 3: Exclude the heart from the generic dark-button contract

**Files:**

- Modify: `src/app/globals.css:308-345`
- Test: `src/app/__tests__/deepForestTheme.test.js`

- [ ] **Step 1: Add the semantic exclusion to all three native-button selector lists**

In the base, enabled-transition, and enabled-hover rules, add:

```css
:not(.weelp-creator-like-button);
```

Place it beside the existing `.review-featured-switch` exception. Do not change the anchor selectors or the global green shadow itself.

- [ ] **Step 2: Run the parsed CSS contract tests**

Run:

```bash
npx jest --runInBand src/app/__tests__/deepForestTheme.test.js
```

Expected: the parsed selectors exactly match the updated contract, the selected controls omit `creator-like-button`, and all deep-forest theme tests pass.

- [ ] **Step 3: Run the dark-mode guard**

Run:

```bash
npm run dark:guard
```

Expected: `Dark-mode guard: no new hardcoded color findings.`

- [ ] **Step 4: Run the required post-change checkpoint**

Confirm the selector change does not alter like mutation error handling, then run:

```bash
npm run type-check
npm run lint
agent-browser --session weelp-visible --headed open http://localhost:3000/explore-creators
agent-browser --session weelp-visible set viewport 390 844
```

Expected: type-check and lint exit `0`; in visible dark mode the heart has no generic border/background and its hover/focus shadow is coral.

---

### Task 4: Optimize the mobile filter layout with a failing test first

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/explore/__tests__/SectionCreatorFilter.test.jsx:44-74`
- Modify: `src/app/components/Pages/FRONT_END/explore/SectionCreatorFilter.jsx:174-265`

- [ ] **Step 1: Update the narrow-layout test to describe the approved grid**

Replace the first test's layout assertions with:

```jsx
const home = screen.getByRole('button', { name: 'Home' });
const trending = screen.getByRole('button', { name: 'Trending' });
const join = screen.getByRole('button', { name: 'Join as Creator' });
const sort = screen.getAllByRole('button', { name: 'Latest First' })[0];
const source = screen.getAllByRole('button', { name: 'All Itineraries' })[0];
const actionRow = home.parentElement;
const topBar = actionRow.parentElement;

expect(topBar).toHaveClass('grid', 'grid-cols-1', 'gap-3', 'min-[360px]:grid-cols-2', 'lg:grid-cols-[minmax(160px,1fr)_auto_minmax(160px,1fr)]');
expect(actionRow).toHaveClass('col-span-1', 'row-start-1', 'w-full', 'flex-wrap', 'justify-center', 'min-[360px]:col-span-2', 'lg:col-auto');
expect(sort).toHaveClass('min-h-11', 'w-full', 'lg:w-auto', 'lg:min-w-[160px]');
expect(source).toHaveClass('min-h-11', 'w-full', 'lg:w-auto', 'lg:min-w-[160px]');
expect(home).toHaveClass('min-h-11');
expect(trending).toHaveClass('min-h-11');
expect(join).toHaveClass('min-h-11');
expect(container.querySelector('.w-px.h-6')).not.toBeInTheDocument();
```

- [ ] **Step 2: Run the filter test and confirm the responsive assertions fail**

Run:

```bash
npx jest --runInBand src/app/components/Pages/FRONT_END/explore/__tests__/SectionCreatorFilter.test.jsx
```

Expected: the first test fails because the top bar is still a vertical flex layout and dropdown triggers still use fixed minimum widths.

- [ ] **Step 3: Convert the top bar to a mobile-first grid**

Replace the top-level `Reveal` class with:

```jsx
className = 'grid grid-cols-1 items-center gap-3 pt-6 min-[360px]:grid-cols-2 lg:grid-cols-[minmax(160px,1fr)_auto_minmax(160px,1fr)] lg:gap-4 lg:pt-4';
```

Use these wrappers:

```jsx
<div className="row-start-2 min-w-0 lg:row-auto lg:justify-self-start">
```

```jsx
<div className="col-span-1 row-start-1 flex w-full flex-wrap items-center justify-center gap-2 min-[360px]:col-span-2 lg:col-auto lg:row-auto lg:w-auto lg:flex-nowrap lg:gap-[22px]">
```

```jsx
<div className="row-start-3 min-w-0 min-[360px]:row-start-2 lg:row-auto lg:justify-self-end">
```

For the hidden trending placeholder, use `className="h-11 w-full lg:min-w-[160px]"` so both mobile and tablet filter columns remain balanced.

- [ ] **Step 4: Make both dropdown triggers fill mobile columns**

Use the same size contract on both trigger buttons while preserving their existing radii and colors:

```jsx
className =
  'flex min-h-11 w-full items-center justify-between gap-2 rounded-[8px] border border-border bg-transparent px-3 py-2 text-sm font-medium text-weelp-steel outline-none lg:w-auto lg:min-w-[160px] lg:px-4 lg:text-[16px]';
```

Keep the source trigger's current radius if desired, but keep the width, target-size, padding, and responsive typography classes identical.

- [ ] **Step 5: Run both Explore component suites**

Run:

```bash
npx jest --runInBand src/app/components/Pages/FRONT_END/explore/__tests__/CreatorItineraryCard.test.jsx src/app/components/Pages/FRONT_END/explore/__tests__/SectionCreatorFilter.test.jsx
```

Expected: both suites pass with no behavior regressions.

- [ ] **Step 6: Run the required post-change checkpoint at narrow and tablet widths**

Confirm filter refetch, retry, and load-more error behavior remains unchanged, then run:

```bash
npm run type-check
npm run lint
agent-browser --session weelp-visible --headed open http://localhost:3000/explore-creators
agent-browser --session weelp-visible set viewport 320 844
agent-browser --session weelp-visible eval "document.documentElement.scrollWidth === document.documentElement.clientWidth"
agent-browser --session weelp-visible set viewport 390 844
agent-browser --session weelp-visible eval "document.documentElement.scrollWidth === document.documentElement.clientWidth"
agent-browser --session weelp-visible set viewport 768 900
agent-browser --session weelp-visible eval "document.documentElement.scrollWidth === document.documentElement.clientWidth"
```

Expected: type-check and lint exit `0`; every browser evaluation returns `true`. At 320px the dropdowns stack, while 390px and 768px use two balanced dropdown columns beneath the full-width action row.

---

### Task 5: Complete required verification, review, simplify, and delivery

**Files:**

- Review: all modified implementation and test files
- Verify: `http://localhost:3000/explore-creators`

- [ ] **Step 1: Run static and focused verification**

Run in this order:

```bash
npm run type-check
npm run lint
npx jest --runInBand src/app/components/Pages/FRONT_END/explore/__tests__/CreatorItineraryCard.test.jsx src/app/components/Pages/FRONT_END/explore/__tests__/SectionCreatorFilter.test.jsx src/app/__tests__/deepForestTheme.test.js
npm run build
git diff --check
```

Expected: every command exits `0`; lint reports no new dark-mode findings; focused Jest suites pass.

- [ ] **Step 2: Run the mandatory code-review gate**

Dispatch the project code-reviewer against the implementation diff and this design/plan. Fix every critical or high-confidence issue, rerun the affected tests, and request re-review until no blocking findings remain.

- [ ] **Step 3: Run the mandatory simplify gate**

Apply the available simplify workflow to the reviewed diff. Keep component responsibilities unchanged and avoid new abstractions for one-off class strings. Rerun focused tests, type-check, and lint after any simplification.

- [ ] **Step 4: Verify in the visible headed browser**

Use the named visible session and localhost only:

```bash
agent-browser --session weelp-visible --headed open http://localhost:3000/explore-creators
agent-browser --session weelp-visible set viewport 390 844
agent-browser --session weelp-visible set viewport 768 900
agent-browser --session weelp-visible set viewport 1280 900
```

At each width, inspect light and dark modes. Confirm:

- each itinerary has a visible full-card boundary;
- the 390-pixel image is landscape and the page has no horizontal overflow;
- filters form the intended action row plus two balanced dropdown columns;
- the heart has no dark border or forced dark background;
- hover/focus shadow is coral and no generic green shadow appears;
- tablet and desktop retain the two-, three-, four-, and five-column grid progression.

- [ ] **Step 5: Create the final implementation commit and push `main`**

After review, simplify, and verification are complete:

```bash
git add src/app/globals.css src/app/__tests__/deepForestTheme.test.js src/app/components/Pages/FRONT_END/explore/CreatorItineraryCard.jsx src/app/components/Pages/FRONT_END/explore/SectionCreatorFilter.jsx src/app/components/Pages/FRONT_END/explore/__tests__/CreatorItineraryCard.test.jsx src/app/components/Pages/FRONT_END/explore/__tests__/SectionCreatorFilter.test.jsx docs/superpowers/plans/2026-08-10-explore-creator-card-responsive.md
git commit -m "fix: polish explore creator cards"
git push origin main
```

Expected: the commit lands on `main`, the push succeeds, and `git status --short` is clean.
