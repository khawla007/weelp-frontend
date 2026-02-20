'use client';
import React, { useEffect, useCallback, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import useSWR from 'swr';
import debounce from 'lodash.debounce';
import { fetcher } from '@/lib/fetchers';
import { SearchBar } from '../components/SearchBar';
import { RouteCard } from '../components/cards/RouteCard';
import { CustomPagination } from '@/app/components/Pagination';

export const FilterCities = () => {
  const methods = useForm({ defaultValues: { query: '', page: 1 } });
  const { control, setValue } = methods;
  const page = useWatch({ control, name: 'page' });
  const query = useWatch({ control, name: 'query' });

  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // debounce using lodash.debounce
  const debouncedSetQuery = useCallback(
    debounce((val) => setDebouncedQuery(val), 500), // set delay time
    [],
  );

  useEffect(() => {
    debouncedSetQuery(query);

    return debouncedSetQuery.cancel();
  }, [query, debouncedSetQuery]);

  const { data, error, isValidating } = useSWR(`/api/admin/destinations/cities?name=${debouncedQuery}&page=${page}`, fetcher); // city

  // destructure API response
  const { data: cities = [], total = 0, per_page: perPage = 0, last_page: lastPage = 1, current_page: currentPage = 1 } = data || {};

  console.log(cities);

  return (
    <FormProvider {...methods}>
      <form className="space-y-4">
        {/* Search */}
        <SearchBar searchText="Search city" />

        {/* RESULT Found */}
        <div className="flex flex-col gap-4 h-full">
          {/* Loading State */}

          {isValidating && <span className="loader"></span>}

          {/* Error State */}
          {!isValidating && error && <div className="text-red-500 text-center py-4">Failed to load data. Please try again.</div>}
          {/* No Items Found */}
          {!isValidating && !error && cities.length === 0 && <div className="text-gray-500 text-center py-4">No cities found.</div>}

          {/* For cities */}
          {!isValidating && !error && cities.length > 0 && (
            <div className="flex flex-col gap-4">
              <Card className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-inherit shadow-none border-none">
                {cities.map((city, index) => (
                  <RouteCard key={city?.id} {...city} />
                ))}
              </Card>

              {/* Pagination */}
              <CustomPagination totalItems={total} itemsPerPage={perPage} currentPage={currentPage} onPageChange={(newPage) => setValue('page', newPage)} />
            </div>
          )}
        </div>
      </form>
    </FormProvider>
  );
};
