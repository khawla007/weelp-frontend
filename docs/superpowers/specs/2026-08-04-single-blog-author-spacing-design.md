# Single Blog Author Spacing Design

## What changes

The single-blog author row will no longer add padding above or on either side. It will retain 24px of bottom padding so the author metadata remains separated from the article body.

The blog hero keeps its existing 40px mobile bottom margin (`mb-10`). This matches the common mobile hero handoff used by the Home, About, Special, Transfers, Holiday, Tours, Blogs, Region, and single-product pages. Removing the author row's 24px top padding reduces the current combined visual handoff from 64px to the intended 40px.

## Scope

- Change only the shared `BlogAuthorInfo` wrapper spacing.
- Keep the single-blog hero's existing `mb-10 md:mb-16 lg:mb-24` contract.
- Preserve author content, alignment behavior, article spacing, and desktop layout.

## Verification

A focused component test will assert that the author wrapper keeps bottom padding while omitting top and horizontal padding. The local single-blog page will then be checked in the visible browser at mobile and desktop widths.
