# Order trash and pagination design

## Why this change is needed

The admin orders page currently shows an empty page-number input when the API returns three or fewer orders. The page is still page 1, but the API omits its pagination fields for small result sets and the frontend replaces the missing values with empty strings. That makes a valid first page look broken.

Deleting an order is also immediate. The current endpoint calls `delete()` on a model without Laravel soft deletes, so administrators have no recovery path.

This change gives the orders list a consistent pagination contract and introduces a WordPress-style trash workflow. Both `admin` and `super_admin` users may move orders to Trash, restore them, and permanently delete them from Trash.

## What the administrator sees

The existing orders page gains `All` and `Trash` view controls above the table. `All` is the default and lists active orders. `Trash` lists only soft-deleted orders. Switching views resets pagination to page 1 and refetches the selected dataset.

In the active view, the existing trash action becomes **Move to Trash**. A confirmation dialog explains that the order can be restored later. After success, the order disappears from the active list and a toast confirms the move.

In the Trash view, each row provides two named actions:

- **Restore** returns the order to the active list.
- **Delete permanently** opens a stronger confirmation dialog and then irreversibly removes the order and database records that already cascade from it.

Both actions disable while their request is running. Failures leave the row in place and show the backend message when one is available.

The page-number input always displays a valid number. On the first page it displays `1`, including when the current view contains zero orders or fewer than one full page.

## Backend behavior

Add a nullable `deleted_at` column to `orders` and enable Laravel's `SoftDeletes` trait on `Order`.

`GET /api/admin/orders` accepts a `view` query parameter:

- missing or `active`: query active orders using Laravel's default soft-delete scope;
- `trash`: query `Order::onlyTrashed()`.

The endpoint always paginates, even for zero or few results, and always returns `current_page`, `per_page`, `total`, and `last_page`. Page numbers below 1 are normalized to 1. If a requested page becomes empty after an action, the frontend moves to the preceding valid page and refetches once.

The response also includes `trash_count` so the Trash control can communicate whether recoverable orders exist. Existing order summary cards continue to count active orders only; moving an order to Trash must remove it from those totals, and restoring it must add it back.

The mutation endpoints are:

- `DELETE /api/admin/orders/{id}` — soft-delete an active order;
- `POST /api/admin/orders/{id}/restore` — restore a trashed order;
- `DELETE /api/admin/orders/{id}/force` — permanently delete a trashed order.

All three remain inside the existing authenticated admin route group, so both project admin roles can use them. Restore and permanent delete resolve records through `onlyTrashed()`; an active, missing, or already permanently deleted ID returns 404 instead of mutating an unintended record.

Permanent deletion uses `forceDelete()`. Existing database foreign keys cascade deletion of the order payment, emergency contact, and commission. Reviews keep their current nullable order reference behavior; this change does not broaden deletion into unrelated customer content.

## Frontend data flow

The orders page owns two pieces of server-query state: `page` and `view`. It serializes both into the existing SWR request. API response defaults use numeric values (`current_page: 1`, `per_page: 3`, `total: 0`, `last_page: 1`) rather than empty strings, providing defense in depth if an older or failed response lacks metadata.

The table receives the current view. It renders status editing only for active orders, because a trashed order should be restored before it is changed. Mutation helpers call the three backend endpoints, preserve useful backend error messages, and revalidate the orders route after success.

The shared pagination component remains generic. A focused regression test verifies that its controlled input displays `1`; the orders page/API tests verify that page 1 is actually supplied for small and empty result sets.

## Failure paths worth knowing

- Moving an already trashed order, restoring an active order, or permanently deleting an active order returns 404.
- A failed mutation does not optimistically remove the row.
- When the final row on a later page is moved, restored, or permanently deleted, the UI selects the previous valid page rather than leaving the administrator on an empty out-of-range page.
- Soft deletion preserves related data because the order row still exists. Permanent deletion follows the database's existing cascade rules.
- Invalid `view` values are rejected with validation status 422 instead of silently exposing a broader query.

## Verification

Backend feature tests cover active/trash isolation, complete pagination metadata for empty and small datasets, role access for both admin types, restore, permanent deletion, invalid-state 404 responses, and dependent-record preservation/removal.

Frontend tests cover the page-1 input value, view switching and page reset, active/trash row actions, confirmation behavior, success/error toasts, and last-row page fallback. After type-check, lint, and automated tests pass, the flow is exercised in the visible local browser at desktop and mobile widths.
