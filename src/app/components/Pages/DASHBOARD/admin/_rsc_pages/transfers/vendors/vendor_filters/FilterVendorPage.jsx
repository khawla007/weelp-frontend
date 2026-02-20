'use client';

import { useForm, useWatch } from 'react-hook-form';
import { useEffect, useState, useMemo } from 'react';
import { debounce } from 'lodash';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAllVendorsAdmin } from '@/hooks/api/admin/vendors';
import { Card } from '@/components/ui/card';
import { CustomPagination } from '@/app/components/Pagination';
import { CardVendor } from '../shared/vendor_cards';
import { VendorNoResultFound } from '../shared/VendorNoResultFound';

const FilterVendorPage = () => {
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

  const { vendors = {}, isLoading, error, mutate } = useAllVendorsAdmin(query); // fetch vendor data

  const handlePageChange = (newPage) => {
    setValue('page', newPage);
  };

  console.log(error);
  if (error) return <div className="text-red-400">{error}</div>;
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
                  <Input type="search" placeholder="Search vendors..." {...field} className="max-w-md" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      {isLoading && <p className="loader"></p>}

      {!isLoading && vendors?.data?.length === 0 && <VendorNoResultFound />}

      {vendors?.data?.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendors.data.map((vendor) => (
            <CardVendor
              key={vendor.id}
              id={vendor?.id}
              title={vendor?.name}
              description={vendor?.description}
              status={vendor?.status}
              vehicles={vendor?.vehicles?.[0]?.make}
              routes={vendor?.routes?.[0]?.description}
              mutate={mutate} // send mutate
            />
          ))}
        </div>
      )}

      <CustomPagination currentPage={vendors?.current_page || 1} totalItems={vendors?.total} itemsPerPage={vendors?.per_page} onPageChange={handlePageChange} />
    </Card>
  );
};

export default FilterVendorPage;
