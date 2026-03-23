import { cache } from 'react';
import { publicApi, createAuthenticatedServerApi } from '../axiosInstance';
import { log } from '../utils';

/**
 * Get Single Activity on Client side
 * Cached per request to avoid duplicate calls in generateMetadata + page component
 * @param {String} activitySlug slug of the activity
 * @returns []
 */
export const getSingleActivity = cache(async (activitySlug) => {
  try {
    const response = await publicApi.get(`/api/activities/${activitySlug}`, {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    return [];
  }
});

/**
 * Get Single Activity on Admin side
 * @param {Number} id
 * @returns []
 */
export async function getSingleActivityAdmin(id) {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.get(`/api/admin/activities/${id}`, {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    return {};
  }
}

/**
 * Get All Activities Admin
 * @param ##
 * @returns {}
 */
export async function getAllActivitesAdmin(search = '') {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.get(`/api/admin/activities/${search ? search : ''}`, {
      headers: { Accept: 'application/json' },
    });
    return response?.data;
  } catch (error) {
    return [];
  }
}

/**
 * Returns all Featured Activities
 * @returns []
 */
export async function getAllFeaturedActivities(city) {
  try {
    const params = city ? `?city=${city}` : '';
    const response = await publicApi.get(`/api/activities/featured-activities${params}`, {
      headers: { Accept: 'application/json' },
    });

    return response.data;
  } catch (error) {
    console.log('Error fetching featured activities:', error);
    return [];
  }
}
