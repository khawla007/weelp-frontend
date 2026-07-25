# Transfers Mobile Responsive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `/transfers` comfortable and overflow-free on mobile while preserving its existing live search, pricing, cart, and desktop layouts.

**Architecture:** Keep the current page and transfer components in place and change only their responsive layout contracts. Use mobile-first Tailwind classes, retaining the existing `sm`/`md` desktop variants, and lock the responsive behavior with focused component tests before visually checking real browser widths.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS, Radix Popover, Jest, Testing Library, agent-browser

---

## Execution prerequisites

All commands in this plan run from:

```text
/run/media/ashish-khawla/Website data/Fanatic Developement/weelp/frontend
```

Before editing application code:

1. Confirm `git branch --show-current` returns `main` and review `git status --short`.
2. Invoke `next-best-practices`, `vercel-react-best-practices`, and
   `vercel-composition-patterns`.
3. Invoke `superpowers:executing-plans` and follow this plan task by task.
4. Confirm the frontend and backend respond:

   ```bash
   curl -I http://localhost:3000/transfers
   curl -sS http://localhost:8000/up
   ```

   If the frontend is unavailable, run `npm run dev` in a separate terminal. If
   the backend is unavailable, run `php artisan serve --port=8000` from
   `../backend` in a separate terminal.

5. Open the mandatory visible browser before UI work and keep it open:

   ```bash
   agent-browser --session weelp-visible --headed open http://localhost:3000/transfers
   ```

The mobile layout applies below Tailwind's existing `sm` boundary (640px).
At `sm` and above, the current horizontal search and result-card compositions
are restored.

## File map

- Modify `src/app/(frontend)/transfers/page.js` for mobile hero spacing and the edge-safe results slot.
- Modify `src/app/(frontend)/transfers/__tests__/page.test.jsx` for hero and results-slot responsive class coverage.
- Modify `src/app/components/Pages/FRONT_END/transfer/TransferSearchForm.jsx` for the approved stacked booking card and narrow date/passenger popovers.
- Modify `src/app/components/Pages/FRONT_END/transfer/LocationComboboxPublic.jsx` for an edge-safe location popover.
- Modify `src/app/components/Pages/FRONT_END/transfer/TransferResultsDropdown.jsx` for edge-safe close, loading, empty, and results panels.
- Modify `src/app/components/Pages/FRONT_END/transfer/TransferResultCard.jsx` for stacked mobile media/content and a non-squeezed price/action footer.
- Modify `src/app/components/Pages/FRONT_END/transfer/__tests__/TransferTouchTargets.test.jsx` to cover the search and result-card responsive contracts as well as the existing touch targets.
- Create `src/app/components/Pages/FRONT_END/transfer/__tests__/LocationComboboxPublic.test.jsx` for the location popover width and collision-padding contract.
- Create `src/app/components/Pages/FRONT_END/transfer/__tests__/TransferResultsDropdown.test.jsx` for responsive loading, empty, and populated result states.

### Task 1: Lock the page-level mobile layout

**Files:**

- Modify: `src/app/(frontend)/transfers/__tests__/page.test.jsx`
- Modify: `src/app/(frontend)/transfers/page.js`

- [ ] **Step 1: Write failing page-layout assertions**

Update the first page test so the hero requires mobile-specific horizontal and vertical spacing while retaining its desktop minimum height:

```jsx
expect(hero).toHaveClass('relative', 'z-50', 'min-h-[360px]', 'px-4', 'py-8', 'sm:min-h-[420px]', 'sm:p-6');
expect(hero.firstElementChild).toHaveClass('gap-3', 'sm:gap-2');
```

Update the results-slot test so mobile positioning is edge-aligned and desktop positioning remains centered:

```jsx
expect(container.querySelector('[data-transfer-results-slot]')).toHaveClass(
  'absolute',
  'inset-x-0',
  'top-full',
  'z-[80]',
  'mt-3',
  'w-full',
  'md:left-1/2',
  'md:right-auto',
  'md:mt-4',
  'md:w-[735px]',
  'md:-translate-x-1/2',
);
```

- [ ] **Step 2: Run the page test and confirm it fails**

Run:

```bash
npx jest "src/app/(frontend)/transfers/__tests__/page.test.jsx" --runInBand
```

Expected: FAIL because the hero still uses `p-6`/`min-h-[320px]` and the results slot still centers itself at all widths.

- [ ] **Step 3: Implement the page-level mobile classes**

Use these class contracts in `page.js`:

```jsx
<section className="weelp-hero-rise relative z-50 flex min-h-[360px] items-center justify-center bg-surface-tint px-4 py-8 mb-10 sm:min-h-[420px] sm:p-6 md:mb-16 lg:mb-24">
```

Increase the mobile heading hierarchy without changing the established desktop size, and give the content a little more separation:

```jsx
<div className="relative z-[60] flex w-full max-w-xl flex-col items-center gap-3 sm:max-w-3xl sm:gap-2">
  <h1 className="text-3xl font-semibold text-foreground text-center sm:text-5xl">
  ...
  <div className="weelp-hero-ui-rise relative z-[70] mt-1 w-full sm:mt-2">
```

Use an edge-aligned mobile results slot with the existing centered desktop width:

```jsx
<div
  data-transfer-results-slot
  className="absolute inset-x-0 top-full z-[80] mt-3 w-full md:left-1/2 md:right-auto md:mt-4 md:w-[735px] md:-translate-x-1/2"
>
```

- [ ] **Step 4: Run the page test and confirm it passes**

Run:

```bash
npx jest "src/app/(frontend)/transfers/__tests__/page.test.jsx" --runInBand
```

Expected: PASS.

- [ ] **Step 5: Run the mandatory post-change gate**

Invoke `error-handling-patterns` and review the page change for preserved
loading/error behavior. Then run:

```bash
npm run type-check
npm run lint
agent-browser --session weelp-visible reload
agent-browser --session weelp-visible set viewport 390 844
```

Expected: type-check and lint exit 0; the visible page has no horizontal
overflow and the desktop-only globe behavior is unchanged. Keep changes
uncommitted until the final code-review, simplify, and verification gate.

### Task 2: Build the approved stacked mobile booking card

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/transfer/__tests__/TransferTouchTargets.test.jsx`
- Modify: `src/app/components/Pages/FRONT_END/transfer/TransferSearchForm.jsx`
- Modify: `src/app/components/Pages/FRONT_END/transfer/LocationComboboxPublic.jsx`
- Create: `src/app/components/Pages/FRONT_END/transfer/__tests__/LocationComboboxPublic.test.jsx`

- [ ] **Step 1: Add failing search-layout and popover assertions**

In `TransferTouchTargets.test.jsx`, keep the existing touch-target checks and add:

```jsx
const searchGrid = screen.getByRole('button', { name: 'Pickup Location' }).closest('[data-transfer-search-grid]');

expect(searchGrid).toHaveClass('grid', 'grid-cols-2', 'sm:flex');
expect(screen.getByTestId('transfer-pickup-field')).toHaveClass('col-span-2', 'sm:col-span-1');
expect(screen.getByTestId('transfer-destination-field')).toHaveClass('col-span-2', 'sm:col-span-1');
expect(screen.getByRole('button', { name: 'Swap pickup and destination' })).toHaveClass('top-[58px]', 'sm:left-1/4', 'sm:top-1/2');
```

Open each popover and require viewport-safe widths:

```jsx
fireEvent.click(screen.getByRole('button', { name: 'When?' }));
expect(screen.getByTestId('transfer-date-popover')).toHaveClass(
  'w-[calc(100vw-2rem)]',
  'max-w-sm',
  'max-h-[var(--radix-popover-content-available-height)]',
  'overflow-y-auto',
  'p-0',
  'sm:p-2',
  'sm:w-auto',
);
expect(screen.getByTestId('transfer-time-controls')).toHaveClass('min-w-0', 'flex-1');
expect(screen.getByTestId('transfer-time-hour')).toHaveClass('w-[58px]', 'sm:w-16');
expect(screen.getByTestId('transfer-time-minute')).toHaveClass('w-[58px]', 'sm:w-16');
expect(screen.getByTestId('transfer-time-period')).toHaveClass('w-[58px]', 'sm:w-16');
expect(screen.getByRole('button', { name: 'Done' })).toHaveClass('shrink-0', 'px-2', 'sm:px-3');

fireEvent.click(screen.getByRole('button', { name: 'How Many?' }));
expect(screen.getByTestId('transfer-passenger-popover')).toHaveClass('w-[calc(100vw-2rem)]', 'max-w-[280px]');
```

- [ ] **Step 2: Run the transfer touch-target test and confirm it fails**

Run:

```bash
npx jest src/app/components/Pages/FRONT_END/transfer/__tests__/TransferTouchTargets.test.jsx --runInBand
```

Expected: FAIL because the data hooks and stacked mobile classes do not exist.

- [ ] **Step 3: Implement the stacked booking-card layout**

Keep the outer component and form state unchanged. Add a stable grid hook and make the location rows span both mobile columns:

```jsx
<div
  data-transfer-search-grid
  className="relative grid grid-cols-2 overflow-hidden rounded-2xl border border-border bg-background shadow-[0_10px_30px_rgba(24,24,27,0.08)] dark:shadow-none sm:flex sm:items-stretch sm:rounded-xl sm:shadow-none"
>
  <div
    data-testid="transfer-pickup-field"
    className="col-span-2 min-w-0 border-b border-border sm:col-span-1 sm:flex-1 sm:border-r sm:border-b-0"
  >
  ...
  <div
    data-testid="transfer-destination-field"
    className="col-span-2 min-w-0 border-b border-border sm:col-span-1 sm:flex-1 sm:border-r sm:border-b-0"
  >
```

Position the 44px swap target between the two mobile location rows while restoring the compact desktop position at `lg`:

```jsx
className =
  'absolute left-1/2 top-[58px] z-20 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background shadow-[4px_4px_12px_rgba(0,0,0,0.1)] dark:shadow-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:left-1/4 sm:top-1/2 lg:h-[27px] lg:w-[27px]';
```

Give date and passengers the bottom two-column row, retaining their existing borders and `sm:flex-1` desktop behavior.

- [ ] **Step 4: Make date and passenger popovers narrow-screen safe**

Add `collisionPadding={16}` and these hooks/classes. The 320px viewport gives
the popover a 288px border box. Removing mobile padding leaves enough room for
the existing seven 40px calendar columns without reducing date touch targets.
Constrain the panel to Radix's measured available height and let its contents
scroll when a short viewport cannot fit the full calendar:

```jsx
<PopoverContent
  data-testid="transfer-date-popover"
  collisionPadding={16}
  className="max-h-[var(--radix-popover-content-available-height)] w-[calc(100vw-2rem)] max-w-sm overflow-y-auto p-0 sm:w-auto sm:p-2"
  align="center"
>
```

Allow the pickup-time header to wrap on narrow screens:

```jsx
<div className="mb-1 flex flex-wrap items-center gap-2 border-b border-border px-1 pb-2 pt-1 sm:px-2">
  <span className="w-full shrink-0 text-xs font-medium text-foreground sm:w-auto">Pickup time</span>
```

Use an exact shrinking contract for the time selectors and Done button:

```jsx
const triggerCls =
  'h-8 rounded-full border-0 bg-weelp-sage-deep px-2 text-sm font-medium text-white focus:ring-2 focus:ring-weelp-sage-deep/40 [&>svg]:text-white [&>svg]:opacity-100 sm:px-3';

<div data-testid="transfer-time-controls" className="flex min-w-0 flex-1 items-center gap-1">
  <SelectTrigger data-testid="transfer-time-hour" className={`${triggerCls} w-[58px] sm:w-16`}>
  ...
  <SelectTrigger data-testid="transfer-time-minute" className={`${triggerCls} w-[58px] sm:w-16`}>
  ...
  <SelectTrigger data-testid="transfer-time-period" className={`${triggerCls} w-[58px] sm:w-16`}>
```

Keep Done as the final shrink-free control:

```jsx
className = 'shrink-0 rounded-md bg-weelp-sage-deep px-2 py-1 text-xs font-medium text-white ... sm:px-3';
```

Do not override `.rdp-day`, `.rdp-day_button`, or `.rdp-weekday`; their
existing 40px dimensions are part of the approved touch-target behavior.

Use this passenger popover:

```jsx
<PopoverContent
  data-testid="transfer-passenger-popover"
  collisionPadding={16}
  className="w-[calc(100vw-2rem)] max-w-[280px] p-4"
  align="center"
>
```

- [ ] **Step 5: Cover the location popover**

Add `collisionPadding={16}` and
`data-testid="transfer-location-popover"` to the existing
`LocationComboboxPublic` popover without changing its search behavior:

```jsx
<PopoverContent
  data-testid="transfer-location-popover"
  collisionPadding={16}
  className="w-[320px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl ..."
  ...
>
```

Create `LocationComboboxPublic.test.jsx`, mock `searchPublicLocations`, render
the combobox, open it, and assert:

```jsx
expect(screen.getByTestId('transfer-location-popover')).toHaveClass('w-[320px]', 'max-w-[calc(100vw-2rem)]');
```

- [ ] **Step 6: Run the focused search-form tests**

Run:

```bash
npx jest src/app/components/Pages/FRONT_END/transfer/__tests__/TransferTouchTargets.test.jsx src/app/components/Pages/FRONT_END/transfer/__tests__/LocationComboboxPublic.test.jsx --runInBand
```

Expected: PASS with the original 44px target assertions and the new layout assertions.

- [ ] **Step 7: Run the mandatory post-change gate**

Invoke `error-handling-patterns` and confirm location search failures, stale
transfer responses, and empty results retain their current behavior. Then run:

```bash
npm run type-check
npm run lint
agent-browser --session weelp-visible reload
agent-browser --session weelp-visible set viewport 320 800
```

Expected: type-check and lint exit 0; pickup, destination, date/time, and
passenger popovers remain inside the visible 320px viewport. Keep changes
uncommitted.

### Task 3: Make every results state responsive

**Files:**

- Create: `src/app/components/Pages/FRONT_END/transfer/__tests__/TransferResultsDropdown.test.jsx`
- Modify: `src/app/components/Pages/FRONT_END/transfer/TransferResultsDropdown.jsx`
- Modify: `src/app/components/Pages/FRONT_END/transfer/TransferResultCard.jsx`
- Modify: `src/app/components/Pages/FRONT_END/transfer/__tests__/TransferTouchTargets.test.jsx`

- [ ] **Step 1: Write failing dropdown-state tests**

Create `TransferResultsDropdown.test.jsx`, mock `Reveal` and `TransferResultCard`, and verify loading, empty, and populated states:

```jsx
import { render, screen } from '@testing-library/react';
import TransferResultsDropdown from '../TransferResultsDropdown';

jest.mock('@/app/components/ui/Reveal', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

jest.mock('../TransferResultCard', () => ({
  __esModule: true,
  default: ({ transfer }) => <div>{transfer.name}</div>,
}));

describe('TransferResultsDropdown responsive layout', () => {
  it('keeps loading results within the mobile viewport', () => {
    render(<TransferResultsDropdown open loading onClose={jest.fn()} />);
    expect(screen.getByTestId('transfer-results-loading')).toHaveClass('max-h-[min(65dvh,520px)]', 'p-3', 'sm:p-4');
  });

  it('keeps the empty state and close control edge-safe', () => {
    render(<TransferResultsDropdown open transfers={[]} onClose={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Close results' })).toHaveClass('-top-3', 'right-0', 'h-11', 'w-11', 'sm:h-8', 'sm:w-8', 'sm:-right-3');
    expect(screen.getByTestId('transfer-results-empty')).toHaveClass('px-4', 'py-8', 'sm:p-8');
  });

  it('renders populated results in a viewport-bounded panel', () => {
    render(<TransferResultsDropdown open transfers={[{ id: 1, name: 'Airport transfer' }]} />);
    expect(screen.getByTestId('transfer-results-list')).toHaveClass('max-h-[min(65dvh,520px)]', 'p-2', 'sm:p-4');
    expect(screen.getByText('Airport transfer')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Add failing result-card layout assertions**

In the existing result-card test, add:

```jsx
expect(screen.getByTestId('transfer-result-media-row')).toHaveClass('flex-col-reverse', 'sm:flex-row');
expect(screen.getByRole('img', { name: 'Airport transfer' })).toHaveClass('h-36', 'w-full', 'sm:h-40');
expect(screen.getByTestId('transfer-result-footer')).toHaveClass('flex-col', 'items-stretch', 'sm:flex-row', 'sm:items-center');
expect(screen.getByRole('button', { name: 'Select' })).toHaveClass('w-full', 'sm:w-auto');
```

Add a separate test (leave the earlier `Airport transfer` fixture unchanged)
whose `name` and `vehicle_type` exceed a narrow card width. Assert the route and
vehicle labels keep `min-w-0`/`truncate`. Also require the price container to
use `min-w-0` so long localized prices can wrap without forcing overflow:

```jsx
const longRoute = 'Dubai International Airport Terminal Three → An Exceptionally Long Resort Destination';
expect(screen.getByText(longRoute)).toHaveClass('truncate');
expect(screen.getByText('extra_long_luxury_vehicle_description')).toHaveClass('truncate');
expect(screen.getByTestId('transfer-result-price')).toHaveClass('min-w-0');
```

- [ ] **Step 3: Run both tests and confirm they fail**

Run:

```bash
npx jest src/app/components/Pages/FRONT_END/transfer/__tests__/TransferResultsDropdown.test.jsx src/app/components/Pages/FRONT_END/transfer/__tests__/TransferTouchTargets.test.jsx --runInBand
```

Expected: FAIL because the responsive hooks and classes are not present.

- [ ] **Step 4: Implement edge-safe dropdown states**

In `TransferResultsDropdown.jsx`, move the close control inside the mobile edge and restore its desktop overhang:

```jsx
className =
  'absolute -top-3 right-0 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background shadow-[4px_4px_12px_rgba(0,0,0,0.1)] dark:shadow-none text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:-right-3 sm:h-8 sm:w-8';
```

Add the test hooks and bounded heights:

```jsx
data-testid="transfer-results-loading"
className="flex max-h-[min(65dvh,520px)] flex-col gap-3 overflow-y-auto rounded-xl bg-background p-3 shadow-xl dark:shadow-none sm:gap-4 sm:p-4"
```

```jsx
data-testid="transfer-results-empty"
className="rounded-xl bg-background px-4 py-8 text-center text-muted-foreground shadow-xl dark:shadow-none sm:p-8"
```

```jsx
data-testid="transfer-results-list"
className="flex max-h-[min(65dvh,520px)] flex-col gap-3 overflow-y-auto rounded-xl bg-background p-2 shadow-xl dark:shadow-none sm:gap-4 sm:p-4"
```

- [ ] **Step 5: Implement the stacked result card**

In `TransferResultCard.jsx`, preserve the current desktop content-left/image-right composition while putting the image first on mobile:

```jsx
<div data-testid="transfer-result-media-row" className="flex flex-col-reverse items-stretch sm:flex-row">
  <div className="flex min-w-0 flex-col gap-2 px-4 py-4 sm:flex-[3] sm:px-8">
  ...
  <div
    className="h-36 w-full bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:group-hover:scale-100 sm:h-40 sm:flex-[3] sm:bg-left"
```

Use mobile padding in the benefits row:

```jsx
<div className="flex flex-wrap gap-2 bg-muted px-4 py-3 sm:gap-4 sm:px-8 sm:py-4">
```

Stack the footer on mobile and make Select full-width:

```jsx
<div
  data-testid="transfer-result-footer"
  className="flex flex-col items-stretch gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8"
>
```

Add `data-testid="transfer-result-price"` and `min-w-0` to the existing price
column, and keep route/vehicle text inside `min-w-0` wrappers with `truncate`.

```jsx
className =
  'w-full bg-weelp-sage-deep px-10 text-white hover:bg-weelp-sage-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:w-auto';
```

- [ ] **Step 6: Run both focused tests**

Run:

```bash
npx jest src/app/components/Pages/FRONT_END/transfer/__tests__/TransferResultsDropdown.test.jsx src/app/components/Pages/FRONT_END/transfer/__tests__/TransferTouchTargets.test.jsx --runInBand
```

Expected: PASS.

- [ ] **Step 7: Run the mandatory post-change gate**

Invoke `error-handling-patterns` and confirm loading, no-results, API-error,
extras, and selection behavior are unchanged. Then run:

```bash
npm run type-check
npm run lint
agent-browser --session weelp-visible reload
agent-browser --session weelp-visible set viewport 390 844
```

Expected: type-check and lint exit 0; the visible result card stacks without
overflow and the mobile close/quantity controls are easy to reach. Keep changes
uncommitted.

### Task 4: Run the required verification sequence

**Files:**

- Verify only; modify the implementation or tests only if a check finds a real issue.

If any check in Tasks 4 Steps 1–6 finds an issue, fix it, invoke
`error-handling-patterns`, and restart Task 4 from Step 1 so later checks never
rely on stale results.

- [ ] **Step 1: Run all transfer-focused tests**

Run:

```bash
npx jest "src/app/(frontend)/transfers/__tests__/page.test.jsx" src/app/components/Pages/FRONT_END/transfer/__tests__/TransferTouchTargets.test.jsx src/app/components/Pages/FRONT_END/transfer/__tests__/LocationComboboxPublic.test.jsx src/app/components/Pages/FRONT_END/transfer/__tests__/TransferResultsDropdown.test.jsx --runInBand
```

Expected: all suites PASS.

- [ ] **Step 2: Run type-check**

Run:

```bash
npm run type-check
```

Expected: exit code 0.

- [ ] **Step 3: Run lint**

Run:

```bash
npm run lint
```

Expected: exit code 0 with no warnings.

- [ ] **Step 4: Check for formatting and whitespace errors**

Run:

```bash
git diff --check
```

Expected: no output.

- [ ] **Step 5: Verify deterministic local transfer data**

Confirm the known populated route is available:

```bash
curl -sS "http://localhost:8000/api/transfers?origin_type=place&origin_id=26&destination_type=place&destination_id=24&passengers=1"
```

Expected: at least one result for **Dubai International Airport → Dubai
Marina**. If local seed data has changed, query `/api/transfers?per_page=100`
and select an existing origin/destination pair before continuing.

- [ ] **Step 6: Verify the real page in the required visible browser**

Open or refresh the required headed named session:

```bash
agent-browser --session weelp-visible --headed open http://localhost:3000/transfers
```

Use the visible UI to select **Dubai International Airport** as pickup and
**Dubai Marina** as destination. Exercise loading, populated results, extras,
and Select. Change the same visible session through these viewports:

```bash
agent-browser --session weelp-visible set viewport 320 800
agent-browser --session weelp-visible set viewport 390 844
agent-browser --session weelp-visible set viewport 768 1024
agent-browser --session weelp-visible set viewport 1440 900
```

- 320×800: no horizontal overflow; every popover stays inside the viewport.
- 390×844: approved stacked search card, balanced hero, reachable close control.
- 768×1024: tablet layout remains readable with no awkward intermediate wrapping.
- 1440×900: existing desktop search proportions and result-card split remain intact.

At each width, inspect the live page in the visible window. Supplement the
visual check with:

```bash
agent-browser --session weelp-visible eval "({innerWidth, scrollWidth: document.documentElement.scrollWidth})"
```

Expected: `scrollWidth <= innerWidth`. Confirm that result media appears first
on mobile, extras controls remain 44px, the footer stacks, Select is reachable,
and the `sm`/desktop horizontal presentation remains unchanged.

- [ ] **Step 7: Request code review, simplify, and re-run verification**

Dispatch the required code-reviewer agent against the approved spec and the
complete diff. Address critical or major findings and repeat review if changes
are requested. After every review-requested code change, invoke
`error-handling-patterns`, restart Task 4 from Step 1, and send the revised diff
back for re-review before continuing.

After approval, invoke the required `simplify` skill. If `simplify` mutates
code, invoke `error-handling-patterns`. Then restart Task 4 from Step 1 and
repeat all four focused test suites, type-check, lint, every visible-browser
viewport check, and `git diff --check`, whether or not `simplify` changed code.

- [ ] **Step 8: Commit the verified implementation**

Only after code review approves, `simplify` completes, and every focused test,
type-check, lint, browser viewport, and `git diff --check` result passes:

```bash
git add "src/app/(frontend)/transfers/page.js" "src/app/(frontend)/transfers/__tests__/page.test.jsx" src/app/components/Pages/FRONT_END/transfer
git commit -m "fix: optimize transfers mobile responsiveness"
```

- [ ] **Step 9: Push verified main**

Run:

```bash
git branch --show-current
git push origin main
```

Expected: current branch is `main`; the verified commits are pushed to `origin/main`.
