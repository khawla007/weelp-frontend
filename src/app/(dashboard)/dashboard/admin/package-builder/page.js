export const dynamic = 'force-dynamic';

import React from 'react';
import { getCategoriesAdmin } from '@/lib/services/global';
import { getAttributeBySlugAdmin } from '@/lib/services/attributes';
import FilterPacakge from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/packages/FilteredPackagePage';

const PackagebuilderPage = async () => {
  const { data: categoriesData = {} } = await getCategoriesAdmin();
  const difficulty = await getAttributeBySlugAdmin('difficulty-level'); // slug required
  const duration = await getAttributeBySlugAdmin('duration'); // slug required

  const { data: categories = [] } = categoriesData; // categories
  return <FilterPacakge categories={categories} difficulties={difficulty} durations={duration} />;
};

export default PackagebuilderPage;
