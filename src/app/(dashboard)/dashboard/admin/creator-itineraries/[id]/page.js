import React from 'react';
import { getAllTagsAdmin, getAllCitiesAdmin, getAllAttributesAdmin, getCategoriesAdmin } from '@/lib/services/global';
import { EditItineraryForm } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/itineraries/EditItineraryForm';
import { getSingleItineraryAdmin } from '@/lib/services/itineraries';
import { getAllTransfersAdmin } from '@/lib/services/transfers';
import { getAllActivitesAdmin } from '@/lib/services/activites';
import { isEmpty } from 'lodash';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';

export const metadata = {
  title: 'Edit Creator Itinerary - Weelp Admin',
  description: 'Edit a creator itinerary',
};

const EditCreatorItinerary = async ({ params }) => {
  const session = await auth();
  if (!session?.user?.role || !['admin', 'super_admin'].includes(session.user.role)) {
    redirect('/dashboard/admin');
  }

  const { id } = await params;

  const [{ data: tagsData }, { data: locationsData = {} }, { data: attributesData = {} }, { data: categoriesData = {} }, transfers, { data: activitiesData = [] }, itinerarydata] = await Promise.all([
    getAllTagsAdmin('', { all: true }),
    getAllCitiesAdmin(),
    getAllAttributesAdmin(null, { all: true }),
    getCategoriesAdmin(null, { all: true }),
    getAllTransfersAdmin(),
    getAllActivitesAdmin(),
    getSingleItineraryAdmin(id),
  ]);

  const { data: tags = [] } = tagsData;
  const { data: locations = [] } = locationsData;
  const { data: categories = [] } = categoriesData;
  const { data: attributes = [] } = attributesData;

  if (isEmpty(itinerarydata)) {
    return notFound();
  }

  return (
    <EditItineraryForm
      tags={tags}
      locations={locations}
      attributes={attributes}
      categories={categories}
      alltransfers={transfers}
      allactivities={activitiesData}
      itineraryData={itinerarydata}
      isCreatorItinerary
    />
  );
};

export default EditCreatorItinerary;
