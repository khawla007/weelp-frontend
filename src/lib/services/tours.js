import { publicApi } from '../axiosInstance';

/**
 * Search tours with optional filters
 * @param {Object} params - Search parameters
 * @param {string} [params.from] - Origin city slug
 * @param {string} [params.to] - Destination city slug
 * @param {string} [params.start_date] - Tour start date (ISO format)
 * @param {string} [params.end_date] - Tour end date (ISO format)
 * @param {number} [params.quantity] - Number of participants
 * @returns {Promise<Array>} Array of tour results
 */
export async function toursSearch({ from, to, start_date, end_date, quantity } = {}) {
  try {
    // Build query string with only provided parameters
    const params = new URLSearchParams();
    if (from !== undefined) params.append('from', from);
    if (to !== undefined) params.append('to', to);
    if (start_date !== undefined) params.append('start_date', start_date);
    if (end_date !== undefined) params.append('end_date', end_date);
    if (quantity !== undefined) params.append('quantity', quantity);

    const queryString = params.toString();
    const url = `/api/toursearch${queryString ? `?${queryString}` : ''}`;

    const response = await publicApi.get(url, {
      headers: { Accept: 'application/json' },
    });

    if (response.status === 200) {
      // Unwrap the response: backend returns {success: true, data: [...]}
      return response.data?.data || [];
    }

    return [];
  } catch (error) {
    console.error('Error fetching tours search:', error.message);
    return [];
  }
}

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
