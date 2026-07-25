# Transfers Mobile Responsive Design

## What this design changes

The `/transfers` page currently compresses pickup, destination, date, and
passengers into a short two-by-two control on narrow screens. Transfer result
cards also retain desktop-oriented horizontal layouts that leave too little
room for route details, extras, pricing, and actions.

This change gives the page a mobile-first layout while preserving its existing
live-search, pricing, cart, and desktop behavior.

## Search and hero layout

At widths below the existing `sm` breakpoint, the search control becomes one
rounded booking card:

1. Pickup uses a full-width row.
2. Destination uses a full-width row beneath it.
3. The swap control sits between the two location rows and keeps a 44px touch
   target.
4. Date and passengers share an equal two-column row beneath the locations.

The hero uses tighter horizontal padding, balanced vertical spacing, and
mobile typography that keeps the heading, supporting copy, and search card
comfortably visible without changing the desktop composition.

Location, date, time, and passenger popovers must fit inside a 320px viewport.
They retain the existing keyboard behavior, labels, live filtering, and touch
target sizes.

## Results on narrow screens

The results layer stays aligned with the search card and remains inside the
viewport. Its close control is easy to reach without extending beyond the
screen edge.

Each result card stacks its media and content on mobile. Route details,
benefits, extras, pricing, and the Select action use compact spacing without
removing information. Quantity controls retain at least 44px mobile touch
targets. The pricing/action footer can stack when needed so neither price nor
button is squeezed.

Tablet and desktop layouts keep their current horizontal presentation.

## Behavior that stays unchanged

- Searches still run automatically after location or passenger changes.
- Existing request debouncing and stale-response protection remain intact.
- Date, time, and passenger data continue to flow into result pricing.
- Selecting a transfer adds the same line item and extras to the mini cart.
- The desktop globe, reviews, FAQ, and desktop search proportions do not
  change.

## Failure paths worth knowing

Loading, no-results, and API-error states stay available inside the responsive
results panel. A failed request continues to produce an empty result set; this
work does not change API error semantics.

Long location, route, vehicle, price, and passenger labels must truncate or
wrap without horizontal page overflow.

## Verification

Component tests will cover the responsive class contract for the search,
results panel, and result cards while preserving existing touch-target tests.
The finished page will be checked in the visible browser at 320px, 390px,
tablet, and desktop widths, including open popovers and a rendered result
state.
