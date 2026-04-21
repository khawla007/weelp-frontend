'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import ReactRangeSliderInput from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import { GlobalCard } from '@/app/components/SingleProductCard';
import { Star } from 'lucide-react';
import { LoadingPage } from '@/app/components/Animation/Cards';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';

const PRODUCTS_API = '/api/public/search';
const LOCATIONS_API = '/api/public/regions-cities';
const CATEGORIES_API = '/api/public/taxonomies/categories';

export const SearchPage = () => {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([200, 1200]);
  const [ratingFilter, setRatingFilter] = useState(3);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [sortby, setSortby] = useState('');

  // Extract values from query params
  useEffect(() => {
    const defaultLocation = searchParams.get('location') || '';
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStartDate(searchParams.get('start_date') || '2025-03-26');
    setEndDate(searchParams.get('end_date') || '2025-03-28');
    setQuantity(parseInt(searchParams.get('quantity')) || 1);

    axios
      .get(LOCATIONS_API)
      .then((res) => {
        const allLocations = res.data?.data ?? [];
        setLocations(allLocations);

        // Set the default location from query params
        const foundLocation = allLocations.find((loc) => loc.name.toLowerCase() === defaultLocation.toLowerCase());
        setSelectedLocation(foundLocation || allLocations[0]);
      })
      .catch((err) => console.log('Error fetching locations:', err));
  }, [searchParams]);

  useEffect(() => {
    axios
      .get(CATEGORIES_API)
      .then((res) => setCategories(res.data?.data ?? []))
      .catch((err) => console.log('Error fetching categories:', err));
  }, []);

  const fetchProductsRef = useRef(null);
  const fetchProducts = useCallback(() => {
    if (!selectedLocation || !startDate || !endDate) return;

    if (fetchProductsRef.current) {
      clearTimeout(fetchProductsRef.current);
    }
    fetchProductsRef.current = setTimeout(() => {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        location: String(selectedLocation.name).toLowerCase(),
        start_date: startDate,
        end_date: endDate,
        quantity: quantity.toString(),
        min_price: priceRange[0],
        max_price: priceRange[1],
        min_rating: ratingFilter,
        sort_by: sortby,
      });

      if (selectedCategories.length) {
        queryParams.append('categories', selectedCategories.join(','));
      }

      axios
        .get(`${PRODUCTS_API}?${queryParams.toString()}`)
        .then((res) => {
          setProducts(res.status === 200 && Array.isArray(res.data?.data) ? res.data.data : []);
        })
        .catch((err) => console.log('Error fetching products:', err))
        .finally(() => setIsLoading(false));
    }, 500);
  }, [priceRange, selectedCategories, ratingFilter, selectedLocation, startDate, endDate, quantity, sortby]);

  useEffect(() => {
    if (selectedLocation) {
      fetchProducts();
    }
    return () => {
      if (fetchProductsRef.current) {
        clearTimeout(fetchProductsRef.current);
      }
    };
  }, [fetchProducts]);

  //sort data
  const sortData = [
    { name: 'Name A to Z', value: 'name_asc' },
    { name: 'Name Z to A', value: 'name_desc' },
    { name: 'Oldest First', value: 'id_asc' },
    { name: 'Newest First', value: 'id_desc' },
    { name: 'Price Low to High', value: 'price_asc' },
    { name: 'Price High to Low', value: 'price_desc' },
  ];

  return (
    <section className="flex flex-col w-full">
      {/* Top Bar Filter */}
      <div className="w-full flex justify-end p-4 sm:px-12 sm:py-4 mx-auto">
        <Select value={sortby} onValueChange={setSortby}>
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
      <div className="w-full flex flex-col md:flex-row gap-4 lg:gap-8 p-4 sm:px-12 sm:py-4 mx-auto">
        {/* Sidebar Filters */}
        <div className="w-full sm:max-w-xs p-4 bg-white shadow-md rounded-lg">
          <h2 className="text-lg font-medium text-[#143042] my-4">Category</h2>
          <div className="flex flex-col space-y-2 h-48 overflow-scroll overflow-x-hidden">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  value={category.name}
                  checked={selectedCategories.includes(category.name)}
                  onChange={() => setSelectedCategories((prev) => (prev.includes(category.name) ? prev.filter((c) => c !== category.name) : [...prev, category.name]))}
                  className="size-5 cursor-pointer checked:accent-secondaryDark"
                />
                <span>{category.name}</span>
              </label>
            ))}
          </div>

          <h2 className="text-lg font-medium text-[#143042] mt-6 mb-4">Price Range</h2>
          <ReactRangeSliderInput min={100} max={5000} step={10} value={priceRange} onInput={setPriceRange} className="w-full" />
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>

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

          <h2 className="text-lg font-medium text-[#143042] my-4">Location</h2>
          {locations.map((location) => (
            <label key={location.id} className="flex items-center space-x-2 pb-2 cursor-pointer">
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
          ))}
        </div>

        {/* Product Display */}
        <div className="flex-1 flex items-center justify-center h-full w-full">
          {isLoading ? (
            <div className="h-screen flex items-center justify-center bg-white bg-opacity-50">
              <span className="loader"></span>
            </div>
          ) : (
            <div className="w-full flex flex-wrap gap-6">
              {products.length > 0 ? (
                products.map((product, index) => {
                  const productPrice = product?.item_type === 'itinerary' ? product?.schedule_total_price : (product?.pricing?.regular_price ?? product?.base_pricing?.variations[0]?.regular_price);
                  const productCurrency = product?.item_type === 'itinerary' ? product?.schedule_total_currency : product?.pricing?.currency;
                  return (
                    <GlobalCard
                      key={index}
                      imgsrc={product?.featured_image}
                      productTitle={product?.name}
                      productPrice={productPrice}
                      currency={productCurrency}
                      item_type={product?.item_type}
                      productSlug={product?.slug}
                      citySlug={product?.city_slug}
                    />
                  );
                })
              ) : (
                <div className="grid h-full  ">
                  <span className="text-gray-500">Sorry No Items</span>
                  <Button asChild>
                    <Link className={'bg-secondaryDark'} href={'/shop'}>
                      Back To Shop
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
