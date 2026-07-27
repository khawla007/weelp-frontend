# Transfer Section Spacing Design

## Goal

Simplify the `/transfers` review and FAQ layout so each section owns its
container and responsive spacing. The FAQ must not receive an automatic top
margin from a shared wrapper, while the review section must provide deliberate
bottom spacing at every viewport size.

## Current behavior

One non-semantic `div` wraps both Featured Reviews and FAQs. It owns
`container-page`, the page-bottom padding, and `space-y-8`.

The wrapper was originally useful for sharing horizontal alignment and spacing
between both blocks. It is now redundant because the home-page pattern puts
`container-page` directly on each semantic section. Its `space-y-8` rule also
adds an implicit top margin to the FAQ section, which makes the spacing owner
unclear.

## Approved approach

Remove the shared wrapper and let each semantic section own its layout:

- Featured Reviews receives `container-page productSlider`.
- Featured Reviews receives bottom padding of 40px on mobile, 64px from the
  768px tablet breakpoint, and 96px from the 1024px desktop breakpoint.
- FAQs receives its own `container-page`.
- FAQs has no top-margin utility.
- FAQs keeps equivalent responsive bottom padding so the space before the
  footer does not regress.
- The Featured Reviews heading and slider remain conditional on review data.
- FAQs continues to render whether transfer reviews exist or not.

This follows the home-page section pattern and removes the layout side effect
caused by `space-y-8`.

## Data and behavior

No data fetching, review filtering, accordion behavior, or responsive
typography changes. This is a structural and spacing-only change.

## Verification

Automated tests will assert:

- The redundant shared wrapper is absent.
- The review section owns its container and responsive bottom padding.
- The FAQ section owns its container and has no top-margin utility.
- Review visibility remains conditional.

The local page will then be checked in the visible browser at representative
mobile, tablet, and desktop widths. Each viewport must show the intended
40px, 64px, or 96px review bottom padding, zero FAQ top margin, aligned
containers, and no horizontal overflow.

## Out of scope

- Review or FAQ content changes.
- Typography changes.
- Slider behavior changes.
- Backend or production changes.

## Approved FAQ spacing follow-up

The FAQ heading will keep 24px of bottom padding but no top padding. Its
page-specific heading classes change from `py-6` to `pb-6`.

The FAQ section will keep `container-page` but remove `pb-10 md:pb-16
lg:pb-24`, leaving no section-owned bottom padding at any viewport. Featured
Reviews spacing remains unchanged.

Tests and visible-browser checks will verify:

- The FAQ heading computes to `padding-top: 0px` and `padding-bottom: 24px`.
- The FAQ section computes to `padding-bottom: 0px`.
- The FAQ section still has no top margin.
- Mobile, tablet, and desktop layouts remain aligned without horizontal
  overflow.
