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

const SAFE_URL = /^(\/(?!\/)|https?:\/\/)/i;

// Resolves the CTA for a notification: an explicit, scheme-safe action_url wins
// (external when it isn't an internal path); otherwise fall back to the derived
// per-type route. Returns { href, external } or null. Pure.
export function resolveNotificationCta(notif) {
  if (!notif) return null;
  const explicit = notif.action_url;
  if (typeof explicit === 'string' && SAFE_URL.test(explicit)) {
    return { href: explicit, external: !explicit.startsWith('/') };
  }
  const derived = notificationLink(notif.type);
  return derived ? { href: derived, external: false } : null;
}
