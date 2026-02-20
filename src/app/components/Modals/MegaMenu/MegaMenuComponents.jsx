import Link from 'next/link';
import { DestinationCard2 } from '../../DestinationCard';

// Region List
export const RegionList = ({ navItems = [], selectedContinent, handleContinent }) => {
  return (
    <ul className="flex flex-1 flex-col h-full pb-4 w-full">
      {navItems.map((navItem, index) => (
        <li
          key={index}
          className={`hover:bg-secondaryLight2 text-grayDark hover:text-secondaryDark p-4 capitalize cursor-pointer ${selectedContinent?.name === navItem.region ? 'bg-secondaryLight2 text-secondaryDark' : ''}`}
          onClick={() => handleContinent(navItem.region, navItem?.cities)}
        >
          {navItem.region}
        </li>
      ))}
    </ul>
  );
};

// Dynamic Mega Menu Content
export const MegaMenuContent = ({ selectedContinent = '', citiesList }) => {
  return (
    <div className="flex flex-col h-full !flex-[3]">
      {selectedContinent && (
        <>
          <div className="grid grid-cols-3 gap-4 items-center border-b p-4">
            {/* Dynamically render destination cards based on selected continent */}
            <DestinationCard2 />
            <DestinationCard2 />
            <DestinationCard2 />
          </div>
          <div className="mt-4">
            <CityList citiesList={citiesList} />
          </div>
        </>
      )}
    </div>
  );
};

// City List
export const CityList = ({ citiesList = [] }) => {
  return (
    <ul className="grid grid-cols-4 gap-2">
      {citiesList.map(({ slug, name }) => (
        <li key={slug} className="p-2 text-[#5A5A5A] text-sm hover:text-secondaryDark">
          <Link href={`/city/${slug}`}>{name}</Link>
        </li>
      ))}
    </ul>
  );
};
