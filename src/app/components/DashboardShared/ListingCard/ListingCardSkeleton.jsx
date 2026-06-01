'use client';

import { Skeleton } from '@/components/ui/skeleton';

// Matches the itinerary/activity/transfer listing index grid. Override via `gridClassName`
// to mirror a different grid (e.g. destination filters use 4 cols, vendor filters use 3).
const DEFAULT_GRID = 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3';

/**
 * ListingCardSkeleton - Placeholder grid shown while listing data loads/paginates.
 *
 * Mirrors the real ListingCard shape (fixed-height image, title, meta lines, stats row)
 * so the layout doesn't shift when data arrives. Used instead of a spinner on the
 * itinerary/activity/transfer index pages, especially for pagination page changes.
 *
 * Pass `gridClassName` (the exact Tailwind `grid-cols-*` classes of the real grid) when
 * the destination grid differs from the listing index default, so the skeleton lines up
 * with the loaded layout — e.g. destination filters use
 * `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`.
 *
 * @param {number} count - How many placeholder cards to render (default 6).
 * @param {string} gridClassName - Tailwind grid-cols classes to match the real grid.
 * @param {string} className - Additional classes for the grid wrapper.
 */
export function ListingCardSkeleton({ count = 6, gridClassName = DEFAULT_GRID, className = '' }) {
  return (
    <div className={`grid ${gridClassName} gap-4 ${className}`} aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-lg w-full border overflow-hidden bg-white">
          {/* Image */}
          <Skeleton className="w-full h-[183px] rounded-none" />

          {/* Content mirrors ListingCardContent (p-4 space-y-2) */}
          <div className="p-4 space-y-2">
            {/* Title row */}
            <Skeleton className="h-5 w-3/4" />

            {/* Meta lines */}
            <Skeleton className="h-4 w-1/3" />

            {/* Stats row */}
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
