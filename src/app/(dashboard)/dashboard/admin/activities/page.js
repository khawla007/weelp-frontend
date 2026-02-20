export const dynamic = 'force-dynamic';
import React from 'react';
import { getCategoriesAdmin } from '@/lib/services/global';
import FilterActivity from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/activities/FilterActivityPage';
import { getAttributeBySlugAdmin } from '@/lib/services/attributes';

const ActivityPage = async () => {
  const { data: allCategories = {} } = await getCategoriesAdmin();
  const { data: categories = [] } = allCategories; // categories

  const difficulty = await getAttributeBySlugAdmin('difficulty-level'); // slug required
  const duration = await getAttributeBySlugAdmin('duration'); // slug required

  return <FilterActivity categories={categories} difficulties={difficulty} durations={duration} />;
};

export default ActivityPage;
