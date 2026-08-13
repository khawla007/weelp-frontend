# Customer Cancellation Requests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let customers request cancellation with a five-band refund estimate, then let an administrator reject the request or approve an adjustable zero, partial, or full Stripe refund before the booking is cancelled.

**Architecture:** Laravel owns eligibility, versioned policy calculation, request state, authorization, transactional locks, Stripe idempotency, payment reconciliation, and email dispatch. Existing customer and admin order-detail responses expose a safe cancellation representation; focused React components consume that contract and refresh the existing SWR list/detail caches after mutations.

**Tech Stack:** Laravel 12, PHP 8.2, Eloquent, MySQL, Stripe PHP SDK, PHPUnit, Next.js 16 App Router, React 19, SWR, Jest, React Testing Library, Tailwind CSS, Radix/shadcn UI.

---

## Scope and repository boundaries

The approved specification is `src/docs/superpowers/specs/2026-08-12-customer-cancellation-requests-design.md`. This is one workflow spanning the sibling `backend` and `frontend` repositories. Backend tasks establish the contract and remain independently testable before either dashboard consumes it.

Start from the Weelp workspace root with both repositories on `main`. Preserve unrelated user changes. Before editing, run:

```bash
git -C frontend branch --show-current
git -C frontend status --short
git -C frontend rev-parse HEAD
git -C frontend ls-remote origin refs/heads/main
git -C backend branch --show-current
git -C backend status --short
git -C backend rev-parse HEAD
git -C backend ls-remote origin refs/heads/main
```

Do not pull, switch branches, discard work, run migrations against an unverified production database, or expose Stripe credentials. Implementation requires these skills in order:

1. `superpowers:executing-plans` or `superpowers:subagent-driven-development`, according to the user's execution choice.
2. `laravel-specialist` before Laravel edits.
3. `next-best-practices`, `vercel-react-best-practices`, and `vercel-composition-patterns` before Next.js/React edits.
4. `superpowers:test-driven-development` before the first production edit.
5. `error-handling-patterns` after each production-code task.

Keep implementation changes uncommitted until the mandatory final code-review and simplify gates pass. Then run verification, commit the backend and frontend separately on `main`, and push both `main` branches.

## File map

### Backend policy and persistence

- Create `backend/config/cancellation.php`: versioned five-band policy and reason limits.
- Create `backend/database/migrations/2026_08_12_000001_create_cancellation_requests_table.php`: request snapshots, decisions, refund lifecycle, Stripe identity, and indexes.
- Create `backend/database/migrations/2026_08_12_000002_add_refund_tracking_to_order_payments.php`: cumulative refunded amount and `partially_refunded` payment state.
- Create `backend/app/Models/CancellationRequest.php`: casts, status constants, and relations.
- Create `backend/database/factories/CancellationRequestFactory.php`: focused test fixtures.
- Create `backend/database/seeders/CancellationWorkflowSeeder.php`: local-only eligible, pending, rejected, failed, and approved-partial UI fixtures using existing test users.
- Modify `backend/app/Models/Order.php`: cancellation-request relations.
- Modify `backend/app/Models/OrderPayment.php`: decimal cast and cumulative refund field.
- Create `backend/app/Services/CancellationPolicyService.php`: eligibility, travel start, effective paid amount, currency rounding, and immutable quote snapshots.
- Create `backend/tests/Unit/CancellationPolicyServiceTest.php`: exact bands, money, and eligibility boundaries.
- Create `backend/tests/Feature/CancellationPersistenceTest.php`: casts, relations, indexes, and migration round trip.

### Backend request and refund workflow

- Create `backend/app/Http/Requests/StoreCancellationRequest.php`: bounded customer reason.
- Create `backend/app/Http/Requests/DecideCancellationRequest.php`: final amount and explanation validation.
- Create `backend/app/Http/Controllers/Customer/CancellationRequestController.php`: quote and create endpoints scoped to the authenticated owner.
- Create `backend/app/Http/Controllers/Admin/CancellationRequestController.php`: reject, approve, and retry endpoints.
- Create `backend/app/Services/CancellationRequestService.php`: locked creation, transitions, and safe representation.
- Create `backend/app/Contracts/StripeRefundGateway.php`: refund boundary for tests.
- Create `backend/app/Services/StripeRefundService.php`: test-mode Stripe refund call with idempotency.
- Create `backend/app/Services/CancellationRefundService.php`: decision snapshot, external refund, local reconciliation, and retry.
- Modify `backend/app/Providers/AppServiceProvider.php`: bind the refund gateway.
- Modify `backend/routes/api.php`: customer quote/create and admin decision routes.
- Modify `backend/app/Http/Controllers/UserProfileController.php`: include safe cancellation data in customer list/detail.
- Modify `backend/app/Http/Controllers/Admin/OrderController.php`: include cancellation data and prevent status shortcut bypass.
- Modify `backend/app/Http/Controllers/StripeController.php`: reconcile partial/full refund webhooks through the shared service.
- Create `backend/tests/Feature/Customer/CancellationRequestTest.php`: ownership, eligibility, snapshots, concurrency, and safe responses.
- Create `backend/tests/Feature/Admin/CancellationDecisionTest.php`: rejection, zero/partial/full approval, retry, and idempotency.
- Modify `backend/tests/Feature/Payment/WebhookTest.php`: partial/full reconciliation without duplicate money.

### Backend notifications

- Create `backend/app/Mail/CancellationRequestReceivedMail.php`.
- Create `backend/app/Mail/CancellationRequestAdminMail.php`.
- Create `backend/app/Mail/CancellationRequestRejectedMail.php`.
- Create `backend/app/Mail/CancellationRequestApprovedMail.php`.
- Create `backend/app/Mail/CancellationRefundFailedAdminMail.php`.
- Create matching Markdown views under `backend/resources/views/emails/orders/cancellation/`.
- Create `backend/tests/Feature/CancellationNotificationTest.php`.

### Frontend customer flow

- Create `src/lib/services/customer/cancellations.js`: quote/create calls and normalized errors.
- Create `src/lib/services/customer/__tests__/cancellations.test.js`.
- Create `src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/CustomerCancellationDialog.jsx`.
- Create `src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/CustomerCancellationPanel.jsx`.
- Create their tests under `src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/__tests__/`.
- Modify `src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/CustomerBookingDetail.jsx`: render request action or lifecycle panel and refresh both caches.
- Modify `src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/CustomerBookingsList.jsx`: pass list refresh after cancellation mutation.
- Modify `src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/__tests__/CustomerBookingDetail.test.jsx`.

### Frontend admin flow

- Extend `src/lib/actions/orders.js`: reject, approve, and retry server actions.
- Extend `src/lib/actions/__tests__/orders.test.js`.
- Create `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/AdminCancellationPanel.jsx`.
- Create `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/AdminCancellationPanel.test.jsx`.
- Modify `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/AdminOrderDetail.jsx`: insert the review panel and disable conflicting status mutations.
- Modify `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/AdminOrderDetail.test.jsx`.

## Required post-increment gate

After every production-code increment below, pause before the next increment and invoke `error-handling-patterns`. Run that increment's named focused test, then run from `frontend`:

```bash
npm run type-check
npm run lint
```

Before the first implementation increment, reuse only verified existing local processes or start `php artisan serve --port=8000` from `backend` and `npm run dev` from `frontend` in separate terminals. Confirm `http://localhost:8000/up` and `http://localhost:3000/user/login` respond, then keep a visible named localhost browser open throughout implementation:

```bash
agent-browser --session weelp-cancellation-visible --headed open http://localhost:3000/user/login
```

After backend-only increments, reload the visible local customer dashboard and confirm the existing booking page still loads; after customer/admin UI increments, exercise the newly added state for that increment. Record any failure before continuing. This gate supplements, rather than replaces, the complete verification in Task 7.

## Task 1: Persist the policy and calculation snapshot

**Files:** backend config, migrations, models, factory, persistence test, policy service, and unit test listed above.

- [ ] **Step 0: Write the failing persistence test**

Create `CancellationPersistenceTest` to assert the order/request/payment relations, decimal casts, JSON policy snapshot, unique Stripe/idempotency fields, and `partially_refunded` plus `refunded_amount` persistence. Run it once and expect failure because the table/model/columns do not exist.

- [ ] **Step 1: Write exact failing policy tests**

Freeze time with `Carbon::setTestNow('2026-08-12 09:00:00')`. Build paid orders with a `travel_date`, `preferred_time`, and USD payment, then assert:

```php
#[DataProvider('policyBands')]
public function test_quote_uses_exact_time_band(string $travelStart, int $deduction, string $refund): void
{
    $order = $this->paidOrder($travelStart, '100.00');

    $quote = app(CancellationPolicyService::class)->quote($order);

    $this->assertSame($deduction, $quote['deduction_percentage']);
    $this->assertSame($refund, $quote['suggested_refund']);
}

public static function policyBands(): array
{
    return [
        'exactly 30 days' => ['2026-09-11 09:00:00', 10, '90.00'],
        'below 30 days' => ['2026-09-11 08:59:59', 25, '75.00'],
        'exactly 15 days' => ['2026-08-27 09:00:00', 25, '75.00'],
        'exactly 7 days' => ['2026-08-19 09:00:00', 50, '50.00'],
        'exactly 48 hours' => ['2026-08-14 09:00:00', 75, '25.00'],
        'below 48 hours' => ['2026-08-14 08:59:59', 100, '0.00'],
    ];
}
```

Also cover custom amount precedence, fallback to `total_amount` then `amount`, JPY zero-decimal rounding, a business-timezone boundary whose policy band differs from UTC, terminal states, past travel, missing Stripe intent, unpaid payment, an otherwise-paid transfer, and quote output capped between zero and the paid amount.

- [ ] **Step 2: Run the test and confirm RED**

Run:

```bash
cd backend
php artisan test tests/Unit/CancellationPolicyServiceTest.php
```

Expected: FAIL because `CancellationPolicyService` and cancellation config do not exist.

- [ ] **Step 3: Add the versioned policy configuration**

Create `config/cancellation.php`:

```php
<?php

return [
    'version' => 'general-v1',
    'reason_min' => 10,
    'reason_max' => 1000,
    'refund_processing_stale_after_seconds' => 300,
    'bands' => [
        ['minimum_seconds' => 30 * 86400, 'deduction_percentage' => 10],
        ['minimum_seconds' => 15 * 86400, 'deduction_percentage' => 25],
        ['minimum_seconds' => 7 * 86400, 'deduction_percentage' => 50],
        ['minimum_seconds' => 48 * 3600, 'deduction_percentage' => 75],
        ['minimum_seconds' => 0, 'deduction_percentage' => 100],
    ],
];
```

- [ ] **Step 4: Add migrations and model relationships**

The cancellation table must use `decimal(12, 2)` for money snapshots, `char(3)` for currency, indexed `status`, nullable decision/refund fields, and foreign keys to orders, customers, and deciding admins. Store `policy_snapshot` as JSON, store `failure_disposition` as nullable `definitive` or `indeterminate`, and make `stripe_refund_id` and `idempotency_key` unique when present.

Add `refunded_amount decimal(12,2) default 0` to `order_payments` and expand its status values to include `partially_refunded`. In `down()`, normalize `partially_refunded` rows to `paid` before narrowing the enum. Cast all money fields to `decimal:2`. Add:

```php
public function cancellationRequests(): HasMany
{
    return $this->hasMany(CancellationRequest::class);
}

public function latestCancellationRequest(): HasOne
{
    return $this->hasOne(CancellationRequest::class)->latestOfMany();
}
```

- [ ] **Step 5: Run the schema/model increment and required gate**

```bash
php artisan test tests/Feature/CancellationPersistenceTest.php
```

Expected: PHPUnit provisions its isolated in-memory database via `phpunit.xml`; migrations and focused model assertions PASS. This verifies portable schema behavior but not MySQL enum rollback. Review the `down()` normalization explicitly and defer a MySQL up/down/up exercise until an independently provisioned disposable MySQL schema is available; never use `migrate:fresh` against an inherited `.env` connection. Run the required post-increment gate before policy implementation.

- [ ] **Step 6: Implement the minimal policy service**

`CancellationPolicyService::quote(Order $order, ?CarbonImmutable $requestedAt = null): array` loads payment, validates that the morph-mapped orderable class is only `Activity`, `Package`, or `Itinerary`, combines `travel_date` and `preferred_time` in `config('app.timezone')`, selects the first matching configured band, and returns string money values plus `policy_version`, `travel_starts_at`, `requested_at`, `seconds_remaining`, and `deduction_percentage`. Use integer minor units derived from a focused currency-exponent helper; never use binary floating-point for money. Explicitly reject `Transfer` even when it has a paid Stripe intent.

- [ ] **Step 7: Run focused tests and the required gate**

```bash
php artisan test tests/Unit/CancellationPolicyServiceTest.php
```

Expected: policy tests PASS through PHPUnit's isolated database. No standalone destructive migration command is permitted by this plan.

## Task 2: Create customer quote and request endpoints

**Files:** customer request/controller, request service, routes, customer transformer, and feature test listed above.

- [ ] **Step 1: Write failing customer endpoint tests**

Cover:

```php
$this->actingAs($customer, 'api')
    ->getJson("/api/customer/userorders/{$order->id}/cancellation-quote")
    ->assertOk()
    ->assertJsonPath('quote.policy_version', 'general-v1')
    ->assertJsonPath('quote.suggested_refund', '75.00');

$this->actingAs($customer, 'api')
    ->postJson("/api/customer/userorders/{$order->id}/cancellation-requests", [
        'reason' => 'Our travel dates have changed.',
    ])
    ->assertCreated()
    ->assertJsonPath('cancellation.status', 'pending');
```

Assert a different customer's order is 404, unauthenticated access is 401, invalid reason is 422, and unpaid, terminal, past, trashed, or already-unresolved orders return safe 409 responses. Submit twice and assert only one unresolved database record.

- [ ] **Step 2: Run the test and confirm RED**

```bash
php artisan test tests/Feature/Customer/CancellationRequestTest.php
```

Expected: FAIL with missing routes.

- [ ] **Step 3: Add routes and validation**

Inside the existing authenticated customer group add:

```php
Route::get('/userorders/{order}/cancellation-quote', [CancellationRequestController::class, 'quote'])
    ->whereNumber('order');
Route::post('/userorders/{order}/cancellation-requests', [CancellationRequestController::class, 'store'])
    ->whereNumber('order');
```

`StoreCancellationRequest` validates a trimmed string using the configured 10–1000 bounds.

- [ ] **Step 4: Implement locked request creation**

Within a database transaction, lock the customer-owned active order, reload payment/latest request, reject any unresolved status (`pending`, `refund_processing`, `refund_failed`), recalculate the quote, and create the snapshot record. Do not change order or payment status.

- [ ] **Step 5: Run request-creation tests and the required gate**

Run the ownership, eligibility, duplicate, and concurrent-creation test filters. Expected: PASS with one stored request and unchanged order/payment state. Run the required post-increment gate.

- [ ] **Step 6: Expose one safe cancellation contract**

Add a transformer returning no Stripe IDs or internal failure detail:

```php
[
    'id' => $request->id,
    'status' => $request->status,
    'reason' => $request->reason,
    'requested_at' => $request->requested_at?->toISOString(),
    'policy_version' => $request->policy_version,
    'travel_starts_at' => $request->travel_starts_at?->toISOString(),
    'seconds_remaining' => $request->seconds_remaining,
    'currency' => $request->currency,
    'deduction_percentage' => $request->deduction_percentage,
    'paid_amount' => $request->paid_amount,
    'suggested_deduction' => $request->suggested_deduction,
    'suggested_refund' => $request->suggested_refund,
    'final_refund' => $request->final_refund,
    'final_deduction' => $request->final_deduction,
    'decision_explanation' => $request->decision_explanation,
    'decided_at' => $request->decided_at?->toISOString(),
    'refund_completed_at' => $request->refund_completed_at?->toISOString(),
    'refund_outcome' => $request->refund_outcome,
    'can_retry' => $request->canRetry(),
    'can_reject' => $request->canReject(),
]
```

Include it in both customer list/detail and admin detail responses. The admin representation additionally includes `failure_code` and `failure_summary`; the customer representation includes only a generic retry-safe outcome and never raw provider details. Include `cancellation_eligible` and a safe `cancellation_ineligibility_reason` in customer detail so UI visibility matches Laravel. Feature tests must assert every listed customer/admin field and prove provider IDs, idempotency keys, and raw exceptions never reach customer JSON.

- [ ] **Step 7: Run focused tests and the required gate**

```bash
php artisan test tests/Feature/Customer/CancellationRequestTest.php tests/Feature/Customer/OrderTest.php
```

Expected: PASS with Stripe identifiers absent from every customer response.

## Task 3: Implement admin decisions and idempotent refunds

**Files:** refund contract/services, admin request/controller, provider binding, routes, order controller, and admin feature test listed above.

- [ ] **Step 1: Write failing decision tests with a fake gateway**

Bind a mock `StripeRefundGateway` and assert:

- unauthenticated decision requests are 401 and non-admin customers are 403;
- rejection requires an explanation and leaves order/payment unchanged;
- zero refund checks Stripe's cumulative refunded amount, skips refund creation, cancels the order, and leaves payment `paid` only when the provider also reports zero refunded;
- zero approval with an existing provider refund reconciles local cumulative amount and selects `partially_refunded` or `refunded` accurately;
- `25.00` of `100.00` calls the gateway once, stores `refunded_amount=25.00`, marks `partially_refunded`, and cancels the order;
- `100.00` marks payment `refunded` and order `cancelled`;
- a value below zero, above the provider-confirmed remaining balance, or fractional for JPY is 422;
- provider-reported external refunds reduce the remaining balance even when local `refunded_amount` is stale;
- an adjusted amount without explanation is 422;
- a definitive provider rejection produces `refund_failed` with `failure_disposition=definitive`, keeps the order active, and may be rejected or retried;
- an indeterminate timeout produces `refund_failed` with `failure_disposition=indeterminate`, keeps the order active, cannot be rejected, and must reconcile or retry with the same key;
- a successful provider response followed by a forced local-finalization failure leaves `refund_processing`, then a stale-processing retry uses the same key and completes the same provider refund;
- repeated approve/retry commands never create a second provider refund;
- approved and rejected requests reject every later invalid transition;
- the direct legacy `status=refunded` mutation is rejected before Stripe is called, and any unresolved request also returns 409 before legacy status work.

- [ ] **Step 2: Run the test and confirm RED**

```bash
php artisan test tests/Feature/Admin/CancellationDecisionTest.php
```

Expected: FAIL because decision endpoints and the refund gateway do not exist.

- [ ] **Step 3: Add the refund gateway boundary**

```php
interface StripeRefundGateway
{
    public function refundedAmount(string $paymentIntentId): int;

    public function refund(
        string $paymentIntentId,
        int $amountInMinorUnits,
        string $idempotencyKey,
        array $metadata,
    ): object;
}
```

`refundedAmount()` retrieves Stripe's current cumulative refunded amount in minor units immediately before every approval, including a zero-refund decision. `StripeRefundService` uses the configured Stripe secret, `Refund::create([...], ['idempotency_key' => $key])`, passes `cancellation_request_id`, `order_id`, and policy metadata, and returns the provider result. It classifies explicit Stripe declines/invalid requests as definitive and network timeouts/unknown transport failures as indeterminate. Bind the interface in `AppServiceProvider`.

- [ ] **Step 4: Add admin routes and request validation**

Inside the admin group add:

```php
Route::post('/cancellation-requests/{cancellationRequest}/reject', [CancellationRequestController::class, 'reject']);
Route::post('/cancellation-requests/{cancellationRequest}/approve', [CancellationRequestController::class, 'approve']);
Route::post('/cancellation-requests/{cancellationRequest}/retry', [CancellationRequestController::class, 'retry']);
```

Validate `final_refund` as a decimal string with at most two fraction digits and validate the explanation after loading the suggestion so it is required for rejection or any adjusted approval.

- [ ] **Step 5: Implement rejection and zero-refund approval**

Lock the request and order, enforce terminal-state transitions, require the correct explanation, and implement rejection plus zero-refund approval. Zero approval calls `refundedAmount()` but never `refund()`; reconcile any provider-side amount before choosing the local payment state. Run only those feature-test filters and the required post-increment gate.

- [ ] **Step 6: Implement positive refunds and remaining-balance verification**

Lock request, order, and payment before transitions. Read Stripe's cumulative refunded amount before accepting the final amount, then re-lock and reject stale decisions whose provider-confirmed remaining balance changed. Commit `refund_processing`, final values, decision admin, decision time, and a stable `cancel-request-{id}` key before calling Stripe. On success, store Stripe refund ID, cumulative refunded amount, accurate payment state, request `approved`, and order `cancelled`. On failure, store `refund_failed`, `failure_disposition`, failure code, and a safe summary while leaving order/payment operational state unchanged.

Run the partial/full/external-balance feature-test filters and the required post-increment gate.

- [ ] **Step 7: Implement definitive, indeterminate, and stale-processing recovery**

Retry accepts `refund_failed` and stale `refund_processing`, reuses the captured amount and key, and does not allow amount edits. A processing request is stale only at or after `config('cancellation.refund_processing_stale_after_seconds')`; a recent processing request returns 409. Freeze time and test one second before and exactly at the configured boundary. Because Stripe idempotency returns the original provider result, retry after a local-finalization failure completes local state without issuing more money.

Reject accepts `pending` and only definitively failed `refund_failed` requests. Indeterminate failures must first retry/reconcile until Stripe establishes whether a refund exists. The existing direct `status=refunded` branch in `OrderController::updateOrder` is removed; the endpoint returns a safe 400 instructing the administrator to resolve a customer cancellation request. This release does not invent an admin-only refund record.

Run the failure/retry/legacy-shortcut feature-test filters and the required post-increment gate.

- [ ] **Step 8: Run the complete decision suite**

```bash
php artisan test tests/Feature/Admin/CancellationDecisionTest.php tests/Feature/Admin/OrderFilteringTest.php
```

Expected: PASS; gateway expectations prove no duplicate external refund.

## Task 4: Reconcile webhooks and send lifecycle emails

**Files:** Stripe controller/webhook tests, five mailables/views, and notification feature test listed above.

- [ ] **Step 1: Write failing webhook and mail tests**

Use `Mail::fake()` to assert customer acknowledgement, admin request alert, rejection, approval, and positive admin failure-alert dispatch. Assert a gateway failure sends no approval email. Extend refund webhook fixtures with `amount_refunded`, refund ID, cancellation-request metadata, and payment intent. Verify partial/full states, cumulative partial refunds, replay safety, a delayed webhook after an indeterminate timeout, and a stale webhook after approval that leaves the order `cancelled` rather than changing it to the legacy `refunded` order state.

- [ ] **Step 2: Run tests and confirm RED**

```bash
php artisan test tests/Feature/CancellationNotificationTest.php tests/Feature/Payment/WebhookTest.php
```

- [ ] **Step 3: Add concise mailables and views**

Each mailable implements `ShouldQueue` and receives the cancellation request with loaded order/payment/user. Customer approval copy uses stored `final_refund` and currency; rejection uses the customer-facing explanation. Admin failure alerts go to `config('mail.support_address')` and contain the request/order IDs and safe failure summary, never raw credentials or stack traces. Dispatch only after the state transaction commits; catch and log queue-dispatch failures so they cannot roll back a completed refund.

- [ ] **Step 4: Reconcile `charge.refunded` through the request service**

Resolve correlation in this order: Stripe refund ID, `cancellation_request_id` metadata, then the unique unresolved/stale-processing request for the payment intent and amount. Do not depend on a locally stored refund ID because finalization may have failed before it was saved. Update cumulative refunded amount and request/order/payment state idempotently, including records currently marked `refund_failed` with an indeterminate disposition. Preserve the existing webhook-event replay record and unknown-payment 404 behavior. A webhook for an already approved request reconciles amounts but never changes the cancelled order to a legacy `refunded` status.

- [ ] **Step 5: Prove recovery after Stripe success and local failure**

Add an integration test whose fake gateway returns success while the service's final local transaction is forced to fail. Assert the request remains `refund_processing`; advance past the stale-processing interval; retry with the same key; assert two gateway calls but one provider refund; and assert final request `approved`, payment refund state, and order `cancelled`. Add the parallel delayed-webhook recovery assertion.

- [ ] **Step 6: Run focused and adjacent payment tests**

```bash
php artisan test tests/Feature/CancellationNotificationTest.php tests/Feature/Payment/WebhookTest.php tests/Feature/Payment/StripeWebhookReplayTest.php tests/Feature/Payment/OrderFlowTest.php
```

Expected: PASS.

## Task 5: Build the customer cancellation UI

**Files:** customer data helper, dialog/panel components and tests, customer detail/list files listed above.

- [ ] **Step 1: Write failing data-helper tests**

Mock `authApi` and assert:

```js
await getCancellationQuote(42);
expect(authApi.get).toHaveBeenCalledWith('/api/customer/userorders/42/cancellation-quote');

await createCancellationRequest(42, 'Our travel dates have changed.');
expect(authApi.post).toHaveBeenCalledWith('/api/customer/userorders/42/cancellation-requests', {
  reason: 'Our travel dates have changed.',
});
```

Verify 409/422 backend messages are preserved and unknown failures use safe fallback copy.

- [ ] **Step 2: Write failing dialog and panel tests**

The dialog tests load a quote only when opened; render paid amount, band, deduction, estimate, and disclaimer; enforce the 10–1000 trimmed reason; disable duplicate submissions; close on success; and keep entered text after failure. The panel tests cover `pending`, `refund_processing`, definitive and indeterminate `refund_failed`, `rejected`, and approved zero/partial/full presentations with long text wrapping.

- [ ] **Step 3: Run Jest and confirm RED**

```bash
npx jest src/lib/services/customer/__tests__/cancellations.test.js \
  src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/__tests__/CustomerCancellationDialog.test.jsx \
  src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/__tests__/CustomerCancellationPanel.test.jsx --runInBand
```

- [ ] **Step 4: Implement the focused data helper and components**

Use existing `Dialog`, `Button`, `Textarea`, `Label`, and `formatCurrency`. Keep network state inside `CustomerCancellationDialog`; accept `orderId` and `onSubmitted`. Render policy math as labelled text, not editable inputs. Use `aria-describedby` for the non-guarantee notice and return focus to the trigger on close.

- [ ] **Step 5: Integrate with customer booking detail**

Render the dialog only when `order.cancellation_eligible` is true and there is no cancellation record. Render `CustomerCancellationPanel` whenever `order.cancellation` exists. On submission, run both detail `mutate()` and list `onCancellationChanged?.()` with `Promise.allSettled`, showing a success toast even if a cache refresh later fails.

Keep the lifecycle panel and ineligibility guidance in the detail body. For an eligible booking without a request, render the dialog trigger in the header immediately before the status badge. Preserve the status badge's existing neutral outline classes. Match its compact geometry and light-mode resting colors on the trigger. In dark mode, let the trigger participate in the canonical site-wide button surface, border, text, transition, and hover rules already used by home-page secondary actions; do not apply those interactive rules to the status badge. Use a shared header-actions wrapper for responsive wrapping.

Add a `CustomerBookingDetail` regression that asserts the trigger precedes the status badge in DOM order, matches the badge's neutral compact light-mode resting state without changing the badge, remains absent for ineligible/existing-request states, and retains a wrapping header-actions container at narrow widths. Reuse the existing dark-theme contract test to prove the trigger is not exempted from the canonical dark button hierarchy.

- [ ] **Step 6: Run focused customer tests**

```bash
npx jest src/lib/services/customer/__tests__/cancellations.test.js \
  src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/__tests__/CustomerCancellationDialog.test.jsx \
  src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/__tests__/CustomerCancellationPanel.test.jsx \
  src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/__tests__/CustomerBookingDetail.test.jsx --runInBand
```

Expected: PASS with no React `act()` warnings introduced by these tests.

## Task 6: Build the admin decision UI

**Files:** admin server actions/tests, admin panel/tests, and admin detail/tests listed above.

- [ ] **Step 1: Write failing server-action tests**

Assert exact authenticated requests:

```js
await rejectCancellationRequest(9, 'The booking is outside the refundable window.');
expect(post).toHaveBeenCalledWith('/api/admin/cancellation-requests/9/reject', {
  explanation: 'The booking is outside the refundable window.',
});

await approveCancellationRequest(9, '75.00', 'Adjusted after supplier review.');
expect(post).toHaveBeenCalledWith('/api/admin/cancellation-requests/9/approve', {
  final_refund: '75.00',
  explanation: 'Adjusted after supplier review.',
});
```

Cover retry and safe backend-message propagation through the existing `mutateOrder` pattern.

- [ ] **Step 2: Write failing admin-panel tests**

Cover full request context, suggested default, zero/maximum validation, required explanation on adjusted values, reject explanation, confirmation copy, duplicate-action lock, server-provided `can_retry`/`can_reject` controls, recent-processing disabled state, stale-processing retry, definitive-failure rejection, indeterminate-failure rejection suppression, successful refresh callbacks, and failure toast without optimistic state.

- [ ] **Step 3: Run Jest and confirm RED**

```bash
npx jest src/lib/actions/__tests__/orders.test.js \
  src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/AdminCancellationPanel.test.jsx \
  src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/AdminOrderDetail.test.jsx --runInBand
```

- [ ] **Step 4: Implement server actions and panel**

Normalize decimal input as a string and leave final authority to Laravel. Use existing `AlertDialog`, `Input`, `Textarea`, `Button`, and `useToast`. The panel accepts the cancellation contract plus `onResolved`; it never receives payment-intent or Stripe-secret data.

- [ ] **Step 5: Integrate the panel and block conflicting status control**

Place the cancellation panel above the two detail columns. When request status is `pending`, `refund_processing`, or `refund_failed`, disable the ordinary status select and explain that the cancellation request must be resolved first. After any decision, refresh detail and list via existing `mutate` and `onStatusChanged` callbacks.

- [ ] **Step 6: Run focused admin tests**

```bash
npx jest src/lib/actions/__tests__/orders.test.js \
  src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/AdminCancellationPanel.test.jsx \
  src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/AdminOrderDetail.test.jsx \
  'src/app/(dashboard)/dashboard/admin/orders/__tests__/OrdersPage.test.jsx' --runInBand
```

Expected: PASS.

## Task 7: Complete mandatory verification and integration gates

**Files:** all changed files; update `../Reports/daily-work-report.md` only after successful pushes.

- [ ] **Step 1: Run backend formatting and the cancellation suite**

Run this block from the workspace root:

```bash
cd backend
./vendor/bin/pint --test
php artisan test tests/Unit/CancellationPolicyServiceTest.php \
  tests/Feature/Customer/CancellationRequestTest.php \
  tests/Feature/Admin/CancellationDecisionTest.php \
  tests/Feature/CancellationPersistenceTest.php \
  tests/Feature/CancellationNotificationTest.php \
  tests/Feature/Payment/WebhookTest.php \
  tests/Feature/Payment/StripeWebhookReplayTest.php
```

Expected: PASS.

- [ ] **Step 2: Run frontend focused tests, type-check, and lint**

Run this block from the workspace root:

```bash
cd frontend
npx jest src/lib/services/customer/__tests__/cancellations.test.js \
  src/lib/actions/__tests__/orders.test.js \
  src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/__tests__ \
  src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__ --runInBand
npm run type-check
npm run lint
git diff --check
```

Expected: all commands PASS. If the accumulated Jest suite hits the known worker-memory issue, run the listed files in isolated `--runInBand` commands and report both results; do not hide a failing test.

- [ ] **Step 3: Run the mandatory code-review and simplify loop**

Dispatch the required `superpowers:code-reviewer` agent against the complete backend and frontend diffs. Fix every critical/high-confidence issue, rerun its focused tests, and request re-review until cleared. Invoke the `simplify` skill, apply only behavior-preserving clarity/reuse improvements, and rerun type-check, lint, and focused tests.

- [ ] **Step 4: Verify in a visible local browser**

Before the first implementation increment, reuse only verified existing local processes or start the backend and frontend from separate terminals with `php artisan serve --port=8000` and `npm run dev`. Confirm readiness without production access:

```bash
curl -I http://localhost:8000/up
curl -I http://localhost:3000/user/login
```

Expected: both local origins respond. Then open the required visible named session first:

```bash
agent-browser --session weelp-cancellation-visible --headed open http://localhost:3000/user/login
```

Before seeding, run a read-only Laravel command that prints only `APP_ENV`, DB driver, DB host, and DB name—never credentials. Abort unless the environment is `local`, `CANCELLATION_FIXTURES_ENABLED=1`, the host is `127.0.0.1` or `localhost`, the database name starts with `weelp_local`, and the host/name do not match the documented Aiven production identity. `CancellationWorkflowSeeder` enforces the same conditions internally before writing.

```bash
cd backend
php artisan tinker --execute="dump(['environment' => app()->environment(), 'driver' => config('database.default'), 'host' => config('database.connections.'.config('database.default').'.host'), 'database' => config('database.connections.'.config('database.default').'.database')]);"
CANCELLATION_FIXTURES_ENABLED=1 php artisan db:seed --class=CancellationWorkflowSeeder
```

The seeder creates: one future paid eligible order with a fake test-shaped payment intent for quote/request; pending and rejected requests; a definitively failed request; an indeterminate failed request; a zero-refund-approved cancellation; and an approved partial-refund presentation fixture. Browser testing uses the zero-refund path for a real end-to-end approval because it does not call Stripe. Backend feature tests remain authoritative for positive Stripe refund behavior; pre-seeded approved/failed states cover their UI without any production-accessible fake-refund switch.

Using local test credentials, verify customer quote/request, pending panel, admin rejection, zero-refund approval, pre-seeded partial approval, definitive/indeterminate failure and retry controls, refreshed list/detail state, keyboard focus, 320/768/1024/1440 widths, dark mode, and no horizontal overflow. Do not use production.

- [ ] **Step 5: Commit and push `main` in both repositories**

After every gate passes:

Run this block from the workspace root:

```bash
cd backend
git add \
  app/Contracts/StripeRefundGateway.php \
  app/Http/Controllers/Admin/CancellationRequestController.php \
  app/Http/Controllers/Admin/OrderController.php \
  app/Http/Controllers/Customer/CancellationRequestController.php \
  app/Http/Controllers/StripeController.php \
  app/Http/Controllers/UserProfileController.php \
  app/Http/Requests/DecideCancellationRequest.php \
  app/Http/Requests/StoreCancellationRequest.php \
  app/Mail/CancellationRefundFailedAdminMail.php \
  app/Mail/CancellationRequestAdminMail.php \
  app/Mail/CancellationRequestApprovedMail.php \
  app/Mail/CancellationRequestReceivedMail.php \
  app/Mail/CancellationRequestRejectedMail.php \
  app/Models/CancellationRequest.php \
  app/Models/Order.php \
  app/Models/OrderPayment.php \
  app/Providers/AppServiceProvider.php \
  app/Services/CancellationPolicyService.php \
  app/Services/CancellationRefundService.php \
  app/Services/CancellationRequestService.php \
  app/Services/StripeRefundService.php \
  config/cancellation.php \
  database/factories/CancellationRequestFactory.php \
  database/seeders/CancellationWorkflowSeeder.php \
  database/migrations/2026_08_12_000001_create_cancellation_requests_table.php \
  database/migrations/2026_08_12_000002_add_refund_tracking_to_order_payments.php \
  resources/views/emails/orders/cancellation \
  routes/api.php \
  tests/Feature/Admin/CancellationDecisionTest.php \
  tests/Feature/CancellationPersistenceTest.php \
  tests/Feature/CancellationNotificationTest.php \
  tests/Feature/Customer/CancellationRequestTest.php \
  tests/Feature/Payment/WebhookTest.php \
  tests/Unit/CancellationPolicyServiceTest.php
git commit -m "feat: add cancellation request workflow"
git status --short
git show --stat --oneline HEAD
./vendor/bin/pint --test
php artisan test tests/Unit/CancellationPolicyServiceTest.php tests/Feature/CancellationPersistenceTest.php tests/Feature/Customer/CancellationRequestTest.php tests/Feature/Admin/CancellationDecisionTest.php tests/Feature/CancellationNotificationTest.php tests/Feature/Payment/WebhookTest.php
git push origin main

cd ../frontend
git add \
  src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/AdminCancellationPanel.jsx \
  src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/AdminOrderDetail.jsx \
  src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/AdminCancellationPanel.test.jsx \
  src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__/AdminOrderDetail.test.jsx \
  src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/CustomerBookingDetail.jsx \
  src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/CustomerBookingsList.jsx \
  src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/CustomerCancellationDialog.jsx \
  src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/CustomerCancellationPanel.jsx \
  src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/__tests__/CustomerBookingDetail.test.jsx \
  src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/__tests__/CustomerCancellationDialog.test.jsx \
  src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/__tests__/CustomerCancellationPanel.test.jsx \
  src/docs/superpowers/plans/2026-08-12-customer-cancellation-requests.md \
  src/lib/actions/__tests__/orders.test.js \
  src/lib/actions/orders.js \
  src/lib/services/customer/__tests__/cancellations.test.js \
  src/lib/services/customer/cancellations.js
git commit -m "feat: add booking cancellation requests"
git status --short
git show --stat --oneline HEAD
npx jest src/lib/services/customer/__tests__/cancellations.test.js src/lib/actions/__tests__/orders.test.js src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/__tests__ src/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/__tests__ --runInBand
npm run type-check
npm run lint
git push origin main
```

After either commit, any non-empty `git status --short`, unexpected `git show` content, or failing post-commit verification aborts its push until corrected and reverified. Confirm clean status and remote heads with `git status --short`, `git rev-parse HEAD`, and `git ls-remote origin refs/heads/main`. Append the verified session summary to the daily work report using its existing format.
