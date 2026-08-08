'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useSWR from 'swr';
import SingleProductForm from '@/app/components/Form/SingleProductForm';
import { ContextualHelpPanel } from '@/app/components/Help/ContextualHelpPanel';
import { normalizeHelpContext } from '@/app/components/Help/normalizeHelpContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import useMiniCartStore from '@/lib/store/useMiniCartStore';
import { hasItineraryEditChanges, useItineraryEditStore } from '@/lib/store/useItineraryEditStore';
import { getItineraryAddons, getPackageAddons } from '@/lib/services/addOn';
import { bookingSchema } from '@/lib/validation/bookingSchema';
import { calculateActivityPrice } from '@/lib/pricing/calculateActivityPrice';
import { resolvePackageBasePricing } from '@/lib/pricing/resolvePackageBasePricing';
import { formatCurrency } from '@/lib/utils';
import BookingAction from './BookingAction';

const DEFAULT_TRAVELERS = { adults: 1, children: 0, infants: 0 };

const toDateOrNull = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeCartDateRange = (dateRange) => {
  const from = toDateOrNull(dateRange?.from);
  const to = toDateOrNull(dateRange?.to) ?? from;
  return { from, to };
};

const normalizeCartTravelers = (howMany) => ({
  adults: Number(howMany?.adults ?? DEFAULT_TRAVELERS.adults),
  children: Number(howMany?.children ?? DEFAULT_TRAVELERS.children),
  infants: Number(howMany?.infants ?? DEFAULT_TRAVELERS.infants),
});

function RowPulse({ value, className = '', children }) {
  const [prevValue, setPrevValue] = useState(value);
  const [pulseKey, setPulseKey] = useState(0);
  if (prevValue !== value) {
    setPrevValue(value);
    setPulseKey((k) => k + 1);
  }
  return (
    <div key={pulseKey} className={`${className} ${pulseKey > 0 ? 'animate-row-pulse rounded-md' : ''}`}>
      {children}
    </div>
  );
}

const ProductSidebar = ({ productId, productData, productType = 'activity', citySlug, itemSlug, itinerarySlug, packageSlug, defaultDateRange = null, onDateChange = null, scheduleCount = 0 }) => {
  const searchParams = useSearchParams();
  const [helpOpen, setHelpOpen] = useState(false);
  const helpTriggerRef = useRef(null);
  const inlineActionRef = useRef(null);
  const [actionVisibilityKnown, setActionVisibilityKnown] = useState(false);
  const [inlineActionVisible, setInlineActionVisible] = useState(true);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [hasChangedAddons, setHasChangedAddons] = useState(false);
  const { cartItems, setMiniCartOpen } = useMiniCartStore();
  const hasPendingItineraryEdits = useItineraryEditStore((state) => productType === 'itinerary' && String(state.itineraryId) === String(productId) && hasItineraryEditChanges(state));
  const editCartItemId = searchParams?.get('editCartItem');
  const editingCartItem = useMemo(() => {
    if (!editCartItemId) return null;

    return cartItems.find((item) => String(item?.id) === String(editCartItemId) && item?.type === productType) ?? null;
  }, [cartItems, editCartItemId, productType]);
  const isEditingCartItem = Boolean(editingCartItem);
  const isInCart = cartItems.some((item) => item.id === productData?.id);
  const helpContext = useMemo(
    () =>
      normalizeHelpContext({
        productType,
        productId,
        productData,
        citySlug,
        itemSlug,
      }),
    [citySlug, itemSlug, productData, productId, productType],
  );

  // Lift form state to sidebar for live pricing updates
  const methods = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      dateRange: defaultDateRange ?? { from: null, to: null },
      howMany: DEFAULT_TRAVELERS,
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

  useEffect(() => {
    if (!editingCartItem) return;

    methods.reset({
      dateRange: normalizeCartDateRange(editingCartItem.dateRange),
      howMany: normalizeCartTravelers(editingCartItem.howMany),
    });
  }, [editingCartItem, methods]);

  useEffect(() => {
    const action = inlineActionRef.current;
    if (!action || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setActionVisibilityKnown(true);
        setInlineActionVisible(entry.isIntersecting && entry.intersectionRatio >= 0.95);
      },
      { threshold: [0, 0.95, 1] },
    );

    observer.observe(action);
    return () => observer.disconnect();
  }, []);

  const editSelectedAddons = useMemo(() => {
    if (!editingCartItem) return [];

    const selectedAddonIds = new Set((editingCartItem.addons || []).map((addon) => Number(addon?.addon_id)).filter((addonId) => Number.isInteger(addonId) && addonId > 0));
    return addons.filter((addon) => selectedAddonIds.has(Number(addon?.addon_id)));
  }, [addons, editingCartItem]);

  const activeSelectedAddons = isEditingCartItem && !hasChangedAddons ? editSelectedAddons : selectedAddons;

  // Subscribe to form changes for live pricing updates
  const [dateRange, howMany] = useWatch({
    control: methods.control,
    name: ['dateRange', 'howMany'],
  });

  const toggleAddon = (addon) => {
    setHasChangedAddons(true);
    setSelectedAddons((prev) => {
      const currentAddons = isEditingCartItem && !hasChangedAddons ? editSelectedAddons : prev;
      const exists = currentAddons.some((a) => a.addon_id === addon.addon_id);
      return exists ? currentAddons.filter((a) => a.addon_id !== addon.addon_id) : [...currentAddons, addon];
    });
  };

  const addonsTotal = activeSelectedAddons.reduce((sum, a) => sum + Number(a.addon_sale_price ?? a.addon_price), 0);

  // Compute live pricing for activities
  const pricing = useMemo(() => {
    if (productType === 'activity') {
      return calculateActivityPrice({
        activity: productData,
        dateRange: dateRange ?? { from: null, to: null },
        people: howMany ?? { adults: 1, children: 0, infants: 0 },
        selectedAddons: activeSelectedAddons,
      });
    }
    return null;
  }, [productData, dateRange, howMany, activeSelectedAddons, productType]);

  // For itinerary: total = per_pax × (adults+children) + flat. Per-person preview
  // value comes from schedule_total_price; pricing_breakdown enables live pax recompute.
  // For activity/package: existing fallback chain.
  let basePrice = 0;
  let itineraryDisplayPrice = '—';
  let itineraryTotal = 0;
  const packagePricing = productType === 'package' ? resolvePackageBasePricing(productData) : null;

  if (productType === 'itinerary') {
    const headcount = Math.max(1, (Number(howMany?.adults) || 1) + (Number(howMany?.children) || 0));
    const breakdown = productData?.pricing_breakdown;
    if (breakdown) {
      itineraryTotal = Math.round(((Number(breakdown.per_pax_total) || 0) * headcount + (Number(breakdown.flat_total) || 0)) * 100) / 100;
    } else if (productData?.schedule_total_price != null) {
      itineraryTotal = Math.round(Number(productData.schedule_total_price) * headcount * 100) / 100;
    }
    basePrice = itineraryTotal;
    if (productData?.schedule_total_price != null) {
      itineraryDisplayPrice = Number(productData.schedule_total_price).toFixed(2);
    }
  } else if (productType === 'package') {
    basePrice = packagePricing.price;
  } else {
    basePrice = Number(productData?.pricing?.regular_price ?? productData?.base_pricing?.variations?.[0]?.regular_price ?? 0);
  }

  // Build list of applicable-but-not-yet-active discount hints for activities
  const eb = productData?.earlyBirdDiscount;
  const lm = productData?.lastMinuteDiscount;
  const hasDate = Boolean(dateRange?.from);
  const showEbHint = productType === 'activity' && eb?.enabled && !pricing?.earlyBirdDiscount;
  const showLmHint = productType === 'activity' && lm?.enabled && !pricing?.lastMinuteDiscount;
  const actionCurrency = packagePricing?.currency ?? productData?.pricing?.currency ?? productData?.schedule_total_currency ?? 'USD';
  const actionPrimaryPrice = productType === 'activity' && pricing?.headcount >= 1 ? formatCurrency(pricing.final, pricing.currency) : formatCurrency(basePrice + addonsTotal, actionCurrency);
  const actionSecondaryPrice = isInCart && !isEditingCartItem ? 'Item in cart' : activeSelectedAddons.length > 0 ? `Includes ${formatCurrency(addonsTotal, actionCurrency)} in add-ons` : 'Total';
  const sharedActionProps = {
    formId: `booking-form-${productId}`,
    primaryPrice: actionPrimaryPrice,
    secondaryPrice: actionSecondaryPrice,
    isEditing: isEditingCartItem,
    isInCart,
    onShowCart: () => setMiniCartOpen(true),
  };

  return (
    <FormProvider {...methods}>
      <div data-testid="product-sidebar-layout" className="relative z-[1] h-full px-6 py-8 xl:px-10 xl:pb-12 xl:pt-10">
        <div data-testid="booking-sticky-card" className="weelp-booking-sticky relative z-[2]">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            {/* Base Price */}
            {productType === 'itinerary' ? (
              (() => {
                const guests = Math.max(1, (Number(howMany?.adults) || 1) + (Number(howMany?.children) || 0));
                const currency = productData?.schedule_total_currency ?? '';
                return (
                  <div>
                    {itineraryTotal > 0 ? (
                      <h3 className="text-foreground font-bold text-2xl lg:text-[28px]">
                        <span key={`${currency}-${itineraryTotal}`} className="inline-block animate-price-fade">
                          {currency} {itineraryTotal.toFixed(2)}
                        </span>{' '}
                        <span className="text-base font-medium text-muted-foreground">
                          total for {guests} guest{guests === 1 ? '' : 's'}
                        </span>
                      </h3>
                    ) : (
                      <h3 className="text-foreground font-bold text-2xl lg:text-[28px]">
                        From{' '}
                        <span key={`${currency}-${itineraryDisplayPrice}`} className="inline-block animate-price-fade">
                          {currency} {itineraryDisplayPrice}
                        </span>{' '}
                        <span className="text-base font-medium text-muted-foreground">/ person</span>
                      </h3>
                    )}
                    {itineraryTotal > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        <span key={`${currency}-${itineraryDisplayPrice}-pp`} className="inline-block animate-price-fade">
                          {currency} {itineraryDisplayPrice}
                        </span>{' '}
                        / person
                      </p>
                    )}
                  </div>
                );
              })()
            ) : (
              <h3 className="text-foreground font-bold text-2xl lg:text-[28px]">
                From{' '}
                <span key={`fallback-${basePrice}-${actionCurrency}`} className="inline-block animate-price-fade">
                  {formatCurrency(basePrice, actionCurrency)}
                </span>{' '}
                / person
              </h3>
            )}

            {/* Pricing Breakdown for Activities — renders as soon as headcount >= 1 */}
            {productType === 'activity' && pricing && pricing.headcount >= 1 ? (
              <Accordion type="multiple" className="mt-2">
                <AccordionItem value="price-details" className="border-b-0">
                  <AccordionTrigger className="rounded-xl border border-border bg-background px-4 text-left text-foreground">Price details</AccordionTrigger>
                  <AccordionContent>
                    {(() => {
                      const regularPrice = pricing.season?.regularPrice ?? pricing.pricePerHead;
                      const regularSubtotal = regularPrice * pricing.headcount;
                      return (
                        <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
                          <div className="space-y-2">
                            <RowPulse value={regularSubtotal} className="flex justify-between">
                              <span>
                                <span key={`reg-${regularPrice}`} className="inline-block animate-price-fade">
                                  {formatCurrency(regularPrice, pricing.currency)}
                                </span>{' '}
                                ×{' '}
                                <span key={`head-${pricing.headcount}`} className="inline-block animate-price-fade">
                                  {pricing.headcount}
                                </span>
                              </span>
                              <span className="text-foreground">
                                <span key={`sub-${regularSubtotal}`} className="inline-block animate-price-fade">
                                  {formatCurrency(regularSubtotal, pricing.currency)}
                                </span>
                              </span>
                            </RowPulse>
                            {pricing.season && pricing.season.savings > 0 && (
                              <RowPulse value={pricing.season.savings} className="flex justify-between text-green-700">
                                <span>Seasonal rate{pricing.season.name ? ` (${pricing.season.name})` : ''} applied</span>
                                <span>
                                  -
                                  <span key={`season-${pricing.season.savings}`} className="inline-block animate-price-fade">
                                    {formatCurrency(pricing.season.savings, pricing.currency)}
                                  </span>
                                </span>
                              </RowPulse>
                            )}
                            {pricing.groupDiscount &&
                              (() => {
                                const rule = pricing.groupDiscount.rule;
                                const discountLabel =
                                  rule.discount_type === 'percentage'
                                    ? `${Number(rule.discount_amount)}% off ${pricing.groupDiscount.discountedQty} travelers`
                                    : `flat ${formatCurrency(Number(rule.discount_amount), pricing.currency)} × ${pricing.groupDiscount.bundles} bundle${pricing.groupDiscount.bundles === 1 ? '' : 's'}`;
                                return (
                                  <RowPulse value={pricing.groupDiscount.amount} className="flex justify-between text-green-700">
                                    <span>Group discount ({discountLabel})</span>
                                    <span>
                                      -
                                      <span key={`grp-${pricing.groupDiscount.amount}`} className="inline-block animate-price-fade">
                                        {formatCurrency(pricing.groupDiscount.amount, pricing.currency)}
                                      </span>
                                    </span>
                                  </RowPulse>
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
                                return <div className="text-xs text-weelp-copy">{hintText}</div>;
                              })()}
                            {pricing.earlyBirdDiscount && (
                              <RowPulse value={pricing.earlyBirdDiscount.amount} className="flex justify-between text-green-700">
                                <span>Early bird discount</span>
                                <span>
                                  -
                                  <span key={`eb-${pricing.earlyBirdDiscount.amount}`} className="inline-block animate-price-fade">
                                    {formatCurrency(pricing.earlyBirdDiscount.amount, pricing.currency)}
                                  </span>
                                </span>
                              </RowPulse>
                            )}
                            {pricing.lastMinuteDiscount && (
                              <RowPulse value={pricing.lastMinuteDiscount.amount} className="flex justify-between text-green-700">
                                <span>Last minute discount</span>
                                <span>
                                  -
                                  <span key={`lm-${pricing.lastMinuteDiscount.amount}`} className="inline-block animate-price-fade">
                                    {formatCurrency(pricing.lastMinuteDiscount.amount, pricing.currency)}
                                  </span>
                                </span>
                              </RowPulse>
                            )}
                            {pricing.addonsTotal > 0 && (
                              <RowPulse value={pricing.addonsTotal} className="flex justify-between">
                                <span>Add-ons</span>
                                <span>
                                  +
                                  <span key={`ad-${pricing.addonsTotal}`} className="inline-block animate-price-fade">
                                    {formatCurrency(pricing.addonsTotal, pricing.currency)}
                                  </span>
                                </span>
                              </RowPulse>
                            )}
                            <RowPulse value={pricing.final} className="border-t border-border pt-2 flex justify-between text-foreground">
                              <span>Total</span>
                              <span>
                                <span key={`final-${pricing.final}`} className="inline-block animate-price-fade">
                                  {formatCurrency(pricing.final, pricing.currency)}
                                </span>
                              </span>
                            </RowPulse>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Discount rule hints for activities */}
                    {(showEbHint || showLmHint) && (
                      <div className="mt-3 flex flex-col gap-1 text-xs text-weelp-copy">
                        {showEbHint && (
                          <span>
                            Early bird: book {Number(eb.days_before_start)}+ days ahead for{' '}
                            {eb.discount_type === 'percentage' ? `${Number(eb.discount_amount)}% off` : `${formatCurrency(Number(eb.discount_amount), pricing?.currency ?? 'USD')} off per person`}.
                          </span>
                        )}
                        {showLmHint && (
                          <span>
                            Last minute: book within {Number(lm.days_before_start)} days for{' '}
                            {lm.discount_type === 'percentage' ? `${Number(lm.discount_amount)}% off` : `${formatCurrency(Number(lm.discount_amount), pricing?.currency ?? 'USD')} off`}.
                          </span>
                        )}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ) : null}

            {/* Actual Form with Inputs */}
            <SingleProductForm
              productId={productId}
              productData={productData}
              selectedAddons={activeSelectedAddons}
              formId={`booking-form-${productId}`}
              defaultDateRange={defaultDateRange}
              onDateChange={onDateChange}
              scheduleCount={scheduleCount}
              onSelectorOpenChange={setSelectorOpen}
            />

            {/* Select Addon */}
            {addons.length > 0 && (
              <Accordion type="multiple" className="mt-2">
                <AccordionItem value="add-ons" className="border-b-0">
                  <AccordionTrigger className="rounded-xl border border-border bg-background px-4 text-left text-foreground">
                    Add-ons · {activeSelectedAddons.length === 0 ? 'None selected' : `${activeSelectedAddons.length} selected`}
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4">
                    {addons.map((addon) => {
                      const isChecked = activeSelectedAddons.some((a) => a.addon_id === addon.addon_id);
                      return (
                        <div
                          key={addon.addon_id}
                          role="checkbox"
                          aria-checked={isChecked}
                          tabIndex={0}
                          className={`flex items-center gap-3 cursor-pointer group rounded-md px-2 -mx-2 transition-colors duration-200 ease-[var(--weelp-ease-out)] motion-reduce:transition-none ${
                            isChecked ? 'bg-surface-tint' : 'bg-transparent'
                          }`}
                          onClick={() => toggleAddon(addon)}
                          onKeyDown={(e) => {
                            if (e.key === ' ' || e.key === 'Enter') {
                              e.preventDefault();
                              toggleAddon(addon);
                            }
                          }}
                        >
                          <span
                            className={`w-5 h-5 rounded-[4px] flex items-center justify-center flex-shrink-0 transition-colors duration-200 ease-[var(--weelp-ease-out)] motion-reduce:transition-none ${
                              isChecked ? 'bg-weelp-sage-deep' : 'border-2 border-border bg-card'
                            }`}
                          >
                            <Check
                              size={14}
                              className={`text-white transition-transform duration-[120ms] ease-[var(--weelp-ease-out)] motion-reduce:transition-none ${isChecked ? 'scale-100' : 'scale-0'}`}
                            />
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="text-base font-medium text-foreground">{addon.addon_name}</span>
                            {addon.addon_description && <p className="text-sm text-muted-foreground truncate">{addon.addon_description}</p>}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {addon.addon_sale_price != null ? (
                              <>
                                <span className="text-sm text-muted-foreground line-through">
                                  ${Number(addon.addon_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                                <span className="text-base font-semibold text-foreground">
                                  ${Number(addon.addon_sale_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </>
                            ) : (
                              <span className="text-base font-semibold text-foreground">
                                ${Number(addon.addon_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}

            <div className="mt-4">
              <BookingAction ref={inlineActionRef} {...sharedActionProps} />
            </div>
          </div>

          {/* Questions Card */}
          <div data-testid="booking-support" className="relative z-[1] mt-6 border border-border rounded-xl p-7 bg-background">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-2">
                <h4 className="text-foreground font-semibold text-lg">Questions?</h4>
                <p className="text-base text-muted-foreground">Visit the Weelp Help Centre for any further questions.</p>
                <span className="text-sm text-copy mt-2">Product ID : {productId ?? 451245}</span>
              </div>
              {helpContext ? (
                <button
                  ref={helpTriggerRef}
                  type="button"
                  onClick={() => setHelpOpen(true)}
                  className="px-6 py-3 border border-border rounded-lg text-sm font-medium text-foreground whitespace-nowrap hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  Help Center
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      {actionVisibilityKnown && !inlineActionVisible && !selectorOpen && !hasPendingItineraryEdits && typeof document !== 'undefined'
        ? createPortal(
            <div
              data-testid="mobile-booking-bar"
              className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 shadow-[0_-4px_16px_rgba(24,24,27,0.08)] xl:hidden"
            >
              <div className="container-page">
                <BookingAction {...sharedActionProps} variant="mobile" />
              </div>
            </div>,
            document.body,
          )
        : null}
      {helpContext ? <ContextualHelpPanel open={helpOpen} onOpenChange={setHelpOpen} context={helpContext} triggerRef={helpTriggerRef} /> : null}
    </FormProvider>
  );
};

export default ProductSidebar;
