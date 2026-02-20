'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { FilterOrdersPage } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/FilterOrdersPage';
import { NavigationOrder, StatsOrdersCards } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/orders_shared';
import { useAllOrdersAdmin } from '@/hooks/api/admin/orders';
import { useForm, FormProvider, useFormContext, useWatch } from 'react-hook-form';
import { CustomPagination } from '@/app/components/Pagination';
import { debounce } from 'lodash';
import { editVendorStatusbyIdAdmin } from '@/lib/actions/vendor';

const OrdersPage = () => {
  // initialize form
  const methods = useForm({
    defaultValues: {
      page: 1,
    },
  });

  const { register, reset, setValue, control } = methods; // desctructure
  const filters = useWatch({ control: control }); // intialize watching
  const [debouncedFilters, setDebouncedFilters] = useState(filters); // intialize filter

  // on submt
  const handleOnchange = (page) => {
    // set value manually
    setValue('page', page);
  };

  const debouncedUpdate = useMemo(
    () =>
      debounce((newFilters) => {
        setDebouncedFilters(newFilters);
      }, 500),
    [],
  );

  // side effect for if fiilter change
  useEffect(() => {
    debouncedUpdate(filters);
    return () => debouncedUpdate.cancel();
  }, [filters, debouncedUpdate]);

  // Memoized query string
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedFilters.page) params.append('page', debouncedFilters.page);

    return params.toString();
  }, [debouncedFilters]);

  // fetch orders
  const { orders = {}, isLoading: isLoadingOrders, isValidating: isValidatingOrders, mutate: mutateOrders, error: errorOrders } = useAllOrdersAdmin(`?${queryParams}`);

  console.log(orders);
  // safely extract data
  const { data = {} } = orders;
  const { current_page = '', per_page = '', total = '' } = data;

  return (
    <div className="spacye-y-4">
      <NavigationOrder title={'Orders'} desciption={'Manage your orders and track their status'} url={'/dashboard/admin/orders/new'} labelUrl={'Order'} />
      <StatsOrdersCards summary={data?.summary ?? {}} />

      {/* Provider for Filter */}
      <FormProvider {...methods}>
        <FilterOrdersPage data={data} mutateOrders={mutateOrders} />

        {/* Pagination */}
        {!isLoadingOrders && <CustomPagination totalItems={total} currentPage={current_page} itemsPerPage={per_page} onPageChange={handleOnchange} />}
      </FormProvider>
    </div>
  );
};

export default OrdersPage;
