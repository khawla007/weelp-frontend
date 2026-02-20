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

export const FilterStates = () => {
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
  }, [query, debouncedSetQuery]);

  const { data, error, isValidating } = useSWR(`/api/admin/destinations/states?name=${debouncedQuery}&page=${page}`, fetcher);

  // destructure API response
  const { data: states = [], total = 0, per_page: perPage = 0, last_page: lastPage = 1, current_page: currentPage = 1 } = data || {};

  return (
    <FormProvider {...methods}>
      <form className="space-y-4">
        {/* Search */}
        <SearchBar searchText="Search states" />

        {/* RESULT Found */}
        <div className="flex flex-col gap-4 h-full">
          {/* Loading State */}

          {isValidating && <span className="loader"></span>}

          {/* Error State */}
          {!isValidating && error && <div className="text-red-500 text-center py-4">Failed to load data. Please try again.</div>}
          {/* No Items Found */}
          {!isValidating && !error && states.length === 0 && <div className="text-gray-500 text-center py-4">No states found.</div>}

          {/* For states */}
          {!isValidating && !error && states.length > 0 && (
            <div className="flex flex-col gap-4">
              <Card className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-inherit shadow-none border-none">
                {states.map((country, index) => (
                  <RouteCard key={country?.id} {...country} />
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
