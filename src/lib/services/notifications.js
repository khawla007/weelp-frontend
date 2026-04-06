import { authApi } from '@/lib/axiosInstance';

export async function fetchNotifications(page = 1) {
  try {
    const res = await authApi.get(`/api/notifications?page=${page}`);
    return res.data;
  } catch {
    return { success: false, data: [] };
  }
}

export async function fetchUnreadCount() {
  try {
    const res = await authApi.get('/api/notifications/unread-count');
    return res.data;
  } catch {
    return { success: false, count: 0 };
  }
}

export async function markAsRead(id) {
  try {
    const res = await authApi.put(`/api/notifications/${id}/read`);
    return res.data;
  } catch {
    return { success: false };
  }
}

export async function markAllAsRead() {
  try {
    const res = await authApi.put('/api/notifications/read-all');
    return res.data;
  } catch {
    return { success: false };
  }
}
