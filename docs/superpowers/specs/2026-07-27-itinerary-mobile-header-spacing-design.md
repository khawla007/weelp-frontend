# Itinerary Mobile Header Spacing Design

## What is changing

On an itinerary detail page, the mobile gap between the sticky product tab bar and the row containing the `Itinerary` heading and customization action is currently 70px. That gap makes the two bars feel disconnected on a narrow screen.

Reduce this gap to 32px on viewports below the `md` breakpoint. Keep the existing 70px spacing from `md` upward.

## Where the spacing comes from

`SingleProductTabSection` owns the top padding on the first content section. The itinerary header and customization action are rendered inside that section by `ItineraryPanel`.

The change belongs on the `tab_1` section wrapper in `SingleProductTabSection.jsx`. No new component, state, or responsive JavaScript is needed.

## Intended behavior

- Mobile view uses 32px between the bottom of the product tab bar and the itinerary heading/action row.
- Tablet and desktop view retain the current 70px gap.
- The tab bar, itinerary header row, and desktop sticky offsets remain unchanged.
- Horizontal padding, day navigation, schedule cards, and customization behavior remain unchanged.
- Activity and package detail pages keep their existing spacing; the narrower mobile spacing applies only when `productType` is `itinerary`.

## Verification

Add a component test that confirms the itinerary first-section wrapper has the mobile 32px class and the `md` 70px class. Confirm activity rendering retains its current 70px class.

Run the focused single-product tests, type-check, lint, and inspect the provided itinerary at a 390px visible-browser viewport. The measured gap should be 32px, with no overlap between the product tab bar and the itinerary header row.
