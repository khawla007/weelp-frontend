'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const BookingCardSkeleton = () => {
  return (
    <Card aria-hidden="true" data-testid="booking-card-skeleton" className="flex w-full min-w-0 flex-col gap-3 rounded-lg bg-card p-3 shadow-md sm:p-4">
      <CardHeader data-testid="booking-card-skeleton-header" className="flex flex-col gap-2 p-0 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <Skeleton className="h-6 w-3/4 sm:h-7" />
        <Skeleton className="h-5 w-20 sm:h-6" />
        <Skeleton className="h-5 w-1/2 sm:h-6" />
        <Skeleton className="h-5 w-24 sm:h-6" />
      </CardHeader>

      <CardContent data-testid="booking-card-skeleton-review" className="rounded-md border border-border/70 bg-muted/30 p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <Skeleton className="h-5 w-24 sm:h-6" />
            <Skeleton className="h-4 w-36 max-w-full sm:h-5" />
          </div>
          <Skeleton className="h-9 w-24 shrink-0" />
        </div>
      </CardContent>

      <div data-testid="booking-card-skeleton-footer" className="flex h-10 items-center justify-between gap-3 sm:h-12">
        <Skeleton className="hidden size-10 rounded-md sm:block sm:size-12" />
        <Skeleton className="ml-auto h-10 w-full sm:w-32" />
      </div>
    </Card>
  );
};

export default BookingCardSkeleton;
