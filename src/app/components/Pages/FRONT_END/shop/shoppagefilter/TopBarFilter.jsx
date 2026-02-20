'use client';
import React, { useState } from 'react';
import { ListFilter, Map } from 'lucide-react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TopBarFilter = ({ dispatch }) => {
  const [showsort, setShowSort] = useState(null);

  const handleAvailabilityChange = (value) => {
    dispatch({ type: 'UPDATE_AVAILABILITY', payload: value });
  };

  const handlePriceSort = (value) => {
    dispatch({ type: 'UPDATE_PRICE_RANGE', payload: value });
  };

  const handleRatingChange = (e) => {
    dispatch({ type: 'UPDATE_RATING', payload: e.target.value });
  };

  const handleSort = () => {
    setShowSort(!showsort);
  };

  return (
    <div className="flex justify-between py-8 flex-wrap gap-4">
      <div className="flex gap-4">
        <Select onValueChange={handleAvailabilityChange}>
          <SelectTrigger className="w-[150px] flex justify-around text-base focus:ring-0 focus:outline-0 focus:ring-offset-0 text-grayDark bg-mainBackground">
            <SelectValue placeholder="Availability" />
          </SelectTrigger>
          <SelectContent className={'mt-2'}>
            <SelectGroup>
              <SelectItem className={'cursor-pointer ease-in-out duration-200 capitalize focus:bg-[#f2f7f5] text-grayDark'} value="Out of Stock">
                Out of Stock
              </SelectItem>
              <SelectItem className={'cursor-pointer ease-in-out duration-200 capitalize focus:bg-[#f2f7f5] text-grayDark'} value="In Stock">
                In Stock
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select onValueChange={handlePriceSort}>
          <SelectTrigger className="w-[150px] flex justify-around text-base focus:ring-0 focus:outline-0 focus:ring-offset-0 text-grayDark bg-mainBackground">
            <SelectValue placeholder="Price Range" />
          </SelectTrigger>
          <SelectContent className={'mt-2'}>
            <SelectGroup>
              <SelectItem className={'cursor-pointer ease-in-out duration-200 capitalize focus:bg-[#f2f7f5] text-grayDark'} value={2000}>
                High to Low
              </SelectItem>
              <SelectItem className={'cursor-pointer ease-in-out duration-200 capitalize focus:bg-[#f2f7f5] text-grayDark'} value={5000}>
                Low to High
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
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
            {/* <input type='hidden' value={sortData} /> */}
            <ul className="absolute z-10 mt-4 left-20 border flex flex-col bg-white rounded-md text-sm">
              <li className="cursor-pointer ease-in-out duration-200 p-4 capitalize hover:bg-[#f2f7f5] text-nowrap  text-grayDark" onClick={handleRatingChange} value={5}>
                Sort By Popularity
              </li>
              <li className="cursor-pointer ease-in-out duration-200 p-4 capitalize hover:bg-[#f2f7f5] text-nowrap  text-grayDark" onClick={handleRatingChange} value={5}>
                {' '}
                Sort By Popularity: Low to High
              </li>
              <li className="cursor-pointer ease-in-out duration-200 p-4 capitalize hover:bg-[#f2f7f5] text-nowrap  text-grayDark" onClick={handleRatingChange} value={4}>
                Sort By Popularity :High to Low
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBarFilter;
