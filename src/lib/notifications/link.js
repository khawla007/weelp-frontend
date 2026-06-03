// Maps a personal notification type to an internal target route, or null when
// there is no confident destination. Pure — no React, no I/O.
// Phase 1 returns only internal absolute paths (always start with '/').
// Takes only `type`; callers may pass extra args (e.g. data) harmlessly.
export function notificationLink(type) {
  if (typeof type !== 'string') return null;
  if (type.startsWith('application_')) return '/dashboard/customer/application-status';
  // No per-itinerary detail route exists (only my-itineraries/[id]/edit), so
  // itinerary events link to the itinerary list, which always resolves.
  if (type.startsWith('itinerary_')) return '/dashboard/customer/my-itineraries';
  if (type === 'new_booking') return '/dashboard/customer/earnings';
  return null;
}
