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

// Resolves the CTA for a notification. Cancellation targets use a strict,
// role-aware allowlist; other types retain the scheme-safe explicit/derived
// behavior. Returns { href, external } or null. Pure.
export function resolveNotificationCta(notif, role) {
  if (!notif) return null;
  const explicit = notif.action_url;
  const cancellationRequestId = notif.data?.cancellation_request_id;

  if (Number.isInteger(cancellationRequestId) && cancellationRequestId > 0) {
    if (typeof explicit !== 'string') return null;
    const expectedPath = role === 'admin' || role === 'super_admin' ? '/dashboard/admin/orders' : role === 'customer' ? '/dashboard/customer' : null;
    if (!expectedPath) return null;
    const match = explicit.match(/^([^?#]+)\?order=([1-9]\d*)$/);
    if (!match || match[1] !== expectedPath) return null;
    return { href: explicit, external: false };
  }

  if (typeof explicit === 'string' && !explicit.includes('\\') && SAFE_URL.test(explicit)) {
    return { href: explicit, external: !explicit.startsWith('/') };
  }
  const derived = notificationLink(notif.type);
  return derived ? { href: derived, external: false } : null;
}
