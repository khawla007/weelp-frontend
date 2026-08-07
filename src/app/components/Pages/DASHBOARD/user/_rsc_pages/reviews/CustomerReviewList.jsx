'use client';

import React, { useState } from 'react';
import { UserDashboardReviewCard } from '@/app/components/ReviewCard';
import { deleteReviewCustomer } from '@/lib/actions/customer/reviews';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const CustomerReviewList = ({ reviews = [], mutate }) => {
  const { toast } = useToast();
  const [reviewIdToDelete, setReviewIdToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    try {
      if (!reviewIdToDelete) {
        toast({
          title: 'Invalid operation',
          description: 'Review ID is missing',
          variant: 'destructive',
        });
        return;
      }

      setIsDeleting(true);
      const result = await deleteReviewCustomer(reviewIdToDelete);

      if (result?.status === 200) {
        toast({
          title: result?.data?.message || 'The review has been successfully deleted.',
          variant: 'default',
        });

        void mutate?.();
        setReviewIdToDelete(null);

        return;
      }

      toast({
        title: 'Failed to delete review',
        variant: 'destructive',
      });
    } catch (error) {
      toast({
        title: 'Unexpected Error',
        description: error?.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 bg-weelp-sage-wash xl:grid-cols-2 2xl:grid-cols-3">
        {reviews.length > 0 ? (
          reviews.map((review, index) => {
            return <UserDashboardReviewCard key={review.id || index} review={review} onDelete={setReviewIdToDelete} />;
          })
        ) : (
          <div className="w-full flex items-center justify-center py-12">
            <p className="text-muted-foreground text-lg">No reviews found. Start reviewing your bookings!</p>
          </div>
        )}
      </div>

      <AlertDialog
        open={reviewIdToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setReviewIdToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this review?</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to remove this review? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();
                void handleConfirmDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 dark:bg-primary dark:text-background dark:hover:bg-primary/90"
            >
              {isDeleting ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
