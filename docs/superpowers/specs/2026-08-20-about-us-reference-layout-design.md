# About Us Reference Layout Design

## What this redesign changes

The Weelp About Us page will adopt the layout and motion language of the SteelNova reference at `https://demo.casethemes.net/steelnova/about-us/`. This is a structural recreation, not a SteelNova visual rebrand: Weelp keeps its current typography, sage color system, header, footer, routes, and travel-focused identity.

Existing Weelp copy remains where it fits the reference structure. Missing copy uses Lorem Ipsum, as requested, rather than borrowing the reference's industrial content. Existing local images are used initially and remain isolated in data objects so replacement images can be supplied later without changing markup.

## Page structure

The page keeps the existing global navigation and footer. Between them, sections follow the reference in this order:

1. A tall hero with breadcrumb, oversized two-line heading, supporting copy, and the reference's layered background treatment.
2. A two-column company-story section. The left side uses an asymmetric image collage with two overlapping metric blocks; the right side contains the section label, headline, body copy, checklist, and contact action.
3. A full-width statement band with an oversized headline, compact supporting action, and layered travel imagery.
4. A "Why choose us" process section with introductory copy followed by four staggered feature cards. The cards reproduce the reference's stepped/diagonal desktop composition and become a normal single-column stack on mobile.
5. A centered three-member team row with tall portrait cards and name/role overlays. Existing six-member data is reduced to the three-card composition used by the reference.
6. A testimonial section with the reference's split image/content presentation, directional controls, and review-count treatment.
7. A full-width image CTA band with centered copy and a single action.
8. A two-column FAQ section with the accordion on the left and a tall rounded travel image on the right.

## Components and boundaries

The route remains a server component at `src/app/(frontend)/about-us/page.jsx`. Existing About components are retained as the page boundaries and reshaped around the reference layout:

- `AboutHero.jsx` owns only the reference-style hero entrance.
- `AboutStory.jsx` owns the image collage, metrics, copy, checklist, and contact link.
- `AboutOffer.jsx` becomes the full-width trusted-leader statement band.
- `AboutWhyChoose.jsx` owns the four-card stepped process layout.
- `AboutTeam.jsx` owns the three-card portrait row.
- `AboutTestimonials.jsx` owns the synchronized review carousel and controls.
- `AboutCTA.jsx` owns the image-backed call to action.
- `AboutFAQ.jsx` owns the accessible accordion and companion image.

Repeated content stays in local arrays close to the component that renders it. No new API calls or backend work are introduced.

## Motion and interaction

The hero uses the existing CSS-only masked rise so it is visible on first paint. Below-fold content uses the existing `Reveal` intersection-observer component with directional variants matching the reference: image groups enter from the left, copy groups from the right, and centered headings/cards rise upward. Feature and team cards stagger in sequence.

Hover behavior mirrors the reference without copying its colors: images scale subtly within clipped frames, card overlays lift, buttons animate their arrow or fill, and portrait metadata remains legible. The testimonial carousel keeps keyboard-accessible previous/next controls and a restrained slide transition. The FAQ keeps one panel open at a time with height and icon-rotation animation.

All motion respects `prefers-reduced-motion`; content remains visible and interactions become immediate when reduced motion is requested.

## Responsive behavior

Desktop follows the reference's overlaps, stepped cards, wide whitespace, and asymmetric grid. Tablet reduces overlaps and uses two-column card grids where practical. Mobile removes negative offsets that could clip content, stacks all split sections image-first, keeps readable text widths, and preserves the same section order.

## Failure paths worth knowing

Every local image receives a stable container and fallback treatment so a missing asset does not collapse the layout. Carousel and FAQ controls remain usable without animation. No section depends on client-only measurements for its initial layout, avoiding hydration shifts.

## Verification

Component tests will cover the section order, headings, actions, three-person team composition, FAQ state, and carousel controls. Verification then runs type-check, lint, focused tests, and a visible headed-browser pass at `http://localhost:3000/about-us` across desktop and mobile viewport widths. The final browser pass compares section geometry, scroll reveals, hover behavior, and accordion/carousel interaction with the SteelNova reference.
