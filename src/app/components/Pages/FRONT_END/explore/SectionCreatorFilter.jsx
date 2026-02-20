'use client';
import React, { useState } from 'react';
import { CreatorCard } from '@/app/components/CreatorCard';
import { fakeData } from '@/app/Data/ShopData';
import { ListFilter } from 'lucide-react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import TabButton from '@/app/components/TabButton';

const CreatorFilter = () => {
  const [visibleCount, setVisibleCount] = useState(5);
  const [category, setCategory] = useState('All');
  const [sortType, setSortType] = useState(null);
  const [priceOrder, setPriceOrder] = useState(null);
  const [showSort, setShowSort] = useState(false);

  // sorting toggle
  const handleSortToggle = () => {
    setShowSort(!showSort);
  };

  // Filtering logic
  const filteredData = fakeData
    .filter((item) => {
      if (category !== 'All' && item.category !== category) return false;
      return true;
    })
    .sort((a, b) => {
      if (priceOrder === 'Low to High') return a.price - b.price;
      if (priceOrder === 'High to Low') return b.price - a.price;
      if (sortType === 'Popularity') return b.rating - a.rating;
      return 0;
    });

  // handle Show MOre
  const handleShowMore = (prevCount) => {
    return setVisibleCount((prevCount) => prevCount + 5);
  };

  return (
    <section className="relative max-w-[95%] mx-auto">
      {/* Top Bar */}
      <div className="flex justify-between flex-col sm:flex-row px-6">
        {/* Top Rated */}
        <div className="mt-4">
          <Select className="bg-gray-200" onValueChange={(value) => setPriceOrder(value)}>
            <SelectTrigger className="w-[150px] flex justify-around text-base focus:ring-0 focus:outline-0 focus:ring-offset-0 text-grayDark bg-mainBackground">
              <SelectValue placeholder="Top Rated" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem className="cursor-pointer ease-in-out duration-200 capitalize focus:bg-[#f2f7f5] text-grayDark" value="Low to High">
                  Low to High
                </SelectItem>
                <SelectItem className="cursor-pointer ease-in-out duration-200 capitalize focus:bg-[#f2f7f5] text-grayDark" value="High to Low">
                  High to Low
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Category Tabs */}
        <div className="mt-4">
          <ul className="flex gap-2 sm:justify-center flex-wrap">
            {['All', 'ThemePark', 'Museum', 'Zoo', 'Aquarium'].slice(0, visibleCount).map((cat) => (
              <TabButton key={cat} text={cat} isActive={category === cat} onClick={() => setCategory(cat)} />
            ))}
          </ul>
        </div>

        {/* Sort by Popularity */}
        <div className="mt-4 flex">
          <div className="flex gap-4 flex-wrap">
            <button className="relative flex items-center gap-4 text-grayDark border text-base p-2 px-6 rounded-lg" onClick={handleSortToggle}>
              Sort <ListFilter size={18} />
            </button>
          </div>
          {showSort && (
            <div className="absolute top-40 sm:right-0 sm:top-10 h-fit w-fit z-10 mt-8 border bg-white rounded-md" onMouseLeave={() => setShowSort(false)}>
              <ul className="flex flex-col text-sm">
                <li
                  className="cursor-pointer ease-in-out duration-200 p-4 capitalize hover:bg-[#f2f7f5] text-nowrap text-grayDark"
                  onClick={() => {
                    setSortType('Popularity');
                    setShowSort(false);
                  }}
                >
                  Sort By Popularity
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="flex flex-col gap-4 py-6">
        <ul className="w-auto grid sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {filteredData.slice(0, visibleCount).map((val, index) => (
            <li key={index} className="">
              <CreatorCard imagSrc={val?.image} title={val?.name} rating={val?.rating} />
            </li>
          ))}
        </ul>

        {/* Read More Button */}
        {visibleCount < filteredData.length && (
          <div className="flex justify-center">
            <button
              onClick={handleShowMore}
              className="bg-secondaryDark hover:bg-[#ffffff] text-[#ffffff] hover:text-secondaryDark border border-secondaryDark  text-base font-medium rounded-md w-fit py-2 px-6"
            >
              View More
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CreatorFilter;
