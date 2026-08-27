# Public Card Corrections Design

## What this corrects

The public card migration introduced two presentation regressions. Editorial blog cards inherited the product card's breakpoint-specific fixed height even though their content is intentionally limited to image, category, and title. The AI Travel Buddy featured-activity carousel also changed from its compact two-card composition to a single full product card.

## Blog card behavior

Blog cards continue to use the shared editorial `ItemCard` composition, including the 24px outer radius, 16px image radius, border, padding, image ratio, hover behavior, and focus treatment. The editorial card no longer consumes `FEATURE_CARD_HEIGHT_CLASS`; its outer height is determined by its image and editorial content. Product cards keep their fixed responsive heights unchanged.

## AI Travel Buddy behavior

The Featured activities carousel restores two cards per slide at every breakpoint with 12px spacing. Each activity uses the existing explicit `product-compact` `ItemCard` composition and the previously established compact image sizing. The rendered content remains limited to image, category, and title; rating, description, attributes, price, Explore treatment, and wishlist controls do not appear.

## Scope and verification

No other product, blog, transfer, cart, testimonial, destination, or dashboard card changes. Focused tests lock natural editorial height, two-card carousel density, compact variant selection, and reduced content. Type-check, lint, focused tests, production build, and visible localhost verification cover the correction.
