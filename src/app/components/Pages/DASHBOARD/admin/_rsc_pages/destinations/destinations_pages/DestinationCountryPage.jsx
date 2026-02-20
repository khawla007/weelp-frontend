'use client';
import { NavigationDestinations } from '../components/Navigation';
import { FilterCountries } from '../destinations_filters/FilterCountries';

export const DestinationCountryPage = () => {
  return (
    <>
      <NavigationDestinations title="Countries" description="Manage countries and their details for travel packages" url="/dashboard/admin/destinations/countries/new" name="Add Country" />
      <FilterCountries />
    </>
  );
};
