# Explore Creator Card Responsive Design

**Date:** 2026-08-10

## What this change improves

The Explore Creators feed currently presents each itinerary as a loose image followed by uncontained metadata. On a narrow screen, adjacent results do not have a strong visual boundary, and the near-square image ratio makes each result unnecessarily tall. Dark mode also applies the site-wide button border and green hover shadow to the heart control, even though the heart already has its own coral semantic color.

This change makes every result read as one card, reduces mobile scrolling, and gives the heart control a component-specific dark-mode treatment without changing its like behavior.

## Chosen direction

The selected direction is a complete card: the image, engagement row, title, and creator avatar sit inside one rounded surface with a visible theme-aware border. The card uses the existing background and border tokens so it remains distinct in both themes. A restrained lift and shadow provide pointer and keyboard feedback without turning the static state into a floating tile.

The image remains edge-to-edge within the card. It uses a landscape `4:3` ratio below the small breakpoint, then returns to the existing taller ratio when the grid gains additional columns. This makes the single-column mobile feed easier to scan while preserving the established desktop density.

## Card content and interaction

The content area receives consistent horizontal and bottom padding. Likes and views remain grouped in the engagement row. The title may occupy up to two lines on mobile so long names remain recognizable, while the creator avatar stays fixed-size and aligned to the title row.

The heart remains a real button with its current accessible label and optimistic update behavior. A dedicated component class excludes it from the global dark-mode button border, background, and generic green shadow. Hover and keyboard-focus feedback remain, using a soft shadow based on `--weelp-discount`, the same token that colors the heart. Reduced-motion users do not receive the lift animation.

## Mobile page layout

The filter area becomes a predictable mobile stack:

- Home, Trending, and the creator action remain grouped in a centered, wrapping action row.
- Sort and source dropdowns share a full-width two-column row where space allows and stack only at very narrow widths.
- Each dropdown fills its available column instead of using a fixed minimum width.
- The itinerary grid stays one column on mobile and retains the existing two-, three-, four-, and five-column breakpoints.

Touch controls keep a minimum 44-pixel target. Horizontal padding continues to come from `container-page`, preventing overflow and keeping the feed aligned with the rest of the site.

## Files and boundaries

The implementation is limited to the Explore Creators UI and its regression coverage:

- `src/app/components/Pages/FRONT_END/explore/CreatorItineraryCard.jsx`
- `src/app/components/Pages/FRONT_END/explore/SectionCreatorFilter.jsx`
- `src/app/globals.css` only if a narrowly scoped dark-mode exception is required
- Existing tests beside the Explore components

No API, server action, authentication, pagination, or data-shape changes are needed.

## Failure paths worth preserving

Failed like mutations continue to revert the optimistic state. Guests still open the authentication modal. Missing cover images and avatars retain their current fallbacks. Empty, loading, retry, and infinite-scroll states remain behaviorally unchanged while inheriting the revised responsive spacing.

## Verification

Regression tests will assert the complete card surface, responsive image classes, two-line title treatment, mobile filter sizing, and the heart's dedicated borderless/color-matched interaction class. Verification then runs the focused Jest tests, type-check, lint, and production build as appropriate. The visible headed browser is used at 390, 768, and 1280 pixels in light and dark themes to confirm containment, control wrapping, hover/focus treatment, and absence of horizontal overflow.
