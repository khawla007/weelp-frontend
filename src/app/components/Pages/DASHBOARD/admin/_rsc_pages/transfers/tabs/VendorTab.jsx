'use client';

import { useEffect, useRef } from 'react';
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

  const { data, isLoading, error } = useSWR('/api/admin/vendors/vendor-select', fetcher); // get vendors first
  const vendors = data?.data || [];
  const watchedVendorId = useWatch({ control: control, name: 'vendor_id' });
  const watchedRouteId = useWatch({ control: control, name: 'route_id' });

  // Track previous vendor_id to detect actual changes
  const prevVendorIdRef = useRef(watchedVendorId);

  const { data: routesData } = useSWR(watchedVendorId ? `/api/admin/vendors/${watchedVendorId}/routes-select` : null, fetcher); // get routes based on id

  const routes = routesData?.data || [];

  const { name: selectedVendorName } = vendors.find((val) => val.id === Number(watchedVendorId)) || {}; // selected vendor name

  // Reset route_id only when vendor_id actually changes to a DIFFERENT value
  // Don't reset on mount (when prevVendorIdRef is undefined)
  useEffect(() => {
    const prevVendorId = prevVendorIdRef.current;

    // Only reset route if:
    // 1. Previous vendor_id had a value (not undefined/null)
    // 2. Current vendor_id has a different value
    // 3. Current vendor_id is not undefined
    if (prevVendorId !== undefined && prevVendorId !== null && prevVendorId !== watchedVendorId && watchedVendorId !== undefined) {
      setValue('route_id', '');
    }

    // Update ref after checking
    prevVendorIdRef.current = watchedVendorId;
  }, [watchedVendorId, setValue]);

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="p-4">
        <CardTitle className="text-base">Select Vendor</CardTitle>
        <CardDescription className="text-xs">Choose a vendor and route for this transfer</CardDescription>
      </CardHeader>
      <CardContent className="px-0 sm:p-4">
        {/* Vendor Data */}
        <div className="flex flex-col space-y-4 w-full p-2 border-none">
          <Label htmlFor="vendor_id">Select Vendor</Label>
          <Controller
            name="vendor_id"
            control={control}
            rules={{ required: 'Vendor is required' }}
            render={({ field }) => (
              <Select
                onValueChange={(val) => {
                  // Store as number for type consistency
                  field.onChange(Number(val));
                }}
                value={field.value ? String(field.value) : ''}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor, index) => {
                    return (
                      <SelectItem key={index} value={String(vendor?.id)}>
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
