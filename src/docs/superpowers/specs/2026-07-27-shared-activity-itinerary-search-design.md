# Shared Activity and Itinerary Search

## Why this change

Weelp currently has multiple search panels for the same activity-and-itinerary discovery journey. They look similar but do not share state, URL handling, or API behavior.

The duplication has produced two visible problems:

- `/tours-experiences` has an extra `From` field that the other discovery panels do not need.
- The search URL carries location, dates, and guest quantity to `/search`, but the panel on that page starts with blank/default values because it does not read those parameters.

The shared search should have one behavior contract everywhere while allowing the home page to keep its larger pill presentation.

## Scope

This design covers the public activity-and-itinerary discovery panels used by:

- The home hero
- `/tours-experiences`
- `/holiday`
- `/booking`
- The global header search modal
- `/search`

It does not cover blog search, creator search, transfer search, dashboard filters, or the booking controls on individual product pages.

## Search contract

Every shared panel will expose the same three inputs:

- `Where`: a city or region
- `When`: a start and end date
- `Guests`: adults, children, and infants, with at least one adult

Navigation to the results page will use one canonical query schema:

```text
/search?location=<slug>&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&quantity=<total>
```

The location value is the city or region slug. `quantity` is the combined adult, child, and infant count.

The shared parser will treat malformed or incomplete URL values safely:

- Unknown or absent locations leave `Where` unselected rather than selecting the first available location.
- Invalid dates are ignored.
- A reversed date range is ignored.
- Missing, invalid, or non-positive quantity falls back to one adult.

## Component architecture

The existing home `FilterBar` behavior will become the shared foundation because it already supports the intended fields, location slugs, accessible Radix popovers, activity-and-itinerary previews, and the `/homesearch` response shape.

The component will move from its home-specific folder into the shared public frontend area. Its state and event handling will remain centralized. Pages will select an explicit presentation component instead of maintaining separate search implementations:

- A home pill presentation keeps the current home layout and “Search escapes” action.
- A compact presentation serves `/tours-experiences`, `/holiday`, and `/booking`.
- A search-page presentation adds the inline Search button.
- A modal presentation adds the modal submit behavior and supports the existing close control.

These are explicit named variants around one behavior implementation. They will not introduce independent copies of location, calendar, guest, URL, or preview logic.

The old `ToursFilterBar` will be removed. The discovery responsibilities in the older `BookingForm` will be replaced by the shared component at the in-scope call sites. Specialized product booking forms remain unchanged.

## State and URL flow

Outside `/search`, the panel begins with an empty location and date range plus one adult. User actions update the shared form state. Preview requests and result navigation are derived from that state.

On `/search`, the panel reads the canonical query parameters during initialization:

1. Parse dates and quantity synchronously from the URL.
2. Match the location slug after the shared city/region list is available.
3. Populate both the form value and the visible location label.
4. Keep subsequent edits in the panel state.
5. Submit a new canonical URL when the user searches again.

The results listing continues to derive its filters from the URL. This makes the URL the handoff boundary between the panel and results rather than creating a second private copy of initial search values.

## API behavior

All in-scope panels will use `/homesearch`.

That endpoint already searches activities and itineraries by:

- Location
- Start and end date
- Quantity
- Additional result-page filters such as category, rating, price, and sort order

The separate `/toursearch` integration will no longer be used by the frontend search panel. Removing the `From` field also removes its only distinct frontend parameter.

This task does not remove the Laravel `/toursearch` endpoint because other consumers may exist outside the inspected frontend. Backend deletion would be a separate cleanup after usage is confirmed.

## Failure paths worth knowing

If city/region loading fails, the location list remains empty and the panel shows its existing no-match state. It must not silently choose a destination.

If a preview request fails, the panel shows no preview matches while preserving the user's selected filters.

If navigation contains invalid parameters, the panel falls back only for the invalid values and remains usable. It must not throw during render or hydration.

Rapid preview requests will continue to ignore stale responses so an older request cannot replace newer results.

## Accessibility and responsive behavior

The shared implementation will retain:

- Accessible labels for location, date, guest, and search controls
- Keyboard-operable Radix popovers
- Named guest increment and decrement buttons
- Visible focus treatment
- Reduced-motion fallbacks

The home page keeps its current pill design. Other routes use the compact treatment, stacked on small screens and connected horizontally where space permits. Popovers must remain within the viewport without introducing horizontal page overflow.

## Testing and verification

Component tests will cover:

- The shared field set never renders `From`.
- Each explicit presentation renders the intended controls.
- Location, dates, and quantity build the canonical search URL.
- Valid search parameters hydrate visible location, date, and guest values on `/search`.
- Invalid URL values use the documented fallbacks.
- Location matching works after asynchronous city/region loading.
- Preview calls use `/homesearch` parameters and stale responses remain ignored.

Integration tests will confirm the home, tours, holiday, booking, modal, and search-page call sites use the shared component without changing unrelated searches.

After type-check, lint, and targeted tests pass, a visible headed browser will verify the main flow from home and `/tours-experiences` into `/search`. The search page must display the same selected destination, dates, and guest total present in its URL. The in-scope routes will also be checked at 320px, 768px, and 1280px for layout, popover placement, focus behavior, and horizontal overflow.
