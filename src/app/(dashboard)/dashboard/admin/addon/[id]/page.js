'use client';

import { authFetcher } from '@/lib/fetchers';
import { FormSkeleton } from '@/app/components/Animation/Cards';
import useSWR from 'swr';
import { useParams } from 'next/navigation';
import { AddOnForm } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/addons/forms/AddOnForm';
import { Card } from '@/components/ui/card';

export default function SingleAddOnPage() {
  const { id } = useParams();
  const { data, error, isLoading } = useSWR(`/api/admin/addons/${id}`, authFetcher);

  if (isLoading) return <FormSkeleton />;
  if (error) return <p className="text-destructive">Error loading add-on</p>;
  if (!data?.success) return <p className="text-destructive">Add-on not found</p>;

  return (
    <Card className="border-none shadow-none bg-inherit p-6">
      <AddOnForm formData={data?.data || {}} />
    </Card>
  );
}
