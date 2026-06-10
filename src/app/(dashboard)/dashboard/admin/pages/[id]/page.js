'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetchers';
import { FormSkeleton } from '@/app/components/Animation/Cards';
import { NotFoundComponent } from '@/app/components/NotFound';
import { PageForm } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/pages/form/PageForm';

const EditPagePage = () => {
  const { id } = useParams();

  const { data, error, isLoading, mutate } = useSWR(id ? `/api/admin/pages/${id}` : null, fetcher, {
    revalidateOnMount: true,
    revalidateOnFocus: true,
    dedupingInterval: 0,
  });

  if (isLoading) {
    return <FormSkeleton />;
  }

  if (error) {
    return <p>Something went wrong: {error.message || 'Api Error'}</p>;
  }

  if (data?.success === false) {
    return <NotFoundComponent url="/dashboard/admin/pages/" />;
  }

  return <PageForm editPage={true} data={data?.data} mutate={mutate} />;
};

export default EditPagePage;
