# Destination Explore CTA Design

> **Superseded on 2026-08-26:** The approved follow-up keeps the original circular arrow-only control and adopts only the Top Activities arrow rotation on whole-card hover. The Explore pill described below is retained as design history.

## What this change covers

The full-image city card already uses the approved Weelp Postcard layout. This follow-up changes only its lower-right action treatment so it matches the canonical Top Activities card.

## Visual treatment

Replace the standalone translucent circular `ArrowUpRight` action with the Top Activities `Explore` pill:

- A white `Explore` label and a circular inset arrow sit inside one rounded pill.
- The pill uses the same height, spacing, border, background, shadow, typography, and amber arrow color as the Top Activities card.
- The permanent photographic gradient continues to provide contrast behind the pill.
- City title, subtitle, image treatment, card radius, and carousel layout do not change.

The destination version uses white text and a translucent white surface because it sits directly over photography. These are the overlay equivalents of the Top Activities semantic foreground and background colors.

## Interaction

The entire city card remains the only interactive link. The Explore pill is presentational and stays `aria-hidden`, so no nested button or duplicate action enters the tab order.

Hovering anywhere on the card rotates the right-facing `ArrowRight` by `-45deg`, matching the Top Activities card. The existing card shadow and image zoom continue at the same time. Reduced-motion users receive no arrow rotation or image zoom. Keyboard focus remains on the outer card link.

## Component boundary

Only `CityCard` changes. The small CTA markup remains local because the two cards use different group names and different overlay colors; extracting a shared component would add API surface without meaningful reuse.

All existing `CityCard` consumers inherit the treatment automatically, including the main homepage, gold homepage, Holiday, Tours & Experiences, region pages, and the Cities listing.

## Verification

Component tests will lock the Explore label, `ArrowRight`, pill styling, whole-card hover rotation, reduced-motion behavior, and absence of a nested button. Existing destination tests continue to cover accessible naming, copy modes, fallback imagery, and responsive carousel counts.

Visible localhost verification will compare Top Activities and Top Destinations in light and dark themes, confirm hover motion, and check desktop, tablet, and mobile layouts. Type-check, lint, the relevant Jest suites, and the production build must pass before the change is committed and pushed to `main`.
