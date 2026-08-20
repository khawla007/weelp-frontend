# Dashboard CSV Export and Touch Targets Design

## What this design covers

The approved Option A admin dashboard already loads KPI metrics and a 12-month revenue and bookings series through SWR. This change turns the existing Download control into a working CSV export and improves the compact Needs Attention links for touch use. It does not change the Weelp theme, dark mode, sidebar placement, established card radii and padding, graph styling, or dashboard data APIs.

## Export experience

Download stays visible in the dashboard header. It is disabled while either the metrics or overview-chart request is loading, and it remains disabled if either request fails or returns unusable data. Once both datasets are ready, selecting Download creates one browser-generated file named `weelp-dashboard-YYYY-MM-DD.csv`.

The CSV contains two labeled sections:

1. `Dashboard Summary`, with `Metric`, `Value`, and `Change (%)` columns.
2. `Monthly Performance`, with `Month`, `Revenue`, and `Bookings` columns.

Metric titles and values come from the same normalized data rendered by the KPI cards. Monthly rows come from the normalized overview-chart data rendered by the chart. Numeric zero is valid data and must not disable export. Values are escaped with standard CSV quoting so commas, quotes, and line breaks cannot corrupt the file. The export helper also protects spreadsheet users from formula execution by prefixing text cells that begin with `=`, `+`, `-`, or `@`.

The browser creates a UTF-8 CSV Blob, triggers a temporary download link, and revokes the object URL immediately after the click. No dashboard data is sent to a new service and no backend endpoint is added.

## Component boundaries

A focused dashboard export utility owns normalization, CSV serialization, filename generation, and Blob download. Keeping this logic outside `AdminDashboard.jsx` makes it independently testable and prevents the page component from accumulating formatting details.

`AdminDashboard.jsx` owns readiness because it already has the SWR loading, error, and data states. It passes the successful metrics and chart data to the export utility from the Download click handler. The button uses the existing component and approved styling, adds a disabled state, and keeps its current label and icon.

`AttentionSummary.jsx` keeps the approved compact typography. The isolated `View all` link receives a 44px invisible pseudo-element target. Signal links receive enough transparent block padding to make each target at least 44px high; the signal row allocates that space so targets cannot overlap. This may add vertical breathing room inside Needs Attention, but it does not change card radius, padding, or the desktop/mobile grid composition.

## Failure behavior

- Loading metrics or chart data: Download is disabled.
- Metrics or chart request failure: Download is disabled while the existing dashboard alert explains the partial failure.
- Missing, malformed, or non-finite export values: the export utility normalizes them to zero or safe text rather than producing `NaN`, `Infinity`, or broken rows.
- Browser Blob or click failure: the handler does not leave an object URL or temporary link behind.

Booking Mix is not part of this export. Its independent failure must not affect Download readiness as long as KPI and chart data are successful.

## Accessibility and interaction

The disabled Download button exposes its native disabled state and cannot be activated by pointer or keyboard until export data is ready. The working button retains its accessible name, visible focus treatment, and existing visual hierarchy.

Needs Attention destinations remain semantic links. Their effective touch areas are at least 44px high, while typography and color retain the compact Option A appearance and activation regions never overlap.

## Testing strategy

Automated tests will verify:

- Download is disabled during metric or chart loading.
- Download is disabled when metric or chart data fails, but not when only Booking Mix fails.
- Successful activation exports the rendered KPI and monthly data in the specified two-section CSV.
- Zero values export successfully.
- CSV escaping and spreadsheet-formula protection work for hostile text.
- Blob URLs and temporary anchors are cleaned up after success or failure.
- Needs Attention links retain their destinations and receive the expanded non-overlapping hit-area styling.

Verification includes focused Jest tests, TypeScript, lint and dark-mode guard, and a visible headed browser pass on localhost at desktop and 390px mobile widths. The browser pass confirms the downloaded filename and contents, disabled loading behavior, unchanged theme/sidebar/layout, and the rendered touch-target geometry.

## Out of scope

- PDF or Excel workbook export.
- Server-side report generation or storage.
- Booking Mix data in the CSV.
- New date filters or export configuration UI.
- Theme, graph, sidebar, or dashboard layout changes.
