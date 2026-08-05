# Order Filtering and Search Design

## Why this change

The Orders dashboard currently exposes a text field labelled “Filter By status...”. That field applies a TanStack Table column filter only to the three orders already returned for the current API page. It cannot find matching orders on another page, and it does not give administrators a clear list of valid statuses.

This change replaces that interaction with one status control beside the All and Trash view buttons and one search field in the table toolbar. Both filters run through the backend query so the rows, totals, and pagination describe the full matching result set.

## What administrators will see

The existing `Order views` row will contain three controls:

- **All** selects active orders.
- **Trash (count)** selects soft-deleted orders.
- **All Status** opens a single-select status menu. After a choice, the trigger displays Pending, Confirmed, Completed, or Cancelled.

All and Trash remain mutually exclusive view buttons. The status control is an independent filter: its outline appearance matches the inactive Trash button, and a selected non-default status receives the filled button treatment so an active filter is visible at a glance. The menu exposes radio semantics, marks the selected option, and includes All Status for clearing the filter.

The table toolbar will contain one search input with the placeholder “Search by order number, customer, or item”. The Columns control remains aligned at the opposite edge. The old status text input is removed.

## Interaction behavior

Search is case-insensitive and matches any of these fields:

- the order ID, treated as the displayed order number;
- the related customer’s name;
- the related activity, package, itinerary, or other orderable item’s name.

Typing updates the API query after a 300 ms debounce. Status changes apply immediately. Either kind of filter change resets the page to one so a valid result page is always requested.

Search and status are page-level state and remain selected when the administrator switches between All and Trash. This makes it possible to compare the same filtered set across both views. The view switch itself also returns to page one. Clearing the search or choosing All Status removes only that filter and preserves the other one.

The query contract is:

```text
GET /api/admin/orders?page=<number>&view=<active|trash>&status=<status>&search=<text>
```

Empty `status` and `search` parameters are omitted. The frontend builds the query with `URLSearchParams`, so spaces and punctuation are encoded safely.

## Backend filtering

`OrderController::index` validates `status` against `pending`, `confirmed`, `completed`, and `cancelled`. It validates `search` as a bounded string, trims surrounding whitespace, and applies all active constraints to the same active-or-trashed Eloquent query before pagination.

The search predicate groups its alternatives so it cannot weaken the selected view or status constraint:

```text
status AND (order id OR customer name OR orderable name)
```

The order ID branch performs an exact numeric match when the trimmed search term is numeric. Customer and item names use escaped `LIKE` matching through their relationships. The existing summary cards and Trash count remain global, unfiltered metrics; only the list rows and pagination metadata reflect filters.

The backend’s current status filter omits `completed` even though completed orders are stored and included in summary metrics. This change aligns the listing filter with those real order states. It does not alter the separate status-update workflow.

## Frontend boundaries

The Orders page owns list query state because it also owns SWR fetching and API pagination. It passes the current search text and a change callback to `FilterOrdersPage`, while the status menu stays beside the page-level All/Trash controls.

`FilterOrdersPage` continues to own table rendering, column visibility, row actions, and the search input’s immediate display value. TanStack’s local `columnFilters` state and `getFilteredRowModel` are removed because the backend becomes the only list-filtering source. This avoids showing pagination totals that disagree with locally filtered rows.

The existing stale-refresh protection remains intact. A mutation may move the user back one page only when the same view, status, search, and page request is still current when the refresh resolves.

## Failure paths worth knowing

- Invalid status or malformed query values return Laravel validation errors rather than being silently ignored.
- A valid filter with no matches returns an empty page-one result with stable pagination metadata and the existing “No results.” table state.
- A request in flight may finish after the administrator changes a filter. SWR’s query-key isolation prevents the old response from replacing the newer filtered dataset.
- Search input remains responsive while a request is loading because the displayed text is local state; only the API-facing value is debounced.
- Failed Trash, Restore, permanent-delete, and status-update mutations keep their current toast behavior and do not clear filters.

## Regression coverage

Backend feature tests will cover:

- each supported status, including completed;
- invalid statuses;
- order ID, mixed-case customer-name, and mixed-case item-name search;
- combined status and search constraints;
- filtering within active and Trash views;
- filtered pagination metadata and stable empty results;
- preservation of global summary and Trash-count metrics.

Frontend tests will cover:

- default All, Trash, and All Status states;
- selecting and clearing a status;
- the 300 ms debounced search query;
- page-one resets after search, status, and view changes;
- retention of search and status across All/Trash switches;
- omission and encoding of query parameters;
- stale mutation fallback protection with the complete query state;
- removal of the old status text field and rendering of the new search field.

Visible-browser verification will exercise status-only, search-only, and combined filtering in both All and Trash views at desktop and narrow responsive widths. It will also confirm focus visibility, selected states, menu keyboard semantics, table empty state, and Columns alignment.

## Out of scope

- Changing the order status-update choices or business rules.
- Filtering summary cards or the Trash count.
- Adding date, amount, payment-status, or item-type filters.
- Changing the three-orders-per-page API setting.
- Persisting filters in the browser URL or across a full page reload.
