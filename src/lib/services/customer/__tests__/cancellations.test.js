import { createCancellationRequest, getCancellationQuote } from '../cancellations';
import { authApi } from '@/lib/axiosInstance';

jest.mock('@/lib/axiosInstance', () => ({
  authApi: { get: jest.fn(), post: jest.fn() },
}));

describe('customer cancellation services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads a cancellation quote from the customer booking endpoint', async () => {
    const quote = { currency: 'USD', suggested_refund: '75.00' };
    authApi.get.mockResolvedValue({ data: { quote } });

    await expect(getCancellationQuote(42)).resolves.toEqual(quote);
    expect(authApi.get).toHaveBeenCalledWith('/api/customer/userorders/42/cancellation-quote');
  });

  it('creates a cancellation request with the supplied reason', async () => {
    const cancellation = { id: 9, status: 'pending' };
    authApi.post.mockResolvedValue({ data: { cancellation } });

    await expect(createCancellationRequest(42, 'Our travel dates have changed.')).resolves.toEqual(cancellation);
    expect(authApi.post).toHaveBeenCalledWith('/api/customer/userorders/42/cancellation-requests', {
      reason: 'Our travel dates have changed.',
    });
  });

  it.each([409, 422])('preserves a safe backend message for HTTP %s', async (status) => {
    authApi.post.mockRejectedValue({ response: { status, data: { message: 'This booking is no longer eligible.' } } });

    const request = createCancellationRequest(42, 'Our travel dates have changed.');
    await expect(request).rejects.toMatchObject({ message: 'This booking is no longer eligible.', status });
  });

  it('uses safe fallback copy for unknown failures', async () => {
    authApi.get.mockRejectedValue(new Error('socket 10.0.0.2 failed'));

    await expect(getCancellationQuote(42)).rejects.toThrow('We could not load the cancellation estimate. Please try again.');
  });
});
