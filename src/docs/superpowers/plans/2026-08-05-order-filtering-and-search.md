# Order Filtering and Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add pagination-correct Orders status filtering and debounced search across order number, customer name, and item name in both All and Trash views.

**Architecture:** Laravel applies validated `status` and grouped `search` constraints to the active-or-trashed Eloquent query before pagination. The Next.js Orders page owns the applied query state, while `FilterOrdersPage` owns the immediate search input and debounces updates to the page; the status dropdown sits beside the All and Trash controls. TanStack Table remains responsible for rendering, sorting, visibility, selection, and row actions, but no longer performs local list filtering.

**Tech Stack:** Laravel 12, PHP 8.2, Eloquent polymorphic relationships, PHPUnit 11, Next.js 16 App Router, React 19, SWR, TanStack Table 8, Radix Dropdown Menu, Tailwind CSS, Jest 30, Testing Library

---

## File map

- Create `backend/tests/Feature/Admin/OrderFilteringTest.php` — API-level regression coverage for status, search, combined constraints, views, and pagination metadata.
- Modify `backend/app/Http/Controllers/Admin/OrderController.php` — validate list filters and apply them before pagination.
- Modify `frontend/src/app/(dashboard)/dashboard/admin/orders/__tests__/OrdersPage.test.jsx` — page-state, query-string, status-menu, pagination-reset, persistence, and stale-refresh coverage.
- Modify `frontend/src/app/(dashboard)/dashboard/admin/orders/page.js` — own the applied filters, render the status dropdown, and construct the SWR key.
- Modify `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/FilterOrdersPage.test.jsx` — search-input debounce and local-filter removal coverage.
- Modify `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/FilterOrdersPage.jsx` — render the search input and remove page-local TanStack filtering.
- Modify `Reports/daily-work-report.md` — replace the upcoming item with the completed implementation and verification record after both repositories are pushed.

## Guardrails for every production-code task

- Begin implementation by invoking `superpowers:executing-plans` and follow this reviewed plan task by task.
- Use strict red-green-refactor: add the focused test, run it and confirm the expected failure, then change production code.
- Before Laravel production code, invoke `laravel-specialist`. Before either Next.js production-code task, invoke `next-best-practices`, `vercel-react-best-practices`, and `vercel-composition-patterns`.
- After changing Laravel code, invoke `error-handling-patterns`, run the focused backend tests, run Pint on touched PHP files, then run the complete backend Order feature-test group.
- After changing Next.js code, invoke `error-handling-patterns`, run the focused Jest suites, then run `npm run type-check`, `npm run lint`, and the visible headed-browser check on `http://localhost:3000/dashboard/admin/orders` before starting another production-code task.
- Preserve the current Trash/Restore/permanent-delete and status-update business rules. Do not change `ORDER_STATUSES` used by the row-level status editor in this task.
- Keep the active search and status when switching All/Trash, but reset `page` to `1` for every view, status, or applied-search change.
- Do not stage unrelated formatter output. Check both worktrees before and after every commit.

### Task 0: Commit the reviewed implementation plan

**Files:**

- Create: `frontend/src/docs/superpowers/plans/2026-08-05-order-filtering-and-search.md`

- [ ] **Step 1: Complete the mandatory plan-review loop**

Dispatch the `superpowers:code-reviewer` agent with the approved design, this plan, the project instructions, and the relevant source/tests. Address every blocking finding and send the revised plan back until the verdict is Approve.

- [ ] **Step 2: Re-run the plan self-review**

Run:

```bash
cd frontend
npx prettier --write 'src/docs/superpowers/plans/2026-08-05-order-filtering-and-search.md'
rg -n 'T[B]D|T[O]DO|implement[ ]later|fill[ ]in[ ]details|appropriate[ ]error[ ]handling|write[ ]tests[ ]for[ ]the[ ]above|similar[ ]to[ ]Task' \
  'src/docs/superpowers/plans/2026-08-05-order-filtering-and-search.md'
git diff --check
```

Expected: Prettier succeeds, the placeholder scan returns no matches, and the whitespace check passes.

- [ ] **Step 3: Commit only the reviewed plan**

Run:

```bash
cd frontend
git add 'src/docs/superpowers/plans/2026-08-05-order-filtering-and-search.md'
git commit -m "docs: plan order filtering and search"
git status --short
```

Expected: the plan commit succeeds on `main`. If the repository-wide hook rewrites unrelated files, remove only those hook-generated rewrites and leave the plan commit intact.

- [ ] **Step 4: Enter the implementation workflow**

Invoke `superpowers:executing-plans`, load this committed plan, and start Task 1. Do not write production code before its corresponding failing test is observed.

### Task 1: Lock the backend query contract with failing feature tests

**Files:**

- Create: `backend/tests/Feature/Admin/OrderFilteringTest.php`

- [ ] **Step 1: Add the test fixture helpers**

Create the test class with reusable admin and order helpers:

```php
<?php

namespace Tests\Feature\Admin;

use App\Models\Activity;
use App\Models\Order;
use App\Models\Package;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class OrderFilteringTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'status' => User::STATUS_ACTIVE,
        ]);
    }

    private function createOrder(
        string $customerName,
        string $itemName,
        string $status = 'pending',
        bool $trashed = false,
        ?Model $orderable = null,
    ): Order {
        $customer = User::factory()->create(['name' => $customerName]);
        $orderable ??= Activity::factory()->create();
        $orderable->update(['name' => $itemName]);
        $order = Order::factory()->create([
            'user_id' => $customer->id,
            'orderable_type' => $orderable->getMorphClass(),
            'orderable_id' => $orderable->getKey(),
            'status' => $status,
        ]);

        if ($trashed) {
            $order->delete();
        }

        return $order;
    }

    public static function supportedStatuses(): array
    {
        return [
            'pending' => ['pending'],
            'confirmed' => ['confirmed'],
            'completed' => ['completed'],
            'cancelled' => ['cancelled'],
        ];
    }
}
```

- [ ] **Step 2: Add status validation and filtering tests**

Inside the class, add:

```php
#[DataProvider('supportedStatuses')]
public function test_it_filters_orders_by_each_supported_status(string $status): void
{
    $matching = $this->createOrder('Matching Customer', 'Matching Tour', $status);
    $this->createOrder('Other Customer', 'Other Tour', $status === 'pending' ? 'cancelled' : 'pending');

    $this->actingAs($this->admin, 'api')
        ->getJson("/api/admin/orders?status={$status}")
        ->assertOk()
        ->assertJsonPath('total', 1)
        ->assertJsonPath('data.0.id', $matching->id);
}

public function test_it_rejects_invalid_filter_values(): void
{
    $this->actingAs($this->admin, 'api')
        ->getJson('/api/admin/orders?status=processing')
        ->assertUnprocessable()
        ->assertJsonValidationErrors('status');

    $this->actingAs($this->admin, 'api')
        ->getJson('/api/admin/orders?search='.str_repeat('a', 101))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('search');
}
```

- [ ] **Step 3: Add search-field tests**

Add one loop-based test that checks the three supported targets and case-insensitive name matching:

```php
public function test_it_searches_order_number_customer_name_and_item_name(): void
{
    $target = $this->createOrder('Khawla Traveller', 'Desert Safari Deluxe');
    $other = $this->createOrder('Another Customer', 'Mountain Escape');

    foreach ([(string) $target->id, 'kHaWlA', 'sAfArI'] as $search) {
        $this->actingAs($this->admin, 'api')
            ->getJson('/api/admin/orders?search='.urlencode($search))
            ->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.id', $target->id);
    }
}
```

Add literal wildcard coverage so `%` and `_` are treated as search text rather than SQL patterns:

```php
public function test_search_treats_like_wildcards_and_escape_marker_as_literal_characters(): void
{
    $percentMatch = $this->createOrder('Percent Customer', 'Save 100% Adventure');
    $this->createOrder('Percent Other', 'Save 1000 Adventure');
    $underscoreMatch = $this->createOrder('Underscore Customer', 'Route A_B');
    $this->createOrder('Underscore Other', 'Route ACB');
    $escapeMatch = $this->createOrder('Escape Customer', 'Bang!Trip');
    $this->createOrder('Escape Other', 'BangTrip');

    $this->actingAs($this->admin, 'api')
        ->getJson('/api/admin/orders?search='.urlencode('100%'))
        ->assertOk()
        ->assertJsonPath('total', 1)
        ->assertJsonPath('data.0.id', $percentMatch->id);

    $this->actingAs($this->admin, 'api')
        ->getJson('/api/admin/orders?search='.urlencode('A_B'))
        ->assertOk()
        ->assertJsonPath('total', 1)
        ->assertJsonPath('data.0.id', $underscoreMatch->id);

    $this->actingAs($this->admin, 'api')
        ->getJson('/api/admin/orders?search='.urlencode('Bang!'))
        ->assertOk()
        ->assertJsonPath('total', 1)
        ->assertJsonPath('data.0.id', $escapeMatch->id);
}
```

- [ ] **Step 4: Add combined active/Trash and pagination tests**

Add:

```php
public function test_status_and_search_are_grouped_inside_each_order_view(): void
{
    $activeMatch = $this->createOrder('Active Traveller', 'Desert Safari', 'completed');
    $this->createOrder('Active Traveller', 'Desert Safari', 'pending');
    $trashedMatch = $this->createOrder('Trash Traveller', 'Desert Safari', 'completed', true);

    $this->actingAs($this->admin, 'api')
        ->getJson('/api/admin/orders?view=active&status=completed&search=desert')
        ->assertOk()
        ->assertJsonPath('total', 1)
        ->assertJsonPath('data.0.id', $activeMatch->id);

    $this->actingAs($this->admin, 'api')
        ->getJson('/api/admin/orders?view=trash&status=completed&search=desert')
        ->assertOk()
        ->assertJsonPath('total', 1)
        ->assertJsonPath('data.0.id', $trashedMatch->id);
}

public function test_trash_item_search_finds_a_morph_type_with_no_active_orders(): void
{
    $package = Package::factory()->create(['name' => 'Trash Only Package']);
    $trashed = $this->createOrder('Trash Customer', $package->name, 'completed', true, $package);

    $this->actingAs($this->admin, 'api')
        ->getJson('/api/admin/orders?view=trash&search=only+package')
        ->assertOk()
        ->assertJsonPath('total', 1)
        ->assertJsonPath('data.0.id', $trashed->id);
}

public function test_filtered_pagination_does_not_filter_global_metrics(): void
{
    foreach (range(1, 4) as $index) {
        $this->createOrder("Safari Customer {$index}", "Safari Trip {$index}", 'completed');
    }

    $this->createOrder('Other Customer', 'City Walk', 'pending');
    $this->createOrder('Deleted Customer', 'Deleted Trip', 'cancelled', true);

    $this->actingAs($this->admin, 'api')
        ->getJson('/api/admin/orders?page=1&status=completed&search=safari')
        ->assertOk()
        ->assertJsonPath('current_page', 1)
        ->assertJsonPath('per_page', 3)
        ->assertJsonPath('total', 4)
        ->assertJsonPath('last_page', 2)
        ->assertJsonCount(3, 'data')
        ->assertJsonPath('summary.total_orders', 5)
        ->assertJsonPath('trash_count', 1);
}

public function test_empty_filtered_results_keep_page_one_metadata(): void
{
    $this->createOrder('Existing Customer', 'Existing Trip', 'pending');

    $this->actingAs($this->admin, 'api')
        ->getJson('/api/admin/orders?page=1&status=completed&search=missing')
        ->assertOk()
        ->assertJsonPath('current_page', 1)
        ->assertJsonPath('per_page', 3)
        ->assertJsonPath('total', 0)
        ->assertJsonPath('last_page', 1)
        ->assertJsonCount(0, 'data')
        ->assertJsonPath('message', 'No orders match the selected filters.');
}
```

- [ ] **Step 5: Run the new tests and verify RED**

Run:

```bash
cd backend
php artisan test tests/Feature/Admin/OrderFilteringTest.php
```

Expected: failures for `completed` filtering, validation, all search branches, literal wildcard handling, Trash-only morph discovery, combined filtering, and the filtered empty-state message because the controller does not yet implement this contract.

### Task 2: Implement server-side filtering before pagination

**Files:**

- Modify: `backend/app/Http/Controllers/Admin/OrderController.php:91-120`
- Test: `backend/tests/Feature/Admin/OrderFilteringTest.php`

- [ ] **Step 1: Load the Laravel implementation guidance**

Invoke `laravel-specialist` and apply its Eloquent, validation, eager-loading, and PHPUnit guidance to this controller change. Do not begin production code before Task 1 has produced the expected RED failures.

- [ ] **Step 2: Import query support and validate the new query contract**

Add the imports:

```php
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;
```

Replace the `index` validation and raw status lookup with:

```php
$validated = $request->validate([
    'page' => ['sometimes', 'integer'],
    'view' => ['sometimes', Rule::in(['active', 'trash'])],
    'status' => ['sometimes', 'nullable', Rule::in(['pending', 'confirmed', 'completed', 'cancelled'])],
    'search' => ['sometimes', 'nullable', 'string', 'max:100'],
]);

$perPage = 3;
$page = max(1, (int) ($validated['page'] ?? 1));
$view = $validated['view'] ?? 'active';
$status = $validated['status'] ?? null;
$search = trim((string) ($validated['search'] ?? ''));
$orderableTypes = array_values(Relation::morphMap());
```

- [ ] **Step 3: Apply grouped status and portable literal search constraints**

Immediately after choosing the active or Trash base query, replace the legacy status block with:

```php
if ($status) {
    $query->where('status', $status);
}

if ($search !== '') {
    $escapedSearch = str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $search);
    $searchPattern = "%{$escapedSearch}%";

    $query->where(function (Builder $searchQuery) use ($orderableTypes, $search, $searchPattern): void {
        $searchQuery
            ->whereHas('user', function (Builder $userQuery) use ($searchPattern): void {
                $userQuery->whereRaw("LOWER(name) LIKE LOWER(?) ESCAPE '!'", [$searchPattern]);
            })
            ->orWhereHasMorph('orderable', $orderableTypes, function (Builder $orderableQuery) use ($searchPattern): void {
                $orderableQuery->whereRaw("LOWER(name) LIKE LOWER(?) ESCAPE '!'", [$searchPattern]);
            });

        if (ctype_digit($search)) {
            $searchQuery->orWhereKey((int) $search);
        }
    });
}
```

Using the configured morph-map values avoids Laravel’s `'*'` discovery query, which would exclude orderable types represented only by soft-deleted orders. The bound raw predicates use `!` as an explicit escape marker on both SQLite tests and production MySQL, so `%`, `_`, and `!` in user input are matched literally.

Keep eager loading, pagination, row formatting, global summary queries, and `trash_count` unchanged. Update the empty-result message to avoid claiming there are merely “no more” rows when filters have no match:

```php
if ($formatted->isEmpty()) {
    $response['message'] = $status || $search !== ''
        ? 'No orders match the selected filters.'
        : 'No more orders available.';
}
```

- [ ] **Step 4: Run the focused backend tests and verify GREEN**

Run:

```bash
cd backend
php artisan test tests/Feature/Admin/OrderFilteringTest.php
```

Expected: all new filtering tests pass.

- [ ] **Step 5: Apply the post-change backend gate**

Invoke `error-handling-patterns` and inspect the validation/query failure paths. Then run:

```bash
cd backend
./vendor/bin/pint app/Http/Controllers/Admin/OrderController.php tests/Feature/Admin/OrderFilteringTest.php
php artisan test tests/Feature/Admin/OrderFilteringTest.php tests/Feature/Admin/OrderTrashTest.php
```

Expected: Pint completes cleanly and both Order feature-test files pass with no failures.

### Task 3: Lock page-level filter state and query construction with failing tests

**Files:**

- Modify: `frontend/src/app/(dashboard)/dashboard/admin/orders/__tests__/OrdersPage.test.jsx`

- [ ] **Step 1: Expand the table mock so page tests can drive search**

Replace the `FilterOrdersPage` mock with:

```jsx
jest.mock('@/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/FilterOrdersPage', () => ({
  FilterOrdersPage: ({ view, search, onSearchChange, onOrdersChanged }) => (
    <div>
      <span data-testid="table-view">{view}</span>
      <input aria-label="Mock order search" value={search} onChange={(event) => onSearchChange(event.target.value)} />
      <button type="button" onClick={onOrdersChanged}>
        Refresh orders
      </button>
    </div>
  ),
}));
```

- [ ] **Step 2: Add default status and selected-status tests**

Add:

```jsx
it('starts with All Status and omits empty filters from the request', () => {
  render(<OrdersPage />);

  expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=1&view=active');
  expect(screen.getByRole('button', { name: 'Filter orders by status: All Status' })).toHaveAttribute('aria-pressed', 'false');
});

it('applies and clears a status filter from the order-view row', async () => {
  render(<OrdersPage />);

  fireEvent.click(screen.getByRole('button', { name: 'Filter orders by status: All Status' }));
  fireEvent.click(await screen.findByRole('menuitemradio', { name: 'Completed' }));

  await waitFor(() => expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=1&view=active&status=completed'));
  expect(screen.getByRole('button', { name: 'Filter orders by status: Completed' })).toHaveAttribute('aria-pressed', 'true');

  fireEvent.click(screen.getByRole('button', { name: 'Filter orders by status: Completed' }));
  fireEvent.click(await screen.findByRole('menuitemradio', { name: 'All Status' }));

  await waitFor(() => expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=1&view=active'));
});
```

- [ ] **Step 3: Add combined-filter persistence and encoding coverage**

Add:

```jsx
it('combines encoded search and status filters across All and Trash', async () => {
  render(<OrdersPage />);

  fireEvent.click(screen.getByRole('button', { name: 'Filter orders by status: All Status' }));
  fireEvent.click(await screen.findByRole('menuitemradio', { name: 'Completed' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Mock order search' }), {
    target: { value: 'Desert Safari & BBQ' },
  });

  await waitFor(() => expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=1&view=active&status=completed&search=Desert+Safari+%26+BBQ'));

  fireEvent.click(screen.getByRole('button', { name: 'Trash (2)' }));

  await waitFor(() => expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=1&view=trash&status=completed&search=Desert+Safari+%26+BBQ'));
  expect(screen.getByRole('textbox', { name: 'Mock order search' })).toHaveValue('Desert Safari & BBQ');
  expect(screen.getByRole('button', { name: 'Filter orders by status: Completed' })).toHaveAttribute('aria-pressed', 'true');
});
```

- [ ] **Step 4: Add atomic page reset and complete stale-query protection**

Add exact red tests proving status and applied-search changes atomically return page two to page one:

```jsx
it('resets page atomically when status changes', async () => {
  render(<OrdersPage />);

  fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
  await waitFor(() => expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=2&view=active'));
  const callsBeforeFilter = useAllOrdersAdmin.mock.calls.length;

  fireEvent.click(screen.getByRole('button', { name: 'Filter orders by status: All Status' }));
  fireEvent.click(await screen.findByRole('menuitemradio', { name: 'Completed' }));

  await waitFor(() => expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=1&view=active&status=completed'));
  const filterCalls = useAllOrdersAdmin.mock.calls.slice(callsBeforeFilter).map(([query]) => query);
  expect(filterCalls).not.toContain('?page=2&view=active&status=completed');
});

it('resets page atomically when applied search changes', async () => {
  render(<OrdersPage />);

  fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
  await waitFor(() => expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=2&view=active'));
  const callsBeforeFilter = useAllOrdersAdmin.mock.calls.length;

  fireEvent.change(screen.getByRole('textbox', { name: 'Mock order search' }), {
    target: { value: 'Safari' },
  });

  await waitFor(() => expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=1&view=active&search=Safari'));
  const filterCalls = useAllOrdersAdmin.mock.calls.slice(callsBeforeFilter).map(([query]) => query);
  expect(filterCalls).not.toContain('?page=2&view=active&search=Safari');
});
```

Add a clearing test proving each filter is independent:

```jsx
it('clears one filter without clearing the other', async () => {
  render(<OrdersPage />);

  fireEvent.click(screen.getByRole('button', { name: 'Filter orders by status: All Status' }));
  fireEvent.click(await screen.findByRole('menuitemradio', { name: 'Completed' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Mock order search' }), {
    target: { value: 'Safari' },
  });
  await waitFor(() => expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=1&view=active&status=completed&search=Safari'));

  fireEvent.change(screen.getByRole('textbox', { name: 'Mock order search' }), {
    target: { value: '' },
  });
  await waitFor(() => expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=1&view=active&status=completed'));

  fireEvent.change(screen.getByRole('textbox', { name: 'Mock order search' }), {
    target: { value: 'Safari' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Filter orders by status: Completed' }));
  fireEvent.click(await screen.findByRole('menuitemradio', { name: 'All Status' }));

  await waitFor(() => expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=1&view=active&search=Safari'));
});
```

Finally, replace the old stale-fallback test’s view-only change with a search change and assert the old mutation cannot move the new filtered query backward:

```jsx
it('does not apply an old page fallback after search changes', async () => {
  let resolveMutation;
  mutateOrders.mockReturnValueOnce(
    new Promise((resolve) => {
      resolveMutation = resolve;
    }),
  );
  render(<OrdersPage />);

  fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
  await waitFor(() => expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=2&view=active'));
  fireEvent.click(screen.getByRole('button', { name: 'Refresh orders' }));

  fireEvent.change(screen.getByRole('textbox', { name: 'Mock order search' }), {
    target: { value: 'Safari' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
  await waitFor(() => expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=2&view=active&search=Safari'));
  const callsBeforeResolution = useAllOrdersAdmin.mock.calls.length;

  await act(async () => {
    resolveMutation({ data: { ...backendResponse, data: [], current_page: 2 } });
  });

  const callsAfterResolution = useAllOrdersAdmin.mock.calls.slice(callsBeforeResolution).map(([query]) => query);
  expect(callsAfterResolution).not.toContain('?page=1&view=active&search=Safari');
  expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=2&view=active&search=Safari');
});
```

- [ ] **Step 5: Run the page suite and verify RED**

Run:

```bash
cd frontend
npx jest --runInBand 'src/app/(dashboard)/dashboard/admin/orders/__tests__/OrdersPage.test.jsx'
```

Expected: failures because the page has no status menu, search state, filter query parameters, or full-query stale guard.

### Task 4: Implement page-level status, search, and pagination state

**Files:**

- Modify: `frontend/src/app/(dashboard)/dashboard/admin/orders/page.js`
- Test: `frontend/src/app/(dashboard)/dashboard/admin/orders/__tests__/OrdersPage.test.jsx`

- [ ] **Step 1: Load the required Next.js and React implementation guidance**

Invoke `next-best-practices`, `vercel-react-best-practices`, and `vercel-composition-patterns`. Keep the existing client/SWR boundary, use functional state updates for atomic query changes, and avoid adding a context or reusable abstraction for this page-only state.

- [ ] **Step 2: Add status-menu imports and stable options**

Change the React import and add the dropdown imports:

```jsx
import { useCallback, useState } from 'react';

import { ChevronDown } from 'lucide-react';

import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
```

Hoist the filter options outside the component:

```jsx
const ORDER_STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];
```

- [ ] **Step 3: Expand list state and omit empty query parameters**

Replace the initial state and query construction with:

```jsx
const [listQuery, setListQuery] = useState({ page: 1, view: 'active', status: '', search: '' });
const queryParams = new URLSearchParams({
  page: String(listQuery.page),
  view: listQuery.view,
});

if (listQuery.status) queryParams.set('status', listQuery.status);
if (listQuery.search) queryParams.set('search', listQuery.search);

const { orders = {}, isLoading: isLoadingOrders, mutate: mutateOrders } = useAllOrdersAdmin(`?${queryParams.toString()}`);
```

- [ ] **Step 4: Add atomic filter handlers and full-query stale protection**

Keep `handlePageChange`, then use these handlers:

```jsx
const handleViewChange = (view) => {
  setListQuery((current) => ({ ...current, page: 1, view }));
};

const handleStatusChange = (value) => {
  const status = value === 'all' ? '' : value;
  setListQuery((current) => (current.status === status ? current : { ...current, page: 1, status }));
};

const handleSearchChange = useCallback((search) => {
  setListQuery((current) => (current.search === search ? current : { ...current, page: 1, search }));
}, []);
```

Inside the mutation fallback, compare every key before changing the page:

```jsx
if (current.page !== requestedQuery.page || current.view !== requestedQuery.view || current.status !== requestedQuery.status || current.search !== requestedQuery.search) {
  return current;
}
```

- [ ] **Step 5: Render the accessible status control beside All and Trash**

After the Trash button, add:

```jsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button
      type="button"
      variant={listQuery.status ? 'default' : 'outline'}
      aria-label={`Filter orders by status: ${ORDER_STATUS_OPTIONS.find((option) => option.value === (listQuery.status || 'all'))?.label}`}
      aria-pressed={Boolean(listQuery.status)}
    >
      {ORDER_STATUS_OPTIONS.find((option) => option.value === (listQuery.status || 'all'))?.label}
      <ChevronDown className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="start">
    <DropdownMenuRadioGroup value={listQuery.status || 'all'} onValueChange={handleStatusChange}>
      {ORDER_STATUS_OPTIONS.map((option) => (
        <DropdownMenuRadioItem key={option.value} value={option.value}>
          {option.label}
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  </DropdownMenuContent>
</DropdownMenu>
```

Compute the selected option once before JSX if the repeated lookup makes the final code less clear.

- [ ] **Step 6: Pass the applied search contract to the table**

Replace the table invocation with:

```jsx
<FilterOrdersPage data={data} view={listQuery.view} search={listQuery.search} onSearchChange={handleSearchChange} onOrdersChanged={handleOrdersChanged} />
```

- [ ] **Step 7: Run the page tests and verify GREEN**

Run:

```bash
cd frontend
npx jest --runInBand 'src/app/(dashboard)/dashboard/admin/orders/__tests__/OrdersPage.test.jsx'
```

Expected: all page-state tests pass.

- [ ] **Step 8: Apply the mandatory frontend post-change gate**

Invoke `error-handling-patterns`, then run:

```bash
cd frontend
npx jest --runInBand 'src/app/(dashboard)/dashboard/admin/orders/__tests__/OrdersPage.test.jsx'
npm run type-check
npm run lint
```

In the visible named `weelp-visible` browser, reload `http://localhost:3000/dashboard/admin/orders`, confirm All/Trash still switch correctly, and confirm the new status button is present and keyboard-openable. Do not assess filtering results until Task 6 connects the debounced input and backend.

### Task 5: Lock the debounced search toolbar with failing tests

**Files:**

- Modify: `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/FilterOrdersPage.test.jsx`

- [ ] **Step 1: Allow the test helper to provide the search contract**

Replace `renderTable` with:

```jsx
function renderTable({ view = 'active', search = '', onSearchChange = jest.fn(), onOrdersChanged = jest.fn() } = {}) {
  render(<FilterOrdersPage data={{ data: [order] }} view={view} search={search} onSearchChange={onSearchChange} onOrdersChanged={onOrdersChanged} />);
  return { onSearchChange, onOrdersChanged };
}
```

- [ ] **Step 2: Add the 300 ms debounce test**

Import `act`, then add:

```jsx
it('debounces search changes and trims the applied query', () => {
  jest.useFakeTimers();
  const onSearchChange = jest.fn();
  renderTable({ onSearchChange });

  fireEvent.change(screen.getByPlaceholderText('Search by order number, customer, or item'), {
    target: { value: '  Desert Safari  ' },
  });

  act(() => jest.advanceTimersByTime(299));
  expect(onSearchChange).not.toHaveBeenCalled();

  act(() => jest.advanceTimersByTime(1));
  expect(onSearchChange).toHaveBeenCalledTimes(1);
  expect(onSearchChange).toHaveBeenCalledWith('Desert Safari');
  jest.useRealTimers();
});
```

Use `afterEach(() => jest.useRealTimers())` so a failing assertion cannot leak fake timers into later tests.

- [ ] **Step 3: Add toolbar and TanStack ownership assertions**

Add:

```jsx
it('renders the replacement search field instead of the old status text field', () => {
  renderTable({ search: 'Safari' });

  expect(screen.getByPlaceholderText('Search by order number, customer, or item')).toHaveValue('Safari');
  expect(screen.queryByPlaceholderText('Filter By status...')).not.toBeInTheDocument();
});

it('does not configure a page-local filtered row model', () => {
  renderTable();

  const options = useReactTable.mock.calls.at(-1)[0];
  expect(options.onColumnFiltersChange).toBeUndefined();
  expect(options.getFilteredRowModel).toBeUndefined();
  expect(options.state).not.toHaveProperty('columnFilters');
});
```

- [ ] **Step 4: Run the table suite and verify RED**

Run:

```bash
cd frontend
npx jest --runInBand 'src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/FilterOrdersPage.test.jsx'
```

Expected: failures because the old status input and TanStack local filter still exist and no debounced search callback is implemented.

### Task 6: Implement the debounced server-search toolbar

**Files:**

- Modify: `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/FilterOrdersPage.jsx`
- Test: `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/FilterOrdersPage.test.jsx`

- [ ] **Step 1: Reload the required Next.js and React guidance for the table boundary**

Invoke `next-best-practices`, `vercel-react-best-practices`, and `vercel-composition-patterns`. Keep immediate input state local, keep the API-facing value in the page, and keep the callback stable so the debounce effect does not restart on unrelated renders.

- [ ] **Step 2: Add immediate search state and the debounce effect**

Change the imports:

```jsx
import { useCallback, useEffect, useMemo, useState } from 'react';

import { flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
```

Expand the component signature and add local input state:

```jsx
export function FilterOrdersPage({ data = {}, view = 'active', search = '', onSearchChange, onOrdersChanged }) {
  const [sorting, setSorting] = useState('');
  const [searchValue, setSearchValue] = useState(search);
```

After `useToast`, add:

```jsx
useEffect(() => {
  const timeoutId = window.setTimeout(() => {
    const nextSearch = searchValue.trim();

    if (nextSearch !== search) {
      onSearchChange?.(nextSearch);
    }
  }, 300);

  return () => window.clearTimeout(timeoutId);
}, [onSearchChange, search, searchValue]);
```

- [ ] **Step 3: Remove local TanStack filter state and configuration**

Delete `columnFilters`, `setColumnFilters`, `onColumnFiltersChange`, `getFilteredRowModel`, and `columnFilters` from the table state. Keep sorting, pagination, visibility, selection, and the stable empty-data/column memoization.

- [ ] **Step 4: Replace the status text field with the search field**

Replace the current toolbar input with:

```jsx
<Input type="search" placeholder="Search by order number, customer, or item" value={searchValue} onChange={(event) => setSearchValue(event.target.value)} className="max-w-sm" />
```

Keep the Columns dropdown and its `ml-auto` alignment unchanged. Replace the selected-row summary with table models that do not depend on local filtering:

```jsx
{table.getSelectedRowModel().rows.length} of {table.getRowModel().rows.length} row(s) selected.
```

- [ ] **Step 5: Run both focused frontend suites and verify GREEN**

Run:

```bash
cd frontend
npx jest --runInBand \
  'src/app/(dashboard)/dashboard/admin/orders/__tests__/OrdersPage.test.jsx' \
  'src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/FilterOrdersPage.test.jsx'
```

Expected: both suites pass with no timer, React `act`, or Radix accessibility warnings.

- [ ] **Step 6: Apply the mandatory frontend post-change gate**

Invoke `error-handling-patterns`, then run:

```bash
cd frontend
npm run type-check
npm run lint
```

Use the visible `weelp-visible` headed browser on the local Orders route. Verify that typing stays responsive, requests wait roughly 300 ms, search/status combine, filters persist across All/Trash, and empty results use the existing table state. Repeat at desktop and a narrow viewport before moving to final review.

### Task 7: Run cross-stack regression and build verification

**Files:**

- Verify all files listed in the file map.

- [ ] **Step 1: Run the backend regression gate**

Run:

```bash
cd backend
./vendor/bin/pint --test app/Http/Controllers/Admin/OrderController.php tests/Feature/Admin/OrderFilteringTest.php
php artisan test tests/Feature/Admin/OrderFilteringTest.php tests/Feature/Admin/OrderTrashTest.php
```

Expected: formatting check passes and all Order filtering/Trash tests pass.

- [ ] **Step 2: Run the frontend regression gate**

Run:

```bash
cd frontend
npx jest --runInBand \
  'src/app/(dashboard)/dashboard/admin/orders/__tests__/OrdersPage.test.jsx' \
  'src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/FilterOrdersPage.test.jsx' \
  'src/lib/actions/__tests__/orders.test.js'
npm run type-check
npm run lint
npm run build
git diff --check
```

Expected: focused tests, type-check, lint, dark-mode guard, production build, and whitespace check all pass.

- [ ] **Step 3: Complete the visible browser matrix**

With the local frontend and backend running, use only the visible headed named session:

```bash
agent-browser --session weelp-visible --headed open http://localhost:3000/dashboard/admin/orders
```

Verify:

1. Default All/All Status state and the replacement search field.
2. Each status selection and All Status clearing.
3. Search by a visible order number, customer name, and item name.
4. A combined status/search query in All and Trash.
5. Filter persistence when switching views and page-one reset when changing filters.
6. No-results rendering, Columns alignment, focus ring, arrow-key/radio-menu behavior, and narrow-width wrapping.
7. Existing Trash confirmation, Restore availability, and row-level status controls remain present in their appropriate views.

Expected: behavior matches the approved design with no console errors or visible layout regression.

### Task 8: Review, simplify, commit, push, and document

**Files:**

- Review all changed backend and frontend files.
- Modify: `Reports/daily-work-report.md`

- [ ] **Step 1: Run the mandatory code-review loop**

Dispatch the `superpowers:code-reviewer` agent after all tests and static checks pass. Give it the approved design, this plan, both repository diffs, and the project instructions. Fix every critical or important finding, rerun the affected red-green tests and verification gates, and send the revised diff back for re-review until no blocking findings remain.

- [ ] **Step 2: Run the mandatory simplify pass**

Invoke the `simplify` skill on the reviewed diff. Accept only changes that reduce duplication or clarify state/query ownership without broadening scope. Rerun focused backend/frontend tests, type-check, lint, and `git diff --check` after simplification.

- [ ] **Step 3: Commit the backend on `main`**

Confirm only the intended backend files are changed, then run:

```bash
cd backend
git branch --show-current
git status --short
git add app/Http/Controllers/Admin/OrderController.php tests/Feature/Admin/OrderFilteringTest.php
git commit -m "Add order filtering and search"
git status --short
```

Expected: branch is `main`, the commit succeeds, and the backend worktree is clean.

- [ ] **Step 4: Commit the frontend on `main`**

Confirm only the intended frontend source and test files are changed. The reviewed plan was already committed in Task 0, so do not include it again:

```bash
cd frontend
git branch --show-current
git status --short
git add \
  'src/app/(dashboard)/dashboard/admin/orders/page.js' \
  'src/app/(dashboard)/dashboard/admin/orders/__tests__/OrdersPage.test.jsx' \
  'src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/FilterOrdersPage.jsx' \
  'src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/FilterOrdersPage.test.jsx'
git commit -m "Add order filtering and search controls"
git status --short
```

Expected: branch is `main`, the commit succeeds, and any repository-wide hook formatting outside the staged paths is inspected and removed rather than included.

- [ ] **Step 5: Push and verify both `main` branches**

Run:

```bash
cd backend
git push origin main
git rev-parse HEAD

cd ../frontend
git push origin main
git rev-parse HEAD
```

Expected: both pushes succeed and each local `HEAD` matches `origin/main`.

- [ ] **Step 6: Update the daily report with verified hashes**

After both pushes succeed, move the August 5 Orders filtering/search item out of `Upcoming work` and append a completed-work entry to `Reports/daily-work-report.md` describing:

- the server-side status/search query contract;
- pagination and All/Trash persistence behavior;
- the accessible All Status control and debounced search field;
- regression, static-analysis, build, and visible-browser results;
- the final pushed frontend and backend commit hashes returned in Step 5;
- the separate frontend design commit and Task 0 plan commit.

Do not add secrets, credentials, or raw authenticated request details. Run `git diff --check` in the Reports workspace and perform its repository-appropriate save/commit step only if that workspace is versioned separately.
