import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useReactTable } from '@tanstack/react-table';

import { useToast } from '@/hooks/use-toast';
import { deleteOrder, permanentlyDeleteOrder, restoreOrder, updateOrderStatus } from '@/lib/actions/orders';

import { FilterOrdersPage } from '../FilterOrdersPage';

jest.mock('@/hooks/use-toast', () => ({ useToast: jest.fn() }));
jest.mock('@tanstack/react-table', () => {
  const actual = jest.requireActual('@tanstack/react-table');

  return {
    ...actual,
    useReactTable: jest.fn((options) => actual.useReactTable(options)),
  };
});
jest.mock('@/lib/actions/orders', () => ({
  deleteOrder: jest.fn(),
  permanentlyDeleteOrder: jest.fn(),
  restoreOrder: jest.fn(),
  updateOrderStatus: jest.fn(),
}));
jest.mock('@/app/components/Shared/TypeBadge', () => ({
  TypeBadge: ({ type }) => <span>{type}</span>,
  TYPE_ICONS: {},
}));
jest.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange }) => (
    <div>
      {children}
      <button type="button" onClick={() => onValueChange('completed')}>
        Set status completed
      </button>
    </div>
  ),
  SelectContent: ({ children }) => <div>{children}</div>,
  SelectItem: ({ children }) => <div>{children}</div>,
  SelectTrigger: ({ children }) => <div>{children}</div>,
  SelectValue: ({ placeholder }) => <span>{placeholder}</span>,
}));

const order = {
  id: 21,
  status: 'pending',
  user: { name: 'Test Customer' },
  orderable: { name: 'Desert Safari', item_type: 'activity' },
  payment: { total_amount: 125 },
  emergency_contact: { contact_name: 'Test Contact', relationship: 'Friend' },
};

function renderTable({ view = 'active', search = '', onSearchChange = jest.fn(), onOrdersChanged = jest.fn() } = {}) {
  render(<FilterOrdersPage data={{ data: [order] }} view={view} search={search} onSearchChange={onSearchChange} onOrdersChanged={onOrdersChanged} />);
  return { onSearchChange, onOrdersChanged };
}

describe('FilterOrdersPage trash actions', () => {
  const toast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useToast.mockReturnValue({ toast });
    deleteOrder.mockResolvedValue({ success: true, message: 'Order moved to Trash.' });
    restoreOrder.mockResolvedValue({ success: true, message: 'Order restored successfully.' });
    permanentlyDeleteOrder.mockResolvedValue({ success: true, message: 'Order permanently deleted.' });
    updateOrderStatus.mockResolvedValue({ success: true, message: 'Order status updated.' });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('debounces search changes and trims the applied query', () => {
    jest.useFakeTimers();
    const onSearchChange = jest.fn();
    renderTable({ onSearchChange });

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search orders by order number, customer, or item' }), {
      target: { value: '  Desert Safari  ' },
    });

    act(() => jest.advanceTimersByTime(299));
    expect(onSearchChange).not.toHaveBeenCalled();

    act(() => jest.advanceTimersByTime(1));
    expect(onSearchChange).toHaveBeenCalledTimes(1);
    expect(onSearchChange).toHaveBeenCalledWith('Desert Safari');
  });

  it('renders the replacement search field instead of the old status text field', () => {
    renderTable({ search: 'Safari' });

    expect(screen.getByRole('searchbox', { name: 'Search orders by order number, customer, or item' })).toHaveValue('Safari');
    expect(screen.queryByPlaceholderText('Filter By status...')).not.toBeInTheDocument();
  });

  it('does not configure a page-local filtered row model', () => {
    renderTable();

    const options = useReactTable.mock.calls.at(-1)[0];
    expect(options.onColumnFiltersChange).toBeUndefined();
    expect(options.getFilteredRowModel).toBeUndefined();
    expect(options.state).not.toHaveProperty('columnFilters');
  });

  it('keeps table inputs stable while a Trash response is loading', () => {
    const { rerender } = render(<FilterOrdersPage data={{}} view="trash" />);
    const firstOptions = useReactTable.mock.calls.at(-1)[0];

    rerender(<FilterOrdersPage data={{}} view="trash" />);
    const secondOptions = useReactTable.mock.calls.at(-1)[0];

    expect(secondOptions.data).toBe(firstOptions.data);
    expect(secondOptions.columns).toBe(firstOptions.columns);
  });

  it('refreshes the table after a successful status update', async () => {
    const { onOrdersChanged } = renderTable();

    fireEvent.click(screen.getByRole('button', { name: 'Set status completed' }));

    await waitFor(() => expect(updateOrderStatus).toHaveBeenCalledWith(21, 'completed'));
    expect(onOrdersChanged).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith({ title: 'Order status updated.' });
  });

  it('confirms before moving an active order to Trash', async () => {
    const { onOrdersChanged } = renderTable();

    fireEvent.click(screen.getByRole('button', { name: 'Move order 21 to Trash' }));
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Move order to Trash?');
    fireEvent.click(screen.getByRole('button', { name: 'Move to Trash' }));

    await waitFor(() => expect(deleteOrder).toHaveBeenCalledWith(21));
    expect(onOrdersChanged).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith({ title: 'Order moved to Trash.' });
  });

  it('offers restore and permanent delete only in the Trash view', async () => {
    const { onOrdersChanged } = renderTable({ view: 'trash' });

    expect(screen.queryByText('Select status')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Restore order 21' }));
    await waitFor(() => expect(restoreOrder).toHaveBeenCalledWith(21));

    fireEvent.click(screen.getByRole('button', { name: 'Delete order 21 permanently' }));
    expect(screen.getByRole('alertdialog')).toHaveTextContent('permanently');
    fireEvent.click(screen.getByRole('button', { name: 'Delete permanently' }));
    await waitFor(() => expect(permanentlyDeleteOrder).toHaveBeenCalledWith(21));

    expect(onOrdersChanged).toHaveBeenCalledTimes(2);
  });

  it('keeps the row and shows the backend message when an action returns failure', async () => {
    const onOrdersChanged = jest.fn();
    deleteOrder.mockResolvedValue({ success: false, message: 'Order not found.' });
    renderTable({ onOrdersChanged });

    fireEvent.click(screen.getByRole('button', { name: 'Move order 21 to Trash' }));
    fireEvent.click(screen.getByRole('button', { name: 'Move to Trash' }));

    await waitFor(() => expect(toast).toHaveBeenCalledWith({ title: 'Order not found.', variant: 'destructive' }));
    expect(onOrdersChanged).not.toHaveBeenCalled();
    expect(screen.getByText('21')).toBeInTheDocument();
  });

  it('handles an unexpectedly thrown restore error without refreshing', async () => {
    const onOrdersChanged = jest.fn();
    restoreOrder.mockRejectedValue(new Error('Network unavailable.'));
    renderTable({ view: 'trash', onOrdersChanged });

    fireEvent.click(screen.getByRole('button', { name: 'Restore order 21' }));

    await waitFor(() => expect(toast).toHaveBeenCalledWith({ title: 'Network unavailable.', variant: 'destructive' }));
    expect(onOrdersChanged).not.toHaveBeenCalled();
    expect(screen.getByText('21')).toBeInTheDocument();
  });
});
