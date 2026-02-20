'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import _ from 'lodash';
import ReactRangeSliderInput from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import { GlobalCard } from '@/app/components/SingleProductCard';
import { Star } from 'lucide-react';
import { LoadingPage } from '@/app/components/Animation/Cards';
import { log } from '@/lib/utils';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';

import ShopProduct from '../Global/Shop/Shop';
import Styles from './BannerSection.module.css';
import { Icon } from './BannerSection';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URLL;
const PRODUCTS_API = `${API_BASE_URL}api/shop/`;
const LOCATIONS_API = `${API_BASE_URL}api/regions-cities`;
const CATEGORIES_API = `${API_BASE_URL}api/categories`;

export const ShopAllProduct = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([200, 1200]);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [sortby, setSortBy] = useState('');

  // Fetch locations
  useEffect(() => {
    axios
      .get(LOCATIONS_API)
      .then((res) => setLocations(res.data?.data ?? []))
      .catch((err) => console.log('Error fetching locations:', err));
  }, []);

  // Fetch categories
  useEffect(() => {
    axios
      .get(CATEGORIES_API)
      .then((res) => setCategories(res.data?.data ?? []))
      .catch((err) => console.log('Error fetching categories:', err));
  }, []);

  // Fetch products with debounce
  const fetchProducts = useCallback(
    _.debounce(() => {
      setIsLoading(true);
      let query = `?min_price=${priceRange[0]}&max_price=${priceRange[1]}&page=${currentPage}&min_rating=${ratingFilter}&sort_by=${sortby}`;

      if (selectedCategories.length) {
        query += `&categories=${selectedCategories.join(',')}`;
      }

      if (selectedLocation) {
        query += `&${selectedLocation.type}=${String(encodeURIComponent(selectedLocation.name)).toLowerCase()}`;
      }

      axios
        .get(`${PRODUCTS_API}${query}`)
        .then((res) => {
          if (res.status === 200 && Array.isArray(res.data?.data)) {
            setProducts(res.data.data);
            setPagination(res.data);
          } else {
            setProducts([]);
            setPagination(null);
          }
        })
        .catch((err) => {
          console.log('Error fetching products:', err);
          setProducts([]);
          setPagination(null);
        })
        .finally(() => setIsLoading(false));
    }, 500),
    [priceRange, selectedCategories, currentPage, ratingFilter, selectedLocation, sortby],
  );

  // on filter change
  useEffect(() => {
    fetchProducts();
    return () => fetchProducts.cancel();
  }, [fetchProducts]);

  const sortData = [
    { name: 'Name A to Z', value: 'name_asc' },
    { name: 'Name Z to A', value: 'name_desc' },
    { name: 'Oldest First', value: 'id_asc' },
    { name: 'Newest First', value: 'id_desc' },
    { name: 'Price Low to High', value: 'price_asc' },
    { name: 'Price High to Low', value: 'price_desc' },
  ];

  return (
    <>
      <section className={`bg-secondaryDark shop_banner ${Styles.shop_banner}`}>
        <div className="flex items-center justify-center sm:justify-between  bg-[#f5f9fa] h-full min-h-20 sm:min-h-36">
          <Icon className={'hidden sm:block -translate-x-20 '} />
          <div className="flex flex-col gap-2">
            <h1 className="font-semibold sm:text-3xl text-center text-Nileblue ">Shop</h1>
            {products && products.length > 0 && <p className="text-center font-medium text-Nileblue text-sm sm:text-lg">{products.length} Result Founds</p>}
          </div>
          <Icon className={'hidden sm:block -translate-x-20 '} />
        </div>
      </section>

      <div className="flex flex-col sm:flex-row gap-4 lg:gap-8 p-8 md:px-12 py-0 mx-auto">
        {/* Top Bar Filter */}
        <div className="w-full flex flex-col gap-4 p-4 md:px-8 ">
          {/* Sorting Bar */}
          <div className="w-full flex justify-end  p-4 rounded-lg">
            <Select value={sortby} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel className="hidden">Sorting Options</SelectLabel>
                  {sortData &&
                    sortData.map((item) => (
                      <SelectItem className="cursor-pointer" value={item.value} key={item.value}>
                        {item.name}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full flex gap-4 flex-col sm:flex-row">
            {/* Sidebar Filters */}
            <div className="w-full h-fit sm:max-w-xs p-4 bg-white shadow-md rounded-lg">
              {/* Category Filters */}
              <h2 className="text-lg font-medium text-[#143042] my-4">Category</h2>
              <div className="w-full max-w-full flex flex-col space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer text-grayDark">
                  <input type="checkbox" checked={!selectedCategories.length} onChange={() => setSelectedCategories([])} className="size-5 cursor-pointer checked:accent-secondaryDark" />
                  <span>All Categories</span>
                </label>
                {useMemo(
                  () =>
                    categories.map((category) => (
                      <label key={category.id} className="flex items-center space-x-2 cursor-pointer text-grayDark">
                        <input
                          type="checkbox"
                          value={category.name}
                          checked={selectedCategories.includes(category.name)}
                          onChange={() => setSelectedCategories((prev) => (prev.includes(category.name) ? prev.filter((c) => c !== category.name) : [...prev, category.name]))}
                          className="size-5 cursor-pointer checked:accent-secondaryDark"
                        />
                        <span>{category.name}</span>
                      </label>
                    )),
                  [categories, selectedCategories],
                )}
              </div>

              {/* Price Range Filter */}
              <h2 className="text-lg font-medium text-[#143042] mt-6 mb-4">Price Range</h2>
              <ReactRangeSliderInput min={100} max={5000} step={10} value={priceRange} onInput={setPriceRange} className="w-full" />
              <div className="w-full flex justify-between text-sm text-gray-600 mt-2">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>

              {/* Rating Filter */}
              <h2 className="text-lg font-medium text-[#143042] my-4">Ratings</h2>
              <div className="flex flex-col gap-4">
                {[3, 4, 5].map((rating) => (
                  <label key={rating} className="flex cursor-pointer items-center space-x-1">
                    <input type="radio" name="rating" value={rating} checked={ratingFilter === rating} onChange={() => setRatingFilter(rating)} className="size-5 checked:accent-secondaryDark" />
                    <div className="flex">
                      {Array.from({ length: rating }).map((_, i) => (
                        <Star key={i} size={20} className="fill-yellow-500 stroke-yellow-400" />
                      ))}
                    </div>
                  </label>
                ))}
              </div>

              {/* Location Filter */}
              <h2 className="text-lg font-medium text-[#143042] my-4">Location</h2>
              {useMemo(
                () =>
                  locations.map((location) => (
                    <label key={location.id} className="flex items-center space-x-2 cursor-pointer text-grayDark">
                      <input
                        type="radio"
                        name="location"
                        value={location.id}
                        checked={selectedLocation?.id === location.id}
                        onChange={() => setSelectedLocation(location)}
                        className="size-5 cursor-pointer checked:accent-secondaryDark"
                      />
                      <span>{location.name}</span>
                    </label>
                  )),
                [locations, selectedLocation],
              )}
            </div>

            {/* Product List */}
            <div className="w-full lg:flex-[4] flex flex-col h-full justify-between">
              {isLoading ? (
                <div className="h-screen  flex items-center justify-center bg-white bg-opacity-50">
                  <span className="loader"></span>
                </div>
              ) : null}

              <div className={`flex flex-wrap gap-4 ${isLoading ? 'opacity-50' : ''}`}>
                {!isLoading ? (
                  products.length > 0 ? (
                    products.map((product, index) => (
                      <GlobalCard
                        key={index}
                        productTitle={product.name}
                        productSlug={product.slug}
                        item_type={product?.item_type}
                        productPrice={product?.price?.regular_price ?? product?.price?.variations[0]?.regular_price}
                      />
                    ))
                  ) : (
                    <span className="text-gray-500 text-lg">No product found</span>
                  )
                ) : (
                  <span className="loader">Loading...</span>
                )}
              </div>
              {/* Pagination Controls */}
              {pagination && pagination.total > pagination.per_page && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  {[...Array(pagination.last_page)].map((_, index) => {
                    const page = index + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 border rounded ${pagination.current_page === page ? 'bg-secondaryDark text-white' : 'hover:bg-gray-200'}`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
