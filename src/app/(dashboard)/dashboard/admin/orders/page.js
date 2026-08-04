'use client';

import { useState } from 'react';

import { CustomPagination } from '@/app/components/Pagination';
import { FilterOrdersPage } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/FilterOrdersPage';
import { NavigationOrder, StatsOrdersCards } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/orders_shared';
import { Button } from '@/components/ui/button';
import { useAllOrdersAdmin } from '@/hooks/api/admin/orders';

const OrdersPage = () => {
  const [listQuery, setListQuery] = useState({ page: 1, view: 'active' });
  const queryParams = new URLSearchParams({
    page: String(listQuery.page),
    view: listQuery.view,
  }).toString();

  const { orders = {}, isLoading: isLoadingOrders, mutate: mutateOrders } = useAllOrdersAdmin(`?${queryParams}`);
  const { data = {} } = orders;
  const currentPage = Number(data.current_page) || 1;
  const itemsPerPage = Number(data.per_page) || 3;
  const totalItems = Number(data.total) || 0;
  const trashCount = Number(data.trash_count) || 0;

  const handlePageChange = (page) => {
    setListQuery((current) => ({ ...current, page }));
  };

  const handleViewChange = (view) => {
    setListQuery({ page: 1, view });
  };

  const handleOrdersChanged = async () => {
    const requestedQuery = listQuery;
    const refreshed = await mutateOrders();
    const refreshedOrders = refreshed?.data?.data;

    if (requestedQuery.page > 1 && Array.isArray(refreshedOrders) && refreshedOrders.length === 0) {
      setListQuery((current) => {
        if (current.page !== requestedQuery.page || current.view !== requestedQuery.view) {
          return current;
        }

        return { ...current, page: Math.max(1, current.page - 1) };
      });
    }
  };

  return (
    <div className="space-y-4">
      <NavigationOrder title="Orders" desciption="Manage your orders and track their status" url="/dashboard/admin/orders/new" labelUrl="Order" />
      <StatsOrdersCards summary={data.summary ?? {}} />

      <div aria-label="Order views" className="flex items-center gap-2">
        <Button type="button" variant={listQuery.view === 'active' ? 'default' : 'outline'} aria-pressed={listQuery.view === 'active'} onClick={() => handleViewChange('active')}>
          All
        </Button>
        <Button type="button" variant={listQuery.view === 'trash' ? 'default' : 'outline'} aria-pressed={listQuery.view === 'trash'} onClick={() => handleViewChange('trash')}>
          Trash ({trashCount})
        </Button>
      </div>

      <FilterOrdersPage data={data} view={listQuery.view} onOrdersChanged={handleOrdersChanged} />

      {!isLoadingOrders && <CustomPagination totalItems={totalItems} currentPage={currentPage} itemsPerPage={itemsPerPage} onPageChange={handlePageChange} />}
    </div>
  );
};

export default OrdersPage;
