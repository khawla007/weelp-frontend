'use client';

import { useEffect } from 'react';
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
  const { data: priceData } = useSWR(`/api/admin/vendors/${watchedVendorId}/pricesdropdown`, fetcher); // get pricing tier based on vendorId
  const prices = priceData?.data || [];

  const { data: availablityData } = useSWR(`/api/admin/vendors/${watchedVendorId}/availabilitydropdown`, fetcher); // get pricing tier based on VendorId
  const availabilitys = availablityData?.data || [];

  // side effect when route changed
  useEffect(() => {
    setValue('pricing_tier_id', '');
    setValue('availability_id', '');
  }, [watchedVendorId]);

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
