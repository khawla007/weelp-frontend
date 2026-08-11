import { authApi } from '@/lib/axiosInstance';

export const ADMIN_NAVIGATION_UNSEEN_KEY = '/api/admin/navigation-unseen-counts';

function normalizeCount(value) {
  const count = Number(value);

  return Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
}

export function normalizeAdminNavigationCounts(payload) {
  const counts = payload?.data ?? payload;

  return {
    orders: normalizeCount(counts?.orders),
    reviews: normalizeCount(counts?.reviews),
  };
}

export async function fetchAdminNavigationUnseen() {
  const response = await authApi.get(ADMIN_NAVIGATION_UNSEEN_KEY);

  return normalizeAdminNavigationCounts(response.data);
}

export async function markAdminNavigationSeen(resource, seenThrough) {
  const body = seenThrough ? { seen_through: seenThrough } : {};
  const response = await authApi.put(`${ADMIN_NAVIGATION_UNSEEN_KEY}/${resource}/seen`, body);

  return normalizeAdminNavigationCounts(response.data);
}
