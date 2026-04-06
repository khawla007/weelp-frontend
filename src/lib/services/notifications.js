const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function fetchNotifications(page = 1, token) {
  const res = await fetch(`${API_BASE}/notifications?page=${page}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return { success: false, data: [] };
  return res.json();
}

export async function fetchUnreadCount(token) {
  const res = await fetch(`${API_BASE}/notifications/unread-count`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return { success: false, count: 0 };
  return res.json();
}

export async function markAsRead(id, token) {
  const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) return { success: false };
  return res.json();
}

export async function markAllAsRead(token) {
  const res = await fetch(`${API_BASE}/notifications/read-all`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) return { success: false };
  return res.json();
}
