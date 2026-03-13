'use client';

import { CardImage } from '../Card/CardImage';

/**
 * ListingCardImage - Image slot for listing cards
 *
 * Wraps shared CardImage component with ListingCard-specific defaults.
 *
 * @param {string} src - Image URL
 * @param {string} alt - Alt text for accessibility (default: 'item image')
 * @param {string} className - Additional classes
 */
export function ListingCardImage({ src, alt = 'item image', className = '' }) {
  return (
    <CardImage
      src={src}
      alt={alt}
      className={`w-full h-[183px] rounded-t-lg rounded-b-none object-cover ${className}`}
      fallback="https://picsum.photos/350/300?random"
    />
  );
}
