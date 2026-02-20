export const dynamic = 'force-dynamic';
import React from 'react';
import { getAllTagsAdmin, getAllCitiesAdmin, getAllAttributesAdmin, getCategoriesAdmin } from '@/lib/services/global';
import { getAllActivitesAdmin } from '@/lib/services/activites';
import { CreateItineraryForm } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/itineraries/CreateItineraryForm';
import { getAllTransfersAdmin } from '@/lib/services/transfers';
import { log } from '@/lib/utils';

const CreateItineriary = async () => {
  const [{ data: tagsData }, { data: locationsData = {} }, { data: attributesData = {} }, { data: categoriesData = {} }, { data: activitiesData = [] }, transfers] = await Promise.all([
    getAllTagsAdmin(),
    getAllCitiesAdmin(),
    getAllAttributesAdmin(),
    getCategoriesAdmin(),
    getAllActivitesAdmin(),
    getAllTransfersAdmin(),
  ]);

  const { data: tags = [] } = tagsData; // for tags
  const { data: locations = [] } = locationsData; // get cities
  const { data: categories = [] } = categoriesData; // categories
  const { data: attributes = [] } = attributesData; // for attributes

  return <CreateItineraryForm tags={tags} locations={locations} attributes={attributes} categories={categories} allactivities={activitiesData} alltransfers={transfers} />;
};

export default CreateItineriary;
