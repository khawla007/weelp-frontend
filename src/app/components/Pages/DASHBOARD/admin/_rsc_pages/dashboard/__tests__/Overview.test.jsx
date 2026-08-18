import { render, screen, within } from '@testing-library/react';
import { Overview } from '../overview';
import { OverviewTooltip } from '../OverviewTooltip';

jest.mock('recharts', () => {
  const React = require('react');

  const chartElement = (testId) =>
    function ChartElement({ children, dataKey, name, yAxisId, allowDecimals, strokeDasharray, x, y, hide, width, height, stroke }) {
      return (
        <g
          data-testid={testId}
          data-data-key={dataKey}
          data-name={name}
          data-y-axis-id={yAxisId}
          data-allow-decimals={allowDecimals === undefined ? undefined : String(allowDecimals)}
          data-stroke-dasharray={strokeDasharray}
          data-x={x}
          data-y={y}
          data-hide={hide === undefined ? undefined : String(hide)}
          data-width={width}
          data-height={height}
          data-stroke={stroke}
        >
          {children}
        </g>
      );
    };

  const chartRoot = (testId) =>
    function ChartRoot({ children }) {
      return <svg data-testid={testId}>{children}</svg>;
    };

  return {
    Area: chartElement('area'),
    CartesianGrid: chartElement('cartesian-grid'),
    ComposedChart: chartRoot('composed-chart'),
    Line: chartElement('line'),
    ReferenceDot: chartElement('reference-dot'),
    ResponsiveContainer: function ResponsiveContainer({ children }) {
      return <div data-testid="responsive-container">{children}</div>;
    },
    Tooltip: chartElement('tooltip'),
    XAxis: chartElement('x-axis'),
    YAxis: chartElement('y-axis'),
  };
});

describe('Overview', () => {
  it('renders revenue and bookings in a labelled composed chart with accessible data', () => {
    const data = Array.from({ length: 12 }, (_, index) => ({ name: `M${index + 1}`, total: 1000 + index, bookings: 4 + index }));
    render(<Overview data={data} />);

    expect(screen.getByRole('img', { name: 'Monthly revenue and bookings chart' })).toBeInTheDocument();
    expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    expect(screen.getByTestId('area')).toHaveAttribute('data-data-key', 'total');
    expect(screen.getByTestId('area')).toHaveAttribute('data-name', 'Revenue');
    expect(screen.getByTestId('area')).toHaveAttribute('data-y-axis-id', 'revenue');
    expect(screen.getByTestId('area')).toHaveAttribute('data-stroke', 'hsl(var(--weelp-sage-text))');
    expect(screen.getByTestId('line')).toHaveAttribute('data-data-key', 'bookings');
    expect(screen.getByTestId('line')).toHaveAttribute('data-name', 'Bookings');
    expect(screen.getByTestId('line')).toHaveAttribute('data-y-axis-id', 'bookings');
    expect(screen.getByTestId('line')).toHaveAttribute('data-stroke-dasharray', '7 6');
    expect(screen.getByTestId('x-axis')).toHaveAttribute('data-hide', 'true');
    expect(screen.getByTestId('x-axis')).toHaveAttribute('data-height', '0');
    expect(screen.getAllByTestId('y-axis')).toHaveLength(2);
    for (const axis of screen.getAllByTestId('y-axis')) {
      expect(axis).toHaveAttribute('data-hide', 'true');
      expect(axis).toHaveAttribute('data-width', '0');
    }
    expect(screen.queryByTestId('legend')).not.toBeInTheDocument();
    expect(screen.getAllByTestId('reference-dot').map((dot) => dot.getAttribute('data-x'))).toEqual(['M4', 'M8', 'M12']);
    expect(screen.getAllByTestId('reference-dot').every((dot) => dot.getAttribute('data-y-axis-id') === 'revenue')).toBe(true);
    expect(screen.getByRole('img', { name: 'Monthly revenue and bookings chart' }).firstChild).toHaveClass('h-[205px]');

    const table = screen.getByRole('table', { name: 'Monthly revenue and bookings data' });
    expect(table).toHaveTextContent('M1');
    expect(table).toHaveTextContent('$1,000');
    expect(table).toHaveTextContent('4');
  });

  it('keeps the complete chart and twelve-month table visible for empty data', () => {
    render(<Overview data={[]} />);

    expect(screen.getByText('No revenue or booking data for this year yet.')).toBeInTheDocument();
    expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    expect(screen.getByTestId('area')).toBeInTheDocument();
    expect(screen.getByTestId('line')).toBeInTheDocument();

    const table = screen.getByRole('table', { name: 'Monthly revenue and bookings data' });
    const rows = within(table).getAllByRole('row');
    expect(rows).toHaveLength(13);

    const januaryCells = within(rows[1]).getAllByRole('cell');
    expect(within(rows[1]).getByRole('rowheader')).toHaveTextContent(/^Jan$/);
    expect(januaryCells[0]).toHaveTextContent(/^\$0$/);
    expect(januaryCells[1]).toHaveTextContent(/^0$/);

    const decemberCells = within(rows[12]).getAllByRole('cell');
    expect(within(rows[12]).getByRole('rowheader')).toHaveTextContent(/^Dec$/);
    expect(decemberCells[0]).toHaveTextContent(/^\$0$/);
    expect(decemberCells[1]).toHaveTextContent(/^0$/);
  });

  it('normalizes missing legacy booking values to zero', () => {
    render(<Overview data={[{ name: 'Jan', total: 1200 }]} />);

    const table = screen.getByRole('table', { name: 'Monthly revenue and bookings data' });
    const januaryRow = within(table).getByRole('row', { name: 'Jan $1,200 0' });
    const cells = within(januaryRow).getAllByRole('cell');
    expect(within(januaryRow).getByRole('rowheader')).toHaveTextContent(/^Jan$/);
    expect(cells[0]).toHaveTextContent(/^\$1,200$/);
    expect(cells[1]).toHaveTextContent(/^0$/);
    expect(table).not.toHaveTextContent('NaN');
  });

  it('normalizes malformed and non-finite numeric values to zero', () => {
    render(<Overview data={[{ name: 'Jan', total: 'not-a-number', bookings: Infinity }]} />);

    const table = screen.getByRole('table', { name: 'Monthly revenue and bookings data' });
    const januaryRow = within(table).getByRole('row', { name: 'Jan $0 0' });
    const cells = within(januaryRow).getAllByRole('cell');
    expect(cells[0]).toHaveTextContent(/^\$0$/);
    expect(cells[1]).toHaveTextContent(/^0$/);
    expect(table).not.toHaveTextContent(/NaN|Infinity/);
  });
});

describe('OverviewTooltip', () => {
  it('formats the active month revenue and bookings values', () => {
    render(
      <OverviewTooltip
        active
        label="Jan"
        payload={[
          { dataKey: 'total', value: 1200 },
          { dataKey: 'bookings', value: 4 },
        ]}
      />,
    );

    expect(screen.getByText('Jan')).toBeInTheDocument();
    expect(screen.getByText('Revenue: $1,200')).toBeInTheDocument();
    expect(screen.getByText('Bookings: 4')).toBeInTheDocument();
  });
});
