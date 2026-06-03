// Maps a personal notification (type + data) to an internal target route, or
// null when there is no confident destination. Pure — no React, no I/O.
// Phase 1 returns only internal absolute paths (always start with '/').
export function notificationLink(type, data) {
  if (typeof type !== 'string') return null;
  if (type.startsWith('application_')) return '/dashboard/customer/application-status';
  if (type.startsWith('itinerary_')) {
    const id = data?.itinerary_id;
    return id ? `/dashboard/customer/my-itineraries/${id}` : null;
  }
  if (type === 'new_booking') return '/dashboard/customer/earnings';
  return null;
}
