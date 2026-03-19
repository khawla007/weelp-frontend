'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import _ from 'lodash';
import ReactRangeSliderInput from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import ItemCard from '@/app/components/ui/item-card';
import { Star } from 'lucide-react';
import { LoadingPage } from '@/app/components/Animation/Cards';
import { log, formatCurrency } from '@/lib/utils';

const ITEM_TYPE_PLURAL = {
  activity: 'activities',
  itinerary: 'itineraries',
  package: 'packages',
  transfer: 'transfers',
};

const ITEM_TYPES = [
  { value: '', label: 'All' },
  { value: 'activity', label: 'Activities' },
  { value: 'itinerary', label: 'Itineraries' },
  { value: 'package', label: 'Packages' },
];

export const CityFilter = ({ hasAnyData = true, cityName }) => {
  const { city } = useParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedItemType, setSelectedItemType] = useState('');
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
          setCategories(response?.data?.data);
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
      if (selectedItemType) query += `&item_type=${selectedItemType}`;

      axios
        .get(`${process.env.NEXT_PUBLIC_API_BASE_URLL}api/${city}/all-items${query}`)
        .then((response) => {
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
    [priceRange, selectedCategories, selectedItemType, currentPage, city, ratingFilter],
  );

  // Effect to trigger debounced fetch
  useEffect(() => {
    debouncedFetchProducts();

    return () => {
      debouncedFetchProducts.cancel();
    };
  }, [debouncedFetchProducts]);

  // Add aria-label to slider thumbs for accessibility
  useEffect(() => {
    const sliders = document.querySelectorAll('.range-slider__thumb');
    sliders.forEach((slider, index) => {
      slider.setAttribute('aria-label', index === 0 ? `Minimum price: $${priceRange[0]}` : `Maximum price: $${priceRange[1]}`);
    });
  }, [priceRange]);

  // Category selection handler
  const handleCheckboxChange = useCallback((category) => {
    setSelectedCategories((prevSelected) => (category === 'all' ? [] : prevSelected.includes(category) ? prevSelected.filter((item) => item !== category) : [...prevSelected, category]));
    setCurrentPage(1);
  }, []);

  // Item type selection handler
  const handleItemTypeChange = useCallback((type) => {
    setSelectedItemType(type);
    setCurrentPage(1);
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
        <label key={index} className={`flex items-center space-x-2 text-md font-medium text-grayDark ${!hasAnyData ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
          <input
            type="checkbox"
            id={`category-${index}`}
            name="category"
            value={category?.name}
            checked={selectedCategories.includes(category?.name)}
            onChange={() => handleCheckboxChange(category?.name)}
            disabled={!hasAnyData}
            className={`w-4 h-4 transition-all border-2 rounded ${!hasAnyData ? 'cursor-not-allowed' : 'cursor-pointer'} ${selectedCategories.includes(category?.name) && 'accent-[#18181B]'}`}
          />
          <span>{category?.name}</span>
        </label>
      )),
    [categories, selectedCategories, handleCheckboxChange, hasAnyData],
  );

  // Star rating filter component
  const StarRatingFilter = () => (
    <div className="mt-6">
      <h2 className="font-home-heading text-lg font-bold text-[var(--weelp-home-ink)] my-4">Ratings</h2>
      <div className={`flex w-fit flex-col gap-4 ${!hasAnyData ? 'opacity-50 pointer-events-none' : ''}`}>
        {[3, 4, 5].map((rating) => (
          <label key={rating} className={`flex items-center space-x-1 py-1 rounded ${!hasAnyData ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
            <input
              type="radio"
              id={`rating-${rating}`}
              name="rating"
              value={rating}
              aria-label={`${rating} stars`}
              checked={ratingFilter === rating}
              onChange={() => handleRatingChange(rating)}
              disabled={!hasAnyData}
              className={`size-5 ${!hasAnyData ? 'cursor-not-allowed' : 'cursor-pointer'} checked:accent-[#18181B]`}
            />
            <div className="flex" aria-hidden="true">
              {Array.from({ length: rating }).map((_, i) => (
                <Star key={i} size={20} className="stroke-none fill-[var(--weelp-home-accent)]" />
              ))}
            </div>
          </label>
        ))}
      </div>
    </div>
  );

  const displayName = cityName || city?.replace(/-/g, ' ')?.replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="container mx-auto px-4">
      {/* Section Heading */}
      <div className="text-center pt-8 pb-2">
        <h2 className="font-home-heading text-[28px] md:text-[2.8rem] font-extrabold tracking-[-0.04em] text-[var(--weelp-home-ink)]">Explore {displayName}</h2>
        <p className="text-[15px] leading-[1.4] text-[var(--weelp-home-copy)] mt-2">Browse all activities, itineraries and packages</p>
      </div>

      {/* Item Type Filter Pills */}
      <div className="flex justify-center gap-3 py-6">
        {ITEM_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => handleItemTypeChange(type.value)}
            disabled={!hasAnyData}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
              selectedItemType === type.value
                ? 'bg-[#18181B] text-white border-[#18181B] shadow-md'
                : 'bg-white text-[var(--weelp-home-ink)] border-[var(--weelp-home-border)] hover:border-[#18181B]'
            } ${!hasAnyData ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {type.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:gap-4 lg:gap-8">
        {/* Sidebar Filter */}
        <div className="w-full flex-2 p-4 px-8 sm:my-4 sm:max-w-xs bg-white h-fit shadow-md rounded-lg">
          <h2 className="font-home-heading text-lg font-bold text-[var(--weelp-home-ink)] my-4">Category</h2>
          <div className="flex flex-col space-y-2 h-48 overflow-x-hidden overflow-auto">
            <label className={`flex items-center space-x-2 text-md font-medium text-grayDark ${!hasAnyData ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
              <input
                type="checkbox"
                id="category-all"
                name="category"
                value="all"
                checked={selectedCategories.length === 0}
                onChange={() => handleCheckboxChange('all')}
                disabled={!hasAnyData}
                className={`size-5 transition-all border-2 rounded ${!hasAnyData ? 'cursor-not-allowed' : 'cursor-pointer'} checked:accent-[#18181B]`}
              />
              <span>All Category</span>
            </label>
            {categoryList}
          </div>

          {/* Price Range Slider */}
          <div className="mt-6">
            <h2 className="font-home-heading text-lg font-bold text-[var(--weelp-home-ink)] mt-6 mb-4">Price Range</h2>
            <label className={`block ${!hasAnyData ? 'opacity-50 pointer-events-none' : ''}`}>
              <span className="sr-only">Price Range</span>
              <div className="px-2 py-4">
                <ReactRangeSliderInput
                  min={100}
                  max={5000}
                  step={10}
                  value={priceRange}
                  onInput={handlePriceRangeChange}
                  className="w-full"
                  disabled={!hasAnyData}
                />
              </div>
            </label>
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
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 py-4 sm:py-4 ${isLoading ? 'opacity-50' : ''}`}>
            {!isLoading && products?.length > 0 ? (
              products.map((product, index) => {
                const pluralType = ITEM_TYPE_PLURAL[product.item_type] || product.item_type;
                const href = city
                  ? `/cities/${city}/${pluralType}/${product.slug}`
                  : `/${product.item_type}/${product.slug}`;
                const image = product.featured_image || product.media_gallery?.[0]?.media?.url || product.image || '/assets/Card.png';
                const rawPrice = product.pricing?.regular_price ?? product.base_pricing?.variations?.[0]?.regular_price;
                const currency = product.pricing?.currency;
                const price = rawPrice && currency
                  ? formatCurrency(parseInt(rawPrice), currency)
                  : rawPrice ? `$${rawPrice}` : '';
                const category = product.item_type
                  ? product.item_type.charAt(0).toUpperCase() + product.item_type.slice(1)
                  : '';

                return (
                  <ItemCard
                    key={product.id || index}
                    href={href}
                    image={image}
                    title={product.name}
                    category={category}
                    price={price}
                  />
                );
              })
            ) : (
              <div className="w-full flex items-center justify-center min-h-[300px]">
                <span className="text-lg text-gray-600">Sorry No Item Found</span>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <div className="flex justify-center mt-6 space-x-2 w-full">
              {Array.from({ length: pagination.last_page }, (_, i) => (
                <button key={i} onClick={() => handlePageChange(i + 1)} className={`px-3 py-2 border ${currentPage === i + 1 ? 'bg-[#18181B] text-white' : 'bg-[var(--weelp-home-soft)] text-[var(--weelp-home-ink)]'} rounded-full transition-colors`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
