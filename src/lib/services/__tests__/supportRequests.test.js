import { getSession } from 'next-auth/react';
import { publicApi } from '@/lib/axiosInstance';

import { submitSupportRequest } from '../supportRequests';

jest.mock('next-auth/react', () => ({
  getSession: jest.fn(),
}));

jest.mock('@/lib/axiosInstance', () => ({
  publicApi: {
    post: jest.fn(),
  },
}));

const payload = Object.freeze({
  client_request_id: '550e8400-e29b-41d4-a716-446655440000',
  item_type: 'activity',
  item_id: 161,
  item_title: 'Dubai Desert Safari With BBQ',
  item_slug: 'dubai-desert-safari-with-bbq',
  city_slug: 'dubai',
  page_url: 'http://localhost:3000/cities/dubai/activities/dubai-desert-safari-with-bbq',
  topic: 'before_booking',
  name: 'Test Guest',
  email: 'guest@example.com',
  message: 'Is this experience suitable for children?',
  website: '',
});

const apiError = (status, data) => ({
  response: {
    status,
    data,
  },
});

describe('submitSupportRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getSession.mockResolvedValue(null);
  });

  it('posts with an authenticated header and returns response data', async () => {
    const result = { success: true, data: { reference: 'WLP-123456' } };
    getSession.mockResolvedValue({ access_token: 'valid-token' });
    publicApi.post.mockResolvedValue({ data: result });

    await expect(submitSupportRequest(payload)).resolves.toEqual(result);
    expect(publicApi.post).toHaveBeenCalledWith('/api/support-requests', payload, {
      headers: { Authorization: 'Bearer valid-token' },
    });
    expect(publicApi.post.mock.calls[0][1]).toStrictEqual({
      name: 'Test Guest',
      email: 'guest@example.com',
      topic: 'before_booking',
      message: 'Is this experience suitable for children?',
      item_type: 'activity',
      item_id: 161,
      item_title: 'Dubai Desert Safari With BBQ',
      city_slug: 'dubai',
      item_slug: 'dubai-desert-safari-with-bbq',
      page_url: 'http://localhost:3000/cities/dubai/activities/dubai-desert-safari-with-bbq',
      client_request_id: '550e8400-e29b-41d4-a716-446655440000',
      website: '',
    });
  });

  it('uses a valid UUID and absolute page URL in its canonical backend fixture', () => {
    expect(payload.client_request_id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(new URL(payload.page_url).toString()).toBe(payload.page_url);
    expect(payload).not.toHaveProperty('page_path');
  });

  it.each([
    [
      422,
      {
        message: 'Please check the highlighted fields.',
        errors: { email: ['The email field must be a valid email address.'] },
      },
    ],
    [429, { message: 'Too many support requests. Please wait and try again.', errors: {} }],
  ])('normalizes a %i API failure without erasing server errors', async (status, data) => {
    publicApi.post.mockRejectedValue(apiError(status, data));

    await expect(submitSupportRequest(payload)).resolves.toEqual({
      success: false,
      status,
      message: data.message,
      errors: data.errors,
    });
  });

  it('normalizes a network failure with the safe fallback message', async () => {
    publicApi.post.mockRejectedValue(new Error('Network Error'));

    await expect(submitSupportRequest(payload)).resolves.toEqual({
      success: false,
      status: 0,
      message: 'We could not send your request. Please try again.',
      errors: {},
    });
  });

  it.each([
    [{ message: { text: 'Object message' }, errors: ['not', 'a', 'field bag'] }, {}],
    [{ message: ['Array message'], errors: 'not a field bag' }, {}],
    [{ message: '   ', errors: null }, {}],
    [
      {
        message: '',
        errors: {
          email: ['Keep this valid message.'],
          message: ['Keep valid.', 17, null],
          topic: { message: 'Drop this field.' },
          empty: [],
        },
      },
      {
        email: ['Keep this valid message.'],
        message: ['Keep valid.'],
      },
    ],
  ])('keeps malformed initial failure data safe to render', async (data, expectedErrors) => {
    publicApi.post.mockRejectedValue(apiError(422, data));

    await expect(submitSupportRequest(payload)).resolves.toEqual({
      success: false,
      status: 422,
      message: 'We could not send your request. Please try again.',
      errors: expectedErrors,
    });
  });

  it('retries token_revoked exactly once as a guest with the same payload', async () => {
    const guestResult = { success: true, data: { reference: 'WLP-654321' } };
    getSession.mockResolvedValue({ access_token: 'stale-token' });
    publicApi.post.mockRejectedValueOnce(apiError(401, { error: 'token_revoked' })).mockResolvedValueOnce({ data: guestResult });

    await expect(submitSupportRequest(payload)).resolves.toEqual(guestResult);
    expect(publicApi.post).toHaveBeenCalledTimes(2);
    expect(publicApi.post).toHaveBeenNthCalledWith(1, '/api/support-requests', payload, {
      headers: { Authorization: 'Bearer stale-token' },
    });
    expect(publicApi.post).toHaveBeenNthCalledWith(2, '/api/support-requests', payload);
    expect(publicApi.post.mock.calls[0][1]).toBe(payload);
    expect(publicApi.post.mock.calls[1][1]).toBe(payload);
    expect(publicApi.post.mock.calls[0][1]).toStrictEqual(payload);
    expect(publicApi.post.mock.calls[1][1]).toStrictEqual(payload);
    expect(payload.client_request_id).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it('normalizes a failed guest retry', async () => {
    getSession.mockResolvedValue({ access_token: 'stale-token' });
    publicApi.post.mockRejectedValueOnce(apiError(401, { error: 'token_revoked' })).mockRejectedValueOnce(apiError(429, { message: 'Please wait.', errors: { email: ['Try later.'] } }));

    await expect(submitSupportRequest(payload)).resolves.toEqual({
      success: false,
      status: 429,
      message: 'Please wait.',
      errors: { email: ['Try later.'] },
    });
    expect(publicApi.post).toHaveBeenCalledTimes(2);
  });

  it('keeps a malformed revoked-token guest retry failure safe to render', async () => {
    getSession.mockResolvedValue({ access_token: 'stale-token' });
    publicApi.post
      .mockRejectedValueOnce(apiError(401, { error: 'token_revoked' }))
      .mockRejectedValueOnce(apiError(422, { message: ['Not renderable'], errors: { email: 'Not an array', name: ['Name is required.'], topic: [null, {}] } }));

    await expect(submitSupportRequest(payload)).resolves.toEqual({
      success: false,
      status: 422,
      message: 'We could not send your request. Please try again.',
      errors: { name: ['Name is required.'] },
    });
    expect(publicApi.post).toHaveBeenCalledTimes(2);
    expect(publicApi.post.mock.calls[1][1]).toBe(payload);
  });

  it('does not retry another 401 response', async () => {
    getSession.mockResolvedValue({ access_token: 'expired-token' });
    publicApi.post.mockRejectedValue(apiError(401, { error: 'unauthenticated', message: 'Unauthenticated.' }));

    await expect(submitSupportRequest(payload)).resolves.toEqual({
      success: false,
      status: 401,
      message: 'Unauthenticated.',
      errors: {},
    });
    expect(publicApi.post).toHaveBeenCalledTimes(1);
  });

  it('degrades a session lookup rejection to one guest request with the original payload', async () => {
    const guestResult = { success: true, data: { reference: 'WLP-999999' } };
    getSession.mockRejectedValue(new Error('Session lookup failed'));
    publicApi.post.mockResolvedValue({ data: guestResult });

    await expect(submitSupportRequest(payload)).resolves.toEqual(guestResult);
    expect(publicApi.post).toHaveBeenCalledTimes(1);
    expect(publicApi.post).toHaveBeenCalledWith('/api/support-requests', payload, { headers: {} });
    expect(publicApi.post.mock.calls[0][1]).toBe(payload);
    expect(publicApi.post.mock.calls[0][1]).toStrictEqual(payload);
    expect(payload.client_request_id).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it('does not attach a token when the session carries an error', async () => {
    getSession.mockResolvedValue({ access_token: 'stale-token', error: 'RefreshAccessTokenError' });
    publicApi.post.mockResolvedValue({ data: { success: true } });

    await submitSupportRequest(payload);

    expect(publicApi.post).toHaveBeenCalledWith('/api/support-requests', payload, { headers: {} });
  });
});
