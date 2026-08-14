# Customer Booking Status Badge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Display the existing customer order status as an accessible, color-coded badge on every customer dashboard booking card.

**Architecture:** Keep the existing customer order index request and list data flow unchanged. Add a small status normalizer and class map beside `BookingCard`, then render the existing `bookingItem.status` with the shared badge primitive next to the booking ID; missing values are omitted and unknown values use a neutral fallback.

**Tech Stack:** Next.js 16, React 19, JavaScript/JSX, Tailwind CSS, shadcn-style `Badge`, Jest, React Testing Library

---

Run every command in this plan from the `frontend/` directory. All paths below are relative to `frontend/`.

## File structure

- Modify `src/app/components/BookingCard.jsx` to format `bookingItem.status`, select its visual treatment, and render the badge without changing the component API.
- Modify `src/app/components/__tests__/BookingCardTheme.test.jsx` to lock down supported statuses, refund presentation, neutral fallback behavior, missing-status behavior, and the existing card interactions.

No backend, service, hook, list, global token, or shared badge file changes are needed. `GET /api/customer/userorders` already returns `status`, and `CustomerBookingsList` already passes the complete order object into `BookingCard`.

### Task 1: Specify booking status behavior with failing component tests

**Files:**
- Modify: `src/app/components/__tests__/BookingCardTheme.test.jsx:14-64`
- Test: `src/app/components/__tests__/BookingCardTheme.test.jsx`

- [ ] **Step 1: Add supported-status, fallback, and omission tests**

Append these tests inside the existing `describe` block:

```jsx
it.each([
  ['pending', 'Pending', ['border-warning/40', 'bg-warning/15', 'text-foreground']],
  ['processing', 'Processing', ['border-info/40', 'bg-info/15', 'text-foreground']],
  ['completed', 'Completed', ['border-success/40', 'bg-success/15', 'text-foreground']],
  ['cancelled', 'Cancelled', ['border-destructive/40', 'bg-destructive/10', 'text-foreground']],
  ['refunded', 'Refunded', ['border-violet-300', 'bg-violet-100', 'text-foreground', 'dark:border-violet-700', 'dark:bg-violet-950/50']],
])('shows the %s order status as a readable badge', (status, label, expectedClasses) => {
  render(<BookingCard bookingItem={{ id: 42, status, item: { name: 'Forest escape' } }} />);

  const badge = screen.getByText(label);
  expect(badge).toHaveClass(...expectedClasses);
});

it('formats an unknown order status and uses the neutral badge treatment', () => {
  render(<BookingCard bookingItem={{ id: 42, status: 'awaiting_supplier', item: { name: 'Forest escape' } }} />);

  expect(screen.getByText('Awaiting Supplier')).toHaveClass('border-border', 'bg-muted', 'text-muted-foreground');
});

it('omits the status badge when the order status is missing or blank', () => {
  const { rerender } = render(<BookingCard bookingItem={{ id: 42, item: { name: 'Forest escape' } }} />);

  expect(screen.queryByTestId('booking-status-badge')).not.toBeInTheDocument();

  rerender(<BookingCard bookingItem={{ id: 42, status: '   ', item: { name: 'Forest escape' } }} />);

  expect(screen.queryByTestId('booking-status-badge')).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run the focused test and verify the new expectations fail**

Run:

```bash
NEXT_UNHANDLED_REJECTION_FILTER=disabled npx jest src/app/components/__tests__/BookingCardTheme.test.jsx --runInBand
```

Expected: FAIL because `Pending`, `Processing`, `Completed`, `Cancelled`, `Refunded`, and `Awaiting Supplier` are not rendered by `BookingCard`.

### Task 2: Render the existing order status in `BookingCard`

**Files:**
- Modify: `src/app/components/BookingCard.jsx:3-25`
- Test: `src/app/components/__tests__/BookingCardTheme.test.jsx`

- [ ] **Step 1: Load the required Next.js and React implementation guidance**

Invoke `next-best-practices`, `vercel-react-best-practices`, and `vercel-composition-patterns` before editing `BookingCard`. Apply their guidance while preserving this focused component API and avoiding new client state, effects, requests, or abstractions.

- [ ] **Step 2: Import the existing badge primitive and define the focused display helpers**

Add the badge import after `BookingReviewDialog`, then add the constants and formatter before `BookingCard`:

```jsx
import { Badge } from '@/components/ui/badge';

const BOOKING_STATUS_CLASSES = {
  pending: 'border-warning/40 bg-warning/15 text-foreground',
  processing: 'border-info/40 bg-info/15 text-foreground',
  completed: 'border-success/40 bg-success/15 text-foreground',
  cancelled: 'border-destructive/40 bg-destructive/10 text-foreground',
  refunded: 'border-violet-300 bg-violet-100 text-foreground dark:border-violet-700 dark:bg-violet-950/50',
};

const UNKNOWN_STATUS_CLASSES = 'border-border bg-muted text-muted-foreground';

function normalizeBookingStatus(status) {
  return typeof status === 'string' ? status.trim().toLowerCase() : '';
}

function formatBookingStatus(status) {
  return status
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
```

- [ ] **Step 3: Derive status presentation from `bookingItem.status` without adding state or requests**

Change the destructuring and add the two derived values:

```jsx
const { id, travel_date, item, review, status } = bookingItem;
const normalizedStatus = normalizeBookingStatus(status);
const statusLabel = normalizedStatus ? formatBookingStatus(normalizedStatus) : '';
```

- [ ] **Step 4: Render the badge beside the booking ID with responsive wrapping**

Replace the booking ID span in the card header with:

```jsx
<div className="flex min-w-0 flex-wrap items-center gap-2 sm:justify-end">
  <span className="text-sm font-medium text-muted-foreground opacity-70 sm:text-base">Booking ID: {id}</span>
  {statusLabel ? (
    <Badge
      variant="outline"
      data-testid="booking-status-badge"
      className={BOOKING_STATUS_CLASSES[normalizedStatus] ?? UNKNOWN_STATUS_CLASSES}
    >
      {statusLabel}
    </Badge>
  ) : null}
</div>
```

The visible label conveys the state independently of color. Do not read `payment.payment_status`, add a fetch, or change `CustomerBookingsList`.

- [ ] **Step 5: Run the focused component test and verify it passes**

Run:

```bash
NEXT_UNHANDLED_REJECTION_FILTER=disabled npx jest src/app/components/__tests__/BookingCardTheme.test.jsx --runInBand
```

Expected: PASS with eleven tests, including all five supported order statuses and the `refunded` case.

### Task 3: Review, verify, and ship the focused frontend change

**Files:**
- Review: `src/app/components/BookingCard.jsx`
- Review: `src/app/components/__tests__/BookingCardTheme.test.jsx`

- [ ] **Step 1: Apply the required error-handling review**

Invoke `error-handling-patterns` and verify that absent, blank, and unknown string statuses degrade safely. Keep the component synchronous because status presentation has no recoverable runtime operation.

- [ ] **Step 2: Run static verification**

Run:

```bash
npm run type-check
npm run lint
git diff --check
```

Expected: all commands exit successfully with no TypeScript errors, ESLint warnings, dark-mode guard regressions, or whitespace errors.

- [ ] **Step 3: Run the focused tests again after formatting and static checks**

Run:

```bash
NEXT_UNHANDLED_REJECTION_FILTER=disabled npx jest src/app/components/__tests__/BookingCardTheme.test.jsx --runInBand
```

Expected: PASS with the status-badge tests and all existing booking-card tests.

- [ ] **Step 4: Pass the code through the mandatory review and simplification gates**

Dispatch the required code-reviewer agent against the implementation diff and the approved specification. Fix every critical or high-confidence issue, rerun the focused test, and request re-review when the reviewer asks for changes. Because no `simplify` skill is installed in this workspace, perform the explicit fallback clarity pass: remove duplication, confirm helpers remain local and single-purpose, and reject any abstraction not needed by another consumer.

- [ ] **Step 5: Run complete final verification after all review and simplification edits**

Run:

```bash
npm run type-check
npm run lint
NEXT_UNHANDLED_REJECTION_FILTER=disabled npx jest src/app/components/__tests__/BookingCardTheme.test.jsx --runInBand
git diff --check
```

Expected: every command exits successfully after the final code state, with eleven focused tests passing.

- [ ] **Step 6: Verify the customer booking list in the already-open visible localhost browser**

Use the named headed session `weelp-order-status` at `http://localhost:3000/dashboard/customer`. Authenticate locally through the visible window if needed. In both light and dark themes, confirm that cards show the expected order-status badge, including `Refunded` when present, that no payment status replaces it, and that status colors remain stable on hover. At desktop and narrow viewport widths, confirm that the badge and booking ID wrap without horizontal overflow. Check browser console errors after the interaction.

- [ ] **Step 7: Commit the implementation on `main`**

Run:

```bash
git add src/app/components/BookingCard.jsx src/app/components/__tests__/BookingCardTheme.test.jsx
git commit -m "fix(customer): show booking status badges"
```

Expected: the pre-commit checks pass and the commit contains only the booking card and its focused test.

- [ ] **Step 8: Push the verified frontend `main` branch**

Run:

```bash
git push origin main
```

Expected: the remote `main` branch advances to the verified implementation commit.
