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
 */

/**
 * Create a new Country
 * @param {Country} data - Country form data
 * @returns {Promise<{ success: boolean; message: string; errors?: any }>}
 */

export const createCountry = async (data = {}) => {
  try {
    await delay(500);
    // log(data);

    const res = await authApi.post('/api/admin/countries', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    revalidatePath('/dashboard/admin/destinations/countries'); // revalidate API cache

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
        message: err?.response?.data?.error || 'Country already exists',
      };
    }

    if (status === 422) {
      return {
        success: false,
        message: 'Country already exists',
      };
    }

    return {
      success: false,
      message: 'Something went wrong while creating country',
    };
  }
};

export const editCountry = async (countryId, data = {}) => {
  try {
    await delay(500);

    const res = await authApi.put(`/api/admin/countries/${countryId}`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    log(res);

    revalidatePath('/dashboard/admin/destinations/countries'); // revalidate API cache

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
        message: err?.response?.data?.error || 'Country already exists',
      };
    }

    if (status === 422) {
      return {
        success: false,
        message: 'Country already exists',
      };
    }

    return {
      success: false,
      message: 'Something went wrong while creating country',
    };
  }
};

/**
 * Action to delete country
 * @param {number} countryId
 * @returns {{ success: boolean, message: string }} - API response status and message
 */
export async function deleteCountry(countryId) {
  try {
    const res = await authApi.delete(`/api/admin/countries/${countryId}/`);

    revalidatePath('/dashboard/admin/destinations/countries/'); //revalidating path
    return { success: true, message: res.data?.message };
  } catch (error) {
    return { success: false, error: 'Something went wrong' };
  }
}
