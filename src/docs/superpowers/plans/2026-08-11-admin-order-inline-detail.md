# Admin Order Inline Detail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show five admin orders per page, replace Emergency contact with compact received time, and add a fresh same-page read-only order detail with active-order status control.

**Architecture:** Laravel remains the source of pagination and complete active/trashed order records. The Next.js Orders page owns selection and list restoration, a server-authenticated route handler proxies one fresh record to an SWR detail hook, and a focused detail component renders the approved responsive two-column layout.

**Tech Stack:** Laravel 12, Eloquent, PHPUnit, Next.js 16 App Router, React 19, SWR, TanStack Table, Jest, React Testing Library, Tailwind CSS, shadcn/ui.

---

## Scope and repository boundaries

This is one feature spanning the existing frontend and backend order subsystem. Backend pagination and detail-contract changes are independently testable before the frontend consumes them; the UI tasks then build from pure formatting through table actions, data access, detail rendering, and page integration.

The design specification is `src/docs/superpowers/specs/2026-08-11-admin-order-inline-detail-design.md`. Do not repair or remove the unrelated unfinished `/dashboard/admin/orders/[id]` edit form.

The work starts from `main` in both repositories. Keep all RED/GREEN changes uncommitted until the final project-mandated review, simplification, and verification gates pass. The final frontend and backend commits must land on and be pushed to `main` only.

Before editing, run these read-only preflight checks in both `frontend` and `backend`:

```bash
git branch --show-current
git status --short
git rev-parse HEAD
git ls-remote origin refs/heads/main
```

Both local branches must be `main`. Preserve every unrelated user change. If either tree is dirty in an overlapping file or local `main` is not safely synchronized with remote `main`, stop and ask for direction rather than switching, pulling, or discarding work implicitly.

Before implementation, invoke these required skills in order:

1. `superpowers:executing-plans` or `superpowers:subagent-driven-development`, according to the user's execution choice.
2. `next-best-practices`, `vercel-react-best-practices`, and `vercel-composition-patterns` before editing Next.js/React code.
3. `laravel-specialist` before editing Laravel code.
4. `superpowers:test-driven-development` before the first production edit.

After each production-code task, invoke `error-handling-patterns`, run the focused tests, `npm run type-check`, `npm run lint`, and a visible named `agent-browser --headed` smoke check at `http://localhost:3000/dashboard/admin/orders`. The browser must be visibly open; do not substitute hidden screenshots.

## File map

### Backend

- Modify `../backend/app/Http/Controllers/Admin/OrderController.php`: use five-row pagination and return active or soft-deleted detail records with `created_at`.
- Modify `../backend/tests/Feature/Admin/OrderFilteringTest.php`: lock five-row filtered pagination, stable ordering, empty metadata, and active detail contract.
- Modify `../backend/tests/Feature/Admin/OrderTrashTest.php`: update pagination metadata and verify trashed detail access plus blocked trashed status updates.

### Frontend data and display

- Create `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/orderDisplay.js`: own compact relative-time, missing-value, travel-date, amount, traveler-count, and shared status constants.
- Create `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/orderDisplay.test.js`: cover every formatter boundary and fallback.
- Create `src/app/api/admin/orders/[id]/route.js`: proxy one order through the authenticated server API and preserve safe status outcomes.
- Create `src/app/api/admin/orders/[id]/__tests__/route.test.js`: verify ID validation, successful forwarding, safe upstream statuses, and generic failures.
- Modify `src/hooks/api/admin/orders.js`: add `useAdminOrder` without changing the list hook contract.
- Create `src/hooks/api/admin/__tests__/orders.test.jsx`: verify detail-key gating, result extraction, retry, and typed 404/general error propagation.

### Frontend UI and integration

- Modify `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/FilterOrdersPage.jsx`: render the page-owned search draft, Order received, one shared second clock, and View actions in active/Trash rows.
- Modify `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/FilterOrdersPage.test.jsx`: verify immediate search-draft callbacks, relative-time refresh, and active/Trash View commands while preserving existing mutations.
- Create `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/AdminOrderDetail.jsx`: render loading, failure, and approved read-only detail states plus active status mutation.
- Create `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/AdminOrderDetail.test.jsx`: verify fields, fallbacks, responsiveness, retry, active mutation, and trashed read-only status.
- Modify `src/app/(dashboard)/dashboard/admin/orders/page.js`: own raw/applied search state, selected-order metadata, and scroll restoration; swap list content for detail.
- Modify `src/app/(dashboard)/dashboard/admin/orders/__tests__/OrdersPage.test.jsx`: verify page-owned debounce, selection before debounce, fresh detail props, exact list-state retention, list-only refresh, and restored scrolling.

### Completion

- Update `../Reports/daily-work-report.md` only after both repositories are committed and pushed, following the report's existing session format.

## Task 1: Lock the backend pagination and detail contract

**Files:**

- Modify: `../backend/tests/Feature/Admin/OrderFilteringTest.php`
- Modify: `../backend/tests/Feature/Admin/OrderTrashTest.php`

- [ ] **Step 1: Change existing pagination expectations from three to five**

In `OrderFilteringTest`, make the filtered fixture produce six matching active orders so both pages remain exercised:

```php
foreach (range(1, 6) as $index) {
    $this->createOrder("Safari Customer {$index}", "Safari Trip {$index}", 'completed');
}

$this->actingAs($this->admin, 'api')
    ->getJson('/api/admin/orders?page=1&status=completed&search=safari')
    ->assertOk()
    ->assertJsonPath('current_page', 1)
    ->assertJsonPath('per_page', 5)
    ->assertJsonPath('total', 6)
    ->assertJsonPath('last_page', 2)
    ->assertJsonCount(5, 'data')
    ->assertJsonPath('summary.total_orders', 7)
    ->assertJsonPath('trash_count', 1);
```

The summary count is seven because six matching completed orders plus the active pending order contribute to global metrics; the deleted order does not. Update the empty filtered result to expect `per_page: 5`. In `OrderTrashTest`, update both small and empty list assertions to `per_page: 5`, while retaining page-one and total assertions.

- [ ] **Step 2: Expand stable-ordering coverage to all five first-page slots**

Replace the current four-order fixture with six timestamped orders. The two newest rows share a timestamp so the ID tie-breaker remains covered:

```php
$orders = collect(range(1, 6))->map(
    fn (int $index) => $this->createOrder("Customer {$index}", "Trip {$index}")
);
$timestamps = [
    '2026-08-05T10:20:30Z',
    '2026-08-06T10:20:30Z',
    '2026-08-07T10:20:30Z',
    '2026-08-08T10:20:30Z',
    '2026-08-10T10:20:30Z',
    '2026-08-10T10:20:30Z',
];

foreach ($orders as $index => $order) {
    $order->forceFill(['created_at' => Carbon::parse($timestamps[$index])])->saveQuietly();
    $order->refresh();
}

$response = $this->actingAs($this->admin, 'api')
    ->getJson('/api/admin/orders?page=1')
    ->assertOk()
    ->assertJsonPath('per_page', 5)
    ->assertJsonCount(5, 'data');

$this->assertSame(
    [$orders[5]->id, $orders[4]->id, $orders[3]->id, $orders[2]->id, $orders[1]->id],
    array_column($response->json('data'), 'id'),
);
$this->assertSame($orders[5]->created_at->toISOString(), $response->json('data.0.created_at'));
```

- [ ] **Step 3: Add active and trashed detail tests**

In `OrderFilteringTest`, add an active detail contract test:

```php
public function test_admin_can_view_active_order_detail_with_created_at_and_relations(): void
{
    $order = $this->createOrder('Detail Customer', 'Detail Safari');
    $payment = $order->payment()->create([
        'payment_status' => 'paid',
        'payment_method' => 'card',
        'total_amount' => 185,
    ]);
    $contact = $order->emergencyContact()->create([
        'contact_name' => 'Emergency Person',
        'contact_phone' => '+15555550123',
        'relationship' => 'Sibling',
    ]);

    $this->actingAs($this->admin, 'api')
        ->getJson("/api/admin/orders/{$order->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $order->id)
        ->assertJsonPath('data.user.name', 'Detail Customer')
        ->assertJsonPath('data.orderable.name', 'Detail Safari')
        ->assertJsonPath('data.payment.id', $payment->id)
        ->assertJsonPath('data.emergency_contact.id', $contact->id)
        ->assertJsonPath('data.is_trashed', false)
        ->assertJsonPath('data.created_at', $order->created_at->toISOString());
}
```

Also lock the existing status-transition rules without changing them:

```php
public function test_admin_order_status_updates_preserve_existing_transition_rules(): void
{
    Mail::fake();
    $pendingPaymentOrder = Order::factory()->create(['status' => 'pending']);
    $pendingPaymentOrder->payment()->create([
        'payment_status' => 'pending',
        'payment_method' => 'card',
        'total_amount' => 100,
    ]);

    foreach (['pending', 'processing'] as $unsupportedTarget) {
        $this->actingAs($this->admin, 'api')
            ->putJson("/api/admin/orders/{$pendingPaymentOrder->id}", ['status' => $unsupportedTarget])
            ->assertStatus(400)
            ->assertJsonPath('success', false);
    }

    $this->actingAs($this->admin, 'api')
        ->putJson("/api/admin/orders/{$pendingPaymentOrder->id}", ['status' => 'completed'])
        ->assertStatus(400)
        ->assertJsonPath('message', 'Cannot mark order as completed. Payment not paid yet.');

    $paidOrder = Order::factory()->create(['status' => 'pending']);
    $paidOrder->payment()->create([
        'payment_status' => 'paid',
        'payment_method' => 'card',
        'total_amount' => 100,
    ]);
    $this->actingAs($this->admin, 'api')
        ->putJson("/api/admin/orders/{$paidOrder->id}", ['status' => 'cancelled'])
        ->assertStatus(400)
        ->assertJsonPath('message', 'Cannot cancel order. Payment is not pending.');

    $this->actingAs($this->admin, 'api')
        ->putJson("/api/admin/orders/{$pendingPaymentOrder->id}", ['status' => 'cancelled'])
        ->assertOk()
        ->assertJsonPath('success', true);
    $this->assertSame('cancelled', $pendingPaymentOrder->fresh()->status);

    $this->actingAs($this->admin, 'api')
        ->putJson("/api/admin/orders/{$paidOrder->id}", ['status' => 'completed'])
        ->assertOk()
        ->assertJsonPath('success', true);
    $this->assertSame('completed', $paidOrder->fresh()->status);
}
```

Add `use Illuminate\Support\Facades\Mail;` to the test imports. The frontend continues to display all four index states, but these tests document both Laravel-approved success transitions and every preserved rejection path. No status business rule changes are part of this feature.

In `OrderTrashTest`, add:

```php
#[DataProvider('adminRoles')]
public function test_admin_roles_can_view_trashed_order_detail(string $role): void
{
    $actor = User::factory()->create([
        'role' => $role,
        'status' => User::STATUS_ACTIVE,
    ]);
    $order = Order::factory()->create(['status' => 'pending']);
    $order->delete();

    $this->actingAs($actor, 'api')
        ->getJson("/api/admin/orders/{$order->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $order->id)
        ->assertJsonPath('data.is_trashed', true)
        ->assertJsonPath('data.created_at', $order->created_at->toISOString());
}

public function test_trashed_order_detail_rejects_unauthenticated_and_non_admin_users(): void
{
    $order = Order::factory()->create();
    $order->delete();

    $this->getJson("/api/admin/orders/{$order->id}")->assertUnauthorized();

    $customer = User::factory()->create([
        'role' => User::ROLE_CUSTOMER,
        'status' => User::STATUS_ACTIVE,
    ]);
    $this->actingAs($customer, 'api')
        ->getJson("/api/admin/orders/{$order->id}")
        ->assertForbidden();
}

public function test_trashed_order_status_update_remains_unavailable(): void
{
    $actor = $this->admin();
    $order = Order::factory()->create(['status' => 'pending']);
    $order->delete();

    $this->actingAs($actor, 'api')
        ->putJson("/api/admin/orders/{$order->id}", ['status' => 'completed'])
        ->assertNotFound();
}
```

- [ ] **Step 4: Run the focused backend tests and confirm RED**

Run from `backend`:

```bash
php artisan test tests/Feature/Admin/OrderFilteringTest.php tests/Feature/Admin/OrderTrashTest.php
```

Expected: failures show `per_page` is still `3`, only three rows are returned, active detail lacks `created_at`, and trashed detail returns 404. The trashed update assertion should already pass and protects that behavior.

- [ ] **Step 5: Keep RED tests uncommitted**

Do not commit. Record the failing assertions for the execution checkpoint.

## Task 2: Implement the backend contract

**Files:**

- Modify: `../backend/app/Http/Controllers/Admin/OrderController.php`

- [ ] **Step 1: Change the server-owned page size**

In `OrderController::index`, change only the constant:

```php
$perPage = 5;
```

Keep the existing filtered query, newest-first stable ordering, summary, Trash count, and response metadata unchanged.

- [ ] **Step 2: Make the detail query read active and soft-deleted orders**

Replace the first line of `show` with:

```php
$order = Order::withTrashed()
    ->with(['user', 'orderable', 'payment', 'emergencyContact'])
    ->findOrFail($id);
```

Add the ISO timestamp to `$formatted`:

```php
'created_at' => $order->created_at?->toISOString(),
'is_trashed' => $order->trashed(),
```

Do not add `withTrashed()` to `updateOrder`; that deliberate difference is the backend enforcement for read-only trashed details.

- [ ] **Step 3: Run backend GREEN verification**

```bash
php artisan test tests/Feature/Admin/OrderFilteringTest.php tests/Feature/Admin/OrderTrashTest.php
php -l app/Http/Controllers/Admin/OrderController.php
git diff --check
```

Expected: both suites pass, PHP reports no syntax errors, and diff check is empty.

- [ ] **Step 4: Run the mandatory post-change checkpoint**

Invoke `error-handling-patterns` and verify the changed read/update boundary remains explicit. From `frontend`, run:

```bash
npm run type-check
npm run lint
```

Then keep the visible named browser open or open it with:

```bash
agent-browser --session weelp-orders-visible --headed open http://localhost:3000/dashboard/admin/orders
```

Confirm the local list loads and pagination reports five rows when data is available. Keep changes uncommitted.

## Task 3: Build and test order display helpers

**Files:**

- Create: `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/orderDisplay.js`
- Create: `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/orderDisplay.test.js`

- [ ] **Step 1: Write failing formatter tests**

Create the test with a fixed timestamp:

```js
import { displayOrderValue, formatCompactTimeAgo, formatOrderAmount, formatOrderTravelDate, pluralizeOrderCount } from '../orderDisplay';

const NOW = Date.parse('2026-08-11T12:00:00.000Z');

describe('formatCompactTimeAgo', () => {
  it.each([
    [0, '0s ago'],
    [59 * 1000, '59s ago'],
    [60 * 1000, '1m ago'],
    [(60 * 60 - 1) * 1000, '59m ago'],
    [60 * 60 * 1000, '1h ago'],
    [(24 * 60 * 60 - 1) * 1000, '23h ago'],
    [24 * 60 * 60 * 1000, '1d ago'],
    [(30 * 24 * 60 * 60 - 1) * 1000, '29d ago'],
    [30 * 24 * 60 * 60 * 1000, '1mo ago'],
    [359 * 24 * 60 * 60 * 1000, '11mo ago'],
    [360 * 24 * 60 * 60 * 1000, '12mo ago'],
    [364 * 24 * 60 * 60 * 1000, '12mo ago'],
    [365 * 24 * 60 * 60 * 1000, '1y ago'],
    [(2 * 365 * 24 * 60 * 60 - 1) * 1000, '1y ago'],
    [2 * 365 * 24 * 60 * 60 * 1000, '2y ago'],
  ])('formats %i elapsed milliseconds', (elapsed, expected) => {
    expect(formatCompactTimeAgo(new Date(NOW - elapsed).toISOString(), NOW)).toBe(expected);
  });

  it.each([null, undefined, '', 'not-a-date'])('returns Not available for %p', (value) => {
    expect(formatCompactTimeAgo(value, NOW)).toBe('Not available');
  });

  it('clamps future timestamps', () => {
    expect(formatCompactTimeAgo(new Date(NOW + 5000).toISOString(), NOW)).toBe('0s ago');
  });
});

describe('order detail display helpers', () => {
  it('formats fallbacks, dates, counts, and effective payment amounts', () => {
    expect(displayOrderValue(null)).toBe('Not provided');
    expect(formatOrderTravelDate('2026-08-20')).toBe('Aug 20, 2026');
    expect(pluralizeOrderCount(1, 'adult', 'adults')).toBe('1 adult');
    expect(pluralizeOrderCount(2, 'adult', 'adults')).toBe('2 adults');
    expect(formatOrderAmount({ total_amount: 185, currency: 'USD' })).toBe('$185.00');
    expect(formatOrderAmount({ is_custom_amount: true, custom_amount: 25, total_amount: 185, currency: 'USD' })).toBe('$210.00');
    expect(formatOrderAmount({ is_custom_amount: true, custom_amount: null, total_amount: 185, currency: 'USD' })).toBe('$185.00');
  });
});
```

- [ ] **Step 2: Run the helper test and confirm RED**

Run:

```bash
npx jest --runInBand src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/orderDisplay.test.js
```

Expected: module-not-found failure.

- [ ] **Step 3: Implement the pure display module**

Create:

```js
import { formatCurrency } from '@/lib/utils';

export const ADMIN_ORDER_STATUSES = ['pending', 'processing', 'completed', 'cancelled'];
export const ORDER_VALUE_NOT_PROVIDED = 'Not provided';
export const ORDER_TIME_NOT_AVAILABLE = 'Not available';

export function formatCompactTimeAgo(dateValue, now = Date.now()) {
  if (!dateValue) return ORDER_TIME_NOT_AVAILABLE;
  const timestamp = new Date(dateValue).getTime();
  if (!Number.isFinite(timestamp)) return ORDER_TIME_NOT_AVAILABLE;

  const elapsedSeconds = Math.max(0, Math.floor((now - timestamp) / 1000));
  if (elapsedSeconds < 60) return `${elapsedSeconds}s ago`;
  const minutes = Math.floor(elapsedSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export function displayOrderValue(value) {
  return value === undefined || value === null || value === '' ? ORDER_VALUE_NOT_PROVIDED : value;
}

export function formatOrderTravelDate(value) {
  const datePart = typeof value === 'string' ? value.slice(0, 10) : '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return ORDER_VALUE_NOT_PROVIDED;
  const [year, month, day] = datePart.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return ORDER_VALUE_NOT_PROVIDED;
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(date);
}

export function pluralizeOrderCount(count, singular, plural) {
  const value = Number(count);
  return Number.isFinite(value) ? `${value} ${value === 1 ? singular : plural}` : ORDER_VALUE_NOT_PROVIDED;
}

export function formatOrderAmount(payment) {
  if (!payment) return ORDER_VALUE_NOT_PROVIDED;
  const customValue = payment.custom_amount;
  const totalValue = payment.total_amount ?? payment.amount;
  const custom = customValue === undefined || customValue === null || customValue === '' ? Number.NaN : Number(customValue);
  const total = totalValue === undefined || totalValue === null || totalValue === '' ? Number.NaN : Number(totalValue);
  const amount = payment.is_custom_amount && Number.isFinite(custom) && Number.isFinite(total) ? total + custom : total;
  if (!Number.isFinite(amount)) return ORDER_VALUE_NOT_PROVIDED;
  const currency = /^[A-Z]{3}$/.test(payment.currency ?? '') ? payment.currency : 'USD';
  try {
    return formatCurrency(amount, currency);
  } catch {
    return ORDER_VALUE_NOT_PROVIDED;
  }
}
```

For admin display, “effective amount” follows the existing backend revenue convention in `OrderController::index`: `total_amount + custom_amount` when a valid custom amount is enabled, otherwise `total_amount`. The detail still renders Custom amount as its own labelled field, so the team can see both the base and adjustment rather than mistaking the sum for the stored custom value.

- [ ] **Step 4: Run GREEN and the mandatory post-change checkpoint**

```bash
npx jest --runInBand src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/orderDisplay.test.js
npm run type-check
npm run lint
git diff --check
agent-browser --session weelp-orders-visible --headed reload
```

Invoke `error-handling-patterns` before the commands. Expected: helper tests, type-check, and lint pass; the visible Orders page still loads. Keep changes uncommitted.

## Task 4: Replace the list column and add View actions

**Files:**

- Modify: `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/FilterOrdersPage.jsx`
- Modify: `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/FilterOrdersPage.test.jsx`

- [ ] **Step 1: Move draft semantics out of the table and write failing action/time tests**

Add `created_at: '2026-08-11T11:59:01.000Z'` to the shared order fixture. Replace the existing table-owned debounce test with an immediate raw-draft callback test:

```jsx
it('reports each raw search draft without trimming or debouncing it', () => {
  const onSearchDraftChange = jest.fn();
  renderTable({ searchDraft: 'Safari', onSearchDraftChange });

  fireEvent.change(screen.getByRole('searchbox', { name: 'Search orders by order number, customer, or item' }), {
    target: { value: '  Desert Safari  ' },
  });

  expect(onSearchDraftChange).toHaveBeenCalledWith('  Desert Safari  ');
});
```

Add the received-time and View tests:

```jsx
it('replaces emergency contact with a live compact received time', () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-08-11T12:00:00.000Z'));
  renderTable();

  expect(screen.getByRole('columnheader', { name: 'ORDER RECEIVED' })).toBeInTheDocument();
  expect(screen.queryByRole('columnheader', { name: 'EMERGENCY CONTACT' })).not.toBeInTheDocument();
  expect(screen.getByText('59s ago')).toBeInTheDocument();

  act(() => jest.advanceTimersByTime(1000));
  expect(screen.getByText('1m ago')).toBeInTheDocument();
});

it.each([
  ['active', false],
  ['trash', true],
])('opens an order from the %s view', (view, isTrashed) => {
  const onViewOrder = jest.fn();
  renderTable({ view, onViewOrder });

  fireEvent.click(screen.getByRole('button', { name: 'View order 21' }));
  expect(onViewOrder).toHaveBeenCalledWith(21, { isTrashed });
});
```

Update `renderTable` to accept and pass `searchDraft`, `onSearchDraftChange`, and `onViewOrder`.

- [ ] **Step 2: Run the table suite and confirm RED**

```bash
npx jest --runInBand src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/FilterOrdersPage.test.jsx
```

Expected: Order received and View assertions fail.

- [ ] **Step 3: Implement one shared clock and the received column**

Import `Eye`, `ADMIN_ORDER_STATUSES`, and `formatCompactTimeAgo`. Replace the local status array. Change the props to `{ data, view, searchDraft, onSearchDraftChange, onOrdersChanged, onViewOrder }`. Remove local `searchValue` and the 300 ms debounce effect; the page owns the raw draft and applied query. Add the shared clock:

```jsx
const [relativeNow, setRelativeNow] = useState(() => Date.now());

useEffect(() => {
  const intervalId = window.setInterval(() => setRelativeNow(Date.now()), 1000);
  return () => window.clearInterval(intervalId);
}, []);
```

Replace the emergency-contact definition with:

```jsx
{
  header: 'ORDER RECEIVED',
  accessorKey: 'created_at',
  id: 'orderReceived',
  cell: ({ row }) => <time dateTime={row.original.created_at || undefined}>{formatCompactTimeAgo(row.original.created_at, relativeNow)}</time>,
},
```

Render the input directly from the page-owned draft:

```jsx
<Input
  type="search"
  aria-label="Search orders by order number, customer, or item"
  placeholder="Search by order number, customer, or item"
  value={searchDraft}
  onChange={(event) => onSearchDraftChange?.(event.target.value)}
  className="max-w-sm"
/>
```

Include both `relativeNow` and `onViewOrder` in the columns dependency array.

- [ ] **Step 4: Add View beside existing actions**

Use this reusable button inside both active and Trash branches:

```jsx
const viewButton = (
  <Button type="button" variant="outline" size="sm" aria-label={`View order ${item.id}`} onClick={() => onViewOrder?.(item.id, { isTrashed: view === 'trash' })}>
    <Eye className="h-4 w-4" aria-hidden="true" />
    View
  </Button>
);
```

Active rows render `viewButton` plus the existing icon-only Trash button in a wrapping action group. Trash rows render `viewButton`, Restore, and Delete permanently. View remains available while an unrelated row mutation is pending because it performs no mutation.

- [ ] **Step 5: Run GREEN and the mandatory post-change checkpoint**

Invoke `error-handling-patterns`, then run:

```bash
npx jest --runInBand src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/FilterOrdersPage.test.jsx
npm run type-check
npm run lint
git diff --check
agent-browser --session weelp-orders-visible --headed reload
```

In the visible browser, verify five rows when available, Order received, compact values, View in All, and View in Trash. Keep changes uncommitted.

## Task 5: Add the authenticated detail route and SWR hook

**Files:**

- Create: `src/app/api/admin/orders/[id]/route.js`
- Create: `src/app/api/admin/orders/[id]/__tests__/route.test.js`
- Modify: `src/hooks/api/admin/orders.js`
- Create: `src/hooks/api/admin/__tests__/orders.test.jsx`

- [ ] **Step 1: Write failing route-handler tests**

Mock `NextResponse.json` and `createAuthenticatedServerApi`. Cover success and safe failure mapping:

```js
import { GET } from '../route';
import { createAuthenticatedServerApi } from '@/lib/axiosInstance';

jest.mock('next/server', () => ({
  NextResponse: { json: (body, options = {}) => ({ status: options.status ?? 200, json: async () => body }) },
}));
jest.mock('@/lib/axiosInstance', () => ({ createAuthenticatedServerApi: jest.fn() }));

it('forwards one authenticated order', async () => {
  const get = jest.fn().mockResolvedValue({ status: 200, data: { success: true, data: { id: 42 } } });
  createAuthenticatedServerApi.mockResolvedValue({ get });

  const response = await GET({}, { params: Promise.resolve({ id: '42' }) });
  expect(get).toHaveBeenCalledWith('/api/admin/orders/42');
  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({ success: true, data: { id: 42 } });
});

it.each([
  [401, 'Authentication required.'],
  [403, 'Forbidden.'],
  [404, 'Order not found.'],
])('preserves safe upstream status %i without leaking the body', async (status, message) => {
  createAuthenticatedServerApi.mockResolvedValue({ get: jest.fn().mockRejectedValue({ response: { status, data: { secret: 'do not expose' } } }) });
  const response = await GET({}, { params: Promise.resolve({ id: '42' }) });
  expect(response.status).toBe(status);
  await expect(response.json()).resolves.toEqual({ success: false, message });
});
```

Table-drive invalid IDs `0`, `-1`, `1.5`, `abc`, and an oversized digit string such as `999999999999999999999`. Each returns 400 and asserts `createAuthenticatedServerApi` was not called. Add unknown error => generic 500.

- [ ] **Step 2: Write failing detail-hook tests**

Mock Axios and use an isolated `SWRConfig` provider. Keep the existing list hook on the shared `fetcher`; only the detail hook uses the typed detail fetcher:

```jsx
const wrapper = ({ children }) => <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>{children}</SWRConfig>;

it('does not fetch without a selected ID', () => {
  renderHook(() => useAdminOrder(null), { wrapper });
  expect(axios.get).not.toHaveBeenCalled();
});

it('returns the selected detail and exposes retry', async () => {
  axios.get.mockResolvedValue({ data: { success: true, data: { id: 42 } } });
  const { result } = renderHook(() => useAdminOrder(42), { wrapper });
  await waitFor(() => expect(result.current.order).toEqual({ id: 42 }));
  expect(axios.get).toHaveBeenCalledWith('/api/admin/orders/42');
  expect(result.current.mutate).toEqual(expect.any(Function));
});
```

Add separate Axios rejection cases for status 404 and 500/network failure. Assert `result.current.errorStatus` is `404` for the former and `500`/`null` as appropriate for the latter, `result.current.error` is set, and `order` remains `null`.

- [ ] **Step 3: Run both suites and confirm RED**

```bash
npx jest --runInBand src/app/api/admin/orders/'[id]'/__tests__/route.test.js src/hooks/api/admin/__tests__/orders.test.jsx
```

Expected: missing route and missing hook failures.

- [ ] **Step 4: Implement the safe route handler**

Create:

```js
import { NextResponse } from 'next/server';
import { createAuthenticatedServerApi } from '@/lib/axiosInstance';

const SAFE_ERRORS = {
  401: 'Authentication required.',
  403: 'Forbidden.',
  404: 'Order not found.',
};

export async function GET(_request, { params }) {
  const { id } = await params;
  const numericId = Number(id);
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(numericId)) {
    return NextResponse.json({ success: false, message: 'Invalid order ID.' }, { status: 400 });
  }

  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.get(`/api/admin/orders/${id}`);
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    const upstreamStatus = Number(error?.response?.status);
    const status = SAFE_ERRORS[upstreamStatus] ? upstreamStatus : 500;
    const message = SAFE_ERRORS[status] ?? 'We could not load this order.';
    return NextResponse.json({ success: false, message }, { status });
  }
}
```

- [ ] **Step 5: Add the typed detail hook**

In `src/hooks/api/admin/orders.js`, import Axios and add:

```js
async function adminOrderDetailFetcher(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (requestError) {
    const status = axios.isAxiosError(requestError) ? (requestError.response?.status ?? null) : null;
    const detailError = new Error(status === 404 ? 'Order not found.' : 'We could not load this order.');
    detailError.status = status;
    throw detailError;
  }
}

export function useAdminOrder(orderId) {
  const key = orderId ? `/api/admin/orders/${orderId}` : null;
  const { data, error, isLoading, mutate } = useSWR(key, adminOrderDetailFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
    errorRetryCount: 0,
  });

  return {
    order: data?.data ?? null,
    isLoading,
    error,
    errorStatus: error?.status ?? null,
    mutate,
  };
}
```

- [ ] **Step 6: Run GREEN and the mandatory post-change checkpoint**

Invoke `error-handling-patterns`, then run:

```bash
npx jest --runInBand src/app/api/admin/orders/'[id]'/__tests__/route.test.js src/hooks/api/admin/__tests__/orders.test.jsx
npm run type-check
npm run lint
git diff --check
agent-browser --session weelp-orders-visible --headed reload
```

Expected: both new suites and static checks pass; the visible Orders list still loads. Keep changes uncommitted.

## Task 6: Build the approved order detail view

**Files:**

- Create: `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/AdminOrderDetail.jsx`
- Create: `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/AdminOrderDetail.test.jsx`

- [ ] **Step 1: Write failing loading and error-state tests**

Mock `useAdminOrder`, `updateOrderStatus`, and `useToast`. Verify Back is always available:

```jsx
it('shows a responsive skeleton while loading', () => {
  useAdminOrder.mockReturnValue({ order: null, isLoading: true, error: null, errorStatus: null, mutate: jest.fn() });
  render(<AdminOrderDetail orderId={42} isTrashed={false} onBack={jest.fn()} />);
  expect(screen.getByRole('button', { name: 'Back to orders' })).toBeEnabled();
  expect(screen.getByTestId('admin-order-detail-skeleton')).toHaveClass('grid-cols-1', 'lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]', 'min-w-0');
});

it('offers retry and back after a load failure', () => {
  const mutate = jest.fn();
  useAdminOrder.mockReturnValue({ order: null, isLoading: false, error: new Error('failed'), errorStatus: 500, mutate });
  render(<AdminOrderDetail orderId={42} isTrashed={false} onBack={jest.fn()} />);
  expect(screen.getByText('We could not load this order.')).toBeInTheDocument();
  expect(screen.getByText('Check your connection and try again.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(mutate).toHaveBeenCalledTimes(1);
});
```

Add a distinct 404 test with `errorStatus: 404`. It keeps the same approved heading and Retry/Back actions but shows `This order is no longer available.` as its explanation. This proves the client distinguishes disappearance from a general failure without changing the approved recovery flow.

- [ ] **Step 2: Write failing success-layout and fallback tests**

Use a fixture containing item/orderable, payment, user, emergency contact, travel fields, requirements, and `created_at`. The exact response-to-field map is:

- heading: `order.orderable.name`;
- item type: `order.type`, falling back to `order.orderable.item_type`;
- received time: `order.created_at`;
- travel: `travel_date`, `preferred_time`, `number_of_adults`, `number_of_children`;
- requirements: `special_requirements`;
- payment: effective amount from `payment.total_amount + payment.custom_amount` when custom is enabled, base `payment.total_amount`, separately labelled `payment.custom_amount` when applicable, `payment.payment_status`, and `payment.payment_method`;
- customer: `user.name`, `user.email`, and `user.phone`;
- emergency contact: `emergency_contact.contact_name`, `contact_phone`, and `relationship`.

Assert every mapped value:

```jsx
expect(screen.getByRole('heading', { name: 'Desert Safari' })).toBeInTheDocument();
expect(screen.getByText('Order #42')).toBeInTheDocument();
expect(screen.getByText('8m ago')).toBeInTheDocument();
expect(screen.getByText('Travel details')).toBeInTheDocument();
expect(screen.getByText('Aug 20, 2026')).toBeInTheDocument();
expect(screen.getByText('2 adults')).toBeInTheDocument();
expect(screen.getByText('1 child')).toBeInTheDocument();
expect(screen.getByText('Vegetarian meal')).toBeInTheDocument();
expect(screen.getByText('Payment')).toBeInTheDocument();
expect(screen.getByText('$210.00')).toBeInTheDocument();
expect(screen.getByText('Base amount')).toBeInTheDocument();
expect(screen.getByText('$185.00')).toBeInTheDocument();
expect(screen.getByText('Custom amount')).toBeInTheDocument();
expect(screen.getByText('$25.00')).toBeInTheDocument();
expect(screen.getByText('paid')).toBeInTheDocument();
expect(screen.getByText('card')).toBeInTheDocument();
expect(screen.getByText('Customer')).toBeInTheDocument();
expect(screen.getByText('Customer Name')).toBeInTheDocument();
expect(screen.getByText('customer@example.test')).toBeInTheDocument();
expect(screen.getByText('+15555550000')).toBeInTheDocument();
expect(screen.getByText('Emergency contact')).toBeInTheDocument();
expect(screen.getByText('Emergency Person')).toBeInTheDocument();
expect(screen.getByText('+15555550123')).toBeInTheDocument();
expect(screen.getByText('Sibling')).toBeInTheDocument();
expect(screen.getByTestId('admin-order-detail-grid')).toHaveClass('lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]');
```

Blank optional values must produce `Not provided`; use `getAllByText` because multiple fields may be absent. Add long-string assertions and confirm the detail root and columns have `min-w-0`/`break-words` classes.

- [ ] **Step 3: Write failing active and Trash status tests**

Mock the Select so its test button calls `onValueChange('completed')`. For an active order, use a deferred `updateOrderStatus` promise: click once, assert the labelled control becomes disabled, attempt a duplicate click, and assert only one request is made. Before resolution, the controlled value must remain the record's original status. Resolve success and assert detail `mutate`, `onStatusChanged`, a success toast, and the re-enabled control.

Add a failed update result and assert neither refresh callback runs, the old controlled value remains, the control re-enables, and the destructive toast uses the backend message. Add backend-message cases for rejected `pending` and `processing`, unpaid completion, and non-pending cancellation; these states remain visible/selectable for consistency with the existing index, while Laravel remains authoritative about valid transitions.

Add refresh-failure tests after a successful backend update: one where detail `mutate` rejects and another where `onStatusChanged` rejects. The component must never say the status update failed after Laravel succeeded. It keeps the existing success title and adds the description `Status changed, but the latest data could not be refreshed.` while attempting both refreshes independently.

For `isTrashed={true}`, assert the status text is rendered and no `Change status for order 42` control exists. Repeat with the selection prop false but `order.is_trashed: true`; the fresh backend record wins so a concurrently trashed order is also read-only.

- [ ] **Step 4: Run the suite and confirm RED**

```bash
npx jest --runInBand src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/AdminOrderDetail.test.jsx
```

Expected: module-not-found failure.

- [ ] **Step 5: Implement focused detail primitives and states**

Create local `DetailSection`, `DetailField`, `BackButton`, `LoadingState`, and `FailureState` components. `LoadingState` renders a `min-w-0 grid grid-cols-1` skeleton with the exact approved `lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]` desktop columns. `FailureState` always renders the approved heading, Retry, and Back; its explanation is selected from `errorStatus`. Use `ArrowLeft`, `CalendarDays`, `CreditCard`, `MessageSquare`, `ShieldAlert`, and `UserRound`; existing `Button`, `Select`, `Skeleton`, `TypeBadge`; the display helpers; `useAdminOrder`; `updateOrderStatus`; and `useToast`.

The component boundary is:

```jsx
const AdminOrderDetail = ({ orderId, isTrashed, onBack, onStatusChanged }) => {
  const { order, isLoading, error, errorStatus, mutate } = useAdminOrder(orderId);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [relativeNow, setRelativeNow] = useState(() => Date.now());
  const { toast } = useToast();

  useEffect(() => {
    const intervalId = window.setInterval(() => setRelativeNow(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  if (isLoading) return <LoadingState onBack={onBack} />;
  if (error || !order) return <FailureState errorStatus={errorStatus} onBack={onBack} onRetry={() => mutate()} />;

  const statusIsReadOnly = isTrashed || order.is_trashed;
```

Continue inside the same component with a status handler that does not optimistically change the record:

```jsx
const handleStatusChange = async (nextStatus) => {
  if (isUpdatingStatus || statusIsReadOnly) return;
  setIsUpdatingStatus(true);
  try {
    const result = await updateOrderStatus(orderId, nextStatus);
    if (!result.success) {
      toast({ title: result.message || result.error || 'Failed to update order status.', variant: 'destructive' });
      return;
    }
    const refreshes = [mutate()];
    if (onStatusChanged) refreshes.push(onStatusChanged());
    const refreshResults = await Promise.allSettled(refreshes);
    const refreshFailed = refreshResults.some((refreshResult) => refreshResult.status === 'rejected');
    toast({
      title: result.message || 'Order status updated successfully.',
      ...(refreshFailed ? { description: 'Status changed, but the latest data could not be refreshed.' } : {}),
    });
  } catch (statusError) {
    toast({ title: statusError?.message || 'Failed to update order status.', variant: 'destructive' });
  } finally {
    setIsUpdatingStatus(false);
  }
};
```

Render the selected layout with:

```jsx
<div data-testid="admin-order-detail-grid" className="grid min-w-0 grid-cols-1 gap-x-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
  <div className="min-w-0">
    <DetailSection icon={CalendarDays} title="Travel details">
      {travelDetails}
    </DetailSection>
    <DetailSection icon={MessageSquare} title="Special requirements">
      {specialRequirements}
    </DetailSection>
  </div>
  <div className="min-w-0">
    <DetailSection icon={CreditCard} title="Payment">
      {paymentDetails}
    </DetailSection>
    <DetailSection icon={UserRound} title="Customer">
      {customerDetails}
    </DetailSection>
    <DetailSection icon={ShieldAlert} title="Emergency contact">
      {emergencyContactDetails}
    </DetailSection>
  </div>
</div>
```

Here `travelDetails`, `paymentDetails`, `customerDetails`, and `emergencyContactDetails` are the concrete `<dl>` groups populated from the exact field map in Step 2; `specialRequirements` is a wrapping text `<p>`. Do not introduce these names as component state or exported abstractions—they are notation for the adjacent JSX groups in the plan.

Compute `const statusIsReadOnly = isTrashed || order.is_trashed`. Active status uses a labelled Select trigger and `ADMIN_ORDER_STATUSES`; read-only status uses capitalized Badge/text. Use `formatCompactTimeAgo(order.created_at, relativeNow)` with one local second interval so the header stays current while open.

Add a fake-timer detail test that crosses `59s ago` to `1m ago`, unmounts, advances again, and asserts `window.clearInterval` was called. The Select trigger receives `disabled={isUpdatingStatus}` and `aria-label={`Change status for order ${order.id}`}`.

- [ ] **Step 6: Run GREEN and the mandatory post-change checkpoint**

Invoke `error-handling-patterns`, then run:

```bash
npx jest --runInBand src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/AdminOrderDetail.test.jsx
npm run type-check
npm run lint
git diff --check
agent-browser --session weelp-orders-visible --headed reload
```

The detail is not integrated yet, so this browser pass is a list regression smoke check. Keep changes uncommitted.

## Task 7: Integrate same-page selection and exact list restoration

**Files:**

- Modify: `src/app/(dashboard)/dashboard/admin/orders/page.js`
- Modify: `src/app/(dashboard)/dashboard/admin/orders/__tests__/OrdersPage.test.jsx`

- [ ] **Step 1: Extend mocks and write the failing selection test**

Change the `FilterOrdersPage` mock input to receive `searchDraft` and call `onSearchDraftChange(event.target.value)` immediately. Also expose:

```jsx
<button type="button" onClick={() => onViewOrder(42, { isTrashed: view === 'trash' })}>
  Mock view order
</button>
```

Change the shared mocked backend metadata from `per_page: 3` to `per_page: 5`. Preserve `total: 6` and `last_page: 2` so Next-page behavior remains covered.

Mock `AdminOrderDetail` with its ID, trashed state, Back, and status-refresh actions. Add a fake-timer regression that types the exact raw draft `  Safari  `, clicks View before the 300 ms debounce fires, advances 300 ms while detail is open, and clicks Back. Assert the input restores the exact spaced draft while the applied API query is trimmed to `search=Safari`. This proves the debounce survives the table child unmount.

Add a second test that chooses `completed`, enters `Safari`, advances the debounce, navigates to page two, sets `window.scrollY` to `480`, and opens order 42. Assert the list heading, stats, controls, table, and pagination disappear while the detail receives `{ orderId: 42, isTrashed: false }`.

- [ ] **Step 2: Write the failing Back restoration test**

Mock `window.requestAnimationFrame` to run its callback and `window.scrollTo`. Click Back, then assert:

```jsx
expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=2&view=active&status=completed&search=Safari');
expect(screen.getByRole('button', { name: 'Filter orders by status: Completed' })).toHaveAttribute('aria-pressed', 'true');
expect(screen.getByRole('textbox', { name: 'Mock order search' })).toHaveValue('Safari');
expect(window.scrollTo).toHaveBeenCalledWith({ top: 480, behavior: 'auto' });
```

Add a Trash selection test after selecting a Trash status/search/page and capturing a nonzero scroll position. Assert `isTrashed: true`, click Back, and verify the Trash button, exact filter/search/page query, and scroll position are restored. Invoke the mocked detail's status-success callback and assert `mutateOrders` runs once without changing page two, even if the refreshed current page is empty. `handleOrdersChanged` remains reserved for list-level status/delete/restore actions that intentionally apply page fallback.

- [ ] **Step 3: Run the page suite and confirm RED**

```bash
npx jest --runInBand 'src/app/(dashboard)/dashboard/admin/orders/__tests__/OrdersPage.test.jsx'
```

Expected: detail and selection assertions fail.

- [ ] **Step 4: Implement page-owned selection and scroll restoration**

Import `useEffect`, `useRef`, and `AdminOrderDetail`. Hoist the raw input draft beside the applied query state:

```jsx
const [listQuery, setListQuery] = useState({ page: 1, view: 'active', status: '', search: '' });
const [searchDraft, setSearchDraft] = useState('');

useEffect(() => {
  const timeoutId = window.setTimeout(() => {
    const nextSearch = searchDraft.trim();
    setListQuery((current) => (current.search === nextSearch ? current : { ...current, page: 1, search: nextSearch }));
  }, 300);
  return () => window.clearTimeout(timeoutId);
}, [searchDraft]);
```

Add selection and scroll restoration:

```jsx
const [selectedOrder, setSelectedOrder] = useState(null);
const listScrollPosition = useRef(0);
const shouldRestoreScroll = useRef(false);

const handleViewOrder = useCallback((id, { isTrashed }) => {
  listScrollPosition.current = window.scrollY;
  setSelectedOrder({ id, isTrashed });
}, []);

const handleBackToOrders = useCallback(() => {
  shouldRestoreScroll.current = true;
  setSelectedOrder(null);
}, []);

useEffect(() => {
  if (selectedOrder || !shouldRestoreScroll.current) return undefined;
  shouldRestoreScroll.current = false;
  const frameId = window.requestAnimationFrame(() => window.scrollTo({ top: listScrollPosition.current, behavior: 'auto' }));
  return () => window.cancelAnimationFrame(frameId);
}, [selectedOrder]);
```

Keep all list hook/state declarations above the conditional to preserve hook order and data cache behavior. Before the list JSX, return:

```jsx
if (selectedOrder) {
  return <AdminOrderDetail orderId={selectedOrder.id} isTrashed={selectedOrder.isTrashed} onBack={handleBackToOrders} onStatusChanged={mutateOrders} />;
}
```

Pass `searchDraft={searchDraft}`, `onSearchDraftChange={setSearchDraft}`, and `onViewOrder={handleViewOrder}` to `FilterOrdersPage`. Remove the old `handleSearchChange` callback because applied search now changes only inside the page-level debounce effect. Change the defensive frontend page-size fallback from `3` to `5`.

- [ ] **Step 5: Run all focused frontend suites**

```bash
npx jest --runInBand \
  src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/orderDisplay.test.js \
  src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/FilterOrdersPage.test.jsx \
  src/app/api/admin/orders/'[id]'/__tests__/route.test.js \
  src/hooks/api/admin/__tests__/orders.test.jsx \
  src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/AdminOrderDetail.test.jsx \
  'src/app/(dashboard)/dashboard/admin/orders/__tests__/OrdersPage.test.jsx'
```

Expected: all focused suites pass.

- [ ] **Step 6: Run the mandatory post-change checkpoint and visible UI verification**

Invoke `error-handling-patterns`, then run:

```bash
npm run type-check
npm run lint
git diff --check
agent-browser --session weelp-orders-visible --headed reload
```

In the visible local browser, verify:

- five active rows when at least five exist;
- compact Order received values update;
- View swaps all list-specific content for the detail without URL navigation;
- active status control is operable and reports backend success/failure correctly;
- Back restores page, filters, search, and scroll;
- Trash View loads a trashed order and exposes no status control;
- desktop shows two columns;
- 1024 px uses the approved two-column desktop layout with no horizontal overflow;
- 768 px and 375 px collapse to one column with no horizontal overflow.

Keep the visible browser open for the final review fixes.

## Task 8: Review, simplify, verify, commit, and push

**Files:**

- Review every file in the File map.
- Modify tests or implementation files only to address review/simplification findings.
- Modify `../Reports/daily-work-report.md` after both pushes succeed.

- [ ] **Step 1: Run the mandatory code-review gate**

Dispatch the `superpowers:code-reviewer` agent against the approved spec and both repository diffs. Require findings to be ordered by severity with exact file/line references. After each backend review fix, invoke `error-handling-patterns`, then run the affected Artisan tests, `php -l` for every changed PHP file, backend `git diff --check`, frontend `npm run type-check`, frontend `npm run lint`, and the visible `weelp-orders-visible` browser check. After each frontend review fix, invoke `error-handling-patterns`, then run the affected Jest tests, `npm run type-check`, `npm run lint`, frontend `git diff --check`, and the visible browser check. Dispatch re-review only after that repository-specific checkpoint passes. Repeat until no critical/important findings remain.

- [ ] **Step 2: Run the mandatory simplification gate**

Invoke the `simplify` skill. If it is unavailable in the active environment, explicitly record that limitation and perform a manual clarity, duplication, naming, and unnecessary-state pass. Apply only behavior-preserving changes. After each backend simplification edit, invoke `error-handling-patterns`, run affected Artisan tests, PHP syntax checks, backend diff check, frontend type-check/lint, and the visible browser. After each frontend simplification edit, invoke `error-handling-patterns`, run affected Jest tests, frontend type-check/lint/diff check, and the visible browser.

- [ ] **Step 3: Run fresh backend verification**

From `backend`:

```bash
php artisan test tests/Feature/Admin/OrderFilteringTest.php tests/Feature/Admin/OrderTrashTest.php
php -l app/Http/Controllers/Admin/OrderController.php
git diff --check
git status --short
```

Expected: tests pass, syntax is valid, diff check is empty, and status lists only intended backend files.

- [ ] **Step 4: Run fresh frontend verification**

From `frontend`:

```bash
npx jest --runInBand \
  src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/orderDisplay.test.js \
  src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/FilterOrdersPage.test.jsx \
  src/app/api/admin/orders/'[id]'/__tests__/route.test.js \
  src/hooks/api/admin/__tests__/orders.test.jsx \
  src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/AdminOrderDetail.test.jsx \
  'src/app/(dashboard)/dashboard/admin/orders/__tests__/OrdersPage.test.jsx'
npm run type-check
npm run lint
git diff --check
git status --short
```

Expected: all focused tests and static checks pass, diff check is empty, and status lists only intended frontend files.

- [ ] **Step 5: Repeat final visible headed-browser verification**

Use the already visible named session:

```bash
agent-browser --session weelp-orders-visible --headed reload
```

Repeat active, Trash, status, Back restoration, keyboard access, and responsive overflow checks. Inspect browser errors after each flow. Do not use screenshots as the primary inspection method.

- [ ] **Step 6: Commit only after all gates pass**

Commit backend first from `backend/main`:

```bash
git add app/Http/Controllers/Admin/OrderController.php tests/Feature/Admin/OrderFilteringTest.php tests/Feature/Admin/OrderTrashTest.php
git commit -m "feat: expand admin order details"
```

Commit frontend from `frontend/main` with the exact intended files:

```bash
git add \
  src/app/api/admin/orders/'[id]'/route.js \
  src/app/api/admin/orders/'[id]'/__tests__/route.test.js \
  src/hooks/api/admin/orders.js \
  src/hooks/api/admin/__tests__/orders.test.jsx \
  src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/orderDisplay.js \
  src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/orderDisplay.test.js \
  src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/FilterOrdersPage.jsx \
  src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/FilterOrdersPage.test.jsx \
  src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/AdminOrderDetail.jsx \
  src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/AdminOrderDetail.test.jsx \
  'src/app/(dashboard)/dashboard/admin/orders/page.js' \
  'src/app/(dashboard)/dashboard/admin/orders/__tests__/OrdersPage.test.jsx'
git commit -m "feat: add inline admin order detail"
```

Do not amend or bypass hooks. If a hook materially rewrites production code, return the changes through code review, simplification, `error-handling-patterns`, affected tests, type-check, lint, diff check, and visible-browser verification before staging a follow-up commit. Pure formatting of documentation still requires inspection and fresh diff/static verification.

- [ ] **Step 7: Push both main branches and verify remote heads**

```bash
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
```

Run the commands in each repository and confirm local HEAD equals the remote `main` SHA.

- [ ] **Step 8: Update and commit the daily report**

Append the completed session to `../Reports/daily-work-report.md`, including the five-row pagination, compact received time, inline detail behavior, tests, visible-browser evidence, review/simplification gates, commit SHAs, and push confirmation. Commit and push the report according to the Reports repository's current branch and conventions; do not mix it into either application repository.

## Expected completion state

- Laravel returns five orders per page and one fresh active or trashed detail with ISO `created_at`.
- Trashed status updates remain rejected.
- The table shows compact received time and accessible View actions in both views.
- The same Orders URL swaps to the approved responsive detail and Back restores exact list state and scroll.
- Active detail status changes refresh detail and list; Trash detail status is read-only.
- Focused backend/frontend tests, type-check, lint, error handling review, code review, simplification, and visible headed-browser verification all pass.
- Backend and frontend commits are pushed to `main`, followed by the report update.
