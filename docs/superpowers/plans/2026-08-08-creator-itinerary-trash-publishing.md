# Creator Itinerary Trash and Republishing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add recoverable 30-day Trash, restore-to-Draft, creator publication requests, admin publication controls, notifications, and automatic permanent deletion for creator itineraries.

**Architecture:** Laravel `SoftDeletes` is the Trash boundary, while `itinerary_meta.status` remains the publication workflow. A focused lifecycle service owns row locking, restore, and permanent deletion so creator endpoints, admin endpoints, and the scheduled command share identical state transitions. Next.js dashboard tabs are URL-driven server views, avoiding first-page-only client filtering.

**Tech Stack:** Laravel 12, PHP 8.2, Eloquent, MySQL, Laravel Mail/Notifications/Scheduler, PHPUnit, Next.js 16 App Router, React 19, NextAuth, Radix UI, Jest, Testing Library.

All commands start from the `frontend` repository unless the step explicitly uses `cd ../backend`.

---

## File map

Backend repository:

- Create `../backend/database/migrations/2026_08_08_000001_add_trash_fields_to_itineraries.php` for `itineraries.deleted_at` plus republish-request metadata.
- Modify `../backend/app/Models/Itinerary.php` to enable `SoftDeletes` and delegate republish metadata.
- Modify `../backend/app/Models/ItineraryMeta.php` to allow republish metadata assignment/casting.
- Modify `../backend/app/Http/Controllers/Admin/ItineraryController.php` so catalog itinerary deletion stays physical.
- Modify `../backend/app/Services/ItineraryDraftService.php` so temporary edit-draft cleanup stays physical.
- Create `../backend/app/Services/CreatorItineraryLifecycleService.php` for trash, restore, publish-request, direct publish, and permanent deletion transitions.
- Create `../backend/app/Mail/ItineraryTrashedMail.php` and `../backend/resources/views/emails/itinerary-trashed.blade.php` for direct-admin-removal email.
- Modify `../backend/app/Http/Controllers/Creator/CreatorItineraryController.php` for creator Trash listing, restore, and publication requests.
- Modify `../backend/app/Http/Controllers/Customer/CustomerItineraryController.php` for unified active/Draft/Trash server filtering.
- Modify `../backend/app/Http/Controllers/Admin/CreatorItineraryManagementController.php` for admin Trash, restore, publish, rejection, and permanent deletion.
- Modify `../backend/routes/api.php` for creator/admin lifecycle routes.
- Create `../backend/app/Console/Commands/PruneTrashedCreatorItineraries.php` for dry-run and execute modes.
- Modify `../backend/routes/console.php` to schedule the purge daily.
- Create `../backend/tests/Feature/Creator/CreatorItineraryTrashTest.php`.
- Create `../backend/tests/Feature/Creator/CreatorItineraryPublishRequestTest.php`.
- Create `../backend/tests/Feature/Admin/CreatorItineraryTrashAdminTest.php`.
- Create `../backend/tests/Feature/PruneTrashedCreatorItinerariesTest.php`.
- Modify `../backend/tests/Feature/CreatorItineraryExploreIndexTest.php` and `../backend/tests/Feature/Public/ItineraryEndpointTest.php` for public `404` assertions.
- Create `../backend/tests/Feature/Admin/ItinerarySoftDeleteRegressionTest.php` for catalog and edit-draft physical deletion.
- Modify `../backend/app/Http/Controllers/Customer/WishlistController.php` and `../backend/tests/Feature/Customer/WishlistTest.php` so trashed/restored Drafts disappear from saved items.
- Modify `../backend/app/Http/Controllers/Customer/CustomerItineraryController.php` and add booking assertions to reject trashed/restored Draft IDs.
- Audit `../backend/app/Http/Controllers/Guest/PublicHomeSearchController.php`, `PublicToursSearchController.php`, and `PublicCitiesController.php`; modify only raw/join queries that bypass the Eloquent soft-delete scope.
- Modify `../backend/tests/Feature/Public/SearchEndpointTest.php` and `../backend/tests/Feature/Public/CityEndpointTest.php` for search/city-list isolation.
- Modify `../backend/app/Http/Controllers/Guest/PublicReviewController.php` and `../backend/tests/Feature/Public/ReviewEndpointTest.php` so retained historical reviews are not public after Trash/permanent deletion.

Frontend repository:

- Modify `src/lib/actions/customerItineraries.js` for URL-driven creator status/Trash queries.
- Modify `src/lib/actions/creatorItineraries.js` for restore, request-publish, admin publish, and permanent-delete actions.
- Modify `src/lib/actions/__tests__/creatorItineraries.test.js` for lifecycle action contracts.
- Modify `src/app/(dashboard)/dashboard/customer/my-itineraries/page.js` to read `view`, `status`, and `page` search params.
- Modify `src/app/(dashboard)/dashboard/customer/my-itineraries/MyItinerariesClientWrapper.jsx` for All/Drafts/Trash navigation and actions.
- Create `src/app/(dashboard)/dashboard/customer/my-itineraries/__tests__/MyItinerariesClientWrapper.test.jsx`.
- Modify `src/app/(dashboard)/dashboard/customer/my-itineraries/__tests__/page.test.jsx` for server filter forwarding.
- Modify `src/app/(dashboard)/dashboard/customer/my-itineraries/[id]/edit/page.js` to pass standalone/edit-draft mode.
- Modify `src/app/components/Pages/FRONT_END/creator-itinerary-form/CreatorItineraryFormShell.jsx` so standalone Draft saves do not become `edit_pending`.
- Create `src/app/components/Pages/FRONT_END/creator-itinerary-form/__tests__/CreatorItineraryFormShell.test.jsx` for both submission modes.
- Modify `src/app/(dashboard)/dashboard/admin/creator-itineraries/page.js` to read server filters.
- Modify `src/app/(dashboard)/dashboard/admin/creator-itineraries/CreatorItinerariesClientWrapper.jsx` for Draft/Trash actions.
- Create `src/app/(dashboard)/dashboard/admin/creator-itineraries/__tests__/CreatorItinerariesClientWrapper.test.jsx`.

## Task 0: Load required implementation guidance

**Files:** None.

- [ ] **Step 1: Invoke `executing-plans` before implementation**

Execute this plan task-by-task with explicit checkpoints. Project rules override the plan skill's frequent-commit default: leave implementation uncommitted until the mandatory final code review and simplification gates pass.

- [ ] **Step 2: Invoke backend and test guidance before Task 1**

Read and apply `laravel-specialist`, `test-driven-development`, and `error-handling-patterns`. Use row-scoped authorization, transactions, `lockForUpdate()`, and tests that prove red before green.

- [ ] **Step 3: Invoke frontend guidance before Task 6**

Read and apply `next-best-practices`, `vercel-react-best-practices`, and `vercel-composition-patterns`. Keep pages as server components, encode tab state in URL search params, and keep mutation/dialog state in focused client components.

## Task 1: Add soft-delete storage and lifecycle service

**Files:**

- Create: `../backend/database/migrations/2026_08_08_000001_add_trash_fields_to_itineraries.php`
- Modify: `../backend/app/Models/Itinerary.php`
- Modify: `../backend/app/Models/ItineraryMeta.php`
- Modify: `../backend/app/Http/Controllers/Admin/ItineraryController.php`
- Modify: `../backend/app/Services/ItineraryDraftService.php`
- Create: `../backend/app/Services/CreatorItineraryLifecycleService.php`
- Create: `../backend/tests/Feature/Creator/CreatorItineraryTrashTest.php`
- Create: `../backend/tests/Feature/Admin/ItinerarySoftDeleteRegressionTest.php`

- [ ] **Step 1: Write the failing model/service tests**

Create an approved creator itinerary, call the lifecycle service, and assert:

```php
$service->trash($itinerary->id);

$this->assertSoftDeleted('itineraries', ['id' => $itinerary->id]);
$this->assertDatabaseHas('itinerary_meta', [
    'itinerary_id' => $itinerary->id,
    'status' => 'deleted',
    'removal_status' => 'approved',
]);

$trashed = Itinerary::onlyTrashed()->findOrFail($itinerary->id);
$service->restoreToDraft($trashed->id);

$this->assertNotSoftDeleted('itineraries', ['id' => $itinerary->id]);
$this->assertDatabaseHas('itinerary_meta', [
    'itinerary_id' => $itinerary->id,
    'status' => 'draft',
    'removal_status' => null,
    'removal_reason' => null,
]);
```

Add a conflict test proving `trash()` throws a `ValidationException` when `draft_itinerary_id` is present, and a second-trash test proving a restored/retrashed itinerary receives a later `deleted_at`.

Create the regression file with five assertions: `Admin\ItineraryController::destroy()` physically removes an original catalog itinerary, `bulkDestroy()` physically removes every selected original catalog itinerary, both endpoints reject creator itinerary and customer-copy IDs without deleting them, and `ItineraryDraftService::deleteDraft()` plus edit merge/rejection physically removes its temporary Draft rather than adding it to Trash.

- [ ] **Step 2: Run the focused test and verify red**

Run:

```bash
cd ../backend
php artisan test \
  tests/Feature/Creator/CreatorItineraryTrashTest.php \
  tests/Feature/Admin/ItinerarySoftDeleteRegressionTest.php
```

Expected: FAIL because `deleted_at` and `CreatorItineraryLifecycleService` do not exist.

- [ ] **Step 3: Add the migration and model support**

Use this migration shape:

```php
public function up(): void
{
    Schema::table('itineraries', fn (Blueprint $table) => $table->softDeletes());
    Schema::table('itinerary_meta', function (Blueprint $table) {
        $table->timestamp('publication_requested_at')->nullable()->after('removal_reason');
        $table->text('publication_rejection_reason')->nullable()->after('publication_requested_at');
    });
}

public function down(): void
{
    Schema::table('itinerary_meta', fn (Blueprint $table) => $table->dropColumn([
        'publication_requested_at',
        'publication_rejection_reason',
    ]));
    Schema::table('itineraries', fn (Blueprint $table) => $table->dropSoftDeletes());
}
```

Import `SoftDeletes` in `Itinerary`, change its trait line to `use HasFactory, SoftDeletes;`, add `publication_requested_at` and `publication_rejection_reason` to `$metaAttributes`, and document `deleted_at`. Add both fields to `ItineraryMeta::$fillable`; cast `publication_requested_at` as `datetime`.

Add `draftParentMeta(): HasOne` using foreign key `draft_itinerary_id`. Add `scopeCreatorManaged($query)` that identifies creator-workflow rows by non-null metadata status even if `creator_id` became null after account deletion; customer-saved copies have null workflow status. Add `scopeStandaloneCreator($query)` as `creatorManaged()->whereDoesntHave('draftParentMeta')`. This predicate—not `parent_itinerary_id`—distinguishes top-level creator records from temporary edit drafts and keeps orphaned creator content administratively cleanable.

- [ ] **Step 4: Implement the lifecycle service**

Create methods with these contracts:

```php
public function trash(int $id, ?Closure $withinTransaction = null): Itinerary
{
    return DB::transaction(function () use ($id, $withinTransaction) {
        $locked = Itinerary::standaloneCreator()->lockForUpdate()->findOrFail($id);
        if ($locked->draft_itinerary_id || in_array($locked->status, ['pending', 'edit_pending'], true)) {
            throw ValidationException::withMessages([
                'itinerary' => 'Resolve the pending approval before moving this itinerary to Trash.',
            ]);
        }
        $locked->meta->update([
            'status' => 'deleted',
            'removal_status' => 'approved',
            'publication_requested_at' => null,
            'publication_rejection_reason' => null,
        ]);
        $locked->delete();
        $withinTransaction?.__invoke($locked);
        return $locked->load('meta');
    });
}

public function restoreToDraft(
    int $id,
    ?int $ownedByCreatorId = null,
    ?Closure $withinTransaction = null,
): Itinerary
{
    return DB::transaction(function () use ($id, $ownedByCreatorId, $withinTransaction) {
        $query = Itinerary::onlyTrashed()->standaloneCreator();
        if ($ownedByCreatorId !== null) {
            $query->whereHas('meta', fn ($meta) => $meta->where('creator_id', $ownedByCreatorId));
        }
        $locked = $query->lockForUpdate()->findOrFail($id);
        $locked->restore();
        $locked->meta->update([
            'status' => 'draft',
            'removal_status' => null,
            'removal_reason' => null,
            'publication_requested_at' => null,
            'publication_rejection_reason' => null,
        ]);
        $withinTransaction?.__invoke($locked);
        return $locked->fresh(['meta']);
    });
}
```

Also add `requestRemoval()`, `rejectRemoval()`, `requestPublication()`, `publish()`, `rejectPublication()`, and `forceDelete()` methods. Every method accepts an itinerary ID, resolves and locks the row itself, and rechecks the standalone-creator predicate and state under lock. Creator-only methods require the authenticated creator ID and include `meta.creator_id = $creatorId` in that locked query. Shared restore accepts the optional `ownedByCreatorId` shown above: creator controllers pass `Auth::id()`, while an authorized admin passes `null`. This makes the in-transaction query—not a frontend label or earlier controller lookup—the ownership boundary. `requestRemoval()` permits Draft, Rejected, or Approved and rejects Pending/edit conflicts. `requestPublication()` accepts only a standalone Draft with no removal request, sets `status=pending` and `publication_requested_at=now()`. `publish()` accepts standalone Draft or Pending, sets `status=approved`, clears request/rejection/removal fields. `rejectPublication()` returns a republish request to Draft with its reason, while a normal initial Pending submission becomes Rejected. Define `forceDelete(int $id, ?CarbonInterface $deletedBefore = null): bool`; it rechecks a standalone `onlyTrashed()` row under lock and returns `false` if the row was restored or its `deleted_at` is newer than an optional cutoff. It deletes wishlist entries, polymorphic post-tag links, and non-order itinerary reviews plus their media, then calls `forceDelete()` so database cascades clean the remaining itinerary-owned rows. Historical orders, payments, commissions, emergency contacts, and reviews with a non-null historical `order_id` are deliberately retained for booking/accounting history.

Accept an optional transaction callback in each transition method and invoke it before the transaction commits. Controllers use this callback for database notifications; mail remains after commit.

- [ ] **Step 5: Preserve physical deletion for non-Trash workflows**

Change catalog `destroy()` to resolve the ID through `Itinerary::original()` and call `forceDelete()` only on that row. Change bulk deletion to require that every submitted ID resolves through `Itinerary::original()` before the transaction mutates anything; reject the complete request if it contains a creator workflow row or customer copy, otherwise `forceDelete()` each original catalog row. This prevents the generic catalog routes from bypassing creator Trash. Change `ItineraryDraftService::deleteDraft()` to call `$draft->forceDelete()` after its explicit child cleanup. Never call the creator Trash service from these internal/catalog paths.

- [ ] **Step 6: Run the focused test and backend checkpoint**

Run:

```bash
cd ../backend
php artisan test tests/Feature/Creator/CreatorItineraryTrashTest.php tests/Feature/Admin/ItinerarySoftDeleteRegressionTest.php
php artisan migrate
vendor/bin/pint app/Models/Itinerary.php app/Models/ItineraryMeta.php app/Services/CreatorItineraryLifecycleService.php app/Services/ItineraryDraftService.php app/Http/Controllers/Admin/ItineraryController.php database/migrations/2026_08_08_000001_add_trash_fields_to_itineraries.php
git diff --check
```

Expected: focused tests PASS, migration succeeds, formatter and diff check exit 0.

## Task 2: Add creator Trash, restore, and publication-request APIs

**Files:**

- Modify: `../backend/app/Http/Controllers/Customer/CustomerItineraryController.php`
- Modify: `../backend/app/Http/Controllers/Creator/CreatorItineraryController.php`
- Modify: `../backend/routes/api.php`
- Modify: `../backend/tests/Feature/Creator/CreatorItineraryTrashTest.php`
- Create: `../backend/tests/Feature/Creator/CreatorItineraryPublishRequestTest.php`

- [ ] **Step 1: Add failing ownership/list/restore tests**

Test `GET /api/customer/my-itineraries?view=trash`, creator ownership isolation, Draft filtering, countdown fields, and restore:

```php
$response = $this->actingAs($creator, 'api')
    ->getJson('/api/customer/my-itineraries?view=trash');

$response->assertOk()
    ->assertJsonPath('data.data.0.id', $owned->id)
    ->assertJsonPath('data.data.0.days_until_purge', 30)
    ->assertJsonMissing(['id' => $otherCreatorItinerary->id]);

$this->actingAs($creator, 'api')
    ->postJson("/api/creator/itineraries/{$owned->id}/restore")
    ->assertOk()
    ->assertJsonPath('data.status', 'draft');
```

Assert another creator receives `404`, active records cannot be restored, and `GET ...?status=draft` returns creator Drafts while continuing to exclude Draft customer-saved copies.

Add unauthenticated `401`, authenticated non-creator `403` for creator mutations, and another creator's `404` tests. Create a linked edit Draft and prove it is absent from Draft/Trash results and cannot be restored or publication-requested by direct ID.

Extend the existing removal-request coverage: an owning creator may request removal from Draft, Rejected, or Approved; Pending, `edit_pending`, a linked edit draft, and a duplicate request return `422`; another creator's or a trashed itinerary returns `404`.

- [ ] **Step 2: Add failing publication-request tests**

Use `Mail::fake()` and create admin plus super-admin users. Assert an owned standalone Draft transitions to Pending, records `publication_requested_at`, creates one `Notification` per admin user, sends `ItinerarySubmittedAdminMail` to the configured mailbox, and cannot be requested twice. Approved, removal-requested, and duplicate publication requests return `422`; a trashed or another creator's Draft returns `404`.

- [ ] **Step 3: Run both files and verify missing behavior**

Run:

```bash
cd ../backend
php artisan test tests/Feature/Creator/CreatorItineraryTrashTest.php tests/Feature/Creator/CreatorItineraryPublishRequestTest.php
```

Expected: FAIL on missing filters/routes/notifications.

- [ ] **Step 4: Implement server-backed unified listing**

Validate:

```php
$validated = $request->validate([
    'view' => ['sometimes', Rule::in(['active', 'trash'])],
    'status' => ['sometimes', Rule::in(['draft'])],
    'page' => ['sometimes', 'integer', 'min:1'],
]);
```

For `view=trash`, use `Itinerary::onlyTrashed()->standaloneCreator()` scoped to `meta.creator_id = Auth::id()`. For active results, preserve customer copies but structure the ownership condition as two branches: customer-owned rows must not be Draft, while the creator-owned top-level branch applies `standaloneCreator()` and may include Draft. Apply `status=draft` only to that standalone creator branch. Linked edit drafts never appear as separate cards in Trash, Draft, or All; their progress remains represented by the approved parent's `draft_itinerary_id`. In the paginated collection transformer append:

```php
$purgeAt = $itinerary->deleted_at?->copy()->addDays(30);
$today = now(config('app.timezone'))->startOfDay();
$purgeDay = $purgeAt?->copy()->timezone(config('app.timezone'))->startOfDay();

return array_merge($itinerary->toArray(), [
    'purge_at' => $purgeAt?->toIso8601String(),
    'days_until_purge' => $purgeDay ? max(0, $today->diffInDays($purgeDay, false)) : null,
]);
```

Test a DST boundary in the configured timezone and the `30`, `1`, and `0` day labels.

- [ ] **Step 5: Implement creator mutations and routes**

Update `requestRemoval()` to scope by `creator_id=Auth::id()`, then pass that creator ID into the lifecycle service's locked `requestRemoval()` transition rather than updating metadata directly. Add `restore()` and `requestPublish()` methods with the same ownership pre-scope and pass `Auth::id()` into their service calls; the lifecycle service rechecks ownership, standalone status, and transition state under lock. Add routes inside the authenticated creator group:

```php
Route::post('/itineraries/{id}/restore', [CreatorItineraryController::class, 'restore']);
Route::post('/itineraries/{id}/request-publish', [CreatorItineraryController::class, 'requestPublish']);
```

Pass a service transaction callback that creates every admin/super-admin in-app notification before the publish transition commits. Send `ItinerarySubmittedAdminMail` after commit inside `try/catch`, logging failure without reverting status. If no admins exist, the transition still succeeds and the missing recipient condition is logged.

- [ ] **Step 6: Run tests and checkpoint**

Run both test files, Pint the controller/routes/tests, and run `git diff --check`. Expected: all focused creator tests PASS.

## Task 3: Replace admin hard deletion with Trash management

**Files:**

- Create: `../backend/app/Mail/ItineraryTrashedMail.php`
- Create: `../backend/resources/views/emails/itinerary-trashed.blade.php`
- Modify: `../backend/app/Http/Controllers/Admin/CreatorItineraryManagementController.php`
- Modify: `../backend/routes/api.php`
- Create: `../backend/tests/Feature/Admin/CreatorItineraryTrashAdminTest.php`

- [ ] **Step 1: Write failing admin lifecycle tests**

For both `admin` and `super_admin`, prove:

```php
$this->actingAs($admin, 'api')->deleteJson("/api/admin/creator-itineraries/{$itinerary->id}")
    ->assertOk()->assertJsonPath('message', 'Itinerary moved to Trash.');
$this->assertSoftDeleted('itineraries', ['id' => $itinerary->id]);

$this->actingAs($admin, 'api')->getJson('/api/admin/creator-itineraries?view=trash')
    ->assertOk()->assertJsonPath('data.data.0.id', $itinerary->id);

$this->actingAs($admin, 'api')->postJson("/api/admin/creator-itineraries/{$itinerary->id}/restore")
    ->assertOk()->assertJsonPath('data.status', 'draft');
```

Assert direct removal creates `itinerary_trashed` notification for the creator and sends `ItineraryTrashedMail`. Assert approving an existing creator removal request uses soft deletion, stays visible in both Trash endpoints, and retains `ItineraryRemovalApprovedMail`.

Add tests for direct `PUT /publish`, admin-only `DELETE /force`, missing/active/other-resource state failures, and rejection behavior: when `publication_requested_at` is non-null, rejection stores the optional reason and returns Draft; a normal initial Pending itinerary still becomes Rejected. Prove linked edit Drafts are excluded from every admin top-level listing and from Draft/Trash counts, cannot be directly published, and remain represented only through the parent itinerary's `draft_itinerary_id`. In the All-view assertion, require the approved parent ID to remain present while the linked draft ID is absent.

Add explicit unauthenticated `401`, customer/creator `403`, and positive admin/super-admin tests for restore, publish, direct Trash, and permanent deletion. Set `creator_id=null` on dedicated fixtures and prove Trash/removal approval/publish rejection/permanent purge complete without notification or mail exceptions; assert the skipped delivery is logged.

- [ ] **Step 2: Run the admin test and verify red**

Run: `cd ../backend && php artisan test tests/Feature/Admin/CreatorItineraryTrashAdminTest.php`

Expected: FAIL because current delete is physical and restore/publish/force routes are absent.

- [ ] **Step 3: Implement admin filters and mutations**

Update `index()` to validate `view=active|trash`, `status=draft|pending|approved|rejected`, and positive page. Apply `standaloneCreator()` to the base query for every admin top-level view—All, Pending, Approved, Rejected, Draft, and Trash—and to count queries so temporary edit drafts never appear as independent rows. Use `onlyTrashed()` only for Trash. Return `purge_at`, `days_until_purge`, `current_page`, `last_page`, `total`, and `trash_count` consistently.

Replace `destroy()` with lifecycle `trash()`. Add:

```php
public function restore(int $id): JsonResponse
public function publish(int $id): JsonResponse
public function forceDestroy(int $id): JsonResponse
```

Each pre-scopes authorization, then delegates state validation and mutation to the locked lifecycle service. Route existing `approve()`, `reject()`, `approveRemoval()`, `rejectRemoval()`, and the final status transition inside `updateAndApprove()` through the same service methods. Pass notification creation as the service's in-transaction callback so competing approve/reject/remove/publish calls cannot split status from notifications. `reject()` validates optional `reason`; the service returns a republish request to Draft with `publication_rejection_reason`, while retaining Rejected for a normal initial Pending submission.

Direct Draft publication and Pending approval must both create the existing `itinerary_approved` notification and send `ItineraryApprovedMail`. If the creator relation is missing, commit the lifecycle change, skip delivery, and log the missing-recipient condition. Apply the same null-safe rule to direct Trash, removal approval/rejection, and publication rejection.

- [ ] **Step 4: Add notification mail and routes**

`ItineraryTrashedMail` receives itinerary, creator, and purge date. The Blade view must state that an admin moved the itinerary to Trash, it is hidden from public view, it can be restored within 30 days, and the permanent-removal date.

Add admin routes before `/{id}` where route ordering could conflict:

```php
Route::post('/{id}/restore', [CreatorItineraryManagementController::class, 'restore']);
Route::put('/{id}/publish', [CreatorItineraryManagementController::class, 'publish']);
Route::delete('/{id}/force', [CreatorItineraryManagementController::class, 'forceDestroy']);
```

- [ ] **Step 5: Run related backend tests**

Run:

```bash
cd ../backend
php artisan test \
  tests/Feature/Admin/CreatorItineraryTrashAdminTest.php \
  tests/Feature/Creator/CreatorItineraryTrashTest.php \
  tests/Feature/Creator/CreatorItineraryPublishRequestTest.php \
  tests/Feature/CreatorPublicLeakTest.php
```

Expected: all selected tests PASS. Run Pint and `git diff --check`.

## Task 4: Enforce public/preview invisibility and scheduled purge

**Files:**

- Create: `../backend/app/Console/Commands/PruneTrashedCreatorItineraries.php`
- Modify: `../backend/routes/console.php`
- Create: `../backend/tests/Feature/PruneTrashedCreatorItinerariesTest.php`
- Modify: `../backend/tests/Feature/CreatorItineraryExploreIndexTest.php`
- Modify: `../backend/tests/Feature/Public/ItineraryEndpointTest.php`
- Modify: `../backend/app/Http/Controllers/Customer/WishlistController.php`
- Modify: `../backend/tests/Feature/Customer/WishlistTest.php`
- Modify: `../backend/app/Http/Controllers/Customer/CustomerItineraryController.php`
- Modify: `../backend/tests/Feature/Public/SearchEndpointTest.php`
- Modify: `../backend/tests/Feature/Public/CityEndpointTest.php`
- Modify: `../backend/app/Http/Controllers/Guest/PublicReviewController.php`
- Modify: `../backend/tests/Feature/Public/ReviewEndpointTest.php`

- [ ] **Step 1: Add failing public visibility tests**

Soft-delete a formerly Approved creator itinerary. Assert the city/public slug endpoint, creator explore detail, view-record endpoint, like endpoint, admin preview data endpoint, search, city listing, public review endpoint, customer wishlist listing, wishlist store, and booking endpoint all hide or reject it; assert it is absent from explore index. Restore it to Draft and repeat the public assertions to prove Draft remains private. Booking validation must resolve `Itinerary::approved()` through Eloquent rather than relying on raw `exists:itineraries,id`. Public review aggregate, count, and pagination queries must first join/resolve an active Approved itinerary; they must not fetch a page and filter inaccessible rows afterward.

- [ ] **Step 2: Add failing purge command tests**

Use `Carbon::setTestNow()` with itineraries trashed 29 days, exactly 30 days, and 31 days ago. Assert dry-run preserves all rows, `--execute` removes only rows at least 30 days old, active/restored rows are never removed, and a second run succeeds with zero additional deletions.

Build the expired fixture with availability, FAQs, schedules plus activity/transfer rows, pricing plus variations/blackouts, inclusions, media associations, SEO, categories, tags, attributes, addons, likes, package links, post tags, and wishlist entries. Attach both a non-order itinerary review (including review media) and an order-linked review. Assert itinerary-owned rows and the non-order review/media are removed. Also attach an order with payment, commission, emergency contact, and the order-linked review; assert those historical rows remain and continue to render from the order snapshot without becoming publicly discoverable by itinerary/review endpoints.

- [ ] **Step 3: Run tests and verify red**

Run:

```bash
cd ../backend
php artisan test tests/Feature/PruneTrashedCreatorItinerariesTest.php \
  tests/Feature/CreatorItineraryExploreIndexTest.php \
  tests/Feature/Public/ItineraryEndpointTest.php \
  tests/Feature/CreatorPublicLeakTest.php \
  tests/Feature/Customer/WishlistTest.php \
  tests/Feature/Public/SearchEndpointTest.php \
  tests/Feature/Public/CityEndpointTest.php \
  tests/Feature/Public/ReviewEndpointTest.php
```

Expected: purge tests FAIL because the command does not exist; any public leak test must fail until its query is corrected.

- [ ] **Step 4: Implement the command, cleanup policy, and schedule**

Use this signature:

```php
protected $signature = 'itineraries:prune-trash
                        {--execute : Permanently delete expired Trash items}
                        {--days=30 : Retention period in days}';
```

Reject `--days < 1`. Query `Itinerary::onlyTrashed()->standaloneCreator()->where('deleted_at', '<=', now()->subDays($days))`. In dry-run print count/IDs only. In execute mode, iterate IDs and call `CreatorItineraryLifecycleService::forceDelete($id, $cutoff)` so the service re-locks and rechecks `deleted_at` before deletion. Missing creator accounts do not exclude candidates. Before force-deleting the itinerary, delete only its non-order reviews (`order_id IS NULL`) and their review media; retain reviews with a non-null historical `order_id` along with the order/payment/commission/emergency records. Resolve the itinerary morph discriminator using the application's morph mapping/model convention rather than assuming an unverified string.

Schedule:

```php
Schedule::command('itineraries:prune-trash --execute --days=30')
    ->dailyAt('03:30')
    ->name('prune-creator-itinerary-trash')
    ->withoutOverlapping();
```

- [ ] **Step 5: Make any explicit public query corrections**

Do not add `withTrashed()` to public controllers. Audit home/tours search and city-list raw joins; if a query bypasses the model scope, add `whereNull('itineraries.deleted_at')` and Approved-status constraints. Filter wishlist index rows by resolving active Approved itinerary IDs before pagination so stale snapshots do not leak. Public itinerary-review queries must first resolve an active Approved itinerary before returning retained historical reviews. Admin preview continues to use the active default scope so trashed rows return `404`.

- [ ] **Step 6: Run the backend lifecycle suite**

Run all four new feature files, the catalog regression, both public files, wishlist tests, search tests, and city endpoint tests. Run Pint and `git diff --check`. Expected: PASS.

## Task 5: Add frontend query and mutation contracts

**Files:**

- Modify: `src/lib/actions/customerItineraries.js`
- Modify: `src/lib/actions/creatorItineraries.js`
- Modify: `src/lib/actions/__tests__/creatorItineraries.test.js`

- [ ] **Step 1: Write failing action tests**

Mock `getAuthApi` and `revalidatePath`. Assert exact requests:

```js
await getMyItineraries({ view: 'trash', status: '', page: 2 });
expect(api.get).toHaveBeenCalledWith('/api/customer/my-itineraries?view=trash&page=2');

await restoreCreatorItinerary(12);
expect(api.post).toHaveBeenCalledWith('/api/creator/itineraries/12/restore');

await requestCreatorItineraryPublish(12);
expect(api.post).toHaveBeenCalledWith('/api/creator/itineraries/12/request-publish');

await adminRestoreCreatorItinerary(12);
expect(api.post).toHaveBeenCalledWith('/api/admin/creator-itineraries/12/restore');

await adminPublishCreatorItinerary(12);
expect(api.put).toHaveBeenCalledWith('/api/admin/creator-itineraries/12/publish');

await adminPermanentlyDeleteCreatorItinerary(12);
expect(api.delete).toHaveBeenCalledWith('/api/admin/creator-itineraries/12/force');
```

Assert every successful mutation revalidates both creator and admin itinerary dashboard paths and every failure preserves the backend message.

- [ ] **Step 2: Run the action tests and verify missing exports**

Run: `npm test -- --runInBand src/lib/actions/__tests__/creatorItineraries.test.js`

Expected: FAIL because the new actions and filter object contract do not exist.

- [ ] **Step 3: Implement one mutation helper and the named actions**

Use a helper that gets the authenticated API, runs the supplied request, checks `res.data.success`, calls:

```js
revalidatePath('/dashboard/customer/my-itineraries');
revalidatePath('/dashboard/admin/creator-itineraries');
```

and returns `{ success, message, data }`. Add `view`, `status`, and `page` query serialization to customer and admin listing actions without emitting empty parameters.

- [ ] **Step 4: Run action tests, type-check, and lint**

Run:

```bash
npm test -- --runInBand src/lib/actions/__tests__/creatorItineraries.test.js
npm run type-check
npm run lint
git diff --check
```

Expected: all commands exit 0.

## Task 6: Build the creator Draft and Trash views

**Files:**

- Modify: `src/app/(dashboard)/dashboard/customer/my-itineraries/page.js`
- Modify: `src/app/(dashboard)/dashboard/customer/my-itineraries/MyItinerariesClientWrapper.jsx`
- Modify: `src/app/(dashboard)/dashboard/customer/my-itineraries/__tests__/page.test.jsx`
- Create: `src/app/(dashboard)/dashboard/customer/my-itineraries/__tests__/MyItinerariesClientWrapper.test.jsx`
- Modify: `src/app/(dashboard)/dashboard/customer/my-itineraries/[id]/edit/page.js`
- Modify: `src/app/components/Pages/FRONT_END/creator-itinerary-form/CreatorItineraryFormShell.jsx`
- Create: `src/app/components/Pages/FRONT_END/creator-itinerary-form/__tests__/CreatorItineraryFormShell.test.jsx`

- [ ] **Step 1: Write failing page and component tests**

Page tests pass awaited Next.js 16 search params and assert:

```js
await MyItinerariesPage({ searchParams: Promise.resolve({ view: 'trash', page: '2' }) });
expect(getMyItineraries).toHaveBeenCalledWith({ view: 'trash', status: '', page: 2 });
```

Component tests cover:

- tab order `All Itineraries`, `Drafts`, `Trash`;
- links encode `?status=draft` and `?view=trash`;
- Trash cards show `Permanently removed in 18 days` or final-day copy;
- Trash has Restore but no View, Preview, edit, removal, or publish action;
- restoring calls the action and refreshes;
- standalone Draft has `Request publish` and an edit link;
- pending publication shows `Pending approval` without another request button;
- non-creator customer cards keep their existing behavior.
- empty Draft and Trash responses still render all three tabs and their view-specific empty state.

Form tests cover `draft_mode=edit` using the existing `submitDraft()` transition to `edit_pending`, while `draft_mode=standalone` saves with `updateDraft()` and returns to the Draft dashboard without calling `submitDraft()`.

- [ ] **Step 2: Run the tests and verify red**

Run:

```bash
npm test -- --runInBand \
  'src/app/(dashboard)/dashboard/customer/my-itineraries/__tests__/page.test.jsx' \
  'src/app/(dashboard)/dashboard/customer/my-itineraries/__tests__/MyItinerariesClientWrapper.test.jsx'
```

Expected: FAIL because the page ignores search params, Trash actions do not exist, and the form does not distinguish standalone from edit Drafts.

- [ ] **Step 3: Implement URL-driven server views**

Normalize search params:

```js
const params = await searchParams;
const view = params?.view === 'trash' ? 'trash' : 'active';
const status = view === 'active' && params?.status === 'draft' ? 'draft' : '';
const page = Math.max(1, Number.parseInt(params?.page ?? '1', 10) || 1);
const result = await getMyItineraries({ view, status, page });
```

Pass `activeView`, `activeStatus`, and pagination metadata into the client wrapper. Use `NavigationLink` for tabs and pagination so browser history and server rendering remain correct. Render the tab/navigation shell before any empty-result branch; only the result panel/card grid changes for an empty view.

- [ ] **Step 4: Implement creator card actions**

Keep existing removal dialogs for active itineraries. Add focused restore and publication confirmations. Trash rendering must never construct a public URL. Use API-supplied `days_until_purge`; do not recalculate with the browser clock.

After restore success, toast and navigate to `/dashboard/customer/my-itineraries?status=draft`. After request-publish success, toast and navigate to `/dashboard/customer/my-itineraries` so the Pending badge appears in All Itineraries. Call `router.refresh()` after each navigation-triggering mutation.

- [ ] **Step 5: Preserve standalone Draft editing**

Have `getDraft()` return `draft_mode: 'edit'` when another itinerary metadata row references this ID through `draft_itinerary_id`; otherwise return `draft_mode: 'standalone'`. The edit page passes that value into `CreatorItineraryFormShell`.

In the form shell, label the final action `Submit edit for review` for edit mode and retain the existing `updateDraft()` then `submitDraft()` flow. For standalone mode, label it `Save draft`, call only `updateDraft()`, and redirect to `/dashboard/customer/my-itineraries?status=draft`. Publication remains the explicit card action, so saving cannot accidentally set `edit_pending`.

- [ ] **Step 6: Run focused tests and frontend checkpoint**

Run the page, wrapper, and form-shell test files, `npm run type-check`, `npm run lint`, and `git diff --check`. Expected: PASS.

## Task 7: Build admin Draft and Trash management

**Files:**

- Modify: `src/app/(dashboard)/dashboard/admin/creator-itineraries/page.js`
- Modify: `src/app/(dashboard)/dashboard/admin/creator-itineraries/CreatorItinerariesClientWrapper.jsx`
- Create: `src/app/(dashboard)/dashboard/admin/creator-itineraries/__tests__/CreatorItinerariesClientWrapper.test.jsx`

- [ ] **Step 1: Write failing admin UI tests**

Cover URL-driven `All`, `Pending`, `Approved`, `Rejected`, `Draft`, and `Trash` tabs. Assert active rows use Remove (not permanent delete), Draft rows expose Publish, and Trash rows expose Restore and Delete permanently but no View/Preview/Edit/Approve actions. Assert destructive confirmation copy includes `cannot be recovered` and that successful actions refresh the current server view. Prove empty Draft and Trash responses still render the complete tab/navigation shell and the correct view-specific empty state. An All response fixture contains the parent itinerary only; assert no linked temporary draft row or accidental Publish action is rendered.

- [ ] **Step 2: Run the test and verify red**

Run:

```bash
npm test -- --runInBand \
  'src/app/(dashboard)/dashboard/admin/creator-itineraries/__tests__/CreatorItinerariesClientWrapper.test.jsx'
```

Expected: FAIL because current tabs filter client-side and current delete removes rows immediately.

- [ ] **Step 3: Implement admin server views and actions**

Normalize `view`, `status`, and `page` exactly as the creator page does, but allow all four active statuses plus Draft. Render tab links with `NavigationLink` and use server-returned rows rather than `Array.filter()`.

Use separate AlertDialogs for active Remove and Trash permanent deletion. Restore returns to Draft. Publish updates Draft to Approved. Keep the existing approve/reject/edit/removal-review controls only in valid active states.

- [ ] **Step 4: Run all focused frontend tests**

Run action, creator wrapper/page, and admin wrapper tests together, followed by type-check, lint, and `git diff --check`. Expected: PASS.

## Task 8: Full verification, review, deployment, and scheduler handoff

**Files:** All files changed in Tasks 1–7.

- [ ] **Step 1: Run complete affected backend verification**

Run:

```bash
cd ../backend
php artisan test \
  tests/Feature/Creator/CreatorItineraryTrashTest.php \
  tests/Feature/Creator/CreatorItineraryPublishRequestTest.php \
  tests/Feature/Admin/CreatorItineraryTrashAdminTest.php \
  tests/Feature/Admin/ItinerarySoftDeleteRegressionTest.php \
  tests/Feature/PruneTrashedCreatorItinerariesTest.php \
  tests/Feature/CreatorItineraryExploreIndexTest.php \
  tests/Feature/Public/ItineraryEndpointTest.php \
  tests/Feature/CreatorPublicLeakTest.php \
  tests/Feature/Customer/WishlistTest.php \
  tests/Feature/Public/SearchEndpointTest.php \
  tests/Feature/Public/CityEndpointTest.php \
  tests/Feature/Public/ReviewEndpointTest.php
php artisan route:list --path=creator-itineraries
php artisan schedule:list
vendor/bin/pint --test app database/migrations routes tests/Feature/Creator tests/Feature/Admin/CreatorItineraryTrashAdminTest.php tests/Feature/PruneTrashedCreatorItinerariesTest.php
git diff --check
```

Expected: tests and formatting pass; lifecycle routes and daily purge appear.

- [ ] **Step 2: Run complete affected frontend verification**

Run all focused Jest files, `npm run type-check`, `npm run lint`, `npm run build`, and `git diff --check`. Expected: all exit 0.

- [ ] **Step 3: Run mandatory code review and simplification gates**

Dispatch the required `code-reviewer` agent for spec compliance, authorization, public leaks, race conditions, permanent deletion safety, notification coverage, and UI state accuracy. Address every critical/major finding and re-review until approved. Invoke the available simplification guidance (`simplify` if installed; otherwise `karpathy-guidelines`) and rerun all affected verification after any change.

- [ ] **Step 4: Verify in the visible localhost browser**

Use named headed sessions for creator and admin. Manually authenticate without exposing credentials in commands. Verify creator removal request, admin approval to Trash, public `404`, both Trash lists, countdown, creator restore-to-Draft, request publish, admin approval, admin direct removal notification, admin restore/direct publish, and permanent-delete confirmation. Check mobile and desktop widths for tab wrapping and action accessibility.

- [ ] **Step 5: Commit and push only task files to both `main` branches**

Use exact-path staging after inspecting both worktrees. Commit backend lifecycle changes and frontend dashboard changes separately with concise Conventional Commit messages. Push backend `main`, then frontend `main`; do not include unrelated worktree changes.

- [ ] **Step 6: Stop at the production migration authorization checkpoint**

Do not run a production migration as part of local implementation verification. Report the exact migration and request separate user authorization for the production deployment operation. After that authorization and deployment health checks, run the migration through the approved Render process and verify `deleted_at`, `publication_requested_at`, and `publication_rejection_reason` exist before testing lifecycle mutations.

- [ ] **Step 7: Configure the external Render purge prerequisite only with approval**

The in-app scheduler entry alone does not execute on Render. The deployment prerequisite is a Render Cron Job using the backend repository and the same production environment, scheduled as `0 3 * * *`, with command:

```bash
php artisan itineraries:prune-trash --execute --days=30
```

Creating a Render Cron Job may add platform cost and mutates external infrastructure, so obtain explicit user approval before creating it. If approval is not given, deploy the feature but clearly state that automatic deletion is not live; admins can still use permanent deletion and the command can be run manually. After configuration, inspect the first successful job log before claiming the 30-day purge is active.

- [ ] **Step 8: Perform production smoke checks without destructive fixtures**

Verify authenticated creator/admin list endpoints, route availability, notification rendering, and public non-leak behavior using existing safe records. Do not trash or permanently delete production data solely for a smoke test.
