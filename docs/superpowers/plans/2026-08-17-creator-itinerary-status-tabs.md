# Creator Itinerary Status Tabs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Under Review, Published, and Needs Changes filters to the creator's unified My Itineraries dashboard.

**Architecture:** Keep the URL as the filter source of truth and let Laravel filter before pagination. The customer endpoint will accept named status groups while preserving saved customer itineraries in the unfiltered All view; the Next.js page will allow only known groups and render matching links.

**Tech Stack:** Laravel 12/PHPUnit, Next.js 16/React 19, Jest/Testing Library

---

### Task 1: Backend status-group filters

**Files:**

- Modify: `../backend/app/Http/Controllers/Customer/CustomerItineraryController.php`
- Modify: `../backend/app/Services/CreatorItineraryLifecycleService.php`
- Test: `../backend/tests/Feature/Creator/CreatorItineraryStatusFilterTest.php`
- Test: `../backend/tests/Feature/Creator/CreatorItineraryPublishRequestTest.php`

- [ ] Add a feature test that creates owned and foreign creator itineraries in Draft, Pending, Approved, Rejected, and rejected-publication Draft states. Also create an owned Approved parent with a linked `edit_pending` draft, a foreign equivalent pair, and owned/foreign customer-saved copies.
- [ ] Assert All retains only the user's saved copy plus owned creator rows. Assert every named status group excludes saved copies and foreign rows.
- [ ] Assert `status=draft`, `under_review`, `published`, and `needs_changes` return the intended rows. Under Review returns an Approved parent with a linked `edit_pending` draft exactly once and never returns the linked draft; Published also retains that parent because its active version remains public.
- [ ] Add a publication-rejection test proving a missing reason stores `Changes requested by admin.` so a rejected publication remains distinguishable from a new Draft.
- [ ] Run `php artisan test tests/Feature/Creator/CreatorItineraryStatusFilterTest.php` and confirm validation/filter assertions fail because only `draft` is accepted.
- [ ] Update `rejectPublication()` to store the submitted reason or the fallback `Changes requested by admin.` when a publication request returns to Draft; ordinary rejected itinerary behavior remains unchanged.
- [ ] Extend request validation to accept `draft`, `under_review`, `published`, and `needs_changes`. Apply group predicates inside the owned standalone-creator query:

```php
match ($status) {
    'draft' => $meta->where('status', 'draft')->whereNull('publication_rejection_reason'),
    'under_review' => $meta->where('status', 'pending'),
    'published' => $meta->where('status', 'approved'),
    'needs_changes' => $meta->where(fn ($state) => $state
        ->where('status', 'rejected')
        ->orWhere(fn ($draft) => $draft
            ->where('status', 'draft')
            ->whereNotNull('publication_rejection_reason'))),
};
```

- [ ] Also treat an Approved parent whose linked draft has `edit_pending` status as Under Review, without returning the linked draft as a separate card. This overlap with Published is intentional because the approved parent remains public during edit review.
- [ ] Re-run the focused status-filter and publication-request backend tests and confirm they pass.

### Task 2: Frontend tabs and URL handling

**Files:**

- Modify: `src/app/(dashboard)/dashboard/customer/my-itineraries/page.js`
- Modify: `src/app/(dashboard)/dashboard/customer/my-itineraries/MyItinerariesClientWrapper.jsx`
- Test: `src/app/(dashboard)/dashboard/customer/my-itineraries/__tests__/page.test.jsx`
- Test: `src/app/(dashboard)/dashboard/customer/my-itineraries/__tests__/MyItinerariesClientWrapper.test.jsx`

- [ ] Add failing tests asserting the creator sees links for `Under Review`, `Published`, and `Needs Changes`, each with the expected `status` query string, and that the selected group receives the active button variant.
- [ ] Add failing card tests proving Pending and Rejected creator rows do not show `View & Book`, while an Approved creator row and a customer-saved row still do.
- [ ] Add a failing page test asserting `status=under_review` is forwarded to `getMyItineraries`; unknown status values must normalize to the All view.
- [ ] Run both My Itineraries Jest files and confirm the new assertions fail for the missing tabs/status allowlist.
- [ ] Define the six tab descriptors outside the component and derive the active tab directly from `activeView`/`activeStatus`. Add these links:

```text
All Itineraries
Drafts
Under Review
Published
Needs Changes
Trash
```

- [ ] Allow the four named active status groups in `page.js`, leaving Trash controlled by `view=trash` and keeping pagination query parameters intact.
- [ ] Restrict creator-owned `View & Book` actions to Approved rows. Preserve the action for customer-saved copies, whose `status` metadata is intentionally absent.
- [ ] Re-run the focused frontend tests and confirm they pass.

### Task 3: Verification and delivery

**Files:**

- Verify only the files listed above and this plan.

- [ ] Run `php artisan test tests/Feature/Creator/CreatorItineraryStatusFilterTest.php tests/Feature/Creator/CreatorItineraryTrashTest.php`.
- [ ] Run the two focused Jest files, `npm run type-check`, `npm run lint`, and `npm run build`.
- [ ] Open `http://localhost:3000/dashboard/customer/my-itineraries` in the named visible headed browser and verify all six tabs, active states, and responsive wrapping.
- [ ] Complete code review and simplicity review, fix any blocking findings, commit the frontend and backend changes on each repository's `main`, and push both `main` branches.
