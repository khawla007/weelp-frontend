# Dark Mode Spec

This spec is the working contract for the Weelp frontend dark-mode migration. Deep Forest is the default across public pages and the customer, creator, and admin dashboards; Light remains an explicit optional choice. Components should describe color by role, not by literal hue, so light and dark themes can swap from one token layer.

## Tokens

Surface tokens live in `src/app/globals.css` and are exposed through `tailwind.config.js`.

| Role            | Token or utility                                             | Use                                          |
| --------------- | ------------------------------------------------------------ | -------------------------------------------- |
| Page background | `bg-background`, `text-foreground`                           | Route shells, empty page areas, default copy |
| Card or panel   | `bg-card`, `text-card-foreground`, `border-border`           | Cards, booking panels, dashboard widgets     |
| Popover         | `bg-popover`, `text-popover-foreground`                      | Menus, dropdowns, toast surfaces             |
| Muted surface   | `bg-muted`, `text-muted-foreground`                          | Secondary panels, input surfaces, skeletons  |
| Sage fill       | `bg-weelp-sage-deep`, `border-weelp-sage-deep`               | Solid controls, stronger input boundaries    |
| Sage text       | `text-weelp-sage-text`                                       | Theme-aware brand copy and accents           |
| Brand hover     | `hover:bg-weelp-sage-hover`                                  | Interactive brand states                     |
| Sage wash       | `bg-weelp-sage-wash`                                         | Intentional green-tinted sections only       |
| Steel accent    | `text-weelp-steel`                                           | Cool secondary accent text                   |
| Warning         | `bg-warning/15`, `text-warning`, `border-warning/40`         | Yellow/orange status surfaces                |
| Destructive     | `bg-destructive/5`, `text-destructive`, `border-destructive` | Error and danger states                      |

The approved Deep Forest design targets and behavior are defined in
`src/docs/superpowers/specs/2026-07-24-deep-forest-dark-mode-design.md`. The
implementation keeps roles explicit. In Deep Forest, the canvas is
`hsl(160 36% 5%)`, sage fills and stronger input boundaries use
`hsl(153 25% 40%)`, and sage text and interactive accents use
`hsl(154 29% 63%)`. Light-theme sage text uses `hsl(154 24% 34%)`. The hex
values in the design guide are close palette targets, not claims about the exact
RGB output of these rounded HSL tokens.

## Swap Table

Use this table when replacing hardcoded or literal Tailwind colors.

| Avoid                                                          | Use                                                        |
| -------------------------------------------------------------- | ---------------------------------------------------------- |
| `bg-white` on pages                                            | `bg-background`                                            |
| `bg-white` on cards                                            | `bg-card`                                                  |
| `bg-black`, `text-black`                                       | `bg-foreground`, `text-foreground` by role                 |
| `bg-gray-*`, `bg-zinc-*`, `bg-neutral-*`, `bg-slate-*`         | `bg-muted`, `bg-accent`, `bg-card`, or a state token       |
| `text-gray-*`, `text-zinc-*`, `text-neutral-*`, `text-slate-*` | `text-muted-foreground`, `text-copy`, or `text-foreground` |
| `border-gray-*`, `border-zinc-*`, `border-[#e4e4e7]`           | `border-border`                                            |
| `divide-gray-*`, `divide-zinc-*`                               | `divide-border`                                            |
| `bg-[#f2f7f5]`                                                 | `bg-weelp-sage-wash`                                       |
| `text-[#52525b]`                                               | `text-copy` or `text-muted-foreground`                     |
| `text-[#71717a]`                                               | `text-muted-foreground`                                    |
| Inline `style={{ color: '#...' }}`                             | A class token or CSS variable                              |

## Guardrail

`npm run lint` runs `scripts/dark-lint-guard.mjs` after ESLint. The guard fails on new:

- `bg-white` and `bg-black`
- gray, zinc, neutral, and slate color utilities
- arbitrary hex color utilities, including `bg-[#...]`, `text-[#...]`, `border-[#...]`, `fill-[#...]`, `stroke-[#...]`, `ring-[#...]`, and gradient stops
- inline literal `color`, `background`, or `backgroundColor` hex values

Existing audit debt is recorded in `docs/dark-mode/dark-lint-baseline.json` so Phase 5 can prevent new debt without hiding the remaining migration work. To exempt an intentional line, place `dark-mode-exempt: <reason>` directly above it.

`npm run dark:audit` is the final blocking sweep for unresolved color/token debt. It does not catalog shadows; dark mode normalizes standard shadow utilities globally and component primitives add `dark:shadow-none` where they own elevation.

## Third-Party Surfaces

- Stripe Elements: `CheckoutMain.jsx` passes `appearance.theme` as `night` in dark mode and `stripe` otherwise, keyed by `resolvedTheme`.
- MapLibre travel-buddy map: `TravelBuddyMap.jsx` adds a theme class; `buddy-map.css` applies a dark raster treatment and tokenized popup styles.
- Toasts: Radix toast primitives already use `bg-popover`, `text-popover-foreground`, `border-border`, and dark shadow removal.
- Rich-text editors: Tiptap shared CSS now uses foreground, background, muted, border, and sage tokens instead of literal light colors.

## Theme Behavior

`next-themes` stores only the explicit `dark` and `light` choices under
`weelp-theme`; the product does not follow the device theme. Before hydration, a
bootstrap keeps a saved `light` value unchanged and normalizes missing, legacy
`system`, empty, or corrupt values to `dark`. The normalized dark value is
persisted when storage is available. If storage access throws, the bootstrap
still applies the dark class and color scheme for the current page.

Browser chrome starts with the server-rendered Deep Forest theme color. The
bootstrap corrects it before hydration when saved Light wins, and the client
keeps it synchronized after the user toggles themes. The application manifest
also defaults its theme and background colors to Deep Forest.

## Decision Log

| Decision        | Choice                                                                      |
| --------------- | --------------------------------------------------------------------------- |
| Theme manager   | `next-themes`                                                               |
| Persistence key | `weelp-theme`                                                               |
| Default theme   | `dark` (Deep Forest)                                                        |
| System theme    | Disabled; users explicitly choose Dark or Light                             |
| Token model     | CSS variables in `globals.css`, consumed by Tailwind                        |
| Component rule  | Token utilities only; no new hardcoded neutral or hex color utilities       |
| Exemptions      | `dark-mode-exempt` comment directly above the intentional line              |
| Shadow policy   | Standard shadows are normalized off in dark mode; color bridges are removed |
