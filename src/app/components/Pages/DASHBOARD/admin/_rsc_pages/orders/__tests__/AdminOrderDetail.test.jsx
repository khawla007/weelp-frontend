import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { useAdminOrder } from '@/hooks/api/admin/orders';
import { useToast } from '@/hooks/use-toast';
import { updateOrderStatus } from '@/lib/actions/orders';

import AdminOrderDetail from '../AdminOrderDetail';

jest.mock('@/hooks/api/admin/orders', () => ({ useAdminOrder: jest.fn() }));
jest.mock('@/hooks/use-toast', () => ({ useToast: jest.fn() }));
jest.mock('@/lib/actions/orders', () => ({ updateOrderStatus: jest.fn() }));
jest.mock('@/app/components/Shared/TypeBadge', () => ({
  TypeBadge: ({ type }) => <span>{type}</span>,
}));
jest.mock('../AdminCancellationPanel', () => ({
  __esModule: true,
  default: ({ cancellation, requester, onResolved }) => (
    <section data-testid="admin-cancellation-panel">
      <span>{cancellation.status}</span>
      <span>{requester?.email}</span>
      <button type="button" onClick={() => onResolved?.({ ...cancellation, status: 'approved' })}>
        Resolve cancellation
      </button>
    </section>
  ),
}));

let mockSelectOnValueChange;
let mockSelectValue;
let mockNextSelectValue;

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange, value }) => {
    mockSelectOnValueChange = onValueChange;
    mockSelectValue = value;
    return (
      <div data-testid="status-select" data-value={value}>
        {children}
      </div>
    );
  },
  SelectContent: ({ children }) => <div>{children}</div>,
  SelectItem: ({ children, value }) => <span data-value={value}>{children}</span>,
  SelectTrigger: ({ children, ...props }) => (
    <button type="button" {...props} onClick={() => mockSelectOnValueChange?.(mockNextSelectValue)}>
      {children}
    </button>
  ),
  SelectValue: ({ placeholder }) => <span>{mockSelectValue || placeholder}</span>,
}));

const NOW = new Date('2026-08-11T12:00:00.000Z').getTime();

const makeOrder = (overrides = {}) => ({
  id: 42,
  status: 'pending',
  type: 'activity',
  is_trashed: false,
  created_at: new Date(NOW - 8 * 60 * 1000).toISOString(),
  travel_date: '2026-08-20',
  preferred_time: '09:30 AM',
  number_of_adults: 2,
  number_of_children: 1,
  special_requirements: 'Vegetarian meal',
  orderable: { name: 'Desert Safari', item_type: 'activity' },
  payment: {
    total_amount: 185,
    custom_amount: 25,
    is_custom_amount: true,
    currency: 'USD',
    payment_status: 'paid',
    payment_method: 'card',
  },
  user: { name: 'Customer Name', email: 'customer@example.test', profile: { phone: '+15555550000' } },
  emergency_contact: { contact_name: 'Emergency Person', contact_phone: '+15555550123', relationship: 'Sibling' },
  ...overrides,
});

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, reject, resolve };
};

const setHookResult = (overrides = {}) => {
  const result = {
    order: makeOrder(),
    isLoading: false,
    error: null,
    errorStatus: null,
    mutate: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
  useAdminOrder.mockReturnValue(result);
  return result;
};

describe('AdminOrderDetail', () => {
  let toast;

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(NOW);
    toast = jest.fn();
    useToast.mockReturnValue({ toast });
    updateOrderStatus.mockReset();
    mockSelectOnValueChange = undefined;
    mockSelectValue = undefined;
    mockNextSelectValue = 'completed';
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('shows a responsive skeleton while loading and keeps Back enabled', () => {
    setHookResult({ order: null, isLoading: true });

    render(<AdminOrderDetail orderId={42} isTrashed={false} onBack={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Back to orders' })).toBeEnabled();
    expect(screen.getByTestId('admin-order-detail-skeleton')).toHaveClass('grid-cols-1', 'lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]', 'min-w-0');
  });

  it.each([
    [500, 'Check your connection and try again.'],
    [404, 'This order is no longer available.'],
  ])('offers retry and back after a %s load failure', async (errorStatus, explanation) => {
    const onBack = jest.fn();
    const { mutate } = setHookResult({ order: null, error: new Error('failed'), errorStatus });

    render(<AdminOrderDetail orderId={42} isTrashed={false} onBack={onBack} />);

    expect(screen.getByRole('heading', { name: 'We could not load this order.' })).toBeInTheDocument();
    expect(screen.getByText(explanation)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    fireEvent.click(screen.getByRole('button', { name: 'Back to orders' }));
    await waitFor(() => expect(mutate).toHaveBeenCalledWith(undefined, { throwOnError: false }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('contains a rejected Retry refresh and keeps recovery actions available', async () => {
    const mutate = jest.fn().mockRejectedValue(new Error('retry failed'));
    setHookResult({ order: null, error: new Error('failed'), errorStatus: 500, mutate });

    render(<AdminOrderDetail orderId={42} isTrashed={false} onBack={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    await waitFor(() => expect(mutate).toHaveBeenCalledWith(undefined, { throwOnError: false }));
    expect(screen.getByRole('button', { name: 'Retry' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Back to orders' })).toBeEnabled();
  });

  it('renders the complete approved order detail and responsive layout', () => {
    setHookResult();

    render(<AdminOrderDetail orderId={42} isTrashed={false} onBack={jest.fn()} />);

    expect(screen.getByRole('heading', { name: 'Desert Safari' })).toBeInTheDocument();
    [
      'Order #42',
      'activity',
      '8m ago',
      'Travel details',
      'Aug 20, 2026',
      '09:30 AM',
      '2 adults',
      '1 child',
      'Special requirements',
      'Vegetarian meal',
      'Payment',
      '$210.00',
      'Base amount',
      '$185.00',
      'Custom amount',
      '$25.00',
      'paid',
      'card',
      'Customer',
      'Customer Name',
      'customer@example.test',
      '+15555550000',
      'Emergency contact',
      'Emergency Person',
      '+15555550123',
      'Sibling',
    ].forEach((value) => expect(screen.getByText(value)).toBeInTheDocument());
    expect(screen.getByTestId('admin-order-detail')).toHaveClass('min-w-0', 'break-words');
    expect(screen.getByTestId('admin-order-detail-grid')).toHaveClass('grid-cols-1', 'lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]', 'min-w-0');
    screen.getAllByTestId('admin-order-detail-column').forEach((column) => expect(column).toHaveClass('min-w-0', 'break-words'));
  });

  it.each(['pending', 'refund_processing', 'refund_failed'])('renders the cancellation panel above details and blocks status changes for %s requests', (status) => {
    setHookResult({ order: makeOrder({ cancellation: { id: 9, status } }) });

    render(<AdminOrderDetail orderId={42} isTrashed={false} onBack={jest.fn()} />);

    const panel = screen.getByTestId('admin-cancellation-panel');
    expect(panel).toHaveTextContent(status);
    expect(panel).toHaveTextContent('customer@example.test');
    expect(panel.compareDocumentPosition(screen.getByTestId('admin-order-detail-grid')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Change status for order 42' })).toBeDisabled();
    expect(screen.getByText('Resolve the cancellation request before changing the order status.')).toBeInTheDocument();
  });

  it.each(['approved', 'rejected'])('keeps status mutations available after a %s cancellation decision', (status) => {
    setHookResult({ order: makeOrder({ cancellation: { id: 9, status } }) });

    render(<AdminOrderDetail orderId={42} isTrashed={false} onBack={jest.fn()} />);

    expect(screen.getByTestId('admin-cancellation-panel')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Change status for order 42' })).toBeEnabled();
    expect(screen.queryByText('Resolve the cancellation request before changing the order status.')).not.toBeInTheDocument();
  });

  it.each(['detail', 'list'])('refreshes both cancellation views after resolution even when the %s refresh rejects', async (failedRefresh) => {
    const mutate = failedRefresh === 'detail' ? jest.fn().mockRejectedValue(new Error('detail failed')) : jest.fn().mockResolvedValue(undefined);
    const onStatusChanged = failedRefresh === 'list' ? jest.fn().mockRejectedValue(new Error('list failed')) : jest.fn().mockResolvedValue(undefined);
    setHookResult({ order: makeOrder({ cancellation: { id: 9, status: 'pending' } }), mutate });

    render(<AdminOrderDetail orderId={42} isTrashed={false} onBack={jest.fn()} onStatusChanged={onStatusChanged} />);
    fireEvent.click(screen.getByRole('button', { name: 'Resolve cancellation' }));

    await waitFor(() => expect(mutate).toHaveBeenCalledTimes(1));
    expect(onStatusChanged).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith({
      title: 'Cancellation request updated.',
      description: 'Decision saved, but the latest data could not be refreshed.',
    });
    expect(toast).not.toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' }));
  });

  it('uses fallbacks for blank optional values and wraps long content', () => {
    const longName = 'A'.repeat(180);
    const longRequirement = 'Dietary request '.repeat(30).trim();
    setHookResult({
      order: makeOrder({
        type: '',
        preferred_time: '',
        special_requirements: longRequirement,
        user: { name: longName, email: '', profile: { phone: null } },
        emergency_contact: { contact_name: '', contact_phone: null, relationship: '' },
      }),
    });

    render(<AdminOrderDetail orderId={42} isTrashed={false} onBack={jest.fn()} />);

    expect(screen.getByText(longName)).toHaveClass('break-words');
    expect(screen.getByText(longRequirement)).toHaveClass('break-words');
    expect(screen.getAllByText('Not provided').length).toBeGreaterThanOrEqual(5);
    expect(screen.getByTestId('admin-order-detail')).toHaveClass('min-w-0');
  });

  it('shows a value fallback when both item type sources are absent', () => {
    setHookResult({ order: makeOrder({ type: null, orderable: { name: 'Desert Safari', item_type: null } }) });

    render(<AdminOrderDetail orderId={42} isTrashed={false} onBack={jest.fn()} />);

    expect(screen.getAllByText('Not provided').length).toBeGreaterThan(0);
  });

  it('shows a phone fallback when the customer profile is missing', () => {
    setHookResult({ order: makeOrder({ user: { name: 'Customer Name', email: 'customer@example.test' } }) });

    render(<AdminOrderDetail orderId={42} isTrashed={false} onBack={jest.fn()} />);

    const [phoneLabel] = screen.getAllByText('Phone', { selector: 'dt' });
    expect(phoneLabel.nextElementSibling).toHaveTextContent('Not provided');
  });

  it.each(['invalid-date', null])('uses plain fallback text rather than time semantics for received date %s', (createdAt) => {
    setHookResult({ order: makeOrder({ created_at: createdAt }) });

    render(<AdminOrderDetail orderId={42} isTrashed={false} onBack={jest.fn()} />);

    expect(screen.getByText('Not available')).toBeInTheDocument();
    expect(screen.queryByText('Not available', { selector: 'time' })).not.toBeInTheDocument();
    expect(document.querySelector('time')).not.toBeInTheDocument();
  });

  it('prevents duplicate status updates, keeps the controlled value, and refreshes after success', async () => {
    const request = deferred();
    const onStatusChanged = jest.fn().mockResolvedValue(undefined);
    const { mutate } = setHookResult();
    updateOrderStatus.mockReturnValue(request.promise);

    render(<AdminOrderDetail orderId={42} isTrashed={false} onBack={jest.fn()} onStatusChanged={onStatusChanged} />);
    const control = screen.getByRole('button', { name: 'Change status for order 42' });
    fireEvent.click(control);
    expect(control).toBeDisabled();
    fireEvent.click(control);
    expect(updateOrderStatus).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('status-select')).toHaveAttribute('data-value', 'pending');

    await act(async () => request.resolve({ success: true, message: 'Order status updated.' }));

    await waitFor(() => expect(control).toBeEnabled());
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(onStatusChanged).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith({ title: 'Order status updated.' });
    expect(screen.getByTestId('status-select')).toHaveAttribute('data-value', 'pending');
  });

  it('synchronously locks status requests against direct same-tick re-entry', async () => {
    const request = deferred();
    setHookResult();
    updateOrderStatus.mockReturnValue(request.promise);

    render(<AdminOrderDetail orderId={42} isTrashed={false} onBack={jest.fn()} />);
    act(() => {
      mockSelectOnValueChange('completed');
      mockSelectOnValueChange('cancelled');
    });

    expect(updateOrderStatus).toHaveBeenCalledTimes(1);
    expect(updateOrderStatus).toHaveBeenCalledWith(42, 'completed');
    await act(async () => request.resolve({ success: false, message: 'Rejected.' }));
    expect(screen.getByRole('button', { name: 'Change status for order 42' })).toBeEnabled();
  });

  it('restores the control and reports a backend status rejection without refreshing', async () => {
    const onStatusChanged = jest.fn();
    const { mutate } = setHookResult();
    updateOrderStatus.mockResolvedValue({ success: false, message: 'Pending orders cannot be completed.' });

    render(<AdminOrderDetail orderId={42} isTrashed={false} onBack={jest.fn()} onStatusChanged={onStatusChanged} />);
    fireEvent.click(screen.getByRole('button', { name: 'Change status for order 42' }));

    await waitFor(() => expect(toast).toHaveBeenCalledWith({ title: 'Pending orders cannot be completed.', variant: 'destructive' }));
    expect(mutate).not.toHaveBeenCalled();
    expect(onStatusChanged).not.toHaveBeenCalled();
    expect(screen.getByTestId('status-select')).toHaveAttribute('data-value', 'pending');
    expect(screen.getByRole('button', { name: 'Change status for order 42' })).toBeEnabled();
  });

  it.each([
    ['processing', 'pending', 'Pending status cannot be selected.'],
    ['pending', 'processing', 'Processing status cannot be selected.'],
    ['pending', 'completed', 'Unpaid orders cannot be completed.'],
    ['processing', 'cancelled', 'Only pending orders can be cancelled.'],
  ])('keeps %s selectable while showing a rejected %s transition message', async (currentStatus, nextStatus, message) => {
    mockNextSelectValue = nextStatus;
    setHookResult({ order: makeOrder({ status: currentStatus }) });
    updateOrderStatus.mockResolvedValue({ success: false, message });

    render(<AdminOrderDetail orderId={42} isTrashed={false} onBack={jest.fn()} />);

    expect(screen.getByTestId('status-select')).toHaveAttribute('data-value', currentStatus);
    expect(screen.getAllByText(nextStatus).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: 'Change status for order 42' }));
    await waitFor(() => expect(toast).toHaveBeenCalledWith({ title: message, variant: 'destructive' }));
    expect(updateOrderStatus).toHaveBeenCalledWith(42, nextStatus);
    expect(screen.getByTestId('status-select')).toHaveAttribute('data-value', currentStatus);
  });

  it.each(['detail', 'list'])('preserves update success when the %s refresh rejects', async (failedRefresh) => {
    const mutate = failedRefresh === 'detail' ? jest.fn().mockRejectedValue(new Error('detail refresh failed')) : jest.fn().mockResolvedValue(undefined);
    const onStatusChanged = failedRefresh === 'list' ? jest.fn().mockRejectedValue(new Error('list refresh failed')) : jest.fn().mockResolvedValue(undefined);
    setHookResult({ mutate });
    updateOrderStatus.mockResolvedValue({ success: true, message: 'Order status updated.' });

    render(<AdminOrderDetail orderId={42} isTrashed={false} onBack={jest.fn()} onStatusChanged={onStatusChanged} />);
    fireEvent.click(screen.getByRole('button', { name: 'Change status for order 42' }));

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith({
        title: 'Order status updated.',
        description: 'Status changed, but the latest data could not be refreshed.',
      }),
    );
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(onStatusChanged).toHaveBeenCalledTimes(1);
    expect(toast.mock.calls[0][0]).not.toEqual(expect.objectContaining({ variant: 'destructive' }));
    expect(toast.mock.calls[0][0].title).not.toMatch(/failed/i);
  });

  it('reports a thrown backend update as destructive', async () => {
    setHookResult();
    updateOrderStatus.mockRejectedValue(new Error('Server unavailable.'));

    render(<AdminOrderDetail orderId={42} isTrashed={false} onBack={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Change status for order 42' }));

    await waitFor(() => expect(toast).toHaveBeenCalledWith({ title: 'Server unavailable.', variant: 'destructive' }));
  });

  it.each([
    ['the selected Trash view', true, false],
    ['a freshly trashed backend record', false, true],
  ])('renders read-only status for %s', (_label, isTrashed, recordIsTrashed) => {
    setHookResult({ order: makeOrder({ is_trashed: recordIsTrashed }) });

    render(<AdminOrderDetail orderId={42} isTrashed={isTrashed} onBack={jest.fn()} />);

    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Change status for order 42' })).not.toBeInTheDocument();
  });

  it('updates compact relative time and clears its interval on unmount', () => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
    const clearIntervalSpy = jest.spyOn(window, 'clearInterval');
    setHookResult({ order: makeOrder({ created_at: new Date(NOW - 59_000).toISOString() }) });

    const { unmount } = render(<AdminOrderDetail orderId={42} isTrashed={false} onBack={jest.fn()} />);
    expect(screen.getByText('59s ago')).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(1_000));
    expect(screen.getByText('1m ago')).toBeInTheDocument();

    unmount();
    act(() => jest.advanceTimersByTime(1_000));
    expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
  });
});
