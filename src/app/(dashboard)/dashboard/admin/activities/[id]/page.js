import { getAllTagsAdmin, getAllCitiesAdmin, getAllAttributesAdmin, getCategoriesAdmin } from '@/lib/services/global';
import { EditActivityForm } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/activities/EditActivityForm';
import { getSingleActivityAdmin } from '@/lib/services/activites';
import { isEmpty } from 'lodash';
import { notFound } from 'next/navigation';

// RSC default
const EditActivity = async ({ params }) => {
  const { id } = await params;
  const [{ data: tagsData }, { data: locationsData = {} }, { data: attributesData = {} }, { data: categoriesData = {} }] = await Promise.all([
    getAllTagsAdmin(),
    getAllCitiesAdmin(),
    getAllAttributesAdmin(),
    getCategoriesAdmin(),
  ]);

  const { data: tags = [] } = tagsData; // for tags
  const { data: locations = [] } = locationsData; // get cities
  const { data: categories = [] } = categoriesData; // for categories
  const { data: attributes = [] } = attributesData; // for attributes

  console.log(categoriesData);
  const activitydata = await getSingleActivityAdmin(id); //dyanmic id

  if (isEmpty(activitydata)) {
    return notFound();
  }

  return <EditActivityForm tags={tags} locations={locations} /** locations == cities */ attributes={attributes} categories={categories} activitydata={activitydata} />;
};

export default EditActivity;
