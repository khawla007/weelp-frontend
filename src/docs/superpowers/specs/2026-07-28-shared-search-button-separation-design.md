# Shared Search Button Separation Design

## What this change fixes

The shared activity and itinerary search panel currently joins its Search
button directly to the Guests field on desktop. The button also removes its
left-side corner radius at the `sm` breakpoint. Together, those styles make
the action appear fused to the final field on `/tours-experiences` and
`/search`.

## Approved design

The non-home search presentations will:

- keep an 8px gap between the Guests field and the Search button from the
  `sm` breakpoint upward;
- keep the Search button's existing 12px radius on all four corners;
- continue stacking fields with their existing spacing on mobile;
- use the same shared implementation on `/tours-experiences`, `/search`, and
  other non-home consumers.

The home-page presentation keeps its connected pill treatment unchanged.

## Implementation boundary

The change belongs in
`src/app/components/Pages/FRONT_END/shared/ActivityItinerarySearch.jsx`.
Spacing will be added to the non-home Search button wrapper instead of adding
gaps between every field. The non-home button will stop applying
`sm:rounded-l-none`.

No page-level duplicate styles, new component variants, API changes, query
changes, or search-behavior changes are needed.

## Verification

The shared component test will first reproduce the current styling and then
assert that:

- compact and results presentations use the 8px desktop separation;
- their Search buttons retain `rounded-xl` and no longer remove the left
  radius;
- the home presentation keeps its current connected treatment.

Visible-browser checks will cover `/tours-experiences` and `/search` at mobile
and desktop widths, including computed left/right corner radii, the 8px
desktop gap, keyboard focus, and horizontal overflow.
