# Admin Dashboard Executive Flow Design

## What this changes

The admin landing page at `/dashboard/admin` will adopt the approved **Executive Flow** layout. The redesign keeps Weelp's existing light and dark theme tokens unchanged. It improves the page through clearer grouping, richer graphs, compact actions, and more useful visual cues rather than applying a new colour scheme.

The shared dashboard shell also receives small layout refinements so the sidebar, header, and page content feel like one system. Navigation labels, routes, permissions, search behaviour, theme switching, and the current collapsed-sidebar behaviour remain unchanged.

## Visual direction

The page keeps the existing Weelp surface hierarchy:

- light mode continues to use the current white and muted surfaces with sage/teal brand accents;
- dark mode continues to use the canonical deep-green page, card, sidebar, text, and border tokens from `src/app/globals.css`;
- primary actions continue to use `weelp-sage-deep`;
- no dashboard-only theme palette or hard-coded replacement surface colour is introduced.

Secondary colours are limited to data meaning. Positive growth uses the existing success role, negative movement uses destructive/coral, warnings use amber, and chart series may use accessible blue or violet accents. These colours appear only in percentages, trend arrows, chart lines, data points, legends, and statuses. They do not recolour the dashboard shell or navigation.

## Page composition

The dashboard follows a top-to-bottom reading order:

1. A compact title row identifies the admin dashboard and keeps the download action.
2. Four metric cards show revenue, bookings, active users, and activities. Each card pairs its current value and month-over-month change with a small sparkline.
3. The main analytics row gives most of the width to the revenue-and-bookings chart. A smaller booking-summary panel sits beside it.
4. A lower utility row contains compact quick actions and an attention summary.
5. Recent sales remain available in the analytics area without dominating the page.

On wide screens, the main chart and secondary panel use an asymmetric grid. On tablets they stack into one column. Metric cards collapse from four columns to two and then one where necessary. The mobile sidebar and header continue to use their existing responsive behaviour.

## Metrics and trend cards

The existing metric endpoint remains the source of the four totals and percentage changes. The card component will gain an optional sparkline input and an accent role. A card still renders correctly when no history is available, so the API error and static fallback paths do not produce an empty chart frame.

Trend indicators communicate direction with icon, text, and colour together. A positive value uses an upward arrow, a negative value uses a downward arrow, and zero uses a neutral marker. Colour is supplementary and never the only signal.

Monthly sparkline values will be derived from the same twelve-month overview response used by the main graph where the metric has a matching series. Metrics without historical data use a restrained decorative trend treatment only if it represents real data; otherwise the sparkline is omitted.

## Main graph

The current single-colour bar chart becomes a composed Recharts visualization:

- revenue is a sage area/line series with a subtle token-based fill;
- monthly bookings are a contrasting blue line;
- selected or hovered data points use a coral pointer;
- horizontal grid lines stay quiet and resolve through the existing border token;
- a tooltip reports the month, formatted revenue, and booking count;
- a compact legend names each series;
- axes remain readable in both themes and use semantic foreground tokens rather than fixed light-mode colours.

The overview endpoint will add a `bookings` number to each existing monthly row while retaining `name` and `total`. This is an additive response change, so current consumers remain compatible. Revenue continues to count completed orders; bookings continue to exclude cancelled orders, matching the dashboard metrics.

The chart must render a meaningful zero state when a month has no data. It must not replace real empty responses with development-only revenue values. Recharts animation respects reduced-motion preferences.

## Secondary insights and actions

The secondary panel summarizes booking volume without inventing category data the backend does not currently provide. It shows the current booking total, the monthly change indicator, and a compact recent-sales list sourced from the existing recent-sales endpoint.

Quick actions keep the existing destinations and `NavigationLink` behaviour. Their cards become smaller and more scan-friendly, borrowing the compact treatment from the approved Bento concept while retaining the Executive Flow layout. The attention summary uses only information already available to the dashboard; new approval or refund counts are outside this iteration unless a reliable endpoint already exposes them during implementation.

## Loading, empty, and failure paths

The page keeps synchronized loading so the layout does not jump as individual requests finish. Skeletons will mirror the new card, chart, secondary-panel, and action geometry.

If one request fails, unaffected sections still render. The existing error notice remains visible, and the failed section displays a quiet local fallback. Empty chart data renders labelled axes and a no-data message rather than development mock values. Empty recent sales retain the existing explicit empty state.

## Accessibility and motion

Charts include text labels or legends for every series, and tooltips are not the only source of essential values. Trend direction is conveyed by icon and copy in addition to colour. Focus rings, contrast, theme switching, and keyboard navigation continue to use the shared Weelp patterns.

Entry motion stays restrained and uses the existing dashboard motion frame. Hover effects may adjust border, background, or shadow but must not move layout. Reduced-motion mode disables non-essential chart and card animation.

## Verification

Focused tests will cover metric direction states, optional sparklines, chart data mapping, additive monthly booking data, empty states, and the unchanged quick-action routes. Backend tests will confirm the twelve-month overview response, completed-order revenue rules, cancelled-order exclusion, and zero-filled missing months.

After focused tests, frontend type-check, frontend lint, and backend tests pass, the local dashboard will be reviewed in the required visible browser at desktop, tablet, and mobile widths. Both light and dark modes will be checked to confirm that the existing Weelp theme colours are unchanged, graph accents remain limited to data, labels are readable, and no horizontal overflow appears.

## Out of scope

- changing the global Weelp light or dark theme tokens;
- recolouring the sidebar, header, page canvas, or cards with a new palette;
- changing dashboard navigation, permissions, or search behaviour;
- adding fabricated analytics, destination rankings, funnels, targets, or alerts;
- redesigning every admin subpage in this iteration;
- changing order, user, activity, or revenue business rules beyond the additive monthly booking series.
