# Shared Search Button Separation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the shared non-home Search button an 8px desktop separation and matching 12px left and right corner radii on `/tours-experiences` and `/search`.

**Architecture:** Keep the fix inside the existing `ActivityItinerarySearch` shared component. Add responsive left padding only to the non-home submit wrapper and remove the non-home button's desktop left-radius override, leaving the home pill and modal submit presentations unchanged.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS, Jest, React Testing Library, agent-browser

---

### Task 0: Lock the reviewed plan and implementation guidance

**Files:**

- Commit: `src/docs/superpowers/plans/2026-07-28-shared-search-button-separation.md`

- [ ] **Step 1: Load the required implementation skills**

Before editing Next.js code, read and follow:

- `next-best-practices`
- `vercel-react-best-practices`
- `vercel-composition-patterns`
- `test-driven-development`

- [ ] **Step 2: Commit the reviewed plan checkpoint**

```bash
git branch --show-current
git add src/docs/superpowers/plans/2026-07-28-shared-search-button-separation.md
git commit -m "docs: plan shared search button separation"
git status --short
```

Expected: the branch command prints `main`, the plan is committed there, and
`git status --short` produces no output before implementation begins.

### Task 1: Separate and round the shared non-home Search button

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/shared/ActivityItinerarySearch.jsx:538-552`
- Test: `src/app/components/Pages/FRONT_END/shared/__tests__/ActivityItinerarySearch.test.jsx`

- [ ] **Step 1: Add failing spacing tests**

Add this test inside the existing `ActivityItinerarySearch` describe block:

```jsx
it.each([
  ['compact', <CompactActivityItinerarySearch key="compact-search-spacing" />],
  ['results', <ResultsActivityItinerarySearch key="results-search-spacing" />],
])('%s separates the Search button from the Guests field on desktop', (_name, panel) => {
  renderSearch(panel);

  const searchButton = screen.getByRole('button', { name: /search trips/i });

  expect(searchButton.parentElement).toHaveClass('sm:pl-2');
});
```

- [ ] **Step 2: Add failing corner-radius tests**

Add this separate parameterized test so the obsolete radius override fails
independently during RED:

```jsx
it.each([
  ['compact', <CompactActivityItinerarySearch key="compact-search-radius" />],
  ['results', <ResultsActivityItinerarySearch key="results-search-radius" />],
])('%s keeps all four Search button corners rounded on desktop', (_name, panel) => {
  renderSearch(panel);

  const searchButton = screen.getByRole('button', { name: /search trips/i });

  expect(searchButton).toHaveClass('rounded-xl');
  expect(searchButton).not.toHaveClass('sm:rounded-l-none');
});
```

- [ ] **Step 3: Add home and modal preservation tests**

Add:

```jsx
it('keeps the home Search button presentation unchanged', () => {
  renderSearch(<HomeActivityItinerarySearch />);

  const searchButton = screen.getByRole('button', { name: /search trips/i });

  expect(searchButton.parentElement).toHaveClass('sm:pr-5');
  expect(searchButton.parentElement).not.toHaveClass('sm:pl-2');
  expect(searchButton).toHaveClass('rounded-2xl');
});

it('keeps the modal Search button presentation unchanged', () => {
  renderSearch(<ModalActivityItinerarySearch />);

  const searchButton = screen.getByRole('button', { name: /search trips/i });

  expect(searchButton.parentElement).not.toHaveClass('sm:pl-2');
  expect(searchButton).toHaveClass('mx-auto', 'mt-4', 'rounded-full');
  expect(searchButton).not.toHaveClass('rounded-xl');
});
```

- [ ] **Step 4: Run the focused test and verify RED**

Run:

```bash
npx jest --runInBand src/app/components/Pages/FRONT_END/shared/__tests__/ActivityItinerarySearch.test.jsx
```

Expected: the two spacing cases fail because the wrappers do not have
`sm:pl-2`, and the two separate radius cases fail because the buttons still
have `sm:rounded-l-none`. Existing tests plus the home and modal preservation
tests pass.

- [ ] **Step 5: Apply the minimal shared-component fix**

Change the non-modal submit wrapper to:

```jsx
<div className={`flex items-center justify-stretch sm:justify-end ${isPill ? 'sm:pr-5' : 'sm:pl-2'}`}>
```

Change the non-home Search button class to remove only
`sm:rounded-l-none`:

```jsx
'inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 py-[18px] text-sm font-semibold text-Bluewhale shadow-[0_3px_9px_rgba(0,0,0,0.04)] transition-colors hover:bg-weelp-sage-wash hover:text-weelp-sage-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 motion-reduce:transition-none'
```

Do not change the home grid, home button, modal button, form submission, URL
construction, API calls, or any page-level component.

- [ ] **Step 6: Run the focused test and verify GREEN**

Run:

```bash
npx jest --runInBand src/app/components/Pages/FRONT_END/shared/__tests__/ActivityItinerarySearch.test.jsx
```

Expected: all `ActivityItinerarySearch` tests pass.

- [ ] **Step 7: Review error-handling impact**

Read and apply `error-handling-patterns` before verification. This styling-only
change must not add new error paths or alter the existing submit/navigation
flow.

- [ ] **Step 8: Run the related page regression suites**

Run:

```bash
npx jest --runInBand \
  src/app/components/Pages/FRONT_END/shared/__tests__/ActivityItinerarySearch.test.jsx \
  src/app/components/Pages/FRONT_END/shop/__tests__/BannerSection.test.jsx \
  src/app/components/Pages/FRONT_END/shop/__tests__/SearchPage.test.jsx \
  'src/app/(frontend)/tours-experiences/__tests__/page.test.jsx'
```

Expected: all four suites pass.

- [ ] **Step 9: Run static verification**

Run:

```bash
npm run type-check
npm run lint
git diff --check
```

Expected: TypeScript exits successfully, ESLint and the dark-mode guard report
no errors, and `git diff --check` produces no output.

- [ ] **Step 10: Verify the local server**

Run:

```bash
curl -I http://localhost:3000/tours-experiences
```

Expected: an HTTP response from the local Next.js server. If it is unavailable,
start it with `npm run dev`, keep that process running, and repeat the check.

- [ ] **Step 11: Verify both routes at desktop width in the visible browser**

Use only the named headed browser session:

```bash
agent-browser --session weelp-search-radius --headed open http://localhost:3000/tours-experiences
agent-browser --session weelp-search-radius set viewport 1280 900
```

While `/tours-experiences` is still open, run this exact evaluation through
`agent-browser --session weelp-search-radius eval`:

```js
const button = document.querySelector('button[aria-label="Search trips"]');
const wrapper = button.parentElement;
const guestsField = wrapper.previousElementSibling;
const buttonRect = button.getBoundingClientRect();
const guestsRect = guestsField.getBoundingClientRect();
const style = getComputedStyle(button);

({
  gap: buttonRect.left - guestsRect.right,
  radii: [
    style.borderTopLeftRadius,
    style.borderTopRightRadius,
    style.borderBottomRightRadius,
    style.borderBottomLeftRadius,
  ],
  overflow:
    document.documentElement.scrollWidth >
    document.documentElement.clientWidth,
});
```

Expected:

- `gap` is `8`;
- `radii` is `['12px', '12px', '12px', '12px']`;
- `overflow` is `false`.

Then run:

```bash
agent-browser --session weelp-search-radius snapshot -i
agent-browser --session weelp-search-radius focus 'button[aria-label="Search trips"]'
agent-browser --session weelp-search-radius eval "document.activeElement === document.querySelector('button[aria-label=\"Search trips\"]')"
agent-browser --session weelp-search-radius press Enter
agent-browser --session weelp-search-radius wait --url "**/search*"
```

Expected: the focus evaluation returns `true`, and Enter navigates to a
`/search?...` URL.

Now open the second desktop route:

```bash
agent-browser --session weelp-search-radius open "http://localhost:3000/search?location=dubai&start_date=2026-08-10&end_date=2026-08-14&quantity=2"
```

Before navigating anywhere else, repeat the same gap/radius/overflow evaluation
block. Expect the same `8`, four `12px` radii, and `false` overflow.

- [ ] **Step 12: Verify both routes at mobile width in the visible browser**

Open and measure the first mobile route:

```bash
agent-browser --session weelp-search-radius set viewport 320 900
agent-browser --session weelp-search-radius open http://localhost:3000/tours-experiences
```

While `/tours-experiences` is open, evaluate:

```js
const button = document.querySelector('button[aria-label="Search trips"]');
const wrapper = button.parentElement;
const guestsField = wrapper.previousElementSibling;
const buttonRect = button.getBoundingClientRect();
const guestsRect = guestsField.getBoundingClientRect();
const style = getComputedStyle(button);

({
  gap: buttonRect.top - guestsRect.bottom,
  height: buttonRect.height,
  radii: [
    style.borderTopLeftRadius,
    style.borderTopRightRadius,
    style.borderBottomRightRadius,
    style.borderBottomLeftRadius,
  ],
  overflow:
    document.documentElement.scrollWidth >
    document.documentElement.clientWidth,
});
```

Expected:

- `gap` is `8`;
- `height` is at least `44`;
- `radii` is `['12px', '12px', '12px', '12px']`;
- `overflow` is `false`.

Now open the second mobile route:

```bash
agent-browser --session weelp-search-radius open "http://localhost:3000/search?location=dubai&start_date=2026-08-10&end_date=2026-08-14&quantity=2"
```

Before navigating anywhere else, repeat the same mobile evaluation block and
expect the same values.

- [ ] **Step 13: Run final project verification**

Run:

```bash
NODE_OPTIONS=--max-old-space-size=8192 npm run test:ci -- --runInBand
npm run build
```

Expected: the full Jest suite and production build pass.

- [ ] **Step 14: Complete review and simplification gates**

Dispatch the required code-reviewer agent against the implementation diff.
Resolve every Critical or Major finding and re-review. Since the requested
`simplify` skill is not installed, perform the equivalent manual pass:

- confirm the fix remains in the single shared component;
- confirm no new presentation prop or duplicated page style was introduced;
- confirm only the wrapper spacing and obsolete radius override changed.

- [ ] **Step 15: Re-verify every accepted review change**

If review or simplification produces any code change, repeat:

1. focused and related Jest suites from Steps 6 and 8;
2. `error-handling-patterns`;
3. type-check, lint, and `git diff --check` from Step 9;
4. both-route desktop and mobile browser checks from Steps 11 and 12;
5. full Jest and build from Step 13;
6. final code review until it returns approval.

Do not commit a review-driven change without this loop.

- [ ] **Step 16: Commit and push**

Confirm the target branch first:

```bash
git branch --show-current
```

Expected: `main`.

```bash
git add \
  src/app/components/Pages/FRONT_END/shared/ActivityItinerarySearch.jsx \
  src/app/components/Pages/FRONT_END/shared/__tests__/ActivityItinerarySearch.test.jsx
git commit -m "style(search): separate shared search action"
git status --short
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
```

Expected: the implementation commit lands on frontend `main`,
`git status --short` produces no output, and the SHA from `git rev-parse HEAD`
matches the SHA from `git ls-remote origin refs/heads/main`.
