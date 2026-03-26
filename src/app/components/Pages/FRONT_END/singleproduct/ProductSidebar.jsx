'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import useSWR from 'swr';
import SingleProductForm from '@/app/components/Form/SingleProductForm';
import useMiniCartStore from '@/lib/store/useMiniCartStore';
import { getItineraryAddons, getPackageAddons } from '@/lib/services/addOn';

const ProductSidebar = ({ productId, productData, productType = 'activity', itinerarySlug, packageSlug, defaultDateRange = null, onDateChange = null, scheduleCount = 0 }) => {
  const [selectedAddons, setSelectedAddons] = useState([]);
  const { cartItems, setMiniCartOpen } = useMiniCartStore();
  const isInCart = cartItems.some((item) => item.id === productData?.id);

  // Fetch addons via SWR for itinerary/package (activity addons come from productData)
  const addonSlug = productType === 'itinerary' ? itinerarySlug : productType === 'package' ? packageSlug : null;
  const addonFetcher = productType === 'itinerary' ? getItineraryAddons : productType === 'package' ? getPackageAddons : null;

  const { data: addonsResponse } = useSWR(addonSlug ? `${productType}/${addonSlug}/addons` : null, () => addonFetcher(addonSlug), { revalidateOnFocus: false, dedupingInterval: 60000 });

  // Use addons from API response (activity) or fetched data (itinerary/package)
  const addons = productType === 'activity' ? productData?.addons || [] : addonsResponse?.data || [];

  const toggleAddon = (addon) => {
    setSelectedAddons((prev) => {
      const exists = prev.some((a) => a.addon_id === addon.addon_id);
      return exists ? prev.filter((a) => a.addon_id !== addon.addon_id) : [...prev, addon];
    });
  };

  const addonsTotal = selectedAddons.reduce((sum, a) => sum + Number(a.addon_sale_price ?? a.addon_price), 0);
  const basePrice = Number(productData?.pricing?.regular_price ?? productData?.base_pricing?.variations?.[0]?.regular_price ?? 0);
  const displayPrice = productData?.pricing?.regular_price ?? productData?.base_pricing?.variations?.[0]?.regular_price ?? '6,790.18';

  return (
    <div className="p-6 lg:px-[60px] lg:pt-[60px] lg:pb-[70px] lg:sticky lg:top-[76px]">
      {/* Base Price */}
      <h3 className="text-[#0c2536] font-bold text-2xl lg:text-[28px]">From ${displayPrice}</h3>

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
              {selectedAddons.length > 0 ? (
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
  );
};

export default ProductSidebar;
