import { publicApi, authApi, createAuthenticatedServerApi } from '../axiosInstance';
import { log } from '../utils';

/**
 * Display Single City Data
 * @param {string} city slug of the city
 * @returns  {Promise<{success:boolean,message?:string,data?:object}}
 */
export async function getCityData(city) {
  try {
    const response = await publicApi.get(`/api/city/${city}`, {
      headers: { Accept: 'application/json' },
    });

    if (response.status == 200) {
      return response?.data;
    }

    return { success: false, message: 'Not Found' };
  } catch (error) {
    console.error('Error fetching Single City', error);

    return { success: false, message: 'Something Went Wrong' };
  }
}

/**
 * Get Single City on Admin side
 * @param {Number} id
 @returns {Promise<object>} - City data or empty object if not found
 */
export async function getSingleCityAdmin(id) {
  try {
    const response = await authApi.get(`/api/admin/cities/${id}`, {
      headers: { Accept: 'application/json' },
    });
    if (response.status === 200) {
      return response.data;
    }

    return {};
  } catch (error) {
    return {};
  }
}

/**
 * Fetches a list of cities for admin with optional query parameters.
 * @function
 * @param {string} [search=""] - Optional query string (must start with `?`).
 *   Example: "?name=india&page=2"
 * @returns {Promise<Object>} Returns the API response data if successful, otherwise returns an empty object.
 *
 * @example
 * const states = await getAllCitiesAdminV2("?name=india&page=2");
 */
export async function getAllCitiesAdminV2(search = '') {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.get(`/api/admin/cities/${search}`, {
      headers: { Accept: 'application/json' },
    });
    return response?.data;
  } catch (error) {
    return {};
  }
}

/**
 * Get Cities Options
 * @returns {Promise<{ success:boolean,data:[], total:number, current_page:number,per_page:number,total:number }>}
 * All Cities list data for form handling purpose e.g... {dropdowns, selects,etc}
 */
export async function getAllCitiesOptionsAdmin() {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.get(`/api/admin/cities/list`, {
      headers: { Accept: 'application/json' },
    });

    if (response.status === 200) {
      return response?.data?.data || []; // extract List
    }
    return [];
  } catch (error) {
    return [];
  }
}

/**
 * Get All Cities List for Admin (server-side, authenticated)
 * @returns {Promise<{ success:boolean, data:Array<{id:number, name:string}> }>}
 */
export async function getCitiesListAdmin() {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.get(`/api/admin/cities/list`, {
      headers: { Accept: 'application/json' },
    });

    if (response.status === 200) {
      return response?.data;
    }

    return { success: false, data: [] };
  } catch (error) {
    console.error('Service Error (getCitiesListAdmin):', error);
    return { success: false, data: [] };
  }
}

/**
 * Get All Featured Cities
 * @returns []
 */
export async function getAllFeaturedCities() {
  try {
    const response = await publicApi.get(`/api/featured-cities`, {
      headers: { Accept: 'application/json' },
    });

    return response.data;
  } catch (error) {
    console.log('Error fetching featured cities:', error.message);
    return { success: false, data: [] };
  }
}

/**
 * Get All Cities with Pagination
 * @param {number} page - Page number (default 1)
 * @param {number} perPage - Items per page (default 8)
 * @returns {Promise<{success:boolean, data:[], current_page:number, last_page:number, per_page:number, total:number}>}
 */
export async function getAllCities(page = 1, perPage = 8, params = {}) {
  try {
    const query = new URLSearchParams({ page, per_page: perPage });
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.set(key, value);
      }
    });

    const response = await publicApi.get(`/api/cities?${query.toString()}`, {
      headers: { Accept: 'application/json' },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching cities:', error.message);
    return { success: false, data: [], current_page: 1, last_page: 1, per_page: perPage, total: 0 };
  }
}

/**
 * Get paginated items (activities, packages, or itineraries) for a city.
 * @param {string} citySlug - City slug
 * @param {'activity'|'package'|'itinerary'} itemType - Singular item type for API
 * @param {object} params - Validated listing query parameters
 * @returns {Promise<{success:boolean, data:[], current_page:number, last_page:number, per_page:number, total:number}>}
 */
export async function getCityItemsByType(citySlug, itemType, params = {}) {
  try {
    const response = await publicApi.get(`/api/cities/${citySlug}/all-items`, {
      headers: { Accept: 'application/json' },
      params: { item_type: itemType, ...params },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${itemType}s for city ${citySlug}:`, error.message);
    return { success: false, data: [], current_page: 1, last_page: 1, per_page: params.per_page || 10, total: 0, available_categories: [], available_tags: [] };
  }
}

/**
 * Get All Cities List (client-side, authenticated)
 * For use in client components that need to fetch cities list
 * @returns {Promise<{ data: Array<{id:number, name:string}> }>}
 */
export async function getAllCitiesListClient() {
  try {
    const response = await authApi.get(`/api/admin/cities/list`, {
      headers: { Accept: 'application/json' },
    });
    return response?.data;
  } catch (error) {
    console.error('Service Error (getAllCitiesListClient):', error);
    return { data: [] };
  }
}

/**
 * Get All Cities List from Public API (for creators/guests)
 * Uses the public endpoint which doesn't require admin authentication
 * @returns {Promise<{ data: Array<{id:number, name:string, slug:string}> }>}
 */
export async function getAllCitiesListPublic() {
  try {
    const headers = { Accept: 'application/json' };
    const response = await publicApi.get(`/api/cities?per_page=50&page=1`, {
      headers,
    });
    const firstPage = response?.data;
    const lastPage = Number(firstPage?.last_page) || 1;

    if (lastPage <= 1) {
      return firstPage;
    }

    const remainingPages = await Promise.all(
      Array.from({ length: lastPage - 1 }, (_, index) =>
        publicApi.get(`/api/cities?per_page=50&page=${index + 2}`, {
          headers,
        }),
      ),
    );

    return {
      ...firstPage,
      data: [...(firstPage?.data || []), ...remainingPages.flatMap((page) => page.data?.data || [])],
    };
  } catch (error) {
    console.error('Service Error (getAllCitiesListPublic):', error);
    return { success: false, data: [] };
  }
}
