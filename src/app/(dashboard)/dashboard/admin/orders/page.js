'use client';

import { useCallback, useState } from 'react';

import { ChevronDown } from 'lucide-react';

import { CustomPagination } from '@/app/components/Pagination';
import { FilterOrdersPage } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/FilterOrdersPage';
import { NavigationOrder, StatsOrdersCards } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/orders_shared';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAllOrdersAdmin } from '@/hooks/api/admin/orders';

const ORDER_STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const OrdersPage = () => {
  const [listQuery, setListQuery] = useState({ page: 1, view: 'active', status: '', search: '' });
  const queryParams = new URLSearchParams({
    page: String(listQuery.page),
    view: listQuery.view,
  });

  if (listQuery.status) queryParams.set('status', listQuery.status);
  if (listQuery.search) queryParams.set('search', listQuery.search);

  const { orders = {}, isLoading: isLoadingOrders, mutate: mutateOrders } = useAllOrdersAdmin(`?${queryParams.toString()}`);
  const { data = {} } = orders;
  const currentPage = Number(data.current_page) || 1;
  const itemsPerPage = Number(data.per_page) || 3;
  const totalItems = Number(data.total) || 0;
  const trashCount = Number(data.trash_count) || 0;

  const handlePageChange = (page) => {
    setListQuery((current) => ({ ...current, page }));
  };

  const handleViewChange = (view) => {
    setListQuery((current) => ({ ...current, page: 1, view }));
  };

  const handleStatusChange = (status) => {
    setListQuery((current) => ({ ...current, page: 1, status: status === 'all' ? '' : status }));
  };

  const handleSearchChange = useCallback((search) => {
    setListQuery((current) => ({ ...current, page: 1, search }));
  }, []);

  const handleOrdersChanged = async () => {
    const requestedQuery = listQuery;
    const refreshed = await mutateOrders();
    const refreshedOrders = refreshed?.data?.data;

    if (requestedQuery.page > 1 && Array.isArray(refreshedOrders) && refreshedOrders.length === 0) {
      setListQuery((current) => {
        if (current.page !== requestedQuery.page || current.view !== requestedQuery.view || current.status !== requestedQuery.status || current.search !== requestedQuery.search) {
          return current;
        }

        return { ...current, page: Math.max(1, current.page - 1) };
      });
    }
  };

  const selectedStatus = ORDER_STATUS_OPTIONS.find((option) => option.value === (listQuery.status || 'all')) ?? ORDER_STATUS_OPTIONS[0];

  return (
    <div className="space-y-4">
      <NavigationOrder title="Orders" desciption="Manage your orders and track their status" url="/dashboard/admin/orders/new" labelUrl="Order" />
      <StatsOrdersCards summary={data.summary ?? {}} />

      <div aria-label="Order views" className="flex items-center gap-2 pt-4">
        <Button type="button" variant={listQuery.view === 'active' ? 'default' : 'outline'} aria-pressed={listQuery.view === 'active'} onClick={() => handleViewChange('active')}>
          All
        </Button>
        <Button type="button" variant={listQuery.view === 'trash' ? 'default' : 'outline'} aria-pressed={listQuery.view === 'trash'} onClick={() => handleViewChange('trash')}>
          Trash ({trashCount})
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant={listQuery.status ? 'default' : 'outline'}
              className="data-[state=open]:ring-0 data-[state=open]:ring-offset-0"
              aria-label={`Filter orders by status: ${selectedStatus.label}`}
              aria-pressed={Boolean(listQuery.status)}
            >
              {selectedStatus.label}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuRadioGroup value={listQuery.status || 'all'} onValueChange={handleStatusChange}>
              {ORDER_STATUS_OPTIONS.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <FilterOrdersPage data={data} view={listQuery.view} search={listQuery.search} onSearchChange={handleSearchChange} onOrdersChanged={handleOrdersChanged} />

      {!isLoadingOrders && <CustomPagination totalItems={totalItems} currentPage={currentPage} itemsPerPage={itemsPerPage} onPageChange={handlePageChange} />}
    </div>
  );
};

export default OrdersPage;
