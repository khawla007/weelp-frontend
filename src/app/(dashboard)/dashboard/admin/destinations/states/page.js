'use client';
import { NavigationDestinations } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/destinations/components/Navigation';
import { FilterStates } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/destinations/destinations_filters/FilterStates';

const StatesPage = () => {
  return (
    <>
      <NavigationDestinations title="States" description="Create a new state or region for travel destinations" />
      <FilterStates />
    </>
  );
};

export default StatesPage;
