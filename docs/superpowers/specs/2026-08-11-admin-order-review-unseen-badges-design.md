# Admin Order and Review Unseen Badges Design

## What this feature does

The admin sidebar will show a numeric badge beside **Orders** and **Reviews** when records have arrived since the current admin last opened that list. The state is personal to each admin: one admin opening Orders does not clear another admin's Orders badge.

Opening `/dashboard/admin/orders` clears only the Orders badge. Opening `/dashboard/admin/reviews` clears only the Reviews badge. Opening an individual record is not required because the list itself is the review surface.

The badges represent newly created records, not pending workflow status. Updating an existing order or review does not make it unseen again.

## Data model and baseline

The `users` table gains two nullable timestamps:

- `admin_orders_last_seen_at`
- `admin_reviews_last_seen_at`

Both columns use the migration time as their initial value. This prevents historical orders and reviews from appearing as new when the feature is deployed. New user rows also receive the database's current timestamp by default, so a newly created admin starts with an empty badge rather than every historical record.

The fields are cast as datetimes and made mass assignable on `App\Models\User`. They are kept on the user because the feature has exactly two fixed resources and uses one clear-all timestamp per resource. An item-level read table would add records without providing behavior the UI needs.

## Backend contract

Two routes live inside the existing authenticated admin route group:

```text
GET /api/admin/navigation-unseen-counts
PUT /api/admin/navigation-unseen-counts/{resource}/seen
```

The GET response is:

```json
{
  "data": {
    "orders": 3,
    "reviews": 1
  }
}
```

For each resource, the controller counts rows whose `created_at` is strictly later than the authenticated admin's matching last-seen timestamp. Soft-deleted orders are excluded by the normal `Order` query scope. Reviews have no soft-delete behavior and are counted normally.

The PUT route accepts only `orders` or `reviews` and an optional ISO-8601 `seen_through` value from the matching list response. It advances the matching timestamp to that value, or to the server's current time when the list is empty, and returns both counts in the same shape as GET. An unsupported resource or malformed timestamp returns Laravel's normal validation-style 422 response. Authentication and admin authorization continue to come from the enclosing `auth:api` and `admin` middleware.

The count and seen operations belong in a focused `Admin\NavigationUnseenController`; they do not modify the existing order or review list controllers.

## Frontend data flow

A focused `adminNavigationUnseen` service exposes fetch and mark-seen functions. A `useAdminNavigationUnseen` SWR hook owns the shared cache key, polls every 30 seconds, and returns normalized non-negative counts.

`AppSidebar` calls the hook once and passes the counts into `NavMain`. The Orders and Reviews navigation definitions gain a stable `notificationKey` (`orders` or `reviews`) so the rendering component does not infer behavior from translated titles or URLs.

`NavMain` renders a compact, high-contrast numeric badge for a notification-enabled leaf when its count is greater than zero. Zero renders no badge. Counts above 99 display as `99+` to prevent the badge from stretching the sidebar. The badge remains visible as a small counter when the desktop sidebar is collapsed and remains accessible through an `aria-label` containing the full count and resource name.

Each list page calls a reusable `useMarkAdminNavigationSeen(resource)` effect after mounting. The hook optimistically sets that resource's cached count to zero and sends the PUT request once for that page mount. On success it replaces the cache with the server response. On failure it revalidates the GET endpoint so the UI does not retain a false zero.

The mark-seen request is separate from list fetching. A failure to clear the badge must not prevent the admin from using the order or review list.

## Timing and concurrency

The server timestamp is authoritative. When a list opens, the PUT request records the time at which the admin checked the list. Records created after that timestamp appear on the next immediate revalidation or polling cycle.

There is a narrow case where a record can be created after the page's list request but before the seen request. The seen request could then classify that record as seen even though it was not in the first list response. To avoid this, the page sends the newest visible record's `created_at` as `seen_through` when available; the backend advances the timestamp only to that validated server-issued record timestamp. If the list is empty, the page sends no value and the backend uses the request time. The order and review list APIs must therefore expose full ISO-8601 `created_at` values for visible records.

The backend clamps `seen_through` to the current server time and never moves a last-seen timestamp backwards. A newly arriving record cannot be cleared by an older page response.

## Failure paths worth knowing

- If the count GET fails, the sidebar hides the badges and retries through SWR rather than blocking dashboard navigation.
- If marking seen fails, the optimistic zero is discarded by revalidation.
- If the authenticated user is not an admin, existing middleware rejects both endpoints.
- If one admin clears a badge, only that user's timestamp changes.
- If a new record arrives after clearing, polling restores the badge within about 30 seconds.

## Test coverage

Backend feature tests will prove:

- historical baseline records are not treated as unseen after migration semantics;
- orders and reviews created after each timestamp are counted independently;
- marking Orders does not clear Reviews;
- clearing is isolated per admin;
- invalid resources are rejected;
- unauthenticated and non-admin users cannot use the endpoints;
- `seen_through` cannot move the timestamp backwards or into the future.

Frontend tests will prove:

- Orders and Reviews render their own counts and hide zero counts;
- `99+` is used for large counts and the accessible label keeps the exact count;
- the shared hook uses a 30-second refresh interval;
- opening each list clears only its matching badge;
- a failed clear revalidates the cached counts;
- the existing navigation active and collapsed states continue to render correctly.

Visible verification will use the headed local browser at `http://localhost:3000`, with the local Laravel API at `http://localhost:8000/api`. The check will cover expanded and collapsed desktop navigation plus the mobile dashboard sidebar.

## Out of scope

This feature does not add push notifications, email, WebSockets, per-row unread markers, sound, or workflow-status badges. It does not reuse or alter the customer notification bell.
