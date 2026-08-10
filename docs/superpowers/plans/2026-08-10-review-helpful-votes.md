# Review Helpful Votes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dummy Helpful control on activity and itinerary review cards with authenticated, persistent, toggleable votes and accurate counts.

**Architecture:** Laravel stores one `ReviewHelpfulVote` per review/user pair and exposes authenticated status, add, and remove endpoints. Public review endpoints add aggregate counts. Next.js uses a focused service, shared vote-state hook, and accessible button component so the existing single-product review renderer stays responsible for layout rather than authentication and mutation details.

**Tech Stack:** Laravel 12, PHP 8.2, Eloquent, PHPUnit 11, Next.js 16, React 19, NextAuth, SWR, Axios, Jest, Testing Library, Tailwind CSS.

---

## File map

### Backend

- Create `backend/database/migrations/2026_08_10_000001_create_review_helpful_votes_table.php` for the vote table and database uniqueness boundary.
- Create `backend/app/Models/ReviewHelpfulVote.php` for vote relationships.
- Modify `backend/app/Models/Review.php` to expose `helpfulVotes()`.
- Create `backend/app/Http/Controllers/ReviewHelpfulController.php` for status, add, remove, visibility checks, and response shaping.
- Modify `backend/routes/api.php` to register authenticated Helpful routes.
- Modify `backend/app/Http/Controllers/Guest/PublicReviewController.php` to load and return `helpful_count` for activity and itinerary review lists and featured results.
- Create `backend/tests/Feature/Public/ReviewHelpfulVoteTest.php` for the mutation and authorization contract.
- Modify `backend/tests/Feature/Public/ReviewEndpointTest.php` to lock public count payloads.

### Frontend

- Create `frontend/src/lib/services/reviewHelpfulVotes.js` for authenticated Helpful API calls.
- Create `frontend/src/lib/services/__tests__/reviewHelpfulVotes.test.js` for endpoint and payload contracts.
- Create `frontend/src/hooks/api/public/useReviewHelpfulVotes.js` for batched viewer status, shared per-review state, optimistic updates, reconciliation, and rollback.
- Create `frontend/src/hooks/api/public/__tests__/useReviewHelpfulVotes.test.jsx` for status hydration, optimistic state, failures, concurrency, and viewer isolation.
- Create `frontend/src/app/components/Pages/FRONT_END/singleproduct/ReviewHelpfulButton.jsx` for session/auth-modal/toast behavior and accessible presentation.
- Create `frontend/src/app/components/Pages/FRONT_END/singleproduct/__tests__/ReviewHelpfulButton.test.jsx` for interaction behavior.
- Modify `frontend/src/app/components/Pages/FRONT_END/singleproduct/SingleProductReview.jsx` to preserve vote data and render the shared control.
- Modify `frontend/src/app/components/Pages/FRONT_END/singleproduct/__tests__/SingleProductReview.test.jsx` to verify integration for activity and itinerary data.

## Mandatory implementation checkpoints

- Before the first Laravel implementation edit, invoke `laravel-specialist` and `test-driven-development`.
- Before the first frontend implementation edit, invoke `next-best-practices`, `vercel-react-best-practices`, `vercel-composition-patterns`, and `test-driven-development`.
- After each production-code task (Tasks 2 through 6), invoke `error-handling-patterns`, run the affected focused tests, run frontend `npm run type-check` and `npm run lint`, and use the named visible `weelp-visible` browser session for a localhost smoke check. UI-affecting Tasks 5 and 6 require interaction checks, not only page-load checks.
- Do not commit these task checkpoints. The project-level review, simplify, and final verification gates in Task 7 happen before the backend and frontend commits.

## Task 1: Lock the backend contract with failing feature tests

**Files:**

- Create: `backend/tests/Feature/Public/ReviewHelpfulVoteTest.php`
- Modify: `backend/tests/Feature/Public/ReviewEndpointTest.php`

- [ ] **Step 1: Write the failing mutation tests**

Create `ReviewHelpfulVoteTest.php` with `RefreshDatabase` and helpers that build approved activity and publicly visible itinerary reviews. Cover these exact expectations:

```php
public function test_authenticated_user_can_add_and_remove_a_helpful_vote_idempotently(): void
{
    [$review, $author] = $this->activityReview();
    $voter = User::factory()->create();

    $this->actingAs($voter, 'api')->putJson("/api/reviews/{$review->id}/helpful")
        ->assertOk()
        ->assertJsonPath('data.review_id', $review->id)
        ->assertJsonPath('data.helpful_count', 1)
        ->assertJsonPath('data.viewer_has_marked_helpful', true);

    $this->actingAs($voter, 'api')->putJson("/api/reviews/{$review->id}/helpful")
        ->assertOk()
        ->assertJsonPath('data.helpful_count', 1);

    $this->actingAs($voter, 'api')->deleteJson("/api/reviews/{$review->id}/helpful")
        ->assertOk()
        ->assertJsonPath('data.helpful_count', 0)
        ->assertJsonPath('data.viewer_has_marked_helpful', false);

    $this->actingAs($voter, 'api')->deleteJson("/api/reviews/{$review->id}/helpful")
        ->assertOk()
        ->assertJsonPath('data.helpful_count', 0);
}
```

Add separate tests for:

```php
$this->putJson("/api/reviews/{$review->id}/helpful")->assertUnauthorized();
$this->deleteJson("/api/reviews/{$review->id}/helpful")->assertUnauthorized();

$this->actingAs($author, 'api')
    ->putJson("/api/reviews/{$review->id}/helpful")
    ->assertUnprocessable()
    ->assertJsonPath('message', 'You cannot mark your own review as helpful.');

$this->actingAs($voter, 'api')
    ->putJson("/api/reviews/{$pendingReview->id}/helpful")
    ->assertNotFound();

$this->actingAs($voter, 'api')
    ->putJson("/api/reviews/{$privateItineraryReview->id}/helpful")
    ->assertNotFound();
```

Repeat the pending, private-itinerary, and missing-review eligibility cases against `DELETE`. After the second `PUT`, assert the database still contains exactly one vote:

```php
$this->assertDatabaseCount('review_helpful_votes', 1);
```

Test the batched status route with voted, unvoted, pending, and private-itinerary review IDs. Assert that only the voted public review ID is returned under `data.review_ids`. Include more than 50 IDs and non-integer input validation cases.

Add cascade assertions by deleting the voter and, in a separate test, deleting the review, then asserting `review_helpful_votes` no longer contains the row.

- [ ] **Step 2: Add failing public-payload assertions**

Extend the existing itinerary list/featured tests in `ReviewEndpointTest.php`, and add equivalent activity list and featured tests because the file does not currently contain those activity cases. Insert votes and assert:

```php
->assertJsonPath('data.0.helpful_count', 2);
```

Cover all four single-product responses:

```text
GET /api/reviews/activity/{slug}
GET /api/reviews/activity/{slug}/featured
GET /api/reviews/itinerary/{slug}
GET /api/reviews/itinerary/{slug}/featured
```

Also assert an approved review with no votes returns integer `helpful_count: 0`.

- [ ] **Step 3: Run the focused backend tests and confirm red**

Run:

```bash
cd backend
php artisan test tests/Feature/Public/ReviewHelpfulVoteTest.php tests/Feature/Public/ReviewEndpointTest.php
```

Expected: failures for the missing table, model/controller routes, and missing `helpful_count` response field. Do not weaken assertions to make the pre-implementation run pass.

## Task 2: Add the backend persistence boundary

**Files:**

- Create: `backend/database/migrations/2026_08_10_000001_create_review_helpful_votes_table.php`
- Create: `backend/app/Models/ReviewHelpfulVote.php`
- Modify: `backend/app/Models/Review.php`

- [ ] **Step 0: Load the required Laravel and TDD guidance**

Invoke `laravel-specialist` and `test-driven-development` before editing Laravel production files. Keep the implementation limited to the failing tests from Task 1.

- [ ] **Step 1: Create the migration**

Use this schema:

```php
Schema::create('review_helpful_votes', function (Blueprint $table): void {
    $table->id();
    $table->foreignId('review_id')->constrained()->cascadeOnDelete();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->timestamps();

    $table->unique(['review_id', 'user_id']);
});
```

The `down()` method drops only `review_helpful_votes`.

- [ ] **Step 2: Add the vote model**

Create a model with `HasFactory`, an explicit fillable list, and typed relationships:

```php
class ReviewHelpfulVote extends Model
{
    use HasFactory;

    protected $fillable = ['review_id', 'user_id'];

    public function review(): BelongsTo
    {
        return $this->belongsTo(Review::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
```

- [ ] **Step 3: Add the review relationship**

Import `HasMany` if needed and add:

```php
public function helpfulVotes(): HasMany
{
    return $this->hasMany(ReviewHelpfulVote::class);
}
```

- [ ] **Step 4: Run migration-focused tests**

Run the new feature test file. Expected: schema and cascade assertions pass; route assertions still fail until Task 3.

- [ ] **Step 5: Run the mandatory post-code checkpoint**

Invoke `error-handling-patterns`, then run the migration/model assertions, frontend `npm run type-check`, frontend `npm run lint`, and a visible-browser localhost page-load smoke check. Record that endpoint tests remain intentionally red until Task 3.

## Task 3: Implement authenticated endpoints and public counts

**Files:**

- Create: `backend/app/Http/Controllers/ReviewHelpfulController.php`
- Modify: `backend/routes/api.php`
- Modify: `backend/app/Http/Controllers/Guest/PublicReviewController.php`

- [ ] **Step 1: Implement public-review eligibility once**

In `ReviewHelpfulController`, add a private query used by status, add, and remove:

```php
private function publicReviewQuery(): Builder
{
    return Review::query()
        ->where('status', 'approved')
        ->where(function (Builder $query): void {
            $query->where(function (Builder $activityReviews): void {
                $activityReviews
                    ->where('item_type', 'activity')
                    ->whereIn('item_id', Activity::query()->select('id'));
            })->orWhere(function (Builder $itineraryReviews): void {
                $itineraryReviews
                    ->where('item_type', 'itinerary')
                    ->whereIn('item_id', Itinerary::publiclyVisible()->select('id'));
            });
        });
}
```

`findPublicReview(int $reviewId)` calls this query with `find($reviewId)` and returns a JSON `404` from each action when absent.

- [ ] **Step 2: Implement status, add, and remove**

Status validation:

```php
$validated = $request->validate([
    'review_ids' => ['required', 'array', 'max:50'],
    'review_ids.*' => ['required', 'integer', 'min:1', 'distinct'],
]);
```

Filter the validated IDs through `publicReviewQuery()`, then query `ReviewHelpfulVote` for `$request->user()->id`. Return:

```php
return response()->json([
    'success' => true,
    'data' => ['review_ids' => $votedReviewIds],
]);
```

For add, reject `review.user_id === request.user.id`, then use `insertOrIgnore` with both timestamps so a concurrent duplicate remains idempotent. Set `$isMarked = true` after the insert-or-ignore operation. For remove, delete the exact review/user pair and set `$isMarked = false`. Both return the same shape:

```php
return response()->json([
    'success' => true,
    'data' => [
        'review_id' => $review->id,
        'helpful_count' => $review->helpfulVotes()->count(),
        'viewer_has_marked_helpful' => $isMarked,
    ],
]);
```

- [ ] **Step 3: Register role-agnostic authenticated routes**

Import `ReviewHelpfulController` and add a top-level auth group, keeping `helpful-status` static and constraining the review parameter:

```php
Route::middleware(['auth:api', 'throttle:30,1'])->prefix('reviews')->group(function () {
    Route::get('/helpful-status', [ReviewHelpfulController::class, 'status']);
    Route::put('/{review}/helpful', [ReviewHelpfulController::class, 'store'])->whereNumber('review');
    Route::delete('/{review}/helpful', [ReviewHelpfulController::class, 'destroy'])->whereNumber('review');
});
```

- [ ] **Step 4: Add aggregate counts to public responses**

For all four activity/itinerary review queries, add:

```php
->withCount('helpfulVotes')
```

For each transformed review payload, add:

```php
'helpful_count' => (int) $review->helpful_votes_count,
```

Do not expose user IDs from `review_helpful_votes` in public responses.

- [ ] **Step 5: Verify the local database target and apply the migration**

Before migrating, inspect only non-secret connection metadata:

```bash
cd backend
php artisan tinker --execute="dump(['environment' => app()->environment(), 'connection' => config('database.default'), 'host' => config('database.connections.'.config('database.default').'.host'), 'database' => DB::connection()->getDatabaseName()]);"
```

Expected: a local/development environment and a database target that is not the documented Aiven production host. Do not print the connection URL, username, or password. If the environment is `production`, the host is `weelp-mysql-weelp-production.d.aivencloud.com`, or the target is otherwise uncertain, stop and ask the user before migrating.

After confirming the target is non-production, run:

```bash
php artisan migrate
php artisan migrate:status
```

Expected: `2026_08_10_000001_create_review_helpful_votes_table` is marked `Ran`.

- [ ] **Step 6: Run and format backend changes**

Run:

```bash
cd backend
php artisan test tests/Feature/Public/ReviewHelpfulVoteTest.php tests/Feature/Public/ReviewEndpointTest.php
./vendor/bin/pint --test app/Models/Review.php app/Models/ReviewHelpfulVote.php app/Http/Controllers/ReviewHelpfulController.php app/Http/Controllers/Guest/PublicReviewController.php routes/api.php database/migrations/2026_08_10_000001_create_review_helpful_votes_table.php tests/Feature/Public/ReviewHelpfulVoteTest.php tests/Feature/Public/ReviewEndpointTest.php
```

Expected: focused tests pass and Pint reports no style errors. If Pint reports formatting changes, run the same file list without `--test`, then rerun tests and `--test`.

- [ ] **Step 7: Run the mandatory post-code checkpoint**

Invoke `error-handling-patterns`. Run frontend `npm run type-check` and `npm run lint`, then use `agent-browser --session weelp-visible` to reload the visible activity page and confirm the review section still loads. Query the local activity and itinerary review endpoints and confirm `helpful_count` is present before frontend integration.

## Task 4: Add the frontend service contract

**Files:**

- Create: `frontend/src/lib/services/reviewHelpfulVotes.js`
- Create: `frontend/src/lib/services/__tests__/reviewHelpfulVotes.test.js`

- [ ] **Step 0: Load the required Next.js, React, composition, and TDD guidance**

Invoke `next-best-practices`, `vercel-react-best-practices`, `vercel-composition-patterns`, and `test-driven-development` before editing frontend production files.

- [ ] **Step 1: Write failing service tests**

Mock `getAuthApi()` and assert exact calls:

```js
await getReviewHelpfulStatus([8, 3]);
expect(api.get).toHaveBeenCalledWith('/api/reviews/helpful-status', {
  params: { review_ids: [8, 3] },
  headers: { Accept: 'application/json' },
});

await addReviewHelpfulVote(8);
expect(api.put).toHaveBeenCalledWith('/api/reviews/8/helpful', undefined, {
  headers: { Accept: 'application/json' },
});

await removeReviewHelpfulVote(8);
expect(api.delete).toHaveBeenCalledWith('/api/reviews/8/helpful', {
  headers: { Accept: 'application/json' },
});
```

Assert each function returns `response.data` and rejects rather than converting authenticated failures to empty success objects.

- [ ] **Step 2: Confirm the service tests fail**

Run:

```bash
cd frontend
npx jest src/lib/services/__tests__/reviewHelpfulVotes.test.js --runInBand
```

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the service**

Use `getAuthApi()` for all three functions and keep endpoint constants private to the module. Send repeated `review_ids[]` query parameters through Axios `params`; verify the existing Laravel request parser receives an array in the integration test. This is the canonical contract documented in the amended spec.

- [ ] **Step 4: Re-run the service tests**

Expected: PASS.

- [ ] **Step 5: Run the mandatory post-code checkpoint**

Invoke `error-handling-patterns`, then run the service test, `npm run type-check`, and `npm run lint`. Reload the activity page in the visible `weelp-visible` session and confirm the unchanged review UI still loads without a runtime overlay.

## Task 5: Build shared optimistic vote state and the Helpful button

**Files:**

- Create: `frontend/src/hooks/api/public/useReviewHelpfulVotes.js`
- Create: `frontend/src/hooks/api/public/__tests__/useReviewHelpfulVotes.test.jsx`
- Create: `frontend/src/app/components/Pages/FRONT_END/singleproduct/ReviewHelpfulButton.jsx`
- Create: `frontend/src/app/components/Pages/FRONT_END/singleproduct/__tests__/ReviewHelpfulButton.test.jsx`

- [ ] **Step 1: Write failing Helpful button tests**

Mock `useSession`, `useAuthModalStore`, `useToast`, and a supplied `onChange` callback. Cover:

```jsx
render(<ReviewHelpfulButton reviewId={8} count={3} isMarked={false} isPending={false} onChange={onChange} />);
expect(screen.getByRole('button', { name: 'Mark review as helpful' })).toHaveAttribute('aria-pressed', 'false');
expect(screen.getByText('Helpful · 3')).toBeVisible();
```

Then cover authenticated add/remove, per-button disabled state, guest modal opening without an immediate request, post-login add, and rejected mutation toast:

```js
expect(openAuthModal).toHaveBeenCalledWith({ onSuccess: expect.any(Function) });
expect(toast).toHaveBeenCalledWith({
  title: 'Unable to update helpful vote',
  description: 'You cannot mark your own review as helpful.',
  variant: 'destructive',
});
```

- [ ] **Step 2: Implement the shared hook**

First write failing hook tests through a small component harness with deferred service promises. Cover successful status hydration, authenticated readiness gating, status failure enabling fallback behavior, exact optimistic rollback, server reconciliation, two review IDs mutating independently, two controls reading the same review state, logout reset, and direct user-A to user-B switching.

`useReviewHelpfulVotes(reviews)` must:

- normalize and sort unique numeric review IDs;
- use `useSession()` and an SWR key containing the current user ID plus the normalized IDs;
- skip status fetching unless authenticated and at least one ID exists;
- retain public `helpfulCount` values when status loading fails;
- namespace or reset the override map whenever `session.user.id` changes, including logout;
- keep one override map keyed by review ID for the active viewer only;
- expose `stateFor(review)` as `{ count, isMarked, isPending, isStatusReady }`;
- expose `setHelpful(reviewId, nextMarked)` with an optimistic `count ± 1`, a zero floor, server-response reconciliation, and exact rollback on rejection;
- disable only the review ID currently being changed, not every Helpful control.

For authenticated sessions, `isStatusReady` is false while the initial status request is unresolved. It becomes true after either success or failure. Guest state is immediately ready. This prevents an existing voter from issuing `PUT` before the initial marked state is known while preserving the spec's fallback after a status-request failure.

The core optimistic update should retain the prior state before awaiting:

```js
const review = reviewsById.get(reviewId);
const previous = stateFor(review);
setOverrides((current) => ({
  ...current,
  [reviewId]: {
    count: Math.max(0, previous.count + (nextMarked ? 1 : -1)),
    isMarked: nextMarked,
    isPending: true,
  },
}));
```

On success, replace the override with the API's `helpful_count` and `viewer_has_marked_helpful`. On failure, restore `previous` and rethrow for the button toast.

- [ ] **Step 3: Implement the button**

Use `ThumbsUp` from Lucide, `useSession`, the existing auth-modal store, and `useToast`. Render:

```jsx
<button
  type="button"
  aria-label={isMarked ? 'Remove helpful vote from review' : 'Mark review as helpful'}
  aria-pressed={isMarked}
  disabled={status === 'loading' || (status === 'authenticated' && !isStatusReady) || isPending}
  onClick={handleClick}
  className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm text-muted-foreground transition-colors hover:text-copy disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
>
  <ThumbsUp aria-hidden="true" className={`size-4 ${isMarked ? 'fill-weelp-sage-deep text-weelp-sage-deep' : ''}`} />
  <span>{count > 0 ? `Helpful · ${count}` : 'Helpful'}</span>
</button>
```

Guest clicks call `openAuthModal({ onSuccess: () => runChange(true) })`. `runChange` catches errors, reads `error.response.data.message`, and shows the destructive toast without leaking the rejection from the auth callback.

- [ ] **Step 4: Run the component tests**

Run:

```bash
npx jest src/app/components/Pages/FRONT_END/singleproduct/__tests__/ReviewHelpfulButton.test.jsx --runInBand
```

Expected: PASS.

- [ ] **Step 5: Run the dedicated hook tests**

Run:

```bash
npx jest src/hooks/api/public/__tests__/useReviewHelpfulVotes.test.jsx --runInBand
```

Expected: PASS for readiness, failure fallback, reconciliation, rollback, per-ID pending state, shared state, logout, and account switching.

- [ ] **Step 6: Run the mandatory post-code checkpoint**

Invoke `error-handling-patterns`, then run the hook and button tests, `npm run type-check`, and `npm run lint`. In the visible browser, confirm the existing activity page remains usable and that no runtime overlay appears before integration.

## Task 6: Integrate Helpful state into activity and itinerary reviews

**Files:**

- Modify: `frontend/src/app/components/Pages/FRONT_END/singleproduct/SingleProductReview.jsx`
- Modify: `frontend/src/app/components/Pages/FRONT_END/singleproduct/__tests__/SingleProductReview.test.jsx`

- [ ] **Step 1: Add failing integration assertions**

Extend the activity and itinerary fixtures with:

```js
helpful_count: 4,
```

Mock the shared hook in layout-focused tests, or mock only its service dependencies in interaction-focused tests. Assert that transformed review data retains:

```js
{
  id: 8,
  helpfulCount: 4,
}
```

Assert the all-reviews card renders `Helpful · 4`. Add one activity case and one itinerary case so both service branches are locked.

- [ ] **Step 2: Preserve vote fields in review transformation**

Add:

```js
id: review.id,
helpfulCount: Number(review.helpful_count) || 0,
```

Use stable review IDs as React keys instead of page-local indexes where a persisted ID is available.

- [ ] **Step 3: Connect the shared hook and control**

Call `useReviewHelpfulVotes(allReviewsDataFinal)` once in `SingleProductReview`. Pass `stateFor` and `setHelpful` through `AllReviewsList`, then replace the inline dummy SVG/button with:

```jsx
const voteState = stateFor(review);

<ReviewHelpfulButton
  reviewId={review.id}
  count={voteState.count}
  isMarked={voteState.isMarked}
  isPending={voteState.isPending}
  isStatusReady={voteState.isStatusReady}
  onChange={(nextMarked) => setHelpful(review.id, nextMarked)}
/>;
```

Do not add controls to the featured carousel in this task.

- [ ] **Step 4: Run focused frontend tests**

Run:

```bash
npx jest \
  src/lib/services/__tests__/reviewHelpfulVotes.test.js \
  src/hooks/api/public/__tests__/useReviewHelpfulVotes.test.jsx \
  src/app/components/Pages/FRONT_END/singleproduct/__tests__/ReviewHelpfulButton.test.jsx \
  src/app/components/Pages/FRONT_END/singleproduct/__tests__/SingleProductReview.test.jsx \
  --runInBand
```

Expected: all focused suites pass without React state-update warnings.

- [ ] **Step 5: Run the mandatory post-code checkpoint**

Invoke `error-handling-patterns`, rerun the focused tests, `npm run type-check`, and `npm run lint`. Use the visible `weelp-visible` browser session to exercise guest authentication handoff and authenticated add/remove on both activity and itinerary pages at desktop and mobile widths.

## Task 7: Review, simplify, verify, commit, and push

**Files:**

- Review all files listed in the file map.
- Update this plan's checkboxes while executing; do not change the approved design contract without user approval.

- [ ] **Step 1: Apply the required error-handling review**

Invoke `error-handling-patterns`. Check that backend visibility failures do not disclose private reviews, mutation failures are deterministic, frontend rollbacks restore both count and selection, and auth-callback promises are contained.

- [ ] **Step 2: Run backend verification**

Run:

```bash
cd backend
php artisan test tests/Feature/Public/ReviewHelpfulVoteTest.php tests/Feature/Public/ReviewEndpointTest.php
./vendor/bin/pint --test app/Models/Review.php app/Models/ReviewHelpfulVote.php app/Http/Controllers/ReviewHelpfulController.php app/Http/Controllers/Guest/PublicReviewController.php routes/api.php database/migrations/2026_08_10_000001_create_review_helpful_votes_table.php tests/Feature/Public/ReviewHelpfulVoteTest.php tests/Feature/Public/ReviewEndpointTest.php
```

Expected: all tests pass and Pint reports clean files.

- [ ] **Step 3: Run frontend verification**

Run:

```bash
cd frontend
npm run type-check
npm run lint
npx jest \
  src/lib/services/__tests__/reviewHelpfulVotes.test.js \
  src/hooks/api/public/__tests__/useReviewHelpfulVotes.test.jsx \
  src/app/components/Pages/FRONT_END/singleproduct/__tests__/ReviewHelpfulButton.test.jsx \
  src/app/components/Pages/FRONT_END/singleproduct/__tests__/SingleProductReview.test.jsx \
  --runInBand
npm run build
```

Expected: type-check, lint, focused tests, and production build all pass.

- [ ] **Step 4: Run the mandatory code-review and simplify loop**

Dispatch the required code-reviewer agent against both repositories and the approved spec. Fix every critical/high-confidence issue, rerun affected checks, and request re-review until the reviewer has no blocking findings. Invoke the `simplify` skill afterward; if that skill is unavailable, record the blocker and perform a focused clarity/reuse/efficiency pass without expanding scope.

- [ ] **Step 5: Verify in the visible localhost browser**

Keep or reopen the required named headed session:

```bash
agent-browser --session weelp-visible --headed open http://localhost:3000/cities/dubai/activities/dubai-desert-safari-with-bbq
```

Verify guest click opens authentication, authenticated add/remove changes the thumb and count, reload preserves state, a failed/self vote shows the message and rolls back, and keyboard focus/`aria-pressed` work. Repeat on a valid local itinerary URL using the full `/cities/{city}/itineraries/{slug}` hierarchy. Check desktop and mobile viewports.

- [ ] **Step 6: Inspect final diffs and commit only after all gates pass**

Run `git diff --check`, inspect `git diff`, and ensure no unrelated files changed. Commit backend and frontend separately on `main` with concise conventional messages. The frontend commit includes this plan and the already committed design history; the backend commit includes the migration/API work.

- [ ] **Step 7: Confirm the production migration path before pushing**

Inspect the Render deployment configuration without exposing secrets and determine whether backend deploys automatically run `php artisan migrate --force`. If they do, record that evidence. If they do not, stop before pushing the backend and request approval for the production migration/rollout action. Do not deploy code whose public review queries reference `review_helpful_votes` before the production table is guaranteed to exist.

- [ ] **Step 8: Push both main branches and verify**

Push `backend/main` and `frontend/main` only after the migration path is confirmed. Confirm each local `HEAD` equals `origin/main`, both worktrees are clean, and report the commit hashes plus verification and migration results.
