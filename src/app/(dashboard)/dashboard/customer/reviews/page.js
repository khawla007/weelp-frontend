import React from 'react';
import { CustomerReviewList } from '@/app/components/Pages/DASHBOARD/user/_rsc_pages/reviews/CustomerReviewList';
import { getAllReviewsByCustomer } from '@/lib/services/customer/reviews';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
const ReviewsPage = async () => {
  const { data, status, message = '' } = await getAllReviewsByCustomer();
  const { reviews = [] } = data;

  // for 404
  if (status === 404) {
    notFound();
  }

  // for 500
  if (!status === 200) {
    return <div className="text-red-500">{message}</div>;
  }

  return <CustomerReviewList reviews={reviews} />;
};

export default ReviewsPage;
