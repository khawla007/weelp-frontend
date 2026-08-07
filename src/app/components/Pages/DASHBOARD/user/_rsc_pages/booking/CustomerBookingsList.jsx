'use client';

import React, { useMemo, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import BookingCard from '@/app/components/BookingCard';
import BookingCardSkeleton from '@/app/components/BookingCardSkeleton';
import CustomerBookingDetail from '@/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/CustomerBookingDetail';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CUSTOMER_ORDERS_PER_PAGE, useAllOrdersCustomer } from '@/hooks/api/customer/orders';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Pagination from '@/app/components/ui/Pagination';

// Dynamically import Select to disable SSR and prevent hydration mismatch
const Select = dynamic(() => import('@/components/ui/select').then((mod) => ({ default: mod.Select })), { ssr: false, loading: () => <div className="w-[120px] h-10" /> });
const SelectTrigger = dynamic(() => import('@/components/ui/select').then((mod) => ({ default: mod.SelectTrigger })), { ssr: false });
const SelectContent = dynamic(() => import('@/components/ui/select').then((mod) => ({ default: mod.SelectContent })), { ssr: false });
const SelectGroup = dynamic(() => import('@/components/ui/select').then((mod) => ({ default: mod.SelectGroup })), { ssr: false });
const SelectItem = dynamic(() => import('@/components/ui/select').then((mod) => ({ default: mod.SelectItem })), { ssr: false });
const SelectValue = dynamic(() => import('@/components/ui/select').then((mod) => ({ default: mod.SelectValue })), { ssr: false });

// Static data - defined outside component to prevent re-creation on every render
const ORDER_STATUS = [
  { name: 'All', value: 'all' },
  { name: 'Processing', value: 'processing' },
  { name: 'Completed', value: 'completed' },
  { name: 'Cancelled', value: 'cancelled' },
  { name: 'Pending', value: 'pending' },
  { name: 'Refunded', value: 'refunded' },
];

const ITEM_TYPE = [
  { name: 'All Items', value: 'all' },
  { name: 'Activity', value: 'activity' },
  { name: 'Itinerary', value: 'itinerary' },
  { name: 'Package', value: 'package' },
];

const BOOKING_SKELETON_SLOTS = Array.from({ length: CUSTOMER_ORDERS_PER_PAGE }, (_, index) => index);

export const CustomerBookingsList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [sortBy, setSortBy] = useState('all');
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const { orders, isLoading: isloadingOrders, isValidating: isValidatingOrders, error: isOrderError, mutate: mutateOrders } = useAllOrdersCustomer(currentPage);

  // Get pagination data
  const pagination = orders?.pagination || { total: 0, per_page: CUSTOMER_ORDERS_PER_PAGE, current_page: 1, last_page: 1 };
  const totalPages = pagination.last_page;

  // Safely extract orders array with fallback
  const allOrders = orders?.orders ?? [];

  // Apply filters here using useMemo
  const filteredOrders = useMemo(() => {
    if (!Array.isArray(allOrders)) return [];

    return allOrders.filter((order) => {
      const matchStatus = status && status !== 'all' ? order.status === status : true;
      const matchType = sortBy && sortBy !== 'all' ? order.item?.item_type === sortBy : true;
      return matchStatus && matchType;
    });
  }, [allOrders, status, sortBy]);

  // Handle filter change and reset to page 1
  const handleStatusChange = useCallback((value) => {
    setStatus(value);
    setCurrentPage(1);
  }, []);

  const handleSortByChange = useCallback((value) => {
    setSortBy(value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (selectedBookingId !== null) {
    return <CustomerBookingDetail orderId={selectedBookingId} onBack={() => setSelectedBookingId(null)} onReviewSaved={mutateOrders} />;
  }

  return (
    <Card className="shadow-none border-none bg-inherit  bg-background ">
      <CardHeader className="px-4 md:px-8">
        <CardTitle className="text-xl text-Blueish font-medium">Your Bookings</CardTitle>
        <CardDescription className="text-lg text-weelp-steel">Manage your bookings, plans.</CardDescription>
      </CardHeader>

      <div className="p-4 md:p-8 pt-0 md:pt-0 flex justify-between flex-wrap gap-4">
        {/* Status pills (lg and up) */}
        <Card className="hidden lg:flex flex-wrap justify-start items-center gap-2 bg-none border-none bg-muted p-1">
          {ORDER_STATUS.map(({ name, value }, index) => {
            return (
              <Label key={index} className={`${status === value && 'bg-background'} flex items-center flex-wrap text-center text-xs sm:text-base cursor-pointer p-2 border rounded-md relative`}>
                {name}
                <Input type="radio" value={value} className="invisible absolute" checked={status === value} onChange={(e) => handleStatusChange(e.target.value)} />
              </Label>
            );
          })}
        </Card>

        {/* Filter dropdowns (status collapses into select below lg, item type always shown) */}
        <div className="flex flex-wrap items-center gap-3 lg:ml-auto" suppressHydrationWarning>
          <div className="lg:hidden">
            <Select onValueChange={handleStatusChange} value={status || 'all'}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status">{status ? ORDER_STATUS.find((s) => s.value === status)?.name : 'Status'}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {ORDER_STATUS.map(({ name, value }, index) => (
                    <SelectItem key={index} value={value}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Select onValueChange={handleSortByChange} value={sortBy || 'all'}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Item Type">{sortBy ? ITEM_TYPE.find((t) => t.value === sortBy)?.name : 'Item Type'}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {ITEM_TYPE.map(({ name, value }, index) => (
                  <SelectItem key={index} value={value}>
                    {name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filtered Orders */}
      <div className="bg-weelp-sage-wash p-4 md:p-6 lg:min-h-screen xl:p-8">
        <div className="flex flex-col bg-weelp-sage-wash gap-4">
          <div data-testid="booking-card-grid" className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => <BookingCard key={order.id} bookingItem={order} onViewBooking={setSelectedBookingId} onReviewSaved={mutateOrders} />)
            ) : !isloadingOrders && !isOrderError ? (
              <div className="col-span-full flex min-h-[320px] items-center justify-center text-center">
                <p className="text-lg text-muted-foreground">No bookings found</p>
              </div>
            ) : null}

            {/* isloading */}
            {isloadingOrders ? BOOKING_SKELETON_SLOTS.map((slot) => <BookingCardSkeleton key={slot} />) : null}

            {/* If Error Exist */}
            {isOrderError && <span className="text-destructive">Something Went Wrong</span>}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination currentPage={pagination.current_page} totalPages={totalPages} onPageChange={handlePageChange} align="center" />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
