# Zero Review Card State Design

## What this changes

Public full product cards currently hide their review row when an item has zero approved reviews. City-filter API results explicitly return `average_rating: 0` and `reviews_count: 0`, so the card should preserve its review position and display the same compact review treatment as rated items: `★ 0 (0)`.

## Data and rendering rules

`mapProductToItemCard` distinguishes an explicit numeric zero from a missing or invalid review field. Explicit values in the valid ranges—rating from 0 through 5 and a non-negative integer review count—become display props. Missing, malformed, negative, or out-of-range values remain absent and do not receive fabricated zeros.

`FullItemCard` separates visual review availability from Product structured-data eligibility. The visible review row accepts the explicit zero state, while `AggregateRating` schema remains limited to a positive rating and positive review count. Existing positive review rendering and schema remain unchanged.

## Scope and verification

This correction changes only the review display state for full shared product cards. Compact/editorial cards, descriptions, attributes, pricing, routes, wishlist behavior, and dashboard cards remain unchanged. Mapper and ItemCard tests cover explicit zero, missing values, invalid values, positive reviews, and schema exclusion. Visible localhost verification confirms zero-review city-filter cards show the row without changing reviewed cards.
