import { cache } from 'react';
import { publicApi, createAuthenticatedServerApi } from '../axiosInstance';
import { log } from '../utils';

/**
 * Get Single Itinerary on Client side
 * Cached per request to avoid duplicate calls in generateMetadata + page component
 * @param {String} slug
 * @returns []
 */
export const getSingleItinerary = cache(async (slug) => {
  try {
    const response = await publicApi.get(`/api/itineraries/${slug}`, {
      headers: { Accept: 'application/json' },
    });
    return response?.data;
  } catch (error) {
    return []; // Return null to trigger 404
  }
});

/**
 * Get Single Itinerary on Admin side
 * @param {Number} id
 * @returns []
 */
export const getSingleItineraryAdmin = async (id) => {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.get(`/api/admin/itineraries/${id}`, {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    return {};
  }
};

/**
 * Get All Itineraries Admin
 * @param {string} search
 * @returns {}
 */
export async function getAllItinerariesAdmin(search = '') {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.get(`/api/admin/itineraries/${search ? search : ''}`, {
      headers: { Accept: 'application/json' },
    });
    return response?.data;
  } catch (error) {
    return { success: false, data: [], message: 'Failed to fetch itineraries' };
  }
}

/**
 * Get Featured Itineraries (optionally filtered by city)
 * @param {string} [city] Optional city slug to filter by
 * @returns {Promise<{success:boolean,message?:string,data?:object}>}
 */
export async function getFeaturedItineraries(city) {
  try {
    const params = city ? `?city=${city}` : '';
    const response = await publicApi.get(`/api/itineraries/featured-itineraries${params}`, {
      headers: { Accept: 'application/json' },
    });

    if (response.status == 200) {
      return response?.data;
    }

    return { success: false, message: 'Not Found' };
  } catch (error) {
    if (error.response?.status !== 404) {
      console.error(`Unexpected error fetching featured itineraries`, error);
    }

    return { success: false, message: 'Something Went Wrong' };
  }
}
