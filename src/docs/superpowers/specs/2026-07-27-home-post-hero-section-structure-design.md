# Home-Style Post-Hero Section Structure

## Why this change

The home page renders each content section as a direct sibling after its hero. Each section owns its `container-page` width and section spacing, while the hero owns the gap between itself and the first content section.

Two public pages currently use a different structure:

- `/tours-experiences`
- `/holiday`

Both place `BrowseDestinationsSection` inside an extra full-width `div` with a tinted background and top spacing. This creates an additional DOM layer and extends the hero background into the content area. The approved direction is to make these pages follow the home page instead.

## What will change

`BrowseDestinationsSection` will become the direct sibling after the hero on both pages.

The hero components will receive the same responsive bottom margin used by the home hero:

```text
mb-10 sm:mb-16 lg:mb-24
```

The destination section will continue to own:

- `container-page`
- Its internal layout gap
- `pb-10 md:pb-16 lg:pb-24`
- Destination slider behavior and empty handling

The post-hero `bg-surface-tint` band and its wrapper-owned top padding will be removed. The normal page background will begin after the hero, matching the home page.

## Component boundaries

The one-use `TrendingSpots` and `TrendingSection` adapter components add only the wrapper and destination-section props. Once the wrapper is removed, the route pages can render `BrowseDestinationsSection` directly with their existing titles, subtitle modes, navigation prefixes, and city data.

This leaves each unit with one responsibility:

- The hero owns hero presentation and the gap after it.
- The route supplies destination-section content options.
- `BrowseDestinationsSection` owns the semantic content section, container, spacing, and carousel.

## Routes and files

The implementation will update:

- `src/app/(frontend)/tours-experiences/page.js`
- `src/app/(frontend)/holiday/page.js`
- `src/app/components/Pages/FRONT_END/tours/ToursHero.jsx`
- `src/app/components/Pages/FRONT_END/holiday/BannerSection.jsx`

The obsolete one-use adapters will be removed:

- `src/app/components/Pages/FRONT_END/tours/TrendingSpots.jsx`
- `src/app/components/Pages/FRONT_END/holiday/TrendingSection.jsx`

Existing hero and trending-section tests will be updated or replaced with route-structure tests that verify the public DOM contract.

## Behavior that must remain unchanged

- Featured city fetching and fallback behavior
- “Trending Spots” headings
- Price subtitles on `/tours-experiences`
- Activity-count subtitles on `/holiday`
- Slider navigation prefixes and controls
- Hero content, forms, animation, decorations, and desktop globe
- Destination section container width and bottom padding

## Verification

Automated tests will confirm:

- The hero and destination section are direct siblings.
- No generic wrapper `div` sits between them.
- Each hero owns `mb-10 sm:mb-16 lg:mb-24`.
- `BrowseDestinationsSection` receives the correct data and display props.

Visible-browser checks will cover both routes at 320px, 768px, and 1280px. They will confirm the normal page background begins immediately after the hero, spacing matches the home pattern, the carousel still works, and no horizontal overflow is introduced.
