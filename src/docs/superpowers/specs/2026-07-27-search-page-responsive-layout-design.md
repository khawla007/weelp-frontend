# Search Page Responsive Layout Design

## What this change fixes

The `/search` page currently places the shared discovery panel directly against
the edges of its sage band. On a phone, the permanently expanded filter rail
also pushes the first result well below the fold. The page should preserve the
same search behavior while restoring breathing room and making results the
primary mobile content.

## Considered approaches

1. **Inline collapsible filters (selected).** Keep the existing filter controls
   in the page, but hide them below `md` until the traveler opens a Filters
   control. This keeps state and accessibility simple, avoids a second overlay,
   and lets results appear immediately.
2. **Mobile filter sheet.** Move filters into a side or bottom sheet. This saves
   page height, but introduces another modal surface alongside the search
   popovers and requires more focus-management code.
3. **Always-expanded stacked filters.** Retain the current topology and only
   tighten spacing. This is the smallest change, but it does not solve the main
   mobile problem: travelers still scroll through the entire filter form before
   seeing results.

## Approved layout

The full-width search band remains sage. Its inner search component is centered
on the canonical page rail.

- Below `sm`, the band uses 16px horizontal and 24px vertical padding.
- At `sm` and above, the band uses the canonical page gutters and 40px vertical
  padding.
- The search fields keep their existing shared `results` presentation and
  behavior.

Below the result heading, one canonical container owns the toolbar, filters, and
results:

- Desktop (`md` and above) keeps the filter rail beside the results.
- Mobile places a Filters button and Sort control in one compact toolbar.
- Filters are closed by default on mobile and expand inline when requested.
- The Filters button exposes `aria-expanded` and `aria-controls`.
- Opening filters does not reset category, price, rating, location, sort, or
  fetched results.
- Results follow the toolbar immediately when filters are closed.

The existing desktop filter width, API calls, URL hydration, and result-card
behavior remain unchanged.

## Responsive details

- Mobile toolbar controls share the row and each receives enough width for a
  comfortable touch target.
- The expanded mobile filter panel uses the existing background, border, and
  radius vocabulary without adding a decorative shadow.
- Result cards remain full-width on narrow screens and flow into the existing
  multi-column behavior as space becomes available.
- No horizontal overflow is allowed at 320px, 375px, 768px, or 1280px.

## Verification

Automated tests will cover the responsive class contract, the mobile Filters
toggle, its ARIA state, and preservation of existing search behavior. Visible
headed-browser checks will cover the four target widths, confirm that the first
result is visible before the expanded filter form on mobile, and verify that
opening and closing filters does not disturb the search state.
