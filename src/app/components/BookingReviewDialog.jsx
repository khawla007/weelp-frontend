'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Edit } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const CustomerReviewForm = dynamic(() => import('@/app/components/Pages/DASHBOARD/user/_rsc_pages/reviews/forms/CustomerReviewForm'), {
  ssr: false,
});

const BookingReviewDialog = ({ booking = {}, onSaved }) => {
  const [open, setOpen] = useState(false);
  const hasReview = Boolean(booking.review);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {hasReview ? (
          <Button type="button" variant="outline" size="icon" className="size-9 shrink-0" aria-label="Edit review">
            <Edit size={16} />
          </Button>
        ) : (
          <Button type="button" className="h-9 shrink-0 border border-weelp-sage-deep bg-weelp-sage-deep px-3 text-sm text-white hover:bg-background hover:text-foreground">
            Add Review
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="sr-only">{hasReview ? 'Edit review' : 'Add review'}</DialogTitle>
          <DialogDescription className="sr-only">Share or update your review for this booking.</DialogDescription>
        </DialogHeader>
        <CustomerReviewForm reviewData={booking} onClose={setOpen} onSaved={onSaved} />
      </DialogContent>
    </Dialog>
  );
};

export default BookingReviewDialog;
