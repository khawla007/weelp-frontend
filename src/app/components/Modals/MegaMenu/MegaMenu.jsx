import React, { useEffect } from 'react';
import { useState } from 'react';
import { useNavigationMenu } from '@/hooks/api/public/menu/menu';
import dynamic from 'next/dynamic';

const RegionList = dynamic(() => import('./MegaMenuComponents').then((module) => module.RegionList), { ssr: false });
const MegaMenuContent = dynamic(() => import('./MegaMenuComponents').then((module) => module.MegaMenuContent), { ssr: false });

const MegaMenu = () => {
  const { data: menuData, isLoading, isValidating, error } = useNavigationMenu(); // menu list
  const navItems = menuData?.data || []; // navigationItems

  // Derive initial selected continent from navItems (no state sync needed)
  const [selectedContinent, setSelectedContinent] = useState(() => {
    if (navItems.length > 0) {
      return {
        name: navItems[0].region,
        cities: navItems[0]?.cities || [],
      };
    }
    return { name: '', cities: [] };
  });

  // Handle continent selection
  const handleContinent = (name, cities) => {
    setSelectedContinent((prev) => {
      return { ...prev, name, cities };
    });
  };

  // Handling Error
  if (error) {
    return (
      <div className="w-[768px] !h-52 rounded-xl grid place-items-center">
        <span className="text-red-400">Something went Wrong.. {JSON.stringify(error)}</span>
      </div>
    );
  }

  // Initial Loading
  if (isValidating && isLoading) {
    return (
      <div className="w-[768px] !h-52 rounded-lg grid place-items-center">
        <span className="loader"></span>
      </div>
    );
  }

  return (
    <div className="bg-white text-black w-[768px] h-fit rounded-lg flex">
      <div className="flex w-full flex-row">
        <RegionList selectedContinent={selectedContinent} navItems={navItems} handleContinent={handleContinent} />
        <MegaMenuContent selectedContinent={selectedContinent.name} citiesList={selectedContinent.cities} />
      </div>
    </div>
  );
};

export default MegaMenu;
