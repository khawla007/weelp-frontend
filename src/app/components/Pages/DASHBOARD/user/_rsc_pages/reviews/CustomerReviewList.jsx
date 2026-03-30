'use client';

import React from 'react';
import { UserDashboardReviewCard } from '@/app/components/ReviewCard';
import { deleteReviewCustomer } from '@/lib/actions/customer/reviews';
import { useToast } from '@/hooks/use-toast';

export const CustomerReviewList = ({ reviews = [], mutate }) => {
  const { toast } = useToast();

  const handleOnDelete = async (id) => {
    // deleteReviewCustomer
    try {
      // 1. Guard clause: make sure reviewId is provided
      if (!id) {
        toast({
          title: 'Invalid operation',
          description: 'Review ID is missing',
          variant: 'destructive',
        });
        return;
      }

      const result = await deleteReviewCustomer(id); // action to call

      //  Handle success
      if (result.status === 200) {
        toast({
          title: result?.data?.message || 'The review has been successfully deleted.',
          variant: 'default',
        });

        // Refresh the reviews list
        if (mutate) {
          mutate();
        }

        return;
      }

      toast({
        title: 'Failed to delete review',
        variant: 'destructive',
      });
    } catch (error) {
      toast({
        title: 'Unexpected Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-wrap  bg-[#F5F9FA] gap-4">
      {reviews.length > 0 ? (
        reviews.map((review, index) => {
          return <UserDashboardReviewCard key={review.id || index} review={review} onDelete={handleOnDelete} />;
        })
      ) : (
        <div className="w-full flex items-center justify-center py-12">
          <p className="text-gray-500 text-lg">No reviews found. Start reviewing your bookings!</p>
        </div>
      )}
    </div>
  );
};
