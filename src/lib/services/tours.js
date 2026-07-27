import { publicApi } from '../axiosInstance';

/**
 * Get featured cities with starting prices
 * @returns {Promise<Array>} Array of featured city objects with starting_price and currency fields
 */
export async function getFeaturedCitiesWithStartingPrice() {
  try {
    const response = await publicApi.get(`/api/featured-cities/with-starting-price`, {
      headers: { Accept: 'application/json' },
    });

    // Unwrap the response: backend returns {success: true, data: [...]}
    return response.data?.data || [];
  } catch (error) {
    console.error('Error fetching featured cities with starting price:', error.message);
    return [];
  }
}
