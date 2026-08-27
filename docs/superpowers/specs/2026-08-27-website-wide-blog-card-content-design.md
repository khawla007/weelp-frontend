# Website-wide blog card content design

**Date:** 2026-08-27

## What this changes

Every public blog card will use one shared editorial composition. This includes the homepage **Your Guide** carousel, Home Gold, city-page blog sections, Latest Blogs, the `/blogs` results grid, and future surfaces rendered through the shared blog card.

Each card will present:

- the featured image;
- the first available category;
- the blog title, clamped to two lines;
- the blog excerpt, clamped to two lines;
- the first available tag and a `+N` indicator when more tags exist.

Missing optional values will not leave empty placeholders. A blog without a category, excerpt, or tag will simply omit that element while preserving the content order.

## Shared data contract

`mapBlogToItemCard` remains the single adapter between public blog responses and the editorial card. In addition to its existing identity, image, title, URL, and category fields, it will normalize:

- `excerpt` into `shortDescription`;
- the first valid `tag_name` or `name` into `tag`;
- the number of remaining valid tags into `additionalTagCount`.

The mapper will ignore blank or malformed taxonomy values. It will not pass the full tag collection into the card because the approved design needs one visible tag and a count, not an unbounded list.

The backend already includes `excerpt`, `categories`, and `tags` in the public blog list response, so this change does not require a backend endpoint or database change.

## Card layout and equal heights

The editorial `ItemCard` variant will own the category, title, excerpt, and tag presentation so every caller receives the same result without page-specific markup.

The card surface and its clickable content will fill the height supplied by their parent. Grid items and carousel slides will also expose full-height children. On multi-column layouts, the browser will therefore size each row from its tallest card and stretch the shorter cards in that row to match it. A tall card in one row will not force unrelated rows to use the same height.

The excerpt and tag area will sit below the title. The tag row will be pushed toward the bottom of the flexible content area, keeping tag badges aligned when neighboring cards have different title or excerpt lengths. On single-column mobile layouts, each card keeps the height determined by its own content because there is only one card in the row.

## Visual limits

The category remains the small uppercase taxonomy badge already used by editorial cards. The excerpt uses quieter body styling and a two-line clamp so it helps readers scan without competing with the title. The primary tag uses a visually distinct compact badge; `+N` appears beside it only when additional valid tags exist.

Titles and excerpts are both clamped to two lines. This prevents unusually long content from making an entire row excessively tall while still allowing the equal-height behavior to adapt to legitimate differences such as missing metadata.

## Accessibility and navigation

The entire card remains one navigation target with the existing `Read {title}` accessible name. Category and tag badges remain descriptive text inside that link; no nested links or buttons will be introduced. Clamping is visual only, so the full title continues to provide the card's accessible name.

## Verification

Tests will cover the shared behavior rather than duplicating page-specific assertions:

- the blog mapper normalizes excerpts and tags, counts only valid additional tags, and handles missing values;
- the editorial card renders category, title, excerpt, primary tag, and `+N` when supplied;
- the editorial card omits optional fields cleanly;
- the `/blogs` grid and shared `BlogSection` continue to route data through the editorial card;
- grid items, carousel slides, and editorial card roots expose the full-height contract.

After type-check and lint, the homepage, Home Gold, a city page with blogs, Latest Blogs, and `/blogs` will be checked in the named visible local browser session at desktop and mobile widths. The desktop checks will confirm that cards match the tallest card in their own row while separate rows remain independent.

## Out of scope

This work will not change blog filtering, sorting, pagination, publication dates, backend payloads, card navigation URLs, carousel motion, or the single-blog page layout.
