'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import { useForm, FormProvider, Controller, useWatch } from 'react-hook-form';
import { useParams } from 'next/navigation';
import debounce from 'lodash.debounce';
import ReactRangeSliderInput from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import { Star } from 'lucide-react';
import { useCategories } from '@/hooks/api/public/categories';
import { useRegionItems } from '@/hooks/api/public/region';
import { GlobalCard } from '@/app/components/SingleProductCard';
import { LoadingPage } from '@/app/components/Animation/Cards';

export const RegionFilterNew = () => {
  const ref = useRef();
  const { region } = useParams();

  // Initialize form
  const methods = useForm({
    defaultValues: {
      categories: [],
      price: [200, 1200],
      rating: 0,
      page: 1,
    },
  });

  const filters = useWatch({ control: methods.control });
  const priceRange = useWatch({ control: methods.control, name: 'price' });

  // Fetch categories
  const { data: categoryRes = {} } = useCategories();
  const categories = categoryRes.data || [];

  // Convert filters into API query params
  const filterQuery = {
    min_price: filters.price[0],
    max_price: filters.price[1],
    page: filters.page,
    min_rating: filters.rating,
    categories: filters.categories.length > 0 ? filters.categories.join(',') : undefined,
  };

  const { data: products = [], isLoading, pagination, mutate } = useRegionItems(region, filterQuery);

  // Debounced refetch
  const debouncedFetch = useCallback(
    debounce(() => mutate(), 500),
    [],
  );

  useEffect(() => {
    debouncedFetch();
    return () => debouncedFetch.cancel();
  }, [filters, debouncedFetch]);

  const handlePageChange = (page) => methods.setValue('page', page); // page handle manage

  // manage price range
  const handlePriceRangeChange = (values) => {
    methods.setValue('price', values, {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const CategoryFilter = () => (
    <Controller
      name="categories"
      control={methods.control}
      render={({ field }) => (
        <div className="space-y-2 h-48 overflow-x-hidden overflow-auto">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={field.value.length === 0}
              className="size-5 transition-all border-2 rounded cursor-pointer checked:accent-secondaryDark"
              onChange={() => field.onChange([])} // selecting "All" clears all categories
            />
            <span>All Categories</span>
          </label>
          {categories.map((cat) => (
            <label key={cat.name} className="flex items-center space-x-2">
              <input
                type="checkbox"
                value={cat.name}
                checked={field.value.includes(cat.name)}
                className="size-5 transition-all border-2 rounded cursor-pointer checked:accent-secondaryDark"
                onChange={(e) => {
                  const checked = e.target.checked;
                  const next = checked ? [...field.value, cat.name] : field.value.filter((c) => c !== cat.name);
                  field.onChange(next);
                }}
              />
              <span>{cat.name}</span>
            </label>
          ))}
        </div>
      )}
    />
  );

  const PriceFilter = () => (
    <Controller
      name="price"
      control={methods.control}
      render={({ field }) => (
        <>
          <ReactRangeSliderInput
            min={100}
            max={5000}
            step={100}
            value={field.value}
            onInput={field.onChange} // direct + stable
            // Fires on drag
            onChange={field.onChange} // Fires on click and drag end
          />
          <div className="flex justify-between text-sm mt-2">
            <span>${field.value[0]}</span>
            <span>${field.value[1]}</span>
          </div>
        </>
      )}
    />
  );

  const RatingFilter = () => (
    <Controller
      name="rating"
      control={methods.control}
      render={({ field }) => (
        <div className="space-y-2">
          {[3, 4, 5].map((rating) => (
            <label key={rating} className="flex items-center space-x-2">
              <input type="radio" value={rating} checked={field.value === rating} onChange={() => field.onChange(rating)} />
              <div className="flex items-center">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} size={16} className="fill-yellow-500 stroke-none" />
                ))}
                <span className="ml-1 text-sm">& up</span>
              </div>
            </label>
          ))}
        </div>
      )}
    />
  );

  const Pagination = () =>
    pagination?.lastPage > 1 && (
      <div className="flex justify-center mt-6 space-x-2">
        {Array.from({ length: pagination.lastPage }, (_, i) => (
          <button key={i} onClick={() => handlePageChange(i + 1)} className={`px-3 py-1 rounded ${pagination.currentPage === i + 1 ? 'bg-secondaryDark text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
            {i + 1}
          </button>
        ))}
      </div>
    );

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col sm:flex-row sm:gap-4 lg:gap-8 p-4 ">
        {/* Sidebar */}
        <aside className="w-full sm:max-w-xs p-6 bg-white rounded shadow h-fit">
          <h2 className="text-lg font-semibold mb-4">Category</h2>
          <CategoryFilter />

          <h2 className="text-lg font-semibold mt-6 mb-2">Price Range</h2>
          <PriceFilter />

          <h2 className="text-lg font-semibold mt-6 mb-2">Rating</h2>
          <RatingFilter />
        </aside>

        {/* Products Grid */}
        <div className="w-full lg:flex-[4] sm:my-12 flex flex-col">
          {isLoading && <LoadingPage />}
          <div className="flex flex-wrap gap-4">
            {!isLoading && products.length > 0
              ? products.map((product) => (
                  <GlobalCard
                    key={product.slug}
                    productTitle={product.name}
                    productSlug={product.slug}
                    item_type={product.item_type}
                    productPrice={product?.pricing?.regular_price ?? product?.base_pricing?.variations?.[0]?.regular_price}
                  />
                ))
              : !isLoading && <p className="text-center w-full py-8 text-gray-500">Sorry, no products found.</p>}
          </div>
          <Pagination />
        </div>
      </div>
    </FormProvider>
  );
};
