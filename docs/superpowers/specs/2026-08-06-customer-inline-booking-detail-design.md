# Customer Inline Booking Detail Design

## Goal

Replace the customer booking card's public-item redirect with a complete booking detail view rendered inside the existing bookings screen.

## User Experience

The customer remains on `/dashboard/customer`. Selecting **View Booking** replaces the filters, pagination, and booking grid with a full-width detail view inside the dashboard shell. **Back to bookings** clears the selection and restores the existing list state, including the active status filter, item-type filter, and pagination page.

The detail view contains:

- item image, item name, city, booking ID, and status;
- travel date, preferred time, adult count, and child count;
- payment amount, currency, and payment status;
- customer name, email, and phone;
- emergency-contact name, phone, and relationship;
- special requirements;
- existing review information and the current add/edit review action.

Missing optional values display as `Not provided`. The view does not link to the public item page and does not introduce cancellation or refund actions.

## Frontend Structure

`CustomerBookingsList` owns the selected booking ID. `BookingCard` receives an `onViewBooking` callback instead of constructing a public URL. When an ID is selected, a focused `CustomerBookingDetail` component replaces the list controls and grid.

A customer-order service and SWR hook request `/api/customer/userorders/{id}`. The detail component renders a stable skeleton while loading, a retryable error state with a persistent Back action, and the complete detail after success. Returning to the list does not reset or refetch the existing paginated list.

The detail layout uses the dashboard's existing semantic surfaces and restrained visual language. A compact heading row carries Back, title, ID, and status. An item summary leads into unframed responsive sections for trip details, payment, traveler details, emergency contact, special requirements, and review. Desktop uses two balanced columns where fields pair naturally; mobile collapses to one column without horizontal overflow.

## Backend Contract

Add `GET /api/customer/userorders/{id}` under the existing authenticated customer route group. The query must scope by the authenticated user's ID before resolving the order, so another customer's order returns `404` without disclosing its existence.

List and detail responses share one private order transformer in `UserProfileController`. The transformer loads payment, emergency contact, review, media, locations, and the polymorphic live item. Snapshot values remain authoritative for historical booking data, while missing snapshot name, slug, item type, city, and city slug fall back to the live orderable record. This supports older orders with incomplete snapshots.

The detail endpoint returns `{ success: true, order: ... }`. The order shape matches each object in the existing list response, with `created_at` added for the booking timestamp. No mutation endpoint is introduced.

## Failure Paths

- Unauthenticated requests continue to return `401` through the route middleware.
- Missing or non-owned booking IDs return `404`.
- A failed detail request shows a concise error, Retry, and Back to bookings.
- Missing optional API values render `Not provided` rather than breaking layout.
- A deleted live item still renders from its stored order snapshot where available.

## Verification

Frontend tests cover callback-based card selection, detail loading and error states, rendered booking sections, review action, and restoring the list after Back. Backend feature tests cover the successful detail contract, ownership isolation, unauthenticated access, and live fallbacks for incomplete legacy snapshots.

Before release, run the focused frontend tests, frontend type-check and lint, the backend customer order feature tests, PHP syntax checks, and a visible local browser pass across desktop and mobile widths.
