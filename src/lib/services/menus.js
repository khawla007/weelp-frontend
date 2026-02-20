import { publicApi, authApi } from '../axiosInstance';
import { ApiResponse } from '@/dto/Success';
import { log } from '../utils';

/**
 * Fetch Navigation Menu Items
 * Retrieves menu items for the Asia region in a consistent DTO format.
 *
 * @returns {Promise<{data: any, success: boolean, status: number}>}
 */
export async function getNavMenuItems() {
  try {
    const response = await publicApi.get('/api/menu/asia', {
      headers: {
        Accept: 'application/json',
      },
    });

    // Validate API response
    if (response?.data?.success && Array.isArray(response.data.data)) {
      return ApiResponse({
        data: response.data.data,
        success: true,
        status: 200,
      });
    }

    // Invalid or unexpected response structure
    return ApiResponse({
      data: [],
      success: false,
      status: response?.status || 500,
    });
  } catch (error) {
    console.error('Error fetching menu items:', error.message);

    return ApiResponse({
      data: [],
      success: false,
      status: error?.response?.status || 500,
    });
  }
}
