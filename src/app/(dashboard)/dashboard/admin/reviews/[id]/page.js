'use client';

import { authFetcher } from '@/lib/fetchers';
import useSWR from 'swr';
import { useParams } from 'next/navigation';
import ReviewForm from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/reviews/forms/ReviewForm';
import { Card } from '@/components/ui/card';

export default function SingleReviewPage() {
  const { id } = useParams();
  const { data, error, isLoading } = useSWR(`/api/admin/reviews/${id}`, authFetcher);

  if (isLoading) return <p className="loader"></p>;
  if (error) return <p className="text-red-400">Error loading review</p>;
  if (!data?.success) return <p className="text-red-400">Review not found</p>;

  return (
    <Card className="border-none shadow-none bg-inherit p-6">
      <ReviewForm reviewData={data?.data || {}} id={id} />
    </Card>
  );
}
