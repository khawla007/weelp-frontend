import { revalidatePath } from 'next/cache';

import { createReviewByCustomer, editReviewByCustomer } from '../reviews';
import { getAuthApi } from '@/lib/axiosInstance';

const post = jest.fn();

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

jest.mock('@/lib/axiosInstance', () => ({
  getAuthApi: jest.fn(),
}));

jest.mock('@/lib/utils', () => ({
  delay: jest.fn(),
  log: jest.fn(),
}));

const reviewData = {
  item_type: 'activity',
  item_id: 7,
  order_id: 42,
  rating: 4,
  review_text: 'Great trip',
  existing_media_ids: [11, 12],
  file: [new File(['photo'], 'photo.jpg', { type: 'image/jpeg' })],
};

function expectSerializedReview(formData) {
  expect(formData).toBeInstanceOf(FormData);
  expect(formData.get('item_type')).toBe('activity');
  expect(formData.get('item_id')).toBe('7');
  expect(formData.get('order_id')).toBe('42');
  expect(formData.get('rating')).toBe('4');
  expect(formData.get('review_text')).toBe('Great trip');
  expect(formData.getAll('existing_media_ids[]')).toEqual(['11', '12']);
  expect(formData.getAll('file[]')).toHaveLength(1);
}

describe('customer review actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getAuthApi.mockResolvedValue({ post });
    post.mockResolvedValue({ data: { message: 'Saved' } });
  });

  it('serializes the complete create review payload as FormData', async () => {
    await expect(createReviewByCustomer(reviewData)).resolves.toEqual({ success: true, message: 'Saved' });

    expect(post).toHaveBeenCalledWith('/api/customer/review', expect.any(FormData), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    expectSerializedReview(post.mock.calls[0][1]);
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/customer');
  });

  it('serializes the complete edit review payload as FormData', async () => {
    await expect(editReviewByCustomer(reviewData, 9)).resolves.toEqual({ success: true, message: 'Saved' });

    expect(post).toHaveBeenCalledWith('/api/customer/review/9', expect.any(FormData), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    expectSerializedReview(post.mock.calls[0][1]);
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/customer/reviews/9');
  });

  it.each([
    ['create', () => createReviewByCustomer(reviewData)],
    ['edit', () => editReviewByCustomer(reviewData, 9)],
  ])('preserves 422 field errors from %s responses', async (_action, runAction) => {
    post.mockRejectedValue({
      response: {
        status: 422,
        data: {
          message: 'Cannot save review',
          errors: { review_text: ['Review text is too short'] },
        },
      },
    });

    await expect(runAction()).resolves.toEqual(
      expect.objectContaining({
        success: false,
        message: 'Cannot save review',
        errors: { review_text: ['Review text is too short'] },
      }),
    );
  });
});
