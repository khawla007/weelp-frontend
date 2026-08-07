# Customer Review Loading and Actions Design

## Why this change is needed

The customer reviews page currently replaces its content with a centered spinner during the first request. This differs from the customer bookings page, where card-shaped skeletons keep the layout stable and communicate what is loading. Review deletion also happens immediately when the trash icon is selected, leaving no chance to cancel an accidental action.

The edit link reaches the correct route, but two server-side boundaries are wrong. The dynamic review page reads `params` synchronously even though Next.js 16 supplies route parameters asynchronously, and the single-review service uses the browser `authApi` instance from a Server Component. Together these produce an undefined ID first and then an unauthenticated Laravel request, both of which fall through to the customer not-found screen.

## What the customer sees

While reviews load, the page keeps its title, description, sage content surface, and responsive card grid visible. Six skeleton cards fill the grid, matching the review card's header rows, divider, review panel, and two footer actions. The skeletons use the same responsive columns and spacing as loaded reviews, so the page does not jump when data arrives.

Selecting the trash action opens a confirmation dialog instead of deleting immediately. The dialog asks whether the customer is sure they want to remove the review and explains that the action cannot be undone. **Cancel** closes the dialog without making a request. **Remove** performs the existing delete action, remains disabled while that request is pending, and refreshes the list only after success.

The dialog follows the project's existing alert-dialog and button patterns. In light mode, **Remove** uses the destructive red treatment. In dark mode, it uses the same restrained button treatment as the other dashboard dialogs while preserving clear text contrast and focus states.

Selecting the edit action opens `/dashboard/customer/reviews/{id}` with the requested review loaded into the existing edit form. The successful edit behavior remains unchanged; this work fixes the not-found route failure rather than redesigning form submission.

## Frontend structure

A focused `ReviewCardSkeleton` component mirrors `UserDashboardReviewCard` and uses the shared `Skeleton`, `Card`, and `Separator` primitives. The reviews page renders six instances inside the same grid classes used by `CustomerReviewList`, following the established booking skeleton pattern without coupling booking and review markup.

`CustomerReviewList` owns the confirmation dialog state: the selected review ID and whether deletion is pending. Each review card continues to report its ID through `onDelete`; the list opens one shared dialog and calls `deleteReviewCustomer` only from the confirmed action. Closing or cancelling clears the selected ID. A failed deletion leaves the review visible and keeps the existing destructive toast behavior.

The dynamic edit page awaits `params` before reading `id`, matching the other Next.js 16 dynamic dashboard pages. Its single-review service obtains the existing environment-aware authenticated API through `getAuthApi()`, which attaches the NextAuth bearer token during server rendering while preserving the browser path for client callers. The edit form and mutation behavior remain unchanged.

## Failure paths worth knowing

- Cancelling or dismissing the dialog sends no delete request.
- Repeated clicks cannot start concurrent deletion requests because **Remove** is disabled while pending.
- A failed delete keeps the card in the list and shows an error toast.
- A missing review ID still reaches the existing not-found state.
- A valid review ID is passed unchanged to the customer review service, and the service uses the authenticated server API rather than issuing an anonymous Laravel request.
- Empty and failed review-list states retain their current messages and do not render loading skeletons.

## Verification

Focused component tests cover the six review-shaped skeletons, opening and cancelling the confirmation dialog, confirming one deletion, the pending button state, successful list revalidation, and failed deletion behavior. Route and service regression tests verify that the awaited dynamic ID reaches `getSingleReviewByCustomer`, that the single-review request uses the environment-aware authenticated API, and that valid data renders the edit form.

After the focused tests pass, run the frontend type-check and lint commands. Finish with a visible local browser check of the customer reviews page in light and dark modes, confirming the loading layout, confirmation dialog, cancellation, and edit navigation.
