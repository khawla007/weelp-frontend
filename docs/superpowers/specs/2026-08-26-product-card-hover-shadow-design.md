# Product Card Hover Shadow Design

## What this change does

The shared full product card will use the existing theme-aware card shadow when a pointer hovers the card. The effect adds a quiet clickable signal without changing the card's layout, border, or resting appearance.

## Approved direction

- Apply the shadow to the outer full-card article so it follows the canonical 24px radius.
- Use `var(--weelp-card-hover-shadow)` rather than introducing a new shadow value.
- Keep `--weelp-card-border` visible and unchanged during hover.
- Do not translate, scale, or otherwise move the card.
- Transition only the shadow, using the existing short card-hover timing.
- Leave compact blog and AI cards unchanged.
- Preserve the existing light, dark, and dark `/home-gold` theme tokens.

## Alternatives considered

Keeping the card completely flat was rejected because the full card is clickable and currently gives no outer-shell hover response. Applying the shadow to only the inner link was also rejected because its focus box does not own the outer 24px card silhouette or the sibling wishlist control.

## Implementation boundary

The change belongs in `src/app/components/ui/item-card.jsx` on the full-card article. No new component, token, JavaScript state, or animation helper is needed.

## Verification

- Add an `ItemCard` regression assertion for the tokenized hover-shadow and shadow-only transition classes.
- Confirm the test fails before the class change and passes afterward.
- Run the focused ItemCard and theme suites, type checking, lint, and the production build.
- In the visible localhost browser, verify a non-`none` shadow on hover while the border color and card geometry remain stable in light mode.
- Smoke-check normal dark mode and dark `/home-gold` to ensure their existing border treatments remain unchanged.
