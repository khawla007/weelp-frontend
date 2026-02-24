import React from 'react';
import { notFound } from 'next/navigation';
import { isEmpty } from 'lodash';
import { getSingleRegionAdmin } from '@/lib/services/region';
import { CreateRegionForm } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/destinations/destinations_forms/CreateRegionForm';

const EditRegionPage = async ({ params }) => {
  const { id } = params;

  const regionData = await getSingleRegionAdmin(id);

  if (isEmpty(regionData) || !regionData?.success) {
    return notFound();
  }

  return <CreateRegionForm apiFormData={regionData?.data || {}} />;
};

export default EditRegionPage;
