import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { useAllOrdersAdmin } from '@/hooks/api/admin/orders';

import OrdersPage from '../page';

jest.mock('@/hooks/api/admin/orders', () => ({ useAllOrdersAdmin: jest.fn() }));
jest.mock('@/lib/actions/vendor', () => ({ editVendorStatusbyIdAdmin: jest.fn() }));
jest.mock('@/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/orders_shared', () => ({
  NavigationOrder: () => <div>Orders heading</div>,
  StatsOrdersCards: () => <div>Order stats</div>,
}));
jest.mock('@/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/FilterOrdersPage', () => ({
  FilterOrdersPage: ({ view, onOrdersChanged }) => (
    <div>
      <span data-testid="table-view">{view}</span>
      <button type="button" onClick={onOrdersChanged}>
        Refresh orders
      </button>
    </div>
  ),
}));

describe('OrdersPage', () => {
  const mutateOrders = jest.fn();
  let backendResponse;

  beforeEach(() => {
    jest.clearAllMocks();
    backendResponse = {
      data: [],
      summary: {},
      current_page: 1,
      per_page: 3,
      total: 6,
      last_page: 2,
      trash_count: 2,
    };
    mutateOrders.mockResolvedValue({ data: backendResponse });
    useAllOrdersAdmin.mockImplementation(() => ({
      orders: { data: backendResponse },
      isLoading: false,
      isValidating: false,
      mutate: mutateOrders,
      error: null,
    }));
  });

  it('adds top spacing that matches the table toolbar spacing below the order views', () => {
    render(<OrdersPage />);

    expect(screen.getByLabelText('Order views')).toHaveClass('pt-4');
  });

  it('uses numeric page-one defaults when API metadata is absent', () => {
    backendResponse = { data: [], summary: {} };

    render(<OrdersPage />);

    expect(screen.getByRole('textbox', { name: 'Page number' })).toHaveValue('1');
    expect(screen.getByText('of 1')).toBeInTheDocument();
  });

  it('switches atomically from page two to the first Trash page', async () => {
    render(<OrdersPage />);

    expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=1&view=active');
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    await waitFor(() => expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=2&view=active'));

    const callsBeforeSwitch = useAllOrdersAdmin.mock.calls.length;
    fireEvent.click(screen.getByRole('button', { name: 'Trash (2)' }));

    await waitFor(() => expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=1&view=trash'));
    const switchCalls = useAllOrdersAdmin.mock.calls.slice(callsBeforeSwitch).map(([query]) => query);
    expect(switchCalls).not.toContain('?page=2&view=trash');
    expect(screen.getByRole('button', { name: 'Trash (2)' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('table-view')).toHaveTextContent('trash');
  });

  it('falls back once when a mutation empties page two', async () => {
    render(<OrdersPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    await waitFor(() => expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=2&view=active'));
    mutateOrders.mockResolvedValueOnce({ data: { ...backendResponse, data: [], current_page: 2 } });

    const callsBeforeRefresh = useAllOrdersAdmin.mock.calls.length;
    fireEvent.click(screen.getByRole('button', { name: 'Refresh orders' }));

    await waitFor(() => expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=1&view=active'));
    const fallbackCalls = useAllOrdersAdmin.mock.calls.slice(callsBeforeRefresh).filter(([query]) => query === '?page=1&view=active');
    expect(fallbackCalls).toHaveLength(1);
  });

  it('does not apply an old page fallback after navigation changes the view', async () => {
    let resolveMutation;
    mutateOrders.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveMutation = resolve;
      }),
    );
    render(<OrdersPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    await waitFor(() => expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=2&view=active'));
    fireEvent.click(screen.getByRole('button', { name: 'Refresh orders' }));

    fireEvent.click(screen.getByRole('button', { name: 'Trash (2)' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    await waitFor(() => expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=2&view=trash'));
    const callsBeforeResolution = useAllOrdersAdmin.mock.calls.length;

    await act(async () => {
      resolveMutation({ data: { ...backendResponse, data: [], current_page: 2 } });
    });

    const callsAfterResolution = useAllOrdersAdmin.mock.calls.slice(callsBeforeResolution).map(([query]) => query);
    expect(callsAfterResolution).not.toContain('?page=1&view=trash');
    expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=2&view=trash');
  });
});
