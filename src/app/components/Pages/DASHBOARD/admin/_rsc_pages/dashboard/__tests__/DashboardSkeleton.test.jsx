import { render, screen } from '@testing-library/react';

import { DashboardSkeleton } from '../DashboardSkeleton';

describe('DashboardSkeleton', () => {
  it('mirrors the compact Executive Flow geometry', () => {
    render(<DashboardSkeleton />);

    const kpis = screen.getByTestId('dashboard-kpis');
    expect(kpis).toHaveClass('grid-cols-2', 'gap-[11px]');
    expect(kpis).not.toHaveClass('sm:grid-cols-2');
    expect(kpis.children).toHaveLength(4);
    expect(screen.getAllByTestId('metric-skeleton-sparkline')).toHaveLength(4);
    for (const card of kpis.children) {
      expect(card).toHaveClass('h-[109px]', 'min-h-[100px]', 'rounded-[15px]', 'border', 'border-border', 'bg-card', 'p-[15px]');
    }

    expect(screen.getByTestId('dashboard-analytics-skeleton')).toHaveClass('gap-3', 'min-[901px]:grid-cols-[minmax(0,1.7fr)_minmax(220px,0.72fr)]');
    expect(screen.getByLabelText('Loading overview chart')).toHaveClass('h-[205px]');
    expect(screen.getByTestId('booking-mix-skeleton')).toHaveClass('size-[112px]');

    expect(screen.getByTestId('dashboard-lower-skeleton')).toHaveClass('gap-3', 'min-[621px]:grid-cols-[minmax(0,1.15fr)_minmax(220px,0.85fr)]');
    expect(screen.getAllByTestId('quick-action-skeleton')).toHaveLength(3);
    expect(screen.getByTestId('quick-actions-skeleton-grid')).toHaveClass('grid-cols-3');
    expect(screen.getByTestId('quick-actions-skeleton-grid')).not.toHaveClass('sm:grid-cols-3');
  });
});
