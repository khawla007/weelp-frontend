export const dynamic = 'force-dynamic';

import React from 'react';
import { getSinglePackageAdmin } from '@/lib/services/package';
import { isEmpty } from 'lodash';
import { notFound } from 'next/navigation';
import { EditPackageForm } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/packages/EditPackageForm';
import { getAllAttributesAdmin, getAllCitiesAdmin, getAllTagsAdmin, getCategoriesAdmin } from '@/lib/services/global';
import { getAllActivitesAdmin } from '@/lib/services/activites';
import { getAllTransfersAdmin } from '@/lib/services/transfers';
import { getAllItinerariesAdmin } from '@/lib/services/itineraries';
import { log } from '@/lib/utils';

const EditPackage = async ({ params }) => {
  const [{ data: tagsData }, { data: locationsData = {} }, { data: attributesData = {} }, { data: categoriesData = {} }, { data: activitiesData = [] }, transfers, itineraries] = await Promise.all([
    getAllTagsAdmin(),
    getAllCitiesAdmin(),
    getAllAttributesAdmin(),
    getCategoriesAdmin(),
    getAllActivitesAdmin(),
    getAllTransfersAdmin(),
    getAllItinerariesAdmin(),
  ]);

  const { id = '' } = await params;
  const packagedata = await getSinglePackageAdmin(id); //dyanmic id

  const { data: categories = [] } = categoriesData; // categories
  const { data: locations = [] } = locationsData; // get cities
  const { data: attributes = [] } = attributesData; // for attributes

  // check if not found
  if (isEmpty(packagedata)) {
    return notFound();
  }

  const { data: tags = [] } = tagsData; // for tags

  return (
    <EditPackageForm
      tags={tags}
      locations={locations}
      attributes={attributes}
      categories={categories}
      allactivities={activitiesData}
      alltransfers={transfers}
      itineraries={itineraries}
      packageData={packagedata}
    />
  );
};

export default EditPackage;
