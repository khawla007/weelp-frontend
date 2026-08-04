# City Hero Dark-Mode Arrow Color

## What changes

The single city page hero includes two decorative SVGs at its lower-left edge: a large teal shape and a small arrow above it. In dark mode, the large shape remains solid `#588f7a`, while the arrow currently becomes white at 10% opacity and looks disconnected from the shape.

Only the small arrow on the city page will change. Its dark-mode color will become solid `#588f7a`, matching the large shape exactly. Light mode will keep its current appearance.

## Where the change lives

The city-specific styling stays in `src/app/components/Pages/FRONT_END/city/CityHeroBanner.jsx`. The shared `VectorArrow` SVG will not change, so no other page or component inherits the new color.

## Verification

A focused city hero test will assert that the arrow has the exact dark-mode teal class while the bottom vector remains unchanged. After the automated checks pass, the local Dubai city page will be opened in the existing visible browser session and checked in dark mode at desktop width.

Success means the arrow and bottom shape both render as `#588f7a` on the local single city page, with no light-mode or cross-page changes.
