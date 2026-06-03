import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const postMock = jest.fn().mockResolvedValue({ data: { success: true } });
// MANDATORY relative path — the @/ alias does NOT resolve inside jest.mock (next/jest).
// 7 ../ from .../admin/announcements/__tests__/ to src/lib/axiosInstance.
jest.mock('../../../../../../../lib/axiosInstance', () => ({ authApi: { get: jest.fn().mockResolvedValue({ data: { data: [] } }), post: (...a) => postMock(...a), put: jest.fn(), delete: jest.fn() } }));
jest.mock('swr', () => ({ __esModule: true, default: () => ({ data: [], mutate: jest.fn(), isLoading: false }) }));

import AnnouncementsAdmin from '../AnnouncementsAdmin';

describe('AnnouncementsAdmin popup fields', () => {
  beforeEach(() => postMock.mockClear());

  test('creates a popup announcement with image + coupon', async () => {
    render(<AnnouncementsAdmin />);
    fireEvent.change(screen.getByLabelText(/^title/i), { target: { value: 'Coupon' } });
    fireEvent.change(screen.getByLabelText(/^message/i), { target: { value: 'Save big' } });
    fireEvent.change(screen.getByLabelText(/display style/i), { target: { value: 'popup' } });
    fireEvent.change(screen.getByLabelText(/image url/i), { target: { value: 'https://cdn/a.jpg' } });
    fireEvent.change(screen.getByLabelText(/coupon code/i), { target: { value: 'SAVE10' } });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));
    await waitFor(() => expect(postMock).toHaveBeenCalled());
    const [, payload] = postMock.mock.calls[0];
    expect(payload).toMatchObject({ title: 'Coupon', display_style: 'popup', image_url: 'https://cdn/a.jpg', coupon_code: 'SAVE10' });
  });
});
