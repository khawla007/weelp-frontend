# Customer Inline Booking Detail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the customer booking card's public-item redirect with an authenticated inline booking detail experience that preserves the current bookings list state.

**Architecture:** Laravel exposes an ownership-scoped detail endpoint and reuses one transformer for list and detail responses. The Next.js bookings client stores the selected booking ID, fetches the full record through SWR, and swaps the list for a focused detail component without changing routes.

**Tech Stack:** Laravel 12, Eloquent polymorphic relationships, PHPUnit, Next.js 16, React 19, SWR, Jest, React Testing Library, Tailwind CSS, shadcn/ui.

---

## File Map

- Modify `../backend/routes/api.php`: register the authenticated numeric booking-detail route.
- Modify `../backend/app/Http/Controllers/UserProfileController.php`: centralize customer order loading/transformation and add `getUserOrder`.
- Modify `../backend/tests/Feature/Customer/OrderTest.php`: verify detail contract, ownership, authentication, and legacy fallbacks.
- Modify `../backend/tests/Feature/Customer/ReviewTest.php`: verify a review can reference only the authenticated customer's matching booking.
- Modify `src/app/components/BookingCard.jsx`: replace public navigation with an `onViewBooking` command.
- Create `src/app/components/BookingReviewDialog.jsx`: share the existing add/edit review action between booking cards and booking details.
- Create `src/app/components/__tests__/BookingReviewDialog.test.jsx`: verify successful review saves call the supplied refresh callback.
- Modify `src/app/components/__tests__/BookingCardTheme.test.jsx`: verify callback behavior and preserve semantic card styling.
- Modify `src/app/components/Pages/DASHBOARD/user/_rsc_pages/reviews/forms/CustomerReviewForm.jsx`: include `order_id` and notify callers after a successful review mutation.
- Modify `src/hooks/api/customer/orders.js`: add the selected-order SWR hook.
- Create `src/hooks/api/customer/__tests__/orders.test.jsx`: verify detail fetch errors propagate to SWR consumers.
- Create `src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/CustomerBookingDetail.jsx`: render loading, error, and complete booking detail states.
- Create `src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/__tests__/CustomerBookingDetail.test.jsx`: verify detail states and field rendering.
- Modify `src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/CustomerBookingsList.jsx`: own selection and switch between list/detail.
- Create `src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/__tests__/CustomerBookingsList.test.jsx`: verify selection and Back state restoration.

### Task 1: Lock the Backend Detail Contract

**Files:**

- Modify: `../backend/tests/Feature/Customer/OrderTest.php`

- [ ] **Step 1: Add failing contract and authorization tests**

Create an activity, city, activity location, order, payment, and emergency contact. Add this contract test:

```php
public function test_customer_can_view_own_order_detail_with_live_fallbacks(): void
{
    $user = User::factory()->create(['role' => 'customer', 'email_verified_at' => now()]);
    $city = City::factory()->create(['name' => 'Dubai', 'slug' => 'dubai']);
    $activity = Activity::factory()->create(['name' => 'Desert Safari', 'slug' => 'desert-safari']);
    ActivityLocation::create([
        'activity_id' => $activity->id,
        'city_id' => $city->id,
        'location_type' => 'primary',
    ]);
    $order = Order::factory()->create([
        'user_id' => $user->id,
        'orderable_type' => 'activity',
        'orderable_id' => $activity->id,
        'item_snapshot_json' => json_encode(['location' => []]),
    ]);
    OrderPayment::factory()->create(['order_id' => $order->id, 'payment_status' => 'paid']);

    $this->actingAs($user, 'api')
        ->getJson("/api/customer/userorders/{$order->id}")
        ->assertOk()
        ->assertJsonPath('order.item.name', 'Desert Safari')
        ->assertJsonPath('order.item.slug', 'desert-safari')
        ->assertJsonPath('order.item.item_type', 'activity')
        ->assertJsonPath('order.item.city', 'Dubai')
        ->assertJsonPath('order.item.city_slug', 'dubai')
        ->assertJsonPath('order.payment.payment_status', 'paid')
        ->assertJsonPath('order.number_of_adults', $order->number_of_adults)
        ->assertJsonPath('order.number_of_children', $order->number_of_children)
        ->assertJsonPath('order.user.email', $user->email)
        ->assertJsonStructure(['order' => [
            'created_at', 'special_requirements', 'payment', 'emergency_contact',
            'item' => ['media'], 'review',
        ]]);
}
```

Add the ownership and authentication tests:

```php
public function test_customer_cannot_view_another_customers_order_detail(): void
{
    $owner = User::factory()->create(['role' => 'customer']);
    $viewer = User::factory()->create(['role' => 'customer']);
    $order = Order::factory()->create(['user_id' => $owner->id]);

    $this->actingAs($viewer, 'api')
        ->getJson("/api/customer/userorders/{$order->id}")
        ->assertNotFound();
}

public function test_order_detail_returns_401_without_auth(): void
{
    $order = Order::factory()->create();

    $this->getJson("/api/customer/userorders/{$order->id}")
        ->assertUnauthorized();
}
```

Add a snapshot-only regression test that creates an order with a complete encoded snapshot, deletes the live activity, and asserts the detail response still returns the snapshot name, slug, item type, city, city slug, and media. Add a review-identity test with two bookings for the same activity and one review tied to the first order; only the first transformed booking may include that review.

In `../backend/tests/Feature/Customer/ReviewTest.php`, add two security regressions: submitting another customer's `order_id` returns `422`, and submitting an owned order whose `orderable_type` or `orderable_id` does not match the review item returns `422`.

- [ ] **Step 2: Run the focused backend test and confirm RED**

Run: `php artisan test tests/Feature/Customer/OrderTest.php`

Expected: failure because `/api/customer/userorders/{id}` is not registered and snapshot fallback fields are incomplete.

- [ ] **Step 3: Keep the failing tests uncommitted**

Do not commit during RED/GREEN work. The project workflow requires code review, simplification, and fresh verification before any implementation commit.

### Task 2: Implement the Customer Order Detail API

**Files:**

- Modify: `../backend/routes/api.php`
- Modify: `../backend/app/Http/Controllers/UserProfileController.php`

- [ ] **Step 1: Register the numeric detail route**

Add it after the collection route so route intent remains explicit:

```php
Route::get('/userorders', [UserProfileController::class, 'getUserOrders']);
Route::get('/userorders/{order}', [UserProfileController::class, 'getUserOrder'])
    ->whereNumber('order');
```

- [ ] **Step 2: Extract shared eager loads and transformation**

Add private helpers that return the polymorphic eager-load closure and transform one order. Preserve snapshot values first, then use live fallbacks:

```php
$liveLocation = $orderable?->locations?->first();
$locations = $snapshot['location'] ?? $snapshot['locations'] ?? [];
$cityName = $locations[0]['city'] ?? $liveLocation?->city?->name;
$citySlug = $locations[0]['city_slug'] ?? $liveLocation?->city?->slug;
$itemName = $snapshot['name'] ?? $orderable?->name;
$itemSlug = $snapshot['slug'] ?? $orderable?->slug;
$itemType = $snapshot['item_type'] ?? $orderable?->item_type ?? strtolower(class_basename($order->orderable_type));
```

The transformed record must include `created_at`, payment, emergency contact, item, review, and user fields. Reuse it in `getUserOrders` so list/detail contracts cannot drift.

Load reviews in bulk before transforming the paginated list. Review identity is booking-first: use a review whose `order_id` equals the current order ID; only fall back to a legacy `order_id = null` review matched by authenticated user, item type, and item ID. For the detail endpoint, query that same precedence once. Pass the resolved review into the transformer so no review query occurs inside the map. The two-booking regression test proves an order-linked review does not leak onto another booking of the same item.

- [ ] **Step 3: Add the ownership-scoped detail method**

```php
public function getUserOrder(Request $request, int $order)
{
    $user = $request->user();
    $customerOrder = Order::with($this->customerOrderRelations())
        ->where('user_id', $user->id)
        ->findOrFail($order);
    $review = $this->resolveCustomerOrderReview($customerOrder, $user->id);

    return response()->json([
        'success' => true,
        'order' => $this->transformCustomerOrder($customerOrder, $user, $user->profile, $review),
    ]);
}
```

When `reviewStore` receives `order_id`, resolve the order with `where('user_id', $user->id)->find($request->order_id)` and reject the request with a validation error unless its normalized morph type and `orderable_id` match `item_type` and `item_id`. Do this before uploads or review creation so an invalid association has no side effects.

- [ ] **Step 4: Run backend tests and syntax checks**

Run:

```bash
php artisan test tests/Feature/Customer/OrderTest.php
php artisan test tests/Feature/Customer/ReviewTest.php
php -l app/Http/Controllers/UserProfileController.php
php -l routes/api.php
```

Expected: all customer order tests pass and both PHP files report no syntax errors.

- [ ] **Step 5: Keep the green backend implementation uncommitted**

Record the passing evidence and continue to frontend TDD. Commit only after the final review, simplification, and verification gates.

### Task 3: Replace Booking Card Navigation With Selection

**Files:**

- Modify: `src/app/components/__tests__/BookingCardTheme.test.jsx`
- Modify: `src/app/components/BookingCard.jsx`
- Create: `src/app/components/BookingReviewDialog.jsx`
- Create: `src/app/components/__tests__/BookingReviewDialog.test.jsx`
- Modify: `src/app/components/Pages/DASHBOARD/user/_rsc_pages/reviews/forms/CustomerReviewForm.jsx`

- [ ] **Step 1: Replace the public-link tests with a failing callback test**

```jsx
it('selects the booking when View Booking is pressed', async () => {
  const onViewBooking = jest.fn();
  const user = userEvent.setup();
  render(<BookingCard bookingItem={{ id: 42, item: { name: 'Forest escape' } }} onViewBooking={onViewBooking} />);

  await user.click(screen.getByRole('button', { name: /view booking/i }));
  expect(onViewBooking).toHaveBeenCalledWith(42);
});
```

Run: `npx jest --runInBand src/app/components/__tests__/BookingCardTheme.test.jsx`

Expected: failure because the card still renders a public link.

- [ ] **Step 2: Implement the command prop**

Remove route-segment helpers and `NavigationLink`. Accept `onViewBooking`, render a real button, and call `onViewBooking(id)`. Disable it only when the callback is absent or `id` is missing.

Extract the existing review trigger/dialog into `BookingReviewDialog`. Pass the complete booking to `CustomerReviewForm`, include `order_id` in the review payload, and replace the incorrect hard-coded `mutate('/api/customer/orders')` call with an optional `onSaved` callback. The card passes its list refresh callback; the detail view passes its detail `mutate` callback.

Add a shared-dialog test that mocks `CustomerReviewForm`, triggers its successful-save callback, and asserts the supplied `onReviewSaved` function runs. Update the card callback test to provide `onReviewSaved` and assert the dialog receives it.

- [ ] **Step 3: Run the focused card test**

Run: `npx jest --runInBand src/app/components/__tests__/BookingCardTheme.test.jsx`

Expected: all card tests pass.

### Task 4: Add the Detail Data Hook and View

**Files:**

- Modify: `src/hooks/api/customer/orders.js`
- Create: `src/hooks/api/customer/__tests__/orders.test.jsx`
- Create: `src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/CustomerBookingDetail.jsx`
- Create: `src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/__tests__/CustomerBookingDetail.test.jsx`

- [ ] **Step 1: Write failing hook and detail-state tests**

Use `renderHook` with an Axios mock to prove a `404` from `/api/customer/userorders/42` appears as `result.current.error`; do not mock `useCustomerOrder` in this hook-level test. This prevents reuse of the list fetcher, which intentionally converts `401` and `404` to an empty collection.

Mock `useCustomerOrder` and verify:

```jsx
expect(screen.getByRole('button', { name: /back to bookings/i })).toBeEnabled();
expect(screen.getByText('Desert Safari')).toBeInTheDocument();
expect(screen.getByText('$125.00')).toBeInTheDocument();
expect(screen.getByText('Not provided')).toBeInTheDocument();
expect(screen.getByText('Booking ID: 42')).toBeInTheDocument();
expect(screen.getByText('confirmed')).toBeInTheDocument();
expect(screen.getByText('Dubai')).toBeInTheDocument();
expect(screen.getByRole('img', { name: 'Desert Safari' })).toHaveAttribute('src');
expect(screen.getByText('Aug 20, 2026')).toBeInTheDocument();
expect(screen.getByText('09:30')).toBeInTheDocument();
expect(screen.getByText('2 adults')).toBeInTheDocument();
expect(screen.getByText('1 child')).toBeInTheDocument();
expect(screen.getByText('Customer Name')).toBeInTheDocument();
expect(screen.getByText('customer@example.test')).toBeInTheDocument();
expect(screen.getByText('+971500000000')).toBeInTheDocument();
expect(screen.getByText('Emergency Name')).toBeInTheDocument();
expect(screen.getByText('Sibling')).toBeInTheDocument();
expect(screen.getByText('Vegetarian meal')).toBeInTheDocument();
expect(screen.getByText('Travel details')).toBeInTheDocument();
expect(screen.getByText('Payment')).toBeInTheDocument();
expect(screen.getByText('Traveler')).toBeInTheDocument();
expect(screen.getByText('Emergency contact')).toBeInTheDocument();
expect(screen.getByText('Special requirements')).toBeInTheDocument();
expect(screen.getByRole('button', { name: /add review|edit review/i })).toBeEnabled();
```

Add separate loading and error tests; the error test clicks Retry and asserts `mutate` was called.
Add an image-fallback test where `item.media` is empty and assert the stable booking placeholder is rendered with meaningful alternative text. Add a review-refresh test that invokes the shared dialog's save callback and asserts the detail hook's `mutate` runs.

Run: `npx jest --runInBand src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/__tests__/CustomerBookingDetail.test.jsx`

Expected: failure because the component and hook do not exist.

- [ ] **Step 2: Add the selected-order hook**

```js
const orderDetailFetcher = async (url) => {
  const response = await authApi.get(url);
  return response.data;
};

export function useCustomerOrder(orderId) {
  const key = orderId ? `${ORDERS_KEY}/${orderId}` : null;
  const { data, error, isLoading, mutate } = useSWR(key, orderDetailFetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  return { order: data?.order ?? null, isLoading, error, mutate };
}
```

- [ ] **Step 3: Implement the detail component**

Build small local helpers for `displayValue`, date/time display, and currency. Use Lucide icons (`ArrowLeft`, `CalendarDays`, `Clock`, `Users`, `CreditCard`, `UserRound`, `Phone`, `ShieldAlert`, `MessageSquare`) and existing `Button`, `Badge`, `Card`, and `Skeleton` components. Render the first `item.media` image through `next/image` with the item name as alt text; use `/assets/Review.png` as the stable fallback when media is absent. Keep fixed responsive grids and allow long values to wrap.

The component accepts `{ orderId, onBack }`, fetches the detail record, and renders Back in success, loading, and error states. Use `BookingReviewDialog` and pass the hook's `mutate` as `onSaved`, so an add/edit action refreshes the selected detail record.

Render the page as an unframed full-width detail layout. Cards may frame individual information groups, but no card may be nested inside another card and no page section should appear as a floating outer card.

- [ ] **Step 4: Run the focused detail tests**

Run: `npx jest --runInBand src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/__tests__/CustomerBookingDetail.test.jsx`

Expected: all detail tests pass.

### Task 5: Integrate Inline List/Detail State

**Files:**

- Modify: `src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/CustomerBookingsList.jsx`
- Create: `src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/__tests__/CustomerBookingsList.test.jsx`

- [ ] **Step 1: Write a failing integration test**

Mock the list hook and detail component. Select a non-default filter, click a booking, assert the list disappears and detail receives the ID, click Back, then assert the list and selected filter return.

Run: `npx jest --runInBand src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/__tests__/CustomerBookingsList.test.jsx`

Expected: failure because the list does not own selected-booking state.

- [ ] **Step 2: Implement the inline switch**

Add `selectedBookingId` state and stable callbacks:

```jsx
if (selectedBookingId) {
  return <CustomerBookingDetail orderId={selectedBookingId} onBack={() => setSelectedBookingId(null)} />;
}
```

Pass both `onViewBooking={setSelectedBookingId}` and `onReviewSaved={mutateOrders}` to each card. The integration test must assert the card receives `mutateOrders`, invoke it through the mocked card review-save callback, and confirm it runs. Do not reset page/filter state when selection changes.

- [ ] **Step 3: Run all focused frontend tests**

```bash
npx jest --runInBand src/app/components/__tests__/BookingCardTheme.test.jsx
npx jest --runInBand src/app/components/__tests__/BookingReviewDialog.test.jsx
npx jest --runInBand src/hooks/api/customer/__tests__/orders.test.jsx
npx jest --runInBand src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/__tests__/CustomerBookingDetail.test.jsx
npx jest --runInBand src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/__tests__/CustomerBookingsList.test.jsx
```

Expected: all focused suites pass.

### Task 6: Review, Simplify, and Verify End to End

**Files:**

- Review all files listed above.
- Update `../Reports/daily-work-report.md` only after both repositories are pushed.

- [ ] **Step 1: Run frontend static verification**

```bash
npm run type-check
npm run lint
git diff --check
```

- [ ] **Step 2: Run backend verification**

```bash
php artisan test tests/Feature/Customer/OrderTest.php
php artisan test tests/Feature/Customer/ReviewTest.php
php -l app/Http/Controllers/UserProfileController.php
php -l app/Http/Controllers/StripeController.php
php -l routes/api.php
git diff --check
```

- [ ] **Step 3: Run mandatory code review and simplification gates**

Dispatch the code-reviewer agent against the approved spec and both repository diffs. Fix every critical/important issue and re-review. Invoke the simplify skill if installed; if unavailable, perform an explicit manual clarity/duplication pass and record that limitation.

- [ ] **Step 4: Verify in a visible local browser**

Use a named headed `agent-browser` session at `http://localhost:3000/dashboard/customer`. Verify desktop and mobile layouts, card selection, loading/error-free detail rendering, Back behavior, preserved filters, text wrapping, and no overlap. If local accounts have no bookings, create only isolated local test data or document the limitation and rely on the browser-visible mocked route plus automated integration tests.

- [ ] **Step 5: Commit and push `main` in both repositories**

Stage only task files, commit frontend and backend separately, verify both branches are `main`, and run `git push origin main` in each repository.

- [ ] **Step 6: Append the daily report**

After successful pushes, append a dated session heading and concise completed-work bullets to `../Reports/daily-work-report.md`, including the inline detail flow, endpoint ownership protection, legacy fallback coverage, tests, and commit hashes.
