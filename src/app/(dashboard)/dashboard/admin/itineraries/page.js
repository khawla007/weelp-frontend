export const dynamic = 'force-dynamic';
import React from 'react';
import { getCategoriesAdmin } from '@/lib/services/global';
import { getAttributeBySlugAdmin } from '@/lib/services/attributes';
import FilterItinerary from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/itineraries/FilteredItineraryPage';

const ItineraryPage = async () => {
  const { data: allCategories = {} } = await getCategoriesAdmin(null, { all: true });
  const { data: categories = [] } = allCategories; // categories
  const difficulty = await getAttributeBySlugAdmin('difficulty-level'); // slug required
  const duration = await getAttributeBySlugAdmin('duration'); // slug required

  return <FilterItinerary categories={categories} difficulties={difficulty} durations={duration} />;
};

export default ItineraryPage;
