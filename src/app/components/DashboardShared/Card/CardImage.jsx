'use client';

/**
 * CardImage - Generic image component with fallback for dashboard cards
 *
 * Used by both ListingCard and RouteCard for displaying images with consistent fallback behavior.
 *
 * @param {string} src - Image URL
 * @param {string} alt - Alt text for accessibility
 * @param {string} className - Additional classes (e.g., 'w-full h-40' for RouteCard, 'w-[326px] h-[183px]' for ListingCard)
 * @param {string} fallback - Fallback image URL (default: picsum placeholder)
 */
export function CardImage({
  src,
  alt = 'item image',
  className = 'w-full h-40 object-cover',
  fallback = 'https://picsum.photos/350/300?random',
}) {
  return (
    <img
      className={className}
      src={src || fallback}
      alt={alt}
    />
  );
}
