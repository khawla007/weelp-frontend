import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { useAllOrdersAdmin } from '@/hooks/api/admin/orders';

import OrdersPage from '../page';

jest.mock('@/hooks/api/admin/orders', () => ({ useAllOrdersAdmin: jest.fn() }));
jest.mock('@/lib/actions/vendor', () => ({ editVendorStatusbyIdAdmin: jest.fn() }));
jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }) => children,
  DropdownMenuTrigger: ({ children }) => children,
  DropdownMenuContent: ({ children }) => <div>{children}</div>,
  DropdownMenuRadioGroup: ({ children, value, onValueChange }) => (
    <select aria-label="Order status options" value={value} onChange={(event) => onValueChange(event.target.value)}>
      {children}
    </select>
  ),
  DropdownMenuRadioItem: ({ children, value }) => <option value={value}>{children}</option>,
}));
jest.mock('@/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/orders_shared', () => ({
  NavigationOrder: () => <div>Orders heading</div>,
  StatsOrdersCards: () => <div>Order stats</div>,
}));
jest.mock('@/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/FilterOrdersPage', () => ({
  FilterOrdersPage: ({ view, search, onSearchChange, onOrdersChanged }) => (
    <div>
      <span data-testid="table-view">{view}</span>
      <input aria-label="Mock order search" value={search} onChange={(event) => onSearchChange?.(event.target.value)} />
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

  const chooseStatus = (status) => {
    fireEvent.change(screen.getByRole('combobox', { name: 'Order status options' }), {
      target: { value: status },
    });
  };

  it('adds top spacing that matches the table toolbar spacing below the order views', () => {
    render(<OrdersPage />);

    expect(screen.getByLabelText('Order views')).toHaveClass('pt-4');
  });

  it('starts with All Status and omits empty filters from the request', () => {
    render(<OrdersPage />);

    expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=1&view=active');
    expect(screen.getByRole('button', { name: 'Filter orders by status: All Status' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('option', { name: 'Processing' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Confirmed' })).not.toBeInTheDocument();
  });

  it('filters processing orders', async () => {
    render(<OrdersPage />);

    chooseStatus('processing');

    await waitFor(() => expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=1&view=active&status=processing'));
    expect(screen.getByRole('button', { name: 'Filter orders by status: Processing' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('hides the open-state ring without removing keyboard focus visibility', () => {
    render(<OrdersPage />);

    const statusTrigger = screen.getByRole('button', { name: 'Filter orders by status: All Status' });

    expect(statusTrigger).toHaveClass('data-[state=open]:ring-0', 'data-[state=open]:ring-offset-0');
    expect(statusTrigger).toHaveClass('focus-visible:ring-2', 'focus-visible:ring-offset-2');
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

  it('applies and clears a status filter from the order-view row', async () => {
    render(<OrdersPage />);

    chooseStatus('completed');

    await waitFor(() => expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=1&view=active&status=completed'));
    expect(screen.getByRole('button', { name: 'Filter orders by status: Completed' })).toHaveAttribute('aria-pressed', 'true');

    chooseStatus('all');

    await waitFor(() => expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=1&view=active'));
  });

  it('combines encoded search and status filters across All and Trash', async () => {
    render(<OrdersPage />);

    chooseStatus('completed');
    fireEvent.change(screen.getByRole('textbox', { name: 'Mock order search' }), {
      target: { value: 'Desert Safari & BBQ' },
    });

    await waitFor(() => expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=1&view=active&status=completed&search=Desert+Safari+%26+BBQ'));

    fireEvent.click(screen.getByRole('button', { name: 'Trash (2)' }));

    await waitFor(() => expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=1&view=trash&status=completed&search=Desert+Safari+%26+BBQ'));
    expect(screen.getByRole('textbox', { name: 'Mock order search' })).toHaveValue('Desert Safari & BBQ');
    expect(screen.getByRole('button', { name: 'Filter orders by status: Completed' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('resets page atomically when status changes', async () => {
    render(<OrdersPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    await waitFor(() => expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=2&view=active'));
    const callsBeforeFilter = useAllOrdersAdmin.mock.calls.length;

    chooseStatus('completed');

    await waitFor(() => expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=1&view=active&status=completed'));
    const filterCalls = useAllOrdersAdmin.mock.calls.slice(callsBeforeFilter).map(([query]) => query);
    expect(filterCalls).not.toContain('?page=2&view=active&status=completed');
  });

  it('resets page atomically when applied search changes', async () => {
    render(<OrdersPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    await waitFor(() => expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=2&view=active'));
    const callsBeforeFilter = useAllOrdersAdmin.mock.calls.length;

    fireEvent.change(screen.getByRole('textbox', { name: 'Mock order search' }), {
      target: { value: 'Safari' },
    });

    await waitFor(() => expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=1&view=active&search=Safari'));
    const filterCalls = useAllOrdersAdmin.mock.calls.slice(callsBeforeFilter).map(([query]) => query);
    expect(filterCalls).not.toContain('?page=2&view=active&search=Safari');
  });

  it('clears one filter without clearing the other', async () => {
    render(<OrdersPage />);

    chooseStatus('completed');
    fireEvent.change(screen.getByRole('textbox', { name: 'Mock order search' }), {
      target: { value: 'Safari' },
    });
    await waitFor(() => expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=1&view=active&status=completed&search=Safari'));

    fireEvent.change(screen.getByRole('textbox', { name: 'Mock order search' }), {
      target: { value: '' },
    });
    await waitFor(() => expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=1&view=active&status=completed'));

    fireEvent.change(screen.getByRole('textbox', { name: 'Mock order search' }), {
      target: { value: 'Safari' },
    });
    chooseStatus('all');

    await waitFor(() => expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=1&view=active&search=Safari'));
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

  it('does not apply an old page fallback after search changes', async () => {
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

    fireEvent.change(screen.getByRole('textbox', { name: 'Mock order search' }), {
      target: { value: 'Safari' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    await waitFor(() => expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=2&view=active&search=Safari'));
    const callsBeforeResolution = useAllOrdersAdmin.mock.calls.length;

    await act(async () => {
      resolveMutation({ data: { ...backendResponse, data: [], current_page: 2 } });
    });

    const callsAfterResolution = useAllOrdersAdmin.mock.calls.slice(callsBeforeResolution).map(([query]) => query);
    expect(callsAfterResolution).not.toContain('?page=1&view=active&search=Safari');
    expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=2&view=active&search=Safari');
  });
});
