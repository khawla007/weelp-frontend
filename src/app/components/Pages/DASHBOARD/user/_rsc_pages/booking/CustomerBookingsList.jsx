'use client';

import React, { useMemo } from 'react';
import BookingCard from '@/app/components/BookingCard';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAllOrdersCustomer } from '@/hooks/api/customer/orders';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const CustomerBookingsList = () => {
  const { orders, isLoading: isloadingOrders, isValidating: isValidatingOrders, error: isOrderError, mutate: mutateOrders } = useAllOrdersCustomer(); // fetching data

  // intialize form
  const { register, control } = useForm({
    defaultValues: {
      status: 'completed',
      sort_by: 'activity',
    },
  });

  // watching fields
  const status = useWatch({ control, name: 'status' });
  const filters = useWatch({ control });

  const { data: { orders: allOrders = [] } = {} } = orders;

  // Apply filters here using useMemo
  const filteredOrders = useMemo(() => {
    return allOrders.filter((order) => {
      const matchStatus = filters.status ? order.status === filters.status : true; // for filtering
      const matchType = filters.sort_by ? order.item?.item_type === filters.sort_by : true; // for sorting
      return matchStatus && matchType;
    });
  }, [allOrders, filters]);

  // Order Status
  const orderStatus = [
    { name: 'Completed', value: 'completed' },
    { name: 'Cancelled', value: 'cancelled' },
    { name: 'Pending', value: 'pending' },
    { name: 'Refunded', value: 'refunded' },
  ];

  // ItemType
  const itemType = [
    { name: 'Activity', value: 'activity' },
    { name: 'Itinerary', value: 'itinerary' },
    { name: 'Package', value: 'package' },
    { name: 'All Items', value: 'all' },
  ];

  return (
    <Card className="shadow-none border-none bg-inherit  bg-white ">
      <CardHeader className={'px-8'}>
        <CardTitle className="text-xl text-Blueish font-medium">Your Bookings</CardTitle>
        <CardDescription className="text-lg text-grayDark">Manage your bookings, plans.</CardDescription>
      </CardHeader>

      <div className="p-8 pt-0 flex justify-between flex-wrap gap-4">
        <Card className="flex justify-between items-center gap-2 bg-none border-none bg-gray-200 p-1">
          {orderStatus.map(({ name, value }, index) => {
            return (
              <Label key={index} className={`${status === value && 'bg-white'} flex items-center flex-wrap text-center text-xs sm:text-base cursor-pointer p-2 border rounded-md relative`}>
                {name}
                <Input
                  type="radio"
                  value={value}
                  className=" invisible absolute"
                  {...register('status')} // register here
                />
              </Label>
            );
          })}
        </Card>

        {/* Controller  */}
        <Controller
          control={control}
          name="sort_by"
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="w-[120px] dark:bg-black">
                <SelectValue placeholder="Item Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {itemType.map(({ name, value }, index) => (
                    <SelectItem key={index} value={value}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Filtered Orders */}
      <div className="bg-[#f5f9fa] p-8 min-h-full h-[78vh]">
        <div className="flex flex-wrap  bg-[#F5F9FA] gap-4">
          {filteredOrders.length > 0 ? filteredOrders.map((order) => <BookingCard key={order.id} bookingItem={order} />) : <p> No bookings found</p>}

          {/* isloading */}
          {isloadingOrders && <span className="loader"></span>}

          {/* If Error Exist */}
          {isOrderError && <span className="text-red-400">Something Went Wrong</span>}
        </div>
      </div>
    </Card>
  );
};
