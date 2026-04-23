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
 * Get All Activities Admin (client-side, authenticated)
 * For use in client components that need to fetch activities list
 * @param {string} search - Optional query string
 * @returns {Promise<Object>}
 */
export async function getAllActivitiesListClient(search = '') {
  try {
    const { getAuthApi } = await import('../axiosInstance');
    const api = await getAuthApi();
    const response = await api.get(`/api/admin/activities/${search ? search : ''}`, {
      headers: { Accept: 'application/json' },
    });
    return response?.data;
  } catch (error) {
    return [];
  }
}

/**
 * Get All Activities List from Public API (for creators/guests)
 * Uses the public endpoint which doesn't require admin authentication
 * @returns {Promise<{ data: Array }>}
 */
export async function getAllActivitiesListPublic() {
  try {
    const response = await publicApi.get(`/api/activities`, {
      headers: { Accept: 'application/json' },
    });
    return response?.data;
  } catch (error) {
    console.error('Service Error (getAllActivitiesListPublic):', error);
    return { success: false, data: [] };
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

/**
 * Returns 2 random similar activities from the same city, excluding the current activity
 * @param {string} city - City slug
 * @param {number|string} excludeId - Activity ID to exclude (current activity)
 * @returns {Array} - Array of 2 random activities
 */
export async function getRandomSimilarActivities(city, excludeId) {
  try {
    const params = city ? `?city=${city}` : '';
    const response = await publicApi.get(`/api/activities/featured-activities${params}`, {
      headers: { Accept: 'application/json' },
    });

    let activities = Array.isArray(response.data) ? response.data : (response.data?.data ?? []);

    // Exclude the current activity
    activities = activities.filter((activity) => activity.id != excludeId);

    // Shuffle and take 2 random activities
    const shuffled = activities.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 2);
  } catch (error) {
    console.log('Error fetching similar activities:', error);
    return [];
  }
}

// Throws on error (vs. the pattern of swallowing above) so SWR can surface validation/pricing errors in the quote UI.
export async function getActivityQuote(slug, { adults, children = 0, startDate = null } = {}) {
  const params = new URLSearchParams();
  if (Number.isFinite(adults)) params.append('adults', adults);
  if (Number.isFinite(children)) params.append('children', children);
  if (startDate) params.append('start_date', startDate);

  try {
    const response = await publicApi.get(`/api/activities/${slug}/quote?${params.toString()}`, {
      headers: { Accept: 'application/json' },
    });
    return response?.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Activity not found');
    }
    if (error.response?.status === 422) {
      throw new Error(error.response?.data?.message || 'Invalid quote parameters');
    }
    throw error;
  }
}
