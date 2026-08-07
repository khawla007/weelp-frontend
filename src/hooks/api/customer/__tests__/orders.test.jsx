import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';

import { CUSTOMER_ORDERS_PER_PAGE, useAllOrdersCustomer, useCustomerOrder } from '../orders';
import { authApi } from '@/lib/axiosInstance';

jest.mock('@/lib/axiosInstance', () => ({
  authApi: { get: jest.fn() },
}));

const wrapper = ({ children }) => <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>{children}</SWRConfig>;

describe('useCustomerOrder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('surfaces a 404 detail response as an error without retrying', async () => {
    const notFound = Object.assign(new Error('Not found'), { response: { status: 404 } });
    authApi.get.mockRejectedValue(notFound);

    const { result } = renderHook(() => useCustomerOrder(42), { wrapper });

    await waitFor(() => expect(result.current.error).toBe(notFound));
    expect(result.current.order).toBeNull();
    expect(authApi.get).toHaveBeenCalledTimes(1);
    expect(authApi.get).toHaveBeenCalledWith('/api/customer/userorders/42');
  });

  it('returns the order from a successful detail response', async () => {
    const order = { id: 42, item: { name: 'Forest escape' } };
    authApi.get.mockResolvedValue({ data: { success: true, order } });

    const { result } = renderHook(() => useCustomerOrder(42), { wrapper });

    await waitFor(() => expect(result.current.order).toEqual(order));
    expect(result.current.error).toBeUndefined();
  });

  it('does not request data without an order ID', () => {
    const { result } = renderHook(() => useCustomerOrder(null), { wrapper });

    expect(result.current.order).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(authApi.get).not.toHaveBeenCalled();
  });

  it('does not expose stale data while switching order IDs', async () => {
    let resolveSecondOrder;
    const secondOrderResponse = new Promise((resolve) => {
      resolveSecondOrder = resolve;
    });
    authApi.get.mockImplementation((url) => {
      if (url.endsWith('/42')) return Promise.resolve({ data: { success: true, order: { id: 42 } } });
      return secondOrderResponse;
    });

    const { result, rerender } = renderHook(({ orderId }) => useCustomerOrder(orderId), {
      initialProps: { orderId: 42 },
      wrapper,
    });
    await waitFor(() => expect(result.current.order).toEqual({ id: 42 }));

    rerender({ orderId: 43 });

    expect(result.current.order).toBeNull();
    expect(result.current.isLoading).toBe(true);

    resolveSecondOrder({ data: { success: true, order: { id: 43 } } });
    await waitFor(() => expect(result.current.order).toEqual({ id: 43 }));
  });
});

describe('useAllOrdersCustomer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('surfaces 401 responses instead of presenting an empty list', async () => {
    const unauthorized = Object.assign(new Error('Unauthorized'), { response: { status: 401 } });
    authApi.get.mockRejectedValue(unauthorized);

    const { result } = renderHook(() => useAllOrdersCustomer(1), { wrapper });

    await waitFor(() => expect(result.current.error).toBe(unauthorized));
    expect(result.current.orders).toBeNull();
    expect(authApi.get).toHaveBeenCalledTimes(1);
  });

  it('normalizes the documented 404 list response to an empty page', async () => {
    const notFound = Object.assign(new Error('Not found'), { response: { status: 404 } });
    authApi.get.mockRejectedValue(notFound);

    const { result } = renderHook(() => useAllOrdersCustomer(2), { wrapper });

    await waitFor(() => expect(result.current.orders.orders).toEqual([]));
    expect(result.current.error).toBeUndefined();
    expect(result.current.orders.pagination.per_page).toBe(CUSTOMER_ORDERS_PER_PAGE);
    expect(authApi.get).toHaveBeenCalledTimes(1);
    expect(authApi.get).toHaveBeenCalledWith(`/api/customer/userorders?page=2&per_page=${CUSTOMER_ORDERS_PER_PAGE}`);
  });
});
