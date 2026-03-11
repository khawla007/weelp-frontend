'use client';
import { NavigationDestinations } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/destinations/components/Navigation';
import { FilterCountries } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/destinations/destinations_filters/FilterCountries';

const CountriesPage = () => {
  return (
    <>
      <NavigationDestinations title="Countries" description="Manage countries and their details for travel packages" />
      <FilterCountries />
    </>
  );
};

export default CountriesPage;
