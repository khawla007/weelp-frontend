import React from 'react';
import { isEmpty } from 'lodash';
import { notFound } from 'next/navigation';
import { EditTageForm } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/taxonomies/tags/edittag';
import { getSingleTagAdmin } from '@/lib/services/tags';

const EditTag = async ({ params }) => {
  const { id } = await params;

  const data = await getSingleTagAdmin(id); // get category

  // if category data is empty or not found
  if (isEmpty(data)) {
    notFound();
  }

  return <EditTageForm tagdata={data} />;
};

export default EditTag;
