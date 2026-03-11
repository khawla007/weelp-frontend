'use client';

import { authFetcher } from '@/lib/fetchers';
import useSWR from 'swr';
import { useParams } from 'next/navigation';
import { AddOnForm } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/addons/forms/AddOnForm';
import { Card } from '@/components/ui/card';

export default function SingleAddOnPage() {
  const { id } = useParams();
  const { data, error, isLoading } = useSWR(`/api/admin/addons/${id}`, authFetcher);

  if (isLoading) return <p className="loader"></p>;
  if (error) return <p className="text-red-400">Error loading add-on</p>;
  if (!data?.success) return <p className="text-red-400">Add-on not found</p>;

  return (
    <Card className="border-none shadow-none bg-inherit p-6">
      <AddOnForm formData={data?.data || {}} />
    </Card>
  );
}
