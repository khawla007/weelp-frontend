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
      className={`group rounded-lg w-full border relative overflow-hidden transform-gpu will-change-transform [backface-visibility:hidden] transition-[transform,box-shadow] duration-150 ease-out hover:-translate-y-0.5 hover:shadow-md focus-within:-translate-y-0.5 focus-within:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:focus-within:translate-y-0 ${className}`}
      {...props}
    >
      {children}
    </Card>
  );
}
