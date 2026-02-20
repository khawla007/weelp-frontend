'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import _, { set } from 'lodash';
import ReactRangeSliderInput from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import { GlobalCard } from '@/app/components/SingleProductCard';
import { Star } from 'lucide-react';
import { LoadingPage } from '@/app/components/Animation/Cards';
import { log } from '@/lib/utils';

export const RegionFilter = () => {
  const { region } = useParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([200, 1200]);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Categories
  const fetchCategories = useCallback(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_BASE_URLL}api/categories`)
      .then((response) => {
        if (response?.status === 200 && response?.data?.data?.length > 0) {
          setCategories(response.data.data);
        } else {
          console.warn('No categories found or empty response.');
          setCategories([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching categories:', error);
        setCategories([]);
      });
  }, []);

  // Fetch Products
  const fetchProducts = useCallback(
    _.debounce(() => {
      setIsLoading(true);
      let query = `?min_price=${priceRange[0]}&max_price=${priceRange[1]}&page=${pagination.current_page}&min_rating=${ratingFilter}`;

      if (selectedCategories.length > 0) {
        query += `&categories=${selectedCategories.join(',')}`;
      }

      axios
        .get(`${process.env.NEXT_PUBLIC_API_BASE_URLL}api/region/${region}/region-all-items${query}`)
        .then((response) => {
          setProducts(response.data.data);
          console.log(response);
          setPagination({
            current_page: response?.data?.current_page ?? 0,
            last_page: response?.data?.last_page ?? 0,
            total: response?.data?.total ?? 0,
            per_page: response?.data?.per_page ?? 0,
          });
        })
        .catch((error) => console.error('Error fetching products:', error))
        .finally(() => {
          setIsLoading(false);
        });
    }, 500),
    [priceRange, selectedCategories, pagination.current_page, region, ratingFilter],
  );

  useEffect(() => {
    fetchCategories(); // Fetch categories on component mount
    fetchProducts(); // Fetch products on dependency changes

    return () => {
      fetchProducts.cancel();
    };
  }, [fetchProducts, fetchCategories]);

  const handleCheckboxChange = useCallback((category) => {
    setSelectedCategories((prevSelected) => (category === 'all' ? [] : prevSelected.includes(category) ? prevSelected.filter((item) => item !== category) : [...prevSelected, category]));
  }, []);

  const handlePriceRangeChange = useCallback((values) => {
    setPriceRange(values);
  }, []);

  const handleRatingChange = useCallback((rating) => {
    setRatingFilter(rating);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      setPagination((prev) => ({ ...prev, current_page: newPage }));
    }
  };

  const categoryList = useMemo(
    () =>
      categories.map((category, index) => (
        <label key={index} className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            value={category.name}
            checked={selectedCategories.includes(category.name)}
            onChange={() => handleCheckboxChange(category.name)}
            className={`w-4 h-4 transition-all border-2 rounded cursor-pointer ${selectedCategories.includes(category.name) && 'accent-secondaryDark'}`}
          />
          <span>{category.name}</span>
        </label>
      )),
    [categories, selectedCategories, handleCheckboxChange],
  );

  const PaginationControls = () => (
    <div className="flex justify-center mt-6 space-x-2 w-full">
      {Array.from({ length: pagination.last_page }, (_, i) => (
        <button
          key={i}
          onClick={() => handlePageChange(i + 1)}
          className={`px-3 py-2 text-sm rounded ${pagination.current_page === i + 1 ? 'bg-secondaryDark text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );

  const StarRatingFilter = () => {
    return (
      <div className={`mt-6`}>
        <h2 className="text-lg font-medium text-[#143042] my-4">Ratings</h2>
        <div className="flex w-fit flex-col gap-4">
          {[3, 4, 5].map((rating) => (
            <label key={rating} className={`flex cursor-pointer items-center space-x-1 py-1 rounded`}>
              <input type="radio" name="rating" value={rating} checked={ratingFilter === rating} onChange={() => handleRatingChange(rating)} className={`size-5 checked:accent-secondaryDark`} />
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
  };

  return (
    <div className="flex flex-col sm:flex-row sm:gap-4 lg:gap-8 p-4">
      <div className="w-full flex-2 p-4 px-8 sm:my-12 sm:max-w-xs bg-white h-fit shadow-md rounded-lg">
        <h2 className="text-lg font-medium text-[#143042] my-4">Category</h2>
        <div className="flex flex-col space-y-2">
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
          <span className="text-md font-medium text-grayDark">{categoryList}</span>
        </div>

        <h2 className="text-lg font-medium text-[#143042] my-4">Price Range</h2>
        <ReactRangeSliderInput min={100} max={5000} value={priceRange} onInput={handlePriceRangeChange} className="mt-2" />

        <StarRatingFilter />
      </div>

      <div className="w-full lg:flex-[4] sm:my-12 flex flex-col">
        {isLoading && <LoadingPage />}
        <div className="flex  gap-4 flex-wrap">
          {!isLoading && products.length > 0 ? (
            products.map((product, index) => (
              <GlobalCard
                key={index}
                productTitle={product?.name}
                productSlug={product?.slug}
                item_type={product?.item_type}
                productPrice={product?.pricing?.regular_price ?? product?.base_pricing?.variations[0]?.regular_price}
              />
            ))
          ) : (
            <p>Sorry No Product Found</p>
          )}
        </div>

        {pagination.last_page > 1 && <PaginationControls />}
      </div>
    </div>
  );
};
