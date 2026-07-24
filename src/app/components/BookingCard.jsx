'use client';
import React, { useState } from 'react';
import { Edit, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import dynamic from 'next/dynamic';

const ReviewForm = dynamic(() => import('@/app/components/Pages/DASHBOARD/user/_rsc_pages/reviews/forms/CustomerReviewForm'), { ssr: false }); // lazy load form

const BookingCard = ({ bookingItem = {} }) => {
  const [open, setOpen] = useState(false); // For Control Dialog
  const { id, travel_date, item, review } = bookingItem;
  const name = item?.name || item?.item_name || 'Booking';
  const city = item?.city || '';
  const rating = review?.rating ?? 0;

  return (
    <Card className="bg-card text-card-foreground rounded-lg p-3 flex w-full min-w-0 flex-col gap-3 shadow-md sm:p-4">
      <CardHeader className="flex flex-col gap-2 p-0 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <CardTitle className="min-w-0 break-words text-lg font-semibold leading-snug text-foreground sm:text-xl">{name}</CardTitle>
        <span className="text-sm font-normal text-foreground sm:text-right sm:text-base">{travel_date}</span>
        <span className="min-w-0 break-words text-sm font-normal text-weelp-steel sm:text-base">{city}</span>

        <span className="text-sm font-medium text-muted-foreground opacity-70 sm:text-right sm:text-base">Booking ID: {id}</span>
      </CardHeader>
      <CardContent className="rounded-md border border-border/70 bg-muted/30 p-3">
        <div className="flex flex-col gap-3">
          {/* Reviews */}
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <CardTitle className="text-sm font-semibold text-foreground sm:text-base">Your Review</CardTitle>
              {rating !== 0 ? (
                <ul className="flex shrink-0 gap-0.5" aria-label={`${rating} out of 5 stars`}>
                  {Array.from({ length: rating }, (star, index) => (
                    <li key={index}>
                      <Star className="size-4 fill-yellow-300 text-yellow-300 sm:size-5" />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No review added yet.</p>
              )}
            </div>

            {/* Controlled Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                {rating === 0 ? (
                  <Button className="h-9 shrink-0 border border-weelp-sage-deep bg-weelp-sage-deep px-3 text-sm text-white hover:bg-background hover:text-foreground" onClick={() => setOpen(true)}>
                    Add Review
                  </Button>
                ) : (
                  <Button variant="outline" size="icon" className="size-9 shrink-0" onClick={() => setOpen(true)} aria-label="Edit review">
                    <Edit size={16} />
                  </Button>
                )}
              </DialogTrigger>

              <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="sr-only">Create/Edit Review</DialogTitle>
                  <DialogDescription className="sr-only">Update your review and click save when you &apos; re done.</DialogDescription>

                  {/* Review Form */}
                  <ReviewForm reviewData={bookingItem} onClose={setOpen} />
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>

      <div className="flex items-center justify-between gap-3">
        <Image
          src="/assets/Review.png"
          alt="Review"
          width={400} // intrinsic width of the image
          height={400} // intrinsic height of the image
          className="hidden h-auto w-10 sm:block sm:w-12"
        />
        <Button className="ml-auto w-full bg-weelp-sage-deep text-sm font-normal hover:bg-weelp-sage-deep dark:hover:bg-weelp-sage-deep dark:hover:text-white sm:w-auto sm:text-base">
          View Booking
        </Button>
      </div>
    </Card>
  );
};

export default BookingCard;
