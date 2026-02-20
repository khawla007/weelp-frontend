'use client';

import React from 'react';
import { isEmpty } from 'lodash';
import { notFound, useParams } from 'next/navigation';
import useSWR from 'swr';
import { AddOnForm } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/addons/forms/AddOnForm';
import { fetcher } from '@/lib/fetchers';

const EditAddOn = () => {
  const { id } = useParams();

  const { data, error, isLoading } = useSWR(`/api/admin/addons/${id}`, fetcher); // get data through api

  // Handle Data Cases
  if (error) return <p className="text-red-400">Something went wrong</p>;
  if (isLoading) return <span className="loader"></span>;

  const { success = false, data: addOnData = {} } = data;

  if (!success && isEmpty(addOnData)) {
    notFound();
  }
  return <AddOnForm formData={addOnData} />;
};

export default EditAddOn;
