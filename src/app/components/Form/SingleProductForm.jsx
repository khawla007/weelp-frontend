'use client';

// This Form Is Used in Single Product Page
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Calendar, Users, Minus, Plus } from 'lucide-react';
import { useFormContext, Controller } from 'react-hook-form';
import { WeelpCalendar, EMPTY_DATE_RANGE } from '@/components/calendar';
import { useRouter } from 'next/navigation';
import useMiniCartStore from '@/lib/store/useMiniCartStore';
import { log } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { calculateActivityPrice } from '@/lib/pricing/calculateActivityPrice';

const PANEL_MOTION_CLASS = 'transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none motion-reduce:transform-none';
const OPEN_PANEL_MOTION_CLASS = 'opacity-100 translate-y-0 scale-100 animate-in fade-in-0 slide-in-from-top-1';
const CLOSED_PANEL_MOTION_CLASS = 'pointer-events-none opacity-0 -translate-y-1 scale-[0.98]';
const PANEL_EXIT_MS = 160;
const CLOSED_PANEL_A11Y_PROPS = { 'aria-hidden': true, inert: true };

// activity
export default function SingleProductForm({ productId, productData, selectedAddons = [], formId, defaultDateRange = null, onDateChange = null, scheduleCount = 0 }) {
  const [initform] = useState(() => true);
  const [showCalendar, setShowCalendar] = useState(false); // date & howmany
  const [showHowMany, setShowHowMany] = useState(false); // date & howmany
  const [showResponse, setShowResponse] = useState(false);
  const panelTimersRef = useRef({});
  const [calendarPresence, setCalendarPresence] = useState({ isMounted: false, state: 'closed' });
  const { setMiniCartOpen, addItem, clearCart } = useMiniCartStore();
  const { toast } = useToast();

  const router = useRouter(); // intialize router

  // Get form from parent ProductSidebar via FormProvider
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    clearErrors,
    formState: { errors, isValid },
  } = useFormContext();

  const [selectedDates, setSelectedDates] = useState(defaultDateRange ?? { from: null, to: null });
  const isSingleDateMode = scheduleCount > 0;

  const getPanelMotionClass = (state) => `${PANEL_MOTION_CLASS} ${state === 'open' ? OPEN_PANEL_MOTION_CLASS : CLOSED_PANEL_MOTION_CLASS}`;

  const clearPanelTimer = useCallback((panelName) => {
    if (panelTimersRef.current[panelName]) {
      window.clearTimeout(panelTimersRef.current[panelName]);
      panelTimersRef.current[panelName] = null;
    }
  }, []);

  const openPanel = useCallback(
    (panelName, setPanelPresence) => {
      clearPanelTimer(panelName);
      setPanelPresence({ isMounted: true, state: 'open' });
    },
    [clearPanelTimer],
  );

  const closePanel = useCallback(
    (panelName, setPanelPresence) => {
      clearPanelTimer(panelName);
      setPanelPresence((current) => (current.isMounted ? { isMounted: true, state: 'closed' } : current));
      panelTimersRef.current[panelName] = window.setTimeout(() => {
        setPanelPresence({ isMounted: false, state: 'closed' });
      }, PANEL_EXIT_MS);
    },
    [clearPanelTimer],
  );

  const openCalendarPanel = useCallback(() => {
    setShowCalendar(true);
    openPanel('calendar', setCalendarPresence);
  }, [openPanel]);

  const closeCalendarPanel = useCallback(() => {
    setShowCalendar(false);
    closePanel('calendar', setCalendarPresence);
  }, [closePanel]);

  useEffect(() => {
    return () => {
      Object.values(panelTimersRef.current).forEach((timer) => {
        if (timer) window.clearTimeout(timer);
      });
    };
  }, []);

  // For itinerary/package: compute end date from start date + schedule days
  const computeEndDate = (startDate) => {
    const end = new Date(startDate);
    end.setDate(end.getDate() + Math.max(0, scheduleCount - 1));
    return end;
  };

  // RHF is the single source of truth for howMany — read via watch().
  // Previously this was a parallel useState, which caused a cross-component
  // update during render when setValue fired inside the setHowMany updater.
  const howMany = watch('howMany') ?? { adults: 1, children: 0, infants: 0 };

  // Handle validation errors — toast limit is 1, so show only the first error
  const onError = (formErrors) => {
    if (formErrors.dateRange) {
      toast({
        title: 'Please select a date',
        variant: 'destructive',
      });
    } else if (formErrors.howMany) {
      toast({
        title: 'Please select at least one adult',
        variant: 'destructive',
      });
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    setMiniCartOpen(true);

    // compute combined price with add-ons
    const addonsTotal = selectedAddons.reduce((sum, a) => sum + Number(a.addon_sale_price ?? a.addon_price), 0);

    // For activities: use calculateActivityPrice utility.
    // For itinerary: per_pax_total × headcount + flat_total + addons.
    // For package: schedule_total_price + addons (legacy path).
    let price;
    let currency;
    let basePrice;
    const itineraryExtras = {};

    if (productData?.item_type === 'activity') {
      const pricing = calculateActivityPrice({
        activity: productData,
        dateRange: data.dateRange,
        people: data.howMany,
        selectedAddons,
      });
      price = pricing.final;
      basePrice = pricing.subtotal;
      currency = pricing.currency;
    } else if (productData?.item_type === 'itinerary') {
      const headcount = Math.max(1, Number(data?.howMany?.adults ?? 1) + Number(data?.howMany?.children ?? 0));
      const breakdown = productData?.pricing_breakdown ?? null;
      const perPax = Number(breakdown?.per_pax_total ?? 0);
      const flat = Number(breakdown?.flat_total ?? 0);
      basePrice = breakdown ? Math.round((perPax * headcount + flat) * 100) / 100 : Number(productData?.schedule_total_price ?? 0) * headcount;
      price = Math.round((basePrice + addonsTotal) * 100) / 100;
      currency = productData?.schedule_total_currency || 'usd';
      itineraryExtras.headcount = headcount;
      itineraryExtras.per_pax_total = perPax;
      itineraryExtras.flat_total = flat;
      itineraryExtras.per_person_price = Number(productData?.schedule_total_price ?? perPax) || perPax;
      itineraryExtras.slug = productData?.slug;
      itineraryExtras.city_slug = productData?.city_slug;
    } else {
      // Package fallback — same legacy behavior as before.
      basePrice = Number(productData?.schedule_total_price ?? 0);
      price = basePrice + addonsTotal;
      currency = productData?.schedule_total_currency || 'usd';
    }

    // add item to cart
    addItem({
      id: productData?.id,
      base_price: basePrice,
      price: price,
      addons_total: Math.round(addonsTotal * 100) / 100,
      name: productData?.name,
      currency: currency,
      ...data,
      ...itineraryExtras,
      featured_image: productData?.featured_image || 'https://picsum.photos/200/300',
      type: productData?.item_type,
      addons: selectedAddons.map((a) => ({
        addon_id: a.addon_id,
        addon_name: a.addon_name,
        price: a.addon_sale_price ?? a.addon_price,
      })),
    });

    // display notification
    toast({
      title: 'Item Added to Cart',
      duration: 1000,
    });

    setMiniCartOpen(true);
    setShowResponse(!showResponse);
    setShowCalendar(false);
    setCalendarPresence({ isMounted: false, state: 'closed' });
    setShowHowMany(false);
  };

  // Increment/Decrement Handlers — RHF is source of truth, no local state.
  // Itineraries cap adults+children at productData.max_guests (smallest
  // transfer capacity); infants are excluded from the cap.
  const handleIncrement = (type) => {
    const current = Number(howMany?.[type] ?? 0);
    const maxGuests = Number(productData?.max_guests) || null;
    if (maxGuests !== null && type !== 'infants') {
      const adults = Number(howMany?.adults ?? 0);
      const children = Number(howMany?.children ?? 0);
      const totalGuests = adults + children;
      if (totalGuests >= maxGuests) {
        return;
      }
    }
    setValue(`howMany.${type}`, current + 1);
  };

  const handleDecrement = (type) => {
    const current = Number(howMany?.[type] ?? 0);
    setValue(`howMany.${type}`, Math.max(current - 1, 0));
  };

  // Toggle Calendar
  const toggleCalendar = () => {
    if (showCalendar) {
      closeCalendarPanel();
    } else {
      openCalendarPanel();
    }
    setShowHowMany(false);
    setShowResponse(false);
    clearErrors('dateRange');

    // Keep the selected range visible when reopening. The shared calendar
    // starts a fresh range when the user clicks a new start date.
  };

  // Toggle How Many
  const toggleHowMany = () => {
    setShowHowMany(!showHowMany);
    closeCalendarPanel();
    clearErrors('howMany');

    // handleReponse
    setShowResponse(false);
  };

  if (initform) {
    return (
      <div className="p-4 sm:p-6 sm:px-0 w-full relative singleProducform">
        {/* Form with Inputs */}
        <form id={formId} onSubmit={handleSubmit(onSubmit, onError)} className="flex flex-col justify-around items-center gap-4 w-full">
          <span className="hidden" id={productId} />
          {/* For Date & Travelers */}
          <div className="w-full flex flex-col gap-4">
            <h5 className="self-start text-copy">Select Date & Travelers</h5>
            <div className="flex gap-3 w-full">
              {/* Travelers Card */}
              <div
                className={`flex-1 bg-background rounded-xl border shadow-[0_3px_9px_rgba(0,0,0,0.04)] py-[18px] px-[24px] cursor-pointer ${errors.howMany ? 'border-red-500' : 'border-border/50'}`}
                onClick={toggleHowMany}
              >
                <div className="flex items-center gap-3 text-copy">
                  <Users size={20} />
                  <span className="text-base">{howMany?.adults + howMany?.children} Travelers</span>
                </div>
              </div>

              {/* Date Card */}
              <div
                className={`flex-1 bg-background rounded-xl border shadow-[0_3px_9px_rgba(0,0,0,0.04)] py-[18px] px-[24px] cursor-pointer ${errors.dateRange ? 'border-red-500' : 'border-border/50'}`}
                onClick={toggleCalendar}
              >
                <div className="flex items-center gap-3 text-copy">
                  <Calendar size={20} />
                  <span className="text-base">
                    {selectedDates?.from && selectedDates?.to
                      ? `${selectedDates.from.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${selectedDates.to.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                      : 'When?'}
                  </span>
                </div>
              </div>
            </div>

            {/* Toggle Fields */}
            <div className="flex rounded-lg absolute z-50 pointer-events-auto  top-[30%] w-full scale-90 sm:scale-[unset]">
              {calendarPresence.isMounted && (
                <div
                  data-testid="single-product-calendar-panel"
                  data-state={calendarPresence.state}
                  role="dialog"
                  aria-label="Date selector"
                  {...(calendarPresence.state === 'closed' ? CLOSED_PANEL_A11Y_PROPS : {})}
                  onMouseLeave={closeCalendarPanel}
                  className={`flex justify-center mx-auto bg-background w-fit rounded-lg shadow-lg border p-2 ${getPanelMotionClass(calendarPresence.state)}`}
                >
                  <Controller
                    name="dateRange"
                    control={control}
                    render={({ field }) =>
                      isSingleDateMode ? (
                        <WeelpCalendar
                          mode="single"
                          months={1}
                          selected={field.value?.from}
                          disablePast
                          onSelect={(day) => {
                            if (day) {
                              const range = { from: day, to: computeEndDate(day) };
                              field.onChange(range);
                              setSelectedDates(range);
                              if (onDateChange) onDateChange(range);
                              closeCalendarPanel();
                            } else {
                              field.onChange(EMPTY_DATE_RANGE);
                              setSelectedDates(EMPTY_DATE_RANGE);
                            }
                          }}
                          showClear
                        />
                      ) : (
                        <WeelpCalendar
                          mode="range"
                          months={2}
                          selected={field.value}
                          disablePast
                          onSelect={(value) => {
                            const next = value ?? EMPTY_DATE_RANGE;
                            field.onChange(next);
                            setSelectedDates(next);
                            if (onDateChange && next.from) onDateChange(next);
                            if (next.from && next.to && next.from.getTime() !== next.to.getTime()) {
                              closeCalendarPanel();
                            }
                          }}
                          showClear
                        />
                      )
                    }
                  />
                </div>
              )}

              {showHowMany && (
                <div className="text-nowrap flex flex-col gap-4  w-full items-center ">
                  <div
                    onMouseLeave={(e) => {
                      setShowHowMany(!showHowMany);
                    }}
                    className="bg-background w-fit p-4 px-6 rounded-lg flex flex-col gap-4 border"
                  >
                    {['adults', 'children', 'infants'].map((type, index) => (
                      <div key={index} className="flex justify-between items-center w-full gap-6">
                        <div>
                          <h3 className="font-semibold capitalize">{type}</h3>
                          <span className="text-sm">{type == 'adults' ? 'Above 13 or above' : type == 'children' ? 'Age 2-12' : type == 'infants' ? 'Under 2' : null}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => handleDecrement(type)}
                            className="w-8 h-8 rounded-full border text-lg flex items-center justify-center text-copy bg-graycolor hover:bg-weelp-sage-wash hover:opacity-80"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="font-semibold">{howMany?.[type] ?? 0}</span>
                          <button
                            type="button"
                            onClick={() => handleIncrement(type)}
                            className="w-8 h-8 rounded-full border border-weelp-sage-tint text-lg flex items-center justify-center text-weelp-sage-deep hover:bg-weelp-sage-wash hover:opacity-80 "
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    );
  }
}
