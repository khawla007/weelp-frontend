'use client';

// WordPress-style placeholder: light gray background with image icon
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='350' height='300' viewBox='0 0 350 300'%3E%3Crect width='350' height='300' fill='%23f0f0f0'/%3E%3Cg transform='translate(175,150)' fill='none' stroke='%23a0a0a0' stroke-width='2'%3E%3Crect x='-30' y='-25' width='60' height='50' rx='4'/%3E%3Ccircle cx='-14' cy='-10' r='6'/%3E%3Cpath d='-26 21 L-10 5 L0 15 L10 3 L26 21' stroke-linejoin='round'/%3E%3C/g%3E%3C/svg%3E";

/**
 * CardImage - Generic image component with fallback for dashboard cards
 *
 * Used by both ListingCard and RouteCard for displaying images with consistent fallback behavior.
 *
 * @param {string} src - Image URL
 * @param {string} alt - Alt text for accessibility
 * @param {string} className - Additional classes (e.g., 'w-full h-40' for RouteCard, 'w-[326px] h-[183px]' for ListingCard)
 * @param {string} fallback - Fallback image URL (default: WordPress-style placeholder)
 */
export function CardImage({ src, alt = 'item image', className = 'w-full h-40 object-cover', fallback = PLACEHOLDER_IMAGE }) {
  return <img className={className} src={src || fallback} alt={alt} />;
}
