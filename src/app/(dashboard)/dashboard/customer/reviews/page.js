'use client';

import React from 'react';
import { CustomerReviewList } from '@/app/components/Pages/DASHBOARD/user/_rsc_pages/reviews/CustomerReviewList';
import useAllReviewsCustomer from '@/hooks/api/customer/reviews';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ReviewsPage = () => {
  const { data, isLoading, error, mutate } = useAllReviewsCustomer();

  // Extract reviews from data - data is already processed by the hook
  const reviews = data?.reviews || [];

  // Loading state
  if (isLoading) {
    return (
      <Card className="shadow-none border-none bg-inherit bg-white">
        <CardHeader className={'px-8'}>
          <CardTitle className="text-xl text-Blueish font-medium">Your Reviews</CardTitle>
          <CardDescription className="text-lg text-grayDark">Manage your Reviews, Create New.</CardDescription>
        </CardHeader>
        <div className="bg-[#f5f9fa] p-8 min-h-full h-[78vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-Blueish"></div>
        </div>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="shadow-none border-none bg-inherit bg-white">
        <CardHeader className={'px-8'}>
          <CardTitle className="text-xl text-Blueish font-medium">Your Reviews</CardTitle>
          <CardDescription className="text-lg text-grayDark">Manage your Reviews, Create New.</CardDescription>
        </CardHeader>
        <div className="bg-[#f5f9fa] p-8 min-h-full h-[78vh] flex items-center justify-center">
          <p className="text-red-500">Failed to load reviews. Please try again.</p>
        </div>
      </Card>
    );
  }

  // Success state - pass reviews to child component
  return <CustomerReviewList reviews={reviews} mutate={mutate} />;
};

export default ReviewsPage;
