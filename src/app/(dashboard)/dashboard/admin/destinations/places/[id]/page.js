import React from 'react';
import { notFound } from 'next/navigation';
import { isEmpty } from 'lodash';
import { getSinglePlaceAdmin } from '@/lib/services/places';
import CreatePlaceForm from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/destinations/destinations_forms/CreatePlaceForm';

const EditPlacePage = async ({ params }) => {
  const { id } = params;

  const placeData = await getSinglePlaceAdmin(id); // dynamic id

  // placeData
  if (isEmpty(placeData)) {
    return notFound();
  }

  return <CreatePlaceForm apiFormData={placeData} />;
};

export default EditPlacePage;