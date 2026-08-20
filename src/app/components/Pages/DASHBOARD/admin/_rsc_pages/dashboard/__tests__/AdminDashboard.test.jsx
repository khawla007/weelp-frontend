import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';

import { AdminDashboardPage } from '../AdminDashboard';
import { downloadDashboardCsv } from '../dashboardExport';

const mockUseSWR = jest.fn();
const mockUseAdminNavigationUnseen = jest.fn();
const mockMetricCards = jest.fn(() => <div data-testid="dashboard-kpis" className="gap-[11px]" />);
const mockOverview = jest.fn(({ data, loading }) => <div>{loading ? 'Overview loading' : `Overview chart: ${data?.[0]?.name ?? 'placeholder'}`}</div>);
const mockToast = jest.fn();

jest.mock('swr', () => ({
  __esModule: true,
  default: (...args) => mockUseSWR(...args),
}));

jest.mock('@/hooks/api/admin/navigationUnseen', () => ({
  useAdminNavigationUnseen: () => mockUseAdminNavigationUnseen(),
}));

jest.mock('@/hooks/use-toast', () => ({
  ...jest.requireActual('@/hooks/use-toast'),
  useToast: () => ({ toast: mockToast }),
}));

jest.mock('../overview', () => ({
  Overview: (props) => mockOverview(props),
}));

jest.mock('../metric-cards', () => ({
  MetricCards: (props) => mockMetricCards(props),
}));

jest.mock('../dashboardExport', () => ({
  ...jest.requireActual('../dashboardExport'),
  downloadDashboardCsv: jest.fn(),
}));

const metrics = [
  { title: 'Revenue', total: 1200, change: 10 },
  { title: 'Bookings', total: 1284, change: 12.1 },
];
const chart = [{ name: 'Jan', total: 1200, bookings: 1284 }];
const bookingMix = {
  total: 10,
  categories: [
    { key: 'activities', label: 'Activities', count: 5 },
    { key: 'packages', label: 'Packages', count: 3 },
    { key: 'trips', label: 'Trips', count: 2 },
  ],
  leaders: [{ type: 'activity', id: 7, name: 'Dubai Safari', bookings: 4, change: 100 }],
};

function arrangeDashboard({ mixError = null, mixLoading = false, metricsError = null, metricsLoading = false, chartError = null, chartLoading = false } = {}) {
  mockUseAdminNavigationUnseen.mockReturnValue({
    counts: { orders: 3, reviews: 2 },
    attention: { cancellations: true },
    error: null,
    isLoading: false,
  });
  mockUseSWR.mockImplementation((key) => {
    if (key === '/admin/dashboard/metrics') return { data: metricsError ? undefined : metrics, error: metricsError, isLoading: metricsLoading };
    if (key === '/admin/dashboard/overview-chart') return { data: chartError ? undefined : chart, error: chartError, isLoading: chartLoading };
    if (key === '/admin/dashboard/booking-mix') return { data: mixError ? undefined : bookingMix, error: mixError, isLoading: mixLoading };
    throw new Error(`Unexpected SWR key: ${key}`);
  });
}

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    downloadDashboardCsv.mockClear();
    mockToast.mockClear();
  });

  it('downloads the successful metrics and overview chart', () => {
    arrangeDashboard();
    render(<AdminDashboardPage />);

    const downloadButton = screen.getByRole('button', { name: 'Download' });
    expect(downloadButton).toBeEnabled();

    fireEvent.click(downloadButton);

    expect(downloadDashboardCsv).toHaveBeenCalledTimes(1);
    expect(downloadDashboardCsv).toHaveBeenCalledWith({ metrics, overview: chart });
  });

  it('shows a destructive toast when the dashboard download fails', () => {
    arrangeDashboard();
    downloadDashboardCsv.mockImplementationOnce(() => {
      throw new Error('download unavailable');
    });
    render(<AdminDashboardPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Download' }));

    expect(mockToast).toHaveBeenCalledTimes(1);
    expect(mockToast).toHaveBeenCalledWith({
      variant: 'destructive',
      title: 'Download failed',
      description: 'Please try again.',
    });
  });

  it.each([
    ['metrics are loading', { metricsLoading: true }],
    ['the overview chart is loading', { chartLoading: true }],
    ['metrics fail', { metricsError: new Error('metrics unavailable') }],
    ['the overview chart fails', { chartError: new Error('chart unavailable') }],
  ])('disables Download while %s', (_scenario, state) => {
    arrangeDashboard(state);
    render(<AdminDashboardPage />);

    expect(screen.getByRole('button', { name: 'Download' })).toBeDisabled();
  });

  it('composes the responsive Executive Flow around live metrics, booking mix, actions, and attention', () => {
    arrangeDashboard();
    render(<AdminDashboardPage />);

    expect(screen.getByRole('heading', { name: 'Super Admin Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download' }).querySelector('svg')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Revenue & bookings' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Booking mix' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Quick actions' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Needs attention' })).toBeInTheDocument();

    expect(screen.getByTestId('dashboard-kpis')).toHaveClass('gap-[11px]');
    expect(mockMetricCards).toHaveBeenCalledWith({ data: metrics, overviewData: chart, loading: false });
    expect(mockOverview).toHaveBeenCalledWith({ data: chart, loading: false });
    expect(screen.getByTestId('dashboard-analytics')).toHaveClass('gap-3', 'min-[901px]:grid-cols-[minmax(0,1.7fr)_minmax(220px,0.72fr)]');
    expect(screen.getByTestId('dashboard-lower')).toHaveClass('gap-3', 'min-[621px]:grid-cols-[minmax(0,1.15fr)_minmax(220px,0.85fr)]');
    expect(within(screen.getByRole('region', { name: 'Booking mix' })).getByText('Dubai Safari')).toBeInTheDocument();
    expect(screen.getByText('3 unseen orders')).toBeInTheDocument();
    expect(screen.getByText('Cancellation request needs review')).toBeInTheDocument();
  });

  it('keeps successful analytics visible when booking mix fails', () => {
    arrangeDashboard({ mixError: new Error('mix unavailable') });
    render(<AdminDashboardPage />);

    expect(screen.getByText('Overview chart: Jan')).toBeInTheDocument();
    expect(screen.getByText("Couldn't load some dashboard data. Showing placeholders where possible.")).toHaveAttribute('role', 'alert');
    expect(screen.getByRole('button', { name: 'Download' })).toBeEnabled();
  });

  it('keeps live sections available while the booking mix loads locally', () => {
    arrangeDashboard({ mixLoading: true });
    render(<AdminDashboardPage />);

    expect(screen.getByLabelText('Loading booking mix')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Manage Users.*Open/ })).toBeInTheDocument();
  });

  it('forwards loading and safe error fallbacks to metrics and overview', () => {
    arrangeDashboard({ metricsError: new Error('metrics unavailable'), metricsLoading: true, chartError: new Error('chart unavailable'), chartLoading: true });
    render(<AdminDashboardPage />);

    expect(mockMetricCards).toHaveBeenCalledWith({ data: null, overviewData: [], loading: true });
    expect(mockOverview).toHaveBeenCalledWith({ data: null, loading: true });
  });
});
