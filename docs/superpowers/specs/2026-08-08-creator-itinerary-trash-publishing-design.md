# Creator Itinerary Trash and Republishing Design

## What this change covers

Creator itineraries need a recoverable deletion lifecycle shared by creators and administrators. An approved creator removal request, or a direct admin removal, will move the itinerary to Trash instead of destroying its content. Trashed itineraries remain recoverable for 30 days, cannot be accessed through public or preview routes, and are then permanently removed automatically.

Restoration is deliberately conservative. Whether a creator or admin restores the itinerary, it returns as a private Draft. A creator must request publication and wait for admin approval. An admin may publish the restored Draft directly.

This design applies only to creator-owned itineraries. Customer-saved itinerary copies and admin-authored catalog itineraries keep their current behavior.

## Lifecycle

The itinerary record will use Laravel soft deletion as the Trash boundary. Its delegated metadata status remains the workflow state used by dashboards and approval actions.

| Action | Allowed actor | Starting state | Result |
|---|---|---|---|
| Request removal | Owning creator | Draft, Rejected, or Approved | State remains active; `removal_status` becomes `requested` |
| Approve removal | Admin | Removal requested | Itinerary is soft-deleted and enters Trash |
| Remove directly | Admin | Any active creator itinerary without an approval conflict | Itinerary is soft-deleted and enters Trash |
| Restore | Owning creator or admin | Trash | Soft deletion is cleared; status becomes Draft |
| Request publish | Owning creator | Standalone Draft | Status becomes Pending and admin review is created |
| Publish | Admin | Draft or Pending | Status becomes Approved and public access resumes |
| Reject publish request | Admin | Pending | Status returns to Draft with an optional rejection reason |
| Delete permanently | Admin or scheduled purge | Trash | Itinerary and dependent data are physically removed |

Removal and publication cannot be requested at the same time. A creator cannot request removal while an edit or publication review is pending. An admin must resolve that review before using the normal removal action. Existing edit drafts keep their current edit-approval workflow and never display the standalone `Request publish` action.

When an itinerary enters Trash, its previous public status does not survive restoration. Restore always clears removal metadata and produces a Draft. A second deletion starts a new 30-day retention window.

## Trash retention and permanent deletion

`deleted_at` records when the itinerary entered Trash. `purge_at` is derived as `deleted_at + 30 days`; it does not need a second database column.

Creator Trash responses expose `purge_at` and `days_until_purge`. Remaining days use calendar-day ceiling semantics so a newly trashed item shows 30 days and never displays a negative number. The creator card says, for example, `Permanently removed in 18 days`. On the final day it says `Scheduled for permanent removal today`.

Only admins receive a `Delete permanently` action. The confirmation explains that the itinerary, schedule, transfer/activity selections, pricing, media associations, SEO, and related records cannot be recovered.

A Laravel command permanently deletes creator itineraries whose `deleted_at` is at least 30 days old. The command is idempotent, supports a dry run for operational checks, and is scheduled once daily. Production must run Laravel's scheduler through its deployment configuration; application code alone must not imply that the scheduler is active.

Permanent deletion reuses one backend service for both the admin action and scheduled purge so relationship cleanup cannot diverge.

## Creator dashboard

The creator view gains a `Trash` tab immediately after `Drafts`. Active and Trash results come from server-filtered endpoints rather than filtering only the first client-side page.

Draft identification is based on the itinerary's own workflow status, not only the presence of a linked edit-draft ID. This ensures restored itineraries appear under Drafts.

Active cards retain their existing status badge and actions. An eligible standalone Draft displays `Continue editing` and `Request publish`. While a publication request is pending, the action is disabled and the card shows `Pending approval`.

Trash cards:

- show the itinerary name, image, deletion date, and remaining retention time;
- do not link to public pages or previews;
- expose only `Restore` to the owning creator;
- explain that restoration returns the itinerary to Draft and does not republish it.

Creator ownership is enforced by the backend on list and restore operations. Supplying another creator's itinerary ID returns `404`.

## Admin dashboard

The Creator Itineraries screen gains `Draft` and `Trash` tabs. Status and Trash filters are server-backed and paginated.

The active table continues to handle Pending approval, edit review, and removal review. Direct `Remove` replaces physical deletion and clearly states that the itinerary will remain recoverable for 30 days. A direct admin removal sends the creator both an email and an in-app notification.

The Trash table removes View and Preview actions. It exposes:

- `Restore to Draft`;
- `Delete permanently` with destructive confirmation;
- deletion date and scheduled purge date.

After an admin restores an itinerary, it moves to Draft. The Draft row offers `Publish` for direct admin publication. A creator may instead request publication, which moves the same itinerary into Pending for the existing approval dashboard flow.

## Publication requests and notifications

`Request publish` accepts only an owned, active, standalone Draft with no removal request. The transition to Pending and notification creation occur in one transaction.

Every admin and super-admin receives an in-app notification. The configured admin mailbox receives the existing creator-itinerary submission email, updated where necessary to describe a publication request. The Pending row then uses the existing approve/update-and-approve controls.

Approval sends the existing creator approval email and notification. Rejection sends the existing rejection communication with the optional reason, but returns this restored/requested itinerary to Draft so it can be edited and submitted again.

When an admin directly removes an itinerary, the creator receives a dedicated `Itinerary moved to Trash` email and in-app notification containing the itinerary ID, removal timestamp, and purge date. Approval of a creator's removal request uses the same Trash outcome and retains the existing removal-approved communication.

Automatic permanent deletion does not send another email. The 30-day countdown on the creator dashboard is the retention warning.

## Access and public visibility

Soft-deleted itineraries are excluded by Eloquent's global scope from public explore, city listing, search, wishlist, booking lookup, and slug-detail queries. Public detail requests for a trashed slug return `404` even when the itinerary was previously Approved.

Creator and admin preview routes also reject trashed itineraries. Trash management endpoints use `onlyTrashed()` and explicit role or ownership scopes; public controllers never use `withTrashed()`.

Restored Drafts remain excluded from every public listing and detail endpoint until an admin changes the status to Approved. Existing Approved-only query scopes remain the second visibility boundary after soft deletion.

## API shape

Creator management adds server-backed active/Trash filtering and mutations for restore and publication request. Admin management adds Trash filtering, restore, direct Draft publication, and permanent deletion.

Successful mutations return the resulting workflow status and a user-facing message. Invalid transitions return `422`; non-existent, non-owned, or inaccessible records return `404`; unauthenticated requests continue to return `401`.

Mutation endpoints lock the itinerary row during lifecycle transitions so simultaneous restore, publish, removal, and purge requests cannot produce conflicting states.

## Failure paths worth knowing

- Email failure is logged after the database transaction and does not roll back a completed lifecycle transition.
- A second restore, remove, publish request, or permanent-delete call returns a deterministic validation/not-found response rather than silently succeeding.
- The scheduled purge skips records restored after its candidate query by rechecking the locked row's `deleted_at` inside the deletion transaction.
- A missing creator account does not block admin Trash cleanup or the scheduled purge; notification delivery is skipped and logged.
- Linked edit drafts must be resolved before direct removal so unpublished edits are not silently discarded.

## Verification

Backend feature tests cover creator ownership, admin permissions, removal approval, direct admin removal, email and notification creation, Trash isolation, restore-to-Draft, publication request transitions, approval, rejection back to Draft, public `404`, preview `404`, permanent-delete authorization, relationship cleanup, 30-day boundary behavior, and purge idempotency.

Frontend tests cover creator Draft/Trash tabs, remaining-days copy, no View action in Trash, restore, Request publish, admin Draft/Trash tabs, direct removal, direct publication, permanent-delete confirmation, and refresh/error behavior.

After focused tests, run the complete affected backend suites, frontend type-check, lint, and production build. A visible localhost browser verifies the creator removal-to-Trash flow, creator restoration and publication request, admin review/publication, admin direct removal notification result, and public `404` behavior.
