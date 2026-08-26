# Website-wide blog carousel stagger-right design

**Date:** 2026-08-26

## What changes

Every `BlogSection` will use the same coordinated `stagger-right` entrance already shared by Top Activities, Top Destinations, and Postcards from travelers. This applies to the homepage Your Guide section, Home Gold, city-page Blogs sections, Latest Blogs, and every future `BlogSection` caller.

The shared motion contract is:

- the section header rises into place;
- visible cards enter from 32px to the right with the existing slight scale transition;
- card delays increase by 90ms and cap at the fifth delay index;
- reduced-motion and reveal-bypass states render the section immediately without animation.

## Component approach

`BlogSection` will no longer expose or branch on the `editorial-right` entrance. It will always coordinate one section-level `Reveal`, mark its header with the shared carousel header attribute, and pass `entrance="stagger-right"` with `observeReveal={false}` to `CarouselShell`.

This keeps the behavior inside the shared blog section instead of relying on every page to remember an animation prop. Existing blog mapping, card rendering, navigation controls, responsive breakpoints, pagination, spacing, and empty-state behavior remain unchanged.

The homepage will stop passing its redundant `editorial-right` prop. `BlogSliderSection` will also remove its extra `weelp-fade-up` class so Latest Blogs does not layer a second entrance over the shared section motion. Other callers need no animation prop because the behavior becomes part of `BlogSection` itself.

## Styles

The dedicated guide motion implementation will be removed from `globals.css`:

- `weelpGuideCardReveal`;
- `data-guide-section-entrance='editorial-right'` selectors;
- guide-specific desktop, bypass, and reduced-motion rules.

`BlogSection` will instead emit the existing shared `data-carousel-section-entrance="stagger-right"` and `data-carousel-section-header` markers. `CarouselShell` already supports the matching entrance and delay index contract, so no new animation CSS is needed.

## Verification

Regression tests will be changed first and must fail against the old behavior before implementation. They will lock the new contract at both levels:

- `BlogSection` always emits the shared section/header markers and passes the shared entrance to `CarouselShell`;
- homepage composition no longer opts into `editorial-right`;
- Home Gold and city/blog callers inherit the shared entrance without adding props;
- the obsolete guide-only CSS is absent while the shared carousel motion and reduced-motion rules remain available.

After unit tests, type-check, lint, and code review, the local homepage and a local city page with blogs will be checked in the named visible browser session.
