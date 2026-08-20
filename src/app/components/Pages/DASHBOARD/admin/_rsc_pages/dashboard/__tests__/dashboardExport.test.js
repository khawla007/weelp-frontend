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
      metrics: [
        { title: '=SUM(1,1) "quoted"', total: 'not-a-number', change: Infinity },
        { title: '\t=SUM(1,1)', total: 0, change: 0 },
        { title: '\r-1', total: 0, change: 0 },
      ],
      overview: [
        { name: '@Jan, special', total: NaN, bookings: undefined },
        { name: '\n@cmd', total: 0, bookings: 0 },
      ],
    });

    expect(csv).toContain('"\'=SUM(1,1) ""quoted""",0,0');
    expect(csv).toContain('"\'@Jan, special",0,0');
    expect(csv).toContain('"\'\t=SUM(1,1)",0,0');
    expect(csv).toContain('"\'\r-1",0,0');
    expect(csv).toContain('"\'\n@cmd",0,0');
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
    expect(anchor.style.display).toBe('none');
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
