'use client';
import { NavigationDestinations } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/destinations/components/Navigation';
import FilterPlaces from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/destinations/destinations_filters/FilterPlaces';

const PlacesPage = () => {
  return (
    <>
      <NavigationDestinations title="places" description="Manage tourist attractions and points of interest" url="/dashboard/admin/destinations/places/new" name="Add Place" />
      <FilterPlaces />
    </>
  );
};

export default PlacesPage;
