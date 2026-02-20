'use server';

import { publicApi } from '@/lib/axiosInstance';
import { log } from '@/lib/utils';
import stripe from '../stripe/stripe-server';

/**
 * Handle for intialization checkout
 * IN THIS INTENT IS CREATED BY LARAVEL
 * @param {object} payload { amount and currency } required is handled
 * @returns {object}
 */
export const initializeCheckout = async (payload = {}) => {
  try {
    const response = await publicApi.post(`/api/stripe/initialize`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // response is 200
    if (response.status === 200) {
      return { success: true, data: response.data };
    }

    return {
      success: false,
      error: `Unexpected status code: ${response?.status}`,
    };
  } catch (error) {
    const status = error?.response?.status || 500;
    return {
      success: false,
      error: `Server Error Please Try Again: ${status}`,
    };
  }
};

/**
 * Handle for Create Order Action in checkout
 * @param {object} orderDetail - Required order details like amount, currency, etc.
 * @returns {Promise<{ success: boolean; data?: any; error?: string }>}
 */
export async function checkoutCreateOrder(orderDetail = {}) {
  log(orderDetail);

  try {
    const response = await publicApi.post(`/api/stripe/create-order`, orderDetail, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // handling success
    if (response.status == 200) {
      return { success: true, data: response?.data };
    }

    // If not 200,
    return {
      success: false,
      error: `Unexpected status code: ${response?.status}`,
    };
  } catch (error) {
    // log(error?.response);
    const status = error?.response?.status || 500;
    return {
      success: false,
      error: `Server Error Pleaease Try Again: ${status}`,
    };
  }
}

/**
 * Action for Create Payment Intent
 * @param {object} payload { amount and currency } required
 * @returns {object} {success , clientSecret}
 */
export const createPaymentIntent = async (payload = {}) => {
  try {
    //  Stripe customer create per user
    const customer = await stripe.customers.create({
      email: payload.email,
      name: payload.name,
    });

    // Create Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: payload.amount,
      currency: payload.currency,
      receipt_email: payload.email,
      customer: customer.id,
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntent: paymentIntent.id,
    };
  } catch (error) {
    log(error);
    return {
      success: false,
      error: `Server Error Please Try Again: ${error.message}`,
    };
  }
};
