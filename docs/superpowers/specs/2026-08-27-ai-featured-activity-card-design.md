# AI Featured Activity Card — Design

**Date:** 2026-08-27
**Status:** Approved for implementation planning

## What this design changes

The Featured activities slider inside Your AI Travel Buddy will look like a compact member of the same product-card family used by Top Activities. It will keep the smaller amount of content that suits the AI panel: the activity image, its category, and its name.

This is a visual alignment, not a second product-card implementation. The slider will continue to render through the shared `ItemCard` component and navigate through the existing city-aware activity URL.

## Why the shared card needs a product-compact variant

The shared `ItemCard` already owns two presentations: the full product card and a compact editorial card. The AI slider currently uses the editorial variant, which is also used by blog surfaces. Restyling that variant globally would change blog cards that are outside this request.

The shared component will therefore gain an explicit product-compact variant. This keeps the product relationship visible in the component API, preserves the existing blog design, and avoids creating an AI-only card component.

The rejected alternatives are:

- Reusing the full card unchanged, because its description, rating, attributes, price, action, and wishlist control do not fit the available space.
- Restyling the existing editorial compact variant, because that would unintentionally redesign blog cards.
- Creating a card inside `TravelBuddyWidget`, because that would duplicate shared product-card behavior and styling.

## Visual treatment

The product-compact card will reuse the full Top Activities card's visual language:

- the 24px outer radius and semantic `--weelp-card-border` border;
- the inset card padding and 16px media radius;
- the existing card hover shadow;
- the slower image zoom and reduced-motion behavior;
- the same focus-ring treatment;
- the full card's title rhythm, scaled down only where the compact footprint needs it.

The content area will contain a category label followed by a two-line activity name. It will not render a description, rating, price, attributes, Explore control, published date, or wishlist action.

The image height remains controlled by the AI slider so its two-card layout continues to fit inside the Travel Buddy panel. Existing carousel navigation and responsive slide counts remain unchanged.

## Data and navigation

`mapProductToItemCard()` remains the source of the image, activity name, category, and city-aware detail URL. The card will not infer or replace categories in the browser. If a category supplied by the API is inaccurate, that is a taxonomy-data issue rather than a card-rendering concern.

The complete card remains one link. Keyboard focus and pointer interaction should open the same activity route used today.

## Failure paths worth knowing

- A missing category removes the label without leaving an empty gap.
- A long activity name is limited to two lines.
- A missing or fallback image continues to use the mapper's existing image behavior.
- Reduced-motion users do not receive image zoom animation.
- Blog cards continue to use the existing editorial compact variant without visual changes.

## Verification

Automated coverage will prove that the product-compact variant uses the shared product visual contract, omits full-product and editorial-only content, retains link semantics, and does not change the existing compact blog variant.

Visible localhost verification will compare Top Activities and AI Featured activities in the required headed browser. Desktop and mobile widths will be checked for hierarchy, overflow, two-line titles, carousel navigation, hover, focus, and reduced-motion behavior.

Type checking, linting, focused tests, and the production build must pass before code review and simplification.

## Outside this change

- Redesigning blog cards or other compact editorial surfaces.
- Changing carousel density or the AI panel layout.
- Adding full product metadata to the AI cards.
- Editing activity taxonomy data returned by the backend.
