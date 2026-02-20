'use client';
import React from 'react';
import { Star } from 'lucide-react';
import { log } from '@/lib/utils';

const SideBarFilter = ({ filters, dispatch, categories_list }) => {
  const handleCategoryChange = (event) => {
    dispatch({ type: 'UPDATE_CATEGORY', payload: event.target.value });
  };

  const handlePriceRangeChange = (event) => {
    dispatch({ type: 'UPDATE_PRICE_RANGE', payload: event.target.value });
  };

  const handleRatingChange = (e) => {
    dispatch({ type: 'UPDATE_RATING', payload: e.target.value });
  };

  const handleLocationChange = (event) => {
    dispatch({ type: 'UPDATE_LOCATION', payload: event.target.value });
  };

  return (
    <form className="p-4 px-8 bg-white w-full shadow-md rounded-lg flex-[1] sm:max-w-xs max-h-fit">
      {/* Category */}
      <div>
        <h3 className="text-lg font-medium text-#143042 mt-6 mb-2">Category</h3>
        <div className="space-y-2">
          {categories_list &&
            categories_list.map((category) => (
              <label htmlFor={category.name} key={category.id} className="pt-2 flex items-center gap-2 cursor-pointer text-[#435A67]">
                <input
                  type="checkbox"
                  id={category.id}
                  value={category.name}
                  className="form-checkbox size-5 accent-secondaryDark border  border-[#435A67] cursor-pointer"
                  onChange={handleCategoryChange}
                />
                {category?.name}
              </label>
            ))}
        </div>
      </div>

      {/* Price */}
      <div className="flex flex-col">
        <h3 className="text-lg font-medium text-#143042 mt-6 mb-2">Price</h3>
        <label htmlFor="range" className="flex items-center gap-2">
          <span className="text-[#435A67]">$0</span>
          <input
            type="range"
            min="0"
            id="range"
            max="5000"
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-thumb focus:outline-none accent-secondaryDark"
            onChange={handlePriceRangeChange}
          />
          <span className="text-[#435A67]">${filters?.priceRange}</span>
        </label>
      </div>

      {/* Rating Section */}
      <div>
        <h3 className="text-lg font-medium text-#143042 mt-6 mb-4">Ratings</h3>
        <div className="space-y-2">
          {['3', '4', '5'].reverse().map((rating) => (
            <label key={rating} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="rating"
                className="form-radio size-5 accent-secondaryDark border-[#667085] cursor-pointer"
                value={rating}
                checked={filters.rating === rating}
                onChange={handleRatingChange}
              />
              <span className="flex">
                {Array(Number(rating))
                  .fill(0)
                  .map((val, id) => {
                    return <Star key={id} className=" stroke-none fill-yellow-500" />;
                  })}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <h3 className="text-lg font-medium text-#143042 mt-6 mb-2">Location</h3>
        <div className="space-y-2">
          {['Asia', 'Europe', 'Middle East', 'America'].map((location) => (
            <label htmlFor={location} key={location} className="pt-2 flex items-center gap-2 cursor-pointer text-[#435A67]">
              <input type="checkbox" id={location} value={location} className="form-checkbox size-5 accent-secondaryDark border  border-[##435A67] cursor-pointer" onChange={handleLocationChange} />
              {location}
            </label>
          ))}
        </div>
      </div>
    </form>
  );
};
export default SideBarFilter;
