'use client';

import React, { useState, useMemo } from 'react';
import { Check } from 'lucide-react';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useSWR from 'swr';
import SingleProductForm from '@/app/components/Form/SingleProductForm';
import useMiniCartStore from '@/lib/store/useMiniCartStore';
import { getItineraryAddons, getPackageAddons } from '@/lib/services/addOn';
import { bookingSchema } from '@/lib/validation/bookingSchema';
import { calculateActivityPrice } from '@/lib/pricing/calculateActivityPrice';
import { formatCurrency } from '@/lib/utils';

const ProductSidebar = ({ productId, productData, productType = 'activity', itinerarySlug, packageSlug, defaultDateRange = null, onDateChange = null, scheduleCount = 0 }) => {
  const [selectedAddons, setSelectedAddons] = useState([]);
  const { cartItems, setMiniCartOpen } = useMiniCartStore();
  const isInCart = cartItems.some((item) => item.id === productData?.id);

  // Lift form state to sidebar for live pricing updates
  const methods = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      dateRange: defaultDateRange ?? { from: null, to: null },
      howMany: { adults: 1, children: 0, infants: 0 },
    },
  });

  // Fetch addons via SWR for itinerary/package (activity addons come from productData)
  const addonSlug = productType === 'itinerary' ? itinerarySlug : productType === 'package' ? packageSlug : null;
  const addonFetcher = productType === 'itinerary' ? getItineraryAddons : productType === 'package' ? getPackageAddons : null;

  // Only fetch addons for itinerary/package, not activity
  const shouldFetchAddons = productType !== 'activity' && addonSlug && addonFetcher;

  const swrKey = shouldFetchAddons ? `${productType}/${addonSlug}/addons` : null;

  // Fetcher function - uses the slug from closure
  const { data: addonsResponse } = useSWR(swrKey, () => addonFetcher(addonSlug), {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  // Use addons from API response (activity) or fetched data (itinerary/package)
  const addons = productType === 'activity' ? productData?.addons || [] : addonsResponse?.data || [];

  // Subscribe to form changes for live pricing updates
  const [dateRange, howMany] = useWatch({
    control: methods.control,
    name: ['dateRange', 'howMany'],
  });

  const toggleAddon = (addon) => {
    setSelectedAddons((prev) => {
      const exists = prev.some((a) => a.addon_id === addon.addon_id);
      return exists ? prev.filter((a) => a.addon_id !== addon.addon_id) : [...prev, addon];
    });
  };

  const addonsTotal = selectedAddons.reduce((sum, a) => sum + Number(a.addon_sale_price ?? a.addon_price), 0);

  // Compute live pricing for activities
  const pricing = useMemo(() => {
    if (productType === 'activity') {
      return calculateActivityPrice({
        activity: productData,
        dateRange: dateRange ?? { from: null, to: null },
        people: howMany ?? { adults: 1, children: 0, infants: 0 },
        selectedAddons,
      });
    }
    return null;
  }, [productData, dateRange, howMany, selectedAddons, productType]);

  // For itinerary: use schedule_total_price only (no fallback to base_pricing)
  // For activity/package: use existing fallback chain
  let basePrice = 0;
  let displayPrice = '—';

  if (productType === 'itinerary') {
    if (productData?.schedule_total_price != null) {
      basePrice = Number(productData.schedule_total_price);
      displayPrice = Number(productData.schedule_total_price).toFixed(2);
    }
  } else {
    basePrice = Number(productData?.pricing?.regular_price ?? productData?.base_pricing?.variations?.[0]?.regular_price ?? 0);
    displayPrice = productData?.pricing?.regular_price ?? productData?.base_pricing?.variations?.[0]?.regular_price ?? '6,790.18';
  }

  // Build list of applicable-but-not-yet-active discount hints for activities
  const eb = productData?.earlyBirdDiscount;
  const lm = productData?.lastMinuteDiscount;
  const hasDate = Boolean(dateRange?.from);
  const showEbHint = productType === 'activity' && eb?.enabled && (!pricing?.timeDiscount || pricing.timeDiscount.type !== 'early_bird');
  const showLmHint = productType === 'activity' && lm?.enabled && (!pricing?.timeDiscount || pricing.timeDiscount.type !== 'last_minute');

  return (
    <FormProvider {...methods}>
      <div className="p-6 lg:pl-[60px] lg:pr-0 lg:pt-[60px] lg:pb-[70px] lg:sticky lg:top-[76px]">
        {/* Base Price */}
        {productType === 'itinerary' ? (
          <h3 className="text-[#0c2536] font-bold text-2xl lg:text-[28px]">
            From {productData?.schedule_total_currency ?? ''} {displayPrice}
          </h3>
        ) : (
          <h3 className="text-[#0c2536] font-bold text-2xl lg:text-[28px]">
            From {formatCurrency(Number(productData?.pricing?.regular_price ?? 0), productData?.pricing?.currency ?? 'USD')} / person
          </h3>
        )}

        {/* Pricing Breakdown for Activities — renders as soon as headcount >= 1 */}
        {productType === 'activity' &&
          pricing &&
          pricing.headcount >= 1 &&
          (() => {
            const regularPrice = pricing.season?.regularPrice ?? pricing.pricePerHead;
            const regularSubtotal = regularPrice * pricing.headcount;
            return (
              <div className="mt-4 bg-white rounded-xl border border-[#ccc]/50 shadow-[0_3px_9px_rgba(0,0,0,0.04)] p-4 text-sm text-[#5a5a5a]">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>
                      {formatCurrency(regularPrice, pricing.currency)} × {pricing.headcount}
                    </span>
                    <span className="text-[#0c2536]">{formatCurrency(regularSubtotal, pricing.currency)}</span>
                  </div>
                  {pricing.season && pricing.season.savings > 0 && (
                    <div className="flex justify-between text-green-700">
                      <span>Seasonal rate{pricing.season.name ? ` (${pricing.season.name})` : ''} applied</span>
                      <span>-{formatCurrency(pricing.season.savings, pricing.currency)}</span>
                    </div>
                  )}
                  {pricing.groupDiscount &&
                    (() => {
                      const rule = pricing.groupDiscount.rule;
                      const discountLabel =
                        rule.discount_type === 'percentage'
                          ? `${Number(rule.discount_amount)}% off ${pricing.groupDiscount.discountedQty} travelers`
                          : `flat ${formatCurrency(Number(rule.discount_amount), pricing.currency)} × ${pricing.groupDiscount.bundles} bundle${pricing.groupDiscount.bundles === 1 ? '' : 's'}`;
                      return (
                        <div className="flex justify-between text-green-700">
                          <span>Group discount ({discountLabel})</span>
                          <span>-{formatCurrency(pricing.groupDiscount.amount, pricing.currency)}</span>
                        </div>
                      );
                    })()}
                  {pricing.groupHint &&
                    (() => {
                      const needed = pricing.groupHint.needed;
                      const min = Number(pricing.groupHint.rule.min_people);
                      const discountLabel =
                        pricing.groupHint.rule.discount_type === 'percentage'
                          ? `${Number(pricing.groupHint.rule.discount_amount)}% off`
                          : `flat ${formatCurrency(Number(pricing.groupHint.rule.discount_amount), pricing.currency)} off the group`;
                      const hintText =
                        pricing.groupHint.type === 'upgrade'
                          ? `Add ${needed} more to unlock ${min}-person group discount (${discountLabel}).`
                          : `Add ${needed} more to bundle another ${min}-person group discount.`;
                      return <div className="text-xs text-[#57947d]">{hintText}</div>;
                    })()}
                  {pricing.timeDiscount && (
                    <div className="flex justify-between text-green-700">
                      <span>{pricing.timeDiscount.type === 'early_bird' ? 'Early bird' : 'Last minute'} discount</span>
                      <span>-{formatCurrency(pricing.timeDiscount.amount, pricing.currency)}</span>
                    </div>
                  )}
                  {pricing.addonsTotal > 0 && (
                    <div className="flex justify-between">
                      <span>Add-ons</span>
                      <span>+{formatCurrency(pricing.addonsTotal, pricing.currency)}</span>
                    </div>
                  )}
                  <div className="border-t border-[#ccc]/50 pt-2 flex justify-between text-[#0c2536]">
                    <span>Total</span>
                    <span>{formatCurrency(pricing.final, pricing.currency)}</span>
                  </div>
                </div>
              </div>
            );
          })()}

        {/* Discount rule hints for activities */}
        {productType === 'activity' && (showEbHint || showLmHint) && (
          <div className="mt-3 flex flex-col gap-1 text-xs text-[#57947d]">
            {showEbHint && (
              <span>
                Early bird: book {Number(eb.days_before_start)}+ days ahead for{' '}
                {eb.discount_type === 'percentage' ? `${Number(eb.discount_amount)}% off` : `${formatCurrency(Number(eb.discount_amount), pricing?.currency ?? 'USD')} off per person`}.
              </span>
            )}
            {showLmHint && (
              <span>
                Last minute: book within {Number(lm.days_before_start)} days for{' '}
                {lm.discount_type === 'percentage' ? `${Number(lm.discount_amount)}% off` : `${formatCurrency(Number(lm.discount_amount), pricing?.currency ?? 'USD')} off per person`}.
              </span>
            )}
          </div>
        )}

        {/* Actual Form with Inputs */}
        <SingleProductForm
          productId={productId}
          productData={productData}
          selectedAddons={selectedAddons}
          formId={`booking-form-${productId}`}
          defaultDateRange={defaultDateRange}
          onDateChange={onDateChange}
          scheduleCount={scheduleCount}
        />

        {/* Select Addon */}
        {addons.length > 0 && (
          <>
            <p className="text-[#5a5a5a] text-base font-medium mb-3 mt-6">Select Addon</p>
            <div className="bg-white rounded-xl border border-[#ccc]/50 shadow-[0_3px_9px_rgba(0,0,0,0.04)] p-5 flex flex-col gap-3">
              {addons.map((addon) => {
                const isChecked = selectedAddons.some((a) => a.addon_id === addon.addon_id);
                return (
                  <div
                    key={addon.addon_id}
                    role="checkbox"
                    aria-checked={isChecked}
                    tabIndex={0}
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => toggleAddon(addon)}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        toggleAddon(addon);
                      }
                    }}
                  >
                    <span className={`w-5 h-5 rounded-[4px] flex items-center justify-center flex-shrink-0 transition-colors ${isChecked ? 'bg-[#57947d]' : 'border-2 border-gray-300 bg-white'}`}>
                      {isChecked && <Check size={14} className="text-white" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-base font-medium text-[#0c2536]">{addon.addon_name}</span>
                      {addon.addon_description && <p className="text-sm text-[#5a5a5a] truncate">{addon.addon_description}</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {addon.addon_sale_price != null ? (
                        <>
                          <span className="text-sm text-gray-400 line-through">${Number(addon.addon_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          <span className="text-base font-semibold text-[#273f4e]">
                            ${Number(addon.addon_sale_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </>
                      ) : (
                        <span className="text-base font-semibold text-[#273f4e]">${Number(addon.addon_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Select Card */}
        <div className="bg-white rounded-xl border border-[#ccc]/50 shadow-[0_3px_9px_rgba(0,0,0,0.04)] p-5 mt-4 flex items-center justify-between">
          {isInCart ? (
            <>
              <p className="text-lg font-medium text-[#0c2536]">Item Moved to Cart</p>
              <button type="button" onClick={() => setMiniCartOpen(true)} className="px-8 py-3 text-base font-medium bg-secondaryDark text-white rounded-md shadow cursor-pointer">
                Show Cart
              </button>
            </>
          ) : (
            <>
              <div className="flex flex-col">
                {productType === 'activity' && pricing && pricing.headcount >= 1 ? (
                  <p className="text-lg font-bold text-[#0c2536]">Total: {formatCurrency(pricing.final, pricing.currency)}</p>
                ) : selectedAddons.length > 0 ? (
                  <>
                    <p className="text-sm font-medium text-[#57947d]">+ Add-ons: ${addonsTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className="text-lg font-bold text-[#0c2536]">Total: ${(basePrice + addonsTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </>
                ) : (
                  <p className="text-lg font-bold text-[#0c2536]">${basePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                )}
              </div>
              <button
                type="submit"
                form={`booking-form-${productId}`}
                className="px-8 py-3 text-base font-medium bg-secondaryDark text-white rounded-md shadow disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Select
              </button>
            </>
          )}
        </div>

        {/* Questions Card */}
        <div className="mt-4 border border-[#e5e5e5] rounded-xl p-7 bg-white/70 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h4 className="text-[#0c2536] font-semibold text-lg">Questions?</h4>
              <p className="text-base text-black">Visit the Weelp Help Centre for any further questions.</p>
              <span className="text-base mt-2">Product ID : {productId ?? 451245}</span>
            </div>
            <button className="px-6 py-3 border border-black rounded-lg text-sm font-medium text-black whitespace-nowrap hover:bg-gray-50 transition-colors">Help Center</button>
          </div>
        </div>
      </div>
    </FormProvider>
  );
};

export default ProductSidebar;
