'use client';

import React, { useState, useCallback } from 'react';
import { CustomerReviewList } from '@/app/components/Pages/DASHBOARD/user/_rsc_pages/reviews/CustomerReviewList';
import useAllReviewsCustomer from '@/hooks/api/customer/reviews';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Pagination from '@/app/components/ui/Pagination';

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
      <Card className="shadow-none border-none bg-inherit bg-white">
        <CardHeader className={'px-8'}>
          <CardTitle className="text-xl text-Blueish font-medium">Your Reviews</CardTitle>
          <CardDescription className="text-lg text-grayDark">See your reviews, thoughts.</CardDescription>
        </CardHeader>
        <div className="bg-[#f5f9fa] p-8 min-h-screen flex items-center justify-center">
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
          <CardDescription className="text-lg text-grayDark">See your reviews, thoughts.</CardDescription>
        </CardHeader>
        <div className="bg-[#f5f9fa] p-8 min-h-screen flex items-center justify-center">
          <p className="text-red-500">Failed to load reviews. Please try again.</p>
        </div>
      </Card>
    );
  }

  // Success state - pass reviews to child component
  return (
    <Card className="shadow-none border-none bg-inherit bg-white">
      <CardHeader className={'px-8'}>
        <CardTitle className="text-xl text-Blueish font-medium">Your Reviews</CardTitle>
        <CardDescription className="text-lg text-grayDark">Manage your Reviews, Create New.</CardDescription>
      </CardHeader>
      <div className="bg-[#f5f9fa] p-8 min-h-screen pb-20">
        <div className="flex flex-col bg-[#F5F9FA] gap-4">
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
