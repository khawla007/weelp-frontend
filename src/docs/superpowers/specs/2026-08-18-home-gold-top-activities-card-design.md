# Home Gold Top Activities Card Design

## Scope

This change redesigns only the activity cards inside the **Top activities** section on `/home-gold`. The standard `/home` route, the shared `ItemCard`, the shared `ProductSliderSection`, and cards in every other section remain unchanged.

The supplied `image copy 5.png` is the visual reference. The goal is to reproduce its complete card structure and content placement, not merely its border or surrounding carousel layout.

## Card structure

Each route-local activity card uses one large, full-bleed destination image inside a rounded outer frame. A discount badge and circular wishlist control sit over the image near the upper-left corner. An inset translucent information panel spans the lower portion of the image.

The panel contains:

- rating, review count, and activity category on the first row;
- the activity title as the main line;
- current price, crossed-out original price, and the `per person` qualifier;
- a rounded Explore action aligned to the lower-right.

The entire non-control card surface links to the activity detail page using its city-aware URL. The wishlist control remains independently operable and must not trigger card navigation. The Explore action communicates navigation visually while preserving valid, accessible link markup.

## Route isolation

`/home-gold` receives a route-local Top Activities section and route-local card component. These components may reuse lower-level utilities such as the carousel shell, section heading, image placeholder, mapping helpers, and wishlist data hooks, but no shared UI component will be edited to produce this design.

The `/home-gold` page will compose the same remaining homepage sections and data sources as `/home`. Only its Top Activities rendering path changes.

## Light and dark modes

Both modes keep the photographic card and dark translucent information panel so text stays readable over varied imagery. The surrounding border, shadow, control surfaces, focus rings, and muted text adapt to the active theme:

- light mode uses warm ivory surfaces and restrained cocoa shadows;
- dark mode uses deep green surfaces with muted gold borders and controls.

Neither mode relies on hover alone. Keyboard focus remains visible, and reduced-motion preferences disable image scaling.

## Responsive behavior

The existing carousel interaction and responsive slide count remain unchanged. Card internals scale within the available slide width: text clamps safely, pricing does not collide with Explore, and the bottom panel remains inset from the card edge. The redesign does not change the section heading, navigation arrows, carousel pagination, or section spacing.

## Data and fallbacks

Existing mapped activity fields provide the image, title, price, original price, rating, review count, discount, and city-aware link. Missing optional values are omitted without leaving empty separators. The category falls back to `Activity`, and the discount keeps the current Top Activities fallback when the API does not provide one.

The wishlist control uses the existing wishlist behavior for supported users and guest authentication flow. Unsupported authenticated roles do not receive a misleading control.

## Verification

Automated coverage confirms that `/home-gold` renders the route-local card structure and that the shared homepage rendering path remains untouched. Browser verification covers light and dark modes at desktop and mobile widths, including card navigation, wishlist interaction, focus visibility, content clamping, and carousel movement.
