'use client';

import { CardBadge } from '../Card/CardBadge';

/**
 * ListingCardBadge - Featured badge slot for listing cards
 *
 * Wraps shared CardBadge component.
 * Preserves 'featured' as default type (CardBadge defaults to 'custom').
 *
 * @param {string} type - Badge type (default: 'featured')
 * @param {string} label - Badge label (for non-featured types)
 * @param {string} className - Additional classes
 */
export function ListingCardBadge({ type = 'featured', ...props }) {
  return <CardBadge type={type} {...props} />;
}
