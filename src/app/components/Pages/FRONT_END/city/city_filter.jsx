'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import _ from 'lodash';
import ReactRangeSliderInput from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import { GlobalCard } from '@/app/components/SingleProductCard';
import { Star } from 'lucide-react';
import { LoadingPage } from '@/app/components/Animation/Cards';
import { log } from '@/lib/utils';

export const CityFilter = () => {
  const { city } = useParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([200, 1200]);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch categories from API
  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_BASE_URLL}api/categories`)
      .then((response) => {
        if (response.status === 200) {
          setCategories(response?.data?.data); // Assuming response contains a list of categories
        }
      })
      .catch((error) => {
        console.log('Error fetching categories:', error);
        setCategories([]);
      });
  }, []);

  // Debounced fetch function for products
  const debouncedFetchProducts = useCallback(
    _.debounce(() => {
      setIsLoading(true);
      let query = `?min_price=${priceRange[0]}&max_price=${priceRange[1]}&page=${currentPage}&min_rating=${ratingFilter}`;
      if (selectedCategories.length > 0) query += `&categories=${selectedCategories.join(',')}`;

      axios
        .get(`${process.env.NEXT_PUBLIC_API_BASE_URLL}api/${city}/all-items${query}`)
        .then((response) => {
          //error handle for filter items
          if (response.status === 200) {
            setProducts(response?.data?.data);
            setPagination(response?.data);
          }
        })
        .catch((error) => {
          console.log('Error fetching products:', error);
          setProducts([]);
          setPagination([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 500),
    [priceRange, selectedCategories, currentPage, city, ratingFilter],
  );

  // Effect to trigger debounced fetch
  useEffect(() => {
    debouncedFetchProducts();

    return () => {
      debouncedFetchProducts.cancel();
    };
  }, [debouncedFetchProducts]);

  // Category selection handler
  const handleCheckboxChange = useCallback((category) => {
    setSelectedCategories((prevSelected) => (category === 'all' ? [] : prevSelected.includes(category) ? prevSelected.filter((item) => item !== category) : [...prevSelected, category]));
  }, []);

  // Price range handler
  const handlePriceRangeChange = useCallback((values) => {
    setPriceRange(values);
  }, []);

  // Rating filter handler
  const handleRatingChange = useCallback((rating) => {
    setRatingFilter(rating);
  }, []);

  // Pagination handler
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  // Memoize category list to prevent unnecessary re-renders
  const categoryList = useMemo(
    () =>
      categories.map((category, index) => (
        <label key={index} className="flex items-center space-x-2 cursor-pointer text-md font-medium text-grayDark ">
          <input
            type="checkbox"
            value={category?.name}
            checked={selectedCategories.includes(category?.name)}
            onChange={() => handleCheckboxChange(category?.name)}
            className={`w-4 h-4 transition-all border-2 rounded cursor-pointer ${selectedCategories.includes(category?.name) && 'accent-secondaryDark'}`}
          />
          <span>{category?.name}</span>
        </label>
      )),
    [categories, selectedCategories, handleCheckboxChange],
  );

  // Star rating filter component
  const StarRatingFilter = () => (
    <div className="mt-6">
      <h2 className="text-lg font-medium text-[#143042] my-4">Ratings</h2>
      <div className="flex w-fit flex-col gap-4">
        {[3, 4, 5].map((rating) => (
          <label key={rating} className="flex cursor-pointer items-center space-x-1 py-1 rounded">
            <input type="radio" name="rating" value={rating} checked={ratingFilter === rating} onChange={() => handleRatingChange(rating)} className="size-5 checked:accent-secondaryDark" />
            <div className="flex">
              {Array.from({ length: rating }).map((_, i) => (
                <Star key={i} size={20} className="stroke-none fill-yellow-500" />
              ))}
            </div>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col sm:flex-row sm:gap-4 lg:gap-8 p-4">
      {/* Sidebar Filter */}
      <div className="w-full flex-2 p-4 px-8 sm:my-12 sm:max-w-xs bg-white h-fit shadow-md rounded-lg">
        <h2 className="text-lg font-medium text-[#143042] my-4">Category</h2>
        <div className="flex flex-col space-y-2 h-48 overflow-x-hidden overflow-auto">
          <label className="flex items-center space-x-2 cursor-pointer text-md font-medium text-grayDark">
            <input
              type="checkbox"
              name="category"
              value="all"
              checked={selectedCategories.length === 0}
              onChange={() => handleCheckboxChange('all')}
              className="size-5 transition-all border-2 rounded cursor-pointer checked:accent-secondaryDark"
            />
            <span>All Category</span>
          </label>
          {categoryList}
        </div>

        {/* Price Range Slider */}
        <div className="mt-6">
          <h2 className="text-lg font-medium text-[#143042] mt-6 mb-4">Price Range</h2>
          <div className="px-2 py-4">
            <ReactRangeSliderInput min={100} max={5000} step={10} value={priceRange} onInput={handlePriceRangeChange} className="w-full" />
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span className="text-md font-medium text-grayDark">${priceRange[0]}</span>
            <span className="text-md font-medium text-grayDark">${priceRange[1]}</span>
          </div>
        </div>

        {/* Rating Filter */}
        <StarRatingFilter />
      </div>

      {/* Product List */}
      <div className="w-full lg:flex-[4]">
        {isLoading && <LoadingPage />}
        <div className={`flex flex-col sm:flex-row sm:flex-wrap gap-y-4 gap-4 py-4 sm:py-12 ${isLoading ? 'opacity-50' : ''}`}>
          {!isLoading && products?.length > 0 ? (
            products.map((product, index) => (
              <GlobalCard
                key={index}
                productTitle={product?.name}
                productSlug={product?.slug}
                item_type={product?.item_type}
                productPrice={product?.base_pricing?.variations[0]?.regular_price ?? product?.pricing?.regular_price}
              />
            ))
          ) : (
            <span>Sorry No Item Found</span>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="flex justify-center mt-6 space-x-2 w-full">
            {Array.from({ length: pagination.last_page }, (_, i) => (
              <button key={i} onClick={() => handlePageChange(i + 1)} className={`px-3 py-2 border ${currentPage === i + 1 ? 'bg-secondaryDark text-white' : 'bg-gray-200'} rounded`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
