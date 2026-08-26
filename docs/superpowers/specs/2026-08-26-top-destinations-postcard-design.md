# Top Destinations Postcard Design

## What this redesign changes

Weelp's shared city card will adopt the approved "Weelp Postcard" direction: one edge-to-edge destination photograph, a restrained bottom fade, city metadata in the lower-left corner, and a circular diagonal action in the lower-right corner. The result stays recognizably different from an activity product card while sharing its rounded geometry, border treatment, image-led hierarchy, and deliberate hover language.

The Top Destinations carousel will follow the same responsive card count as Top Activities. It will show one card at the smallest widths, two from the small/tablet breakpoints, three from the large breakpoint, and four from the extra-large breakpoint. This replaces the current fractional peeking layout and five-card desktop row.

## Where the design appears

`CityCard.jsx` remains the canonical destination card. Updating that shared boundary applies the approved design to:

- Top Destinations on the homepage and home-gold page.
- Trending Spots on Holiday and Tours & Experiences.
- Must Visit Cities on region pages.
- The All Cities results grid.

`BrowseDestinationsSection.jsx` remains the shared wrapper for every carousel surface listed above. Its breakpoint map will match `ProductSliderSection.jsx`. The All Cities page keeps its existing listing grid and filters; only the cards inside that grid receive the new visual treatment.

## Card composition

The whole card remains one `NavigationLink` to `/cities/[city-slug]`. Its image fills the card from edge to edge inside a clipped rounded frame. A dark gradient begins below the visual focal area and becomes strong enough at the bottom to keep white text readable across bright and dark photographs.

The lower-left content contains the city name and one compact subtitle. Existing subtitle modes remain supported:

- Activity count for destination and region contexts.
- Starting price for Tours & Experiences.
- Blog count for any existing consumer that requests it.

The lower-right action is a small circular glass-like control containing an `ArrowUpRight` icon. It is visually part of the link rather than a nested button, so the card preserves one clear interactive target and valid link semantics. The action remains visible without hover, making the destination affordance understandable on touch devices.

The card uses the existing responsive fixed-height approach so its photography stays comfortably sized when the carousel moves from one to four columns. The final dimensions will be tuned against the live section, with the approved visual companion as the reference: portrait-leaning at four-up desktop width without becoming excessively tall at the two-card tablet width.

## Visual behavior

The card uses Weelp's shared card border token and a restrained hover shadow. On pointer hover, the image scales slightly within its clipped frame and the circular action moves a few pixels diagonally. The motion is quieter than the product card because destination selection should feel editorial rather than transactional.

The title and subtitle remain white in both themes because they sit on the photographic gradient. Theme-specific text overrides are removed from the card API; light and dark modes instead rely on shared border, shadow, and focus tokens. This prevents light-colored text from becoming unreadable over photography in dark mode.

Keyboard focus produces a visible ring around the complete card. All transitions are disabled or reduced under `prefers-reduced-motion`.

## Responsive carousel behavior

The destination carousel will mirror the product carousel breakpoints and spacing:

| Viewport | Cards per view | Gap |
| --- | ---: | ---: |
| Base | 1 | Existing carousel default |
| 450px and above | 1 | 18px |
| 640px and above | 2 | 18px |
| 768px and above | 2 | 18px |
| 1024px and above | 3 | 18px |
| 1440px and above | 4 | 18px |

Mobile pagination and previous/next navigation continue to use the shared carousel behavior. No city data, routes, loading strategy, or backend endpoint changes are introduced.

## Failure paths worth knowing

The current image fallback remains in place so a missing city image does not collapse the card. Long city names and subtitles are constrained to the available lower content area rather than colliding with the action circle. A missing starting price continues to omit the price subtitle instead of inventing a value.

Zero activity counts remain truthful and visible. Singular and plural activity labels should be formatted correctly while the component is being touched.

## Verification

Component tests will cover the shared card link, city name, subtitle modes, arrow affordance, image fallback, and reduced-motion-friendly class behavior. Carousel tests will assert the four-card desktop breakpoint and the shared product-carousel spacing progression.

Verification then runs type-check, lint, focused Jest tests, and a visible headed-browser pass at `http://localhost:3000`. The browser pass checks Top Destinations beside Top Activities in light and dark themes, hover and keyboard focus, the four-card desktop row, tablet and mobile counts, touch-visible action affordance, and the same card on Holiday, Tours & Experiences, a region page, and All Cities.
