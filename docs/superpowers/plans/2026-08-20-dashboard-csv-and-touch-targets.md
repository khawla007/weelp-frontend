# Dashboard CSV Export and Touch Targets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the admin dashboard Download control export its loaded KPI and 12-month chart data as a safe CSV, and enlarge Needs Attention touch targets without changing the approved theme, graph, sidebar, radii, padding, or grid composition.

**Architecture:** Add one focused client-side utility that validates export readiness, serializes normalized dashboard data, and performs a cleanup-safe Blob download. `AdminDashboardPage` remains the owner of SWR readiness and delegates export work to the utility. `AttentionSummary` keeps semantic links and compact typography while allocating non-overlapping 44px target heights.

**Tech Stack:** Next.js 16, React 19, JavaScript, SWR, Tailwind CSS, Jest, React Testing Library

---

## File map

- Create `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/dashboardExport.js`: pure CSV escaping, normalization, readiness, filename, and browser download functions.
- Create `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/__tests__/dashboardExport.test.js`: unit coverage for serialization, hostile text, zero/non-finite values, filename, click, and cleanup.
- Modify `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/AdminDashboard.jsx`: derive Download readiness and delegate the click to `dashboardExport.js`.
- Modify `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/__tests__/AdminDashboard.test.jsx`: cover loading/error/Booking Mix independence and successful export delegation.
- Modify `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/AttentionSummary.jsx`: allocate 44px non-overlapping link targets while retaining compact visible styling.
- Modify `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/__tests__/AttentionSummary.test.jsx`: lock the touch-target style contract and existing destinations.

## Pre-implementation review gate

Before Task 1, dispatch the project code-reviewer agent to compare this plan with the approved design, current dashboard code, project conventions, and the user-owned dirty files. Address every Critical and Important finding and rerun the review until it approves the plan. Do not stage or modify the pre-existing Home Gold or About files.

## Execution preflight

Before Task 1:

1. Confirm `git branch --show-current` returns `main`.
2. Invoke `superpowers:executing-plans` to execute this plan.
3. Load and apply `next-best-practices`, `vercel-react-best-practices`, and `vercel-composition-patterns` before writing Next.js or React code.
4. Keep every Task 1-3 source and test change uncommitted until the code-review, simplify, visible-browser, and final verification gates finish.

### Task 1: Build the safe dashboard CSV utility

**Files:**

- Create: `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/dashboardExport.js`
- Create: `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/__tests__/dashboardExport.test.js`

- [ ] **Step 1: Write the failing utility tests**

Create `__tests__/dashboardExport.test.js` with these cases:

```js
import { buildDashboardCsv, canExportDashboard, createDashboardCsvFilename, downloadDashboardCsv } from '../dashboardExport';

describe('dashboardExport', () => {
  const metrics = [
    { title: 'Total Revenue', total: 1200, change: 10 },
    { title: 'Bookings', total: 0, change: 0 },
  ];
  const overview = [
    { name: 'Jan', total: 1200, bookings: 4 },
    { name: 'Feb', total: 0, bookings: 0 },
  ];

  it('exports summary and monthly sections with valid zero values', () => {
    expect(buildDashboardCsv({ metrics, overview })).toBe(
      '\uFEFFDashboard Summary\r\n' +
        'Metric,Value,Change (%)\r\n' +
        'Total Revenue,1200,10\r\n' +
        'Bookings,0,0\r\n' +
        '\r\n' +
        'Monthly Performance\r\n' +
        'Month,Revenue,Bookings\r\n' +
        'Jan,1200,4\r\n' +
        'Feb,0,0\r\n',
    );
  });

  it('quotes CSV delimiters and protects spreadsheet formulas', () => {
    const csv = buildDashboardCsv({
      metrics: [{ title: '=SUM(1,1) "quoted"', total: 'not-a-number', change: Infinity }],
      overview: [{ name: '@Jan, special', total: NaN, bookings: undefined }],
    });

    expect(csv).toContain('"\'=SUM(1,1) ""quoted""",0,0');
    expect(csv).toContain('"\'@Jan, special",0,0');
    expect(csv).not.toMatch(/NaN|Infinity/);
  });

  it('requires successful non-empty metric and overview datasets', () => {
    const readyState = { metrics, overview, metricsLoading: false, chartLoading: false, metricsError: null, chartError: null };

    expect(canExportDashboard(readyState)).toBe(true);
    expect(canExportDashboard({ ...readyState, metricsLoading: true })).toBe(false);
    expect(canExportDashboard({ ...readyState, chartLoading: true })).toBe(false);
    expect(canExportDashboard({ ...readyState, metricsError: new Error('offline') })).toBe(false);
    expect(canExportDashboard({ ...readyState, chartError: new Error('offline') })).toBe(false);
    expect(canExportDashboard({ ...readyState, metrics: [] })).toBe(false);
    expect(canExportDashboard({ ...readyState, overview: [] })).toBe(false);
  });

  it('uses a stable local-calendar filename', () => {
    expect(createDashboardCsvFilename(new Date(2026, 7, 20))).toBe('weelp-dashboard-2026-08-20.csv');
  });

  it('clicks a temporary anchor and cleans up its Blob URL', () => {
    const click = jest.fn();
    const remove = jest.fn();
    const append = jest.fn();
    const anchor = { click, remove, style: {} };
    const documentRef = { createElement: jest.fn(() => anchor), body: { append } };
    const urlRef = { createObjectURL: jest.fn(() => 'blob:dashboard'), revokeObjectURL: jest.fn() };
    const BlobCtor = jest.fn(() => ({ kind: 'blob' }));

    downloadDashboardCsv({ metrics, overview }, { documentRef, urlRef, BlobCtor, date: new Date(2026, 7, 20) });

    expect(BlobCtor).toHaveBeenCalledWith([expect.stringContaining('Dashboard Summary')], { type: 'text/csv;charset=utf-8' });
    expect(anchor.download).toBe('weelp-dashboard-2026-08-20.csv');
    expect(anchor.href).toBe('blob:dashboard');
    expect(append).toHaveBeenCalledWith(anchor);
    expect(click).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(urlRef.revokeObjectURL).toHaveBeenCalledWith('blob:dashboard');
  });

  it('still revokes the Blob URL when the synthetic click throws', () => {
    const anchor = {
      click: jest.fn(() => {
        throw new Error('blocked');
      }),
      remove: jest.fn(),
      style: {},
    };
    const documentRef = { createElement: jest.fn(() => anchor), body: { append: jest.fn() } };
    const urlRef = { createObjectURL: jest.fn(() => 'blob:dashboard'), revokeObjectURL: jest.fn() };

    expect(() => downloadDashboardCsv({ metrics, overview }, { documentRef, urlRef, BlobCtor: jest.fn(() => ({})), date: new Date(2026, 7, 20) })).toThrow('blocked');
    expect(anchor.remove).toHaveBeenCalledTimes(1);
    expect(urlRef.revokeObjectURL).toHaveBeenCalledWith('blob:dashboard');
  });

  it('revokes the Blob URL even when removing the temporary anchor throws', () => {
    const anchor = {
      click: jest.fn(),
      remove: jest.fn(() => {
        throw new Error('remove failed');
      }),
      style: {},
    };
    const documentRef = { createElement: jest.fn(() => anchor), body: { append: jest.fn() } };
    const urlRef = { createObjectURL: jest.fn(() => 'blob:dashboard'), revokeObjectURL: jest.fn() };

    expect(() => downloadDashboardCsv({ metrics, overview }, { documentRef, urlRef, BlobCtor: jest.fn(() => ({})), date: new Date(2026, 7, 20) })).toThrow('remove failed');
    expect(urlRef.revokeObjectURL).toHaveBeenCalledWith('blob:dashboard');
  });
});
```

- [ ] **Step 2: Run the utility test to verify RED**

Run:

```bash
npx jest 'src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/__tests__/dashboardExport.test.js' --runInBand
```

Expected: FAIL because `../dashboardExport` does not exist.

- [ ] **Step 3: Implement the minimal utility**

Create `dashboardExport.js`:

```js
const FORMULA_PREFIX = /^[=+\-@]/;

function finiteNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function safeText(value) {
  const text = String(value ?? '');
  return FORMULA_PREFIX.test(text) ? `'${text}` : text;
}

function csvCell(value) {
  const text = String(value ?? '');
  if (!/[",\r\n]/.test(text)) return text;
  return `"${text.replaceAll('"', '""')}"`;
}

function row(values) {
  return values.map(csvCell).join(',');
}

export function canExportDashboard({ metrics, overview, metricsLoading, chartLoading, metricsError, chartError }) {
  return !metricsLoading && !chartLoading && !metricsError && !chartError && Array.isArray(metrics) && metrics.length > 0 && Array.isArray(overview) && overview.length > 0;
}

export function buildDashboardCsv({ metrics, overview }) {
  const metricRows = (Array.isArray(metrics) ? metrics : []).map((item) => row([safeText(item?.title), finiteNumber(item?.total), finiteNumber(item?.change)]));
  const monthRows = (Array.isArray(overview) ? overview : []).map((item) => row([safeText(item?.name), finiteNumber(item?.total), finiteNumber(item?.bookings)]));
  const lines = ['Dashboard Summary', 'Metric,Value,Change (%)', ...metricRows, '', 'Monthly Performance', 'Month,Revenue,Bookings', ...monthRows];

  return `\uFEFF${lines.join('\r\n')}\r\n`;
}

export function createDashboardCsvFilename(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `weelp-dashboard-${year}-${month}-${day}.csv`;
}

export function downloadDashboardCsv({ metrics, overview }, { documentRef = document, urlRef = URL, BlobCtor = Blob, date = new Date() } = {}) {
  const blobUrl = urlRef.createObjectURL(new BlobCtor([buildDashboardCsv({ metrics, overview })], { type: 'text/csv;charset=utf-8' }));
  let anchor;

  try {
    anchor = documentRef.createElement('a');
    anchor.href = blobUrl;
    anchor.download = createDashboardCsvFilename(date);
    anchor.style.display = 'none';
    documentRef.body.append(anchor);
    anchor.click();
  } finally {
    try {
      anchor?.remove();
    } finally {
      urlRef.revokeObjectURL(blobUrl);
    }
  }
}
```

- [ ] **Step 4: Run the utility test to verify GREEN**

Run the Step 2 command again.

Expected: 1 suite passes with 7 tests.

- [ ] **Step 5: Keep the verified utility slice uncommitted**

Run `git diff --check` and confirm the utility and its test are the only new Task 1 files. Do not stage or commit them yet.

### Task 2: Connect Download to successful SWR data

**Files:**

- Modify: `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/AdminDashboard.jsx`
- Modify: `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/__tests__/AdminDashboard.test.jsx`

- [ ] **Step 1: Add failing page behavior tests**

Mock the export module near the existing component mocks:

```js
const mockDownloadDashboardCsv = jest.fn();

jest.mock('../dashboardExport', () => ({
  ...jest.requireActual('../dashboardExport'),
  downloadDashboardCsv: (...args) => mockDownloadDashboardCsv(...args),
}));
```

Import `fireEvent`, clear the export mock in `beforeEach`, and add:

```js
it('downloads successful metric and chart data', () => {
  arrangeDashboard();
  render(<AdminDashboardPage />);

  const button = screen.getByRole('button', { name: 'Download' });
  expect(button).toBeEnabled();
  fireEvent.click(button);
  expect(mockDownloadDashboardCsv).toHaveBeenCalledWith({ metrics, overview: chart });
});

it.each([
  { state: { metricsLoading: true }, label: 'metrics loading' },
  { state: { chartLoading: true }, label: 'chart loading' },
  { state: { metricsError: new Error('offline') }, label: 'metrics failure' },
  { state: { chartError: new Error('offline') }, label: 'chart failure' },
])('disables Download during $label', ({ state }) => {
  arrangeDashboard(state);
  render(<AdminDashboardPage />);

  expect(screen.getByRole('button', { name: 'Download' })).toBeDisabled();
});

it('keeps Download enabled when only Booking Mix fails', () => {
  arrangeDashboard({ mixError: new Error('mix unavailable') });
  render(<AdminDashboardPage />);

  expect(screen.getByRole('button', { name: 'Download' })).toBeEnabled();
});
```

- [ ] **Step 2: Run the page test to verify RED**

Run:

```bash
npx jest 'src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/__tests__/AdminDashboard.test.jsx' --runInBand
```

Expected: FAIL because Download has no readiness state or handler.

- [ ] **Step 3: Wire the utility into `AdminDashboardPage`**

Add:

```js
import { canExportDashboard, downloadDashboardCsv } from './dashboardExport';
```

After `hasError`, derive readiness and the handler:

```js
const canDownload = canExportDashboard({
  metrics: metricsData,
  overview: chartData,
  metricsLoading,
  chartLoading,
  metricsError,
  chartError,
});

const handleDownload = () => {
  if (!canDownload) return;
  downloadDashboardCsv({ metrics: metricsData, overview: chartData });
};
```

Update the existing Button without changing its classes:

```jsx
<Button className="w-fit bg-weelp-sage-deep" disabled={!canDownload} onClick={handleDownload}>
  <DownloadIcon aria-hidden="true" />
  Download
</Button>
```

- [ ] **Step 4: Run the page and utility tests to verify GREEN**

Run:

```bash
npx jest 'src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/__tests__/AdminDashboard.test.jsx' 'src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/__tests__/dashboardExport.test.js' --runInBand
```

Expected: 2 suites pass.

- [ ] **Step 5: Keep the verified page integration uncommitted**

Run `git diff --check` and inspect the Task 1-2 diff. Do not stage or commit it yet.

### Task 3: Allocate non-overlapping 44px attention targets

**Files:**

- Modify: `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/AttentionSummary.jsx`
- Modify: `src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/__tests__/AttentionSummary.test.jsx`

- [ ] **Step 1: Write the failing touch-target contract test**

Extend the populated-state test with:

```js
const viewAll = screen.getByRole('link', { name: 'View all →' });
const orders = screen.getByRole('link', { name: '3 unseen orders' });
const reviews = screen.getByRole('link', { name: '2 unseen reviews' });

expect(viewAll).toHaveClass('relative', 'after:-inset-y-3.5', 'after:-inset-x-2');
expect(orders).toHaveClass('py-3.5');
expect(reviews).toHaveClass('py-3.5');
expect(screen.getByTestId('attention-heading')).toHaveClass('min-h-11');
```

Keep the existing href assertions so semantics and destinations remain locked.

- [ ] **Step 2: Run the attention test to verify RED**

Run:

```bash
npx jest 'src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/__tests__/AttentionSummary.test.jsx' --runInBand
```

Expected: FAIL because the links and heading row do not allocate 44px targets.

- [ ] **Step 3: Add transparent target height without changing visual tokens**

Update `SignalLink`:

```jsx
<NavigationLink href={href} className={`inline-flex items-center gap-1 py-3.5 font-medium ${className}`}>
```

Update the card heading row and View all link:

```jsx
<div data-testid="attention-heading" className="mb-3 flex min-h-11 items-center justify-between gap-3">
  <h2 id="attention-summary-title" className="text-sm font-semibold text-foreground">
    Needs attention
  </h2>
  <NavigationLink
    href="/dashboard/admin/orders"
    className="relative inline-flex items-center text-xs font-medium text-muted-foreground after:absolute after:-inset-x-2 after:-inset-y-3.5 after:content-[''] hover:text-foreground"
  >
    View all →
  </NavigationLink>
</div>
```

Keep the signal container’s existing `flex flex-wrap`, `gap-x-4`, and `gap-y-2`. Each signal link’s transparent `py-3.5` participates in layout at 44px high, so wrapped targets cannot overlap. The heading row’s `min-h-11` contains the isolated View all pseudo-element target without moving the visible text away from its centered position.

- [ ] **Step 4: Run the attention test to verify GREEN**

Run the Step 2 command again.

Expected: the suite passes.

- [ ] **Step 5: Keep the verified accessibility slice uncommitted**

Run `git diff --check` and inspect the Task 1-3 diff. Do not stage or commit it yet.

### Task 4: Verification, visible browser QA, review, and integration

**Files:**

- Verify all files listed above.
- Do not modify sidebar, theme, graph, service, route, or backend files.

- [ ] **Step 1: Run the complete focused dashboard suite**

```bash
npx jest 'src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/__tests__' --runInBand --silent
```

Expected: all dashboard suites and tests pass.

- [ ] **Step 2: Run static verification**

Before these commands, invoke `error-handling-patterns` and review the export readiness, Blob creation, DOM append/click, nested cleanup, and disabled/error behavior against that skill.

```bash
npx tsc --noEmit
npm run lint
git diff --check
```

Expected: every command exits 0; lint reports `Dark-mode guard: no new hardcoded color findings.`

- [ ] **Step 3: Run the mandatory code-review and simplify gate**

Dispatch the project code reviewer against the implementation and approved design. Address Critical and Important findings and rerun the reviewer until approved. Then invoke the required simplify skill; if the runtime still does not expose that named skill, state that limitation explicitly and perform a focused manual simplification pass for duplication, naming, unnecessary state, and cleanup safety. After simplify, rerun the complete focused Jest suite, type-check, lint/dark guard, and diff checks before any commit.

- [ ] **Step 4: Verify in a visible headed browser**

Use localhost and a fresh named visible session:

```bash
agent-browser --session weelp-dashboard-export --headed --args "--no-sandbox" open http://localhost:3000/dashboard/admin
```

Authenticate with the saved `weelp-local-admin` profile. At 1440px in dark and light modes, verify Download is enabled after metrics and chart data load, saves `weelp-dashboard-YYYY-MM-DD.csv`, and the file contains both labeled sections with the same values shown in the dashboard. Loading-state disablement is covered deterministically by the page unit test rather than a timing-sensitive localhost screenshot.

At 390px, verify Needs Attention links have rendered heights of at least 44px, do not overlap, retain their destinations, and preserve the approved two-column KPIs, three-column Quick Actions, theme, graph, and sidebar behavior. Check browser errors and console output.

- [ ] **Step 5: Run final clean-scope checks**

```bash
git status --short
git diff --check
```

Expected: only this task’s six source/test files, this implementation plan, and the user’s pre-existing unrelated Home Gold and About edits appear; backend remains unchanged.

- [ ] **Step 6: Commit the reviewed and verified task once**

```bash
git add \
  'docs/superpowers/plans/2026-08-20-dashboard-csv-and-touch-targets.md' \
  'src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/dashboardExport.js' \
  'src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/__tests__/dashboardExport.test.js' \
  'src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/AdminDashboard.jsx' \
  'src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/__tests__/AdminDashboard.test.jsx' \
  'src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/AttentionSummary.jsx' \
  'src/app/components/Pages/DASHBOARD/admin/_rsc_pages/dashboard/__tests__/AttentionSummary.test.jsx'
git commit -m 'feat: enable dashboard csv export'
```

Expected: one task commit is created after review, simplify, final verification, and visible browser QA. The user’s unrelated files remain unstaged.

- [ ] **Step 7: Push the verified frontend commit to `main`**

```bash
git push origin main
```

Expected: the verified commit is pushed to `origin/main` without staging or altering the user’s unrelated files.
