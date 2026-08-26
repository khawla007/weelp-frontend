# Canonical Product Item Card — Design

**Date:** 2026-08-26  
**Status:** Approved for implementation planning

## What this design changes

The richer product card currently owned by `/home-gold` becomes Weelp's canonical full product card. Activities, itineraries, packages, transfers, search results, city listings, similar experiences, and product carousels will share one implementation and one responsive layout.

Compact editorial cards remain unchanged. Blog cards and the AI Travel Buddy's compact cards keep their current structure because they communicate different content and do not need product pricing, attributes, or wishlist actions.

The existing `/home-gold` card is the visual source of truth. This work consolidates and corrects it; it does not invent a second design.

## Why the shared `ItemCard` owns it

The full and compact card variants already meet at `src/app/components/ui/item-card.jsx`. Moving the `/home-gold` treatment into the full variant updates existing product consumers without spreading a route-specific component across the site.

The alternatives were rejected for clear reasons:

- A new `ProductItemCard` would create another shared component and require unnecessary import migration.
- Reusing `GoldActivityCard` directly would leave route- and activity-specific naming in global product code.

After consolidation, `/home-gold` will use the shared product section and card path. This change will remove its duplicate card, wishlist button, and Top Activities section after their shared replacements have equivalent coverage.

## Visual and responsive behavior

The canonical full card keeps the existing `/home-gold` composition:

- inset media with a discount badge and wishlist control;
- title and genuine aggregate rating when available;
- optional short description and product attributes;
- genuine current and original pricing;
- the existing Explore treatment.

The report's mobile-height refinement will be handled by tightening only the media height and vertical gaps at the mobile breakpoint. The structure and information hierarchy will not change. The target is approximately 10–15% shorter than the current 435px card measured at the 390px viewport, without reducing readable type or removing content.

Product layouts will protect the richer card from becoming too narrow:

- one column on mobile;
- two columns on tablet;
- three to four columns on desktop;
- no five-column full-product grid.

The visible wishlist circle can remain 32px while its interactive target is at least 44px.

## Theme boundaries

The shared card uses the semantic `--weelp-card-border` token. Standard pages therefore keep their existing light and dark border colors. Dark `/home-gold` continues to resolve that same token to its route-scoped antique-gold edge.

The current special light card tint is removed. The card content beneath the image uses the normal page/card background on `/home-gold`, the main homepage, and every other product surface. No gold or tinted background will leak from `/home-gold` into standard routes.

Compact cards retain their existing styling.

## Navigation and wishlist semantics

The product detail link and wishlist button will be siblings inside the card article. The link owns the image and product content; the wishlist button is positioned over the media without becoming a descendant of the link.

This removes the current nested interactive control while preserving one clear detail-page link and one independent wishlist action. Keyboard focus, pointer interaction, and the visible focus ring must work for both controls.

The shared wishlist control keeps the existing behavior:

- guests are sent through the authentication modal and the save resumes after login;
- authenticated users can save or remove supported product types;
- pending and loading states prevent duplicate requests;
- success and failure feedback uses the existing toast pattern.

The wishlist control renders only when a valid supported product identity exists. Incomplete data does not produce a disabled decorative action.

## Product data contract

`mapProductToItemCard()` will remain the single adapter between API entities and the shared card. In addition to display strings, it will expose the raw values needed for trustworthy semantics and wishlist behavior:

- product type and identifier;
- slug and city slug;
- wishlist payload;
- numeric price and currency;
- numeric rating and review count;
- API-provided availability when present.

Discounts and original prices render only when supplied or legitimately calculated by the existing mapper from a real API discount percentage. The card itself must never invent a fallback discount or derive an original price.

Missing optional fields are omitted without substitute labels, blank semantic properties, or layout-breaking placeholders.

## Product and Offer markup

The shared full card exposes `Product` microdata when the required identity fields are present. Its nested semantic values use raw values rather than formatted display strings.

An `Offer` is emitted only when a valid numeric price and currency are both available. Currency is never hardcoded, and availability is included only when it comes from product data. A text value such as `Contact us` does not become an Offer price.

`AggregateRating` is emitted only when its rating and review count are valid numeric values. Display formatting such as `1.2K` is never used as a schema value.

`ItemList` is not part of the card component. Ordering belongs to a parent carousel or grid, and the same card is also used in filtered and paginated contexts where a card-level list declaration would be incorrect. Any parent-level list markup is a separate structured-data feature outside this change.

## Failure paths worth knowing

- A missing discount removes the badge.
- A missing original price removes the struck price.
- A missing rating or review count removes aggregate-rating markup.
- Missing attributes or description collapse cleanly without reserving empty space.
- An invalid wishlist identity removes the wishlist control.
- Wishlist API failures leave navigation intact and surface the existing destructive toast.
- Product card rendering must not depend on wishlist data finishing successfully.

## Verification

Automated coverage will include:

- mapper display and raw semantic fields;
- genuine discount and original-price handling with no fallback claims;
- valid and invalid Product, Offer, and AggregateRating markup;
- sibling link and wishlist-button semantics;
- valid and incomplete wishlist identities;
- unchanged compact-card rendering;
- `/` and `/home-gold` using the shared product-card path;
- removal of the duplicated gold-only product components;
- responsive layout contracts that prevent five-column full-product grids.

Visible localhost verification will cover the main homepage, `/home-gold`, a city listing, and another full-product grid at desktop, tablet, and 390px mobile widths. Light and dark themes will be checked for background parity, standard versus route-scoped borders, overflow, hover, keyboard focus, wishlist behavior, and detail navigation.

Type checking, linting, focused tests, and the production build must pass before the code-review and simplify gates.

## Outside this change

- Redesigning compact blog or AI cards.
- Inventing new product content or pricing.
- Adding parent-level `ItemList` structured data.
- Changing wishlist API behavior or authentication policy.
- Restyling unrelated cards that do not use the shared full `ItemCard` variant.
