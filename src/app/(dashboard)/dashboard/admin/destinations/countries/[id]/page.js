import React from 'react';
import { notFound } from 'next/navigation';
import { isEmpty } from 'lodash';
import { getSingleCountryAdmin } from '@/lib/services/country';
import CreateCountryForm from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/destinations/destinations_forms/CreateCountryForm';

const EditCountryPage = async ({ params }) => {
  const { id } = await params;

  const countryData = await getSingleCountryAdmin(id); //dyanmic id

  // countryData
  if (isEmpty(countryData)) {
    return notFound();
  }

  return <CreateCountryForm apiFormData={countryData} />;
};

export default EditCountryPage;
