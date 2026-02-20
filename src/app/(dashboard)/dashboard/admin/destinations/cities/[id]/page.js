import React from 'react';
import { notFound } from 'next/navigation';
import { isEmpty } from 'lodash';
import { getSingleCityAdmin } from '@/lib/services/cities';
import CreateCityForm from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/destinations/destinations_forms/CreateCityForm';

const EditCitiesPage = async ({ params }) => {
  const { id } = await params;

  const cityData = await getSingleCityAdmin(id); //dyanmic id

  // cityData
  if (isEmpty(cityData)) {
    return notFound();
  }

  return <CreateCityForm apiFormData={cityData} />;
};

export default EditCitiesPage;
