# About Us Fidelity Correction Design

## Why this correction exists

The first About Us rebuild reproduced the section order, but it treated several reference details as generic responsive grids. The SteelNova page instead relies on full-width outer bands, intentionally oversized content, controlled overlaps, and much taller whitespace rhythms. This correction matches those structural details while keeping Weelp's colors, fonts, copy, images, routes, header, and footer.

The live reference at `https://demo.casethemes.net/steelnova/about-us/` is the source of truth. At a 1440px desktop viewport its semantic sections resolve into nine full-width visual bands: hero `649px`, story `1323px`, company masonry `1573px`, process `1043px`, team `1037px`, testimonials `1136px`, CTA `493px`, FAQ heading `511px`, and FAQ content `468px`. These are proportional targets rather than brittle fixed document heights; content must still reflow safely when Weelp's font metrics differ.

## Chosen approach

Use a measured section rebuild rather than isolated CSS nudges. Each section keeps a full-width root and receives an inner composition that mirrors the reference. CSS grid and explicit overlap geometry provide the desktop composition; tablet and mobile rules remove unsafe overlap and stack the same content in reference order.

Two alternatives were rejected:

- Small spacing patches would correct the two reported examples but preserve other mismatches in CTA, FAQ, process, team, and motion.
- Porting SteelNova's Elementor markup or styles would import WordPress-specific structure, industrial branding, and fragile dependencies into the Next.js application.

## Section geometry

### Hero

The image remains full bleed. The content stays left aligned, but the hero loses the artificial bottom gap so the story band begins immediately after it. Its desktop height moves closer to the reference's compact full-width hero rather than the current extra-tall treatment.

### Story and oversized metrics

The story becomes a full-width band with a wide inner canvas and generous top/bottom padding. Desktop uses two coordinated rows:

- The upper row is approximately 46% headline and 54% metric panel.
- The metric panel is about 350px tall, contains two equal statistics with descriptions, and sits above later content with a higher stacking level.
- The lower row is approximately 57% image, 7% gap, and 36% copy.
- At 1440px, the target metric rectangle is approximately `x=666, y=789, 744×351px`; the image is approximately `x=15, y=1059, 781×658px`. The resulting intersection is about `130px` horizontally and `80px` vertically. The lower row therefore begins about 5rem before the metric panel ends.

Mobile removes the negative overlap. The order becomes label/headline, vertically stacked statistics, image, then copy.

### Company masonry

The section remains a full-width tinted band but gains the reference's deeper top whitespace and taller masonry. The separate label/headline/action header remains. The three columns use taller image and information blocks, with the middle column offset through unequal row heights and the right metric overlay enlarged. The contact row remains centered below with a generous closing gap.

### Why choose Weelp

The section becomes a flush full-width split rather than a rounded image inside a constrained container. Desktop devotes roughly 47% to an edge-to-edge image and 53% to the dark copy panel, with a minimum height close to the reference. The guide metric overlaps the image near its lower edge. Mobile stacks image first and copy second without overlap escaping the viewport.

### Team and testimonials

The team band becomes more compact: three wider, shorter portrait frames with metadata immediately below, matching the reference's desktop height. The testimonial band retains its synchronized two-panel carousel, but section padding and media/panel heights align to the reference's broader centered composition.

### CTA and FAQ

The CTA image becomes edge to edge with square outer corners and centered content; it is no longer a rounded card inside `container-page`.

The FAQ uses two consecutive full-width rows. The first is an approximately `511px` heading row. The second is an approximately `468px` content row, but its children deliberately escape upward: at 1440px the accordion wrapper is about `827×538px` at `x=15` and begins roughly `175px` before the second row; the right image is about `718×787px` at `x=721` and begins roughly `311px` before the second row. This creates the same heading/accordion/image interlock as the reference. Mobile removes the negative offsets and stacks heading, image, then accordion.

## Motion

Directional section reveals remain for large blocks. Reference headings add a separate character-level blur reveal: words preserve wrapping, characters begin blurred and transparent, then sharpen and fade in with a short stagger when the heading enters the viewport. The semantic heading exposes one accessible name while decorative split characters are hidden from assistive technology.

Reduced-motion users see the complete heading immediately with no blur, stagger, translation, or delayed visibility. The page-level overflow clip remains so directional transforms cannot widen the mobile document.

## Testing and verification

Tests will first fail on the missing overlap hooks, full-bleed CTA/FAQ/process contracts, story metric descriptions, compact team geometry, and semantic blur-heading output. After implementation, visible headed-browser comparison will cover every section at 1440, 1024, 768, and 390 pixels. Desktop verification will measure element rectangles against the reference composition; mobile verification will confirm no horizontal overflow and the correct de-overlapped order.

Type-check, lint, focused tests, the production build, required code review, and a final visible-browser pass remain mandatory. The two unrelated Home Gold working-tree edits remain untouched.
