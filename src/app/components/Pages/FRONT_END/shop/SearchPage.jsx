'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import ReactRangeSliderInput from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import '@/app/styles/range-slider.css';
import { GlobalCard } from '@/app/components/SingleProductCard';
import { Search, SlidersHorizontal, Star } from 'lucide-react';
import { ListingCardSkeleton } from '@/app/components/DashboardShared/ListingCard/ListingCardSkeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDiscoveryDate, parseDiscoverySearchParams } from '@/app/components/Pages/FRONT_END/shared/discoverySearchParams';

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';

const PRODUCTS_API = '/api/public/search';
const LOCATIONS_API = '/api/public/regions-cities';
const CATEGORIES_API = '/api/public/taxonomies/categories';

export const SearchPage = () => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.toString();
  const parsedSearch = useMemo(() => parseDiscoverySearchParams(searchQuery), [searchQuery]);
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
  const [categorySearch, setCategorySearch] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const fetchProductsRef = useRef(null);
  const productRequestIdRef = useRef(0);

  useEffect(() => {
    productRequestIdRef.current += 1;
    if (fetchProductsRef.current) clearTimeout(fetchProductsRef.current);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedLocation(null);
    setProducts([]);
    setIsLoading(false);
    setStartDate(formatDiscoveryDate(parsedSearch.dateRange.from) || '');
    setEndDate(formatDiscoveryDate(parsedSearch.dateRange.to) || '');
    setQuantity(parsedSearch.guests.adults);
  }, [parsedSearch]);

  useEffect(() => {
    let active = true;
    axios
      .get(LOCATIONS_API)
      .then((res) => {
        if (active) setLocations(res.data?.data ?? []);
      })
      .catch((err) => console.log('Error fetching locations:', err));

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const foundLocation = locations.find((location) => location.slug?.toLowerCase() === parsedSearch.location || location.name?.toLowerCase() === parsedSearch.location);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedLocation(foundLocation || null);
    if (!foundLocation) setProducts([]);
  }, [locations, parsedSearch.location]);

  useEffect(() => {
    axios
      .get(CATEGORIES_API)
      .then((res) => setCategories(res.data?.data ?? []))
      .catch((err) => console.log('Error fetching categories:', err));
  }, []);

  const fetchProducts = useCallback(() => {
    if (!selectedLocation || !startDate || !endDate) return;

    if (fetchProductsRef.current) {
      clearTimeout(fetchProductsRef.current);
    }
    const requestId = productRequestIdRef.current + 1;
    productRequestIdRef.current = requestId;
    fetchProductsRef.current = setTimeout(() => {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        location: String(selectedLocation.slug || selectedLocation.name).toLowerCase(),
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
          if (productRequestIdRef.current !== requestId) return;
          setProducts(res.status === 200 && Array.isArray(res.data?.data) ? res.data.data : []);
        })
        .catch((err) => console.log('Error fetching products:', err))
        .finally(() => {
          if (productRequestIdRef.current === requestId) setIsLoading(false);
        });
    }, 500);
  }, [priceRange, selectedCategories, ratingFilter, selectedLocation, startDate, endDate, quantity, sortby]);

  useEffect(() => {
    if (selectedLocation) {
      fetchProducts();
    } else {
      productRequestIdRef.current += 1;
    }
    return () => {
      if (fetchProductsRef.current) {
        clearTimeout(fetchProductsRef.current);
      }
      productRequestIdRef.current += 1;
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

  const filteredCategories = useMemo(() => {
    const query = categorySearch.trim().toLowerCase();

    if (!query) return categories;

    return categories.filter((category) => category.name.toLowerCase().includes(query));
  }, [categories, categorySearch]);

  const filteredLocations = useMemo(() => {
    const query = locationSearch.trim().toLowerCase();

    if (!query) return locations;

    return locations.filter((location) => location.name.toLowerCase().includes(query));
  }, [locations, locationSearch]);

  return (
    <section className="flex flex-col w-full">
      {/* Top Bar Filter */}
      <div data-testid="search-results-toolbar" className="container-page flex items-center gap-3 py-4 sm:py-6 md:hidden">
        <Button
          type="button"
          variant="outline"
          aria-controls="search-results-filters"
          aria-expanded={mobileFiltersOpen}
          onClick={() => setMobileFiltersOpen((open) => !open)}
          className="h-11 flex-1 justify-center gap-2 md:hidden"
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filters
        </Button>
      </div>
      <div data-testid="search-results-layout" className="container-page flex flex-col gap-6 pb-10 md:flex-row md:items-start md:gap-4 lg:gap-8">
        {/* Sidebar Filters */}
        <aside
          id="search-results-filters"
          data-testid="search-filters"
          className={`w-full rounded-lg border border-border bg-background p-4 shadow-none md:block md:max-w-xs md:flex-none md:shadow-md dark:md:shadow-none ${mobileFiltersOpen ? 'block' : 'hidden'}`}
        >
          <h2 className="mb-3 mt-4 text-lg font-medium text-foreground">Sort</h2>
          <Select value={sortby} onValueChange={setSortby}>
            <SelectTrigger aria-label="Sort results" className="h-11 w-full">
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

          <h2 className="text-lg font-medium text-foreground my-4">Category</h2>
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              aria-label="Search categories"
              placeholder="Search categories"
              value={categorySearch}
              onChange={(event) => setCategorySearch(event.target.value)}
              className="h-9 pl-9"
            />
          </div>
          <div data-testid="category-filter-options" className="flex max-h-48 flex-col space-y-2 overflow-y-auto overflow-x-hidden pr-1">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={category.name}
                    checked={selectedCategories.includes(category.name)}
                    onChange={() => setSelectedCategories((prev) => (prev.includes(category.name) ? prev.filter((c) => c !== category.name) : [...prev, category.name]))}
                    className="size-5 cursor-pointer checked:accent-weelp-sage-deep"
                  />
                  <span>{category.name}</span>
                </label>
              ))
            ) : (
              <p className="rounded-md border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">No categories found.</p>
            )}
          </div>

          <h2 className="text-lg font-medium text-foreground mt-6 mb-4">Price Range</h2>
          <ReactRangeSliderInput min={100} max={5000} step={10} value={priceRange} onInput={setPriceRange} className="w-full" />
          <div className="flex justify-between text-sm text-copy mt-2">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>

          <h2 className="text-lg font-medium text-foreground my-4">Ratings</h2>
          <div className="flex flex-col gap-4">
            {[3, 4, 5].map((rating) => (
              <label key={rating} className="flex cursor-pointer items-center space-x-1">
                <input type="radio" name="rating" value={rating} checked={ratingFilter === rating} onChange={() => setRatingFilter(rating)} className="size-5 checked:accent-weelp-sage-deep" />
                <div className="flex">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} size={20} className="fill-yellow-500 stroke-yellow-400" />
                  ))}
                </div>
              </label>
            ))}
          </div>

          <h2 className="text-lg font-medium text-foreground my-4">Location</h2>
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" aria-label="Search locations" placeholder="Search locations" value={locationSearch} onChange={(event) => setLocationSearch(event.target.value)} className="h-9 pl-9" />
          </div>
          <div data-testid="location-filter-options" className="flex max-h-56 flex-col space-y-2 overflow-y-auto overflow-x-hidden pr-1">
            {filteredLocations.length > 0 ? (
              filteredLocations.map((location) => (
                <label key={location.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="location"
                    value={location.id}
                    checked={selectedLocation?.id === location.id}
                    onChange={() => setSelectedLocation(location)}
                    className="size-5 cursor-pointer checked:accent-weelp-sage-deep"
                  />
                  <span>{location.name}</span>
                </label>
              ))
            ) : (
              <p className="rounded-md border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">No locations found.</p>
            )}
          </div>
        </aside>

        {/* Product Display */}
        <div data-testid="search-results" className="flex min-w-0 w-full flex-1 items-center justify-center">
          {isLoading ? (
            <ListingCardSkeleton count={6} className="w-full" />
          ) : (
            <div className="grid w-full grid-cols-1 items-stretch gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
                      productRating={product?.average_rating ?? product?.rating_average ?? product?.review_summary?.average_rating ?? product?.rating}
                      reviewCount={product?.reviews_count ?? product?.review_count ?? product?.review_summary?.total_reviews}
                      stretch
                    />
                  );
                })
              ) : (
                <div data-testid="search-empty-results" className="flex min-h-[420px] w-full flex-col items-center justify-center gap-4 text-center">
                  <span className="text-muted-foreground">Sorry No Items</span>
                  <Button asChild>
                    <Link className={'bg-weelp-sage-deep'} href={'/cities'}>
                      Explore Cities
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
