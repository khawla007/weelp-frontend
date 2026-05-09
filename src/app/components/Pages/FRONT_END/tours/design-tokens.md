# Tours & Experiences design tokens

Source: Designs/holiday-page.pen (Framer export), reconciled to `frontend/DESIGN.md`.

**Extracted:** 2026-04-16
**Reconciled to canonical tokens:** 2026-05-09

> Original Framer export hex values are intentionally replaced below with the
> canonical Weelp tokens defined in `frontend/DESIGN.md`. Treat DESIGN.md as
> the source of truth — values here are listed only to map this surface to
> the design system, never to introduce new tokens.

---

## Hero section

- Heading text (verbatim): "Plan your Holiday."
- Heading: 48px / 600 / `#18181b` (ink)
- Heading font family: `'Plus Jakarta Sans', sans-serif` (Inter Tight body remains for the description)
- Background: `#f8faf9` (page) — Framer export `#f5f9fa` is replaced with the canonical page tint
- Container width: full-bleed within shell; the .pen 1920px reference is the design canvas, not the rendered viewport

---

## Filter bar

- Fields in order: From | Where To? | When? | How Many?
- Field label style: 14px / `#52525b` (label) / Inter Tight, weight 500
- Bar background: white (`#ffffff`)
- Bar border: 1px `#e4e4e7` (border)
- Bar gap between fields: 0 (fields share borders, single rule between)
- Separator between fields: 1px `#e4e4e7`, inside alignment
- Submit button: label "Planner" — primary button per DESIGN.md (sage `#588f7a` background, white text, 8px radius, 12px×24px padding)
- Focus ring on inputs and submit: 2px `#588f7a` at 40% opacity, 2px white offset

---

## Trending Spots

- Section title (verbatim): "Trending Spots"
- Section title style: 28px / 600 / `#18181b` (ink) / Plus Jakarta — section headings use Plus Jakarta per the Reserved-Display Rule
- Card: 342px width × 360px height (max; flex-shrinks below `lg`)
- Card gap (horizontal): 22px (within DESIGN.md spacing scale: between `lg` 24px and `md` 16px — the design tolerates 24px)
- Card padding: 24px on the bottom content block
- Card background: image fill, with a soft gradient overlay so type stays legible
- Card border: 1px `#e4e4e7`, removed on hover (Card Hover shadow takes over per Flat-At-Rest)
- Card border-radius: 24px (`rounded.lg`)
- Card title: 24px / 600 / `#ffffff` (over image, white reserved for image-overlay text only)
- Starting-price label format: "Starting at $1500"
- Starting-price style: 16px / `#ffffff` at 80% opacity / 500 / Inter Tight (image-overlay supporting text)
- Starting-price position: bottom area of card (above bottom padding)

---

## Notes

- **Strokes:** all borders resolve to `#e4e4e7` (canonical border) at 1px. The `inside` alignment from the Framer export translates to standard CSS `border` since Tailwind / web borders are inside-aligned by default at the box-sizing model used here.
- **Button styling:** primary CTA follows DESIGN.md `button-primary` token (sage `#588f7a`, white text, 8px radius, 12px×24px padding, hover `#4d8069`).
- **Card border-radius:** 24px outer, 16px inner image radius — matches `rounded.lg` and `rounded.md`.
- **Hero padding:** vertical rhythm follows DESIGN.md spacing — `xl` (40px) above and below the bar on desktop, `lg` (24px) on mobile.
- **Filter bar styling:** white surface with 1px `#e4e4e7` rule. No shadow at rest (Flat-At-Rest); hover/focus surfaces depth via the canonical `Card Hover` shadow only when the field is hovered as a clickable target.
- **Typography baseline:** sizes inherit from DESIGN.md — Display, Headline, Title, Body, Label. The Framer-export raw px values are reconciled into the type scale, not preserved verbatim.

---

## Frame Hierarchy Reference

```
Holiday Page (page, bg: #f8faf9)
├── Hero section (Auto Layout Vertical)
│   └── Plan your Holiday. (heading, ink)
│   └── Description text (steel)
├── Filter Bar (white surface, 1px #e4e4e7)
│   └── Fields container
│       ├── From field
│       ├── Where To? field
│       ├── When? field
│       └── How Many? field
├── Featured Destinations
│   └── Trending Spots section
│       └── Title: "Trending Spots" (ink)
│   └── Cards grid (gap: 22-24px)
│       ├── Card (rounded.lg, image fill, ink/white overlay text)
│       │   ├── Card image
│       │   └── Card content
│       │       ├── Title
│       │       └── Price
│       ├── ... (4 more cards)
```

---

## Reconciliation log (2026-05-09)

| Framer export | Canonical token                      | Role                                                |
| ------------- | ------------------------------------ | --------------------------------------------------- |
| `#143042`     | `#18181b` (ink)                      | Headline text                                       |
| `#5a5a5a`     | `#52525b` (label) / `#71717a` (copy) | Field labels / body                                 |
| `#273f4e`     | `#18181b` (ink)                      | Section title                                       |
| `#6f7680`     | `#71717a` (copy)                     | Submit button text replaced by primary button white |
| `#f5f9fa`     | `#f8faf9` (page)                     | Hero background                                     |
| `#dfdfeb`     | `#ffffff` 80%                        | Image-overlay supporting text                       |

If you reach for any of the left-column values when implementing this surface, stop — DESIGN.md owns the right-column instead.
