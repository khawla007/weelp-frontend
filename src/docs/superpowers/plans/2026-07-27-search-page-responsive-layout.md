# Search Page Responsive Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore generous spacing around the shared search panel and let mobile travelers reach search results before the optional filters.

**Architecture:** Keep search behavior inside the existing shared discovery component and keep filtering state inside `SearchPage`. Change only the surrounding layout: center the shared panel on the canonical rail, add responsive vertical spacing, and progressively disclose the existing filter rail below `md`.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS, Jest, React Testing Library, agent-browser

---

## File map

- `src/app/components/Pages/FRONT_END/shop/BannerSection.jsx` owns the full-width search band and canonical inner rail.
- `src/app/components/Pages/FRONT_END/shop/__tests__/BannerSection.test.jsx` locks the search-band spacing and centering contract.
- `src/app/components/Pages/FRONT_END/shop/SearchPage.jsx` owns the results toolbar, mobile filter disclosure, filter state, and result layout.
- `src/app/components/Pages/FRONT_END/shop/__tests__/SearchPage.test.jsx` locks the disclosure semantics while retaining the existing URL/API regressions.

### Task 0: Load required implementation guidance

**Files:**

- Read only; no production-file changes

- [ ] **Step 1: Load the implementation skills**

Read and apply these skills before writing tests or production code:

```text
superpowers:test-driven-development
next-best-practices
vercel-react-best-practices
vercel-composition-patterns
```

Use explicit responsive classes and one mounted filter tree. Do not create a
second mobile component or duplicate API/filter state.

- [ ] **Step 2: Load the post-change quality skills**

Read and apply:

```text
error-handling-patterns
verification-before-completion
agent-browser
```

After every production-code task, run its focused tests, `npm run type-check`,
`npm run lint`, and a visible headed-browser check before committing.

### Task 1: Restore search-band spacing

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/shop/BannerSection.jsx`
- Test: `src/app/components/Pages/FRONT_END/shop/__tests__/BannerSection.test.jsx`

- [ ] **Step 1: Write the failing spacing test**

Extend the existing banner test with the responsive spacing and canonical-rail assertions:

```jsx
const searchBand = container.querySelector('.shop_banner');
const searchRail = screen.getByTestId('search-panel-rail');

expect(searchBand).toHaveClass('py-6', 'sm:py-10');
expect(searchRail).toHaveClass('container-page', 'flex', 'justify-center');
```

- [ ] **Step 2: Run the banner test and verify red**

Run:

```bash
npx jest --runInBand src/app/components/Pages/FRONT_END/shop/__tests__/BannerSection.test.jsx
```

Expected: FAIL because the current band has no `py-6 sm:py-10` classes and no `search-panel-rail`.

- [ ] **Step 3: Implement the responsive band and rail**

Replace the direct shared-search child with:

```jsx
<div className={`weelp-hero-rise relative z-10 bg-weelp-sage-deep py-6 sm:py-10 shop_banner ${styles.shop_banner}`}>
  <div data-testid="search-panel-rail" className="container-page flex justify-center">
    <ResultsActivityItinerarySearch initialQuery={searchParams.toString()} />
  </div>
</div>
```

This produces 24px vertical padding below `sm`, 40px at `sm` and above, and 16/24/32px canonical horizontal gutters without duplicating padding utilities.

- [ ] **Step 4: Run the banner test and verify green**

Run:

```bash
npx jest --runInBand src/app/components/Pages/FRONT_END/shop/__tests__/BannerSection.test.jsx
```

Expected: PASS.

- [ ] **Step 5: Run the post-change gates**

Run:

```bash
npm run type-check
npm run lint
agent-browser --session weelp-visible --headed --args "--no-sandbox" open \
  'http://localhost:3000/search?location=dubai&start_date=2026-08-10&end_date=2026-08-14&quantity=3'
```

At 320px, confirm 24px vertical spacing and no horizontal overflow. At 1280px,
confirm 40px vertical spacing and a centered panel. Expected: all static gates
pass and the visible page retains hydrated Dubai/date/guest values.

- [ ] **Step 6: Commit the search-band change**

```bash
git add src/app/components/Pages/FRONT_END/shop/BannerSection.jsx src/app/components/Pages/FRONT_END/shop/__tests__/BannerSection.test.jsx
git commit -m "style(search): restore results panel spacing"
```

### Task 2: Add responsive mobile filter disclosure

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/shop/SearchPage.jsx`
- Test: `src/app/components/Pages/FRONT_END/shop/__tests__/SearchPage.test.jsx`

- [ ] **Step 1: Write the failing mobile disclosure test**

Add a test that asserts the initial collapsed state, semantic relationship, and toggle behavior:

```jsx
it('keeps mobile filters collapsed until requested', async () => {
  const { SearchPage } = await import('../SearchPage');
  render(<SearchPage />);

  const filtersButton = await screen.findByRole('button', { name: /filters/i });
  const filtersPanel = screen.getByTestId('search-filters');

  expect(filtersButton).toHaveAttribute('aria-expanded', 'false');
  expect(filtersButton).toHaveAttribute('type', 'button');
  expect(filtersButton).toHaveAttribute('aria-controls', 'search-results-filters');
  expect(filtersButton).toHaveClass('h-11');
  expect(filtersPanel).toHaveAttribute('id', 'search-results-filters');
  expect(filtersPanel).toHaveClass('hidden', 'md:block');

  filtersButton.focus();
  fireEvent.keyDown(filtersButton, { key: 'Enter' });
  fireEvent.click(filtersButton, { detail: 0 });

  expect(filtersButton).toHaveAttribute('aria-expanded', 'true');
  expect(filtersButton).toHaveFocus();
  expect(filtersPanel).toHaveClass('block');
  expect(filtersPanel).not.toHaveClass('hidden');
});
```

Add a layout-contract test:

```jsx
it('uses the canonical results rail and a compact mobile toolbar', async () => {
  const { SearchPage } = await import('../SearchPage');
  render(<SearchPage />);

  expect(await screen.findByTestId('search-results-toolbar')).toHaveClass('container-page');
  expect(screen.getByTestId('search-results-layout')).toHaveClass('container-page', 'flex-col', 'md:flex-row', 'md:gap-4', 'lg:gap-8');
  expect(screen.getByTestId('search-filters')).toHaveClass('md:block', 'md:max-w-xs', 'md:flex-none', 'md:shadow-md', 'dark:md:shadow-none');
  expect(screen.getByRole('combobox', { name: /sort/i })).toHaveClass('h-11');
  expect(screen.getByTestId('search-results')).toHaveClass('min-w-0', 'flex-1');
});
```

Add a disclosure-preservation test using a resolved result:

```jsx
it('preserves filter, sort, and result state when mobile filters close and reopen', async () => {
  axios.get.mockImplementation((url) => {
    if (url === '/api/public/regions-cities') {
      return Promise.resolve({ data: { data: locations } });
    }
    if (url === '/api/public/taxonomies/categories') {
      return Promise.resolve({ data: { data: categories } });
    }
    if (url.startsWith('/api/public/search')) {
      return Promise.resolve({
        status: 200,
        data: { data: [{ id: 1, name: 'Dubai Walk' }] },
      });
    }
    return Promise.reject(new Error(`Unhandled URL: ${url}`));
  });

  const { SearchPage } = await import('../SearchPage');
  render(<SearchPage />);

  expect(await screen.findByText('Dubai Walk')).toBeInTheDocument();
  const filtersButton = screen.getByRole('button', { name: /filters/i });
  fireEvent.click(filtersButton);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Adventure' }));
  fireEvent.change(screen.getByLabelText('Search locations'), {
    target: { value: 'dub' },
  });

  fireEvent.click(screen.getByRole('combobox', { name: /sort/i }));
  fireEvent.click(await screen.findByRole('option', { name: 'Price Low to High' }));
  fireEvent.click(filtersButton);
  fireEvent.click(filtersButton);

  expect(screen.getByRole('checkbox', { name: 'Adventure' })).toBeChecked();
  expect(screen.getByLabelText('Search locations')).toHaveValue('dub');
  expect(screen.getByRole('combobox', { name: /sort/i })).toHaveTextContent('Price Low to High');
  expect(screen.getByText('Dubai Walk')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the SearchPage test and verify red**

Run:

```bash
npx jest --runInBand src/app/components/Pages/FRONT_END/shop/__tests__/SearchPage.test.jsx
```

Expected: FAIL because the Filters button and responsive test IDs/classes do not exist.

- [ ] **Step 3: Add disclosure state and the mobile toolbar control**

Import `SlidersHorizontal` from `lucide-react`, add:

```jsx
const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
```

Replace the current sort wrapper with:

```jsx
<div data-testid="search-results-toolbar" className="container-page flex items-center gap-3 py-4 sm:py-6">
  <Button
    type="button"
    variant="outline"
    aria-controls="search-results-filters"
    aria-expanded={mobileFiltersOpen}
    onClick={() => setMobileFiltersOpen((isOpen) => !isOpen)}
    className="h-11 flex-1 justify-center gap-2 md:hidden"
  >
    <SlidersHorizontal className="size-4" aria-hidden="true" />
    Filters
  </Button>
  <Select value={sortby} onValueChange={setSortby}>
    <SelectTrigger aria-label="Sort results" className="ml-auto h-11 w-full max-w-[180px]">
      <SelectValue placeholder="Sort" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel className="hidden">Sorting Options</SelectLabel>
        {sortData.map((item) => (
          <SelectItem className="cursor-pointer" value={item.value} key={item.value}>
            {item.name}
          </SelectItem>
        ))}
      </SelectGroup>
    </SelectContent>
  </Select>
</div>
```

- [ ] **Step 4: Make the existing filter rail responsive without duplicating state**

Change the outer content layout and filter wrapper to:

```jsx
<div data-testid="search-results-layout" className="container-page flex flex-col gap-6 pb-10 md:flex-row md:items-start md:gap-4 lg:gap-8">
  <aside
    id="search-results-filters"
    data-testid="search-filters"
    className={`w-full rounded-lg bg-background p-4 shadow-none md:block md:max-w-xs md:flex-none md:shadow-md dark:md:shadow-none ${mobileFiltersOpen ? 'block' : 'hidden'}`}
  >
    {/* keep the existing filter controls and handlers unchanged */}
  </aside>

  <div data-testid="search-results" className="flex min-w-0 w-full flex-1 items-center justify-center">
    {/* keep the existing loading, cards, and empty state unchanged */}
  </div>
</div>
```

Do not reset `mobileFiltersOpen` when a filter changes. The existing category,
price, rating, location, sort, URL hydration, debounce, and stale-response logic
remain untouched.

- [ ] **Step 5: Run the SearchPage test and verify green**

Run:

```bash
npx jest --runInBand src/app/components/Pages/FRONT_END/shop/__tests__/SearchPage.test.jsx
```

Expected: all SearchPage tests PASS.

- [ ] **Step 6: Run the focused search-page regression suites**

Run:

```bash
npx jest --runInBand \
  src/app/components/Pages/FRONT_END/shop/__tests__/BannerSection.test.jsx \
  src/app/components/Pages/FRONT_END/shop/__tests__/SearchPage.test.jsx \
  src/app/components/Pages/FRONT_END/shared/__tests__/ActivityItinerarySearch.test.jsx
```

Expected: all suites PASS with no new console warnings.

- [ ] **Step 7: Run the post-change gates**

Before committing, run:

```bash
npm run type-check
npm run lint
agent-browser --session weelp-visible --headed --args "--no-sandbox" open \
  'http://localhost:3000/search?location=dubai&start_date=2026-08-10&end_date=2026-08-14&quantity=3'
```

At 320px, focus Filters and press Enter, confirm it expands, then press Enter
again and confirm the result card returns immediately after the toolbar. At
1280px, confirm the desktop rail remains visible with its prior width, gap, and
light-theme shadow. Expected: all gates pass with no browser errors.

- [ ] **Step 8: Commit the responsive results layout**

```bash
git add src/app/components/Pages/FRONT_END/shop/SearchPage.jsx src/app/components/Pages/FRONT_END/shop/__tests__/SearchPage.test.jsx
git commit -m "style(search): optimize mobile results layout"
```

### Task 3: Verify quality and responsive behavior

**Files:**

- Verify only; no planned production-file changes

- [ ] **Step 1: Run static quality gates**

```bash
npm run type-check
npm run lint
git diff --check
```

Expected: all commands exit successfully.

- [ ] **Step 2: Run the complete frontend test suite**

```bash
NODE_OPTIONS=--max-old-space-size=8192 npm run test:ci -- --runInBand
```

Expected: all suites PASS. Existing unrelated `act(...)` warnings may remain,
but the changed search suites produce no new warnings.

- [ ] **Step 3: Run the production build**

```bash
npm run build
```

Expected: the Next.js production build completes successfully.

- [ ] **Step 4: Verify in the visible headed browser**

Use the named visible session:

```bash
agent-browser --session weelp-visible --headed --args "--no-sandbox" open \
  'http://localhost:3000/search?location=dubai&start_date=2026-08-10&end_date=2026-08-14&quantity=3'
```

At 320px and 375px:

- Search band has 24px top and bottom breathing room.
- Location, dates, guests, and Search remain legible without horizontal overflow.
- Filters is collapsed by default.
- The first real result card is visible within the initial 900px viewport
  without scrolling.
- The result area follows the toolbar before the filter contents.
- Keyboard activation opens and closes Filters while preserving selected
  category, location query, sort, Dubai/date/guest state, and rendered results.

At 768px and 1280px:

- Search band has 40px top and bottom breathing room.
- The search panel is centered on the canonical rail.
- The desktop filter rail remains visible beside results.
- No horizontal overflow or browser errors appear.

Run these explicit viewport commands:

```bash
agent-browser --session weelp-visible set viewport 320 900
agent-browser --session weelp-visible set viewport 375 900
agent-browser --session weelp-visible set viewport 768 900
agent-browser --session weelp-visible set viewport 1280 900
```

At each width, measure:

```js
document.documentElement.scrollWidth <= document.documentElement.clientWidth;
```

Expected: `true` at all four widths.

- [ ] **Step 5: Run the mandatory final review loop**

Dispatch the code-reviewer agent against the implementation diff and approved
design spec. Address all critical findings, re-run affected tests, and request
re-review until approved. Then invoke `simplify`; if the skill is unavailable,
perform and report an equivalent manual clarity/reuse pass. Re-run affected
tests, type-check, and lint after any review or simplification edit, then commit
those edits before pushing.

- [ ] **Step 6: Push verified commits to `main`**

```bash
git branch --show-current
git status --short
git push origin main
```

Expected: branch is `main`, worktree is clean, and the push is confirmed.
