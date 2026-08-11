import { render, screen } from '@testing-library/react';

import { ReviewTable } from '../Table';

jest.mock('@/hooks/useIsClient', () => ({ useIsClient: () => true }));
jest.mock('@/components/ui/checkbox', () => ({ Checkbox: () => <input type="checkbox" aria-label="Select all reviews" /> }));
jest.mock('@/app/components/Checkbox/SelectableCardCheckbox', () => ({ SelectableCardCheckbox: () => <input type="checkbox" aria-label="Select review" /> }));
jest.mock('@/app/components/Shared/StatusBadge', () => ({ StatusBadge: ({ status }) => <span>{status}</span> }));
jest.mock('@/app/components/Shared/TableActions', () => ({ TableActions: () => <button type="button">Review actions</button> }));

describe('ReviewTable', () => {
  it('displays only the date portion of an ISO creation timestamp', () => {
    render(
      <ReviewTable
        reviews={[
          {
            id: 1,
            created_at: '2026-08-11T10:05:00.000Z',
            user: { name: 'Ada', email: 'ada@example.com' },
            rating: 0,
            status: 'pending',
            review_text: 'Helpful trip',
          },
        ]}
        onSelectionChange={jest.fn()}
      />,
    );

    expect(screen.getByText('2026-08-11')).toBeInTheDocument();
    expect(screen.queryByText('2026-08-11T10:05:00.000Z')).not.toBeInTheDocument();
  });
});
