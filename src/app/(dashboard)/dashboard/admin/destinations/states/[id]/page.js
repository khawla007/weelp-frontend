import React from 'react';
import { notFound } from 'next/navigation';
import { isEmpty } from 'lodash';
import { getSingleStateAdmin } from '@/lib/services/state';
// import CreateCountryForm from "@/app/components/Pages/DASHBOARD/admin/_rsc_pages/destinations/destinations_forms/CreateCountryForm";
import CreateStateForm from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/destinations/destinations_forms/CreateStateForm';

const EditCountryPage = async ({ params }) => {
  const { id } = await params;

  const stateData = await getSingleStateAdmin(id); //dyanmic id

  // stateData
  if (isEmpty(stateData)) {
    return notFound();
  }

  return <CreateStateForm apiFormData={stateData} />;
};

export default EditCountryPage;
