'use client';

import React from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';

import BookingReviewDialog from '@/app/components/BookingReviewDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const BOOKING_STATUS_CLASSES = {
  pending: 'border-warning/40 bg-warning/15 text-foreground',
  processing: 'border-info/40 bg-info/15 text-foreground',
  completed: 'border-success/40 bg-success/15 text-foreground',
  cancelled: 'border-destructive/40 bg-destructive/10 text-foreground',
  refunded: 'border-violet-300 bg-violet-100 text-foreground dark:border-violet-700 dark:bg-violet-950/50',
};

const UNKNOWN_STATUS_CLASSES = 'border-border bg-muted text-muted-foreground';
const STATUS_SEPARATOR_PATTERN = /[_\s-]+/;

function normalizeBookingStatus(status) {
  return typeof status === 'string' ? status.trim().toLowerCase() : '';
}

function formatBookingStatus(status) {
  return status
    .split(STATUS_SEPARATOR_PATTERN)
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ');
}

const BookingCard = ({ bookingItem = {}, onReviewSaved, onViewBooking }) => {
  const { id, travel_date, item, review, status } = bookingItem;
  const name = item?.name || item?.item_name || 'Booking';
  const city = item?.city || '';
  const rating = review?.rating ?? 0;
  const canViewBooking = typeof onViewBooking === 'function' && id !== undefined && id !== null;
  const normalizedStatus = normalizeBookingStatus(status);
  const statusLabel = normalizedStatus ? formatBookingStatus(normalizedStatus) : '';
  const statusClasses = Object.hasOwn(BOOKING_STATUS_CLASSES, normalizedStatus) ? BOOKING_STATUS_CLASSES[normalizedStatus] : UNKNOWN_STATUS_CLASSES;

  return (
    <Card className="bg-card text-card-foreground rounded-lg p-3 flex w-full min-w-0 flex-col gap-3 shadow-md sm:p-4">
      <CardHeader className="flex flex-col gap-2 p-0 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <CardTitle className="min-w-0 break-words text-lg font-semibold leading-snug text-foreground sm:text-xl">{name}</CardTitle>
        <span className="text-sm font-normal text-foreground sm:text-right sm:text-base">{travel_date}</span>
        <span className="min-w-0 break-words text-sm font-normal text-weelp-steel sm:text-base">{city}</span>
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:justify-end">
          <span className="text-sm font-medium text-muted-foreground opacity-70 sm:text-base">Booking ID: {id}</span>
          {statusLabel ? (
            <Badge variant="outline" data-testid="booking-status-badge" className={statusClasses}>
              {statusLabel}
            </Badge>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="rounded-md border border-border/70 bg-muted/30 p-3">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-sm font-semibold text-foreground sm:text-base">Your Review</CardTitle>
            {rating !== 0 ? (
              <ul className="flex shrink-0 gap-0.5" aria-label={`${rating} out of 5 stars`}>
                {Array.from({ length: rating }, (_, index) => (
                  <li key={index}>
                    <Star className="size-4 fill-yellow-300 text-yellow-300 sm:size-5" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No review added yet.</p>
            )}
          </div>

          <BookingReviewDialog booking={bookingItem} onSaved={onReviewSaved} />
        </div>
      </CardContent>

      <div className="flex items-center justify-between gap-3">
        <Image src="/assets/Review.png" alt="" width={400} height={400} className="hidden h-auto w-10 sm:block sm:w-12" />
        <Button
          type="button"
          disabled={!canViewBooking}
          onClick={() => onViewBooking?.(id)}
          className="ml-auto w-full bg-weelp-sage-deep text-sm font-normal hover:bg-weelp-sage-deep dark:hover:bg-weelp-sage-deep dark:hover:text-white sm:w-auto sm:text-base"
        >
          View Booking
        </Button>
      </div>
    </Card>
  );
};

export default BookingCard;
