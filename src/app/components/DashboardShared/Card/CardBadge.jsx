'use client';

import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/**
 * CardBadge - Generic badge component for dashboard cards
 *
 * Supports multiple badge types:
 * - 'featured': Featured badge with star icon (top-right positioning)
 * - 'location': Location badge (Region, Country, State, City)
 * - 'custom': Custom badge with provided label
 *
 * @param {string} type - Badge type ('featured', 'location', 'custom')
 * @param {string} label - Badge label (for 'location' and 'custom' types)
 * @param {string} className - Additional classes
 * @param {string} icon - Optional icon name (for future extensions)
 */
export function CardBadge({ type = 'custom', label = '', className = '', icon }) {
  // Featured badge - top-right with star icon
  if (type === 'featured') {
    return (
      <>
        <div className={`absolute top-4 left-4 z-10 bg-weelp-sage-deep text-white text-xs px-2 py-1 rounded-md font-medium ${className}`}>Featured</div>
        <Star size={24} fill="currentColor" strokeWidth={2} className="absolute top-4 right-4 z-10 text-weelp-sage-deep drop-shadow-[0_2px_4px_rgba(86,143,124,0.3)]" />
      </>
    );
  }

  // Location badge - inline (used in RouteCard)
  if (type === 'location') {
    return <Badge className={`bg-weelp-sage-deep text-white hover:bg-weelp-sage-hover ${className}`}>{label}</Badge>;
  }

  // Custom badge
  if (type === 'custom' && label) {
    return <Badge className={`bg-weelp-sage-deep text-white hover:bg-weelp-sage-hover ${className}`}>{label}</Badge>;
  }

  return null;
}
