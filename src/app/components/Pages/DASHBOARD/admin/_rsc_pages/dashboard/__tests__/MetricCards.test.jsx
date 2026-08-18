import { render, screen } from '@testing-library/react';
import { MetricCards } from '../metric-cards';

jest.mock('recharts', () => ({
  Line: function Line({ dataKey, stroke }) {
    return <path data-testid="sparkline-line" data-data-key={dataKey} stroke={stroke} />;
  },
  LineChart: function LineChart({ children, data }) {
    return (
      <svg data-testid="sparkline-chart" data-chart-data={JSON.stringify(data)}>
        {children}
      </svg>
    );
  },
  ResponsiveContainer: function ResponsiveContainer({ children }) {
    return <div data-testid="metric-sparkline">{children}</div>;
  },
}));

describe('MetricCards', () => {
  it('formats values, communicates trend direction, and charts only meaningful histories', () => {
    const metrics = [
      { title: 'Total Revenue', total: 1200, change: 18.4 },
      { title: 'Bookings', total: 4, change: -5 },
      { title: 'Active Users', total: 8, change: 0 },
      { title: 'Total Activities', total: 3, change: 0 },
    ];
    const overviewData = Array.from({ length: 12 }, (_, index) => ({ name: `M${index + 1}`, total: 900 + index * 25, bookings: 2 + index }));

    render(<MetricCards data={metrics} overviewData={overviewData} />);

    expect(screen.getByText('$1,200')).toBeInTheDocument();
    expect(screen.getByText('+18.4%')).toHaveClass('text-success');
    expect(screen.getByText('-5%')).toHaveClass('text-destructive');
    expect(screen.getByText('Increase')).toBeInTheDocument();
    expect(screen.getByText('Decrease')).toBeInTheDocument();
    expect(screen.getAllByText('No change')).toHaveLength(2);
    expect(screen.getByTestId('dashboard-kpis')).toHaveClass('grid-cols-2', 'gap-[11px]');
    expect(screen.getByTestId('dashboard-kpis')).not.toHaveClass('sm:grid-cols-2');
    expect(screen.getAllByTestId('metric-sparkline')).toHaveLength(4);
    expect(screen.getAllByTestId('metric-card')).toHaveLength(4);
    for (const card of screen.getAllByTestId('metric-card')) {
      expect(card).toHaveClass('h-[109px]', 'min-h-[100px]', 'rounded-[15px]', 'border', 'border-border', 'bg-card', 'p-[15px]');
    }
    expect(screen.getAllByTestId('sparkline-line').map((line) => line.getAttribute('data-data-key'))).toEqual(['total', 'bookings', 'value', 'value']);
    expect(screen.getAllByTestId('sparkline-line').map((line) => line.getAttribute('stroke'))).toEqual(['hsl(var(--success))', 'hsl(var(--info))', '#aa8cff', 'hsl(var(--warning))']);
  });

  it('uses honest two-point fallbacks when twelve-month history is missing', () => {
    const metrics = [
      { title: 'Total Revenue', total: 1200, change: 18.4 },
      { title: 'Bookings', total: 4, change: -5 },
      { title: 'Active Users', total: 8, change: 0 },
      { title: 'Total Activities', total: 3, change: 0 },
    ];
    const legacyOverviewData = [
      { name: 'Jan', total: 900, bookings: 1 },
      { name: 'Feb', total: '1200' },
      { name: 'Mar', total: Infinity, bookings: NaN },
    ];

    render(<MetricCards data={metrics} overviewData={legacyOverviewData} />);

    expect(screen.getAllByTestId('metric-sparkline')).toHaveLength(4);
    for (const chart of screen.getAllByTestId('sparkline-chart')) {
      expect(JSON.parse(chart.getAttribute('data-chart-data'))).toHaveLength(2);
    }
  });
});
