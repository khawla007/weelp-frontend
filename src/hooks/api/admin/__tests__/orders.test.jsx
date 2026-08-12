import { renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import { SWRConfig } from 'swr';

import { useAdminOrder } from '../orders';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    isAxiosError: jest.fn(),
  },
}));

jest.mock('@/lib/fetchers', () => ({
  fetcher: jest.fn(),
}));

function createWrapper() {
  const cache = new Map();

  return function Wrapper({ children }) {
    return <SWRConfig value={{ provider: () => cache, dedupingInterval: 0 }}>{children}</SWRConfig>;
  };
}

describe('useAdminOrder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.isAxiosError.mockImplementation((error) => Boolean(error?.isAxiosError));
  });

  it('does not request data without an order ID', () => {
    const { result } = renderHook(() => useAdminOrder(null), { wrapper: createWrapper() });

    expect(result.current.order).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('returns the order and mutate function from a successful detail response', async () => {
    const order = { id: 42, status: 'pending' };
    axios.get.mockResolvedValue({ data: { success: true, data: order } });

    const { result } = renderHook(() => useAdminOrder(42), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.order).toEqual(order));
    expect(axios.get).toHaveBeenCalledWith('/api/admin/orders/42');
    expect(result.current.mutate).toEqual(expect.any(Function));
  });

  it.each([
    [404, 'Order not found.'],
    [500, 'We could not load this order.'],
  ])('exposes status %i from an Axios detail failure', async (status, message) => {
    axios.get.mockRejectedValue({ isAxiosError: true, response: { status, data: { message: 'must not leak' } } });

    const { result } = renderHook(() => useAdminOrder(42), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.error).toBeDefined());
    expect(result.current.error.message).toBe(message);
    expect(result.current.errorStatus).toBe(status);
    expect(result.current.order).toBeNull();
  });

  it('exposes a null status for an Axios network failure', async () => {
    axios.get.mockRejectedValue({ isAxiosError: true });

    const { result } = renderHook(() => useAdminOrder(42), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.error).toBeDefined());
    expect(result.current.error.message).toBe('We could not load this order.');
    expect(result.current.errorStatus).toBeNull();
    expect(result.current.order).toBeNull();
  });
});
