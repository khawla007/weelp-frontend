'use client';

import { useEffect } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetchers';
import { ComboboxVendorRoute } from '../transfer_shared';

// VendorTab
const VendorTab = () => {
  const {
    setValue,
    formState: { errors },
    control,
  } = useFormContext(); // form context

  const { data, isLoading, error } = useSWR('/api/admin/vendors/vendorsdropdown', fetcher); // get vendors first
  const vendors = data?.data || [];
  const watchedVendorId = useWatch({ control: control, name: 'vendor_id' });
  const watchedRouteId = useWatch({ control: control, name: 'route_id' });

  const { data: routesData } = useSWR(`/api/admin/vendors/${watchedVendorId}/routesdropdown`, fetcher); // get routes based on id

  const routes = routesData?.data || [];

  const { name: selectedVendorName } = vendors.find((val) => val.id === Number(watchedVendorId)) || {}; // selected vendor name

  // side effect when route changed
  useEffect(() => {
    setValue('route_id', '');
  }, [watchedVendorId]);

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="p-4">
        <CardTitle className="text-base">Select Vendor</CardTitle>
        <CardDescription className="text-xs">Choose a vendor and route for this transfer</CardDescription>
      </CardHeader>
      <CardContent className="px-0 sm:p-4">
        {/* Vendor Data */}
        <div className="flex flex-col space-y-4 w-full p-2 border-none">
          <Label htmlFor="vendor_id">PickUp Location</Label>
          <Controller
            name="vendor_id"
            control={control}
            rules={{ required: 'Pickup location required' }}
            render={({ field }) => (
              <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle type">{selectedVendorName}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor, index) => {
                    return (
                      <SelectItem key={index} value={vendor?.id}>
                        {vendor?.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
          />
          {/* Displaying  Errors */}
          {errors?.vendor_id && <p className="text-red-500 text-sm mt-1">{errors?.vendor_id?.message}</p>}
        </div>

        {/* Routes Data */}
        <div className="flex flex-col space-y-4 w-full p-2 border-none">
          <Label htmlFor="route_id">Select Route</Label>
          <Controller
            name="route_id"
            control={control}
            rules={{ required: 'Route Required' }}
            render={({ field }) => <ComboboxVendorRoute data={routes} value={field.value} onChange={field.onChange} placeholder="Select Route" />}
          />
          {/* Displaying  Errors */}
          {errors?.route_id && <p className="text-red-500 text-sm mt-1">{errors?.route_id?.message}</p>}
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorTab;
