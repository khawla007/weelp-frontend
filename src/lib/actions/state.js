'use server';

import { revalidatePath } from 'next/cache';
import { authApi } from '../axiosInstance';
import { delay, log } from '../utils';

/**
 * @typedef {Object} Location
 * @property {string} latitude
 * @property {string} longitude
 * @property {string} capital_city
 * @property {number} population
 * @property {string} currency
 * @property {string} timezone
 * @property {string[]} language
 * @property {string[]} local_cuisine
 */

/**
 * @typedef {Object} Travel
 * @property {string} airport
 * @property {string} public_transportation
 * @property {boolean} taxi_available
 * @property {boolean} rental_cars_available
 * @property {boolean} hotels
 * @property {boolean} hostels
 * @property {boolean} apartments
 * @property {boolean} resorts
 * @property {string} visa_requirements
 * @property {string} best_time_to_visit
 * @property {string} travel_tips
 * @property {string} safety_information
 */

/**
 * @typedef {Object} Country
 * @property {string} name
 * @property {string} slug
 * @property {string} code
 * @property {string} description
 * @property {boolean} featured_destination
 * @property {Location} location
 * @property {Travel} travel
 * @property {Array<Object>} seasons
 * @property {Array<Object>} events
 * @property {any[]} additional
 * @property {any[]} media_gallery
 * @property {any[]} faqs
 * @property {Object} seo
 * @property {Object} country_id // additional key
 */

/**
 * @COUNTRY , @STATE , @CITY , @PLACES Interface is ALMOST SAME  the addtional field which are coming add with sign of  " // "
 * Create a new State
 * @param {Country} data - STATE form data
 * @returns {Promise<{ success: boolean; message: string; errors?: any }>}
 */

export const createState = async (data = {}) => {
  try {
    await delay(500);
    // log(data);

    const res = await authApi.post('/api/admin/states', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    revalidatePath('/dashboard/admin/destinations/states'); // revalidate API cache

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

    if (status === 409) {
      return {
        success: false,
        message: err?.response?.data?.error || 'State already exists',
      };
    }

    if (status === 422) {
      return {
        success: false,
        message: 'State already exists',
      };
    }

    return {
      success: false,
      message: 'Something went wrong while State',
    };
  }
};

// Actions to Edit State
export const editState = async (stateId, data = {}) => {
  try {
    await delay(500);

    const res = await authApi.put(`/api/admin/states/${stateId}`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    log(res);

    revalidatePath('/dashboard/admin/destinations/states'); // revalidate API cache

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

    if (status === 409) {
      return {
        success: false,
        message: err?.response?.data?.error || 'State already exists',
      };
    }

    if (status === 422) {
      return {
        success: false,
        message: 'State already exists',
      };
    }

    return {
      success: false,
      message: 'Something went wrong while editing state',
    };
  }
};

/**
 * Action to delete states
 * @param {number} stateId
 * @returns {{ success: boolean, message: string }} - API response status and message
 */
export async function deleteState(stateId) {
  try {
    const res = await authApi.delete(`/api/admin/states/${stateId}/`);

    revalidatePath('/dashboard/admin/destinations/states/'); //revalidating path
    return { success: true, message: res.data?.message };
  } catch (error) {
    return { success: false, error: 'Something went wrong' };
  }
}
