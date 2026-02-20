import React from 'react';
import { isEmpty } from 'lodash';
import { notFound } from 'next/navigation';
import { getSingleAttributeAdmin } from '@/lib/services/attributes';
import { EditAttributePageForm } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/taxonomies/attributes/editattribute';

const EditAttribute = async ({ params }) => {
  const { id } = await params;

  const data = await getSingleAttributeAdmin(id); // get category

  // if category data is empty or not found
  if (isEmpty(data)) {
    notFound();
  }

  return <EditAttributePageForm attributeData={data} />;
};

export default EditAttribute;
