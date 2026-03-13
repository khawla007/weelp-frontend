'use client';

import { Card } from '@/components/ui/card';

/**
 * ListingCard - Main wrapper for dashboard listing cards
 *
 * Provides consistent layout and styling across all entity types.
 * Uses compound component pattern for flexibility.
 *
 * @example
 * <ListingCard>
 *   <ListingCardImage src="..." />
 *   <ListingCardContent>...</ListingCardContent>
 * </ListingCard>
 */
export function ListingCard({ children, className = '', ...props }) {
  return (
    <Card
      className={`group hover:shadow-md rounded-lg w-full border relative overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </Card>
  );
}
