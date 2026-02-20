'use client';

import { useForm, useWatch } from 'react-hook-form';
import { useEffect, useState, useMemo } from 'react';
import { debounce } from 'lodash';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { CustomPagination } from '@/app/components/Pagination';
import { CardVendorRoute } from '../shared/vendor_cards';
import useSWR from 'swr';
import { useParams } from 'next/navigation';
import { fetcher } from '@/lib/fetchers';
import { VendorNoResultFound } from '../shared/VendorNoResultFound';

const FilterVendorRoutePage = () => {
  const { vendorId } = useParams(); // get vendor id

  // intialize method
  const form = useForm({
    defaultValues: {
      search: '',
      page: 1,
    },
  });

  const { control, setValue } = form;
  const search = useWatch({ control, name: 'search' });
  const page = useWatch({ control, name: 'page' });

  const [query, setQuery] = useState('?page=1');

  // debounced query update
  const debouncedSetQuery = useMemo(
    () =>
      debounce((search, page) => {
        const queryString = `?search=${encodeURIComponent(search || '')}&page=${page}`;
        setQuery(queryString);
      }, 500),
    [],
  );

  useEffect(() => {
    debouncedSetQuery(search, page);
    return () => debouncedSetQuery.cancel();
  }, [search, page, debouncedSetQuery]);

  const { data = {}, isLoading, error } = useSWR(`/api/admin/vendors/${vendorId}/routes${query}`, fetcher); // for single route get dynamic
  const { current_page, data: routes = [], per_page, total } = data?.data || {}; // destructure data

  const handlePageChange = (newPage) => {
    setValue('page', newPage);
  };

  return (
    <Card className="bg-inherit border-none shadow-none flex flex-col gap-4">
      <Form {...form}>
        <form className="space-y-4">
          <FormField
            control={control}
            name="search"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="search" placeholder="Search routes..." {...field} className="max-w-md" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      {isLoading && <p className="loader"></p>}

      {error && <p className="text-red-400">Something Went Wrong</p>}

      {!isLoading && routes?.length === 0 && <VendorNoResultFound />}

      {routes?.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {routes.map((route, index) => (
            <CardVendorRoute
              key={index}
              id={route?.id}
              title={route?.name}
              description={route?.description}
              status={route?.status}
              start_point={route?.start_point}
              end_point={route?.end_point}
              base_price={route?.base_price}
              price_per_km={route?.price_per_km}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <CustomPagination currentPage={current_page || 1} totalItems={total} itemsPerPage={per_page} onPageChange={handlePageChange} />
    </Card>
  );
};

export default FilterVendorRoutePage;
