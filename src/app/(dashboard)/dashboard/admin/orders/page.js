'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { ChevronDown } from 'lucide-react';
import { useSWRConfig } from 'swr';

import { CustomPagination } from '@/app/components/Pagination';
import AdminOrderDetail from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/AdminOrderDetail';
import { FilterOrdersPage } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/FilterOrdersPage';
import { NavigationOrder, StatsOrdersCards } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/orders_shared';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { newestCreatedAt, useMarkAdminNavigationSeen } from '@/hooks/api/admin/navigationUnseen';
import { useAllOrdersAdmin } from '@/hooks/api/admin/orders';
import { ADMIN_NAVIGATION_UNSEEN_KEY } from '@/lib/services/adminNavigationUnseen';
import { parseOrderQuery, replaceOrderQuery } from '@/lib/navigation/orderQuery';

const ORDER_STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
];

const OrdersPage = () => {
  const [listQuery, setListQuery] = useState({ page: 1, view: 'active', status: '', search: '' });
  const [searchDraft, setSearchDraft] = useState('');
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate } = useSWRConfig();
  const listScrollPosition = useRef(0);
  const shouldRestoreScroll = useRef(false);
  const queryParams = new URLSearchParams({
    page: String(listQuery.page),
    view: listQuery.view,
  });

  if (listQuery.status) queryParams.set('status', listQuery.status);
  if (listQuery.search) queryParams.set('search', listQuery.search);

  const { orders = {}, isLoading: isLoadingOrders, isValidating: isValidatingOrders, error: ordersError, mutate: mutateOrders } = useAllOrdersAdmin(`?${queryParams.toString()}`);
  const { data = {} } = orders;
  useMarkAdminNavigationSeen('orders', {
    enabled: !isLoadingOrders && !isValidatingOrders && !ordersError && Array.isArray(data.data),
    seenThrough: newestCreatedAt(data.data),
  });
  const currentPage = Number(data.current_page) || 1;
  const itemsPerPage = Number(data.per_page) || 5;
  const totalItems = Number(data.total) || 0;
  const trashCount = Number(data.trash_count) || 0;
  const orderQueryValues = searchParams.getAll('order');
  const selectedOrderId = parseOrderQuery(orderQueryValues);
  const searchSnapshot = searchParams.toString();
  const searchSnapshotToken = useMemo(() => ({}), [searchSnapshot]);
  const isOpeningOrder = selectedOrderId === null && pendingNavigation?.searchSnapshotToken === searchSnapshotToken;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const search = searchDraft.trim();
      setListQuery((current) => (current.search === search ? current : { ...current, page: 1, search }));
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchDraft]);

  useEffect(() => {
    if (selectedOrderId || !shouldRestoreScroll.current) return undefined;

    shouldRestoreScroll.current = false;
    const animationFrameId = window.requestAnimationFrame(() => {
      window.scrollTo({ top: listScrollPosition.current, behavior: 'auto' });
    });

    return () => window.cancelAnimationFrame(animationFrameId);
  }, [selectedOrderId]);

  const handlePageChange = useCallback((page) => {
    setListQuery((current) => ({ ...current, page }));
  }, []);

  const handleViewChange = useCallback((view) => {
    setListQuery((current) => ({ ...current, page: 1, view }));
  }, []);

  const handleStatusChange = useCallback((status) => {
    setListQuery((current) => ({ ...current, page: 1, status: status === 'all' ? '' : status }));
  }, []);

  const handleViewOrder = useCallback(
    (id) => {
      listScrollPosition.current = window.scrollY;
      setPendingNavigation({ orderId: id, searchSnapshotToken });
      router.replace(replaceOrderQuery(pathname, searchParams, id), { scroll: false });
    },
    [pathname, router, searchParams, searchSnapshotToken],
  );

  const handleBack = useCallback(() => {
    shouldRestoreScroll.current = true;
    router.replace(replaceOrderQuery(pathname, searchParams, null), { scroll: false });
  }, [pathname, router, searchParams]);

  const handleOrdersChanged = useCallback(async () => {
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
  }, [listQuery, mutateOrders]);

  const refreshCancellationState = useCallback(async () => {
    const refreshResults = await Promise.allSettled([mutateOrders(), mutate(ADMIN_NAVIGATION_UNSEEN_KEY)]);

    if (refreshResults.some((result) => result.status === 'rejected')) {
      throw new Error('Cancellation updated, but the latest data could not be refreshed.');
    }
  }, [mutate, mutateOrders]);

  const selectedStatus = ORDER_STATUS_OPTIONS.find((option) => option.value === (listQuery.status || 'all')) ?? ORDER_STATUS_OPTIONS[0];

  if (selectedOrderId !== null && selectedOrderId !== undefined) {
    return <AdminOrderDetail orderId={selectedOrderId} isTrashed={listQuery.view === 'trash'} onBack={handleBack} onStatusChanged={refreshCancellationState} />;
  }

  return (
    <div className="space-y-4">
      <NavigationOrder title="Orders" desciption="Manage your orders and track their status" url="/dashboard/admin/orders/new" labelUrl="Order" />
      <StatsOrdersCards summary={data.summary ?? {}} />
      {isOpeningOrder ? (
        <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
          Opening order {pendingNavigation.orderId}…
        </p>
      ) : null}

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

      <FilterOrdersPage data={data} view={listQuery.view} searchDraft={searchDraft} onSearchDraftChange={setSearchDraft} onOrdersChanged={handleOrdersChanged} onViewOrder={handleViewOrder} />

      {!isLoadingOrders && <CustomPagination totalItems={totalItems} currentPage={currentPage} itemsPerPage={itemsPerPage} onPageChange={handlePageChange} />}
    </div>
  );
};

export default OrdersPage;
