export const dynamic = 'force-dynamic';
import React from 'react';
import { getCategoriesAdmin } from '@/lib/services/global';
import { getAttributeBySlugAdmin } from '@/lib/services/attributes';
import FilterItinerary from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/itineraries/FilteredItineraryPage';

const ItineraryPage = async () => {
  const { data: categoriesData = {} } = await getCategoriesAdmin();
  const difficulty = await getAttributeBySlugAdmin('difficulty-level'); // slug required
  const duration = await getAttributeBySlugAdmin('duration'); // slug required

  const { data: categories = [] } = categoriesData; // categories

  return <FilterItinerary categories={categories} difficulties={difficulty} durations={duration} />;
};

export default ItineraryPage;
