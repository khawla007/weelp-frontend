# Cancellation Alerts and Admin Attention Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Before Laravel changes, invoke `laravel-specialist`. Before Next.js/React changes, invoke `next-best-practices`, `vercel-react-best-practices`, and `vercel-composition-patterns`. After every code-change task, apply `error-handling-patterns`, run its focused tests, and run its scoped formatting/static checks. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver deduplicated cancellation emails and in-app notifications, exact booking deep links, and a state-driven danger `!` plus highlighted rows for admin orders needing cancellation attention.

**Architecture:** A focused Laravel `CancellationNotificationService` writes per-recipient notification rows inside the cancellation transition transaction and queues matching mail only after the outermost commit. Cancellation state, not notification read state, drives a boolean attention flag in the admin navigation response and a per-order flag in the order index. Next.js reuses the existing notification bell, inline detail views, SWR navigation state, and order table while adding safe query-string deep links.

**Tech Stack:** Laravel 12, Eloquent, queued Markdown mailables, PHPUnit, Next.js 16, React 19, SWR, TanStack Table, Tailwind CSS, Jest/Testing Library, `agent-browser`.

---

## File map

### Backend

- Create `backend/database/migrations/2026_08_12_000003_add_deduplication_key_to_user_notifications.php` for a nullable unique notification lifecycle key.
- Create `backend/app/Services/CancellationNotificationService.php` as the sole cancellation notification/email recipient and deduplication boundary.
- Modify `backend/app/Models/Notification.php` to persist `deduplication_key`.
- Modify `backend/app/Models/CancellationRequest.php` to expose one shared `needsAdminAttention()` predicate.
- Modify `backend/app/Services/CancellationRequestService.php` to record request/customer/admin notifications inside request creation.
- Modify `backend/app/Services/CancellationRefundService.php` to record rejection, approval, and actionable failure transitions.
- Modify `backend/app/Http/Controllers/StripeController.php` to use the same transition notification boundary for webhook-confirmed approval.
- Modify `backend/app/Http/Controllers/Admin/OrderController.php` to eager-load cancellation state and return `cancellation_needs_attention` for every index row.
- Modify `backend/app/Http/Controllers/Admin/NavigationUnseenController.php` to return `has_actionable_cancellations` without changing numeric new-order/review counts.
- Extend `backend/tests/Feature/CancellationNotificationTest.php`, `backend/tests/Feature/Admin/NavigationUnseenTest.php`, `backend/tests/Feature/Admin/OrderFilteringTest.php`, and webhook/decision tests for transactional, recipient, deduplication, and attention behavior.

### Frontend

- Modify `frontend/src/lib/services/adminNavigationUnseen.js` and its tests to normalize the new boolean independently from counts.
- Modify `frontend/src/hooks/api/admin/navigationUnseen.js` to expose both `counts` and `attention` while preserving mark-seen behavior.
- Modify `frontend/src/app/components/Pages/DASHBOARD/admin/app-sidebar.jsx` and `nav-main.jsx` plus tests to render a semantic-danger `!` independently of numeric unseen-order badges.
- Modify `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/FilterOrdersPage.jsx` and tests to style only actionable cancellation rows.
- Modify `frontend/src/app/(dashboard)/dashboard/admin/orders/page.js` and tests to open `?order={id}`, keep list navigation stable, and clear the query on Back.
- Modify `frontend/src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/CustomerBookingsList.jsx` and tests to open `?order={id}` on the existing inline detail.
- Modify `frontend/src/app/components/Layout/NotificationBell.jsx`, `NotificationRow.jsx`, and their tests so read is attempted before navigation, failure cannot block navigation, and View All targets the current role's notification page.
- Modify `frontend/src/lib/notifications/link.js` and extend `frontend/src/lib/notifications/__tests__/cta.test.js` to enforce role-aware cancellation dashboard allowlists.

---

### Task 0: Protect the existing dirty worktrees

**Files:**

- Read only: every currently modified or untracked backend and frontend file.
- Create outside Git: `/tmp/weelp-cancellation-alerts-backend-baseline.diff`
- Create outside Git: `/tmp/weelp-cancellation-alerts-frontend-baseline.diff`

- [ ] **Step 1: Inventory existing work before editing**

Run `git status --short`, `git diff`, and `git diff --cached` in both repositories. Save tracked unstaged baselines with `git diff --output=/tmp/weelp-cancellation-alerts-backend-baseline.diff` and `git diff --output=/tmp/weelp-cancellation-alerts-frontend-baseline.diff`. Copy the `git status --short` untracked filename lists into the task commentary/checklist rather than creating them with shell redirection. Do not restore, overwrite, reformat, or stage any pre-existing change.

- [ ] **Step 2: Establish overlap rules**

Treat existing changes in cancellation services, Stripe reconciliation, Order controllers, booking/order pages, and their tests as shared in-progress work. Use narrow `apply_patch` edits. At the final commit gate, stage overlapping files hunk-by-hunk with `git add -p`, compare the staged diff to the saved baseline, and exclude unrelated hunks. No implementation task may commit before Task 7's review, simplify, and verification gates.

---

### Task 1: Persist deduplicated cancellation notifications

**Files:**

- Create: `backend/database/migrations/2026_08_12_000003_add_deduplication_key_to_user_notifications.php`
- Create: `backend/app/Services/CancellationNotificationService.php`
- Modify: `backend/app/Models/Notification.php`
- Modify: `backend/tests/Feature/CancellationNotificationTest.php`
- Modify: `backend/tests/Feature/CancellationPersistenceTest.php`

- [ ] **Step 1: Write failing persistence and recipient tests**

Add tests that create one active admin, one active super admin, one inactive admin, and one unrelated customer. Assert that `recordRequested()` creates exactly three `custom` rows: customer acknowledgement plus one alert for each active staff account. Assert exact `deduplication_key`, `action_url`, event data, safe copy, and no inactive/unrelated recipient. Call the method twice in one transaction and assert the same three rows remain.

```php
$service->recordRequested($request);
$service->recordRequested($request);

$this->assertDatabaseHas('user_notifications', [
    'user_id' => $customer->id,
    'deduplication_key' => "cancellation:{$request->id}:requested:user:{$customer->id}",
    'action_url' => "/dashboard/customer?order={$order->id}",
]);
$this->assertSame(3, Notification::query()->count());
$this->assertDatabaseMissing('user_notifications', ['user_id' => $inactiveAdmin->id]);
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
cd backend
php artisan test tests/Feature/CancellationNotificationTest.php --filter='in_app|deduplicat|recipient'
```

Expected: FAIL because `deduplication_key` and `CancellationNotificationService` do not exist.

- [ ] **Step 3: Add the nullable unique key migration and model field**

Create a reversible migration using a 191-character nullable string and the explicit unique index name `user_notifications_deduplication_key_unique`. Add the field to `Notification::$fillable` and its model property documentation.

```php
Schema::table('user_notifications', function (Blueprint $table): void {
    $table->string('deduplication_key', 191)->nullable()->after('user_id');
    $table->unique('deduplication_key', 'user_notifications_deduplication_key_unique');
});
```

The down migration must call `$table->dropUnique('user_notifications_deduplication_key_unique')` before dropping the column.

- [ ] **Step 4: Implement the focused notification boundary**

Implement explicit lifecycle methods:

```php
public function recordRequested(CancellationRequest $request): void;
public function recordApproved(CancellationRequest $request): void;
public function recordRejected(CancellationRequest $request): void;
public function recordRefundFailed(CancellationRequest $request): void;
```

Query every user whose role is Admin/Super Admin, status is active, and email is nonblank. Create one in-app row per user ID even if two staff accounts share an email. Use `firstOrCreate(['deduplication_key' => $key], $safePayload)` and collect only `wasRecentlyCreated` recipients. Queue at most one email per normalized address for that lifecycle dispatch while retaining every per-user row. Every payload uses `type => 'custom'`, `display_style => 'inline'`, an allowlisted role-appropriate internal action URL, and structured `data.event`, `data.order_id`, `data.cancellation_request_id`, and `data.safe_status`.

Register mail dispatch with `DB::afterCommit()`. Wrap only the queue call in `try/catch (Throwable)` and log request ID, order ID, event, recipient user ID, and exception class; never log the address, raw exception, provider text, or secrets.

- [ ] **Step 5: Run GREEN tests and migration round-trip**

Run:

```bash
cd backend
php artisan test tests/Feature/CancellationNotificationTest.php
php artisan test tests/Feature/CancellationPersistenceTest.php
```

Add a SQLite schema regression in `CancellationPersistenceTest`: migrate the new file up, assert duplicate nullable `NULL` keys are accepted and duplicate non-null keys fail, migrate it down, then assert both `deduplication_key` and the named index are absent. Expected: all focused notification and explicit up/down migration tests pass.

- [ ] **Step 6: Run the task-level post-change gate without committing**

```bash
cd backend
vendor/bin/pint --test app/Models/Notification.php app/Services/CancellationNotificationService.php database/migrations/2026_08_12_000003_add_deduplication_key_to_user_notifications.php tests/Feature/CancellationNotificationTest.php tests/Feature/CancellationPersistenceTest.php
git diff --check
```

Expected: scoped Pint and diff check pass. Keep changes uncommitted for Task 7's mandatory review/simplify gate.

---

### Task 2: Wire notifications into every cancellation transition

**Files:**

- Modify: `backend/app/Services/CancellationRequestService.php`
- Modify: `backend/app/Services/CancellationRefundService.php`
- Modify: `backend/app/Http/Controllers/StripeController.php`
- Modify: `backend/tests/Feature/CancellationNotificationTest.php`
- Modify: `backend/tests/Feature/Admin/CancellationDecisionTest.php`
- Modify: `backend/tests/Feature/Payment/WebhookTest.php`

- [ ] **Step 1: Write failing transaction and lifecycle tests**

Cover request submission, rejection, direct approval, webhook-confirmed approval, and all three failure branches: provider balance lookup failure before processing (persisted `refund_failed`), provider refund-call failure after processing starts (persisted `refund_failed`), and authoritative post-refund confirmation failure while the request intentionally remains `refund_processing`. For each, assert the exact in-app row and queued mailable recipients. Assert no customer technical-failure alert, no approval alert before final success, and no second row/mail when retry or webhook reconciliation replays the lifecycle event. For the confirmation-uncertain branch, assert admins receive the danger event once, the later correlated webhook creates customer approval once, and the earlier failure notification remains historical.

Add an outer transaction test:

```php
DB::beginTransaction();
$created = app(CancellationRequestService::class)->create($order->id, $customer->id, 'Dates changed.');
Mail::assertNothingQueued();
$this->assertDatabaseHas('user_notifications', [
    'deduplication_key' => "cancellation:{$created->id}:requested:user:{$customer->id}",
]);
DB::rollBack();
Mail::assertNothingQueued();
$this->assertDatabaseMissing('cancellation_requests', ['id' => $created->id]);
$this->assertDatabaseMissing('user_notifications', ['data->cancellation_request_id' => $created->id]);
```

- [ ] **Step 2: Run the transition suite and verify RED**

Run:

```bash
cd backend
php artisan test tests/Feature/CancellationNotificationTest.php tests/Feature/Admin/CancellationDecisionTest.php tests/Feature/Payment/WebhookTest.php
```

Expected: new in-app and all-staff recipient assertions fail because current services mail only the customer or configured support address.

- [ ] **Step 3: Inject and call `CancellationNotificationService` inside state transactions**

In request creation, call `recordRequested($cancellation)` immediately after the request row is created and before the transaction returns. Remove the two legacy post-transaction `queueMail()` calls.

In rejection, successful finalization, and the two branches that persist `refund_failed`, call `recordRejected()`, `recordApproved()`, or `recordRefundFailed()` only inside the transaction that performs the corresponding state transition. For authoritative post-refund confirmation uncertainty, add a dedicated `recordRefundConfirmationFailed()` event while the request remains `refund_processing`; persist its in-app rows in a short lock-ordered order→payment→request transaction before throwing. Replace every legacy `queueFailureAlert()` call, including `reportLocalFailure()`, with the unified service. Do not call on stale resolved requests.

In `StripeController`, replace the cancellation approval mail callback with `recordApproved()` inside the correlated state-transition transaction. Keep the legacy non-cancellation refund email path unchanged.

- [ ] **Step 4: Prove dispatch failures cannot corrupt state**

Configure `Mail::shouldReceive('to')->andThrow(...)`, perform each transition, and assert the cancellation/order/payment/notification state commits. Use `Log::spy()` to assert only allowlisted context and `exception_class` are logged.

- [ ] **Step 5: Run GREEN transition and adjacent suites**

Run:

```bash
cd backend
php artisan test tests/Feature/CancellationNotificationTest.php tests/Feature/Admin/CancellationDecisionTest.php tests/Feature/Payment/WebhookTest.php tests/Feature/Customer/CancellationRequestTest.php
```

Expected: all new lifecycle, transaction, replay, and existing cancellation tests pass; documented environment skips remain skips.

- [ ] **Step 6: Run the task-level post-change gate without committing**

```bash
cd backend
vendor/bin/pint --test app/Services/CancellationRequestService.php app/Services/CancellationRefundService.php app/Http/Controllers/StripeController.php tests/Feature/CancellationNotificationTest.php tests/Feature/Admin/CancellationDecisionTest.php tests/Feature/Payment/WebhookTest.php
git diff --check
```

Expected: scoped Pint and diff check pass. Keep changes uncommitted for Task 7.

---

### Task 3: Expose state-driven admin attention flags

**Files:**

- Modify: `backend/app/Models/CancellationRequest.php`
- Modify: `backend/app/Http/Controllers/Admin/OrderController.php`
- Modify: `backend/app/Http/Controllers/Admin/NavigationUnseenController.php`
- Modify: `backend/tests/Feature/Admin/OrderFilteringTest.php`
- Modify: `backend/tests/Feature/Admin/NavigationUnseenTest.php`

- [ ] **Step 1: Write failing attention-matrix tests**

For order rows and navigation, cover `pending`, `refund_processing`, `refund_failed`, `approved`, and `rejected`. Assert true for the three unresolved states and false for terminal requests, no request, and a request on a trashed order. Mark notifications read and assert attention remains true. Resolve the last request and assert navigation attention becomes false while numeric unseen order/review counts are unchanged.

```php
$response->assertJsonPath('data.0.cancellation_needs_attention', true);
$response->assertJsonPath('data.has_actionable_cancellations', true);
$response->assertJsonPath('data.orders', 2);
$response->assertJsonPath('data.reviews', 1);
```

- [ ] **Step 2: Run focused API tests and verify RED**

Run:

```bash
cd backend
php artisan test tests/Feature/Admin/OrderFilteringTest.php tests/Feature/Admin/NavigationUnseenTest.php
```

Expected: FAIL because the two attention fields are absent.

- [ ] **Step 3: Centralize the predicate and eager loading**

Add:

```php
public function needsAdminAttention(): bool
{
    return in_array($this->status, [
        self::STATUS_PENDING,
        self::STATUS_REFUND_PROCESSING,
        self::STATUS_REFUND_FAILED,
    ], true);
}
```

Eager-load `latestCancellationRequest` in active and trash index queries. Map `cancellation_needs_attention` as `! $order->trashed() && $order->latestCancellationRequest?->needsAdminAttention() === true`, so trash rows explicitly return false even when their historical request is unresolved. In navigation, use one `whereHas('order', fn ($query) => $query->whereNull('deleted_at'))` existence query over those statuses. Return the boolean alongside the existing `orders` and `reviews` integer fields; do not add a mark-seen endpoint for cancellation attention.

- [ ] **Step 4: Run GREEN API tests and query-count guard**

Add a concrete query-count regression around the order-index formatter. Attach `DB::listen()` after fixture creation, request an index containing one actionable row, record only SQL statements selecting from `cancellation_requests`, then repeat with five rows. Assert both requests perform exactly one cancellation relation query and that all five flags are correct. This proves eager loading rather than merely asserting response shape.

Run:

```bash
cd backend
php artisan test tests/Feature/Admin/OrderFilteringTest.php tests/Feature/Admin/NavigationUnseenTest.php tests/Feature/Admin/OrderTest.php
```

Expected: all attention and existing unseen-count tests pass; one and five rows each execute exactly one cancellation relation query.

- [ ] **Step 5: Run the task-level post-change gate without committing**

```bash
cd backend
vendor/bin/pint --test app/Models/CancellationRequest.php app/Http/Controllers/Admin/OrderController.php app/Http/Controllers/Admin/NavigationUnseenController.php tests/Feature/Admin/OrderFilteringTest.php tests/Feature/Admin/NavigationUnseenTest.php
git diff --check
```

Expected: scoped Pint and diff check pass. Keep changes uncommitted for Task 7.

---

### Task 4: Make notification navigation ordered, safe, and role-aware

**Files:**

- Modify: `frontend/src/app/components/Layout/NotificationBell.jsx`
- Modify: `frontend/src/app/components/Layout/NotificationRow.jsx`
- Modify: `frontend/src/app/components/Layout/__tests__/NotificationBell.detail.test.jsx`
- Modify: `frontend/src/app/components/Layout/__tests__/NotificationRow.test.jsx`
- Modify: `frontend/src/lib/notifications/link.js`
- Modify: `frontend/src/lib/notifications/__tests__/cta.test.js`

- [ ] **Step 1: Write failing click-order and role tests**

Assert that an unread inline cancellation row awaits `markAsRead` before `router.push`, that rejection of `markAsRead` still performs exactly one navigation, and that Enter/Space behave like click. Repeat the same ordering and read-failure assertions for the explicit `Visit` link, including `preventDefault()` and exactly one navigation. Assert customer View All targets `/dashboard/customer/notifications`, while admin/super-admin targets `/dashboard/admin/notifications`.

```jsx
const events = [];
onOpen.mockImplementation(async () => {
  events.push('read-start');
  await Promise.resolve();
  events.push('read-finish');
});
router.push.mockImplementation(() => events.push('navigate'));

fireEvent.click(screen.getByRole('button', { name: /cancellation requested/i }));
await waitFor(() => expect(events).toEqual(['read-start', 'read-finish', 'navigate']));
```

- [ ] **Step 2: Run frontend notification tests and verify RED**

Run:

```bash
cd frontend
npx jest src/app/components/Layout/__tests__/NotificationBell.detail.test.jsx src/app/components/Layout/__tests__/NotificationRow.test.jsx src/lib/notifications/__tests__/cta.test.js --runInBand
```

Expected: click-order and role-aware footer assertions fail under current fire-and-navigate behavior and fixed customer footer.

- [ ] **Step 3: Implement ordered best-effort read and role routing**

Make `openNotif()` return the read promise. In `NotificationRow`, use one async activation function:

```jsx
const activate = async () => {
  try {
    await onOpen(notif);
  } finally {
    goToCta();
  }
};
```

Use it for click and keyboard activation. The explicit Visit handler must call both `preventDefault()` and `stopPropagation()`, await the same activation function, and then perform exactly one router navigation; the read-toggle button remains non-navigating. Derive View All from `session.user.role`, treating `admin` and `super_admin` as admin routes.

Extend `resolveNotificationCta(notif, role)` for cancellation notifications only (identified by a positive `data.cancellation_request_id`). Allow exactly `/dashboard/admin/orders?order={positive-integer}` for `admin`/`super_admin` and `/dashboard/customer?order={positive-integer}` for customer. Reject the wrong-role dashboard, extra/duplicate query keys, malformed/non-positive IDs, fragments, arbitrary internal paths, external HTTP(S), protocol-relative URLs, and unsafe schemes. Preserve existing non-cancellation notification behavior.

- [ ] **Step 4: Run GREEN notification tests**

Run the command from Step 2. Expected: all tests pass without unhandled promise or `act()` warnings.

- [ ] **Step 5: Run the task-level post-change gate without committing**

```bash
cd frontend
npx prettier --check src/app/components/Layout/NotificationBell.jsx src/app/components/Layout/NotificationRow.jsx src/app/components/Layout/__tests__/NotificationBell.detail.test.jsx src/app/components/Layout/__tests__/NotificationRow.test.jsx src/lib/notifications/link.js src/lib/notifications/__tests__/cta.test.js
npm run type-check
npm run lint
git diff --check
```

Expected: scoped formatting, type-check, lint/dark guard, and diff check pass. Keep changes uncommitted for Task 7.

---

### Task 5: Render the Orders danger `!` independently of unseen counts

**Files:**

- Modify: `frontend/src/lib/services/adminNavigationUnseen.js`
- Modify: `frontend/src/lib/services/__tests__/adminNavigationUnseen.test.js`
- Modify: `frontend/src/hooks/api/admin/navigationUnseen.js`
- Modify: `frontend/src/hooks/api/admin/__tests__/navigationUnseen.test.jsx`
- Modify: `frontend/src/app/components/Pages/DASHBOARD/admin/app-sidebar.jsx`
- Modify: `frontend/src/app/components/Pages/DASHBOARD/admin/nav-main.jsx`
- Modify: `frontend/src/app/components/Pages/DASHBOARD/admin/__tests__/AppSidebar.test.jsx`
- Modify: `frontend/src/app/components/Pages/DASHBOARD/admin/__tests__/NavMain.test.jsx`
- Modify: `frontend/src/app/(dashboard)/dashboard/admin/orders/page.js`
- Modify: `frontend/src/app/(dashboard)/dashboard/admin/orders/__tests__/OrdersPage.test.jsx`

- [ ] **Step 1: Write failing normalization and presentation tests**

Assert strict boolean normalization (`true` only), preservation through mark-seen optimistic updates, and an Orders danger badge containing only `!`. If numeric unseen orders and cancellation attention coexist, assert both badges remain visible and have distinct accessible labels. Assert Reviews remains numeric and collapsed-sidebar positioning remains usable.

```jsx
render(<NavMain items={routes} counts={{ orders: 4 }} attention={{ cancellations: true }} />);
expect(screen.getByLabelText('Orders, 4 unseen, cancellation needs attention')).toBeInTheDocument();
expect(screen.getByText('4')).toBeInTheDocument();
expect(screen.getByText('!')).toHaveClass('bg-destructive');
```

- [ ] **Step 2: Run sidebar suites and verify RED**

Run:

```bash
cd frontend
npx jest src/lib/services/__tests__/adminNavigationUnseen.test.js src/hooks/api/admin/__tests__/navigationUnseen.test.jsx src/app/components/Pages/DASHBOARD/admin/__tests__/AppSidebar.test.jsx src/app/components/Pages/DASHBOARD/admin/__tests__/NavMain.test.jsx --runInBand
```

Expected: FAIL because the response normalizer drops the attention boolean and `NavMain` accepts counts only.

- [ ] **Step 3: Extend the state contract without conflating types**

Normalize to:

```js
{
  counts: { orders: normalizeCount(source.orders), reviews: normalizeCount(source.reviews) },
  attention: { cancellations: source.has_actionable_cancellations === true },
}
```

Update the hook and optimistic mark-seen code so numeric resources become zero while the last committed `attention.cancellations` value remains unchanged. Pass both objects through `AppSidebar` to `NavMain`.

- [ ] **Step 4: Add a focused danger badge variant**

Render a compact semantic-danger `!` for the Orders item only when `attention.cancellations` is true. Keep the existing numeric badge for unseen new orders; when both exist, place them in one absolute flex container without overlap. Use `aria-hidden` on visual badges and one combined link label. Use semantic `bg-destructive`, `text-destructive-foreground`, and focus/active-safe classes rather than hardcoded colors.

- [ ] **Step 5: Run GREEN sidebar suites**

Run the command from Step 2. Expected: all service, hook, expanded, collapsed, and combined-badge tests pass.

- [ ] **Step 6: Refresh attention immediately after cancellation state changes**

In the admin Orders page, use `useSWRConfig()` and one `refreshCancellationState` callback that runs `mutateOrders()` and `mutate(ADMIN_NAVIGATION_UNSEEN_KEY)` with `Promise.allSettled`. Pass that callback through `AdminOrderDetail.onStatusChanged`, so approve, reject, successful retry, and detail refresh after webhook reconciliation update the row and navigation attention together. Keep ordinary order-list mutations on their existing narrower callback.

Add an Orders-page test that starts with `attention.cancellations === true`, completes a terminal decision through the real detail callback contract, and asserts the navigation key revalidates immediately while `{ orders: 4, reviews: 2 }` numeric counts remain unchanged. Add a nonterminal retry/failure fixture that keeps attention true.

- [ ] **Step 7: Run the task-level post-change gate without committing**

```bash
cd frontend
npx jest src/lib/services/__tests__/adminNavigationUnseen.test.js src/hooks/api/admin/__tests__/navigationUnseen.test.jsx src/app/components/Pages/DASHBOARD/admin/__tests__/AppSidebar.test.jsx src/app/components/Pages/DASHBOARD/admin/__tests__/NavMain.test.jsx src/app/'(dashboard)'/dashboard/admin/orders/__tests__/OrdersPage.test.jsx --runInBand
npx prettier --check src/lib/services/adminNavigationUnseen.js src/lib/services/__tests__/adminNavigationUnseen.test.js src/hooks/api/admin/navigationUnseen.js src/hooks/api/admin/__tests__/navigationUnseen.test.jsx src/app/components/Pages/DASHBOARD/admin/app-sidebar.jsx src/app/components/Pages/DASHBOARD/admin/nav-main.jsx src/app/components/Pages/DASHBOARD/admin/__tests__/AppSidebar.test.jsx src/app/components/Pages/DASHBOARD/admin/__tests__/NavMain.test.jsx src/app/'(dashboard)'/dashboard/admin/orders/page.js src/app/'(dashboard)'/dashboard/admin/orders/__tests__/OrdersPage.test.jsx
npm run type-check
npm run lint
git diff --check
```

Expected: focused tests, formatting, type-check, lint/dark guard, and diff check pass. Keep changes uncommitted for Task 7.

---

### Task 6: Highlight actionable rows and support exact inline-detail deep links

**Files:**

- Modify: `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/FilterOrdersPage.jsx`
- Modify: `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/FilterOrdersPage.test.jsx`
- Modify: `frontend/src/app/(dashboard)/dashboard/admin/orders/page.js`
- Modify: `frontend/src/app/(dashboard)/dashboard/admin/orders/__tests__/OrdersPage.test.jsx`
- Modify: `frontend/src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/CustomerBookingsList.jsx`
- Modify: `frontend/src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/__tests__/CustomerBookingsList.test.jsx`

- [ ] **Step 1: Write failing row and deep-link tests**

Assert only `cancellation_needs_attention === true` rows receive the danger tint, inset left edge, and `!` beside the order ID. Status controls/copy and View Order remain unchanged. Assert `?order=16` opens order 16 on initial admin render, invalid/non-positive IDs are ignored, selecting another order updates the URL without losing unrelated search parameters, and Back removes only `order`.

Repeat the deep-link contract for `/dashboard/customer?order=13`: open the existing booking detail, ignore invalid IDs, and clear `order` on Back.

- [ ] **Step 2: Run order-list suites and verify RED**

Run:

```bash
cd frontend
npx jest src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/FilterOrdersPage.test.jsx src/app/'(dashboard)'/dashboard/admin/orders/__tests__/OrdersPage.test.jsx src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/__tests__/CustomerBookingsList.test.jsx --runInBand
```

Expected: danger-row and query deep-link assertions fail because neither behavior exists.

- [ ] **Step 3: Implement semantic danger row treatment**

Add one helper:

```js
const cancellationNeedsAttention = (order) => order?.cancellation_needs_attention === true;
```

For affected `TableRow`s, use the exact semantic classes `bg-destructive/10 dark:bg-destructive/15 shadow-[inset_4px_0_0_hsl(var(--destructive))]`. Add a compact `CircleAlert` beside the order ID with `size-4 text-destructive`, `aria-label="Cancellation needs attention"`, and no numeric text. Do not replace the operational status or make the whole row destructive-clickable. Tests assert these exact semantic classes and verify no hardcoded red color literal is introduced.

- [ ] **Step 4: Implement stable query synchronization**

Import `usePathname`, `useRouter`, and `useSearchParams` from `next/navigation` in the existing client components. These routes already render dynamically behind authenticated dashboard layouts (`customer/page.js` explicitly exports `dynamic = 'force-dynamic'`); keep the hook inside the client component and verify `next build` in Task 7. Create pure helpers `parseOrderQuery(value)` and `replaceOrderQuery(pathname, currentSearch, orderId)` with finite positive-integer validation. Derive the selected ID from the current `order` query during render instead of mirroring it through an effect, while preserving local selection only long enough to write the URL. `handleViewOrder` adds/replaces only `order`; `handleBack` removes only `order` and preserves page/filter/search parameters. Use `router.replace(..., { scroll: false })` to avoid duplicate history entries and keep existing scroll restoration.

Apply the same validated query behavior to `CustomerBookingsList`, using its existing detail component. Do not fetch an order through an unauthenticated route or trust notification payload data as booking state. Tests rerender with changed mocked `useSearchParams()` values while detail is open, assert the displayed ID follows the URL once without a replace loop, assert invalid/duplicate query values return to the list, and verify Back preserves unrelated parameters.

- [ ] **Step 5: Run GREEN order-list suites**

Run the command from Step 2. Expected: all existing pagination/filter/refresh tests and new danger/deep-link tests pass without act warnings.

- [ ] **Step 6: Run the task-level post-change gate without committing**

```bash
cd frontend
npx prettier --check src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/FilterOrdersPage.jsx src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/FilterOrdersPage.test.jsx src/app/'(dashboard)'/dashboard/admin/orders/page.js src/app/'(dashboard)'/dashboard/admin/orders/__tests__/OrdersPage.test.jsx src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/CustomerBookingsList.jsx src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/__tests__/CustomerBookingsList.test.jsx
npm run type-check
npm run lint
git diff --check
```

Expected: scoped formatting, type-check, lint/dark guard, and diff check pass. Keep changes uncommitted for Task 7.

---

### Task 7: Review, simplify, and verify the complete workflow

**Files:**

- Review all files changed in Tasks 1–6.
- Update tests only when review finds a demonstrated gap.

- [ ] **Step 1: Run scoped backend formatting and tests**

```bash
cd backend
vendor/bin/pint --test app/Models/Notification.php app/Models/CancellationRequest.php app/Services/CancellationNotificationService.php app/Services/CancellationRequestService.php app/Services/CancellationRefundService.php app/Http/Controllers/StripeController.php app/Http/Controllers/Admin/OrderController.php app/Http/Controllers/Admin/NavigationUnseenController.php database/migrations/2026_08_12_000003_add_deduplication_key_to_user_notifications.php tests/Feature/CancellationNotificationTest.php tests/Feature/CancellationPersistenceTest.php tests/Feature/Admin/CancellationDecisionTest.php tests/Feature/Admin/NavigationUnseenTest.php tests/Feature/Admin/OrderFilteringTest.php tests/Feature/Admin/OrderTest.php tests/Feature/Payment/WebhookTest.php
php artisan test tests/Feature/CancellationNotificationTest.php tests/Feature/CancellationPersistenceTest.php tests/Feature/Admin/CancellationDecisionTest.php tests/Feature/Admin/NavigationUnseenTest.php tests/Feature/Admin/OrderFilteringTest.php tests/Feature/Admin/OrderTest.php tests/Feature/Payment/WebhookTest.php tests/Feature/Customer/CancellationRequestTest.php
```

Expected: Pint exits zero; focused and adjacent Laravel suites pass with only documented environment skips.

- [ ] **Step 2: Run frontend tests and static gates**

```bash
cd frontend
npx jest src/lib/services/__tests__/adminNavigationUnseen.test.js src/hooks/api/admin/__tests__/navigationUnseen.test.jsx src/app/components/Pages/DASHBOARD/admin/__tests__/AppSidebar.test.jsx src/app/components/Pages/DASHBOARD/admin/__tests__/NavMain.test.jsx src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/FilterOrdersPage.test.jsx src/app/'(dashboard)'/dashboard/admin/orders/__tests__/OrdersPage.test.jsx src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/__tests__/CustomerBookingsList.test.jsx src/app/components/Layout/__tests__/NotificationBell.detail.test.jsx src/app/components/Layout/__tests__/NotificationRow.test.jsx src/lib/notifications/__tests__/cta.test.js --runInBand
npm run type-check
npm run lint
npx prettier --check src/lib/services/adminNavigationUnseen.js src/lib/services/__tests__/adminNavigationUnseen.test.js src/hooks/api/admin/navigationUnseen.js src/hooks/api/admin/__tests__/navigationUnseen.test.jsx src/app/components/Pages/DASHBOARD/admin/app-sidebar.jsx src/app/components/Pages/DASHBOARD/admin/nav-main.jsx src/app/components/Pages/DASHBOARD/admin/__tests__/AppSidebar.test.jsx src/app/components/Pages/DASHBOARD/admin/__tests__/NavMain.test.jsx src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/FilterOrdersPage.jsx src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/FilterOrdersPage.test.jsx src/app/'(dashboard)'/dashboard/admin/orders/page.js src/app/'(dashboard)'/dashboard/admin/orders/__tests__/OrdersPage.test.jsx src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/CustomerBookingsList.jsx src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/__tests__/CustomerBookingsList.test.jsx src/app/components/Layout/NotificationBell.jsx src/app/components/Layout/NotificationRow.jsx src/app/components/Layout/__tests__/NotificationBell.detail.test.jsx src/app/components/Layout/__tests__/NotificationRow.test.jsx src/lib/notifications/link.js src/lib/notifications/__tests__/cta.test.js
npm run build
git diff --check
```

Expected: all named Jest suites, type-check, lint/dark guard, scoped Prettier, and diff check pass. Do not use a repository-wide rewrite.

- [ ] **Step 3: Run mandatory code review and simplify pass**

Dispatch the code-reviewer against the approved specification and this plan. Fix every Critical and Important finding, rerun its focused regression, and request re-review until approved. Then run the simplify skill over the touched code, accepting only behavior-preserving clarity/reuse changes, and rerun Steps 1–2.

- [ ] **Step 4: Verify in a visible localhost browser**

Start Laravel on `http://localhost:8000` and Next.js on `http://localhost:3000`. Open named headed sessions with `agent-browser --headed`.

Using local test accounts only, verify:

- customer submission creates the pending panel, customer in-app acknowledgement, and logged/queued acknowledgement email;
- active Admin and Super Admin accounts receive request notifications and emails; inactive staff do not;
- Orders shows `!` with no cancellation number, preserves any numeric new-order badge, and highlights only active orders whose latest cancellation is `pending`, `refund_processing`, or `refund_failed`;
- reading the admin notification leaves `!` and row attention visible, then opens the exact order detail;
- rejection and zero-refund approval send the correct customer notification/email and refresh the exact customer booking;
- resolving the last actionable request removes the Orders `!` and row treatment;
- light/dark themes, keyboard activation, 320/768/1024/1440 widths, and no horizontal overflow.

Do not call real Stripe. Use the zero-refund path or existing local test fakes/fixtures for browser verification.

- [ ] **Step 5: Commit and push verified code to `main`**

Confirm both repositories are on `main`. Compare the final worktree against the Task 0 baseline. Stage new files explicitly and overlapping files hunk-by-hunk with `git add -p`; inspect `git diff --cached` and `git diff --cached --check` before each commit. Commit backend and frontend separately with clear conventional messages only after review, simplify, automated verification, and visible-browser verification are complete. Rerun the relevant pre-push gates and push `main` in both repositories. Never include `.env`, credentials, `.superpowers/`, generated build artifacts, or unrelated user changes.
