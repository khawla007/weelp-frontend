'use client';
import { NavigationDestinations } from '../components/Navigation';
import { FilterPlaces } from '../destinations_filters/FilterPlaces';

export const DestinationPlacePage = () => {
  return (
    <>
      <NavigationDestinations title="Places" description="Manage tourist attractions and points of interest" />
      <FilterPlaces />
    </>
  );
};
