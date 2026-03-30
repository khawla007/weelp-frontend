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

// Authenticated fetcher for admin endpoints
// Uses authApi which automatically includes the JWT token via interceptor
export const authFetcher = async (url) => {
  try {
    const res = await authApi.get(url);
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Don't throw for 404 or 401 errors, just return empty data to prevent infinite retries
      if (error.response?.status === 404 || error.response?.status === 401) {
        console.warn(`[authFetcher] ${error.response?.status} for ${url}`);
        return null;
      }
      throw new Error(`API Error (${error.response?.status}): ${error.message}`);
    } else {
      throw new Error('Unexpected Error Occurred');
    }
  }
};
