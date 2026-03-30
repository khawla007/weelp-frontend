import { authApi } from '../axiosInstance';

/**
 * Dashboard Service
 * Fetches dashboard data from the backend API (Client Components)
 */

/**
 * Get dashboard metrics (revenue, bookings, users, activities)
 * @returns {Promise} Dashboard metrics data
 */
export const getDashboardMetrics = async () => {
  try {
    const response = await authApi.get('/api/admin/dashboard/metrics');
    return response?.data?.data?.metrics || [];
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    throw error;
  }
};

/**
 * Get overview chart data (monthly revenue)
 * @returns {Promise} Overview chart data
 */
export const getOverviewChart = async () => {
  try {
    const response = await authApi.get('/api/admin/dashboard/overview-chart');
    return response?.data?.data || [];
  } catch (error) {
    console.error('Error fetching overview chart:', error);
    throw error;
  }
};

/**
 * Get recent sales data with monthly total
 * @returns {Promise<{success: boolean, data: Array, monthly_total: number}>} Recent sales data with monthly total
 */
export const getRecentSales = async () => {
  try {
    const response = await authApi.get('/api/admin/dashboard/recent-sales');
    return response?.data || {};
  } catch (error) {
    console.error('Error fetching recent sales:', error);
    throw error;
  }
};

/**
 * Search dashboard content
 * @param {string} query - Search query
 * @returns {Promise} Search results
 */
export const searchDashboard = async (query) => {
  try {
    if (!query || query.length < 2) {
      return [];
    }
    const response = await authApi.get(`/api/admin/dashboard/search`, { params: { q: query } });
    return response?.data?.data || [];
  } catch (error) {
    console.error('Error searching dashboard:', error);
    throw error;
  }
};
