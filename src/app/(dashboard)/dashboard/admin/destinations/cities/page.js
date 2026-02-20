'use client';

import { NavigationDestinations } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/destinations/components/Navigation';
import { FilterCities } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/destinations/destinations_filters/FilterCities';
const CitiesPage = () => {
  return (
    <>
      <NavigationDestinations title="Cities" description="Manage cities and urban destinations" url="/dashboard/admin/destinations/cities/new" name="Add City" />
      <FilterCities />
    </>
  );
};

export default CitiesPage;
