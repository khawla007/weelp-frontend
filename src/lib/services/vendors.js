import { authApi } from '../axiosInstance';
import { log } from '../utils';

/**
 * Get All Vendors
 * @param {string} [query] - Optional query string (e.g., ?page=1)
 * @returns {Promise<{ success:boolean,data:[], total:number, current_page:number,per_page:number,total:number }>} - Vendor list data
 */
export async function getAllVendorsAdmin(query = '') {
  try {
    const response = await authApi.get(`/api/admin/vendors${query ? query : ''}`, {
      headers: { Accept: 'application/json' },
    });

    if (response.status === 200) {
      return response?.data;
    }
    return {};
  } catch (error) {
    return {};
  }
}

/**
 * Get Vendor Route By Id
 * @param {string} [query] - Optional query string (e.g., ?page=1)
 * @returns {Promise<{ success:boolean,data:[], total:number, current_page:number,per_page:number,total:number }>} - Vendor list data
 */
export async function getRoutesByVendorIdAdmin(vendorId, query) {
  try {
    const response = await authApi.get(`/api/admin/vendors/${vendorId}/routes${query}`, {
      headers: { Accept: 'application/json' },
    });

    // log(response)

    if (response.status === 200) {
      return response?.data;
    }
    return {};
  } catch (error) {
    return {};
  }
}

/**
 * Get Vendor Price  By vendorId
 * @param {string} [query] - Optional query string (e.g., ?page=1)
 * @returns {Promise<{ success:boolean,data:[], total:number, current_page:number,per_page:number,total:number }>} - Vendor list data
 */
export async function getPriceByVendorIdAdmin(vendorId, query) {
  try {
    const response = await authApi.get(`/api/admin/vendors/${vendorId}/pricing-tiers${query}`, {
      headers: { Accept: 'application/json' },
    });

    // log(response)

    if (response.status === 200) {
      return response?.data;
    }
    return {};
  } catch (error) {
    return {};
  }
}

/**
 * Get Vendor Availability By vendorId
 * @param {string} [query] - Optional query string (e.g., ?page=1)
 * @returns {Promise<{ success:boolean,data:[], total:number, current_page:number,per_page:number,total:number }>} - Vendor list data
 */
export async function getAvailabilityByVendorIdAdmin(vendorId, query) {
  try {
    const response = await authApi.get(`/api/admin/vendors/${vendorId}/availability-time-slots${query}`, {
      headers: { Accept: 'application/json' },
    });

    // log(response)

    if (response.status === 200) {
      return response?.data;
    }
    return {};
  } catch (error) {
    return {};
  }
}

/**
 * Get Vendor Vehicles  By vendorId
 * @param {string} [query] - Optional query string (e.g., ?page=1)
 * @returns {Promise<{ success:boolean,data:[], total:number, current_page:number,per_page:number,total:number }>} - Vendor list data
 */
export async function getVehiclesByVendorIdAdmin(vendorId, query) {
  try {
    const response = await authApi.get(`/api/admin/vendors/${vendorId}/vehicles${query}`, {
      headers: { Accept: 'application/json' },
    });

    if (response.status === 200) {
      return response?.data;
    }
    return {};
  } catch (error) {
    return {};
  }
}

/**
 * Get Vendor Drivers  By vendorId
 * @param {string} [query] - Optional query string (e.g., ?page=1)
 * @returns {Promise<{ success:boolean,data:[], total:number, current_page:number,per_page:number,total:number }>} - Vendor driver list data
 */
export async function getDriversByVendorIdAdmin(vendorId, query) {
  try {
    const response = await authApi.get(`/api/admin/vendors/${vendorId}/drivers${query}`, {
      headers: { Accept: 'application/json' },
    });

    if (response.status === 200) {
      return response?.data;
    }
    return {};
  } catch (error) {
    return {};
  }
}

/**
 * Get Vendor by Id Admin
 * @param {string} vendorId - vendorId Required
 * @returns {Promise<{ success:boolean,data:[], total:number, current_page:number,per_page:number,total:number }>} - Vendor list data
 */
export async function getVendorByIdAdmin(vendorId) {
  try {
    const response = await authApi.get(`/api/admin/vendors/${vendorId}/`, {
      headers: { Accept: 'application/json' },
    });

    if (response.status === 200) {
      return response?.data;
    }
    return {};
  } catch (error) {
    return {};
  }
}

/**
 * Get Vendor schedules by vendor ID with optional filters.
 * @param {number} vendorId - The ID of the vendor.
 * @param {string} [query] - Optional query string (e.g., `?driver_id=3&shift=Night&date=2025-07-10&page=2`)
 * @returns {Promise<{ success: boolean, data: [], total: number, current_page: number, per_page: number }>} - Paginated schedule data.
 */
export async function getSchedulesByVendorIdAdmin(vendorId, query) {
  try {
    const response = await authApi.get(`/api/admin/vendors/${vendorId}/schedules${query}`, {
      headers: { Accept: 'application/json' },
    });
    if (response.status === 200) {
      return response?.data;
    }
    return {};
  } catch (error) {
    return {};
  }
}

/**
 * Get Vendor Vehicles  By vendorId *** {dropdowns} Form Oriented ***
 * @returns {Promise<{ success:boolean,data:[], total:number, current_page:number,per_page:number,total:number }>} - All Vendor vehicle list data for form handling purpose e.g... {dropdowns, selects,etc}
 */
export async function getVehiclesByVendorIdOptions(vendorId) {
  try {
    const response = await authApi.get(`/api/admin/vendors/${vendorId}/vehiclesdropdown`, {
      headers: { Accept: 'application/json' },
    });

    if (response.status === 200) {
      return response?.data;
    }
    return {};
  } catch (error) {
    return {};
  }
}

/**
 * Get Vendor Drivers  By vendorId *** {dropdowns} Form Oriented ***
 * @returns {Promise<{ success:boolean,data:[] }>} -Api For For All Vendor driver list data for form handling form purpose e.g... {dropdowns, selects,etc}
 */
export async function getDriversByVendorIdOptions(vendorId) {
  try {
    const response = await authApi.get(`/api/admin/vendors/${vendorId}/driversforselect`, {
      headers: { Accept: 'application/json' },
    });

    if (response.status === 200) {
      return response?.data;
    }
    return {};
  } catch (error) {
    return {};
  }
}

/**
 *  Get Vendor  *** {dropdowns} Form Oriented ***
 * @param {string} [query] - Optional query string (e.g., ?page=1)
 * @returns {Promise<{ success:boolean,data:[] }>} - Vendor list data
 */
export async function getAllVendorsOptions() {
  try {
    const response = await authApi.get(`/api/admin/vendors/vendor-select`, {
      headers: { Accept: 'application/json' },
    });

    if (response.status === 200) {
      return response?.data;
    }
    return {};
  } catch (error) {
    return {};
  }
}

/**
 * Get Vendor Routes  By vendorId *** {dropdowns} Form Oriented ***
 * @returns {Promise<{ success:boolean,data:[] }>} -Api For For All Vendor driver list data for form handling form purpose e.g... {dropdowns, selects,etc}
 */
export async function getRoutesByVendorIdOptions(vendorId) {
  try {
    const response = await authApi.get(`/api/admin/vendors/${vendorId}/routes-select`, {
      headers: { Accept: 'application/json' },
    });

    if (response.status === 200) {
      return response?.data;
    }
    return {};
  } catch (error) {
    return {};
  }
}

/**
 * Get Vendor Pricing Tiers  By vendorId *** {dropdowns} Form Oriented ***
 * @returns {Promise<{ success:boolean,data:[] }>} -Api For For All Vendor driver list data for form handling form purpose e.g... {dropdowns, selects,etc}
 */
export async function getPriceByVendorIdOptions(vendorId) {
  try {
    const response = await authApi.get(`/api/admin/vendors/${vendorId}/pricing-tiers-select`, {
      headers: { Accept: 'application/json' },
    });

    if (response.status === 200) {
      return response?.data;
    }
    return {};
  } catch (error) {
    return {};
  }
}

/**
 * Get Vendor Availablity Tiers  By vendorId *** {dropdowns} Form Oriented ***
 * @returns {Promise<{ success:boolean,data:[] }>} -Api For For All Vendor driver list data for form handling form purpose e.g... {dropdowns, selects,etc}
 */
export async function getAvailabilityByVendorIdOptions(vendorId) {
  try {
    const response = await authApi.get(`/api/admin/vendors/${vendorId}/availability-time-slots-select`, {
      headers: { Accept: 'application/json' },
    });

    if (response.status === 200) {
      return response?.data;
    }
    return {};
  } catch (error) {
    return {};
  }
}
