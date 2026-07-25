import { render, screen } from '@testing-library/react';

import TransferResultsDropdown from '../TransferResultsDropdown';

jest.mock('@/app/components/ui/Reveal', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

jest.mock('../TransferResultCard', () => ({
  __esModule: true,
  default: ({ transfer }) => <div>{transfer.name}</div>,
}));

describe('TransferResultsDropdown responsive layout', () => {
  it('keeps loading results within the mobile viewport', () => {
    render(<TransferResultsDropdown open loading onClose={jest.fn()} />);

    expect(screen.getByTestId('transfer-results-loading')).toHaveClass('max-h-[min(65dvh,520px)]', 'p-3', 'sm:p-4');
  });

  it('keeps the empty state and close control edge-safe', () => {
    render(<TransferResultsDropdown open transfers={[]} onClose={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Close results' })).toHaveClass('-top-3', 'right-0', 'h-11', 'w-11', 'sm:-right-3', 'sm:h-8', 'sm:w-8');
    expect(screen.getByTestId('transfer-results-empty')).toHaveClass('px-4', 'py-8', 'sm:p-8');
  });

  it('renders populated results in a viewport-bounded panel', () => {
    render(<TransferResultsDropdown open transfers={[{ id: 1, name: 'Airport transfer' }]} />);

    expect(screen.getByTestId('transfer-results-list')).toHaveClass('max-h-[min(65dvh,520px)]', 'p-2', 'sm:p-4');
    expect(screen.getByText('Airport transfer')).toBeInTheDocument();
  });
});
