# Public Card System Design

## What this change covers

Weelp currently presents the same bookable item through several card components. The visual reference is the shared full `ItemCard` already used by the homepage **Top activities** section. This change makes that card the single public presentation for activities, itineraries, and packages across grids, carousels, filters, search results, recommendations, and creator listings.

Blogs use the same shared card shell with editorial content. Other public cards keep their existing structure but use the same outer corner radius. Dashboard and admin interfaces are outside this work.

## One shared product card

Every public activity, itinerary, and package card uses the full shared `ItemCard`. The rendered result stays identical wherever it appears:

- a `24px` rounded outer surface with the shared border, background, padding, height, hover shadow, and focus treatment;
- a `16px` rounded responsive image frame with the same image motion;
- the existing title, rating, short description, attributes, price, Explore treatment, and wishlist control when valid data exists;
- city-aware public URLs built through the existing mapping utility;
- omission of unavailable optional data without invented values or empty separators.

Page-level sections own only layout concerns such as grid versus carousel, section headings, pagination, and navigation. They do not restyle the card.

## Blog composition

Blog cards use the shared `ItemCard` component and the same outer shell, image frame, card height, border, interaction, and focus behavior as product cards. Their content is intentionally editorial and contains only:

- featured image;
- category;
- blog title.

Blog cards do not render product pricing, ratings, attributes, discount badges, wishlists, or descriptions. The full card links to `/blogs/[slug]`. The shared component exposes an explicit editorial composition rather than inferring behavior from missing product props.

## Cards that keep their layout

The following public card families retain their current content, proportions, and interaction model:

- destination and city cards;
- testimonial and review cards;
- mini-cart and checkout cards;
- horizontal transfer-search result cards;
- supporting cards that are not activity, itinerary, package, or blog listings.

Their outer card radius matches the shared `ItemCard` radius of `24px`. A shared public-card radius token or utility is the source of truth so these components do not drift. Inner media and control radii remain component-specific unless they already use the shared `16px` image treatment.

## Scope boundaries

Dashboard and admin cards are unchanged. Booking-detail panels, forms, dialogs, statistic tiles, itinerary schedule-day panels, skeleton-only layout containers, and generic shadcn `Card` usage are not automatically converted into listing cards. They receive no visual changes unless they are one of the named public card families whose outer radius must match.

The migration covers active public routes and shared components. Clearly dead or unreachable legacy components are recorded during the audit but are not rewritten merely to increase migration counts.

## Component boundaries and data flow

The shared `ItemCard` owns the visual shell and explicit product/editorial compositions. Product API objects continue through `mapProductToItemCard`. Blog API objects use a dedicated blog mapper that provides only the fields accepted by the editorial composition.

Public pages and sections map raw data once, then pass normalized card props to the shared component. Duplicate product-card implementations are replaced at their active call sites instead of copying the shared Tailwind classes. Horizontal transfer cards and other excluded layouts consume only the shared radius source.

This keeps content decisions in mappers, card visuals in `ItemCard`, and collection layout in section or grid components.

## Responsive and accessible behavior

The shared card retains the current responsive image ratios and fixed breakpoint heights used by Top activities. Existing grids and carousels may choose how many cards are visible, but they cannot change the card's internal design.

Cards remain keyboard reachable with visible focus. Wishlist controls stay separate from the navigation link. Images retain meaningful alt text and responsive `sizes`. Reduced-motion preferences disable decorative image scaling. Blog cards expose a descriptive link name based on the blog title, while product cards retain their current Explore label and valid Product schema rules.

## Failure paths worth preserving

Missing optional product fields disappear cleanly. Invalid product routing identity does not create a broken flat URL or wishlist payload. Missing blog media uses the existing editorial fallback image, and a missing blog title uses the existing untitled fallback. Empty collections continue to render their current empty or fallback state.

The migration must not add product schema to blogs, destination cards, transfer results, cart cards, or testimonials.

## Verification

Automated tests cover:

- product and editorial `ItemCard` compositions;
- normalized product and blog mapping;
- every migrated active public call site;
- product URL, wishlist, schema, optional-data, and blog-content rules;
- the shared `24px` radius on public cards that keep their existing layout;
- exclusion of dashboard/admin card components from the radius migration.

After type-check, lint, and focused/full tests pass, visible-browser verification runs against `http://localhost:3000`. It checks representative desktop and mobile pages for the homepage, blogs, activity/package/itinerary listings, filters or search results, similar/recommended sections, destinations, transfers, testimonials, and cart/checkout. Light and dark modes are checked where the affected cards are visible.
