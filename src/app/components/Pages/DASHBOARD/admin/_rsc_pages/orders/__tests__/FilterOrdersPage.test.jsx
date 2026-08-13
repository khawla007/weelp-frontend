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
  created_at: '2026-08-11T11:59:01.000Z',
  user: { name: 'Test Customer' },
  orderable: { name: 'Desert Safari', item_type: 'activity' },
  payment: { total_amount: 125 },
  emergency_contact: { contact_name: 'Test Contact', relationship: 'Friend' },
};

function renderTable({ data = { data: [order] }, view = 'active', searchDraft = '', onSearchDraftChange = jest.fn(), onOrdersChanged = jest.fn(), onViewOrder = jest.fn() } = {}) {
  render(<FilterOrdersPage data={data} view={view} searchDraft={searchDraft} onSearchDraftChange={onSearchDraftChange} onOrdersChanged={onOrdersChanged} onViewOrder={onViewOrder} />);
  return { onSearchDraftChange, onOrdersChanged, onViewOrder };
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

  it('reports raw search draft changes immediately', () => {
    const onSearchDraftChange = jest.fn();
    renderTable({ searchDraft: 'Safari', onSearchDraftChange });

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search orders by order number, customer, or item' }), {
      target: { value: '  Desert Safari  ' },
    });

    expect(onSearchDraftChange).toHaveBeenCalledTimes(1);
    expect(onSearchDraftChange).toHaveBeenCalledWith('  Desert Safari  ');
  });

  it('renders the replacement search field instead of the old status text field', () => {
    renderTable({ searchDraft: 'Safari' });

    expect(screen.getByRole('searchbox', { name: 'Search orders by order number, customer, or item' })).toHaveValue('Safari');
    expect(screen.queryByPlaceholderText('Filter By status...')).not.toBeInTheDocument();
  });

  it('shows a shared received-age clock instead of emergency contact details', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-08-11T12:00:00.000Z'));
    renderTable();

    expect(screen.getByRole('columnheader', { name: 'ORDER RECEIVED' })).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'EMERGENCY CONTACT' })).not.toBeInTheDocument();
    expect(screen.getByText('59s ago')).toBeInTheDocument();

    act(() => jest.advanceTimersByTime(1000));

    expect(screen.getByText('1m ago')).toBeInTheDocument();
  });

  it.each([
    ['invalid', 'invalid-date'],
    ['missing', null],
  ])('uses plain fallback text for an %s received date', (_label, createdAt) => {
    renderTable({ data: { data: [{ ...order, created_at: createdAt }] } });

    const fallback = screen.getByText('Not available');
    expect(fallback.tagName).toBe('SPAN');
    expect(fallback.closest('td')?.querySelector('time')).not.toBeInTheDocument();
  });

  it.each([
    ['missing payment', null],
    ['missing amount', {}],
    ['invalid amount', { total_amount: 'not-a-number' }],
  ])('shows a value fallback for %s', (_label, payment) => {
    renderTable({ data: { data: [{ ...order, payment }] } });

    expect(screen.getByText('Not provided')).toBeInTheDocument();
    expect(screen.queryByText('$NaN')).not.toBeInTheDocument();
  });

  it('includes a valid custom amount while preserving compact list formatting', () => {
    renderTable({ data: { data: [{ ...order, payment: { total_amount: 125, custom_amount: 25, is_custom_amount: true } }] } });

    expect(screen.getByText('$150')).toBeInTheDocument();
  });

  it.each([
    ['active', false],
    ['trash', true],
  ])('opens order details from the %s view', (view, isTrashed) => {
    const onViewOrder = jest.fn();
    renderTable({ view, onViewOrder });

    fireEvent.click(screen.getByRole('button', { name: 'View order 21' }));

    expect(onViewOrder).toHaveBeenCalledWith(21, { isTrashed });
  });

  it('marks only actionable cancellation rows with semantic danger treatment and an icon beside the order ID', () => {
    const attentionOrder = { ...order, id: 22, cancellation_needs_attention: true };
    const ordinaryOrder = { ...order, id: 23, cancellation_needs_attention: false };
    const truthyNonBooleanOrder = { ...order, id: 24, cancellation_needs_attention: 1 };

    renderTable({ data: { data: [attentionOrder, ordinaryOrder, truthyNonBooleanOrder] } });

    const alert = screen.getByLabelText('Cancellation needs attention');
    const attentionRow = screen.getByText('22').closest('tr');
    const ordinaryRow = screen.getByText('23').closest('tr');
    const truthyNonBooleanRow = screen.getByText('24').closest('tr');

    expect(alert).toHaveClass('size-4', 'text-destructive');
    expect(alert.closest('td')).toContainElement(screen.getByText('22'));
    expect(attentionRow).toHaveClass('bg-destructive/10', 'dark:bg-destructive/15', 'shadow-[inset_4px_0_0_hsl(var(--destructive))]');
    expect(ordinaryRow).not.toHaveClass('bg-destructive/10', 'dark:bg-destructive/15', 'shadow-[inset_4px_0_0_hsl(var(--destructive))]');
    expect(truthyNonBooleanRow).not.toHaveClass('bg-destructive/10', 'dark:bg-destructive/15', 'shadow-[inset_4px_0_0_hsl(var(--destructive))]');
    expect(attentionRow.className).not.toMatch(/(?:red|rose)-\d+/);
    expect(screen.getAllByRole('button', { name: /view order/i })).toHaveLength(3);
    expect(screen.getAllByText('Select status')).toHaveLength(3);
    expect(alert).not.toHaveTextContent(/\d/);
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
