'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import useSWR from 'swr';
import { AlertCircle } from 'lucide-react';
import { authFetcher } from '@/lib/fetchers';
import { Button } from '@/components/ui/button';
import { CreateRegionForm } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/destinations/destinations_forms/CreateRegionForm';

const EditRegionPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const { data, error, isLoading } = useSWR(id ? `/api/admin/regions/${id}` : null, authFetcher);

  if (isLoading || !id) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading region data...</div>
      </div>
    );
  }

  if (error || !data || !data?.success) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4 max-w-md">
          <div className="flex justify-center">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold">Region Not Found</h2>
          <p className="text-muted-foreground">{error ? error.message : 'The region you are looking for does not exist or could not be loaded.'}</p>
          <Button onClick={() => router.push('/dashboard/admin/destinations/regions')}>Back to Regions</Button>
        </div>
      </div>
    );
  }

  return <CreateRegionForm apiFormData={data?.data || {}} />;
};

export default EditRegionPage;
