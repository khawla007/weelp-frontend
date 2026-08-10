# Review Helpful Votes Design

## What this change covers

The Helpful control on activity and itinerary review cards currently looks interactive but does nothing. This change turns it into a trustworthy signal: a signed-in traveler can say that another person's review helped with a booking decision, see the total response from other travelers, and withdraw that vote later.

Helpful is not a general reaction system. There is one positive vote type, one vote per account and review, and no public list of voters. The first release covers the shared single-product review section used by activity and itinerary pages. A future change may use the same data for a `Most helpful` sort, but that sort is outside this scope.

## The short version

Laravel stores each vote as its own record with a unique review-and-user pair. Public review responses include the aggregate count, while authenticated requests return the current user's state for the reviews visible on the page. The Next.js review card uses that state to render an accessible toggle, opens the existing authentication modal for guests, and updates the count immediately while the API request is in flight.

Review authors cannot mark their own reviews as helpful. Only approved reviews that still belong to a publicly available activity or itinerary accept votes.

## Why votes get their own table

A dedicated vote record preserves the two facts the feature needs: who voted and which review received the vote. A database uniqueness constraint prevents duplicate votes even when requests arrive together. It also makes removal, counting, account deletion, and later ranking queries straightforward.

Keeping voter IDs in a JSON column on `reviews` would move uniqueness and concurrency control into application code. Browser-only state would avoid backend work but would make the displayed count device-specific and easy to reset. Neither option produces a dependable signal.

## Data model

The backend adds a `review_helpful_votes` table.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | unsigned bigint | Primary key. |
| `review_id` | foreign key | References `reviews.id`; cascades on deletion. |
| `user_id` | foreign key | References `users.id`; cascades on deletion. |
| `created_at`, `updated_at` | timestamps | Retained for audit and future ranking work. |

A unique index on `(review_id, user_id)` is the final duplicate-vote boundary. `Review` exposes a `helpfulVotes` relationship, and the new vote model belongs to both its review and user.

Existing reviews begin with a count of zero. Removing a review or user removes dependent votes through the foreign keys.

## API behavior

Public activity and itinerary review payloads gain `helpful_count`. The value comes from an aggregate relationship count so the API does not load every voter record. Featured-review responses expose the same field because the same review may appear in both the featured carousel and all-reviews list.

Authenticated endpoints provide the current user's state and mutations:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/reviews/helpful-status?review_ids=1,2,3` | Return the approved, public review IDs marked helpful by the current user. |
| `PUT` | `/api/reviews/{review}/helpful` | Add the current user's helpful vote. |
| `DELETE` | `/api/reviews/{review}/helpful` | Remove the current user's helpful vote. |

Adding and removing are idempotent. Repeating `PUT` leaves one vote; repeating `DELETE` leaves none. Each mutation returns `review_id`, `helpful_count`, and `viewer_has_marked_helpful`, allowing the frontend to reconcile its optimistic state with the database.

Unauthenticated requests return `401`. A self-vote returns `422` with a user-facing message. A missing, unapproved, deleted, or non-public review returns `404` so private review existence is not disclosed. The status endpoint validates a bounded list of numeric IDs and silently omits inaccessible reviews.

The mutation service checks public eligibility inside the request. For an activity, the related activity must still be available through its public detail contract. For an itinerary, the itinerary must satisfy the existing `publiclyVisible()` scope. Authorization and visibility remain backend responsibilities even though the button only appears beside public API results.

## Frontend behavior

The existing shared `SingleProductReview` component continues to power both product types. Review transformation retains each API review's ID and helpful count. A focused Helpful button component owns the interaction state so pagination, filtering, image sliders, and review rendering do not absorb authentication and request logic.

On initial render, every visitor sees the persisted count. When a session is authenticated, one batched status request resolves the selected state for the review IDs already fetched. The status cache key includes those IDs and the current account context so one user's choices do not appear for another user.

The control renders as `Helpful` when the count is zero and `Helpful · N` when votes exist. `aria-pressed` exposes whether the current user voted, and the accessible label describes adding or removing the vote. The selected thumb uses the existing sage accent and a filled icon; the unselected state keeps the current muted treatment. A pending request disables only that review's control.

Click behavior follows these paths:

1. A guest opens the existing authentication modal. After successful sign-in, the original add-vote action runs once.
2. A signed-in non-author sees an immediate selected-state and count update. The client sends `PUT` when adding or `DELETE` when removing, then replaces the optimistic values with the server response.
3. A failed request restores the previous state and count, then shows a destructive toast with the API message or a short retry message.
4. A review author receives the backend self-vote message if stale or incomplete client data lets the request through. The frontend does not treat author IDs as an authorization boundary.

If the same review appears in more than one rendered location, the SWR-backed vote state is keyed by review ID so both controls converge on the mutation response. The initial implementation adds the interactive control only to the all-reviews cards, matching the current UI; featured cards have no Helpful control today.

## Concurrency and count accuracy

The unique index prevents two simultaneous add requests from creating two votes. Mutations use create-if-missing and delete-if-present semantics, then count from the database before responding. The UI never decrements below zero.

The public aggregate may be up to the existing SWR cache interval behind a just-completed mutation on another browser. The voting user's own page remains current because the mutation response updates the local state immediately. No real-time transport is added.

## Failure paths worth knowing

- If authentication expires between page load and click, the API returns `401`; the optimistic change rolls back and the user can sign in again.
- If a review becomes unapproved or its item becomes private after page load, mutation returns `404` and the card restores its prior state.
- If initial helpful-status loading fails, public counts still render and buttons remain usable. A later mutation response establishes the selected state for the clicked review.
- A duplicate request cannot inflate the count because the database and idempotent endpoint enforce the same invariant.
- Deleting a user or review cannot leave orphan vote rows because both foreign keys cascade.

## Verification

Backend feature tests cover authentication, public-review eligibility, activity and itinerary votes, self-vote rejection, repeated add/remove requests, unique-vote behavior, status filtering, aggregate counts, and cascading deletion.

Frontend tests cover review ID/count transformation, zero and non-zero labels, `aria-pressed`, guest authentication handoff, add/remove requests, per-review pending state, optimistic updates, rollback, toast feedback, and shared state when a review is rendered twice.

After focused tests, run the backend test suite affected by public reviews, frontend type-check, lint, and the single-product review tests. A visible localhost browser verifies add, remove, count persistence after reload, guest sign-in handoff, and self-vote rejection on both an activity and an itinerary page.
