'use client';

import { fetcher } from '@/lib/fetchers';
import React from 'react';
import useSWR from 'swr';
import { notFound, useParams } from 'next/navigation';
import ReviewForm from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/reviews/forms/ReviewForm';

const SingleReviewPage = () => {
  const { id } = useParams();
  const { data, error, isLoading } = useSWR(`/api/admin/reviews/${id}`, fetcher); // get dynamic data

  if (isLoading) return <p className="loader"></p>;
  if (error) return <p className="text-red-400">Error loading review</p>;
  if (!data?.success) return notFound();

  return <ReviewForm reviewData={data?.data || {}} id={id} />;
};

export default SingleReviewPage;
