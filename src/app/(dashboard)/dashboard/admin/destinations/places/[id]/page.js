'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import useSWR from 'swr';
import CreatePlaceForm from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/destinations/destinations_forms/CreatePlaceForm';
import { PageLoader } from '@/app/components/Loading/PageLoader';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { fetcher } from '@/lib/fetchers';

const EditPlacePage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  // Use fetcher (not authFetcher) - goes through Next.js API route which handles auth
  const { data: placeData, error, isLoading } = useSWR(id ? `/api/admin/destinations/places/${id}` : null, fetcher);

  if (isLoading || !id) {
    return <PageLoader />;
  }

  // Show error state only if we have an ID and loading finished but data is invalid
  const isEmptyData = !placeData || Object.keys(placeData).length === 0;
  if (error || isEmptyData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4 max-w-md">
          <div className="flex justify-center">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold">Place Not Found</h2>
          <p className="text-muted-foreground">{error ? error.message : 'The place you are looking for does not exist or could not be loaded.'}</p>
          <Button onClick={() => router.push('/dashboard/admin/destinations/places')}>Back to Places</Button>
        </div>
      </div>
    );
  }

  return <CreatePlaceForm apiFormData={placeData} />;
};

export default EditPlacePage;
