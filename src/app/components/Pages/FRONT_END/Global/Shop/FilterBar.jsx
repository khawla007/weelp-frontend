'use client';
import { Star } from 'lucide-react';
import React, { useState, useEffect } from 'react';

const FilterBar = ({ filters, setFilters }) => {
  const [mounted, setMounted] = useState(false); //
  const [price, setPrice] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle category change
  const handleCategoryChange = (event) => {
    const value = event.target.value;
    setFilters((prevFilters) => {
      const updatedCategories = prevFilters.categories.includes(value) ? prevFilters.categories.filter((category) => category !== value) : [...prevFilters.categories, value];
      return { ...prevFilters, categories: updatedCategories };
    });
  };

  // Handle location change
  const handleLocationChange = (event) => {
    const value = event.target.value;
    setFilters((prevFilters) => {
      const updatedLocations = prevFilters.locations.includes(value) ? prevFilters.locations.filter((location) => location !== value) : [...prevFilters.locations, value];
      return { ...prevFilters, locations: updatedLocations };
    });
  };

  // Handle price range change
  const handlePriceRangeChange = (event) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      priceRange: event.target.value,
    }));
    console.log(event);
  };

  // Handle rating change
  const handleRatingChange = (event) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      rating: event.target.value,
    }));
  };

  // Form On Change
  const handleOnChange = () => {
    console.log(filters);

    // set Filter Price
    setPrice(filters.priceRange);
  };

  // Return nothing if the component is still mounting to prevent hydration error
  if (!mounted) {
    return null; // Or a loading spinner
  }

  return (
    <div className="flex-1 lg:flex justify-center w-full shop_filter">
      <form className="p-4 px-8 sm:my-12 bg-white sm:max-w-xs w-full h-fit  shadow-md rounded-lg " onChange={handleOnChange}>
        {/* Category Section */}
        <div>
          <h3 className="text-lg font-medium text-#143042 mt-6 mb-4">Category</h3>
          <div className="space-y-4">
            {['ThemePark', 'Water Park', 'Cable Car', 'PlayGround'].map((category) => (
              <div key={category} className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox size-5 accent-secondaryDark border  border-[#667085] cursor-pointer"
                  value={category}
                  checked={filters.categories.includes(category)}
                  onChange={handleCategoryChange}
                />
                <label className="ml-2 text-md font-medium text-grayDark">{category}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range Section */}
        <div>
          <h3 className="text-lg font-medium text-#143042 mt-6 mb-4">Price Range</h3>
          <div className="flex items-center space-x-2">
            <span className="text-md font-medium text-grayDark">$0</span>
            <input
              type="range"
              min="0"
              max="5000"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-thumb focus:outline-none accent-secondaryDark"
              value={filters.priceRange}
              onChange={handlePriceRangeChange}
            />
            <span className="text-md font-medium text-grayDark">${price || 5000}</span>
          </div>
        </div>

        {/* Rating Section */}
        <div>
          <h3 className="text-lg font-medium text-#143042 mt-6 mb-4">Ratings</h3>
          <div className="space-y-2">
            {['3', '4', '5'].reverse().map((rating) => (
              <div key={rating} className="flex items-center gap-2">
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
              </div>
            ))}
          </div>
        </div>

        {/* Location Section */}
        <div>
          <h3 className="text-lg font-medium text-#143042 mt-6 mb-4">Location</h3>
          <div className="space-y-2">
            {['Asia', 'Europe', 'Middle East', 'America'].map((location) => (
              <div key={location} className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox size-5 accent-secondaryDark cursor-pointer"
                  value={location}
                  checked={filters.locations.includes(location)}
                  onChange={handleLocationChange}
                />
                <label className="ml-2 text-md font-medium text-grayDark">{location}</label>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};

export default FilterBar;
