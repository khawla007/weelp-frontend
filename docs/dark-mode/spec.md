# Dark Mode Spec

This spec is the working contract for the Weelp frontend dark-mode migration. Components should describe color by role, not by literal hue, so light and dark themes can swap from one token layer.

## Tokens

Surface tokens live in `src/app/globals.css` and are exposed through `tailwind.config.js`.

| Role            | Token or utility                                             | Use                                          |
| --------------- | ------------------------------------------------------------ | -------------------------------------------- |
| Page background | `bg-background`, `text-foreground`                           | Route shells, empty page areas, default copy |
| Card or panel   | `bg-card`, `text-card-foreground`, `border-border`           | Cards, booking panels, dashboard widgets     |
| Popover         | `bg-popover`, `text-popover-foreground`                      | Menus, dropdowns, toast surfaces             |
| Muted surface   | `bg-muted`, `text-muted-foreground`                          | Secondary panels, skeletons, helper text     |
| Brand primary   | `bg-weelp-sage-deep`, `text-weelp-sage-deep`                 | Primary actions and brand accents            |
| Brand hover     | `hover:bg-weelp-sage-hover`                                  | Interactive brand states                     |
| Sage wash       | `bg-weelp-sage-wash`                                         | Intentional green-tinted sections only       |
| Steel accent    | `text-weelp-steel`                                           | Cool secondary accent text                   |
| Warning         | `bg-warning/15`, `text-warning`, `border-warning/40`         | Yellow/orange status surfaces                |
| Destructive     | `bg-destructive/5`, `text-destructive`, `border-destructive` | Error and danger states                      |

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
- arbitrary hex `bg-[#...]`, `text-[#...]`, and `border-[#...]` utilities
- inline literal `color`, `background`, or `backgroundColor` hex values

Existing audit debt is recorded in `docs/dark-mode/dark-lint-baseline.json` so Phase 5 can prevent new debt without hiding the remaining migration work. To exempt an intentional line, place `dark-mode-exempt: <reason>` directly above it.

## Third-Party Surfaces

- Stripe Elements: `CheckoutMain.jsx` passes `appearance.theme` as `night` in dark mode and `stripe` otherwise, keyed by `resolvedTheme`.
- MapLibre travel-buddy map: `TravelBuddyMap.jsx` adds a theme class; `buddy-map.css` applies a dark raster treatment and tokenized popup styles.
- Toasts: Radix toast primitives already use `bg-popover`, `text-popover-foreground`, `border-border`, and dark shadow removal.
- Rich-text editors: Tiptap shared CSS now uses foreground, background, muted, border, and sage tokens instead of literal light colors.

## Decision Log

| Decision         | Choice                                                                |
| ---------------- | --------------------------------------------------------------------- |
| Theme manager    | `next-themes`                                                         |
| Persistence key  | `weelp-theme`                                                         |
| Default theme    | `system`                                                              |
| Token model      | CSS variables in `globals.css`, consumed by Tailwind                  |
| Component rule   | Token utilities only; no new hardcoded neutral or hex color utilities |
| Exemptions       | `dark-mode-exempt` comment directly above the intentional line        |
| Temporary bridge | Still present because `npm run dark:audit` has non-exempt findings    |
