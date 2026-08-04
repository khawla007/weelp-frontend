# Single Blog Taxonomy Sidebar Design

## What changes

The single-blog taxonomy sidebar will keep its existing category and tag filter links, but present them as plain inline text instead of bordered button-like blocks. Each taxonomy group will wrap naturally when several labels are present.

On mobile, the article and sidebar remain in one vertical flow. The sidebar will render once, span the available width, and avoid the nested horizontal padding and narrow list width that currently make it appear like a second inset column.

## Component boundaries

- `SingleBlogModules.jsx` owns taxonomy label/link styling and inline wrapping.
- `ContentSection.jsx` owns the responsive article/sidebar layout and mobile spacing.
- Existing filter URLs, fallback labels without slugs, headings, and the share section remain unchanged.

## Responsive behavior

- Mobile: one full-width taxonomy/share section below the article, compact vertical spacing, inline wrapping text.
- Desktop: article and sidebar remain side by side, with the sidebar retaining intentional separation from the article.

## Verification

Component tests will assert that taxonomy items no longer use button decoration, lists use inline wrapping, and the sidebar has a single mobile layout container. The result will also be checked in the visible localhost browser at mobile and desktop widths.
