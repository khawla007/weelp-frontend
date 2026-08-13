import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { useAllOrdersAdmin } from '@/hooks/api/admin/orders';
import { useMarkAdminNavigationSeen } from '@/hooks/api/admin/navigationUnseen';
import { parseOrderQuery, replaceOrderQuery } from '@/lib/navigation/orderQuery';

import OrdersPage from '../page';

const mockGlobalMutate = jest.fn();
let mockDetailRefreshPromise;
let navigationState;
let nextNavigationState;
let mockSearchParams;
const mockNavigationListeners = new Set();
const mockReplace = jest.fn((href) => {
  mockSearchParams = new URLSearchParams(href.split('?')[1] ?? '');
  mockNavigationListeners.forEach((listener) => listener());
});

jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/admin/orders',
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => {
    const React = jest.requireActual('react');
    React.useSyncExternalStore(
      (listener) => {
        mockNavigationListeners.add(listener);
        return () => mockNavigationListeners.delete(listener);
      },
      () => mockSearchParams,
      () => mockSearchParams,
    );
    return mockSearchParams;
  },
}));

jest.mock('swr', () => ({
  useSWRConfig: () => ({ mutate: mockGlobalMutate }),
}));
jest.mock('@/hooks/api/admin/orders', () => ({ useAllOrdersAdmin: jest.fn() }));
jest.mock('@/hooks/api/admin/navigationUnseen', () => ({
  newestCreatedAt: jest.requireActual('@/hooks/api/admin/navigationUnseen').newestCreatedAt,
  useMarkAdminNavigationSeen: jest.fn(),
}));
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
  FilterOrdersPage: ({ view, searchDraft, onSearchDraftChange, onOrdersChanged, onViewOrder }) => (
    <div>
      <span data-testid="table-view">{view}</span>
      <input aria-label="Mock order search" value={searchDraft} onChange={(event) => onSearchDraftChange?.(event.target.value)} />
      <button type="button" onClick={onOrdersChanged}>
        Refresh orders
      </button>
      <button type="button" onClick={() => onViewOrder(42, { isTrashed: view === 'trash' })}>
        Mock view order
      </button>
    </div>
  ),
}));
jest.mock('@/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/AdminOrderDetail', () => ({
  __esModule: true,
  default: ({ orderId, isTrashed, onBack, onStatusChanged }) => (
    <div data-testid="mock-admin-order-detail">
      <span>Detail order {orderId}</span>
      <span>Detail trashed {String(isTrashed)}</span>
      <button type="button" onClick={onBack}>
        Back to list
      </button>
      <button
        type="button"
        onClick={() => {
          mockDetailRefreshPromise = onStatusChanged({ cancellation: { status: 'approved' } });
        }}
      >
        Resolve cancellation terminally
      </button>
      <button
        type="button"
        onClick={() => {
          mockDetailRefreshPromise = onStatusChanged({ cancellation: { status: 'refund_failed' } });
        }}
      >
        Retry cancellation nonterminally
      </button>
    </div>
  ),
}));

describe('OrdersPage', () => {
  const mutateOrders = jest.fn();
  const originalScrollTo = window.scrollTo;
  const originalScrollYDescriptor = Object.getOwnPropertyDescriptor(window, 'scrollY');
  const originalRequestAnimationFrame = window.requestAnimationFrame;
  const originalCancelAnimationFrame = window.cancelAnimationFrame;
  let backendResponse;

  beforeEach(() => {
    jest.clearAllMocks();
    backendResponse = {
      data: [],
      summary: {},
      current_page: 1,
      per_page: 5,
      total: 6,
      last_page: 2,
      trash_count: 2,
    };
    mutateOrders.mockResolvedValue({ data: backendResponse });
    mockDetailRefreshPromise = undefined;
    navigationState = { counts: { orders: 4, reviews: 2 }, attention: { cancellations: true } };
    nextNavigationState = navigationState;
    mockSearchParams = new URLSearchParams();
    mockGlobalMutate.mockImplementation(async (key) => {
      if (key === '/api/admin/navigation-unseen-counts') navigationState = nextNavigationState;
      return navigationState;
    });
    useAllOrdersAdmin.mockImplementation((query) => ({
      orders: { data: { ...backendResponse, current_page: Number(new URLSearchParams(query).get('page')) || 1 } },
      isLoading: false,
      isValidating: false,
      mutate: mutateOrders,
      error: null,
    }));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    window.scrollTo = originalScrollTo;
    window.requestAnimationFrame = originalRequestAnimationFrame;
    window.cancelAnimationFrame = originalCancelAnimationFrame;

    if (originalScrollYDescriptor) {
      Object.defineProperty(window, 'scrollY', originalScrollYDescriptor);
    } else {
      delete window.scrollY;
    }
  });

  const chooseStatus = (status) => {
    fireEvent.change(screen.getByRole('combobox', { name: 'Order status options' }), {
      target: { value: status },
    });
  };

  const applySearchDebounce = async () => {
    await act(async () => {
      jest.advanceTimersByTime(300);
    });
  };

  it('adds top spacing that matches the table toolbar spacing below the order views', () => {
    render(<OrdersPage />);

    expect(screen.getByLabelText('Order views')).toHaveClass('pt-4');
  });

  it.each([
    [['1'], 1],
    [[String(Number.MAX_SAFE_INTEGER)], Number.MAX_SAFE_INTEGER],
    [[String(Number.MAX_SAFE_INTEGER + 1)], null],
    [['0'], null],
    [['1.5'], null],
    [['16', '17'], null],
  ])('parses a strict single safe positive order query %#', (value, expected) => {
    expect(parseOrderQuery(value)).toBe(expected);
  });

  it('replaces only the order query and rejects an unsafe replacement ID', () => {
    expect(replaceOrderQuery('/dashboard/admin/orders', 'page=3&status=pending&order=4', 16)).toBe('/dashboard/admin/orders?page=3&status=pending&order=16');
    expect(replaceOrderQuery('/dashboard/admin/orders', 'page=3&order=4', Number.MAX_SAFE_INTEGER + 1)).toBe('/dashboard/admin/orders?page=3');
  });

  it('opens an exact order from the initial query and ignores invalid, non-positive, and duplicate values', () => {
    mockSearchParams = new URLSearchParams('tab=all&order=16');
    const { rerender } = render(<OrdersPage />);

    expect(screen.getByText('Detail order 16')).toBeInTheDocument();

    for (const query of ['tab=all&order=nope', 'tab=all&order=0', 'tab=all&order=16&order=17']) {
      mockSearchParams = new URLSearchParams(query);
      rerender(<OrdersPage />);
      expect(screen.getByText('Orders heading')).toBeInTheDocument();
    }
  });

  it('preserves unrelated query parameters when selecting and returning from an order', () => {
    mockSearchParams = new URLSearchParams('page=3&status=pending');
    render(<OrdersPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Mock view order' }));
    expect(mockReplace).toHaveBeenLastCalledWith('/dashboard/admin/orders?page=3&status=pending&order=42', { scroll: false });

    fireEvent.click(screen.getByRole('button', { name: 'Back to list' }));
    expect(mockReplace).toHaveBeenLastCalledWith('/dashboard/admin/orders?page=3&status=pending', { scroll: false });
  });

  it('follows a changed order query while detail is open without replacing the URL', () => {
    mockSearchParams = new URLSearchParams('order=16');
    const { rerender } = render(<OrdersPage />);
    expect(screen.getByText('Detail order 16')).toBeInTheDocument();

    mockSearchParams = new URLSearchParams('order=17');
    rerender(<OrdersPage />);

    expect(screen.getByText('Detail order 17')).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('returns to the list when an externally removed query follows a UI selection', () => {
    const { rerender } = render(<OrdersPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Mock view order' }));
    expect(screen.getByText('Detail order 42')).toBeInTheDocument();

    mockSearchParams = new URLSearchParams('tab=all');
    rerender(<OrdersPage />);

    expect(screen.getByText('Orders heading')).toBeInTheDocument();
    expect(screen.queryByText('Detail order 42')).not.toBeInTheDocument();
  });

  it('announces a pending order navigation without rendering stale detail', () => {
    mockReplace.mockImplementationOnce(() => {});
    const { rerender } = render(<OrdersPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Mock view order' }));

    expect(screen.getByRole('status')).toHaveTextContent('Opening order 42…');
    expect(screen.getByText('Orders heading')).toBeInTheDocument();
    expect(screen.queryByText('Detail order 42')).not.toBeInTheDocument();

    mockSearchParams = new URLSearchParams('order=42');
    rerender(<OrdersPage />);

    expect(screen.getByText('Detail order 42')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledTimes(1);
  });

  it('expires pending order feedback when navigation is removed, invalid, or superseded', () => {
    mockReplace.mockImplementationOnce(() => {});
    const { rerender } = render(<OrdersPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Mock view order' }));
    expect(screen.getByRole('status')).toHaveTextContent('Opening order 42…');

    mockSearchParams = new URLSearchParams('order=invalid');
    rerender(<OrdersPage />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByText('Orders heading')).toBeInTheDocument();

    mockSearchParams = new URLSearchParams();
    rerender(<OrdersPage />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    mockSearchParams = new URLSearchParams('order=99');
    rerender(<OrdersPage />);
    expect(screen.getByText('Detail order 99')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('does not resurrect a detail after valid, invalid, duplicate, then absent order queries', () => {
    mockSearchParams = new URLSearchParams('order=16');
    const { rerender } = render(<OrdersPage />);
    expect(screen.getByText('Detail order 16')).toBeInTheDocument();

    for (const query of ['order=invalid', 'order=16&order=17', 'tab=all']) {
      mockSearchParams = new URLSearchParams(query);
      rerender(<OrdersPage />);
      expect(screen.getByText('Orders heading')).toBeInTheDocument();
    }
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

  it('filters refunded orders', async () => {
    render(<OrdersPage />);

    chooseStatus('refunded');

    await waitFor(() => expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=1&view=active&status=refunded'));
    expect(screen.getByRole('button', { name: 'Filter orders by status: Refunded' })).toHaveAttribute('aria-pressed', 'true');
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
    jest.useFakeTimers();
    render(<OrdersPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    await waitFor(() => expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=2&view=active'));
    const callsBeforeFilter = useAllOrdersAdmin.mock.calls.length;

    fireEvent.change(screen.getByRole('textbox', { name: 'Mock order search' }), {
      target: { value: 'Safari' },
    });
    await applySearchDebounce();

    await waitFor(() => expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=1&view=active&search=Safari'));
    const filterCalls = useAllOrdersAdmin.mock.calls.slice(callsBeforeFilter).map(([query]) => query);
    expect(filterCalls).not.toContain('?page=2&view=active&search=Safari');
  });

  it('keeps the page-owned search debounce alive while detail replaces the list', async () => {
    jest.useFakeTimers();
    render(<OrdersPage />);

    fireEvent.change(screen.getByRole('textbox', { name: 'Mock order search' }), {
      target: { value: '  Safari  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Mock view order' }));

    expect(screen.queryByRole('textbox', { name: 'Mock order search' })).not.toBeInTheDocument();
    await applySearchDebounce();
    expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=1&view=active&search=Safari');

    fireEvent.click(screen.getByRole('button', { name: 'Back to list' }));
    expect(screen.getByRole('textbox', { name: 'Mock order search' })).toHaveValue('  Safari  ');
  });

  it('replaces all list-only UI with the selected active order detail', async () => {
    jest.useFakeTimers();
    render(<OrdersPage />);

    chooseStatus('completed');
    fireEvent.change(screen.getByRole('textbox', { name: 'Mock order search' }), { target: { value: 'Safari' } });
    await applySearchDebounce();
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    await waitFor(() => expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=2&view=active&status=completed&search=Safari'));
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 480 });
    fireEvent.click(screen.getByRole('button', { name: 'Mock view order' }));

    expect(screen.getByText('Detail order 42')).toBeInTheDocument();
    expect(screen.getByText('Detail trashed false')).toBeInTheDocument();
    expect(screen.queryByText('Orders heading')).not.toBeInTheDocument();
    expect(screen.queryByText('Order stats')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Order views')).not.toBeInTheDocument();
    expect(screen.queryByTestId('table-view')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next page' })).not.toBeInTheDocument();
  });

  it('restores the active list query, filters, draft, page, and scroll position on Back', async () => {
    jest.useFakeTimers();
    const scrollTo = jest.fn();
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback();
      return 1;
    });
    window.scrollTo = scrollTo;
    render(<OrdersPage />);

    chooseStatus('completed');
    fireEvent.change(screen.getByRole('textbox', { name: 'Mock order search' }), { target: { value: 'Safari' } });
    await applySearchDebounce();
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    await waitFor(() => expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=2&view=active&status=completed&search=Safari'));
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 480 });
    fireEvent.click(screen.getByRole('button', { name: 'Mock view order' }));
    fireEvent.click(screen.getByRole('button', { name: 'Back to list' }));

    expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=2&view=active&status=completed&search=Safari');
    expect(screen.getByRole('button', { name: 'Filter orders by status: Completed' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('textbox', { name: 'Mock order search' })).toHaveValue('Safari');
    expect(screen.getByRole('textbox', { name: 'Page number' })).toHaveValue('2');
    expect(scrollTo).toHaveBeenCalledWith({ top: 480, behavior: 'auto' });
  });

  it('restores the Trash list query and scroll position on Back', async () => {
    jest.useFakeTimers();
    const scrollTo = jest.fn();
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback();
      return 1;
    });
    window.scrollTo = scrollTo;
    render(<OrdersPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Trash (2)' }));
    chooseStatus('completed');
    fireEvent.change(screen.getByRole('textbox', { name: 'Mock order search' }), { target: { value: 'Safari' } });
    await applySearchDebounce();
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    await waitFor(() => expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=2&view=trash&status=completed&search=Safari'));
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 275 });
    fireEvent.click(screen.getByRole('button', { name: 'Mock view order' }));
    expect(screen.getByText('Detail trashed true')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Back to list' }));

    expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=2&view=trash&status=completed&search=Safari');
    expect(screen.getByRole('button', { name: 'Trash (2)' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Filter orders by status: Completed' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('textbox', { name: 'Mock order search' })).toHaveValue('Safari');
    expect(screen.getByRole('textbox', { name: 'Page number' })).toHaveValue('2');
    expect(scrollTo).toHaveBeenCalledWith({ top: 275, behavior: 'auto' });
  });

  it('cancels a queued scroll restoration when the page unmounts', () => {
    let scheduledCallback;
    const frameId = 73;
    const cancelAnimationFrame = jest.fn();
    window.requestAnimationFrame = jest.fn((callback) => {
      scheduledCallback = callback;
      return frameId;
    });
    window.cancelAnimationFrame = cancelAnimationFrame;
    const { unmount } = render(<OrdersPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Mock view order' }));
    fireEvent.click(screen.getByRole('button', { name: 'Back to list' }));
    expect(scheduledCallback).toEqual(expect.any(Function));

    unmount();

    expect(cancelAnimationFrame).toHaveBeenCalledWith(frameId);
  });

  it('refreshes detail status changes without applying the list page fallback', async () => {
    render(<OrdersPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    await waitFor(() => expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=2&view=active'));
    fireEvent.click(screen.getByRole('button', { name: 'Mock view order' }));
    mutateOrders.mockResolvedValueOnce({ data: { ...backendResponse, data: [], current_page: 2 } });
    fireEvent.click(screen.getByRole('button', { name: 'Resolve cancellation terminally' }));

    await waitFor(() => expect(mutateOrders).toHaveBeenCalledTimes(1));
    expect(mutateOrders).toHaveBeenCalledWith();
    expect(useAllOrdersAdmin).toHaveBeenLastCalledWith('?page=2&view=active');
    fireEvent.click(screen.getByRole('button', { name: 'Back to list' }));
    expect(screen.getByRole('textbox', { name: 'Page number' })).toHaveValue('2');
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
    jest.useFakeTimers();
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
    await applySearchDebounce();
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

  it('clears unseen orders through the newest timestamp after the current response settles', () => {
    backendResponse.data = [
      { id: 1, created_at: '2026-08-10T08:00:00.000000Z' },
      { id: 2, created_at: '2026-08-11T10:05:00.000000Z' },
      { id: 3, created_at: 'invalid' },
    ];

    render(<OrdersPage />);

    expect(useMarkAdminNavigationSeen).toHaveBeenLastCalledWith('orders', {
      enabled: true,
      seenThrough: '2026-08-11T10:05:00.000Z',
    });
  });

  it('immediately clears terminal cancellation attention without changing unseen counts', async () => {
    nextNavigationState = { counts: { orders: 4, reviews: 2 }, attention: { cancellations: false } };
    render(<OrdersPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Mock view order' }));
    fireEvent.click(screen.getByRole('button', { name: 'Resolve cancellation terminally' }));

    await waitFor(() => expect(mutateOrders).toHaveBeenCalledTimes(1));
    expect(mockGlobalMutate).toHaveBeenCalledWith('/api/admin/navigation-unseen-counts');
    await expect(mockDetailRefreshPromise).resolves.toBeUndefined();
    expect(navigationState).toEqual({ counts: { orders: 4, reviews: 2 }, attention: { cancellations: false } });
  });

  it('keeps attention for a nonterminal retry result and surfaces a safe refresh warning without rolling back the decision', async () => {
    nextNavigationState = { counts: { orders: 4, reviews: 2 }, attention: { cancellations: true } };
    mutateOrders.mockRejectedValue(new Error('Orders refresh failed'));
    render(<OrdersPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Mock view order' }));
    fireEvent.click(screen.getByRole('button', { name: 'Retry cancellation nonterminally' }));

    await expect(mockDetailRefreshPromise).rejects.toThrow('Cancellation updated, but the latest data could not be refreshed.');
    expect(mutateOrders).toHaveBeenCalledTimes(1);
    expect(mockGlobalMutate).toHaveBeenCalledTimes(1);
    expect(navigationState).toEqual({ counts: { orders: 4, reviews: 2 }, attention: { cancellations: true } });
  });

  it('clears an empty settled orders response without a timestamp boundary', () => {
    render(<OrdersPage />);

    expect(useMarkAdminNavigationSeen).toHaveBeenLastCalledWith('orders', {
      enabled: true,
      seenThrough: undefined,
    });
  });

  it.each([
    ['loading', { isLoading: true, isValidating: false, error: null }],
    ['validating', { isLoading: false, isValidating: true, error: null }],
    ['failed', { isLoading: false, isValidating: false, error: new Error('Orders failed') }],
  ])('does not clear unseen orders while the response is %s', (_state, requestState) => {
    useAllOrdersAdmin.mockImplementation(() => ({
      orders: { data: backendResponse },
      mutate: mutateOrders,
      ...requestState,
    }));

    render(<OrdersPage />);

    expect(useMarkAdminNavigationSeen).toHaveBeenLastCalledWith('orders', {
      enabled: false,
      seenThrough: undefined,
    });
  });

  it('waits for a fresh response before advancing a stale cached boundary', () => {
    let hookState = {
      orders: { data: { ...backendResponse, data: [{ id: 1, created_at: '2026-08-10T08:00:00.000000Z' }] } },
      isLoading: false,
      isValidating: true,
      mutate: mutateOrders,
      error: null,
    };
    useAllOrdersAdmin.mockImplementation(() => hookState);

    const { rerender } = render(<OrdersPage />);

    expect(useMarkAdminNavigationSeen).toHaveBeenLastCalledWith('orders', {
      enabled: false,
      seenThrough: '2026-08-10T08:00:00.000Z',
    });

    hookState = {
      ...hookState,
      orders: { data: { ...backendResponse, data: [{ id: 2, created_at: '2026-08-12T09:30:00.456789Z' }] } },
      isValidating: false,
    };
    rerender(<OrdersPage />);

    expect(useMarkAdminNavigationSeen).toHaveBeenLastCalledWith('orders', {
      enabled: true,
      seenThrough: '2026-08-12T09:30:00.456Z',
    });
  });
});
