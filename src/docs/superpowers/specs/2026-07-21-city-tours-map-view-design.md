# City Tours Map View Design

## What this covers

The `View on Map` button in the city tours section should become a same-page view toggle. When someone clicks it, the `Dubai Tours` grid changes into a map-led layout that still keeps the current filtered tours visible.

This keeps the user in context. They are already comparing tours, so opening a separate route or a full-screen takeover would make the browsing flow heavier than it needs to be.

## The experience

The button toggles between `View on Map` and `View as List`.

In map mode, the section shows:

- a MapLibre map focused on the current city
- pins for the current page of tours
- a compact tour list beside the map on desktop and below it on mobile
- pin popups with title, rating, price, and a `View details` link
- the same pagination, tag filtering, and sort controls already used by the section

If the API does not provide real item coordinates, the first version should still work. It should center on the city and spread the visible tour pins around that center so users can understand that they are viewing city-level tour results. When real coordinates arrive later, the mapping helper can prefer item coordinates without changing the public component API.

## Data shape

`SharedToursSection` already receives the city slug and fetches visible itineraries. The map view should derive card props from the same `mapProductToItemCard()` helper used by the list grid.

The city page should pass a small `cityCoordinates` prop from `citydata.location_details` into `SharedToursSection`. Region or other future consumers can omit that prop; omitted coordinates fall back to a known city constant only when the slug is recognized.

For map coordinates, the frontend should normalize each item in this order:

1. item latitude/longitude fields when present
2. first location latitude/longitude when present
3. city fallback coordinates when available
4. Dubai fallback coordinates for the current Dubai page

Fallback coordinates should be offset per item so multiple cards do not sit on the same pin.

## Components

Create a focused `ToursMapView` client component near `SharedToursSection`. It owns MapLibre rendering and popup behavior. `SharedToursSection` owns fetching, filtering, sorting, pagination, and the list/map toggle state.

MapLibre popups are DOM nodes outside React. The popup `View details` action can use a plain anchor that points at the same full city URL produced by `mapProductToItemCard()`. The compact list inside React can use the existing `NavigationLink` component if it accepts the same link shape in this area; otherwise it should use the same link pattern as nearby `ItemCard` usage.

This keeps the map dependency out of the existing product card and avoids making `ItemCard` responsible for map-specific behavior.

## Empty and failure states

If there are no cards after filtering, the existing empty state remains.

If MapLibre or WebGL fails, the map panel should show a non-crashing fallback message and keep the tour list usable.

## Testing

Add focused tests for `SharedToursSection` that prove:

- the button toggles into map mode
- the button toggles back to list mode
- map mode renders the currently fetched tour titles

Mock `ToursMapView` in the section test so the test verifies section behavior without depending on WebGL. Add pure helper tests for coordinate precedence, numeric parsing, invalid coordinate rejection, and fallback offsets. Add one `ToursMapView` failure test to prove the fallback message appears while the compact tour list remains visible.
