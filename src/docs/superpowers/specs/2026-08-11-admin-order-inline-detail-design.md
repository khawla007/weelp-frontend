# Admin Order Inline Detail Design

## Why this change

The admin Orders index currently shows three records per API page. Its table gives emergency-contact information a full column but does not tell the team when an order arrived. The Actions column supports status changes and deletion, yet it has no View action.

An `/dashboard/admin/orders/[id]` route exists, but it renders an unfinished edit form and the index does not link to it. This change adds a purpose-built, read-only order detail experience inside the index page instead. Administrators can inspect the complete order without losing their list context, while retaining the one operational action they need there: changing the status of an active order.

## What administrators will see

The backend-owned Orders page size changes from three to five. The API response continues to provide `per_page`, so pagination renders from the server metadata rather than a separate frontend assumption.

The table replaces **EMERGENCY CONTACT** with **ORDER RECEIVED**. Each row formats its existing ISO `created_at` value as compact relative time:

- less than 60 seconds: `45s ago`;
- less than 60 minutes: `8m ago`;
- less than 24 hours: `3h ago`;
- less than 30 days: `4d ago`;
- less than 365 days: `2mo ago`, using completed 30-day units (so days 360–364 display `12mo ago`);
- 365 days or more: `1y ago`, using completed 365-day units.

Elapsed values use the largest completed unit. A future timestamp is clamped to `0s ago`; a missing or invalid timestamp displays `Not available`. A shared clock refreshes the five visible rows once per second so second-level values do not become stale while the page remains open.

The Actions column adds a labelled **View** button for active and trashed orders. Existing Trash, Restore, and permanent-delete actions remain available in their current views.

## Same-page interaction

Clicking View stores the selected order ID in the Orders page's local state. It does not navigate, change the URL, or reload the page.

The dashboard shell remains visible, but the Orders list area is replaced by the selected order detail. This replacement includes the list heading, statistics, All/Trash controls, status filter, search field, table, and pagination. A **Back to orders** button restores that list from the state it already owns:

- active or Trash view;
- selected status;
- search text;
- current API page;
- scroll position captured immediately before opening the detail.

`OrdersPage` stays mounted and retains its query state while its list children are replaced. After Back is clicked and the list renders again, the page restores the captured vertical scroll position.

A full page reload intentionally returns to the list because the selected order is not stored in the URL or browser storage.

## Detail layout

The approved layout is the visual companion's option A: a two-column overview on desktop and one stacked column at narrower widths.

The detail header contains:

- item name;
- order number;
- item type;
- compact received time;
- order status.

The wider left column contains Travel details and Special requirements. Travel details show the travel date, preferred time, adult count, and child count.

The right column contains three independently readable sections:

- Payment: effective amount, payment status, payment method, and custom amount when applicable.
- Customer: name, email, and phone.
- Emergency contact: name, phone, and relationship.

An absent optional value displays `Not provided`; the interface never renders empty labels, `undefined`, or `null`. Values are rendered as text, not trusted markup. Long names, email addresses, phone values, and requirements wrap within their section without causing horizontal page overflow.

## Status responsibility

An active order's status appears as a select control using the same supported choices as the index: `pending`, `processing`, `completed`, and `cancelled`. The control is disabled while its request is pending.

A successful change shows the existing success toast, refreshes the selected detail, and revalidates the cached list. Returning to the list therefore shows the same status. A failed change leaves the previous status selected and displays the existing destructive toast.

Trashed order details show a plain, read-only status. The frontend does not expose the status control for them, and the backend continues to reject updates because its update query does not include soft-deleted records. This rule receives explicit backend coverage rather than relying only on the hidden control.

## Fresh detail data

The table passes only the order ID to the detail view. The detail does not reuse the list row as its source of truth.

A dedicated admin detail hook requests a new authenticated frontend route handler at:

```text
GET /api/admin/orders/<id>
```

The route handler calls the existing Laravel admin detail endpoint with the server-side session. It preserves success, not-found, and authorization outcomes so the client can distinguish an unavailable order from a general request failure.

Laravel's `OrderController::show` continues to load the user, orderable item, payment, and emergency contact. It adds `created_at` to the formatted response and includes soft-deleted orders for this read-only operation. Active and trashed records therefore share one detail contract.

The existing `/dashboard/admin/orders/[id]` edit-form route is not used by this interaction. Repairing, replacing, or removing that unfinished editing workflow is outside this change.

## Loading and failure paths

While the fresh record loads, the detail area shows a skeleton with the Back button available. The skeleton follows the same two-column-to-one-column responsive structure as the finished content.

If the request fails or the order disappears after the list loaded, the detail area shows a short “We could not load this order” message with **Retry** and **Back to orders** actions. Retry revalidates the same order ID. Back always returns to the preserved list state.

If a status request fails, the detail stays open and usable. The control is re-enabled after the request settles, and no optimistic status is retained.

Opening a trashed record succeeds, but changing its status cannot be attempted from the detail interface. Restoring or permanently deleting it remains a list-level action in this scope.

## Component boundaries

`OrdersPage` owns list query state, selected order ID, captured scroll position, and the switch between list and detail. It passes `onViewOrder` into `FilterOrdersPage` and refreshes the list after a successful detail status change.

`FilterOrdersPage` continues to own table rendering and row actions. It replaces the emergency-contact column, renders the relative received value from `created_at`, and invokes `onViewOrder(id, { isTrashed })` from an accessible View button. It does not fetch detail data.

A focused `AdminOrderDetail` component owns fresh detail loading, presentation, Retry/Back actions, and active-order status changes. Small display helpers handle missing values, dates, counts, payment amounts, and compact relative time without coupling those rules to the page component.

The admin order hook owns the SWR detail key and exposes the loaded record, loading state, error, and mutation function. The frontend route handler remains the authentication boundary between the client component and Laravel.

## Regression coverage

Backend feature tests will verify:

- five orders and `per_page: 5` on a populated first page;
- stable newest-first ordering with five-row pagination;
- stable empty-result metadata with `per_page: 5`;
- active detail includes ISO `created_at` and all existing relations;
- trashed detail is readable;
- a trashed order still cannot be updated.

Frontend unit and component tests will verify:

- compact relative time at seconds, minutes, hours, days, months, and years boundaries;
- future, missing, and invalid timestamps;
- the shared clock updates rendered relative time;
- Order received replaces Emergency contact;
- active and Trash rows expose an accessible View action;
- clicking View swaps the list for a fresh detail request;
- Back restores view, filters, search, pagination, and captured scroll position;
- loading, not-found, general error, and Retry states;
- every approved detail field and its missing-value fallback;
- active status success and failure behavior;
- trashed status is read-only;
- desktop two-column and narrow one-column class behavior.

After code changes, focused Jest and Laravel feature tests run before the full frontend type-check and lint. Final verification uses the required visible headed browser on `http://localhost:3000/dashboard/admin/orders`, covering active and Trash views at desktop and responsive widths, keyboard access, status updates, Back behavior, and horizontal-overflow checks.

## Out of scope

- Making the detail bookmarkable or persisting it across reloads.
- Editing customer, travel, payment, or emergency-contact fields from the detail.
- Repairing or removing the existing `/dashboard/admin/orders/[id]` edit form.
- Adding new order statuses or changing existing status business rules.
- Moving Restore or permanent-delete actions into the detail.
- Adding new list filters or changing summary-card calculations.
