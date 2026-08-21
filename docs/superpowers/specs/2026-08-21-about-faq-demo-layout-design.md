# About FAQ Demo Layout Design

## What this change covers

The About page FAQ will follow the SteelNova demo's two-band, interlocked composition while staying inside Weelp's canonical `container-page` rail. This pass changes layout only. The current Weelp FAQ copy, travel image, accordion interaction, theme behavior, and reveal behavior remain intact; the travel-specific animation will be selected separately after the layout is approved in the browser.

## Measured reference and scaling

At a 1920px viewport, the demo uses a 1500px content rail. Weelp exposes a 1480px outer container with 32px desktop gutters, leaving 1416px of usable inner width. The layout therefore uses a `1416 / 1500 = 0.944` desktop scale instead of copying the demo's raw pixel sizes.

The desktop targets are:

- Heading band: approximately 497px tall, with the FAQ badge and heading aligned to the left rail.
- Lower sage-wash band: approximately 442px tall.
- Accordion panel: approximately 781px wide and 508px tall, overlapping the lower band by approximately 165px.
- Travel image: approximately 678px wide and 743px tall, overlapping the lower band by approximately 294px.
- The accordion starts at the left inner edge and the image finishes at the right inner edge. Their small horizontal overlap mirrors the demo.
- Questions render as one clean divider list inside the accordion panel, not separate rounded cards. Each row uses a 30px square state control adapted from the demo's plus/minus treatment to Weelp sage.

These measurements are proportional targets, not content-clipping constraints. The accordion and image sit in the same in-flow CSS grid row with negative top margins, so the measured overlap is preserved while the lower row can grow when translated or wrapped copy needs more room.

## Responsive behavior

At desktop widths, the two panels retain the demo's interlocked overlap. Below the desktop composition breakpoint, the negative offsets are removed and the section stacks in visual and DOM order: heading, image, accordion.

Weelp's spacing system governs the stacked version:

- Mobile: 40px major-section spacing and 16px compact internal gutters.
- Tablet: 64px major-section spacing and one 24px compact handoff between the heading and media.
- Desktop: the scaled demo geometry inside the 32px `container-page` gutters.

The image and accordion receive Weelp's established responsive radii on tablet and mobile so they remain visually consistent with the rest of the About page. Desktop keeps the demo's flush interlocked edges. Individual question rows remain flat at every breakpoint.

## Accessibility and interaction

The existing button semantics, `aria-expanded`, controlled panels, focus treatment, and one-item-open behavior remain unchanged. The implementation must not add horizontal overflow at 1920px, 1440px, 1024px, 768px, or 390px. Reduced-motion behavior remains unchanged because animation is outside this pass.

## Acceptance checks

- The FAQ section itself is visibly constrained by `container-page`; neither band spans the viewport.
- Desktop panel dimensions reflect the 0.944 scale rather than the demo's 1500px rail.
- The heading, accordion, and travel image align to Weelp's inner container edges.
- Tablet and mobile stack without negative offsets or clipping.
- Existing FAQ interaction tests pass.
- Type-check, lint, focused tests, production build, and visible-browser checks pass.
