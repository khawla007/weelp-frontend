import { revalidatePath } from 'next/cache';

import { getAuthApi } from '@/lib/axiosInstance';

import { deleteOrder, permanentlyDeleteOrder, restoreOrder } from '../orders';

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));
jest.mock('@/lib/axiosInstance', () => ({ getAuthApi: jest.fn() }));

describe('order trash actions', () => {
  const api = {
    delete: jest.fn(),
    post: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getAuthApi.mockResolvedValue(api);
  });

  it('exports every mutation as an async Server Action', () => {
    expect(deleteOrder.constructor.name).toBe('AsyncFunction');
    expect(restoreOrder.constructor.name).toBe('AsyncFunction');
    expect(permanentlyDeleteOrder.constructor.name).toBe('AsyncFunction');
  });

  it.each([
    ['moves an order to Trash', deleteOrder, 'delete', '/api/admin/orders/12'],
    ['restores an order', restoreOrder, 'post', '/api/admin/orders/12/restore'],
    ['permanently deletes an order', permanentlyDeleteOrder, 'delete', '/api/admin/orders/12/force'],
  ])('%s and revalidates the orders page', async (_label, action, method, endpoint) => {
    api[method].mockResolvedValue({ data: { success: true, message: 'Done.' } });

    await expect(action(12)).resolves.toEqual({ success: true, message: 'Done.' });

    expect(api[method]).toHaveBeenCalledWith(endpoint);
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/admin/orders');
  });

  it.each([
    ['move to Trash', deleteOrder],
    ['restore', restoreOrder],
    ['permanent delete', permanentlyDeleteOrder],
  ])('preserves the backend error message when %s fails', async (_label, action) => {
    const error = new Error('Request failed');
    error.response = { data: { message: 'Order not found.' } };
    api.delete.mockRejectedValue(error);
    api.post.mockRejectedValue(error);

    await expect(action(12)).resolves.toEqual({ success: false, message: 'Order not found.' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
