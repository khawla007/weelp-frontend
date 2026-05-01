import axios from 'axios';

import { authApi } from './axiosInstance';

// Public fetcher for unauthenticated endpoints
export const fetcher = async (url) => {
  try {
    const res = await axios.get(url);
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`API Error (${error.response?.status}): ${error.message}`);
    } else {
      throw new Error('Unexpected Error Occurred');
    }
  }
};

// Authenticated fetcher for admin endpoints.
// authApi's response interceptor handles 401 → silent refresh + retry, and
// signs out on terminal errors. By the time we observe a 401 here it means
// the refresh path also failed and the user is being redirected to /login.
export const authFetcher = async (url) => {
  try {
    const res = await authApi.get(url);
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // 401 reaching here means the interceptor's refresh-and-retry already
      // failed and a redirect to /login is in flight. Returning null prevents
      // SWR from holding a stale error during the navigation window.
      if (error.response?.status === 401) {
        return null;
      }
      throw new Error(`API Error (${error.response?.status}): ${error.message}`);
    } else {
      throw new Error('Unexpected Error Occurred');
    }
  }
};
