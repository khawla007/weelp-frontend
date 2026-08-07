'use client';

import React, { useState, useCallback } from 'react';
import { CustomerReviewList } from '@/app/components/Pages/DASHBOARD/user/_rsc_pages/reviews/CustomerReviewList';
import useAllReviewsCustomer from '@/hooks/api/customer/reviews';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Pagination from '@/app/components/ui/Pagination';
import ReviewCardSkeleton from '@/app/components/ReviewCardSkeleton';

const REVIEW_SKELETON_SLOTS = Array.from({ length: 6 }, (_, index) => index);

const ReviewsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, error, mutate } = useAllReviewsCustomer(currentPage);

  // Extract reviews and pagination from data
  const reviews = data?.reviews || [];
  const pagination = data?.pagination || { total: 0, per_page: 6, current_page: 1, last_page: 1 };
  const totalPages = pagination.last_page;

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <Card className="shadow-none border-none bg-inherit bg-background">
        <CardHeader className="px-4 md:px-6 xl:px-8">
          <CardTitle className="text-xl text-foreground font-semibold">Your Reviews</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">Manage your Reviews, Create New.</CardDescription>
        </CardHeader>
        <div className="bg-weelp-sage-wash p-4 md:p-6 lg:min-h-screen xl:p-8">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
            {REVIEW_SKELETON_SLOTS.map((slot) => (
              <ReviewCardSkeleton key={slot} />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="shadow-none border-none bg-inherit bg-background">
        <CardHeader className={'px-8'}>
          <CardTitle className="text-xl text-foreground font-semibold">Your Reviews</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">See your reviews, thoughts.</CardDescription>
        </CardHeader>
        <div className="bg-weelp-sage-wash p-8 min-h-[320px] flex items-center justify-center">
          <p className="text-destructive">Failed to load reviews. Please try again.</p>
        </div>
      </Card>
    );
  }

  // Success state - pass reviews to child component
  return (
    <Card className="shadow-none border-none bg-inherit bg-background">
      <CardHeader className="px-4 md:px-6 xl:px-8">
        <CardTitle className="text-xl text-foreground font-semibold">Your Reviews</CardTitle>
        <CardDescription className="text-lg text-muted-foreground">Manage your Reviews, Create New.</CardDescription>
      </CardHeader>
      <div className="bg-weelp-sage-wash p-4 md:p-6 lg:min-h-screen xl:p-8">
        <div className="flex flex-col bg-weelp-sage-wash gap-4">
          <CustomerReviewList reviews={reviews} mutate={mutate} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination currentPage={pagination.current_page} totalPages={totalPages} onPageChange={handlePageChange} align="center" />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ReviewsPage;
