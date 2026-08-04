# Order Trash and Pagination Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the admin orders paginator always show page 1 correctly and add recoverable order deletion with All/Trash views, restore, and permanent deletion for both admin roles.

**Architecture:** Laravel soft deletes are the source of truth: the active query uses the default scope, the Trash query uses `onlyTrashed()`, and every list response uses the same paginator contract. The Next.js page owns `page` and `view`; the table owns confirmation UI and delegates successful mutations back to the page for SWR revalidation and out-of-range page recovery.

**Tech Stack:** Laravel 12, Eloquent SoftDeletes, PHPUnit, Next.js 16, React 19, SWR, React Hook Form, TanStack Table, Radix AlertDialog, Jest, Testing Library.

All commands in this plan start from the `frontend` repository root unless a command explicitly changes directory.

---

## File map

Backend repository:

- Create `../backend/database/migrations/2026_08_04_000001_add_deleted_at_to_orders_table.php` for the soft-delete column.
- Modify `../backend/app/Models/Order.php` to enable `SoftDeletes`.
- Modify `../backend/app/Http/Controllers/Admin/OrderController.php` for the stable list contract and trash mutations.
- Modify `../backend/routes/api.php` for restore and force-delete routes.
- Create `../backend/tests/Feature/Admin/OrderTrashTest.php` for the complete API behavior.

Frontend repository:

- Modify `src/app/(dashboard)/dashboard/admin/orders/page.js` for list view state, numeric pagination defaults, query serialization, and page recovery.
- Modify `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/FilterOrdersPage.jsx` for view-aware actions and dialogs.
- Modify `src/lib/actions/orders.js` for restore and permanent-delete actions.
- Modify `src/app/components/__tests__/Pagination.test.jsx` for the page-1 regression.
- Create `src/app/(dashboard)/dashboard/admin/orders/__tests__/OrdersPage.test.jsx` for list navigation and API defaults.
- Create `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/FilterOrdersPage.test.jsx` for row actions.
- Create `src/lib/actions/__tests__/orders.test.js` for mutation endpoints and errors.

## Task 0: Load the required implementation guidance

**Files:** None.

- [ ] **Step 1: Invoke `executing-plans` before implementation**

Use the plan task-by-task with explicit checkpoints. Do not commit during Tasks 1–5; project rules require code review, simplification, and final verification before any code commit.

- [ ] **Step 2: Invoke `laravel-specialist` before Task 1**

Apply its Laravel 12 guidance to the migration, Eloquent model, controller validation, route definitions, and feature tests.

- [ ] **Step 3: Invoke all Next.js/React skills before Task 3**

Invoke `next-best-practices`, `vercel-react-best-practices`, and `vercel-composition-patterns` before changing server actions or React components.

- [ ] **Step 4: Apply the post-change gate after every implementation batch**

After each backend batch, invoke `error-handling-patterns`, run Pint on touched PHP files, and run the focused PHP tests. After each frontend batch, invoke `error-handling-patterns`, then run type-check, lint, focused Jest tests, and the visible local browser check. Do not defer failures to the final task.

## Task 1: Establish Laravel soft-delete storage and list contract

**Files:**

- Create: `../backend/database/migrations/2026_08_04_000001_add_deleted_at_to_orders_table.php`
- Modify: `../backend/app/Models/Order.php`
- Create: `../backend/tests/Feature/Admin/OrderTrashTest.php`
- Modify: `../backend/app/Http/Controllers/Admin/OrderController.php`

- [ ] **Step 1: Write failing feature tests for pagination and active/trash isolation**

Create `OrderTrashTest.php` with `RefreshDatabase`, admin/super-admin helpers, and these core assertions:

```php
public function test_small_active_result_always_returns_page_one_metadata(): void
{
    Order::factory()->count(2)->create();

    $this->actingAs($this->admin(), 'api')->getJson('/api/admin/orders?page=1')
        ->assertOk()
        ->assertJsonPath('current_page', 1)
        ->assertJsonPath('per_page', 3)
        ->assertJsonPath('total', 2)
        ->assertJsonPath('last_page', 1)
        ->assertJsonCount(2, 'data');
}

public function test_empty_result_still_returns_page_one_metadata(): void
{
    $this->actingAs($this->admin(), 'api')->getJson('/api/admin/orders')
        ->assertOk()
        ->assertJsonPath('current_page', 1)
        ->assertJsonPath('per_page', 3)
        ->assertJsonPath('total', 0)
        ->assertJsonPath('last_page', 1);
}

public function test_active_and_trash_views_are_isolated(): void
{
    $active = Order::factory()->create();
    $trashed = Order::factory()->create();
    $trashed->delete();

    $this->actingAs($this->admin(), 'api')->getJson('/api/admin/orders?view=active')
        ->assertOk()->assertJsonPath('data.0.id', $active->id)
        ->assertJsonMissing(['id' => $trashed->id])->assertJsonPath('trash_count', 1);

    $this->actingAs($this->admin(), 'api')->getJson('/api/admin/orders?view=trash')
        ->assertOk()->assertJsonPath('data.0.id', $trashed->id)
        ->assertJsonMissing(['id' => $active->id]);
}

public function test_invalid_view_is_rejected(): void
{
    $this->actingAs($this->admin(), 'api')
        ->getJson('/api/admin/orders?view=everything')->assertUnprocessable();
}
```

- [ ] **Step 2: Run the focused tests and verify the failure**

Run: `cd ../backend && php artisan test tests/Feature/Admin/OrderTrashTest.php`

Expected: FAIL because `orders.deleted_at` and stable `last_page`/`trash_count` fields do not exist.

- [ ] **Step 3: Add the migration and enable `SoftDeletes`**

Use this migration body:

```php
public function up(): void
{
    Schema::table('orders', fn (Blueprint $table) => $table->softDeletes());
}

public function down(): void
{
    Schema::table('orders', fn (Blueprint $table) => $table->dropSoftDeletes());
}
```

Import `Illuminate\Database\Eloquent\SoftDeletes` in `Order.php`, change the trait line to `use HasFactory, SoftDeletes;`, and add nullable Carbon `deleted_at` to the model docblock.

- [ ] **Step 4: Replace conditional collection logic with one validated paginator**

At the start of `index()` use:

```php
$validated = $request->validate([
    'page' => ['sometimes', 'integer'],
    'view' => ['sometimes', Rule::in(['active', 'trash'])],
]);
$perPage = 3;
$page = max(1, (int) ($validated['page'] ?? 1));
$view = $validated['view'] ?? 'active';
$query = $view === 'trash'
    ? Order::onlyTrashed()->with(['user', 'orderable', 'payment', 'emergencyContact'])
    : Order::with(['user', 'orderable', 'payment', 'emergencyContact']);
```

Keep the existing status filter/formatter but always call:

```php
$orders = $query->paginate($perPage, ['*'], 'page', $page);
$formatted = $orders->getCollection()->map(function ($order) {
    return [
        'id' => $order->id,
        'order_type' => strtolower(class_basename($order->orderable_type)),
        'travel_date' => $order->travel_date,
        'preferred_time' => $order->preferred_time,
        'number_of_adults' => $order->number_of_adults,
        'number_of_children' => $order->number_of_children,
        'status' => $order->status,
        'special_requirements' => $order->special_requirements,
        'user' => $order->user,
        'orderable' => $order->orderable,
        'payment' => $order->payment,
        'emergency_contact' => $order->emergencyContact,
    ];
});
```

Always add these response fields and remove `$isPaginated` branches:

```php
'current_page' => $orders->currentPage(),
'per_page' => $orders->perPage(),
'total' => $orders->total(),
'last_page' => $orders->lastPage(),
'trash_count' => Order::onlyTrashed()->count(),
```

Leave summary queries on plain `Order` so they count active rows only.

Extend the page-normalization test with `page=0` and `page=-2`; both responses must report `current_page: 1` rather than 422.

- [ ] **Step 5: Run the focused tests**

Run: `cd ../backend && php artisan test tests/Feature/Admin/OrderTrashTest.php`

Expected: pagination/isolation tests PASS.

- [ ] **Step 6: Run the post-change backend checkpoint without committing**

Invoke `error-handling-patterns`, run Pint on the four touched files, rerun `OrderTrashTest.php`, and inspect `git -C ../backend diff --check`. Then apply `cd ../backend && php artisan migrate` to the local database before any frontend browser checkpoint can query the soft-deleting model. Leave the verified changes uncommitted for the final review gate.

## Task 2: Add restore and permanent-delete API behavior

**Files:**

- Modify: `../backend/tests/Feature/Admin/OrderTrashTest.php`
- Modify: `../backend/app/Http/Controllers/Admin/OrderController.php`
- Modify: `../backend/routes/api.php`

- [ ] **Step 1: Add failing tests for both roles and every mutation state**

Use a data provider that yields the role strings `admin` and `super_admin`. Create the user inside the test after database setup, then assert each role can run:

```php
$this->actingAs($actor, 'api')->deleteJson("/api/admin/orders/{$order->id}")
    ->assertOk()->assertJson(['success' => true, 'message' => 'Order moved to Trash.']);
$this->assertSoftDeleted('orders', ['id' => $order->id]);

$this->actingAs($actor, 'api')->postJson("/api/admin/orders/{$order->id}/restore")
    ->assertOk()->assertJson(['success' => true, 'message' => 'Order restored successfully.']);
$this->assertNotSoftDeleted('orders', ['id' => $order->id]);

$order->delete();
$this->actingAs($actor, 'api')->deleteJson("/api/admin/orders/{$order->id}/force")
    ->assertOk()->assertJson(['success' => true, 'message' => 'Order permanently deleted.']);
$this->assertDatabaseMissing('orders', ['id' => $order->id]);
```

Add separate tests proving restore/force-delete of an active order and delete of an already-trashed order return 404. Build dependent rows explicitly so fixtures satisfy the schema:

```php
$order->payment()->create([
    'payment_status' => 'paid',
    'payment_method' => 'credit_card',
    'total_amount' => 125.00,
]);
$order->emergencyContact()->create([
    'contact_name' => 'Test Contact',
    'contact_phone' => '+15555550123',
    'relationship' => 'Friend',
]);
Commission::create([
    'creator_id' => $order->creator_id,
    'order_id' => $order->id,
    'commission_rate' => 10,
    'commission_amount' => 12.50,
    'status' => 'pending',
]);
$review = Review::factory()->create(['order_id' => $order->id]);
```

Create the order with an explicit creator before the commission. Prove soft delete preserves all four rows; force delete removes payment/contact/commission and changes `$review->fresh()->order_id` to null.

Add a summary test using a completed order with a paid `$125` payment. Assert total/completed/revenue values include it before trash, exclude it after trash, and include it again after restore.

- [ ] **Step 2: Run the focused tests and verify missing routes**

Run: `cd ../backend && php artisan test tests/Feature/Admin/OrderTrashTest.php`

Expected: FAIL on restore/force routes and the existing delete response.

- [ ] **Step 3: Implement state-specific mutations**

```php
public function destroy(int $id)
{
    $order = Order::query()->findOrFail($id);
    $order->delete();
    return response()->json(['success' => true, 'message' => 'Order moved to Trash.']);
}

public function restore(int $id)
{
    $order = Order::onlyTrashed()->findOrFail($id);
    $order->restore();
    return response()->json(['success' => true, 'message' => 'Order restored successfully.']);
}

public function forceDestroy(int $id)
{
    $order = Order::onlyTrashed()->findOrFail($id);
    $order->forceDelete();
    return response()->json(['success' => true, 'message' => 'Order permanently deleted.']);
}
```

- [ ] **Step 4: Register both routes without super-admin middleware**

Inside the existing orders route group add:

```php
Route::post('{id}/restore', [OrderController::class, 'restore']);
Route::delete('{id}/force', [OrderController::class, 'forceDestroy']);
```

The enclosing `auth:api` and `admin` middleware intentionally permits both admin roles.

- [ ] **Step 5: Run focused and related backend tests**

Run:

```bash
cd ../backend
php artisan test tests/Feature/Admin/OrderTrashTest.php tests/Feature/Customer/OrderTest.php tests/Feature/Customer/ReviewTest.php tests/Feature/SuperAdminGatingTest.php
```

Expected: all selected tests PASS.

- [ ] **Step 6: Run the post-change backend checkpoint without committing**

Invoke `error-handling-patterns`, run Pint on all touched backend files, rerun the selected tests, and inspect `git -C ../backend diff --check`. Leave changes uncommitted.

## Task 3: Add tested frontend mutation actions

**Files:**

- Create: `src/lib/actions/__tests__/orders.test.js`
- Modify: `src/lib/actions/orders.js`

- [ ] **Step 1: Write failing server-action tests**

Mock `getAuthApi()` and `revalidatePath()`. Verify:

```js
await deleteOrder(12);             // api.delete('/api/admin/orders/12')
await restoreOrder(12);            // api.post('/api/admin/orders/12/restore')
await permanentlyDeleteOrder(12); // api.delete('/api/admin/orders/12/force')
```

For success assert `{ success: true, message }` and `revalidatePath('/dashboard/admin/orders')`. For an Axios-like rejection containing `response.data.message = 'Order not found.'`, assert `{ success: false, message: 'Order not found.' }`.

- [ ] **Step 2: Run the action test and verify missing exports**

Run: `npm run test:ci -- src/lib/actions/__tests__/orders.test.js --runInBand`

Expected: FAIL because restore/permanent-delete actions do not exist and delete errors discard backend messages.

- [ ] **Step 3: Implement one helper and three named actions**

```js
async function mutateOrder(request) {
  try {
    const api = await getAuthApi();
    const res = await request(api);
    if (!res.data?.success) return { success: false, message: res.data?.message || 'Order action failed.' };
    revalidatePath('/dashboard/admin/orders');
    return { success: true, message: res.data.message };
  } catch (error) {
    return { success: false, message: error?.response?.data?.message || error?.message || 'Order action failed.' };
  }
}

export const deleteOrder = (id) => mutateOrder((api) => api.delete(`/api/admin/orders/${id}`));
export const restoreOrder = (id) => mutateOrder((api) => api.post(`/api/admin/orders/${id}/restore`));
export const permanentlyDeleteOrder = (id) => mutateOrder((api) => api.delete(`/api/admin/orders/${id}/force`));
```

- [ ] **Step 4: Run the action tests**

Run the command from Step 2. Expected: PASS.

- [ ] **Step 5: Run the post-change frontend checkpoint without committing**

Invoke `error-handling-patterns`; run `npm run type-check`, `npm run lint`, the action test, and the explicit headed local-browser smoke check from Task 6 Step 5. Inspect `git diff --check` and leave changes uncommitted.

## Task 4: Fix page-one state and add All/Trash navigation

**Files:**

- Create: `src/app/(dashboard)/dashboard/admin/orders/__tests__/OrdersPage.test.jsx`
- Modify: `src/app/(dashboard)/dashboard/admin/orders/page.js`
- Modify: `src/app/components/__tests__/Pagination.test.jsx`

- [ ] **Step 1: Add the page-one regression test**

```jsx
it('shows page one for an empty first-page result', () => {
  render(<CustomPagination totalItems={0} itemsPerPage={3} currentPage={1} onPageChange={jest.fn()} />);
  expect(screen.getByRole('textbox', { name: 'Page number' })).toHaveValue('1');
  expect(screen.getByText('of 1')).toBeInTheDocument();
});
```

- [ ] **Step 2: Write failing orders-page tests**

Mock `useAllOrdersAdmin`, `FilterOrdersPage`, navigation, and cards. Prove:

```jsx
// A wrapped response with data: { data: [], summary: {} } and no metadata shows "1" and "of 1".
// Clicking Trash produces a hook key containing ?page=1&view=trash.
// Trash has aria-pressed=true and shows trash_count.
// Switching views after page 2 atomically requests only page=1 for the new view.
// On page 2, onOrdersChanged receives { data: { data: [], current_page: 2 } } and causes exactly one page=1 request.
```

- [ ] **Step 3: Run tests and verify orders-page failures**

```bash
npm run test:ci -- --runInBand --runTestsByPath src/app/components/__tests__/Pagination.test.jsx 'src/app/(dashboard)/dashboard/admin/orders/__tests__/OrdersPage.test.jsx'
```

Expected: shared paginator test passes; page tests FAIL due empty defaults and missing view controls.

- [ ] **Step 4: Implement numeric defaults, view state, and recovery**

Replace the debounced React Hook Form pagination state with one atomic query object:

```js
const [listQuery, setListQuery] = useState({ page: 1, view: 'active' });
const { current_page = 1, per_page = 3, total = 0, last_page = 1, trash_count = 0 } = data;
const queryParams = new URLSearchParams({
  page: String(listQuery.page),
  view: listQuery.view,
}).toString();
```

Render accessible All and Trash buttons with `aria-pressed`; Trash includes `trash_count`. `changeView(next)` uses one update: `setListQuery({ page: 1, view: next })`. Pagination uses `setListQuery((current) => ({ ...current, page }))`. Pass `listQuery.view` and `onOrdersChanged` to the table. That callback awaits `mutateOrders()` and, if `listQuery.page > 1` and `refreshed?.data?.data` is empty, makes exactly one update to the preceding page. Remove React Hook Form, lodash debounce, unused imports, and `console.log`.

- [ ] **Step 5: Run the focused page tests**

Run the command from Step 3. Expected: PASS.

- [ ] **Step 6: Run the post-change frontend checkpoint without committing**

Invoke `error-handling-patterns`; run type-check, lint, both focused tests, the explicit headed local-browser smoke check, and `git diff --check`. Leave changes uncommitted.

## Task 5: Build Trash row actions and confirmations

**Files:**

- Create: `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/FilterOrdersPage.test.jsx`
- Modify: `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/FilterOrdersPage.jsx`

- [ ] **Step 1: Write failing interaction tests**

For `view="active"`, assert the named Move to Trash button opens a recoverable confirmation, calls `deleteOrder(21)`, then `onOrdersChanged`. For `view="trash"`, assert the status select is absent, Restore calls `restoreOrder(21)`, and Delete permanently opens an irreversible confirmation before calling `permanentlyDeleteOrder(21)`. A rejected action must not refresh and must send its backend message to a destructive toast.

Representative assertions:

```jsx
fireEvent.click(screen.getByRole('button', { name: 'Move order 21 to Trash' }));
expect(screen.getByRole('alertdialog')).toHaveTextContent('Move order to Trash?');
fireEvent.click(screen.getByRole('button', { name: 'Move to Trash' }));
await waitFor(() => expect(deleteOrder).toHaveBeenCalledWith(21));

await user.click(screen.getByRole('button', { name: 'Delete order 21 permanently' }));
await user.click(screen.getByRole('button', { name: 'Delete permanently' }));
expect(permanentlyDeleteOrder).toHaveBeenCalledWith(21);
```

- [ ] **Step 2: Run the table test and verify failures**

Run: `npm run test:ci -- src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/FilterOrdersPage.test.jsx --runInBand`

Expected: FAIL because view-aware buttons/dialogs do not exist.

- [ ] **Step 3: Implement view-aware actions**

Import `RotateCcw`, `Trash2`, all three order actions, and Radix alert-dialog components. Replace direct icon deletion with named buttons. Use:

```js
const [pendingAction, setPendingAction] = useState(null);
const [isMutating, setIsMutating] = useState(false);
```

Active rows open `{ type: 'trash', order }`. Trash rows render Restore immediately and Delete permanently through `{ type: 'force', order }`. Show status as plain text in Trash and keep the `Select` in All.

Use one result handler:

```js
const runOrderAction = async (action, fallback) => {
  setIsMutating(true);
  try {
    const result = await action();
    if (!result.success) {
      toast({ title: result.message || 'Order action failed.', variant: 'destructive' });
      return;
    }
    toast({ title: result.message || fallback });
    setPendingAction(null);
    await onOrdersChanged();
  } catch (error) {
    toast({ title: error?.message || 'Order action failed.', variant: 'destructive' });
  } finally {
    setIsMutating(false);
  }
};
```

Dialog copy must distinguish recoverable and irreversible actions. Disable mutation and dialog controls while pending. Add a test where the action throws; assert a destructive toast, no refresh, and the row remains.

- [ ] **Step 4: Run the focused table tests**

Run the command from Step 2. Expected: PASS.

- [ ] **Step 5: Run the post-change frontend checkpoint without committing**

Invoke `error-handling-patterns`; run type-check, lint, all focused frontend tests, the headed browser smoke check, and `git diff --check`. Leave changes uncommitted.

## Task 6: Error handling, integration, review, and delivery

**Files:** Modify only task-owned files found deficient by review.

- [ ] **Step 1: Invoke `error-handling-patterns`**

Verify validation returns 422, invalid record states return 404, server actions retain backend messages, pending state always resets in `finally`, and UI refresh runs only after success. Fix each concrete finding test-first.

- [ ] **Step 2: Run backend formatting and tests**

```bash
cd ../backend
./vendor/bin/pint --test app/Models/Order.php app/Http/Controllers/Admin/OrderController.php routes/api.php database/migrations/2026_08_04_000001_add_deleted_at_to_orders_table.php tests/Feature/Admin/OrderTrashTest.php
php artisan test tests/Feature/Admin/OrderTrashTest.php tests/Feature/Customer/OrderTest.php tests/Feature/Customer/ReviewTest.php tests/Feature/SuperAdminGatingTest.php
```

Expected: all PASS.

- [ ] **Step 3: Run frontend type-check, lint, and focused tests**

```bash
npm run type-check
npm run lint
npm run test:ci -- --runInBand --runTestsByPath src/lib/actions/__tests__/orders.test.js src/app/components/__tests__/Pagination.test.jsx 'src/app/(dashboard)/dashboard/admin/orders/__tests__/OrdersPage.test.jsx' src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/FilterOrdersPage.test.jsx
```

Expected: all PASS with zero lint warnings.

- [ ] **Step 4: Apply the local migration and list routes**

```bash
cd ../backend
php artisan migrate
php artisan route:list --path=api/admin/orders
```

Expected: migration succeeds; list, show, update, soft-delete, restore, and force-delete routes appear.

- [ ] **Step 5: Verify in the already-open visible browser**

Ensure the local backend and frontend servers are running, then explicitly open the named visible browser:

```bash
agent-browser --session weelp-visible --headed open http://localhost:3000/dashboard/admin/orders
```

Test desktop and 320 px mobile widths: page `1` is visible; All/Trash isolate records; move, restore, and permanent delete work with confirmations/toasts; an empty view displays `1 of 1`; no horizontal overflow appears.

- [ ] **Step 6: Run code-review and simplify gates**

Dispatch the `code-reviewer` agent over both diffs. Fix critical/important findings and re-review until clear. Invoke `simplify` if it is available. Because it is not currently exposed in this environment, report that limitation and perform a documented manual simplification pass for clarity, reuse, and efficiency. Rerun Steps 2, 3, and 5 after any refinement.

- [ ] **Step 7: Create the only code commits after all gates pass**

Stage only task-owned files. Create one verified backend commit and one verified frontend commit:

```bash
git -C ../backend add app/Models/Order.php app/Http/Controllers/Admin/OrderController.php routes/api.php database/migrations/2026_08_04_000001_add_deleted_at_to_orders_table.php tests/Feature/Admin/OrderTrashTest.php
git -C ../backend commit -m "feat: add recoverable order trash"
git add src/lib/actions/orders.js src/lib/actions/__tests__/orders.test.js src/app/components/__tests__/Pagination.test.jsx 'src/app/(dashboard)/dashboard/admin/orders/page.js' 'src/app/(dashboard)/dashboard/admin/orders/__tests__/OrdersPage.test.jsx' src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/FilterOrdersPage.jsx src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/FilterOrdersPage.test.jsx docs/superpowers/plans/2026-08-04-order-trash-and-pagination.md
git commit -m "feat: add order trash management"
```

- [ ] **Step 8: Push both main branches**

Push `main` in each repository:

```bash
git -C ../backend push origin main
git push origin main
```

Expected: both remote main branches contain the verified changes.
