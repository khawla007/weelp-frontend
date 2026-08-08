# Desktop Travelers and Add-ons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Match traveler-row labels to the booking field typography and default the Add-ons accordion open only when a single-item page loads at desktop width.

**Architecture:** Keep traveler typography local to `SingleProductForm`. Keep one Radix Add-ons accordion and control its value from `ProductSidebar`; initialize it once after hydration with the existing `xl` media query, then let Radix user interactions own the state without a resize listener.

**Tech Stack:** Next.js 16, React 19, Radix Accordion, Tailwind CSS, Jest, React Testing Library, agent-browser

---

### Task 0: Load the required implementation guidance

- [ ] **Step 1: Apply the mandatory framework guidance**

Before editing JSX, read and apply `next-best-practices`, `vercel-react-best-practices`, and `vercel-composition-patterns`. Confirm the planned implementation keeps one accordion tree, performs no server/client-dependent render during hydration, and adds no unnecessary abstraction.

### Task 1: Lock traveler typography with a failing test

**Files:**
- Modify: `src/app/components/Form/__tests__/SingleProductFormResponsive.test.jsx:27-53`
- Modify: `src/app/components/Form/SingleProductForm.jsx:383-423`

- [ ] **Step 1: Add the typography assertions**

After opening the Traveler selector in the existing responsive-controls test, assert that all three primary labels use the explicit booking-field size while the age descriptions remain secondary:

```jsx
for (const label of ['adults', 'children', 'infants']) {
  expect(screen.getByText(label, { selector: 'h3' })).toHaveClass('text-base');
}

expect(screen.getByText('Above 13 or above')).toHaveClass('text-sm');
expect(screen.getByText('Age 2-12')).toHaveClass('text-sm');
expect(screen.getByText('Under 2')).toHaveClass('text-sm');
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run:

```bash
npx jest src/app/components/Form/__tests__/SingleProductFormResponsive.test.jsx --runInBand
```

Expected: FAIL because Adult, Children, and Infant do not yet have `text-base`.

- [ ] **Step 3: Apply the minimal typography fix**

Change the traveler label in `SingleProductForm` to:

```jsx
<h3 className="text-base font-semibold capitalize">{type}</h3>
```

Do not change the existing `text-sm` age descriptions or any counter styling.

- [ ] **Step 4: Re-run the focused test and confirm GREEN**

Run the command from Step 2.

Expected: the complete `SingleProductFormResponsive` suite passes.

### Task 2: Default Add-ons open only on desktop

**Files:**
- Modify: `src/app/components/Pages/FRONT_END/singleproduct/__tests__/SidebarLayering.test.jsx:1-145`
- Modify: `src/app/components/Pages/FRONT_END/singleproduct/ProductSidebar.jsx:1-120,429-477`

- [ ] **Step 1: Add deterministic viewport setup**

Save the original `window.matchMedia`, restore it after each test, and use a helper that reports whether the `min-width: 1280px` query matches:

```jsx
const originalMatchMedia = window.matchMedia;
let desktopMediaQueryList;

const setDesktopViewport = (isDesktop) => {
  const changeListeners = new Set();
  desktopMediaQueryList = {
    matches: isDesktop,
    media: '(min-width: 1280px)',
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn((event, listener) => {
      if (event === 'change') changeListeners.add(listener);
    }),
    removeEventListener: jest.fn((event, listener) => {
      if (event === 'change') changeListeners.delete(listener);
    }),
    dispatchEvent: jest.fn(),
    dispatchChange(matches) {
      this.matches = matches;
      changeListeners.forEach((listener) => listener({ matches, media: this.media }));
    },
  };

  window.matchMedia = jest.fn((query) =>
    query === '(min-width: 1280px)'
      ? desktopMediaQueryList
      : {
          matches: false,
          media: query,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        },
  );
};
```

Set the default in `beforeEach` with `setDesktopViewport(false)` so existing tests retain their closed mobile/tablet expectation. Restore `window.matchMedia = originalMatchMedia` in `afterEach`.

- [ ] **Step 2: Replace the old combined accordion test with explicit responsive contracts**

Define this shared fixture near the viewport helper:

```jsx
const activityPropsWithAddon = {
  productId: 3,
  productType: 'activity',
  productData: {
    id: 3,
    pricing: { regular_price: 244, currency: 'USD' },
    addons: [{ addon_id: 7, addon_name: 'Photography Package', addon_price: 40 }],
  },
};
```

Keep the existing price-details styling and summary assertions, then add these behaviors:

```jsx
it('opens add-ons by default on desktop and allows manual collapse', async () => {
  setDesktopViewport(true);
  render(<ProductSidebar {...activityPropsWithAddon} />);

  const addonTrigger = screen.getByRole('button', { name: /add-ons.*none selected/i });
  await waitFor(() => expect(addonTrigger).toHaveAttribute('aria-expanded', 'true'));

  fireEvent.click(addonTrigger);
  expect(addonTrigger).toHaveAttribute('aria-expanded', 'false');

  act(() => desktopMediaQueryList.dispatchChange(false));
  act(() => desktopMediaQueryList.dispatchChange(true));
  expect(addonTrigger).toHaveAttribute('aria-expanded', 'false');
});

it('keeps add-ons collapsed by default below desktop', () => {
  setDesktopViewport(false);
  render(<ProductSidebar {...activityPropsWithAddon} />);

  expect(screen.getByRole('button', { name: /add-ons.*none selected/i })).toHaveAttribute('aria-expanded', 'false');
});

it('keeps add-ons safely collapsed when matchMedia is unavailable', () => {
  delete window.matchMedia;
  render(<ProductSidebar {...activityPropsWithAddon} />);

  expect(screen.getByRole('button', { name: /add-ons.*none selected/i })).toHaveAttribute('aria-expanded', 'false');
});
```

Import `waitFor` from React Testing Library; `act` is already imported. Keep coverage showing selection updates the summary after the user opens the mobile/tablet accordion. The desktop test must dispatch below- and above-breakpoint changes after manual collapse so a later implementation cannot add forced reopening without failing the behavioral contract.

- [ ] **Step 3: Run the sidebar test and confirm RED**

Run:

```bash
npx jest src/app/components/Pages/FRONT_END/singleproduct/__tests__/SidebarLayering.test.jsx --runInBand
```

Expected: the desktop-default test fails because the accordion remains collapsed.

- [ ] **Step 4: Add SSR-safe one-time initialization and controlled state**

Near the other local state in `ProductSidebar`, add:

```jsx
const [openAddonSections, setOpenAddonSections] = useState([]);

useEffect(() => {
  if (typeof window.matchMedia !== 'function') return;
  if (window.matchMedia('(min-width: 1280px)').matches) {
    setOpenAddonSections(['add-ons']);
  }
}, []);
```

Control only the Add-ons accordion:

```jsx
<Accordion type="multiple" value={openAddonSections} onValueChange={setOpenAddonSections} className="mt-2">
```

Do not add a resize listener, duplicate markup, or change the independent Price details accordion.

- [ ] **Step 5: Re-run both focused suites and confirm GREEN**

Run:

```bash
npx jest \
  src/app/components/Form/__tests__/SingleProductFormResponsive.test.jsx \
  src/app/components/Pages/FRONT_END/singleproduct/__tests__/SidebarLayering.test.jsx \
  --runInBand
```

Expected: both suites pass, including desktop open, manual collapse, mobile/tablet closed, traveler typography, and existing layering contracts.

### Task 3: Review, simplify, and verify the complete change

**Files:**
- Verify: `src/app/components/Form/SingleProductForm.jsx`
- Verify: `src/app/components/Form/__tests__/SingleProductFormResponsive.test.jsx`
- Verify: `src/app/components/Pages/FRONT_END/singleproduct/ProductSidebar.jsx`
- Verify: `src/app/components/Pages/FRONT_END/singleproduct/__tests__/SidebarLayering.test.jsx`

- [ ] **Step 1: Audit error handling**

After the code change, apply `error-handling-patterns`. Confirm missing `window.matchMedia` safely leaves the optional accordion closed and no new error surface or logging is needed.

- [ ] **Step 2: Run the related regression suite**

Run:

```bash
npx jest \
  src/app/components/Pages/FRONT_END/singleproduct/__tests__/BookingAction.test.jsx \
  src/app/components/Pages/FRONT_END/singleproduct/__tests__/SidebarLayering.test.jsx \
  src/app/components/Pages/FRONT_END/singleproduct/__tests__/ProductSidebarMobileAction.test.jsx \
  src/app/components/Pages/FRONT_END/singleproduct/__tests__/ProductSidebarCartEdit.test.jsx \
  src/app/components/Pages/FRONT_END/singleproduct/__tests__/ProductSidebarHelp.test.jsx \
  src/app/components/Pages/FRONT_END/singleproduct/__tests__/SingleProductTabSectionInclusions.test.jsx \
  src/app/components/Form/__tests__/SingleProductFormResponsive.test.jsx \
  src/app/__tests__/deepForestTheme.test.js \
  --runInBand
```

Expected: all eight suites pass with no failed tests.

- [ ] **Step 3: Run static and production verification**

Run sequentially so the build cannot regenerate `.next/types` during TypeScript verification:

```bash
npm run build
npm run type-check
npm run lint
git diff --check
```

Expected: the production build, TypeScript, ESLint, dark-mode guard, and diff check all exit 0.

- [ ] **Step 4: Run visible localhost browser checks**

Use the already-open headed `weelp-visible` session. Check representative activity, itinerary, and package routes at 1440x900 and 390x900.

At 1440px, verify Adult/Children/Infant compute to 16px, Add-ons initially has `aria-expanded="true"`, clicking its trigger collapses it, clicking again expands it, and add-on selection remains usable. At 390px, verify Add-ons initially has `aria-expanded="false"`, opens manually, and traveler labels remain 16px. Confirm the booking/Questions cards still do not overlap.

- [ ] **Step 5: Complete review and simplification gates**

Dispatch the mandatory code-reviewer agent. Fix every critical or major finding and request re-review until approved. Then run the `simplify` skill, keep only changes that improve clarity without altering behavior, and repeat the focused tests plus type-check, lint, and diff check on the final bytes.

If the catalog does not expose a `simplify` skill, record that it is unavailable and use the available Impeccable Distill workflow as the clarity/reuse/efficiency pass. If review or Distill changes any code, repeat the error-handling audit, related tests, production build, type-check, lint, diff check, and the complete visible headed localhost browser matrix from Steps 1-4. The bytes staged for commit must therefore be the same bytes covered by the final browser check.

- [ ] **Step 6: Commit and push `main`**

Stage only the four implementation/test files:

```bash
git add \
  src/app/components/Form/SingleProductForm.jsx \
  src/app/components/Form/__tests__/SingleProductFormResponsive.test.jsx \
  src/app/components/Pages/FRONT_END/singleproduct/ProductSidebar.jsx \
  src/app/components/Pages/FRONT_END/singleproduct/__tests__/SidebarLayering.test.jsx
git commit -m "fix: refine desktop booking controls"
git push origin main
```

Expected: hooks pass, the commit lands on `main`, local and remote commit SHAs match, and the worktree is clean.
