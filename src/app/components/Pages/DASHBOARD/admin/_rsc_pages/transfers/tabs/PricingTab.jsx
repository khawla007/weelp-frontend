'use client';

import { useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { fetcher } from '@/lib/fetchers';
import { useFormContext, Controller, useWatch } from 'react-hook-form';
import useSWR from 'swr';
import { ComboboxVendorAvailablity, ComboboxVendorPricing } from '../transfer_shared';

// Pricing Tab
const PricingTab = () => {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext();

  const watchedVendorId = useWatch({ control: control, name: 'vendor_id' }); // watchedVendorId

  // Track previous vendor_id to detect actual changes
  const prevVendorIdRef = useRef(watchedVendorId);

  const { data: priceData } = useSWR(watchedVendorId ? `/api/admin/vendors/${watchedVendorId}/pricing-tiers-select` : null, fetcher); // get pricing tier based on vendorId
  const prices = priceData?.data || [];

  const { data: availablityData } = useSWR(watchedVendorId ? `/api/admin/vendors/${watchedVendorId}/availability-time-slots-select` : null, fetcher); // get availability based on VendorId
  const availabilitys = availablityData?.data || [];

  // Reset pricing_tier_id and availability_id only when vendor_id actually changes to a DIFFERENT value
  // Don't reset on mount (when prevVendorIdRef is undefined)
  useEffect(() => {
    const prevVendorId = prevVendorIdRef.current;

    // Only reset pricing and availability if:
    // 1. Previous vendor_id had a value (not undefined/null)
    // 2. Current vendor_id has a different value
    // 3. Current vendor_id is not undefined
    if (prevVendorId !== undefined && prevVendorId !== null && prevVendorId !== watchedVendorId && watchedVendorId !== undefined) {
      setValue('pricing_tier_id', '');
      setValue('availability_id', '');
    }

    // Update ref after checking
    prevVendorIdRef.current = watchedVendorId;
  }, [watchedVendorId, setValue]);

  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="text-base">Pricing & Availability</CardTitle>
        <CardDescription className="text-xs">Set pricing tier and availability for this transfer</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pricing Tier Data */}
        <div className="flex flex-col space-y-4 w-full p-2 border-none">
          <Label htmlFor="pricing_tier_id">Pricing Tier</Label>
          <Controller
            name="pricing_tier_id"
            control={control}
            rules={{ required: 'Pricing Required' }}
            render={({ field }) => <ComboboxVendorPricing data={prices} value={field.value} onChange={field.onChange} placeholder="Select a Pricing Tier" />}
          />

          {/* Displaying  Errors */}
          {errors?.pricing_tier_id && <p className="text-red-500 text-sm mt-1">{errors?.pricing_tier_id?.message}</p>}
        </div>

        {/* Availablity Data */}
        <div className="flex flex-col space-y-4 w-full p-2 border-none">
          <Label htmlFor="availability_id">Availablity</Label>
          <Controller
            name="availability_id"
            control={control}
            rules={{ required: 'Availablility Required' }}
            render={({ field }) => <ComboboxVendorAvailablity data={availabilitys} value={field.value} onChange={field.onChange} placeholder="Select Availability..." />}
          />

          {/* Displaying  Errors */}
          {errors?.availability_id && <p className="text-red-500 text-sm mt-1">{errors?.availability_id?.message}</p>}
        </div>
      </CardContent>
    </Card>
  );
};

export default PricingTab;
