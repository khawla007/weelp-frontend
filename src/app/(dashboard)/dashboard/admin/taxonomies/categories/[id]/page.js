import React from 'react';
import { getSingleCategoryAdmin } from '@/lib/services/categories';
import { isEmpty } from 'lodash';
import { notFound } from 'next/navigation';
import { EditCategoryForm } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/taxonomies/category/editcategory';

const EditCategory = async ({ params }) => {
  const { id } = await params;

  const data = await getSingleCategoryAdmin(id); // get category

  // if category data is empty or not found
  if (isEmpty(data)) {
    notFound();
  }

  return <EditCategoryForm categoryData={data} />;
};

export default EditCategory;
