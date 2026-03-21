import React from 'react';
import { getSingleUserAdmin } from '@/lib/services/users';
import { isEmpty } from 'lodash';
import { notFound } from 'next/navigation';
import EditUserForm from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/users/forms/EditUser';

const EditUserPage = async ({ params }) => {
  const { id } = await params; // await params in Next.js 16+

  const userData = await getSingleUserAdmin(id); // await async call

  // Show 404 if user not found
  if (isEmpty(userData)) {
    notFound();
  }

  const { user } = userData;
  return <EditUserForm userData={user} />;
};

export default EditUserPage;
