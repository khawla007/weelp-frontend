# Single-Item Booking Sidebar Design

## What this design fixes

The activity, itinerary, and package detail pages give most of the page width
and scroll length to descriptive content. That hierarchy is appropriate, but
the booking sidebar is taller than a typical desktop viewport. Its current
sticky positioning therefore stops helping once the user reaches reviews or
FAQs, leaving an empty right column and no visible cart action.

On mobile, the complete booking form follows all tab content. A customer can
travel several thousand pixels through reviews and FAQs before reaching the
price, date controls, or Select action.

This change keeps the informational column readable while making the booking
path available throughout product evaluation. It does not redesign pricing or
change what is added to the cart.

## The chosen layout

Desktop keeps a content-led split close to the existing 60/40 proportion. The
booking column becomes easier to use by reducing its oversized horizontal
padding rather than expanding it to half the page. Equal columns would make
itineraries and reviews harder to scan without solving the disappearing-action
problem.

The right column is divided into two responsibilities:

- a dedicated upper region where the compact booking card can remain sticky;
- a Questions card anchored by normal document flow at the bottom of the full
  right column, alongside the decorative artwork.

The sticky region ends before the Questions card. The booking card sits below
both the 66px site header and the 60px product tab bar, with a small breathing
gap, then releases at the bottom of that region. This prevents it from covering
Questions, Similar Experiences, or the footer.

Questions is not part of the sticky element and is not fixed or absolutely
positioned. It stays out of the initial sticky viewport and naturally becomes
visible when the page reaches the end of the longer left content column. Its
content remains above the right column's decorative background layer.

The card keeps the price, date and traveler controls, total, and primary cart
action visible. Detailed price calculations and available add-ons use inline
disclosure sections. They remain keyboard accessible and start collapsed when
their expanded content would make the card taller than the available viewport.
Selections and live totals remain visible after a section is collapsed.

The primary action continues to use the existing form submission and cart-edit
behavior. Its label remains Select, Update booking, or Show Cart according to
the current item state.

## Responsive booking access

Below the desktop two-column breakpoint, the compact booking card appears
before the long tab panels instead of after reviews and FAQs. The tab buttons
still navigate to their existing content sections.

A bottom booking bar appears once the initial booking card is no longer fully
available. It contains the current total or starting price and the same primary
action state used by the card. It respects the device safe area and leaves
enough bottom padding on the page that it cannot obscure the final controls.

When required booking details are incomplete, the bottom action brings the
inline booking card into view and focuses the first required control. When the
form is valid, it submits the existing form directly. The bar disappears while
the original primary action is visible, avoiding two competing calls to action.

This is an inline flow, not a modal or a second booking form. There remains one
React Hook Form state, one validation path, and one cart submission.

## Component responsibilities

`SingleProductTabSection` owns the responsive ordering, the two-column boundary,
and the space reserved for the mobile booking bar. Its existing product tabs
and section observation continue to work.

`ProductSidebar` owns the dedicated sticky region, compact card, bottom-aligned
Questions card, disclosure state, action visibility, and the mobile booking
bar. The existing price calculation, add-on selection, cart editing, help
context, and form provider stay in this component unless a small presentational
extraction makes the action summary easier to reuse.

`SingleProductForm` remains the source of date and traveler controls and keeps
its current form ID contract. Any new focus or scroll hook must expose behavior
without duplicating form state.

The Questions panel is a sibling after the sticky region, not a descendant of
the sticky card. Similar Experiences keeps its current responsive visibility
and ordering after the primary product content.

## Interaction and accessibility details

- Disclosure triggers expose expanded state and work with keyboard and touch.
- Existing controls keep at least 44px touch targets on narrow screens.
- The mobile bar uses the same computed total and cart status as the desktop
  action, so the two surfaces cannot disagree.
- Focus moves only after a customer asks to continue with incomplete data.
- Sticky and fixed elements respect reduced motion and do not animate layout
  properties.
- The desktop card must remain below the header and product tabs in both light
  and dark themes.
- The mobile bar must not cover calendars, traveler controls, toasts, the mini
  cart, or contextual help overlays.

## Behavior that stays unchanged

- Activity, itinerary, and package price calculations remain unchanged.
- Date ranges, traveler counts, add-ons, discounts, and live totals keep their
  existing data flow.
- Selecting an item still opens the mini cart, and editing a cart item still
  updates the existing entry.
- Product tabs, reviews, FAQs, itinerary editing, and Similar Experiences keep
  their current content and navigation behavior.
- No backend endpoint or response contract changes.

## Failure paths worth knowing

Very short desktop viewports must fall back to normal document flow rather than
introduce a nested scrolling sidebar. Long prices, translated labels, and add-on
names may wrap without pushing the action outside the card.

If JavaScript visibility observation is unavailable, the inline booking card
and its original submit action remain usable. The mobile bottom bar is an
enhancement, not the only route to the cart.

Validation errors continue to use the existing toast behavior and additionally
return the customer to the relevant inline control when the bottom action was
used.

## Verification

Component tests will cover desktop column sizing, sticky offsets, disclosure
behavior, responsive ordering, mobile action visibility, incomplete-form focus,
valid submission, cart editing, and Show Cart state.

The finished pages will be checked in the visible local browser for activity,
itinerary, and package routes at 320px, 390px, 768px, 1280px, and 1440px. The
desktop pass will scroll from Overview through Similar Experiences and confirm
that the action remains available, Questions appears only near the bottom of
the two-column region, and neither element overlaps the other or the footer.
The mobile pass will exercise date selection, travelers, add-ons, validation,
mini-cart opening, and safe-area spacing.
