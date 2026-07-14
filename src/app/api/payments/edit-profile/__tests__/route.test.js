import { POST } from '../route';
import { editUserProfileAction } from '@/lib/actions/userActions';

jest.mock('next/server', () => ({
  NextResponse: {
    json: (body, options = {}) => ({ status: options.status ?? 200, json: async () => body }),
  },
}));

jest.mock('@/lib/actions/userActions', () => ({
  editUserProfileAction: jest.fn(),
}));

describe('POST /api/payments/edit-profile', () => {
  it('returns a safe failure when the profile action fails', async () => {
    editUserProfileAction.mockResolvedValue({ success: false, status: 401, message: 'Your session has expired. Please sign in again.' });

    const response = await POST({ json: async () => ({ phone: 'redacted' }) });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ success: false, error: 'Your session has expired. Please sign in again.' });
  });

  it('returns only successful profile data when the action succeeds', async () => {
    editUserProfileAction.mockResolvedValue({ success: true, data: { updated: true } });

    const response = await POST({ json: async () => ({ phone: 'redacted' }) });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true, data: { updated: true } });
  });
});
