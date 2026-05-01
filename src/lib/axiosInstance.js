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

if (typeof window !== 'undefined') {
  // Hoist client-only modules so the 401 path doesn't pay an import await.
  // Top-level await is fine in modern bundlers; fall back to dynamic if needed.
  let getSessionRef;
  let refreshSessionOnceRef;
  let forceSignOutToLoginRef;

  const loadDeps = (async () => {
    const [{ getSession }, refreshMod] = await Promise.all([
      import('next-auth/react'),
      import('./auth/clientRefresh'),
    ]);
    getSessionRef = getSession;
    refreshSessionOnceRef = refreshMod.refreshSessionOnce;
    forceSignOutToLoginRef = refreshMod.forceSignOutToLogin;
  })();

  authApi.interceptors.request.use(
    async (config) => {
      try {
        await loadDeps;
        const session = await Promise.race([
          getSessionRef(),
          new Promise((resolve) => setTimeout(() => resolve(null), 8000)),
        ]);

        // If a prior refresh failed, don't attach a likely-stale token; let the
        // request 401 and the response interceptor terminal-handle it.
        if (session?.access_token && !session.error) {
          config.headers.Authorization = `Bearer ${session.access_token}`;
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      }

      return config;
    },
    (error) => Promise.reject(error),
  );

  authApi.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error?.response?.status;
      const original = error?.config;
      const errorCode = error?.response?.data?.error;

      if (status === 401 && original && !original._retry) {
        await loadDeps;

        if (errorCode === 'token_revoked' || errorCode === 'refresh_token_reused') {
          await forceSignOutToLoginRef();
          return Promise.reject(error);
        }

        original._retry = true;
        const newToken = await refreshSessionOnceRef();

        if (!newToken) {
          await forceSignOutToLoginRef();
          return Promise.reject(error);
        }

        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return authApi(original);
      }

      const message = error?.response?.data?.message || error.message || 'Unexpected error';
      const url = error?.config?.url;
      if (process.env.NODE_ENV === 'development') {
        console.error(`[API Error] ${status} @ ${url}: ${message}`, error?.response?.data);
      }

      return Promise.reject(error);
    },
  );
}

/**
 * Creates an authenticated API instance for server-side use
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

export async function getAuthApi() {
  if (typeof window === 'undefined') {
    return createAuthenticatedServerApi();
  } else {
    return authApi;
  }
}
