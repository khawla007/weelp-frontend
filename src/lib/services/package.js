import { cache } from 'react';
import { createAuthenticatedServerApi, publicApi } from '../axiosInstance';
import { log } from '../utils';

/**
 * Get Featured Packages on Public side
 * @returns {Promise<{success:boolean, data?:Array}>}
 */
export async function getFeaturedPackages() {
  try {
    const response = await publicApi.get('/api/packages/featured-packages', {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    return { success: false, data: [] };
  }
}

/**
 * Get Single Package on Public side
 * Cached per request to avoid duplicate calls in generateMetadata + page component
 * @param {Number} id
 * @returns []
 */
export const getSinglePackage = cache(async (packagee) => {
  try {
    const response = await publicApi.get(`/api/packages/${packagee}`, {
      headers: { Accept: 'application/json' },
    });

    return response.data;
  } catch (error) {
    return []; // Return null instead of an empty array for clarity
  }
});

/**
 * Get Single Package on Admin side
 * @param {Number} id
 * @returns []
 */
export const getSinglePackageAdmin = async (id) => {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.get(`/api/admin/packages/${id}`, {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    return {};
  }
};

/**
 * Get All Packages Admin
 * @param {string} search
 * @returns {}
 */
export async function getAllPackagesAdmin(search = '') {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.get(`/api/admin/packages/${search ? search : ''}`, {
      headers: { Accept: 'application/json' },
    });
    return response?.data;
  } catch (error) {
    return { success: false, data: [], message: 'Failed to fetch Packages' };
  }
}

/**
 * Get Citites BY Region Public Api
 * @param {string} region region required
 * @returns
 */
export const getPackageDataByRegion = async (region) => {
  try {
    const response = await publicApi.get(`/api/region/${region}/region-packages`, {
      headers: { Accept: 'application/json' },
    });

    if (response.status === 200) {
      return response?.data;
    }
    return {}; // Return empty object if not 200
  } catch (error) {
    return {}; // Return empty object on error
  }
};

/**
 * Fetch city packages (client-side) with pagination, tag filter, and sorting
 * @param {string} city City slug
 * @param {object} params Query parameters { tags, sort_by, page, per_page }
 * @returns {Promise<{success:boolean, data:Array, all_tags:Array, current_page:number, last_page:number, total:number}>}
 */
export async function fetchCityPackages(city, params = {}) {
  const { default: axios } = await import('axios');
  try {
    const query = new URLSearchParams();
    if (city) query.set('city', city);
    if (params.tags) query.set('tags', params.tags);
    if (params.sort_by) query.set('sort_by', params.sort_by);
    if (params.page) query.set('page', params.page);
    if (params.per_page) query.set('per_page', params.per_page);
    const qs = query.toString();
    const response = await axios.get(`${process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL}api/packages/featured-packages${qs ? `?${qs}` : ''}`);
    return response.data;
  } catch {
    return { success: false, data: [], all_tags: [], current_page: 1, last_page: 1, total: 0 };
  }
}

/**
 * Display All Packages by City
 * @param {string} city Slug of the City
 * @returns {Promise<{success:boolean,message?:string,data?:object}>} Returns all Packages
 */
export async function getPackageDataByCity(city) {
  try {
    const params = city ? `?city=${city}` : '';
    const response = await publicApi.get(`/api/packages/featured-packages${params}`, {
      headers: { Accept: 'application/json' },
    });
    if (response.status == 200) {
      return response?.data;
    }

    return { success: false, message: 'Not Found' };
  } catch (error) {
    if (error.response?.status !== 404) {
      console.error(`Unexpected error fetching packages`, error);
    }

    return { success: false, message: 'Something Went Wrong' };
  }
}

/**
 * Returns 2 random similar packages from the same city, excluding the current package
 * @param {string} city - City slug (from package locations[0].city)
 * @param {number|string} excludeId - Package ID to exclude (current package)
 * @returns {Array} - Array of 2 random packages
 */
export async function getRandomSimilarPackages(city, excludeId) {
  try {
    const params = city ? `?city=${city}` : '';
    const response = await publicApi.get(`/api/packages/featured-packages${params}`, {
      headers: { Accept: 'application/json' },
    });

    let packages = Array.isArray(response.data) ? response.data : (response.data?.data ?? []);

    // Exclude the current package
    packages = packages.filter((pkg) => pkg.id != excludeId);

    // Shuffle and take 2 random packages
    const shuffled = packages.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 2);
  } catch (error) {
    console.log('Error fetching similar packages:', error);
    return [];
  }
}
