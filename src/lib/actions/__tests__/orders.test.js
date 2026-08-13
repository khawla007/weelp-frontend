import { revalidatePath } from 'next/cache';

import { getAuthApi } from '@/lib/axiosInstance';

import { approveCancellationRequest, deleteOrder, permanentlyDeleteOrder, rejectCancellationRequest, restoreOrder, retryCancellationRequest } from '../orders';

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

describe('admin cancellation actions', () => {
  const api = { post: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    getAuthApi.mockResolvedValue(api);
  });

  it('rejects a cancellation with the exact customer-facing explanation', async () => {
    const cancellation = { id: 9, status: 'rejected' };
    api.post.mockResolvedValue({ data: { cancellation } });

    await expect(rejectCancellationRequest(9, 'The booking is outside the refundable window.')).resolves.toEqual({
      success: true,
      message: 'Cancellation request declined.',
      cancellation,
    });
    expect(api.post).toHaveBeenCalledWith('/api/admin/cancellation-requests/9/reject', {
      explanation: 'The booking is outside the refundable window.',
    });
  });

  it('approves a cancellation using normalized decimal strings', async () => {
    const cancellation = { id: 9, status: 'approved' };
    api.post.mockResolvedValue({ data: { cancellation } });

    await expect(approveCancellationRequest(9, ' 75.00 ', 'Adjusted after supplier review.')).resolves.toEqual({
      success: true,
      message: 'Cancellation request approved.',
      cancellation,
    });
    expect(api.post).toHaveBeenCalledWith('/api/admin/cancellation-requests/9/approve', {
      final_refund: '75.00',
      explanation: 'Adjusted after supplier review.',
    });
  });

  it('retries without allowing the approved amount to be edited', async () => {
    const cancellation = { id: 9, status: 'approved' };
    api.post.mockResolvedValue({ data: { cancellation } });

    await expect(retryCancellationRequest(9)).resolves.toEqual({
      success: true,
      message: 'Cancellation refund retried.',
      cancellation,
    });
    expect(api.post).toHaveBeenCalledWith('/api/admin/cancellation-requests/9/retry');
  });

  it.each([
    ['reject', rejectCancellationRequest, ['Explanation long enough.']],
    ['approve', approveCancellationRequest, ['75.00', '']],
    ['retry', retryCancellationRequest, []],
  ])('preserves safe backend messages when %s fails', async (_label, action, args) => {
    const error = new Error('Raw axios message');
    error.response = { data: { message: 'This request changed. Refresh and try again.' } };
    api.post.mockRejectedValue(error);

    await expect(action(9, ...args)).resolves.toEqual({ success: false, message: 'This request changed. Refresh and try again.' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('uses safe fallback copy instead of exposing an unknown transport error', async () => {
    api.post.mockRejectedValue(new Error('connect ECONNREFUSED 127.0.0.1'));

    await expect(retryCancellationRequest(9)).resolves.toEqual({ success: false, message: 'Order action failed.' });
  });
});
