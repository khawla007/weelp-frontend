# Tours & Experiences design tokens

Source: Designs/holiday-page.pen (Framer export)

**Extracted:** 2026-04-16

---

## Hero section

- Heading text (verbatim): "Plan your Holiday."
- Heading: 48px / 600 (font-weight) / #143042
- Heading font family: Inter Tight
- Background: #f5f9fa (light blue-gray)
- Container width: 1920px
- Container height: 1892px

---

## Filter bar

- Fields in order: From | Where To? | When? | How Many?
- Field label style: 14px / #5a5a5a / Inter Tight (font-weight: 500)
- Bar background: none (transparent)
- Bar border: 1px solid (color not specified in .pen; apply stroke from design)
- Bar gap between fields: 18px (outer container) | -1px (separator gap, appears to create visual adjacency)
- Separator between fields: 1px stroke with "inside" alignment
- Submit button: label "Planner", text color #6f7680, font-size 18.9px (18.905540466308594px raw), weight 500, font family Inter Tight
- Submit button background: TBD (not present in .pen)
- Submit button border-radius: TBD (not present in .pen)
- Submit button size: TBD (not present in .pen)

---

## Trending Spots

- Section title (verbatim): "Trending Spots"
- Section title style: 28px / 500 (font-weight) / #273f4e / Inter Tight
- Card: 342px width (from image content) × 360px height
- Card gap (horizontal spacing between cards): 22px
- Card padding: top 286px, right 24px, bottom 24px, left 24px (layered over image)
- Card background: Image fill (`images/image-import-2.jpg` reference in .pen, mode: fill)
- Card border: 1px stroke with "inside" alignment
- Card border-radius: TBD (not present in .pen)
- Card grid layout: flex row with 5 items visible in design (gap 22px)
- Card title (e.g., "London"): 24px / 600 (font-weight) / #ffffff / Inter Tight
- Starting-price label format: "Starting at $1500" (example from design: "Starting at $1500")
- Starting-price style: 16px / #dfdfeb / 500 (font-weight) / Inter Tight / full container width
- Starting-price position: bottom area of card (above bottom padding)

---

## Notes

- **Stroke colors not fully defined:** The .pen file specifies strokes with alignment="inside" and thickness 1px/0.655px, but does not include explicit stroke color values. Designer should confirm stroke color (likely a light gray border).
- **Button styling TBD:** The "Planner" button text properties are captured, but background color, border-radius, and overall button dimensions are not in the .pen export and should be confirmed from design intent or Figma/design tool.
- **Card border-radius TBD:** Card corner rounding is not specified in the .pen JSON; verify from design mockup.
- **Hero vertical padding:** The frame structure suggests the hero spans the full 1892px height; specific top/bottom padding values TBD (not present in .pen).
- **Filter bar styling:** The filter bar frames have transparent backgrounds and rely on stroke styling; confirm final background treatment (white bg with border, or other styling).
- **Typography baseline:** All font measurements are exact px values from .pen; no line-height or letter-spacing specified in export.

---

## Frame Hierarchy Reference

```
Holiday Page (frame, 1920×1892, bg: #f5f9fa)
├── Hero section (Auto Layout Vertical)
│   └── Plan your Holiday. (heading)
│   └── Description text
├── Filter Bar (Frame 1707479572, w:560)
│   └── Fields container (Frame 1707479557)
│       ├── From field
│       ├── Where To? field
│       ├── When? field
│       └── How Many? field
├── Featured Destinations (Frame 1707479679, w:1480)
│   └── Trending Spots section (Frame 33307)
│       └── Title: "Trending Spots"
│   └── Cards grid (Frame with 5 cards, gap: 22px)
│       ├── Frame 1707479487 (360px height)
│       │   ├── Card image
│       │   └── Card content (Frame 1707479517)
│       │       ├── Title (e.g., "London")
│       │       └── Price (e.g., "Starting at $1500")
│       ├── ... (4 more cards)
```
