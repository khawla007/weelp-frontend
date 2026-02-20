import { ApiError } from '@/dto/Error';
import { authApi } from '@/lib/axiosInstance';
import { ApiResponse } from '@/dto/Success';

/**
 * Get Single Review by Customer
 * @param {string} [reviewId] - Review Id
 * @returns {Promise<{success: boolean, data?: any, message?: string, status?: number}>}
 */
export async function getSingleReviewByCustomer(reviewId) {
  try {
    const response = await authApi.get(`/api/customer/review/${reviewId}`, {
      headers: { Accept: 'application/json' },
    });

    // status 200 → return consistent success response
    if (response.status === 200) {
      return ApiResponse({
        data: response.data,
        status: 200,
        success: true,
      });
    }

    return ApiError({
      message: response.data?.message || 'Unexpected error occurred',
      status: response.status,
      errors: response.data?.errors,
    });
  } catch (error) {
    return ApiError({
      message: error.response?.data?.message || 'Failed to fetch reviews',
      status: error.response?.status || 500,
      errors: error.response?.data?.errors || error.message,
    });
  }
}

/**
 * Get All Reviews by Customer
 * @param {string} [search] - Optional search query
 * @returns {Promise<{success: boolean, data?: any, message?: string, status?: number}>}
 */
export async function getAllReviewsByCustomer(search = '') {
  try {
    const response = await authApi.get(`/api/customer/review/${search || ''}`, {
      headers: { Accept: 'application/json' },
    });

    // status 200 → return consistent success response
    if (response.status === 200) {
      return ApiResponse({
        data: response.data,
        status: 200,
      });
    }

    return ApiError({
      message: response.data?.message || 'Unexpected error occurred',
      status: response.status,
      errors: response.data?.errors,
    });
  } catch (error) {
    return ApiError({
      message: error.response?.data?.message || 'Failed to fetch reviews',
      status: error.response?.status || 500,
      errors: error.response?.data?.errors || error.message,
    });
  }
}
