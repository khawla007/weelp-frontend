import React from 'react';
import { getAllTagsAdmin, getAllCitiesAdmin, getAllAttributesAdmin, getCategoriesAdmin } from '@/lib/services/global';
import { EditItineraryForm } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/itineraries/EditItineraryForm';
import { getSingleItineraryAdmin } from '@/lib/services/itineraries';
import { getAllTransfersAdmin } from '@/lib/services/transfers';
import { getAllActivitesAdmin } from '@/lib/services/activites';
import { isEmpty } from 'lodash';
import { notFound } from 'next/navigation';

const EditItinerary = async ({ params }) => {
  const [{ data: tagsData }, { data: locationsData = {} }, { data: attributesData = {} }, { data: categoriesData = {} }, transfers, { data: activitiesData = [] }] = await Promise.all([
    getAllTagsAdmin(),
    getAllCitiesAdmin(),
    getAllAttributesAdmin(),
    getCategoriesAdmin(),
    getAllTransfersAdmin(),
    getAllActivitesAdmin(),
  ]);

  const { data: tags = [] } = tagsData; // for tags
  const { data: locations = [] } = locationsData; // get cities
  const { data: categories = [] } = categoriesData; // categories
  const { data: attributes = [] } = attributesData; // for attributes

  const { id } = await params;
  const itinerarydata = await getSingleItineraryAdmin(id); //dyanmic id

  // check if not found
  if (isEmpty(itinerarydata)) {
    return notFound();
  }
  return <EditItineraryForm tags={tags} locations={locations} attributes={attributes} categories={categories} alltransfers={transfers} allactivities={activitiesData} itineraryData={itinerarydata} />;
};

export default EditItinerary;
