import { publicApi } from '@/lib/axiosInstance';

// Public endpoint — use publicApi (no auth interceptor). authApi would run
// getSession() with an 8s race on every fetch even for logged-out visitors;
// publicApi skips that. Its baseURL is undefined on the client, so axios issues
// a relative `/api/announcements` that the Next.js rewrite proxies to the backend.
export async function fetchAnnouncements() {
  try {
    const res = await publicApi.get('/api/announcements');
    return res.data?.data || [];
  } catch {
    return [];
  }
}
