# Shared Activity and Itinerary Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace duplicated activity-and-itinerary search panels with one shared implementation, remove the unnecessary `From` field, and hydrate the `/search` panel from its canonical URL parameters.

**Architecture:** A small pure helper module will own URL parsing and serialization. One client-side search implementation will own location, date, guest, preview, and navigation behavior; named presentation wrappers will expose home, compact, results-page, and modal variants without duplicating state. The existing `/homesearch` service remains the single activity-and-itinerary API.

**Tech Stack:** Next.js 16 App Router, React 19, React Hook Form, Radix Popover, SWR-backed location data, Jest, React Testing Library

---

## File map

**Create**

- `src/app/components/Pages/FRONT_END/shared/discoverySearchParams.js` — canonical URL parser, serializer, and safe defaults.
- `src/app/components/Pages/FRONT_END/shared/ActivityItinerarySearch.jsx` — shared state/behavior plus explicit presentation exports.
- `src/app/components/Pages/FRONT_END/shared/__tests__/discoverySearchParams.test.js` — pure URL contract tests.
- `src/app/components/Pages/FRONT_END/shared/__tests__/ActivityItinerarySearch.test.jsx` — shared UI, preview, navigation, and hydration tests.

**Modify**

- `src/app/components/Pages/FRONT_END/home/HeroSearchPill.jsx` — render the home presentation.
- `src/app/components/Pages/FRONT_END/home/__tests__/HeroSection.test.jsx` — mock the shared home presentation if required by the existing hero test.
- `src/app/components/Pages/FRONT_END/tours/ToursHero.jsx` — render the compact presentation.
- `src/app/components/Pages/FRONT_END/tours/__tests__/ToursHero.test.jsx` — assert the shared compact presentation is mounted.
- `src/app/components/Pages/FRONT_END/holiday/BannerSection.jsx` — render the compact presentation.
- `src/app/components/Pages/FRONT_END/holiday/__tests__/BannerSection.test.jsx` — assert the shared compact presentation is mounted.
- `src/app/components/Pages/FRONT_END/shop/BannerSection.jsx` — pass the current query string to the results-page presentation.
- `src/app/components/Pages/FRONT_END/shop/__tests__/BannerSection.test.jsx` — verify query handoff.
- `src/app/components/Pages/FRONT_END/shop/SearchPage.jsx` — consume the canonical location slug without silently choosing a fallback destination.
- `src/app/components/Pages/FRONT_END/shop/__tests__/SearchPage.test.jsx` — verify slug matching, unknown-location behavior, and canonical API requests.
- `src/app/components/Modals/ModalForm.jsx` — render the modal presentation while preserving dialog lifecycle behavior.
- `src/app/components/Modals/__tests__/ModalForm.test.jsx` — mock the new shared modal presentation.
- `src/lib/services/tours.js` — remove the now-unused `toursSearch` frontend client while retaining featured-city fetching.

**Delete**

- `src/app/components/Pages/FRONT_END/home/FilterBar.jsx`
- `src/app/components/Pages/FRONT_END/home/__tests__/FilterBar.test.jsx`
- `src/app/components/Pages/FRONT_END/tours/ToursFilterBar.jsx`
- `src/app/components/Pages/FRONT_END/tours/__tests__/ToursFilterBar.test.jsx`

`src/app/components/Form/Form.jsx` remains for the out-of-scope taxi `/booking` page. Its tests remain unchanged.

### Task 0: Load the required implementation rules

**Files:**

- Read: `src/docs/superpowers/specs/2026-07-27-shared-activity-itinerary-search-design.md`
- Read: `src/docs/superpowers/plans/2026-07-27-shared-activity-itinerary-search.md`

- [ ] **Step 1: Invoke the implementation and Next.js skills**

Before editing production code, invoke and follow:

```text
superpowers:executing-plans
superpowers:test-driven-development
next-best-practices
vercel-react-best-practices
vercel-composition-patterns
```

- [ ] **Step 2: Apply the mandatory post-change gate after every task**

After each production-code task:

1. Invoke `error-handling-patterns` and inspect the changed paths.
2. Run the task’s targeted tests.
3. Run `npm run type-check`.
4. Run `npm run lint`.
5. For a reachable UI change, use the visible `weelp-visible` headed browser on the affected route before beginning the next task.

Do not defer a failing gate to the final verification task.

### Task 1: Establish the canonical query contract

**Files:**

- Create: `src/app/components/Pages/FRONT_END/shared/discoverySearchParams.js`
- Test: `src/app/components/Pages/FRONT_END/shared/__tests__/discoverySearchParams.test.js`

- [ ] **Step 1: Write failing parser and serializer tests**

Cover one behavior per test:

```js
import { buildDiscoverySearchUrl, parseDiscoverySearchParams } from '../discoverySearchParams';

describe('discoverySearchParams', () => {
  it('parses canonical location, dates, and quantity', () => {
    expect(parseDiscoverySearchParams('location=dubai&start_date=2026-08-10&end_date=2026-08-14&quantity=3')).toEqual({
      location: 'dubai',
      dateRange: {
        from: new Date(2026, 7, 10),
        to: new Date(2026, 7, 14),
      },
      guests: { adults: 3, children: 0, infants: 0 },
    });
  });

  it.each(['start_date=bad&end_date=2026-08-14', 'start_date=2026-08-20&end_date=2026-08-14', 'start_date=2026-02-30&end_date=2026-03-02', 'start_date=2026-08-10', 'end_date=2026-08-14'])(
    'ignores an invalid date range from %s',
    (query) => {
      expect(parseDiscoverySearchParams(query).dateRange).toEqual({ from: null, to: null });
    },
  );

  it('accepts a valid leap day and trims an encoded location', () => {
    const parsed = parseDiscoverySearchParams('location=%20new-york%20&start_date=2028-02-29&end_date=2028-03-01&quantity=2');

    expect(parsed.location).toBe('new-york');
    expect(parsed.dateRange.from).toEqual(new Date(2028, 1, 29));
  });

  it.each(['', 'quantity=0', 'quantity=-2', 'quantity=2.5', 'quantity=nope'])('falls back to one adult for %s', (query) => {
    expect(parseDiscoverySearchParams(query).guests).toEqual({
      adults: 1,
      children: 0,
      infants: 0,
    });
  });

  it('serializes the canonical result URL', () => {
    expect(
      buildDiscoverySearchUrl({
        location: 'dubai',
        dateRange: {
          from: new Date(2026, 7, 10),
          to: new Date(2026, 7, 14),
        },
        guests: { adults: 1, children: 1, infants: 1 },
      }),
    ).toBe('/search?location=dubai&start_date=2026-08-10&end_date=2026-08-14&quantity=3');
  });

  it('omits invalid location and date values while preserving a safe quantity', () => {
    expect(
      buildDiscoverySearchUrl({
        location: '   ',
        dateRange: { from: new Date('invalid'), to: new Date(2026, 7, 14) },
        guests: { adults: -1, children: Number.NaN, infants: 0 },
      }),
    ).toBe('/search?quantity=1');
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
npm run test:ci -- --runInBand src/app/components/Pages/FRONT_END/shared/__tests__/discoverySearchParams.test.js
```

Expected: FAIL because `discoverySearchParams.js` does not exist.

- [ ] **Step 3: Implement the pure query helpers**

Implement these exports:

```js
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export const DEFAULT_DISCOVERY_GUESTS = Object.freeze({
  adults: 1,
  children: 0,
  infants: 0,
});

export const EMPTY_DISCOVERY_DATE_RANGE = Object.freeze({
  from: null,
  to: null,
});

function parseLocalDate(value) {
  const match = ISO_DATE_PATTERN.exec(value || '');
  if (!match) return null;

  const [, yearValue, monthValue, dayValue] = match;
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return date;
}

export function formatDiscoveryDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizeGuestCount(value) {
  return Number.isInteger(value) && value >= 0 ? value : 0;
}

export function parseDiscoverySearchParams(input) {
  const params = input instanceof URLSearchParams ? input : new URLSearchParams(input || '');
  const location = (params.get('location') || '').trim().toLowerCase();
  const from = parseLocalDate(params.get('start_date'));
  const to = parseLocalDate(params.get('end_date'));
  const hasValidRange = from && to && from.getTime() <= to.getTime();
  const quantityValue = Number(params.get('quantity'));
  const quantity = Number.isInteger(quantityValue) && quantityValue > 0 ? quantityValue : 1;

  return {
    location,
    dateRange: hasValidRange ? { from, to } : { ...EMPTY_DISCOVERY_DATE_RANGE },
    guests: { adults: quantity, children: 0, infants: 0 },
  };
}

export function buildDiscoverySearchUrl({ location, dateRange, guests }) {
  const params = new URLSearchParams();
  const normalizedLocation = typeof location === 'string' ? location.trim().toLowerCase() : '';
  const from = formatDiscoveryDate(dateRange?.from);
  const to = formatDiscoveryDate(dateRange?.to);

  if (normalizedLocation) params.set('location', normalizedLocation);
  if (from && to && dateRange.from.getTime() <= dateRange.to.getTime()) {
    params.set('start_date', from);
    params.set('end_date', to);
  }

  const total = ['adults', 'children', 'infants'].reduce((sum, key) => sum + normalizeGuestCount(guests?.[key]), 0);
  params.set('quantity', String(Math.max(1, total)));

  return `/search?${params.toString()}`;
}
```

Use component-level date validation rather than `new Date(value)` so invalid calendar dates and UTC timezone shifts cannot enter the form state.

- [ ] **Step 4: Run the test and verify GREEN**

Run the Task 1 command again.

Expected: PASS with all parser and serializer cases green.

- [ ] **Step 5: Run the Task 0 post-change static gate**

Run:

```bash
npm run type-check
npm run lint
```

Expected: both commands exit 0. This task changes no rendered UI, so the visible-browser check begins with Task 3 when the shared component reaches a public route.

- [ ] **Step 6: Commit the query contract**

```bash
git add \
  src/app/components/Pages/FRONT_END/shared/discoverySearchParams.js \
  src/app/components/Pages/FRONT_END/shared/__tests__/discoverySearchParams.test.js
git commit -m "test(search): define discovery query contract"
```

### Task 2: Build the shared activity-and-itinerary panel

**Files:**

- Create: `src/app/components/Pages/FRONT_END/shared/ActivityItinerarySearch.jsx`
- Create: `src/app/components/Pages/FRONT_END/shared/__tests__/ActivityItinerarySearch.test.jsx`
- Reference: `src/app/components/Pages/FRONT_END/home/FilterBar.jsx`

- [ ] **Step 1: Write every shared presentation, parity, and regression test before implementation**

Mock `useCitiesRegions`, `homeSearch`, `useRouter`, and `useNavigationStore`. Reset every mock and the Zustand navigation state in `beforeEach`. Render each named export:

```jsx
import { CompactActivityItinerarySearch, HomeActivityItinerarySearch, ModalActivityItinerarySearch, ResultsActivityItinerarySearch } from '../ActivityItinerarySearch';

it.each([
  ['home', <HomeActivityItinerarySearch />],
  ['compact', <CompactActivityItinerarySearch />],
  ['results', <ResultsActivityItinerarySearch />],
  ['modal', <ModalActivityItinerarySearch />],
])('%s exposes only Where, When, and Guests', async (_name, panel) => {
  renderWithSWR(panel);
  expect(await screen.findByRole('combobox', { name: /where to/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /choose dates/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /choose guests/i })).toBeInTheDocument();
  expect(screen.queryByPlaceholderText(/from/i)).not.toBeInTheDocument();
});
```

Add separate tests that the named wrappers expose their intended action labels and layout markers, without asserting internal implementation details.

Port the meaningful behavior coverage from the old home `FilterBar` suite before creating the shared component:

- Location filtering and slug selection
- Calendar and guest popovers
- Preview loading skeleton
- Five-result cap
- Stale preview response suppression
- Guest count animation and reduced-motion classes
- Failed preview preserving selected form state

Add the regression coverage:

```jsx
it('hydrates location, dates, and guest quantity from the results query', async () => {
  renderWithSWR(<ResultsActivityItinerarySearch initialQuery="location=dubai&start_date=2026-08-10&end_date=2026-08-14&quantity=3" />);

  expect(await screen.findByRole('combobox', { name: /where to/i })).toHaveValue('Dubai');
  expect(screen.getByRole('button', { name: /choose dates/i })).toHaveTextContent('Aug 10 - Aug 14');
  expect(screen.getByTestId('discovery-guest-total')).toHaveTextContent('3 Guests');
});

it('clears an unknown URL location instead of submitting a hidden slug', async () => {
  renderWithSWR(<ResultsActivityItinerarySearch initialQuery="location=unknown-place&quantity=2" />);

  await waitFor(() => expect(mockUseCitiesRegions).toHaveBeenCalled());
  expect(screen.getByRole('combobox', { name: /where to/i })).toHaveValue('');
  fireEvent.click(screen.getByRole('button', { name: /search trips/i }));
  expect(pushMock).toHaveBeenCalledWith('/search?quantity=2');
});

it('synchronizes when the mounted results query changes', async () => {
  const { rerender } = renderWithSWR(<ResultsActivityItinerarySearch initialQuery="location=dubai&quantity=2" />);
  expect(await screen.findByRole('combobox', { name: /where to/i })).toHaveValue('Dubai');

  rerender(
    <SWRConfig value={{ provider: () => new Map() }}>
      <ResultsActivityItinerarySearch initialQuery="location=paris&quantity=4" />
    </SWRConfig>,
  );

  expect(await screen.findByRole('combobox', { name: /where to/i })).toHaveValue('Paris');
  expect(screen.getByTestId('discovery-guest-total')).toHaveTextContent('4 Guests');
});

it('does not let late location hydration overwrite a user edit', async () => {
  mockUseCitiesRegions.mockReturnValue({ data: [], loading: true });
  const { rerender } = renderWithSWR(<ResultsActivityItinerarySearch initialQuery="location=dubai&quantity=1" />);

  fireEvent.change(screen.getByRole('combobox', { name: /where to/i }), {
    target: { value: 'Par' },
  });
  mockUseCitiesRegions.mockReturnValue({
    data: [
      { id: 1, name: 'Dubai', slug: 'dubai', type: 'city' },
      { id: 2, name: 'Paris', slug: 'paris', type: 'city' },
    ],
    loading: false,
  });
  rerender(
    <SWRConfig value={{ provider: () => new Map() }}>
      <ResultsActivityItinerarySearch initialQuery="location=dubai&quantity=1" />
    </SWRConfig>,
  );

  expect(screen.getByRole('combobox', { name: /where to/i })).toHaveValue('Par');
});

it('submits the exact canonical values currently shown in the panel', async () => {
  renderWithSWR(<ResultsActivityItinerarySearch initialQuery="location=dubai&start_date=2026-08-10&end_date=2026-08-14&quantity=2" />);

  expect(await screen.findByRole('combobox', { name: /where to/i })).toHaveValue('Dubai');
  fireEvent.click(screen.getByRole('button', { name: /search trips/i }));
  expect(pushMock).toHaveBeenCalledWith('/search?location=dubai&start_date=2026-08-10&end_date=2026-08-14&quantity=2');
});
```

Add direct accessibility assertions:

```jsx
expect(screen.getByRole('button', { name: /increase children/i })).toHaveClass('size-11');
fireEvent.click(screen.getByRole('button', { name: /choose guests/i }));
expect(await screen.findByRole('dialog', { name: /guest selector/i })).toBeInTheDocument();
fireEvent.keyDown(screen.getByRole('dialog', { name: /guest selector/i }), { key: 'Escape' });
await waitFor(() => expect(screen.queryByRole('dialog', { name: /guest selector/i })).not.toBeInTheDocument());
```

Add a navigation-loader ordering assertion:

```jsx
fireEvent.click(screen.getByRole('button', { name: /search trips/i }));
expect(setNavigatingMock).toHaveBeenCalledWith(true);
expect(setNavigatingMock.mock.invocationCallOrder[0]).toBeLessThan(pushMock.mock.invocationCallOrder[0]);
```

The visible-browser task, not jsdom, proves native/Radix Enter, Space, Tab, and Escape behavior.

- [ ] **Step 2: Run the shared component test and verify RED**

Run:

```bash
npm run test:ci -- --runInBand src/app/components/Pages/FRONT_END/shared/__tests__/ActivityItinerarySearch.test.jsx
```

Expected: FAIL because the shared component module does not exist. All shared behavior tests must exist before Step 3.

- [ ] **Step 3: Extract the existing home behavior into one internal implementation**

Move the location, calendar, guest, preview, stale-request protection, and `/homesearch` behavior from the current home `FilterBar` into `ActivityItinerarySearch.jsx`.

Expose only these public presentation components:

```jsx
export function HomeActivityItinerarySearch(props) {
  return <ActivityItinerarySearch presentation="home" {...props} />;
}

export function CompactActivityItinerarySearch(props) {
  return <ActivityItinerarySearch presentation="compact" {...props} />;
}

export function ResultsActivityItinerarySearch(props) {
  return <ActivityItinerarySearch presentation="results" {...props} />;
}

export function ModalActivityItinerarySearch(props) {
  return <ActivityItinerarySearch presentation="modal" {...props} />;
}
```

The internal component must:

- Keep one React Hook Form state for the location slug, date range, and guest breakdown.
- Keep the visible location label separate from the slug.
- Use `homeSearch` for previews.
- Use the existing `mapProductToItemCard` adapter.
- Keep one preview request sequence ref so stale requests cannot overwrite current results.
- Render one location, one date, and one guest control in every presentation.
- Render a navigation action in every presentation.
- Use `useNavigationStore().setNavigating(true)` immediately before `router.push(buildDiscoverySearchUrl(...))` so form submission participates in the existing route loader.
- Call `onSearchStart` before modal navigation and show the existing loader while `isSearching` is true.
- Accept `controlsSlot` for the dialog close control.
- Preserve accessible Radix Popover labels, focus rings, reduced-motion classes, and minimum 44px guest stepper targets.
- Use `NavigationLink` for preview rows, detail destinations, and “See all” links; do not retain direct `next/link` imports.
- Treat `initialQuery` changes as authoritative: parse them, call React Hook Form `reset`, and update pending location hydration for browser Back/Forward and same-mounted `/search` navigation.
- Track whether the user edited location after the current query arrived. A late city/region response may apply a matching label only when the query is still current and the user has not edited the field.
- Do not put a parsed location slug into `whereTo` until the loaded city/region list confirms it. If no match exists, clear both slug and visible label.

Use explicit presentation class maps at module scope. Do not create four copies of the form or add independent presentation state.

- [ ] **Step 4: Run all shared tests and verify GREEN**

Run the Task 2 command again.

Expected: every presentation, behavior-parity, URL-sync, unknown-location, stale-response, and accessibility test passes.

- [ ] **Step 5: Run the Task 0 post-change gate**

Run:

```bash
npm run test:ci -- --runInBand \
  src/app/components/Pages/FRONT_END/shared/__tests__/discoverySearchParams.test.js \
  src/app/components/Pages/FRONT_END/shared/__tests__/ActivityItinerarySearch.test.jsx
npm run type-check
npm run lint
```

Expected: PASS with no React act warnings or console errors.

- [ ] **Step 6: Commit the shared component**

```bash
git add \
  src/app/components/Pages/FRONT_END/shared/ActivityItinerarySearch.jsx \
  src/app/components/Pages/FRONT_END/shared/__tests__/ActivityItinerarySearch.test.jsx
git commit -m "feat(search): add shared discovery panel"
```

### Task 3: Replace home, tours, and holiday duplicates

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/home/HeroSearchPill.jsx`
- Modify: `src/app/components/Pages/FRONT_END/home/__tests__/HeroSection.test.jsx`
- Modify: `src/app/components/Pages/FRONT_END/tours/ToursHero.jsx`
- Modify: `src/app/components/Pages/FRONT_END/tours/__tests__/ToursHero.test.jsx`
- Modify: `src/app/components/Pages/FRONT_END/holiday/BannerSection.jsx`
- Modify: `src/app/components/Pages/FRONT_END/holiday/__tests__/BannerSection.test.jsx`
- Modify: `src/lib/services/tours.js`
- Delete: `src/app/components/Pages/FRONT_END/home/FilterBar.jsx`
- Delete: `src/app/components/Pages/FRONT_END/home/__tests__/FilterBar.test.jsx`
- Delete: `src/app/components/Pages/FRONT_END/tours/ToursFilterBar.jsx`
- Delete: `src/app/components/Pages/FRONT_END/tours/__tests__/ToursFilterBar.test.jsx`

- [ ] **Step 1: Update route-level tests first**

Mock the named shared exports and assert each hero mounts the correct presentation:

```jsx
jest.mock('../../shared/ActivityItinerarySearch', () => ({
  HomeActivityItinerarySearch: () => <div data-testid="home-discovery-search" />,
  CompactActivityItinerarySearch: () => <div data-testid="compact-discovery-search" />,
}));
```

The tours test must additionally assert that no `From` input is rendered by the real shared component in the shared component suite, not through a mock.

- [ ] **Step 2: Run route tests and verify RED**

Run:

```bash
npm run test:ci -- --runInBand \
  src/app/components/Pages/FRONT_END/home/__tests__/HeroSection.test.jsx \
  src/app/components/Pages/FRONT_END/tours/__tests__/ToursHero.test.jsx \
  src/app/components/Pages/FRONT_END/holiday/__tests__/BannerSection.test.jsx
```

Expected: FAIL because the routes still import their old components.

- [ ] **Step 3: Replace route imports and remove duplicates**

Use these route-level components:

```jsx
// HeroSearchPill.jsx
<HomeActivityItinerarySearch />

// ToursHero.jsx and holiday/BannerSection.jsx
<CompactActivityItinerarySearch />
```

Keep each hero’s existing wrappers, animation delays, spacing, globe, and decoration unchanged. Delete both old filter implementations and their superseded component-specific tests after the shared suite carries their behavior coverage.

Remove only the `toursSearch` export from `src/lib/services/tours.js`; retain `getFeaturedCitiesWithStartingPrice`.

- [ ] **Step 4: Run route and shared tests and verify GREEN**

Run the Task 2 two-file command followed by the Task 3 route command.

Expected: all shared and route tests PASS.

- [ ] **Step 5: Run the post-change static and visible-browser gate**

Run:

```bash
npm run type-check
npm run lint
agent-browser --session weelp-visible --headed --args "--no-sandbox" open http://localhost:3000/tours-experiences
agent-browser --session weelp-visible snapshot -i -c
agent-browser --session weelp-visible open http://localhost:3000/holiday
agent-browser --session weelp-visible snapshot -i -c
```

Expected: static checks exit 0; both visible pages expose only Where, When, Guests, and the search action.

- [ ] **Step 6: Confirm no stale imports remain**

Run:

```bash
rg -n "home/FilterBar|ToursFilterBar|toursSearch" src
```

Expected: no production-code matches.

- [ ] **Step 7: Commit the public hero migration**

```bash
git add \
  src/app/components/Pages/FRONT_END/home/HeroSearchPill.jsx \
  src/app/components/Pages/FRONT_END/home/__tests__/HeroSection.test.jsx \
  src/app/components/Pages/FRONT_END/home/FilterBar.jsx \
  src/app/components/Pages/FRONT_END/home/__tests__/FilterBar.test.jsx \
  src/app/components/Pages/FRONT_END/tours/ToursHero.jsx \
  src/app/components/Pages/FRONT_END/tours/__tests__/ToursHero.test.jsx \
  src/app/components/Pages/FRONT_END/tours/ToursFilterBar.jsx \
  src/app/components/Pages/FRONT_END/tours/__tests__/ToursFilterBar.test.jsx \
  src/app/components/Pages/FRONT_END/holiday/BannerSection.jsx \
  src/app/components/Pages/FRONT_END/holiday/__tests__/BannerSection.test.jsx \
  src/lib/services/tours.js
git commit -m "refactor(search): share public discovery panel"
```

### Task 4: Hydrate the results page and migrate the header modal

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/shop/BannerSection.jsx`
- Modify: `src/app/components/Pages/FRONT_END/shop/__tests__/BannerSection.test.jsx`
- Modify: `src/app/components/Pages/FRONT_END/shop/SearchPage.jsx`
- Modify: `src/app/components/Pages/FRONT_END/shop/__tests__/SearchPage.test.jsx`
- Modify: `src/app/components/Modals/ModalForm.jsx`
- Modify: `src/app/components/Modals/__tests__/ModalForm.test.jsx`

- [ ] **Step 1: Write failing search-banner query handoff test**

Mock `ResultsActivityItinerarySearch`, return a known `URLSearchParams`, and assert:

```jsx
expect(ResultsActivityItinerarySearchMock).toHaveBeenCalledWith(
  expect.objectContaining({
    initialQuery: 'location=dubai&start_date=2026-08-10&end_date=2026-08-14&quantity=3',
  }),
  undefined,
);
```

- [ ] **Step 2: Update the modal mock contract before production code**

Replace the old `BookingForm` mock with `ModalActivityItinerarySearch`. Preserve assertions for:

- `controlsSlot`
- `isSearching`
- `onSearchStart`
- Submit loader
- Close-after-navigation behavior
- Focus entry and restoration
- Background `inert` restoration

- [ ] **Step 3: Add failing canonical results-list tests**

Add slugs to every existing location fixture. Replace the custom `{ get: jest.fn(...) }` `useSearchParams` mock in `beforeEach` with a real query object so `searchParams.toString()` behaves like Next.js:

```jsx
useSearchParams.mockReturnValue(new URLSearchParams('location=dubai&start_date=2026-07-01&end_date=2026-07-03&quantity=2'));
```

Then assert the results list shares the URL contract:

```jsx
it('matches a canonical location slug and sends the slug to search', async () => {
  useSearchParams.mockReturnValue(new URLSearchParams('location=new-york&start_date=2026-08-10&end_date=2026-08-14&quantity=2'));
  axios.get.mockImplementation(
    searchApiMockWithLocations([
      { id: 1, name: 'New York', slug: 'new-york' },
      { id: 2, name: 'Paris', slug: 'paris' },
    ]),
  );

  render(<SearchPage />);

  await waitFor(() => expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('location=new-york')));
  expect(screen.getByRole('radio', { name: /new york/i })).toBeChecked();
});

it('does not select or search the first location for an unknown slug', async () => {
  useSearchParams.mockReturnValue(new URLSearchParams('location=unknown-place&start_date=2026-08-10&end_date=2026-08-14&quantity=2'));

  render(<SearchPage />);

  await screen.findByText('Dubai');
  const locationRadios = within(screen.getByTestId('location-filter-options')).getAllByRole('radio');
  expect(locationRadios.every((radio) => !radio.checked)).toBe(true);
  expect(axios.get).not.toHaveBeenCalledWith(expect.stringContaining('/api/public/search?'));
});
```

Implement `searchApiMockWithLocations` in the test file as a local helper that returns regions/cities, categories, and empty search results using the existing mock shapes.

```jsx
function searchApiMockWithLocations(locationRows) {
  return (url) => {
    if (url === '/api/public/regions-cities') {
      return Promise.resolve({ data: { data: locationRows } });
    }
    if (url === '/api/public/taxonomies/categories') {
      return Promise.resolve({ data: { data: categories } });
    }
    if (url.startsWith('/api/public/search')) {
      return Promise.resolve({ status: 200, data: { data: [] } });
    }
    return Promise.reject(new Error(`Unhandled URL: ${url}`));
  };
}
```

- [ ] **Step 4: Run banner, results-list, and modal tests and verify RED**

Run:

```bash
npm run test:ci -- --runInBand \
  src/app/components/Pages/FRONT_END/shop/__tests__/BannerSection.test.jsx \
  src/app/components/Pages/FRONT_END/shop/__tests__/SearchPage.test.jsx \
  src/app/components/Modals/__tests__/ModalForm.test.jsx
```

Expected: FAIL because the banner and modal still import `BookingForm`, while `SearchPage` still matches only by name and selects the first location.

- [ ] **Step 5: Replace both shared-panel call sites**

In the search banner:

```jsx
const searchParams = useSearchParams();
const initialQuery = searchParams.toString();

<ResultsActivityItinerarySearch initialQuery={initialQuery} />;
```

In the modal:

```jsx
<ModalActivityItinerarySearch controlsSlot={closeControl} isSearching={isSearching} onSearchStart={() => setIsSearching(true)} />
```

Keep the current search-banner stacking context, heading, dialog portal, focus management, modal close behavior, and inert handling unchanged.

- [ ] **Step 6: Make the results list consume the canonical parser**

In `SearchPage.jsx`:

```jsx
const parsedSearch = parseDiscoverySearchParams(searchParams.toString());

setStartDate(formatDiscoveryDate(parsedSearch.dateRange.from) || '');
setEndDate(formatDiscoveryDate(parsedSearch.dateRange.to) || '');
setQuantity(parsedSearch.guests.adults);

const foundLocation = allLocations.find((location) => {
  const slug = String(location.slug || '')
    .trim()
    .toLowerCase();
  const name = String(location.name || '')
    .trim()
    .toLowerCase();
  return slug === parsedSearch.location || name === parsedSearch.location;
});
setSelectedLocation(foundLocation || null);
```

Export `formatDiscoveryDate` from the pure helper rather than duplicating date formatting.

When building the API query:

```jsx
location: String(selectedLocation.slug || selectedLocation.name).trim().toLowerCase(),
```

Keep the existing `if (!selectedLocation || !startDate || !endDate) return;` guard so unknown locations and incomplete/invalid ranges do not search silently.

- [ ] **Step 7: Run banner, results-list, modal, and shared tests and verify GREEN**

Run the Task 4 command and the Task 2 two-file command.

Expected: PASS with the results query passed intact, canonical slug requests, no first-location fallback, and modal lifecycle behavior preserved.

- [ ] **Step 8: Run the post-change static and visible-browser gate**

Run:

```bash
npm run type-check
npm run lint
agent-browser --session weelp-visible open "http://localhost:3000/search?location=dubai&start_date=2026-08-10&end_date=2026-08-14&quantity=3"
agent-browser --session weelp-visible snapshot -i -c
```

Expected: checks exit 0 and the visible results panel shows Dubai, Aug 10–14, and 3 Guests.

- [ ] **Step 9: Commit the results and modal migration**

```bash
git add \
  src/app/components/Pages/FRONT_END/shop/BannerSection.jsx \
  src/app/components/Pages/FRONT_END/shop/__tests__/BannerSection.test.jsx \
  src/app/components/Pages/FRONT_END/shop/SearchPage.jsx \
  src/app/components/Pages/FRONT_END/shop/__tests__/SearchPage.test.jsx \
  src/app/components/Modals/ModalForm.jsx \
  src/app/components/Modals/__tests__/ModalForm.test.jsx
git commit -m "fix(search): hydrate shared result filters"
```

### Task 5: Error handling and complete automated verification

**Files:**

- Review all files changed in Tasks 1–4.

- [ ] **Step 1: Apply the error-handling review**

Use the `error-handling-patterns` skill and verify:

- Invalid URL input becomes safe local defaults rather than thrown errors.
- Location-fetch failure leaves the location unselected.
- Preview failure shows an empty result state while keeping user input.
- Stale preview responses cannot overwrite current results.
- Unexpected programming errors are not silently swallowed outside the existing preview boundary.

- [ ] **Step 2: Run targeted tests**

Run:

```bash
npm run test:ci -- --runInBand \
  src/app/components/Pages/FRONT_END/shared/__tests__/discoverySearchParams.test.js \
  src/app/components/Pages/FRONT_END/shared/__tests__/ActivityItinerarySearch.test.jsx \
  src/app/components/Pages/FRONT_END/home/__tests__/HeroSection.test.jsx \
  src/app/components/Pages/FRONT_END/tours/__tests__/ToursHero.test.jsx \
  src/app/components/Pages/FRONT_END/holiday/__tests__/BannerSection.test.jsx \
  src/app/components/Pages/FRONT_END/shop/__tests__/BannerSection.test.jsx \
  src/app/components/Pages/FRONT_END/shop/__tests__/SearchPage.test.jsx \
  src/app/components/Modals/__tests__/ModalForm.test.jsx
```

Expected: all listed suites PASS with zero failed tests.

- [ ] **Step 3: Run the required static checks in order**

Run:

```bash
npm run type-check
npm run lint
```

Expected: both commands exit 0 with no warnings.

- [ ] **Step 4: Run the complete test suite safely**

Run:

```bash
NODE_OPTIONS=--max-old-space-size=8192 npm run test:ci -- --runInBand
```

Expected: all suites PASS. If the previously documented cumulative Jest heap issue recurs, record the failing suite and verify it in isolation; do not label a real assertion failure as an infrastructure issue.

- [ ] **Step 5: Run the production build**

Run:

```bash
npm run build
```

Expected: Next.js build exits 0 and includes `/`, `/tours-experiences`, `/holiday`, and `/search`.

### Task 6: Visible browser verification

**Files:**

- No source changes unless verification exposes a defect; any fix starts a new RED/GREEN test cycle.

- [ ] **Step 1: Keep the required headed session visible**

Run:

```bash
agent-browser --session weelp-visible --headed --args "--no-sandbox" open http://localhost:3000/
```

If an existing daemon ignores `--headed`, close only `weelp-visible` and reopen it headed before continuing.

- [ ] **Step 2: Verify the home-to-results round trip**

In the visible browser:

1. Select a destination.
2. Select a future date range.
3. Set the guest total above one.
4. Submit.
5. Confirm the URL contains canonical `location`, `start_date`, `end_date`, and `quantity`.
6. Confirm the `/search` panel visibly shows the same destination, dates, and guest total.

- [ ] **Step 3: Verify `/tours-experiences`**

Confirm:

- There is no `From` field.
- `Where`, `When`, `Guests`, and the search action are present.
- Location preview results still use activity/itinerary rows.
- Submitting preserves the chosen values on `/search`.

- [ ] **Step 4: Verify all in-scope presentations responsively**

Check `/`, `/tours-experiences`, `/holiday`, `/search`, and the header modal at:

```text
320 × 900
768 × 900
1280 × 900
```

At each width verify no horizontal overflow, popovers stay within the viewport, controls remain keyboard reachable, and the home presentation remains visually distinct.

For keyboard behavior at each presentation:

1. Press Tab until the Where control is focused.
2. Press Enter, use Arrow Down, and press Enter to select a location.
3. Tab to When and press Enter or Space to open the calendar.
4. Press Escape and confirm focus returns to the date trigger.
5. Tab to Guests, press Enter, operate a guest stepper, and press Escape.
6. Tab to the search action and press Enter to navigate.

- [ ] **Step 5: Inspect browser errors**

Run:

```bash
agent-browser --session weelp-visible errors
agent-browser --session weelp-visible console
```

Expected: no new React, hydration, navigation, or runtime errors caused by the shared search.

### Task 7: Mandatory review, simplify, final verification, and main push

**Files:**

- Review the complete diff from the design commit to `HEAD`.

- [ ] **Step 1: Dispatch the mandatory code-review agent**

Use the `code-reviewer` skill to review spec compliance, correctness, accessibility, performance, URL parsing, error handling, and test quality. Address every critical finding and re-run the relevant RED/GREEN and verification commands. Re-review after any critical fix.

- [ ] **Step 2: Run the required simplify pass**

Use the project’s `simplify` skill if available. If it is not installed, report that explicitly and perform the equivalent focused pass manually:

- Remove obsolete state and imports.
- Collapse repeated class maps without obscuring presentation differences.
- Keep pure query logic outside the React component.
- Keep public named presentations small.
- Avoid unrelated refactors.

- [ ] **Step 3: Inspect the final diff and worktree**

Run:

```bash
git diff --check
git status --short
git diff 484b860..HEAD --stat
git diff 484b860..HEAD
```

Expected: only the approved search work and its documentation/tests are present; `git diff --check` exits 0.

- [ ] **Step 4: Re-run fresh final verification**

Run the targeted tests, `npm run type-check`, `npm run lint`, full tests, and `npm run build` again after review/simplification changes.

Expected: every command exits 0.

- [ ] **Step 5: Commit remaining reviewed changes**

```bash
git add \
  src/app/components/Pages/FRONT_END/shared/ActivityItinerarySearch.jsx \
  src/app/components/Pages/FRONT_END/shared/discoverySearchParams.js \
  src/app/components/Pages/FRONT_END/shared/__tests__/ActivityItinerarySearch.test.jsx \
  src/app/components/Pages/FRONT_END/shared/__tests__/discoverySearchParams.test.js \
  src/app/components/Pages/FRONT_END/home/HeroSearchPill.jsx \
  src/app/components/Pages/FRONT_END/home/__tests__/HeroSection.test.jsx \
  src/app/components/Pages/FRONT_END/tours/ToursHero.jsx \
  src/app/components/Pages/FRONT_END/tours/__tests__/ToursHero.test.jsx \
  src/app/components/Pages/FRONT_END/holiday/BannerSection.jsx \
  src/app/components/Pages/FRONT_END/holiday/__tests__/BannerSection.test.jsx \
  src/app/components/Pages/FRONT_END/shop/BannerSection.jsx \
  src/app/components/Pages/FRONT_END/shop/__tests__/BannerSection.test.jsx \
  src/app/components/Pages/FRONT_END/shop/SearchPage.jsx \
  src/app/components/Pages/FRONT_END/shop/__tests__/SearchPage.test.jsx \
  src/app/components/Modals/ModalForm.jsx \
  src/app/components/Modals/__tests__/ModalForm.test.jsx \
  src/lib/services/tours.js
git commit -m "refactor(search): unify activity itinerary filters"
```

Skip this commit only if all implementation changes are already committed and the worktree is clean.

- [ ] **Step 6: Push the verified main branch**

Confirm the branch is `main`, then run:

```bash
git push origin main
```

Expected: the frontend remote `main` advances to the verified implementation commit.
