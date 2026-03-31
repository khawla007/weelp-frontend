import axios from 'axios';

const baseURL = process.env.API_BASE_URL;

export const publicApi = axios.create({
  baseURL: baseURL,
  headers: {
    Accept: 'application/json',
  },
});

/**
 * Smart authenticated API - works in both Server and Client contexts
 * Automatically detects environment and uses appropriate auth method
 */
export const authApi = axios.create({
  baseURL: typeof window === 'undefined' ? baseURL : '',
  headers: {
    Accept: 'application/json',
  },
});

// Client-side interceptor - only attaches token in browser
if (typeof window !== 'undefined') {
  authApi.interceptors.request.use(
    async (config) => {
      try {
        const { getSession } = await import('next-auth/react');
        // Add timeout to prevent hanging on session fetch
        const session = await Promise.race([getSession(), new Promise((resolve) => setTimeout(() => resolve(null), 2000))]);

        if (session?.access_token) {
          config.headers.Authorization = `Bearer ${session?.access_token}`;
        }
      } catch (error) {
        console.error('Error fetching session:', error);
        // Continue with request even if session fetch fails
        // The server will return 401 if auth is required
      }

      return config;
    },
    (error) => Promise.reject(error),
  );

  authApi.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        redirectToLogin();
      }

      const status = error?.response?.status;
      const message = error?.response?.data?.message || error.message || 'Unexpected error';
      const url = error?.config?.url;

      if (process.env.NODE_ENV === 'development') {
        console.error(`[API Error] ${status} @ ${url}: ${message}`, error?.response?.data);
      }

      return Promise.reject(error);
    },
  );
}

const redirectToLogin = () => {
  if (typeof window !== 'undefined') {
    window.location.href = '/user/login';
  }
};

/**
 * Creates an authenticated API instance for server-side use
 * Call this in Server Components to get an API instance with the token attached
 * @returns {Promise<AxiosInstance>} Axios instance with auth headers
 */
export async function createAuthenticatedServerApi() {
  const { auth } = await import('./auth/auth');
  const session = await auth();

  return axios.create({
    baseURL: process.env.API_BASE_URL,
    headers: {
      Accept: 'application/json',
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
    },
  });
}

/**
 * Helper function to make authenticated server requests
 * Use this in Server Actions that need to call the API
 * @returns {Promise<AxiosInstance>} Axios instance with auth headers
 */
export async function getAuthApi() {
  // Check if we're on server or client
  if (typeof window === 'undefined') {
    // Server-side: use server auth
    return createAuthenticatedServerApi();
  } else {
    // Client-side: return the global authApi (has interceptor)
    return authApi;
  }
}
