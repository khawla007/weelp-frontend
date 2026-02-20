'use client';

// Filtering Sorting Functionality
import React, { useState } from 'react';
import { ListFilter, Map, X } from 'lucide-react';
import { GlobalCard } from '../../../SingleProductCard';

import { log } from '@/lib/utils';

const Tours = ({ items, taglist }) => {
  const [showsort, setShowSort] = useState(null);
  const [sortData, setSortData] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]); // State for selected filters

  // Handle Filter Change
  const handleFilterChange = (location) => {
    setSelectedFilters((prevFilters) => {
      if (prevFilters.includes(location)) {
        // Remove filter if it exists (toggle functionality)
        return prevFilters.filter((filter) => filter !== location);
      } else {
        // Add filter if it does not exist
        return [...prevFilters, location];
      }
    });
  };

  // Filter Data Based on Selected Filters
  const filteredData = selectedFilters.length > 0 ? items.filter((item) => item.tags.some((tag) => selectedFilters.includes(tag.name))) : items;

  // Sorting Display Handle
  const handleSort = (e) => {
    e.preventDefault();
    setShowSort(!showsort);
  };

  // Handle Sort Value
  const handleSortValue = (e) => {
    const sortValue = e.target.getAttribute('value');
    setSortData(sortValue);
    setShowSort(!showsort);

    let sortedData = [...filteredData]; // Create a new array to avoid modifying state directly

    if (sortValue === '5000') {
      // Sort by Price: Low to High
      sortedData.sort((a, b) => {
        const priceA = parseFloat(a.base_pricing.variations[0].regular_price);
        const priceB = parseFloat(b.base_pricing.variations[0].regular_price);
        return priceA - priceB;
      });
    } else if (sortValue === '0') {
      // Sort by Price: High to Low
      sortedData.sort((a, b) => {
        const priceA = parseFloat(a.base_pricing.variations[0].sale_price);
        const priceB = parseFloat(b.base_pricing.variations[0].regular_price);
        return priceB - priceA;
      });
    }

    setSelectedFilters(sortedData); // Update the state with sorted data
  };

  return (
    <div className="flex flex-col gap-8 mt-4">
      {/* Sort Bar */}
      <form className="flex flex-wrap gap-4 sm:justify-between justify-end">
        <div className="hidden sm:block">
          <ul className="flex gap-4 flex-wrap">
            {taglist &&
              taglist.map((tag, index) => {
                return (
                  <label
                    htmlFor={tag?.name}
                    key={index}
                    className={`flex items-center gap-2 cursor-pointer capitalize  text-grayDark font-medium text-md py-2 px-4 rounded-lg border w-fit ${selectedFilters.includes(tag?.name) ? 'bg-gray-300' : 'bg-[#eff3f6]'}`}
                  >
                    <input
                      type="checkbox"
                      id={tag?.name}
                      className="peer hidden"
                      onChange={() => handleFilterChange(tag?.name)} // Handle filter change
                      checked={selectedFilters.includes(tag?.name)} // Checkbox is checked if filter exists in state
                    />
                    {tag?.name}
                  </label>
                );
              })}
          </ul>
        </div>

        <div className="relative">
          <div className="flex gap-4 flex-wrap">
            <button className="flex items-center gap-4 text-grayDark border text-base p-2 px-6  rounded-lg" onClick={(e) => e.preventDefault()}>
              View on map
              <Map size={18} />
            </button>
            <button className="flex items-center gap-4 text-grayDark border text-base p-2 px-6  rounded-lg" onClick={handleSort}>
              Sort <ListFilter size={18} />
            </button>
          </div>
          {showsort && (
            <div
              onMouseLeave={(e) => {
                (e.stopPropagation(), setShowSort(!showsort));
              }}
            >
              <input type="hidden" value={sortData} />
              <ul className="absolute z-10 mt-4 left-24 border flex flex-col bg-white rounded-md text-sm">
                <li className="cursor-pointer ease-in-out duration-200 p-4 capitalize hover:bg-[#f2f7f5] text-nowrap  text-grayDark" onClick={handleSortValue} value={'5'}>
                  Sort By Popularity
                </li>
                <li className="cursor-pointer ease-in-out duration-200 p-4 capitalize hover:bg-[#f2f7f5] text-nowrap  text-grayDark" onClick={handleSortValue} value={5000}>
                  Sort By Price: low to high
                </li>
                <li className="cursor-pointer ease-in-out duration-200 p-4 capitalize hover:bg-[#f2f7f5] text-nowrap  text-grayDark" onClick={handleSortValue} value={200}>
                  Sort By Price : High to Low
                </li>
              </ul>
            </div>
          )}
        </div>
      </form>

      {/* Result */}
      <ul className="grid grid-col-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-16">
        {filteredData &&
          filteredData.map((val, index) => {
            return (
              <li key={index}>
                <GlobalCard
                  item_type={val?.item_type}
                  imgsrc={val?.image}
                  productRating={val?.rating}
                  productTitle={val?.name}
                  productPrice={val?.base_pricing?.variations[0]?.regular_price}
                  productId={val?.id}
                  productSlug={val?.slug}
                />
              </li>
            );
          })}
      </ul>
    </div>
  );
};

export default Tours;
