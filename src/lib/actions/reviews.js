// @ts-check
'use server';

import { revalidatePath } from 'next/cache';
import { authApi } from '../axiosInstance';
import { delay, log } from '../utils';

/**
 * Create a new review.
 *
 * @param {ReviewFormValues} data - Review form data
 * @returns {Promise<{ success: boolean, message: string, errors?: any }>}
 */
export const createReview = async (data) => {
  try {
    // Optional: simulate network delay
    await delay(500);

    const res = await authApi.post('/api/admin/reviews', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Revalidate Next.js cache for reviews page
    revalidatePath('/dashboard/admin/reviews');

    return {
      success: true,
      message: res.data?.message || 'Review created successfully',
    };
  } catch (err) {
    const status = err?.response?.status;

    // Validation errors
    if (status === 400) {
      return {
        success: false,
        message: 'Validation error',
        errors: err?.response?.data?.errors,
      };
    }

    // Conflict errors (e.g., duplicate review)
    if (status === 409) {
      return {
        success: false,
        message: err?.response?.data?.error || 'Review already exists',
      };
    }

    // Unprocessable entity
    if (status === 422) {
      return {
        success: false,
        message: err?.response?.data?.message || 'Cannot process review',
      };
    }

    // Fallback
    return {
      success: false,
      message: 'Something went wrong while creating the review',
    };
  }
};

/**
 * Action for Update Review review.
 * @param {number|string} id - Id of the Review
 * @param {ReviewFormValues} data - Review form data
 * @returns {Promise<{ success: boolean, message: string, errors?: any }>}
 */
export const updateReview = async (id, data) => {
  try {
    // Optional: simulate network delay
    await delay(500);

    const res = await authApi.put(`/api/admin/reviews/${id}`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Revalidate Next.js cache for reviews page
    revalidatePath(`/dashboard/admin/reviews/${id}`);

    return {
      success: true,
      message: res.data?.message || 'Review update successfully',
    };
  } catch (err) {
    const status = err?.response?.status;

    // Validation errors
    if (status === 400) {
      return {
        success: false,
        message: 'Validation error',
        errors: err?.response?.data?.errors,
      };
    }

    // Conflict errors (e.g., duplicate review)
    if (status === 409) {
      return {
        success: false,
        message: err?.response?.data?.error || 'Review already exists',
      };
    }

    // Unprocessable entity
    if (status === 422) {
      return {
        success: false,
        message: err?.response?.data?.message || 'Cannot process review',
      };
    }

    // Fallback
    return {
      success: false,
      message: 'Something went wrong while creating the review',
    };
  }
};

/**
 * Deletes a review by ID.
 *
 * @param {number} reviewId - The ID of the review to delete.
 * @returns {Promise<{ success: boolean, message?: string, error?: string }>} Result of the delete operation.
 */
export async function deleteReview(reviewId) {
  try {
    const res = await authApi.delete(`/api/admin/reviews/${reviewId}/`);

    // revalidate reviews page
    revalidatePath('/dashboard/admin/reviews');

    // Return success
    return {
      success: true,
      message: res?.data?.message || 'Deleted successfully',
    };
  } catch (error) {
    return { success: false, error: error?.message || 'Something went wrong' };
  }
}
