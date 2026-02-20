'use server';

import { revalidatePath } from 'next/cache';
import { authApi } from '../axiosInstance';
import { delay, log } from '../utils';

/**
 * Action for Create Vendor
 * @param {{ name: string, description: string, email: string, phone: string, address:string, status:string }} data form data related to create vendor
 * @returns {void}
 */
export const createVendor = async (data = {}) => {
  try {
    await delay(500);
    const res = await authApi.post('/api/admin/vendors/store/vendor', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    revalidatePath('/dashboard/admin/transfers/vendors'); // revalidate api
    return {
      success: true,
      message: res.data?.message,
    };
  } catch (err) {
    const status = err?.response?.status;

    if (status === 400) {
      return {
        success: false,
        message: 'Validation error',
        errors: err?.response?.data?.errors,
      };
    }

    // if email alrady exist
    if (status === 409) {
      return {
        success: false,
        message: err?.response?.data?.error || 'Already Exist',
      };
    }

    if (status === 422) {
      return {
        success: false,
        message: 'Vendor already exists',
      };
    }

    return {
      success: false,
      message: 'Something went wrong',
    };
  }
};

/**
 * Action for Creating a Vendor Route
 * @param {{ vendor_id: number,name: string,description: string,start_point: string,end_point: string,base_price: number,price_per_km: number,status: 'active' | 'inactive' | 'pending' }} data - Form data for creating a vendor route
 * @returns {void}
 */
export const createVendorRoute = async (data = {}) => {
  try {
    const { vendor_id } = data; // access id
    await delay(500);
    const res = await authApi.post('/api/admin/vendors/store/route', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    revalidatePath(`/dashboard/admin/transfers/${vendor_id}/vendors`); // revalidate api
    return {
      success: true,
      message: res.data?.message,
    };
  } catch (err) {
    const status = err?.response?.status;

    if (status === 400) {
      return {
        success: false,
        message: 'Validation error',
        errors: err?.response?.data?.errors,
      };
    }

    // if email alrady exist
    if (status === 409) {
      return {
        success: false,
        message: err?.response?.data?.error || 'Already Exist',
      };
    }

    if (status === 422) {
      return {
        success: false,
        message: 'Vendor already exists',
      };
    }

    return {
      success: false,
      message: 'Something went wrong',
    };
  }
};

/**
 * Action for Creating a Vendor Pricing
 * @param {{vendor_id: number, name: string, description: string, base_price: number, price_per_km: number, min_distance: number, waiting_charge: number, night_charge_multiplier: number, peak_hour_multiplier: number, status: 'active' | 'inactive' | 'pending'}} data - Form data for creating a vendor pricing
 * @returns {{success,message}}
 */
export const createVendorPricing = async (data = {}) => {
  try {
    const { vendor_id } = data; // access id
    await delay(500);
    const res = await authApi.post('/api/admin/vendors/store/pricing-tier', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    revalidatePath(`/dashboard/admin/transfers/${vendor_id}/pricing`); // revalidate api
    return {
      success: true,
      message: res.data?.message,
    };
  } catch (err) {
    const status = err?.response?.status;

    if (status === 400) {
      return {
        success: false,
        message: 'Validation error',
        errors: err?.response?.data?.errors,
      };
    }

    // if email alrady exist
    if (status === 409) {
      return {
        success: false,
        message: err?.response?.data?.error || 'Already Exist',
      };
    }

    if (status === 422) {
      return {
        success: false,
        message: 'Vendor already exists',
      };
    }

    return {
      success: false,
      message: 'Something went wrong',
    };
  }
};

/**
 * Action for Creating a Vendor Availability
 * @param {{vendor_id: number, vehicle_id: number, date: string, start_time: string, end_time: string, max_bookings: number, price_multiplier: number}} data - Form data for creating vendor availability @returns {{success: boolean, message: string}}
 * @returns {{success,message}}
 */
export const createVendorAvailability = async (data = {}) => {
  try {
    const { vendor_id } = data; // access id
    await delay(500);
    const res = await authApi.post('/api/admin/vendors/store/availability-time-slot', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    revalidatePath(`/dashboard/admin/transfers/${vendor_id}/availability`); // revalidate api
    return {
      success: true,
      message: res.data?.message,
    };
  } catch (err) {
    const status = err?.response?.status;

    if (status === 400) {
      return {
        success: false,
        message: 'Validation error',
        errors: err?.response?.data?.errors,
      };
    }

    // if email alrady exist
    if (status === 409) {
      return {
        success: false,
        message: err?.response?.data?.error || 'Already Exist',
      };
    }

    if (status === 422) {
      return {
        success: false,
        message: 'Vendor already exists',
      };
    }

    return {
      success: false,
      message: 'Something went wrong',
    };
  }
};

/**
 * Action for Creating a Vendor Vehicle
 * @param {{vendor_id: number, vehicle_type: string, capacity: number, make: string, model: string, year: number, license_plate: string, features: string, status: 'Active' | 'Inactive', last_maintenance: string, next_maintenance: string}} data - Form data for creating a vendor vehicle
 * @returns {{success: boolean, message: string}}
 */
export const createVendorVehicle = async (data = {}) => {
  try {
    const { vendor_id } = data; // access id
    await delay(500);
    const res = await authApi.post('/api/admin/vendors/store/vehicle', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    revalidatePath(`/dashboard/admin/transfers/${vendor_id}/vehicles`); // revalidate api
    return {
      success: true,
      message: res.data?.message,
    };
  } catch (err) {
    const status = err?.response?.status;

    if (status === 400) {
      return {
        success: false,
        message: 'Validation error',
        errors: err?.response?.data?.errors,
      };
    }

    // if email alrady exist
    if (status === 409) {
      return {
        success: false,
        message: err?.response?.data?.error || 'Already Exist',
      };
    }

    if (status === 422) {
      return {
        success: false,
        message: 'Vendor already exists',
      };
    }

    return {
      success: false,
      message: 'Something went wrong',
    };
  }
};

/**
 * Action for Creating a Vendor Drivers
 * @param {{ vendor_id: number, first_name: string, last_name: string, email: string, phone: string, license_number: string, license_expiry: string, status: string, assigned_vehicle_id: number, languages: string }} data - Driver profile form data
 * @returns {{success,message}}
 */
export const createVendorDrivers = async (data = {}) => {
  try {
    const { vendor_id } = data; // access id
    await delay(500);

    const res = await authApi.post('/api/admin/vendors/store/driver', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    revalidatePath(`/dashboard/admin/transfers/${vendor_id}/drivers`); // revalidate api
    return {
      success: true,
      message: res.data?.message,
    };
  } catch (err) {
    const status = err?.response?.status;

    if (status === 400) {
      return {
        success: false,
        message: 'Validation error',
        errors: err?.response?.data?.errors,
      };
    }

    // if email alrady exist
    if (status === 409) {
      return {
        success: false,
        message: err?.response?.data?.error || 'Already Exist',
      };
    }

    if (status === 422) {
      return {
        success: false,
        message: 'Vendor already exists',
      };
    }

    return {
      success: false,
      message: 'Something went wrong',
    };
  }
};

/**
 * Action for Creating a Vendor Schedule
 * @param {{driver_id: number, vehicle_id: number, date: string, shift: string, time: string}} data - Form data for assigning driver and vehicle
 * @returns {{success: boolean, message: string}}
 */
export const createVendorSchedule = async (data = {}) => {
  try {
    const { vendor_id } = data; // access id
    await delay(500);
    const res = await authApi.post('/api/admin/vendors/store/schedule', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    revalidatePath(`/dashboard/admin/transfers/${vendor_id}/availability`); // revalidate api

    return {
      success: true,
      message: res.data?.message,
    };
  } catch (err) {
    const status = err?.response?.status;

    if (status === 400) {
      return {
        success: false,
        message: 'Validation error',
        errors: err?.response?.data?.errors,
      };
    }

    // if email alrady exist
    if (status === 409) {
      return {
        success: false,
        message: err?.response?.data?.error || 'Already Exist',
      };
    }

    if (status === 422) {
      return {
        success: false,
        message: 'Vendor already exists',
      };
    }

    return {
      success: false,
      message: 'Something went wrong',
    };
  }
};

/**
 * Action for Edit Vendor Status by Id -ADMIN
 * @param {number} vendorId - VendorId
 * @param {{ status: string }} data - Vendor Status  data
 * @returns {{success,message}}
 */
export const editVendorStatusbyIdAdmin = async (vendorId, data = {}) => {
  try {
    await delay(500);

    const res = await authApi.put(`/api/admin/vendors/update/vendor/${vendorId}`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    revalidatePath(`/dashboard/admin/transfers/vendors`); // revalidate path

    return {
      success: true,
      message: res.data?.message,
    };
  } catch (err) {
    log(err);
    const status = err?.response?.status;

    if (status === 400) {
      return {
        success: false,
        message: 'Validation error',
        errors: err?.response?.data?.errors,
      };
    }

    // if email alrady exist
    if (status === 409) {
      return {
        success: false,
        message: err?.response?.data?.error || 'Already Exist',
      };
    }

    if (status === 422) {
      return {
        success: false,
        message: 'Vendor already exists',
      };
    }

    return {
      success: false,
      message: 'Something went wrong',
    };
  }
};
