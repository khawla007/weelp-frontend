import React from 'react';
import { getAllTagsAdmin, getAllCitiesAdmin, getAllAttributesAdmin, getCategoriesAdmin } from '@/lib/services/global';
import { EditItineraryForm } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/itineraries/EditItineraryForm';
import { getAllTransfersAdmin } from '@/lib/services/transfers';
import { getAllActivitesAdmin } from '@/lib/services/activites';
import { isEmpty } from 'lodash';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { getAdminCreatorItinerary } from '@/lib/actions/creatorItineraries';

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

  const [{ data: tagsData }, { data: locationsData = {} }, { data: attributesData = {} }, { data: categoriesData = {} }, transfers, { data: activitiesData = [] }, itineraryResult] = await Promise.all([
    getAllTagsAdmin('', { all: true }),
    getAllCitiesAdmin(),
    getAllAttributesAdmin(null, { all: true }),
    getCategoriesAdmin(null, { all: true }),
    getAllTransfersAdmin(),
    getAllActivitesAdmin(),
    getAdminCreatorItinerary(id),
  ]);

  const { data: tags = [] } = tagsData;
  const { data: locations = [] } = locationsData;
  const { data: categories = [] } = categoriesData;
  const { data: attributes = [] } = attributesData;

  const itinerarydata = itineraryResult.success ? itineraryResult.data : null;

  if (isEmpty(itinerarydata)) {
    return notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#142A38]">Edit Creator Itinerary</h1>
        <p className="text-[#5A5A5A] mt-1">Editing: {itinerarydata.name}</p>
      </div>
      <EditItineraryForm
        tags={tags}
        locations={locations}
        attributes={attributes}
        categories={categories}
        alltransfers={transfers}
        allactivities={activitiesData}
        itineraryData={itinerarydata}
      />
    </div>
  );
};

export default EditCreatorItinerary;
