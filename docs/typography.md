# Typography

The canonical reference is `Designs/pencil-homepage.pen`. Every type decision below is sourced from a fontFamily / fontSize / fontWeight count in that file, not from generic best practice.

## What this guide covers

How headings, body text, buttons, and anchors should look across the Weelp frontend, and what to do when a component drifts. If you are deciding between fonts or sizes, the answer is in the pen file — read this guide alongside it.

## The font set

Three families. Anything outside this set is drift.

| Role | Family | When |
|------|--------|------|
| Primary | **Inter Tight** | All headings (h1–h6), all body, all buttons, all links. The pen file uses Inter Tight on 3,649 nodes — about 84% of all text. This is the workhorse. |
| Secondary | **Inter** | Small UI labels and microcopy at 11–14px. The pen reserves Inter for chip text, badge labels, and dense table cells (~15% of nodes). |
| Editorial | **Degular Demo** | Decorative section labels at 42–52px in regular weight. Used 10 times in the pen — for things like "Travel Europe", "Help Center", "32 Best Places…". Never on hero h1. Never on dashboard pages. |

Plus Jakarta Sans is **not** in the pen file. Earlier phases introduced it; it has been retired. Poppins shows up three times in the pen as stray data — ignore.

## Tier reference

These are the canonical type tiers, lifted verbatim from the largest size buckets in the pen file. A class on an element should match one of these — not invent a new size.

| Tier | Family | Size | Weight | Where it appears |
|------|--------|------|--------|------------------|
| Hero | Inter Tight | **38px** (clamp 28–40 on small screens) | 600 | Homepage h1, full-bleed banner h1 |
| Section opener | Inter Tight | **48px** | 600 | Mid-page editorial moments: "Plan your Holiday.", "Explore Creators", "Book Your Taxi" |
| Section heading | Inter Tight | **28px** | 600 | "Top activities", "Must Visit Cities", "Reviews", "FAQs" |
| Sub-heading | Inter Tight | **24px** | 600 | Card group titles, in-page block headers |
| Card title | Inter Tight | **18px** | 600 | Product card names, list-row titles |
| Body lead | Inter Tight | **20–24px** | 500 | Hero subhead, section intro paragraphs |
| Body | Inter Tight | **16px** | 400/500 | Paragraphs, descriptions |
| Body small | Inter Tight | **14px** | 400/500 | Meta text, form helper text |
| Label | Inter | **12–14px** | 400/500 | Chips, badges, table headers |
| Editorial accent | Degular Demo | **42–52px** | 400 | One-off decorative labels only — never replaces a heading tier |

Line-height on display tiers is 1.05–1.1; body tiers run 1.4–1.6. Letter-spacing on Inter Tight at 38px and up gets a hint of negative tracking (-0.01em); leave it alone below that.

## How this is wired

Defaults live in `src/app/globals.css` under `@layer base`:

- `body` sets `font-family: var(--font-interTight), 'Inter Tight', sans-serif`.
- `h1`–`h6` inherit Inter Tight at weight 600 and the matching tier size.
- `p`, `button`, `a` inherit Inter Tight at the body weight.

Tailwind aliases (`font-interTight`, `font-inter`, `font-degular`) are in `tailwind.config.js` for the rare component that needs to opt out of the global default.

The `.display` utility is reserved for editorial accent text only (Degular at 42–52px). It is not an alias for "make this text big".

## Failure paths worth knowing

A surprising amount of drift comes from copy-pasting style blocks from older code. Watch for these.

- **Inline `style={{ fontFamily: ... }}` on a heading.** Always wrong now. Strip it; the global layer sets the font.
- **`font-jakarta` or `font-plusJakarta`.** Phase 8 introduced these; they are gone. If you see one in a diff, reject it.
- **`text-[38px]` on every hero across the site.** Use `<h1>` and let the global layer size it. A hand-tuned size is only acceptable when the design intent diverges from the tier (rare; the blog hero at 52px is one such exception).
- **Degular on a section heading.** Section headings are Inter Tight. If a designer mocks a Degular section heading, treat it as accent decoration, not a heading swap.

## Notable choices

The pen file does not use a "Display tier with clamp(...)" — it uses one fixed pixel size per heading instance. We honor that. Where responsive scaling matters (hero on a 360px phone), we wrap the tier size in a `clamp()` that bottoms out at one tier below the target, never two. That keeps the rhythm of the pen visible on every screen.

Buttons inherit Inter Tight 500 at 14–16px because the pen renders them that way — no weight contrast against body text. Anchors do not get a separate font-family override; they pick up underline and color via the link tokens, font stays Inter Tight.

## When the pen and the code disagree

The pen wins. If you see a heading in code that looks heavier or lighter than the pen, the pen is the canonical source. Open `Designs/pencil-homepage.pen`, find the matching surface, and match the rendered values (Family, Size, Weight) one-for-one.
