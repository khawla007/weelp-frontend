import { authApi } from '@/lib/axiosInstance';

export async function createNotification(payload) {
  const res = await authApi.post('/api/admin/notifications', payload);
  return res.data;
}

// Admin user search for the single-user target autocomplete.
// Returns the users array (GET /api/admin/users?search= → res.data.data.users).
export async function searchUsers(query) {
  try {
    const res = await authApi.get('/api/admin/users', { params: { search: query, per_page: 10 } });
    return res.data?.data?.users || [];
  } catch {
    return [];
  }
}
