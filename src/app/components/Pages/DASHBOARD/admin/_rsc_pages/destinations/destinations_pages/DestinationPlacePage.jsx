'use client';
import { NavigationDestinations } from '../components/Navigation';
import { FilterPlaces } from '../destinations_filters/FilterPlaces';

export const DestinationPlacePage = () => {
  return (
    <>
      <NavigationDestinations title="places" description="Manage tourist attractions and points of interest" url="/dashboard/admin/destinations/places/new" name="Add Place" />
      <FilterPlaces />
    </>
  );
};
