'use client';

import React from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserDashboardReviewCard } from '@/app/components/ReviewCard';
import { deleteReviewCustomer } from '@/lib/actions/customer/reviews';
import { useToast } from '@/hooks/use-toast';

export const CustomerReviewList = ({ reviews = [] }) => {
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
    <Card className="shadow-none border-none bg-inherit  bg-white">
      <CardHeader className={'px-8'}>
        <CardTitle className="text-xl text-Blueish font-medium">Your Reviews</CardTitle>
        <CardDescription className="text-lg text-grayDark">Manage your Reviews, Create New.</CardDescription>
      </CardHeader>
      <div className="bg-[#f5f9fa] p-8 min-h-full h-[78vh]">
        <div className="flex flex-wrap  bg-[#F5F9FA] gap-4">
          {reviews.map((review, index) => {
            return <UserDashboardReviewCard key={index} review={review} onDelete={handleOnDelete} />;
          })}
        </div>
      </div>
      {/* 
      </Tabs> */}
    </Card>
  );
};
