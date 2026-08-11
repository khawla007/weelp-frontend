# Admin Order and Review Unseen Badges Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show per-admin unseen Order and Review counts in the admin sidebar and clear each count when its list is opened.

**Architecture:** Laravel stores one last-seen timestamp per resource on each admin user and exposes count/mark-seen endpoints inside the existing admin route group. The Next.js sidebar owns a shared SWR count cache, while each list marks only its own resource seen after its first API response supplies a safe `seen_through` boundary.

**Tech Stack:** Laravel 12, PHP 8.2, Eloquent, PHPUnit, Next.js 16, React 19, SWR, Axios, Jest, Testing Library, Tailwind CSS.

---

## File map

Backend responsibilities:

- Create `../backend/database/migrations/2026_08_11_000001_add_admin_navigation_seen_at_to_users_table.php` for deployment-safe timestamp baselines.
- Modify `../backend/app/Models/User.php` for fillable fields, casts, and model documentation.
- Create `../backend/app/Http/Controllers/Admin/NavigationUnseenController.php` for count and mark-seen behavior.
- Modify `../backend/routes/api.php` to register the two authenticated admin routes.
- Modify `../backend/app/Http/Controllers/Admin/OrderController.php` and `../backend/app/Http/Controllers/Admin/ReviewController.php` to expose ISO-8601 creation timestamps used as the clear boundary.
- Create `../backend/tests/Feature/Admin/NavigationUnseenTest.php` and update existing list contract tests.

Frontend responsibilities:

- Create `src/lib/services/adminNavigationUnseen.js` for endpoint calls and response normalization.
- Create `src/hooks/api/admin/navigationUnseen.js` for the shared polling cache and one-shot list-page clearing.
- Modify `src/constants/navigations/AdminNavigation.js`, `src/app/components/Pages/DASHBOARD/admin/app-sidebar.jsx`, and `src/app/components/Pages/DASHBOARD/admin/nav-main.jsx` to attach and display counts.
- Modify `src/app/(dashboard)/dashboard/admin/orders/page.js` and `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/reviews/FilteredReview.jsx` to clear after the first list response.
- Add focused Jest coverage beside the service, hook, sidebar navigation, and list pages.

### Task 0: Load implementation guidance

**Files:** None.

- [ ] **Step 1: Load backend guidance before any Laravel test or code**

Invoke `laravel-specialist` before Task 1. Apply its controller, validation, model, migration, database, and PHPUnit guidance to Tasks 1–3.

- [ ] **Step 2: Keep the mandatory post-change sequence active**

After each implementation task, invoke `error-handling-patterns`, run the focused tests, then run frontend `npm run type-check` and `npm run lint`. After each UI-affecting task (Tasks 5 and 6), open or reload the headed local `agent-browser` session and inspect the changed UI before continuing. Task 7 repeats the complete sequence as the final gate.

### Task 1: Add per-admin timestamp storage

**Files:**

- Create: `../backend/database/migrations/2026_08_11_000001_add_admin_navigation_seen_at_to_users_table.php`
- Modify: `../backend/app/Models/User.php`
- Test: `../backend/tests/Feature/Admin/NavigationUnseenTest.php`

- [ ] **Step 1: Write the failing model and migration test**

Create the test class with `RefreshDatabase`, an `admin()` factory helper, and this first test:

```php
public function test_admin_navigation_seen_timestamps_start_at_the_database_creation_baseline(): void
{
    $before = Carbon::now()->subSecond();
    $admin = $this->admin()->fresh();
    $after = Carbon::now()->addSecond();

    $this->assertNotNull($admin->admin_orders_last_seen_at);
    $this->assertNotNull($admin->admin_reviews_last_seen_at);
    $this->assertTrue($admin->admin_orders_last_seen_at->betweenIncluded($before, $after));
    $this->assertTrue($admin->admin_reviews_last_seen_at->betweenIncluded($before, $after));
}
```

This intentionally compares a real-time window because `useCurrent()` uses the database clock; `Carbon::setTestNow()` does not freeze SQLite or MySQL `CURRENT_TIMESTAMP`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `php artisan test tests/Feature/Admin/NavigationUnseenTest.php`

Expected: FAIL because the two user columns and casts do not exist.

- [ ] **Step 3: Add the migration and model fields**

Use database current-time defaults so existing rows are baselined at migration time and new admins do not inherit historical counts:

```php
Schema::table('users', function (Blueprint $table) {
    $table->timestamp('admin_orders_last_seen_at')->useCurrent()->after('notifications_last_seen_at');
    $table->timestamp('admin_reviews_last_seen_at')->useCurrent()->after('admin_orders_last_seen_at');
});
```

The down migration drops both columns together. Add both names to `$fillable`, return `datetime` for both in `casts()`, and document both as nullable Carbon properties because Eloquent objects created against an unmigrated/legacy row may still surface null.

- [ ] **Step 4: Run the focused test**

Run: `php artisan test tests/Feature/Admin/NavigationUnseenTest.php`

Expected: PASS.

- [ ] **Step 5: Run the mandatory post-change checks**

Invoke `error-handling-patterns` and inspect the migration/model failure paths. Run the focused backend test, then run `npm run type-check` and `npm run lint` in the frontend repository. Browser inspection starts after Task 5 because no UI consumes these fields yet.

- [ ] **Step 6: Record the backend storage checkpoint**

Run `git diff --check` in the backend repository and leave the changes uncommitted. The project requires code review, simplify, and final verification before any implementation commit.

### Task 2: Build the authenticated unseen-count API

**Files:**

- Create: `../backend/app/Http/Controllers/Admin/NavigationUnseenController.php`
- Modify: `../backend/routes/api.php`
- Test: `../backend/tests/Feature/Admin/NavigationUnseenTest.php`

- [ ] **Step 1: Add failing endpoint tests**

Add tests that freeze time, create Orders and Reviews before/after the admin timestamps, and assert:

```php
$this->actingAs($admin, 'api')
    ->getJson('/api/admin/navigation-unseen-counts')
    ->assertOk()
    ->assertExactJson(['data' => ['orders' => 2, 'reviews' => 1]]);
```

Add separate tests proving:

```php
$this->actingAs($admin, 'api')
    ->putJson('/api/admin/navigation-unseen-counts/orders/seen', [
        'seen_through' => '2026-08-11T10:05:00.000Z',
    ])
    ->assertOk()
    ->assertJsonPath('data.orders', 0)
    ->assertJsonPath('data.reviews', 1);
```

Also assert that a second admin retains their counts, a customer receives 403, an unauthenticated request receives 401, `messages` receives 422, malformed dates receive 422, valid-but-non-contract values such as `2026-08-11` receive 422, future dates clamp to `now()`, and an older delayed `seen_through` cannot overwrite a newer stored timestamp. Create records with their factories and explicit `created_at`/`updated_at` values; soft-delete one new Order and assert it is excluded.

- [ ] **Step 2: Run the endpoint tests to verify they fail**

Run: `php artisan test tests/Feature/Admin/NavigationUnseenTest.php`

Expected: FAIL with 404 responses because the routes do not exist.

- [ ] **Step 3: Implement the focused controller**

Use a fixed resource map and one shared response method:

```php
private const RESOURCES = [
    'orders' => ['model' => Order::class, 'attribute' => 'admin_orders_last_seen_at'],
    'reviews' => ['model' => Review::class, 'attribute' => 'admin_reviews_last_seen_at'],
];

public function index(Request $request): JsonResponse
{
    return response()->json(['data' => $this->counts($request->user())]);
}

public function markSeen(Request $request, string $resource): JsonResponse
{
    $validated = Validator::make(
        ['resource' => $resource, 'seen_through' => $request->input('seen_through')],
        ['resource' => ['required', Rule::in(array_keys(self::RESOURCES))], 'seen_through' => ['nullable', 'date_format:Y-m-d\\TH:i:s.v\\Z']],
    )->validate();

    $attribute = self::RESOURCES[$validated['resource']]['attribute'];
    $now = now();
    $candidate = isset($validated['seen_through'])
        ? Carbon::parse($validated['seen_through'])->min($now)
        : $now;
    User::query()
        ->whereKey($request->user()->getKey())
        ->where(function (Builder $query) use ($attribute, $candidate): void {
            $query->whereNull($attribute)->orWhere($attribute, '<', $candidate);
        })
        ->update([$attribute => $candidate]);

    return response()->json(['data' => $this->counts($request->user()->fresh())]);
}
```

`counts(User $admin)` iterates the fixed map and calls each model's normal query with `where('created_at', '>', $admin->{$attribute})->count()`. This naturally excludes soft-deleted Orders. The conditional SQL update is atomic, so an older request that finishes after a newer one cannot move the boundary backwards.

- [ ] **Step 4: Register routes inside the existing admin group**

Import the controller and add:

```php
Route::get('/navigation-unseen-counts', [NavigationUnseenController::class, 'index']);
Route::put('/navigation-unseen-counts/{resource}/seen', [NavigationUnseenController::class, 'markSeen']);
```

- [ ] **Step 5: Run API tests and formatting**

Run: `php artisan test tests/Feature/Admin/NavigationUnseenTest.php`

Expected: all tests PASS.

Run: `./vendor/bin/pint --test app/Http/Controllers/Admin/NavigationUnseenController.php app/Models/User.php routes/api.php tests/Feature/Admin/NavigationUnseenTest.php`

Expected: PASS with no formatting changes required.

- [ ] **Step 6: Run the mandatory post-change checks**

Invoke `error-handling-patterns`, re-check strict validation and concurrent-update failures, then run frontend `npm run type-check` and `npm run lint`. Browser inspection still waits for the sidebar consumer in Task 5.

- [ ] **Step 7: Record the backend API checkpoint**

Run `git diff --check` in the backend repository and leave all implementation changes uncommitted until the final review gate.

### Task 3: Expose safe list boundaries

**Files:**

- Modify: `../backend/app/Http/Controllers/Admin/OrderController.php`
- Modify: `../backend/app/Http/Controllers/Admin/ReviewController.php`
- Modify: `../backend/tests/Feature/Admin/OrderFilteringTest.php`
- Modify: `../backend/tests/Feature/Admin/ReviewAdminTest.php`

- [ ] **Step 1: Write failing list-contract assertions**

For the first Order and Review returned by their admin list endpoints, assert that `created_at` equals the model timestamp serialized with `toISOString()`:

```php
->assertJsonPath('data.0.created_at', $record->created_at->toISOString());
```

Create Orders and Reviews with deliberately non-sequential timestamps and assert page 1 for each resource is newest-first with ID as the tie-breaker.

- [ ] **Step 2: Run the focused contract tests**

Run: `php artisan test tests/Feature/Admin/OrderFilteringTest.php tests/Feature/Admin/ReviewAdminTest.php`

Expected: FAIL because Orders omit `created_at` and Reviews return only `Y-m-d`.

- [ ] **Step 3: Return ISO-8601 timestamps**

Add deterministic ordering before Orders pagination:

```php
$orders = $query
    ->orderByDesc('created_at')
    ->orderByDesc('id')
    ->paginate($perPage, ['*'], 'page', $page);
```

Replace the Review query's ID-only ordering with the same timestamp contract:

```php
$reviews = $query
    ->orderByDesc('created_at')
    ->orderByDesc('id')
    ->paginate(5)
    ->appends($request->query());
```

Add this field to both response mappers:

```php
'created_at' => $record->created_at?->toISOString(),
```

Use the actual mapper variable (`$order` or `$review`). Update the Review table frontend later to render only the date portion so the display does not regress.

- [ ] **Step 4: Re-run the focused contract tests**

Run: `php artisan test tests/Feature/Admin/OrderFilteringTest.php tests/Feature/Admin/ReviewAdminTest.php`

Expected: PASS.

- [ ] **Step 5: Run the mandatory post-change checks and record the checkpoint**

Invoke `error-handling-patterns`, run frontend `npm run type-check` and `npm run lint`, then run `git diff --check` in the backend repository. Leave the changes uncommitted until the final review gate. Browser inspection begins after Task 5 because list-boundary fields have no visible consumer yet.

### Task 4: Add the frontend service and shared SWR hooks

**Files:**

- Create: `src/lib/services/adminNavigationUnseen.js`
- Create: `src/lib/services/__tests__/adminNavigationUnseen.test.js`
- Create: `src/hooks/api/admin/navigationUnseen.js`
- Create: `src/hooks/api/admin/__tests__/navigationUnseen.test.jsx`

- [ ] **Step 0: Load the Next.js and React implementation guidance**

Invoke `next-best-practices`, `vercel-react-best-practices`, and `vercel-composition-patterns` before writing frontend code. Apply their client-boundary, data-fetching, effect, rendering, and composition guidance to Tasks 4–6.

- [ ] **Step 1: Write failing service tests**

Mock `authApi` and assert exact calls and normalized return values:

```js
await fetchAdminNavigationUnseenCounts();
expect(authApi.get).toHaveBeenCalledWith('/api/admin/navigation-unseen-counts');

await markAdminNavigationSeen('orders', '2026-08-11T10:05:00.000Z');
expect(authApi.put).toHaveBeenCalledWith('/api/admin/navigation-unseen-counts/orders/seen', {
  seen_through: '2026-08-11T10:05:00.000Z',
});
```

Test `normalizeAdminNavigationCounts` with missing, negative, fractional, numeric-string, and over-99 values. It should return non-negative integer counts without applying the visual `99+` cap.

- [ ] **Step 2: Write failing hook tests**

Mock the service and render the hooks inside `SWRConfig` with a fresh `Map`. Verify `useAdminNavigationUnseen()` fetches once and exports `refreshInterval: 30000` through a named `ADMIN_NAVIGATION_UNSEEN_REFRESH_INTERVAL` constant. Verify `useMarkAdminNavigationSeen` optimistically clears only its resource, sends one request after `enabled` becomes true, stores the server response on success, and revalidates after rejection.

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx jest src/lib/services/__tests__/adminNavigationUnseen.test.js src/hooks/api/admin/__tests__/navigationUnseen.test.jsx --runInBand`

Expected: FAIL because the modules do not exist.

- [ ] **Step 4: Implement the service**

```js
import { authApi } from '@/lib/axiosInstance';

export const ADMIN_NAVIGATION_UNSEEN_KEY = '/api/admin/navigation-unseen-counts';

export function normalizeAdminNavigationCounts(payload) {
  const counts = payload?.data ?? payload ?? {};
  const normalize = (value) => Math.max(0, Math.floor(Number(value) || 0));
  return { orders: normalize(counts.orders), reviews: normalize(counts.reviews) };
}

export async function fetchAdminNavigationUnseenCounts() {
  const response = await authApi.get(ADMIN_NAVIGATION_UNSEEN_KEY);
  return normalizeAdminNavigationCounts(response.data);
}

export async function markAdminNavigationSeen(resource, seenThrough) {
  const response = await authApi.put(`${ADMIN_NAVIGATION_UNSEEN_KEY}/${resource}/seen`, seenThrough ? { seen_through: seenThrough } : {});
  return normalizeAdminNavigationCounts(response.data);
}
```

- [ ] **Step 5: Implement the polling and mark-seen hooks**

`useAdminNavigationUnseen()` uses the exported cache key, service fetcher, and a 30-second refresh interval. `newestCreatedAt(records)` parses every valid timestamp, takes the maximum, and returns `new Date(maximum).toISOString()` so Laravel always receives the strict three-millisecond-digit UTC contract even though Carbon list responses contain six microsecond digits. `useMarkAdminNavigationSeen(resource, { enabled, seenThrough })` uses `useSWRConfig`, a ref to ensure one request per mount, and an effect that:

1. optimistically mutates `{ ...current, [resource]: 0 }` without revalidation;
2. calls `markAdminNavigationSeen(resource, seenThrough)`;
3. stores the returned two-count object without revalidation;
4. calls `mutate(key)` on rejection to restore server truth.

Ignore the promise only at the outer effect boundary with `void markSeen()`; handle rejection inside the async function so there is no unhandled promise.

- [ ] **Step 6: Run focused frontend tests and mandatory post-change checks**

Run: `npx jest src/lib/services/__tests__/adminNavigationUnseen.test.js src/hooks/api/admin/__tests__/navigationUnseen.test.jsx --runInBand`

Expected: PASS.

Invoke `error-handling-patterns`, run `npm run type-check`, `npm run lint`, and `git diff --check`. Leave the changes uncommitted until the final review gate. This task has no visible rendering change, so headed inspection begins in Task 5.

### Task 5: Render accessible sidebar badges

**Files:**

- Modify: `src/constants/navigations/AdminNavigation.js`
- Modify: `src/app/components/Pages/DASHBOARD/admin/app-sidebar.jsx`
- Modify: `src/app/components/Pages/DASHBOARD/admin/nav-main.jsx`
- Modify: `src/app/components/Pages/DASHBOARD/admin/__tests__/AppSidebar.test.jsx`
- Create: `src/app/components/Pages/DASHBOARD/admin/__tests__/NavMain.test.jsx`

- [ ] **Step 1: Write failing sidebar tests**

Mock the count hook in `AppSidebar.test.jsx`, capture the `NavMain` props, and assert the sidebar passes `{ orders: 4, reviews: 2 }`.

In `NavMain.test.jsx`, use a BOOKING section containing notification-enabled Orders and Reviews. Assert:

```js
expect(screen.getByLabelText('4 unseen Orders')).toHaveTextContent('4');
expect(screen.queryByLabelText(/unseen Reviews/)).not.toBeInTheDocument();
```

Rerender with 125 Reviews and assert the visible text is `99+` while the label remains `125 unseen Reviews`. Assert the badge includes the collapsed override classes and that active-link behavior remains correct.

- [ ] **Step 2: Run sidebar tests to verify they fail**

Run: `npx jest src/app/components/Pages/DASHBOARD/admin/__tests__/AppSidebar.test.jsx src/app/components/Pages/DASHBOARD/admin/__tests__/NavMain.test.jsx --runInBand`

Expected: FAIL because no counts or badges are wired.

- [ ] **Step 3: Add stable navigation keys and fetch once in the sidebar**

Add `notificationKey: 'orders'` and `notificationKey: 'reviews'` to the two BOOKING leaf definitions and document the optional property in the JSDoc. In `AppSidebar`, call `useAdminNavigationUnseen()` and pass its `counts` to `<NavMain items={adminRoutes} counts={counts} />`.

- [ ] **Step 4: Render the badges in `LeafItem`**

Pass `counts` through `NavMain` and `SectionGroup`. Normalize the leaf value to zero, and render only positive counts:

```jsx
<SidebarMenuBadge
  aria-label={`${count} unseen ${item.title}`}
  className="bg-weelp-sage-deep text-white peer-hover/menu-button:text-white peer-data-[active=true]/menu-button:text-white group-data-[collapsible=icon]:!flex group-data-[collapsible=icon]:-right-1 group-data-[collapsible=icon]:top-0 group-data-[collapsible=icon]:h-4 group-data-[collapsible=icon]:min-w-4 group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:text-[9px]"
>
  {count > 99 ? '99+' : count}
</SidebarMenuBadge>
```

Import the existing `SidebarMenuBadge`; do not build a second badge primitive.

- [ ] **Step 5: Run focused sidebar tests and mandatory post-change checks**

Run: `npx jest src/app/components/Pages/DASHBOARD/admin/__tests__/AppSidebar.test.jsx src/app/components/Pages/DASHBOARD/admin/__tests__/NavMain.test.jsx --runInBand`

Expected: PASS.

Invoke `error-handling-patterns`, run `npm run type-check`, `npm run lint`, and `git diff --check`.

- [ ] **Step 6: Inspect the sidebar in a visible browser**

Open or reload `agent-browser --session weelp-admin-unseen --headed open http://localhost:3000/dashboard/admin`. Verify positive and zero counts in expanded desktop, collapsed desktop, and mobile sidebar states. Keep the changes uncommitted until the final review gate.

### Task 6: Clear each badge from its list page

**Files:**

- Modify: `src/app/(dashboard)/dashboard/admin/orders/page.js`
- Modify: `src/app/(dashboard)/dashboard/admin/orders/__tests__/OrdersPage.test.jsx`
- Modify: `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/reviews/FilteredReview.jsx`
- Create: `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/reviews/__tests__/FilteredReviewUnseen.test.jsx`
- Modify: `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/reviews/components/table/Table.jsx`

- [ ] **Step 1: Write failing Orders-page clearing test**

Mock `useMarkAdminNavigationSeen`. Provide an Order with a full timestamp and a completed current-mount validation, then assert:

```js
expect(useMarkAdminNavigationSeen).toHaveBeenLastCalledWith('orders', {
  enabled: true,
  seenThrough: '2026-08-11T10:05:00.000Z',
});
```

Also provide a completed empty response and assert `enabled: true, seenThrough: undefined`. While loading or during the current mount's initial revalidation, assert `enabled: false`. Add a stale-cache case: start with an older cached row while `isValidating` is true, replace it with a newer six-digit Carbon network timestamp, set `isValidating` false, and assert the one-shot boundary is normalized to the newer JavaScript `.000Z` timestamp.

- [ ] **Step 2: Write failing Reviews-list clearing test**

Mock SWR, the mark hook, form UI, table, and pagination. Supply multiple Reviews in descending order and assert the hook receives the newest valid `created_at`. Assert an empty completed response clears with no timestamp and a loading/initially-validating response remains disabled. Add the same stale-cache-to-fresh-response test used for Orders.

- [ ] **Step 3: Run the page tests to verify they fail**

Run: `npx jest src/app/'(dashboard)'/dashboard/admin/orders/__tests__/OrdersPage.test.jsx src/app/components/Pages/DASHBOARD/admin/_rsc_pages/reviews/__tests__/FilteredReviewUnseen.test.jsx --runInBand`

Expected: FAIL because neither page invokes the hook.

- [ ] **Step 4: Wire Orders after its first response**

Derive the newest `created_at` from `data.data` without assuming array order, then call:

```js
useMarkAdminNavigationSeen('orders', {
  enabled: !isLoadingOrders && !isValidatingOrders && !ordersError && Array.isArray(data.data),
  seenThrough: newestCreatedAt(data.data),
});
```

Destructure `isValidating: isValidatingOrders` and `error: ordersError` from `useAllOrdersAdmin`. The default SWR revalidation on mount makes `isValidatingOrders` true for stale cached data; enabling only after it becomes false guarantees the boundary comes from the first settled current-mount response. Keep `newestCreatedAt` as a small exported pure helper in the hook module so both resources share validation and maximum-date logic.

- [ ] **Step 5: Wire Reviews and preserve its date display**

Call the same mark hook after SWR returns a response-shaped `responseData.data` array and the current mount's initial request is neither loading nor validating and has no error. The hook's internal ref makes this a one-shot clear; later filter/pagination validation cannot advance the boundary.

Because the backend now sends ISO timestamps, render the table date as `created_at?.slice(0, 10) ?? ''`.

- [ ] **Step 6: Run all feature-focused frontend tests and mandatory post-change checks**

Run:

```bash
npx jest src/lib/services/__tests__/adminNavigationUnseen.test.js src/hooks/api/admin/__tests__/navigationUnseen.test.jsx src/app/components/Pages/DASHBOARD/admin/__tests__/AppSidebar.test.jsx src/app/components/Pages/DASHBOARD/admin/__tests__/NavMain.test.jsx src/app/'(dashboard)'/dashboard/admin/orders/__tests__/OrdersPage.test.jsx src/app/components/Pages/DASHBOARD/admin/_rsc_pages/reviews/__tests__/FilteredReviewUnseen.test.jsx --runInBand
```

Expected: PASS.

Invoke `error-handling-patterns`, run `npm run type-check`, `npm run lint`, and `git diff --check`.

- [ ] **Step 7: Inspect clearing behavior in the visible browser**

Reload the named headed session. Verify opening Orders clears only Orders, opening Reviews clears only Reviews, and both behaviors work in desktop and mobile sidebar states. Leave the changes uncommitted until the final review gate.

### Task 7: Error handling, full verification, and visible UI check

**Files:**

- Modify only files identified by failing checks or review findings.

- [ ] **Step 1: Apply the error-handling review**

Confirm endpoint validation returns structured 422 responses, the controller never moves timestamps backward, frontend count failures do not block navigation, mark failures revalidate, and no async effect produces an unhandled rejection.

- [ ] **Step 2: Run backend verification**

Run:

```bash
php artisan test tests/Feature/Admin/NavigationUnseenTest.php tests/Feature/Admin/OrderFilteringTest.php tests/Feature/Admin/ReviewAdminTest.php
./vendor/bin/pint --test app/Http/Controllers/Admin/NavigationUnseenController.php app/Http/Controllers/Admin/OrderController.php app/Http/Controllers/Admin/ReviewController.php app/Models/User.php routes/api.php tests/Feature/Admin/NavigationUnseenTest.php tests/Feature/Admin/OrderFilteringTest.php tests/Feature/Admin/ReviewAdminTest.php
```

Expected: all tests PASS and Pint reports no changes needed.

- [ ] **Step 3: Run frontend verification in required order**

Run:

```bash
npm run type-check
npm run lint
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 4: Start local services and open the mandatory visible browser**

Start Laravel on port 8000 and Next.js on port 3000. Then run:

```bash
agent-browser --session weelp-admin-unseen --headed open http://localhost:3000/dashboard/admin
```

The window must remain visible. Log in with the provided local super-admin account if needed.

- [ ] **Step 5: Verify behavior visually and functionally**

Create one local Order and one local Review after setting the current admin's last-seen timestamps behind their creation time. Verify separate numeric badges in the expanded desktop sidebar, then collapse the sidebar and verify compact badges remain legible. Open Orders and verify only Orders clears; return and open Reviews to verify Reviews clears. Repeat at a mobile viewport and confirm navigation remains usable. Wait for or trigger SWR revalidation and confirm a later record restores the matching badge.

- [ ] **Step 6: Run the mandatory code-review and simplify loop**

Dispatch the code reviewer against both repository diffs. Fix critical findings and re-run the focused checks. Invoke the simplify skill, keep only clarity/reuse/efficiency improvements within scope, then repeat type-check, lint, focused tests, and `git diff --check` in both repos.

- [ ] **Step 7: Commit the reviewed implementation and push main**

Only after Step 6 and the repeated verification pass, stage the complete implementation in each owning repository and create one reviewed feature commit per repository. Confirm both repositories are on `main`, then push backend `main` and frontend `main`. Do not push a feature branch.
