# Customer booking status badge

## What changes

The customer dashboard booking list already receives each order's `status` from `GET /api/customer/userorders`, but `BookingCard` does not render it. Each booking card will display that existing order status as a compact badge near the booking ID. No backend or API change is required.

The badge represents `order.status` only. Payment state does not override the order status, so a cancelled order remains labelled `Cancelled` even when its payment is partially or fully refunded. An order whose own status is `refunded` is labelled `Refunded`.

## Presentation

The card uses the existing badge primitive with semantic, light- and dark-mode-safe styling:

- `pending`: amber
- `processing`: blue
- `completed`: green
- `cancelled`: red
- `refunded`: purple
- any future or unrecognised value: neutral

Labels are human-readable and derived safely from the status value. The badge remains compact, does not crowd the booking name or travel date, and wraps cleanly with the booking ID at narrow widths.

## Data flow and failure behavior

`CustomerBookingsList` continues passing the customer order index object directly to `BookingCard`. The card reads `bookingItem.status`; it makes no additional request and introduces no duplicate state.

If status is absent, the card omits the badge rather than displaying misleading text. If the API later returns a new non-empty status, the neutral fallback keeps that value visible.

## Verification

Focused component tests cover all five supported order statuses, readable label formatting, the neutral fallback, and the missing-status case. Existing booking-card behavior remains unchanged. Frontend type-check, lint, focused tests, and the required visible localhost browser verify the final result.
