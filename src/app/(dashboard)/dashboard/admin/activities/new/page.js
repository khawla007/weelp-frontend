export const dynamic = 'force-dynamic';

import { getAllTagsAdmin, getAllCitiesAdmin, getAllAttributesAdmin, getCategoriesAdmin } from '@/lib/services/global';
import { CreateActivityForm } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/activities/CreateActivityForm';

// RSC
const CreateActivity = async () => {
  const [{ data: tagsData = {} }, { data: locationsData = {} }, { data: attributesData = {} }, { data: categoriesData = {} }] = await Promise.all([
    getAllTagsAdmin(),
    getAllCitiesAdmin(),
    getAllAttributesAdmin(),
    getCategoriesAdmin(),
  ]);

  const { data: tags = [] } = tagsData; // for tags
  const { data: locations = [] } = locationsData; // get cities
  const { data: categories = [] } = categoriesData; // for categories
  const { data: attributes = [] } = attributesData; // for attributes

  return <CreateActivityForm tags={tags} locations={locations} /** locations == cities */ attributes={attributes} categories={categories} />;
};

export default CreateActivity;
