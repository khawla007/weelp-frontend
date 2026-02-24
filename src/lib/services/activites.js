import { publicApi, createAuthenticatedServerApi } from '../axiosInstance';
import { log } from '../utils';

/**
 * Get Single Activity on Client side
 * @param {String} activitySlug slug of the activity
 * @returns []
 */
export async function getSingleActivity(activitySlug) {
  try {
    const response = await publicApi.get(`/api/activities/${activitySlug}`, {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    return [];
  }
}

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
export async function getAllFeaturedActivities() {
  try {
    const response = await publicApi.get(`/api/activities/featured-activities`, {
      headers: { Accept: 'application/json' },
    });

    return response.data;
  } catch (error) {
    console.log('Error fetching city data:', error);
    return [];
  }
}

/**
 * Display All Activities by City
 * @param {string} city Slug of the City
 * @returns {Promise<{success:boolean,message?:string,data?:object}>}
 */
export async function getActivitisDataByCity(city) {
  try {
    const response = await publicApi.get(`/api/${city}/activities`, {
      headers: { Accept: 'application/json' },
    });

    if (response.status == 200) {
      return response?.data;
    }

    return { success: false, message: 'Not Found' };
  } catch (error) {
    // Only log unexpected errors, not 404s (which are expected for cities with no activities)
    if (error.response?.status !== 404) {
      console.error(`Unexpected error fetching Activities of City: ${city}`, error);
    }

    return { success: false, message: 'Something Went Wrong', error: error.message };
  }
}
