# Deep Forest Dark Mode Design

## What this guide covers

Weelp already supports light and dark themes, but the current dark palette is mostly neutral black and zinc. It works functionally, yet it does not carry the sage-teal identity that appears throughout the light experience.

This change gives the entire product a shared night identity. Public pages, customer areas, creator tools, and the admin dashboard will all use a near-black forest palette derived from the existing `#588F7A` brand color.

Dark becomes the first-visit default. Light remains available as an explicit choice, and Weelp remembers that choice on later visits.

## The visual direction

The palette should feel dark first and green second. Large surfaces must remain calm enough for long sessions, while the green undertone makes the interface recognizable as Weelp.

The original `#588F7A` remains the brand anchor, but it should not become the page background. It is too bright for that role. Darker descendants of the same hue create the environment; lighter sage values identify actions and focus.

The target hierarchy is:

| Role             | Target color | Intended use                                             |
| ---------------- | -----------: | -------------------------------------------------------- |
| Canvas           |    `#08110E` | Page background and deepest shell                        |
| Standard surface |    `#101E19` | Cards, panels, table containers                          |
| Raised surface   |    `#14241E` | Popovers, menus, dialogs, elevated controls              |
| Muted surface    |    `#182B24` | Hover, selected, secondary, and input treatments         |
| Border           |    `#263B33` | Dividers and standard boundaries                         |
| Strong border    |    `#304B40` | Inputs and boundaries needing more separation            |
| Main text        |    `#F3F8F5` | Headings and primary content                             |
| Secondary text   |    `#C8D7D0` | Body copy                                                |
| Muted text       |    `#9FB1A9` | Labels and supporting metadata                           |
| Interactive sage |    `#86BDA5` | Focus, links, selected states, and suitable actions      |
| Brand anchor     |    `#588F7A` | Brand graphics and contexts where contrast is sufficient |
| On-sage text     |    `#07100D` | Text and icons placed on the lighter interactive sage    |

These are target values, not permission to scatter hex codes through components. Shared semantic tokens remain the source of truth.

## Surface and component rules

The canvas uses the darkest forest value. Cards and standard panels sit one step above it, while dialogs, menus, and popovers use the raised surface. Inputs need enough separation from their parent surface to remain recognizable before focus.

Elevation in dark mode should come from tonal steps and borders. Large black shadows are unnecessary and can make the interface look muddy.

Primary actions should use a sage treatment whose foreground passes contrast requirements. Secondary actions can use outlined or raised forest surfaces. Keyboard focus uses the lighter interactive sage and must remain visible against every supported surface.

Dense admin screens need the same palette, not a separate neutral theme. Their tint should remain restrained: use surface hierarchy, borders, typography, and spacing to separate data instead of filling table rows with stronger green.

Travel photography keeps its natural color. Image overlays may use a translucent form of the canvas color rather than pure black. Error, warning, informational, discount, and success colors keep their semantic identities instead of being forced into the sage scale.

Disabled controls should look unavailable without disappearing. Empty, loading, and failure states use the same surface and text hierarchy as the surrounding component.

## Theme behavior

`next-themes` remains responsible for applying the theme class and storing the choice under the existing `weelp-theme` key.

For a visitor without a saved choice:

1. Weelp starts in dark mode.
2. Device preference does not replace that product default.
3. The theme is applied before hydration so the page does not flash white.

For a visitor with a saved choice:

1. The stored `dark` or `light` value wins.
2. Switching themes updates the page immediately.
3. The choice survives refreshes and later visits.

If the stored value is missing or cannot be used, Weelp falls back to dark. Theme controls offer only Dark and Light; System is not a user-facing option.

The global toggle remains available across the public and authenticated experiences. While Deep Forest is active, it offers Light. The dashboard appearance setting uses the same two choices and must not present a conflicting default.

Browser color-scheme metadata, native controls, and the application manifest should agree with the dark-first experience where the platform allows it.

## How this fits the current frontend

The dark token block in `src/app/globals.css` is the main palette boundary. Existing component classes such as `bg-background`, `bg-card`, `bg-popover`, `text-foreground`, `text-muted-foreground`, and `border-border` should inherit the new palette without component-specific theme logic.

The implementation should align:

- core shadcn-style tokens
- home-specific surface and text tokens
- sage brand tokens
- cards and city-page tokens
- sidebar tokens
- authentication surfaces
- calendar and other standalone CSS variables

Hard-coded neutral dark values should be audited when they bypass a semantic token. A component should receive a direct dark color only when the visual cannot be expressed honestly through an existing semantic role.

Light-mode tokens should remain visually unchanged unless a shared-token correction is required to prevent a regression.

## Failure paths worth knowing

A theme can look consistent on ordinary cards while failing in portals, native controls, or media-heavy areas. Dialogs, dropdowns, tooltips, toasts, calendars, and select menus therefore need explicit review because they may render outside their visual parent.

Third-party widgets may not inherit CSS variables. When a widget supports a theme API, it should receive the resolved theme. When it does not, its closest wrapper should provide a readable fallback rather than applying a global color filter.

If storage access is unavailable, theme switching should still work for the current page session and the interface should remain dark by default.

## Accessibility and verification

The final palette must pass WCAG AA contrast for normal text and interactive controls. Large text is not a reason to accept weak contrast in shared tokens. Focus indicators, form errors, disabled states, and chart labels need separate checks because their contrast often differs from ordinary body text.

Automated coverage should prove:

- first visit resolves to dark
- a saved light preference wins over the default
- switching themes persists the selected value
- the global toggle and dashboard appearance setting agree
- rendering does not introduce hydration errors

Type-checking and linting run after the token and component changes. Focused tests cover theme behavior. Visible-browser verification covers representative public pages, customer and creator flows, and the admin dashboard at desktop and mobile widths.

The visual pass must include cards, forms, tables, dialogs, dropdowns, calendars, loading states, empty states, error states, and image overlays. It should also watch the initial page load for a light flash.

## Outside this change

This work does not redesign layouts, typography, navigation, or light mode. It does not add a System theme option, synchronize the preference to a user account, recolor photography, or replace the semantic status palette.

Those can be considered separately if later product needs justify them.
