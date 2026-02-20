export const dynamic = 'force-dynamic';

import React from 'react';
import { CreatePackageForm } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/packages/CreatePackageForm';
import { getAllTagsAdmin, getAllCitiesAdmin, getAllAttributesAdmin, getCategoriesAdmin } from '@/lib/services/global';
import { getAllActivitesAdmin } from '@/lib/services/activites';
import { getAllTransfersAdmin } from '@/lib/services/transfers';
import { getAllItinerariesAdmin } from '@/lib/services/itineraries';

const CreatePackage = async () => {
  const [{ data: tagsData }, { data: locationsData = {} }, { data: attributesData = {} }, { data: categoriesData = {} }, { data: activitiesData = [] }, transfers, itineraries] = await Promise.all([
    getAllTagsAdmin(),
    getAllCitiesAdmin(),
    getAllAttributesAdmin(),
    getCategoriesAdmin(),
    getAllActivitesAdmin(),
    getAllTransfersAdmin(),
    getAllItinerariesAdmin(),
  ]);

  const { data: tags = [] } = tagsData; // for tags
  const { data: locations = [] } = locationsData; // get cities
  const { data: categories = [] } = categoriesData; // categories
  const { data: attributes = [] } = attributesData; // for attributes

  return <CreatePackageForm tags={tags} locations={locations} attributes={attributes} categories={categories} allactivities={activitiesData} alltransfers={transfers} itineraries={itineraries} />;
};

export default CreatePackage;
