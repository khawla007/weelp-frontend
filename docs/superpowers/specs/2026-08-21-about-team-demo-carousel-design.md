# About Team Demo Carousel Design

## What this change fixes

The About page Team section currently looks close to the SteelNova demo at a 1440-pixel viewport, but only because both rows nearly fill that viewport. At wider desktop sizes, the difference becomes obvious: Weelp's Team grid has no `container-page` boundary and grows to 1,880 pixels at a 1,920-pixel viewport, producing 594-pixel portraits. The demo stops at a 1,426-pixel container and keeps its portraits near 443 pixels.

This change recreates the demo's six-member carousel inside Weelp's own page container. It copies the reference's proportions and interaction while keeping Weelp's colors, typography family, theme tokens, motion conventions, and image-fallback behavior.

Reference: `https://demo.casethemes.net/steelnova/about-us/`

## Measured desktop geometry

At a 1,920-pixel viewport, the visible-browser comparison produced these measurements:

| Measurement                | SteelNova demo | Current Weelp |  Target Weelp |
| -------------------------- | -------------: | ------------: | ------------: |
| Content width              |        1,426px |       1,880px |       1,416px |
| Visible cards              |              3 |             3 |             3 |
| Portrait/card width        |          443px |         594px |   about 440px |
| Card gap                   |           49px |          49px |       48–49px |
| Section height             |        1,058px |       1,207px | about 1,050px |
| Section top/bottom padding |          140px | 140px / 143px |   about 140px |

Weelp's canonical `container-page` is 1,480 pixels wide with 32-pixel desktop padding on each side, leaving 1,416 pixels for content. Compared with the demo's 1,426-pixel content width, the scale ratio is `1416 / 1426 = 0.993`. Three equal cards inside that content width with two 48-pixel gaps resolve to 440 pixels each.

The layout remains fluid rather than hard-coding a 440-pixel card. The container and three-column carousel calculate the card width; a square media frame keeps every portrait proportional.

## Section composition

The section uses `container-page` as its actual horizontal boundary instead of allowing the Team header and grid to span the viewport. Its content order remains:

1. Centered Weelp `Our Team` badge.
2. Centered heading, `Meet Our Amazing Team Members`.
3. Centered travel-focused introduction, no wider than 700 pixels.
4. Six-member carousel with three visible cards on desktop.

The heading follows the demo's 47–48-pixel desktop scale and approximately 57-pixel line height, stepping down to about 32 pixels on tablet and 27 pixels on mobile. The introduction uses 16-pixel text with a 26-pixel line height. Each member name uses approximately 30-pixel text with a 40-pixel line height, reducing to about 24 pixels on mobile; each role uses 18-pixel text with a 26-pixel line height and a small three-pixel separation from the name.

Names and roles stay in normal document flow beneath each square portrait. The existing subtle image zoom remains clipped inside the portrait frame. Weelp theme tokens control foreground and muted text colors in light and dark themes.

## Team content and local portraits

The six identities follow the demo carousel while their job titles are rewritten for a travel platform:

| Member           | Weelp role                       | Local portrait target                             |
| ---------------- | -------------------------------- | ------------------------------------------------- |
| Martin Alexander | Founder & CEO                    | `/assets/images/about/team/martin-alexander.webp` |
| Sarah Johnson    | Head of Guest Experience         | `/assets/images/about/team/sarah-johnson.webp`    |
| Mike Anderson    | Travel Operations Manager        | `/assets/images/about/team/mike-anderson.webp`    |
| Emily Carter     | Destination Partnerships Manager | `/assets/images/about/team/emily-carter.webp`     |
| David Thompson   | Experience Design Director       | `/assets/images/about/team/david-thompson.webp`   |
| Jessica Williams | Booking & Finance Manager        | `/assets/images/about/team/jessica-williams.webp` |

The images are downloaded into Weelp and served locally rather than hotlinked from the demo. `AboutImage` continues to provide a stable frame and accessible fallback when an asset cannot load. Reusing third-party portraits does not grant publication rights; ownership or licensing should be confirmed before a public production launch.

## Carousel behavior

The carousel uses the project's installed Swiper package, following the demo's runtime behavior:

- no visible arrows, pagination, or scrollbar;
- manual mouse drag and touch swipe with a grab cursor;
- 600-millisecond slide transition;
- no autoplay, loop, or rewind;
- overflow watching so the carousel remains stable at each breakpoint;
- keyboard Left and Right Arrow navigation while the carousel is focused, without changing its clean visual appearance.

The carousel exposes an accessible region label and a focusable interaction surface. Reduced-motion users receive an immediate transition instead of the 600-millisecond movement. No client-side measurement controls the initial layout, avoiding hydration shifts.

## Responsive behavior

The Swiper breakpoints follow the reference:

| Viewport         | Slides |  Gap |
| ---------------- | -----: | ---: |
| 0–767px          |      1 | 30px |
| 768–991px        |      2 | 30px |
| 992–1199px       |      3 | 30px |
| 1200–1399px      |      3 | 45px |
| 1400px and wider |      3 | 49px |

Desktop uses 140 pixels of section padding above and below. The measured demo reduces that to 120 pixels on tablet and 100 pixels on mobile. The introduction-to-carousel gap is approximately 62 pixels on desktop and 50 pixels on mobile. Mobile keeps one full-width card visible and preserves at least 16 pixels of page padding. Names and roles remain left-aligned beneath the image at every breakpoint.

No breakpoint introduces horizontal page overflow. The section stays contained even above 1,480 pixels because `container-page` supplies the max-width boundary.

## Component boundaries

`AboutTeam.jsx` continues to own the local member array and Team markup. It becomes a client component because Swiper interaction needs browser behavior. No parent interface changes and no API or backend work is introduced.

`AboutPage.module.css` owns the section spacing, centered header geometry, square portrait frame, typography sizing hooks, and any Swiper-specific containment needed by this section. Existing shared `Reveal`, `BlurRevealHeading`, `SectionBadge`, and `AboutImage` components remain unchanged unless implementation reveals a test-backed compatibility issue.

The six downloaded WebP assets live together under `public/assets/images/about/team/` so replacing portraits later does not require markup changes.

## Failure paths worth knowing

- A missing portrait displays the existing stable `AboutImage` fallback without collapsing the slide.
- If JavaScript is delayed, server-rendered member content remains present in source order; Swiper enhancement should not replace the content with a loading shell.
- If reduced motion is enabled, slide transitions become immediate and existing reveal effects follow their shared reduced-motion behavior.
- If the viewport changes across a breakpoint, Swiper recalculates slides per view without changing member order.

## Verification

Focused tests cover:

- all six names and travel roles;
- six local `/assets/images/about/team/*.webp` portrait paths;
- an accessible Team carousel region;
- Swiper modules and the approved breakpoints, gaps, speed, and non-looping behavior;
- three desktop, two tablet, and one mobile slide configuration;
- existing About section order and Team layout marker compatibility.

After implementation, run the focused About tests, TypeScript, lint, and dark-mode guard. Then compare the demo and local pages in visible headed browsers at 1,920, 1,440, 1,024, 768, and 390 pixels. At 1,920 pixels, the local carousel content should be 1,416 pixels wide, cards should be about 440 pixels, gaps should be 48–49 pixels, and the section should remain near 1,050 pixels tall. Every viewport must keep `document.documentElement.scrollWidth <= document.documentElement.clientWidth`.
