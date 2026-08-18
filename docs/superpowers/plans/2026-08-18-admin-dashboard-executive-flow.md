# Admin Dashboard Executive Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `/dashboard/admin` with the approved Executive Flow layout, richer real-data graphs, compact actions, and polished responsive composition while preserving Weelp's existing light and dark theme colours.

**Architecture:** Extend the existing Laravel overview response with monthly booking counts, then keep all dashboard fetching in `AdminDashboard.jsx`. Dedicated presentation components receive plain data and render metric sparklines, the composed overview graph, recent sales, and quick actions. The shared admin shell receives spacing and surface refinements only; global theme tokens, routes, permissions, and search behaviour do not change.

**Tech Stack:** Laravel 12, PHPUnit, Next.js 16 App Router, React 19, TypeScript/JavaScript, SWR, Recharts, Tailwind CSS, Jest, React Testing Library.

---

## File map

**Backend repository**

- Create `backend/tests/Feature/Admin/DashboardOverviewChartTest.php` — API contract tests for revenue, bookings, cancelled orders, and zero-filled months.
- Modify `backend/app/Http/Controllers/Admin/DashboardController.php` — add monthly non-cancelled booking counts to the existing overview rows.

**Frontend repository**

- Create `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/__tests__/Overview.test.jsx` — graph series, tooltip, and empty-state tests.
- Create `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/__tests__/MetricCards.test.jsx` — metric direction, formatting, and sparkline tests.
- Create `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/__tests__/AdminDashboard.test.jsx` — Executive Flow composition and partial-failure tests.
- Create `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/__tests__/AttentionSummary.test.jsx` — attention success, loading, error, and clear-state tests.
- Create `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/DashboardMetricCard.jsx` — dashboard-specific metric card and optional sparkline.
- Create `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/OverviewTooltip.tsx` — formatted, accessible chart tooltip.
- Create `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/BookingSummary.jsx` — booking total/change and recent-sales secondary panel.
- Create `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/AttentionSummary.jsx` — real unseen-order, unseen-review, and cancellation attention signals.
- Modify `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/AdminDashboard.jsx` — new page composition and data wiring.
- Modify `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/metric-cards.jsx` — map overview history into the two real sparkline series.
- Modify `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/overview.tsx` — replace the bar chart with an area-and-line composed chart.
- Modify `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/recent-sales.jsx` — compact secondary-panel presentation.
- Modify `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/quick-actions.jsx` — compact Bento-style actions within Executive Flow.
- Modify `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/DashboardSkeleton.jsx` — skeleton geometry matching the new layout.
- Modify `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/constants/overview-chart.constants.js` — semantic chart roles and formatters; remove development fallback data.
- Modify `frontend/src/app/components/Pages/DASHBOARD/admin/header.jsx` — quiet backdrop and spacing polish using existing semantic tokens.
- Modify `frontend/src/app/components/Pages/DASHBOARD/admin/app-sidebar.jsx` — align the sidebar header treatment with the polished shell.
- Modify `frontend/src/app/(dashboard)/dashboard/admin/layout.js` — responsive content width and padding.
- Modify `frontend/src/app/components/Pages/DASHBOARD/admin/__tests__/AdminHeaderTheme.test.jsx` — lock semantic header surfaces.
- Modify `frontend/src/app/components/Pages/DASHBOARD/admin/__tests__/AppSidebar.test.jsx` — lock semantic sidebar treatment.

## Task 1: Add monthly booking counts to the dashboard API

**Files:**

- Create: `backend/tests/Feature/Admin/DashboardOverviewChartTest.php`
- Modify: `backend/app/Http/Controllers/Admin/DashboardController.php`

- [ ] **Step 1: Write the failing feature test**

```php
<?php

namespace Tests\Feature\Admin;

use App\Models\Order;
use App\Models\OrderPayment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class DashboardOverviewChartTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_overview_returns_revenue_and_non_cancelled_bookings_for_all_months(): void
    {
        Carbon::setTestNow('2026-08-18 12:00:00');
        $admin = User::factory()->create([
            'role' => User::ROLE_SUPER_ADMIN,
            'status' => User::STATUS_ACTIVE,
        ]);

        $completed = Order::factory()->create([
            'status' => 'completed',
            'created_at' => '2026-01-10 10:00:00',
        ]);
        OrderPayment::factory()->create([
            'order_id' => $completed->id,
            'payment_method' => 'credit_card',
            'total_amount' => 1200,
        ]);

        Order::factory()->create([
            'status' => 'pending',
            'created_at' => '2026-02-10 10:00:00',
        ]);

        $cancelled = Order::factory()->create([
            'status' => 'cancelled',
            'created_at' => '2026-01-15 10:00:00',
        ]);
        OrderPayment::factory()->create([
            'order_id' => $cancelled->id,
            'payment_method' => 'credit_card',
            'total_amount' => 900,
        ]);

        $response = $this->actingAs($admin, 'api')
            ->getJson('/api/admin/dashboard/overview-chart');

        $response->assertOk()
            ->assertJsonCount(12, 'data')
            ->assertJsonPath('data.0', ['name' => 'Jan', 'total' => 1200, 'bookings' => 1])
            ->assertJsonPath('data.1', ['name' => 'Feb', 'total' => 0, 'bookings' => 1])
            ->assertJsonPath('data.11', ['name' => 'Dec', 'total' => 0, 'bookings' => 0]);
    }
}
```

- [ ] **Step 2: Run the focused backend test and confirm the contract fails**

Run from `backend`:

```bash
php artisan test tests/Feature/Admin/DashboardOverviewChartTest.php
```

Expected: FAIL with HTTP 500 because SQLite does not provide MySQL's `MONTH()` function. This proves the existing overview query is not portable before the response contract is extended.

- [ ] **Step 3: Make the existing revenue aggregate portable**

PHPUnit uses SQLite while production uses MySQL, so replace the current MySQL-only `MONTH(...)` expressions with a fixed, driver-aware helper:

```php
private function monthExpression(string $column): string
{
    return DB::connection()->getDriverName() === 'sqlite'
        ? "CAST(strftime('%m', {$column}) AS INTEGER)"
        : "MONTH({$column})";
}
```

At the beginning of `getOverviewChart()`, define `$monthExpression = $this->monthExpression('orders.created_at')`. Replace only the existing revenue aggregate first:

```php
$monthlyRevenue = DB::table('orders')
    ->leftJoin('order_payments', 'orders.id', '=', 'order_payments.order_id')
    ->selectRaw("{$monthExpression} as month, SUM(order_payments.total_amount) as total")
    ->whereYear('orders.created_at', $currentYear)
    ->where('orders.status', 'completed')
    ->groupByRaw($monthExpression)
    ->orderBy('month')
    ->get();

```

- [ ] **Step 4: Rerun the test and confirm the contract is now the only failure**

```bash
php artisan test tests/Feature/Admin/DashboardOverviewChartTest.php
```

Expected: FAIL because the endpoint now responds successfully but `data.*.bookings` is absent.

- [ ] **Step 5: Add the booking aggregate and merge it into all twelve rows**

```php
$monthlyBookings = DB::table('orders')
    ->selectRaw("{$monthExpression} as month, COUNT(*) as total")
    ->whereYear('orders.created_at', $currentYear)
    ->where('orders.status', '!=', 'cancelled')
    ->groupByRaw($monthExpression)
    ->orderBy('month')
    ->get();
```

Replace the row construction inside the month loop with:

```php
$revenue = $monthlyRevenue->firstWhere('month', $month);
$bookings = $monthlyBookings->firstWhere('month', $month);

$chartData[] = [
    'name' => $name,
    'total' => (int) ($revenue->total ?? 0),
    'bookings' => (int) ($bookings->total ?? 0),
];
```

- [ ] **Step 6: Run the error-handling review, then focused and full backend tests**

Invoke `error-handling-patterns` first and verify that the endpoint retains its established JSON error response on query failure. Then run:

```bash
php artisan test tests/Feature/Admin/DashboardOverviewChartTest.php
php artisan test
```

Expected: the focused test and the complete backend suite PASS.

- [ ] **Step 7: Check the backend diff and leave changes uncommitted**

Run `git diff --check`. Do not commit; the mandatory code-review, simplify fallback, and final verification gate must run first.

## Task 2: Build the composed overview graph

**Files:**

- Create: `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/__tests__/Overview.test.jsx`
- Create: `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/OverviewTooltip.tsx`
- Modify: `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/overview.tsx`
- Modify: `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/constants/overview-chart.constants.js`

- [ ] **Step 1: Write failing tests for both series and the empty state**

Mock Recharts with inspectable elements, then assert the data keys and accessible fallback:

```jsx
import { render, screen } from '@testing-library/react';

import { Overview } from '../overview';
import { OverviewTooltip } from '../OverviewTooltip';

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  ComposedChart: ({ children }) => <div data-testid="composed-chart">{children}</div>,
  Area: ({ dataKey, name, yAxisId }) => <div data-testid={`area-${dataKey}`} data-name={name} data-axis={yAxisId} />,
  Line: ({ dataKey, name, yAxisId }) => <div data-testid={`line-${dataKey}`} data-name={name} data-axis={yAxisId} />,
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: ({ yAxisId }) => <div data-testid={`axis-${yAxisId}`} />,
  Tooltip: () => null,
  Legend: () => null,
}));

describe('Overview', () => {
  it('renders revenue and bookings as separate chart series', () => {
    render(<Overview data={[{ name: 'Jan', total: 1200, bookings: 4 }]} />);

    expect(screen.getByTestId('area-total')).toBeInTheDocument();
    expect(screen.getByTestId('line-bookings')).toBeInTheDocument();
    expect(screen.getByTestId('area-total')).toHaveAttribute('data-name', 'Revenue');
    expect(screen.getByTestId('line-bookings')).toHaveAttribute('data-name', 'Bookings');
    expect(screen.getByTestId('area-total')).toHaveAttribute('data-axis', 'revenue');
    expect(screen.getByTestId('line-bookings')).toHaveAttribute('data-axis', 'bookings');
    expect(screen.getByLabelText('Monthly revenue and bookings chart')).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Monthly revenue and bookings data' })).toHaveTextContent('Jan$1,2004');
  });

  it('keeps the labelled chart frame while showing the empty message', () => {
    render(<Overview data={[{ name: 'Jan', total: 0, bookings: 0 }]} />);

    expect(screen.getByText('No revenue or booking data for this year yet.')).toBeInTheDocument();
    expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    expect(screen.getByTestId('axis-revenue')).toBeInTheDocument();
    expect(screen.getByTestId('axis-bookings')).toBeInTheDocument();
  });

  it('formats both values in the tooltip', () => {
    render(<OverviewTooltip active label="Jan" payload={[{ dataKey: 'total', value: 1200 }, { dataKey: 'bookings', value: 4 }]} />);

    expect(screen.getByText('Revenue: $1,200')).toBeInTheDocument();
    expect(screen.getByText('Bookings: 4')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the graph test and verify it fails**

```bash
npx jest 'src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/__tests__/Overview.test.jsx' --runInBand
```

Expected: FAIL because the component still renders `BarChart`, lacks dual axes and accessible data, and uses development fallback values.

- [ ] **Step 3: Replace development constants with semantic chart configuration**

Keep only configuration and formatters in `overview-chart.constants.js`:

```js
export const chartConfig = {
  height: 320,
  revenueColor: 'hsl(var(--weelp-sage-deep))',
  bookingsColor: 'hsl(var(--info))',
  pointerColor: 'hsl(var(--weelp-discount))',
  gridColor: 'hsl(var(--border))',
  axisColor: 'hsl(var(--muted-foreground))',
  axisFontSize: 12,
  revenueFormatter: (value) => `$${Number(value).toLocaleString()}`,
  bookingsFormatter: (value) => Number(value).toLocaleString(),
};
```

- [ ] **Step 4: Implement the tooltip and composed chart**

`OverviewTooltip.tsx` receives Recharts tooltip props and renders only when active:

```tsx
type TooltipEntry = { dataKey?: string; value?: number };

export function OverviewTooltip({ active, label, payload }: { active?: boolean; label?: string; payload?: TooltipEntry[] }) {
  if (!active || !payload?.length) return null;

  const revenue = payload.find((entry) => entry.dataKey === 'total')?.value ?? 0;
  const bookings = payload.find((entry) => entry.dataKey === 'bookings')?.value ?? 0;

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-popover-foreground shadow-lg">
      <p className="text-xs font-semibold">{label}</p>
      <p className="mt-1 text-xs text-weelp-sage-text">Revenue: ${Number(revenue).toLocaleString()}</p>
      <p className="text-xs text-info">Bookings: {Number(bookings).toLocaleString()}</p>
    </div>
  );
}
```

After the loading and empty guards, render this chart body:

```tsx
<div role="img" aria-label="Monthly revenue and bookings chart" style={{ height: chartConfig.height }}>
  <ResponsiveContainer width="100%" height="100%">
    <ComposedChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: 0 }}>
      <defs>
        <linearGradient id="dashboardRevenueFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={chartConfig.revenueColor} stopOpacity={0.3} />
          <stop offset="95%" stopColor={chartConfig.revenueColor} stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid vertical={false} stroke={chartConfig.gridColor} strokeDasharray="3 3" />
      <XAxis dataKey="name" stroke={chartConfig.axisColor} fontSize={chartConfig.axisFontSize} tickLine={false} axisLine={false} />
      <YAxis yAxisId="revenue" stroke={chartConfig.axisColor} fontSize={chartConfig.axisFontSize} tickLine={false} axisLine={false} tickFormatter={chartConfig.revenueFormatter} />
      <YAxis yAxisId="bookings" orientation="right" stroke={chartConfig.axisColor} fontSize={chartConfig.axisFontSize} tickLine={false} axisLine={false} allowDecimals={false} />
      <Tooltip content={<OverviewTooltip />} cursor={{ stroke: chartConfig.pointerColor, strokeDasharray: '4 4' }} />
      <Legend />
      <Area yAxisId="revenue" type="monotone" dataKey="total" name="Revenue" stroke={chartConfig.revenueColor} fill="url(#dashboardRevenueFill)" strokeWidth={3} activeDot={{ r: 5, fill: chartConfig.pointerColor }} isAnimationActive={false} />
      <Line yAxisId="bookings" type="monotone" dataKey="bookings" name="Bookings" stroke={chartConfig.bookingsColor} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: chartConfig.pointerColor }} connectNulls={false} isAnimationActive={false} />
    </ComposedChart>
  </ResponsiveContainer>
  {data.every((row) => Number(row.total) === 0 && Number(row.bookings) === 0) ? <p className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-muted-foreground">No revenue or booking data for this year yet.</p> : null}
</div>
<table className="sr-only" aria-label="Monthly revenue and bookings data">
  <thead><tr><th>Month</th><th>Revenue</th><th>Bookings</th></tr></thead>
  <tbody>{data.map((row) => <tr key={row.name}><th>{row.name}</th><td>{chartConfig.revenueFormatter(row.total)}</td><td>{chartConfig.bookingsFormatter(row.bookings)}</td></tr>)}</tbody>
</table>
```

Wrap the chart and table in a fragment. Give the chart wrapper `className="relative"`. If `data` is missing or has no rows, normalize it to the twelve zero-filled month rows exported from the constants file; never restore development revenue values. The shared `DashboardMotionFrame` supplies page entry motion, while static Recharts series avoid motion for users who request reduction.

- [ ] **Step 5: Run the graph test**

```bash
npx jest 'src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/__tests__/Overview.test.jsx' --runInBand
```

Expected: PASS.

- [ ] **Step 6: Run the required post-change checks and leave changes uncommitted**

```bash
npx tsc --noEmit
npm run lint
git diff --check
```

Invoke `error-handling-patterns` before the commands above, then open `/dashboard/admin` in the named headed browser and confirm the chart frame, empty message, legend, and tooltip render without changing either theme. Do not commit yet.

## Task 3: Add metric cards with meaningful trend treatments

**Files:**

- Create: `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/DashboardMetricCard.jsx`
- Create: `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/__tests__/MetricCards.test.jsx`
- Modify: `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/metric-cards.jsx`
- Modify: `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/AdminDashboard.jsx`

- [ ] **Step 1: Write failing metric tests**

```jsx
import { render, screen } from '@testing-library/react';

import { MetricCards } from '../metric-cards';

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  LineChart: ({ children }) => <div data-testid="sparkline">{children}</div>,
  Line: () => null,
}));

const metrics = [
  { title: 'Total Revenue', total: 1200, change: 18.4 },
  { title: 'Bookings', total: 4, change: -5 },
  { title: 'Active Users', total: 8, change: 0 },
  { title: 'Total Activities', total: 3, change: 0 },
];

describe('MetricCards', () => {
  it('formats values, directions, and only real historical sparklines', () => {
    render(
      <MetricCards
        data={metrics}
        overviewData={[
          { name: 'Jan', total: 1200, bookings: 4 },
          { name: 'Feb', total: 900, bookings: 3 },
        ]}
      />,
    );

    expect(screen.getByText('$1,200')).toBeInTheDocument();
    expect(screen.getByText('+18.4%').closest('p')).toHaveClass('text-success');
    expect(screen.getByText('-5%').closest('p')).toHaveClass('text-destructive');
    expect(screen.getByText('Increase')).toBeInTheDocument();
    expect(screen.getByText('Decrease')).toBeInTheDocument();
    expect(screen.getAllByText('No change')).toHaveLength(2);
    expect(screen.getAllByTestId('sparkline')).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run the focused test and confirm failure**

```bash
npx jest 'src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/__tests__/MetricCards.test.jsx' --runInBand
```

Expected: FAIL because `overviewData`, sparklines, and explicit zero direction are not implemented.

- [ ] **Step 3: Implement `DashboardMetricCard`**

The component accepts this explicit interface:

```jsx
export function DashboardMetricCard({ label, icon, value, change = 0, history = [], historyKey, accent = 'sage' }) {
  const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'flat';
  const changeClass = direction === 'up' ? 'text-success' : direction === 'down' ? 'text-destructive' : 'text-warning';
  const TrendIcon = direction === 'up' ? TrendingUp : direction === 'down' ? TrendingDown : Minus;
  const directionLabel = direction === 'up' ? 'Increase' : direction === 'down' ? 'Decrease' : 'No change';
  const displayChange = `${change > 0 ? '+' : ''}${change}%`;

  return (
    <Card className="group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-[background-color,border-color,box-shadow] hover:bg-accent/40 hover:shadow-md motion-reduce:transition-none">
      <div className="p-5">
        <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>{label}</span>{icon}
        </div>
        <div className="mt-3 flex items-end justify-between gap-4">
          <div><div className="text-2xl font-bold tracking-tight text-foreground">{value}</div><p className={`mt-1 flex items-center gap-1 text-xs font-semibold ${changeClass}`}><TrendIcon className="size-3.5" aria-hidden="true" /><span>{displayChange}</span><span className="sr-only">{directionLabel}</span><span className="font-medium text-muted-foreground">from last month</span></p></div>
          {historyKey && history.length > 0 ? <MetricSparkline data={history} dataKey={historyKey} accent={accent} /> : null}
        </div>
      </div>
    </Card>
  );
}
```

Import `TrendingUp`, `TrendingDown`, and `Minus` from `lucide-react`, `Card` from the existing shadcn card module, and the three Recharts sparkline primitives at the top of the file.

Define `MetricSparkline` in the same file with semantic colours only:

```jsx
const sparklineColors = {
  sage: 'hsl(var(--weelp-sage-deep))',
  info: 'hsl(var(--info))',
};

function MetricSparkline({ data, dataKey, accent }) {
  return (
    <div className="h-10 w-20 shrink-0" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 3, right: 2, bottom: 3, left: 2 }}>
          <Line type="monotone" dataKey={dataKey} stroke={sparklineColors[accent]} strokeWidth={2.25} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 4: Wire real overview history into `MetricCards`**

Add an `overviewData` prop. Pass `historyKey="total"` only to revenue and `historyKey="bookings"` only to bookings. Do not draw invented histories for users or activities. Update `AdminDashboard.jsx` to call:

```jsx
<MetricCards loading={isLoading} data={metricsError ? null : metricsData} overviewData={chartError ? [] : chartData} />
```

- [ ] **Step 5: Run metric and graph tests**

```bash
npx jest 'src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/__tests__/MetricCards.test.jsx' 'src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/__tests__/Overview.test.jsx' --runInBand
```

Expected: PASS.

- [ ] **Step 6: Run the required post-change checks and leave changes uncommitted**

```bash
npx tsc --noEmit
npm run lint
git diff --check
```

Invoke `error-handling-patterns` before the commands above, then refresh the named headed browser and confirm positive, negative, and neutral indicators remain understandable in both themes. Do not commit yet.

## Task 4: Compose the Executive Flow dashboard body

**Files:**

- Create: `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/__tests__/AdminDashboard.test.jsx`
- Create: `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/__tests__/AttentionSummary.test.jsx`
- Create: `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/BookingSummary.jsx`
- Create: `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/AttentionSummary.jsx`
- Modify: `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/AdminDashboard.jsx`
- Modify: `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/recent-sales.jsx`
- Modify: `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/quick-actions.jsx`
- Modify: `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/DashboardSkeleton.jsx`
- Modify: `frontend/src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/__tests__/QuickActions.test.jsx`

- [ ] **Step 1: Write the failing page-composition test**

Mock SWR by key and mock chart primitives only. Assert the real headings, action links, and partial-error behaviour:

```jsx
import { render, screen, within } from '@testing-library/react';
import useSWR from 'swr';

import { AdminDashboardPage } from '../AdminDashboard';

jest.mock('swr');

jest.mock('../overview', () => ({ Overview: () => <div>Overview graph</div> }));
jest.mock('@/hooks/api/admin/navigationUnseen', () => ({
  useAdminNavigationUnseen: () => ({ counts: { orders: 3, reviews: 2 }, attention: { cancellations: true }, isLoading: false }),
}));

const responses = {
  '/admin/dashboard/metrics': { data: [{ title: 'Total Revenue', total: 1200, change: 10 }, { title: 'Bookings', total: 1284, change: 12.1 }], isLoading: false },
  '/admin/dashboard/overview-chart': { data: [{ name: 'Jan', total: 1200, bookings: 4 }], isLoading: false },
  '/admin/dashboard/recent-sales': { data: { data: [{ username: 'Maya Chen', email: 'maya@example.test', amount: 500 }], monthly_total: 2500 }, isLoading: false },
};

describe('AdminDashboardPage', () => {
  it('renders the Executive Flow sections', () => {
    useSWR.mockImplementation((key) => responses[key]);
    render(<AdminDashboardPage />);

    expect(screen.getByRole('heading', { name: 'Super Admin Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Revenue & bookings' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Booking summary' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Recent sales' })).toBeInTheDocument();
    const bookingSummary = within(screen.getByRole('region', { name: 'Booking summary' }));
    expect(bookingSummary.getByText('1,284')).toBeInTheDocument();
    expect(bookingSummary.getByText('+12.1%')).toBeInTheDocument();
    expect(bookingSummary.getByText('Monthly sales: $2,500')).toBeInTheDocument();
    expect(bookingSummary.getByText('Maya Chen')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Quick actions' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Needs attention' })).toBeInTheDocument();
    expect(screen.getByText('3 unseen orders')).toBeInTheDocument();
    expect(screen.getByText('Cancellation request needs review')).toBeInTheDocument();
  });

  it('keeps successful sections visible when recent sales fail', () => {
    useSWR.mockImplementation((key) => key === '/admin/dashboard/recent-sales' ? { error: new Error('failed'), isLoading: false } : responses[key]);
    render(<AdminDashboardPage />);

    expect(screen.getByText("Couldn't load some dashboard data. Showing placeholders where possible.")).toBeInTheDocument();
    expect(screen.getByText('Overview graph')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the page and quick-action tests and confirm failure**

```bash
npx jest 'src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/__tests__/AdminDashboard.test.jsx' 'src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/__tests__/QuickActions.test.jsx' --runInBand
```

Expected: the new composition test FAILS; the existing quick-action route test PASSES.

- [ ] **Step 3: Implement the approved responsive composition**

Use this page structure in `AdminDashboard.jsx`:

```jsx
<DashboardMotionFrame className="flex-1 space-y-5">
  <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div><p className="text-xs font-medium text-muted-foreground">Live business summary</p><h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Super Admin Dashboard</h1></div>
    <Button className="w-fit bg-weelp-sage-deep">Download</Button>
  </header>
  {hasError ? <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">Couldn&apos;t load some dashboard data. Showing placeholders where possible.</div> : null}
  <MetricCards loading={isLoading} data={metricsError ? null : metricsData} overviewData={chartError ? [] : chartData} />
  <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.7fr)]">
    <Card className="min-w-0 rounded-xl">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div><CardTitle>Revenue &amp; bookings</CardTitle><CardDescription>Monthly performance for {new Date().getFullYear()}</CardDescription></div>
      </CardHeader>
      <CardContent><Overview loading={isLoading} data={chartError ? null : chartData} /></CardContent>
    </Card>
    <BookingSummary loading={isLoading} metric={bookingsMetric} monthlyTotal={monthlyTotal} sales={salesError ? [] : salesData} />
  </div>
  <div className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.55fr)]">
    <section className="space-y-3"><h2 className="text-lg font-semibold text-foreground">Quick actions</h2><QuickActions loading={isLoading} /></section>
    <AttentionSummary />
  </div>
</DashboardMotionFrame>
```

Import `DashboardMotionFrame`, `BookingSummary`, and `AttentionSummary`. Define `bookingsMetric` as `metricsData?.find((item) => item.title.includes('Bookings')) ?? null`. Use `CardHeader` and `CardContent` consistently. Do not add fabricated destination, conversion, target, or category values.

Implement `BookingSummary` as one semantic card wrapped by `<section aria-labelledby="booking-summary-title">`, with the heading using `id="booking-summary-title"`. Its header shows “Booking summary”, the current booking total, and the signed direction from the supplied metric. A bordered subsection titled “Recent sales” renders the existing `RecentSales` component and monthly sales description. If the metric is absent, show `0` with neutral direction; if sales are absent, retain the existing empty message.

Implement `AttentionSummary` with `useAdminNavigationUnseen()`. Render links to `/dashboard/admin/orders` and `/dashboard/admin/reviews` using `NavigationLink`. Show `${counts.orders} unseen orders`, `${counts.reviews} unseen reviews`, and either “Cancellation request needs review” or “No cancellation requests need attention”. On hook error, render “Attention status is temporarily unavailable.” Never derive or invent counts locally.

When `isLoading` is true, render the “Needs attention” heading plus three `Skeleton` rows inside the same card and label the container `aria-label="Loading attention summary"`; do not render zero counts while the request is unresolved.

Add `AttentionSummary.test.jsx` with a mutable hook mock and a plain-anchor `NavigationLink` mock:

```jsx
import { render, screen } from '@testing-library/react';
import { useAdminNavigationUnseen } from '@/hooks/api/admin/navigationUnseen';
import { AttentionSummary } from '../AttentionSummary';

jest.mock('@/hooks/api/admin/navigationUnseen', () => ({ useAdminNavigationUnseen: jest.fn() }));
jest.mock('@/app/components/Navigation/NavigationLink', () => ({ __esModule: true, default: ({ href, children }) => <a href={href}>{children}</a> }));

describe('AttentionSummary', () => {
  it('renders real counts, attention, and navigation targets', () => {
    useAdminNavigationUnseen.mockReturnValue({ counts: { orders: 3, reviews: 2 }, attention: { cancellations: true }, isLoading: false });
    render(<AttentionSummary />);
    expect(screen.getByText('3 unseen orders').closest('a')).toHaveAttribute('href', '/dashboard/admin/orders');
    expect(screen.getByText('2 unseen reviews').closest('a')).toHaveAttribute('href', '/dashboard/admin/reviews');
    expect(screen.getByText('Cancellation request needs review')).toBeInTheDocument();
  });

  it('shows skeletons instead of false zero counts while loading', () => {
    useAdminNavigationUnseen.mockReturnValue({ counts: { orders: 0, reviews: 0 }, attention: { cancellations: false }, isLoading: true });
    render(<AttentionSummary />);
    expect(screen.getByLabelText('Loading attention summary')).toBeInTheDocument();
    expect(screen.queryByText('0 unseen orders')).not.toBeInTheDocument();
  });

  it('shows the local error state', () => {
    useAdminNavigationUnseen.mockReturnValue({ counts: { orders: 0, reviews: 0 }, attention: { cancellations: false }, isLoading: false, error: new Error('failed') });
    render(<AttentionSummary />);
    expect(screen.getByText('Attention status is temporarily unavailable.')).toBeInTheDocument();
  });

  it('shows the clear cancellation state', () => {
    useAdminNavigationUnseen.mockReturnValue({ counts: { orders: 0, reviews: 0 }, attention: { cancellations: false }, isLoading: false });
    render(<AttentionSummary />);
    expect(screen.getByText('No cancellation requests need attention')).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Compact recent sales and quick actions without changing behaviour**

For `RecentSales`, reduce vertical gaps, keep avatar fallbacks, retain the empty state, and give amounts `text-success`. For `QuickActions`, keep every existing `NavigationLink` route and render each action as a compact `min-h-24` card with icon tile, title, and one `Open →` cue. Update `QuickActions.test.jsx` to expect `Open →` as plain text while retaining the same three URLs.

- [ ] **Step 5: Rebuild skeletons to mirror the final geometry**

Set the overview skeleton to `chartConfig.height`, use four compact metric skeletons with optional sparkline blocks, use the same asymmetric `xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.7fr)]` analytics row, and make the three quick-action skeletons match the loaded `min-h-24` cards.

- [ ] **Step 6: Run the dashboard test group**

```bash
npx jest 'src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/__tests__' --runInBand
```

Expected: all dashboard tests PASS.

- [ ] **Step 7: Run the required post-change checks and leave changes uncommitted**

```bash
npx tsc --noEmit
npm run lint
git diff --check
```

Invoke `error-handling-patterns` before the commands above, then refresh the named headed browser and verify the booking summary, recent-sales subsection, quick actions, attention signals, loading layout, and partial-failure notice at desktop and mobile widths. Do not commit yet.

## Task 5: Polish the shared admin shell without changing its theme

**Files:**

- Modify: `frontend/src/app/components/Pages/DASHBOARD/admin/header.jsx`
- Modify: `frontend/src/app/components/Pages/DASHBOARD/admin/app-sidebar.jsx`
- Modify: `frontend/src/app/(dashboard)/dashboard/admin/layout.js`
- Modify: `frontend/src/app/components/Pages/DASHBOARD/admin/__tests__/AdminHeaderTheme.test.jsx`
- Modify: `frontend/src/app/components/Pages/DASHBOARD/admin/__tests__/AppSidebar.test.jsx`

- [ ] **Step 1: Add failing semantic-shell assertions**

Extend the header test to find the `header` and assert:

```jsx
expect(container.querySelector('header')).toHaveClass('border-border', 'bg-background/95', 'backdrop-blur');
```

Preserve the populated search result assertions. Extend the sidebar test mock to forward `className` and assert the sidebar header uses `border-sidebar-border` and does not contain any hex, RGB, or replacement theme class.

- [ ] **Step 2: Run the focused shell tests and verify failure**

```bash
npx jest 'src/app/components/Pages/DASHBOARD/admin/__tests__/AdminHeaderTheme.test.jsx' 'src/app/components/Pages/DASHBOARD/admin/__tests__/AppSidebar.test.jsx' --runInBand
```

Expected: FAIL on the new semantic shell classes.

- [ ] **Step 3: Apply token-only shell refinements**

Change the header class to:

```jsx
className="sticky top-0 z-50 h-16 min-w-0 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6"
```

Change `SidebarHeader` to use a single bottom edge rather than a boxed border:

```jsx
<SidebarHeader className="mx-2 flex h-16 flex-row items-center justify-start border-b border-sidebar-border px-1">
```

Update the admin content wrapper to:

```jsx
<div className="mx-auto w-full max-w-[1600px] min-w-0 p-4 sm:p-6 lg:p-8 xl:p-10">{children}</div>
```

Do not edit `globals.css`, Tailwind theme values, the dark-mode class, navigation data, or header search logic.

- [ ] **Step 4: Run focused shell and theme regression tests**

```bash
npx jest 'src/app/components/Pages/DASHBOARD/admin/__tests__/AdminHeaderTheme.test.jsx' 'src/app/components/Pages/DASHBOARD/admin/__tests__/AppSidebar.test.jsx' 'src/app/__tests__/deepForestTheme.test.js' --runInBand
```

Expected: PASS with the existing theme contracts unchanged.

- [ ] **Step 5: Run the required post-change checks and leave changes uncommitted**

```bash
npx tsc --noEmit
npm run lint
git diff --check
```

Invoke `error-handling-patterns` before the commands above, then refresh the named headed browser and verify search, theme toggle, user menu, sidebar expansion/collapse, and content spacing in both themes. Do not commit yet.

## Task 6: Complete review, simplification, and verification

**Files:**

- Review all changed frontend and backend files from Tasks 1–5.

- [ ] **Step 1: Run the error-handling review required by the project**

Invoke the `error-handling-patterns` skill and check the partial SWR failure paths, empty graph response, missing recent sales, and backend exception response. Fix only concrete gaps and rerun the affected focused test.

- [ ] **Step 2: Run required automated verification**

From `backend`:

```bash
php artisan test tests/Feature/Admin/DashboardOverviewChartTest.php
php artisan test
```

From `frontend`:

```bash
npx jest 'src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/__tests__' 'src/app/components/Pages/DASHBOARD/admin/__tests__/AdminHeaderTheme.test.jsx' 'src/app/components/Pages/DASHBOARD/admin/__tests__/AppSidebar.test.jsx' 'src/app/__tests__/deepForestTheme.test.js' --runInBand
npx tsc --noEmit
npm run lint
npm run build
git diff --check
```

Expected: every command exits successfully with no warnings promoted to failures.

- [ ] **Step 3: Run the mandatory code-review loop**

Dispatch the required code-review agent against both uncommitted repository diffs. Address every critical or high-confidence finding, rerun its focused tests, and request re-review until no blocking findings remain.

- [ ] **Step 4: Run the simplification gate with the available mechanism**

The repository requests a `simplify` skill, but that skill is not installed in the current workspace. Record that limitation and perform the supported fallback: manually review every changed component for duplicated rendering, unnecessary props, speculative abstractions, repeated class strings, dead constants, and avoidable state. Make only behaviour-preserving reductions. If the `simplify` skill becomes available before execution reaches this step, invoke it instead of the manual fallback.

- [ ] **Step 5: Rerun final automated verification after review fixes**

From `backend`:

```bash
php artisan test
git diff --check
```

From `frontend`:

```bash
npx jest 'src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/__tests__' 'src/app/components/Pages/DASHBOARD/admin/__tests__/AdminHeaderTheme.test.jsx' 'src/app/components/Pages/DASHBOARD/admin/__tests__/AppSidebar.test.jsx' 'src/app/__tests__/deepForestTheme.test.js' --runInBand
npx tsc --noEmit
npm run lint
npm run build
git diff --check
```

Expected: all commands PASS after the final reviewed code, not only before review.

- [ ] **Step 6: Inspect the local dashboard in the required visible browser**

Start the local services if needed, then use a named headed session:

```bash
agent-browser --session weelp-executive-dashboard --headed open http://localhost:3000/dashboard/admin
```

Log in with the documented local super-admin test account. Check `1440×1000`, `1024×768`, and `390×844` viewports in both themes. At each width, tab through the search, theme toggle, user menu, quick actions, attention links, and sidebar controls. Inspect the chart's hidden data table through the browser accessibility tree rather than keyboard Tab, because the table is intentionally screen-reader-only and not interactive. Confirm the existing teal/sage theme and dark forest surfaces are unchanged; percentage direction, chart lines, coral pointers, tooltips, collapsed sidebar, loading, empty data, and partial failure states work without overflow.

- [ ] **Step 7: Commit the verified implementation on each `main` branch**

From `backend`, stage only the reviewed endpoint and test, then commit:

```bash
git add app/Http/Controllers/Admin/DashboardController.php tests/Feature/Admin/DashboardOverviewChartTest.php
git commit -m "feat(dashboard): add executive analytics data"
```

From `frontend`, stage only the reviewed dashboard, shell, and test files listed in the file map, then commit:

```bash
git add 'src/app/(dashboard)/dashboard/admin/layout.js' src/app/components/Pages/DASHBOARD/admin
git commit -m "feat(dashboard): build executive admin overview"
```

- [ ] **Step 8: Push both verified `main` branches**

```bash
git push origin main
```

Run this separately from `backend` and `frontend`. Confirm both local `main` branches match their respective `origin/main` tips before declaring completion.
