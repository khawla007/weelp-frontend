# Dashboard Dark Surface Hierarchy Design

## What this changes

The admin dashboard will use the same dark-mode surface hierarchy as the public Weelp experience. The page canvas will use the global `background` token, while dashboard cards and panels will continue to use the existing `card` token. This makes cards read as raised content surfaces instead of dark cut-outs placed on a lighter green page.

Light mode is outside this visual change and keeps its current muted page canvas with white cards.

## Why the mismatch happens

The shared admin layout currently applies `bg-muted` to its full-page wrapper in both themes. In dark mode, `muted` resolves to the lighter green surface used by the public site for secondary panels. The dashboard cards resolve through `bg-card`, which is darker than `muted`, reversing the public site's dark hierarchy.

The global dark tokens already express the intended relationship:

- `background` is the deepest page canvas (`hsl(160 36% 5%)`);
- `card` and `surface-tint` are the slightly lighter content surface (`hsl(159 30% 9%)`).

No new color value or dashboard-only token is needed.

## Implementation shape

The shared admin layout wrapper will keep `bg-muted` as its light-mode default and add `dark:bg-background` for dark mode. Because every admin route renders inside this layout, one token-level class change aligns the full admin dashboard without duplicating overrides across individual pages.

Existing cards, the sidebar, the header, borders, typography, and interactive states remain unchanged. Customer dashboard styling is also outside scope because its shared layout already uses a dark `bg-background` canvas.

## Verification

A focused regression test will assert that the admin layout preserves `bg-muted` for light mode and includes `dark:bg-background` for dark mode. Existing dashboard and theme tests must continue to pass.

After type-check and lint, the local site will be checked in the named visible browser at desktop and mobile widths. Verification will confirm that:

- the admin page canvas matches the public dark background;
- cards remain on the lighter card surface;
- light mode retains its existing page and card hierarchy;
- the layout has no responsive overflow or unintended surface gaps.
