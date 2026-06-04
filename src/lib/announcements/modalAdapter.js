// Adapt a site-wide announcement into the shape NotificationDetailModal renders.
// Announcements carry no per-user read state, so the adapted object only includes
// what the modal displays (title, message, time, images, coupon, CTA target).

// A row opens the modal when it is popup-tier OR carries a coupon (so an inline
// coupon's Copy-code is still reachable). Plain inline rows keep navigating.
export function opensModal(a) {
  return a?.display_style === 'popup' || Boolean(a?.coupon_code);
}

export function announcementToModalNotif(a) {
  const data = {};
  if (a?.image_url) data.images = [a.image_url];
  if (a?.coupon_code) data.coupon_code = a.coupon_code;
  return {
    title: a?.title,
    message: a?.message,
    created_at: a?.created_at,
    // link drives the modal's "View details" CTA via resolveNotificationCta.
    action_url: a?.link || null,
    data: Object.keys(data).length ? data : null,
  };
}
