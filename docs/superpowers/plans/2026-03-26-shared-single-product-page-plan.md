# Shared Single Product Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify activity, itinerary, and package single pages into shared components, eliminating ~90% code duplication and aligning all pages to the modern activity page design.

**Architecture:** One `SingleProductTabSection` component replaces three separate tab sections (`TabSectionActivity`, `TabSectionIterenary`, `TabSectionPackage`). A shared `ProductSidebar` replaces three sidebar implementations. An enhanced `ItineraryPanel` adds date-driven schedule navigation. All pages converge on the activity page's modern styling.

**Tech Stack:** Next.js 15, React 19, Tailwind CSS, Zustand, SWR, react-hook-form, zod, react-day-picker, lodash, lucide-react

**Spec:** `docs/superpowers/specs/2026-03-26-shared-single-product-page-design.md`

---

### Task 1: Copy Sidebar Bottom Image Asset

**Files:**
- Create: `public/assets/images/itinerary-sidebar-bottom.png`

- [ ] **Step 1: Copy the image from Designs to public assets**

```bash
cp /home/khawla/Documents/weelp/Designs/images/image-import-13.png /home/khawla/Documents/weelp/frontend/public/assets/images/itinerary-sidebar-bottom.png
```

- [ ] **Step 2: Verify the file exists**

```bash
ls -la /home/khawla/Documents/weelp/frontend/public/assets/images/itinerary-sidebar-bottom.png
```

Expected: File exists, ~50-200KB

- [ ] **Step 3: Commit**

```bash
cd /home/khawla/Documents/weelp/frontend
git add public/assets/images/itinerary-sidebar-bottom.png
git commit -m "feat: add itinerary sidebar bottom image asset"
```

---

### Task 2: Add `defaultDateRange` and `onDateChange` Props to `SingleProductForm`

**Files:**
- Modify: `src/app/components/Form/SingleProductForm.jsx`

This task adds two optional props to the existing activity booking form so itinerary/package pages can pre-select dates and react to date changes.

- [ ] **Step 1: Add `defaultDateRange` and `onDateChange` props**

In `src/app/components/Form/SingleProductForm.jsx`, change the function signature from:

```jsx
export default function SingleProductForm({ productId, productData, selectedAddons = [], formId }) {
```

to:

```jsx
export default function SingleProductForm({ productId, productData, selectedAddons = [], formId, defaultDateRange = null, onDateChange = null }) {
```

- [ ] **Step 2: Use `defaultDateRange` for form defaults and initial state**

Replace the `useForm` defaultValues and `selectedDates` state:

Change:
```jsx
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      dateRange: { from: null, to: null },
      howMany: { adults: 1, children: 0, infants: 0 },
    },
  });

  const [selectedDates, setSelectedDates] = useState({ from: null, to: null });
```

To:
```jsx
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      dateRange: defaultDateRange ?? { from: null, to: null },
      howMany: { adults: 1, children: 0, infants: 0 },
    },
  });

  const [selectedDates, setSelectedDates] = useState(defaultDateRange ?? { from: null, to: null });
```

- [ ] **Step 3: Call `onDateChange` when dates are selected**

In the `DayPicker` `onSelect` callback, add the `onDateChange` call. Change:

```jsx
                        onSelect={(value) => {
                          field.onChange(value);
                          setSelectedDates(value ?? { from: null, to: null });
                          if (value?.from && value?.to && value.from.getTime() !== value.to.getTime()) {
                            setShowCalendar(false);
                          }
                        }}
```

To:

```jsx
                        onSelect={(value) => {
                          field.onChange(value);
                          setSelectedDates(value ?? { from: null, to: null });
                          if (onDateChange && value?.from) {
                            onDateChange(value);
                          }
                          if (value?.from && value?.to && value.from.getTime() !== value.to.getTime()) {
                            setShowCalendar(false);
                          }
                        }}
```

- [ ] **Step 4: Verify build passes**

```bash
cd /home/khawla/Documents/weelp/frontend && npx next build 2>&1 | tail -20
```

Expected: Build succeeds. No breaking changes since new props are optional with defaults.

- [ ] **Step 5: Commit**

```bash
git add src/app/components/Form/SingleProductForm.jsx
git commit -m "feat: add defaultDateRange and onDateChange props to SingleProductForm"
```

---

### Task 3: Create `ProductSidebar.jsx`

**Files:**
- Create: `src/app/components/Pages/FRONT_END/singleproduct/ProductSidebar.jsx`

This extracts the sidebar from the current `ProductForm` in `TabSection__modules.jsx` into a standalone shared component. It handles price display, the booking form, addon selection, action card, and questions card.

- [ ] **Step 1: Create `ProductSidebar.jsx`**

Create file `src/app/components/Pages/FRONT_END/singleproduct/ProductSidebar.jsx` with:

```jsx
'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import SingleProductForm from '@/app/components/Form/SingleProductForm';
import useMiniCartStore from '@/lib/store/useMiniCartStore';

const ProductSidebar = ({ productId, productData, defaultDateRange = null, onDateChange = null }) => {
  const [selectedAddons, setSelectedAddons] = useState([]);
  const { cartItems, setMiniCartOpen } = useMiniCartStore();
  const isInCart = cartItems.some((item) => item.id === productData?.id);

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
      />

      {/* Select Addon */}
      {productData?.addons?.length > 0 && (
        <>
          <p className="text-[#5a5a5a] text-base font-medium mb-3 mt-6">Select Addon</p>
          <div className="bg-white rounded-xl border border-[#ccc]/50 shadow-[0_3px_9px_rgba(0,0,0,0.04)] p-5 flex flex-col gap-3">
            {productData.addons.map((addon) => {
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
```

- [ ] **Step 2: Verify build passes**

```bash
cd /home/khawla/Documents/weelp/frontend && npx next build 2>&1 | tail -20
```

Expected: Build succeeds. File is created but not yet imported anywhere.

- [ ] **Step 3: Commit**

```bash
git add src/app/components/Pages/FRONT_END/singleproduct/ProductSidebar.jsx
git commit -m "feat: create shared ProductSidebar component"
```

---

### Task 4: Create Enhanced `ItineraryPanel.jsx`

**Files:**
- Create: `src/app/components/Pages/FRONT_END/singleproduct/ItineraryPanel.jsx`

This extracts the itinerary/package schedule panel from `TabSection__modules.jsx` and adds date-driven navigation. Used by both itinerary and package pages (Tab 1).

- [ ] **Step 1: Create `ItineraryPanel.jsx`**

Create file `src/app/components/Pages/FRONT_END/singleproduct/ItineraryPanel.jsx` with:

```jsx
'use client';

import React, { useRef } from 'react';
import { MapPin, LifeBuoy, User, Wind, Clock4, Eye } from 'lucide-react';

// Format date as "3rd Oct, Mon"
const formatDayDate = (date) => {
  const day = date.getDate();
  const suffix = day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th';
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
  return `${day}${suffix} ${month}, ${weekday}`;
};

const ItineraryPanel = ({ schedules = [], startDate = null, title = 'Itinerary' }) => {
  const dayRefs = useRef({});

  const scrollToDay = (dayIndex) => {
    const el = dayRefs.current[dayIndex];
    if (el) {
      const offset = el.getBoundingClientRect().top + window.scrollY - 200;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-[28px] font-semibold text-[#273f4e] capitalize">{title}</h2>

      {/* Date Navigation Buttons */}
      {startDate && schedules.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {schedules.map((_, index) => {
            const dayDate = new Date(startDate);
            dayDate.setDate(dayDate.getDate() + index);
            return (
              <button
                key={index}
                onClick={() => scrollToDay(index)}
                className="px-4 py-2 text-sm font-medium text-[#5a5a5a] bg-white border border-[#e5e5e5] rounded-lg whitespace-nowrap hover:bg-gray-50 hover:border-[#0c2536] hover:text-[#0c2536] transition-colors"
              >
                {formatDayDate(dayDate)}
              </button>
            );
          })}
        </div>
      )}

      {/* Day-by-Day Schedule */}
      <div className="flex flex-col gap-8">
        {schedules.map((schedule, index) => {
          const { day = '', activities = [], transfers = [] } = schedule;
          const dayTitle = schedule.title || `Arrival in Port Blair`;

          return (
            <div key={index} ref={(el) => (dayRefs.current[index] = el)}>
              <ScheduleDayCard
                dayNumber={day}
                dayTitle={dayTitle}
                activities={activities}
                transfers={transfers}
                startDate={startDate}
                dayIndex={index}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ScheduleDayCard = ({ dayNumber, dayTitle, activities, transfers, startDate, dayIndex }) => {
  const transfer = transfers?.[0] || {};
  const { name: transferName, pickup_location, dropoff_location, vehicle_type, duration: transferDuration } = transfer;
  const activity = activities?.[0] || {};
  const { name: activityName, location, duration: activityDuration, type: activityType, featured_image } = activity;

  // Compute date label for this day
  let dateLabel = '';
  if (startDate) {
    const dayDate = new Date(startDate);
    dayDate.setDate(dayDate.getDate() + dayIndex);
    dateLabel = formatDayDate(dayDate);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Day Header */}
      <div className="flex items-center gap-3">
        <p className="text-[#0c2536] text-lg font-semibold">Day - {dayNumber} {dayTitle}</p>
        {dateLabel && <span className="text-sm text-[#5a5a5a]">({dateLabel})</span>}
      </div>

      {/* Transfer Card */}
      {transferName && (
        <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-[#f8f9f9] border-b border-[#e5e5e5]">
            <span className="text-sm font-semibold text-[#0c2536]">Transfer</span>
            <span className="text-sm text-[#5a5a5a]">Description</span>
          </div>
          <div className="flex gap-4 p-4">
            <img
              src={transfer.featured_image || 'https://picsum.photos/300/200?random=1'}
              alt={transferName}
              className="w-[140px] h-[100px] object-cover rounded-lg flex-shrink-0"
            />
            <div className="flex flex-col justify-center gap-2 flex-1">
              <h3 className="text-[#0c2536] text-base font-semibold">{transferName}</h3>
              {vehicle_type && <p className="text-sm text-[#5a5a5a]">{vehicle_type}</p>}
              <div className="flex gap-4 flex-wrap mt-1">
                <span className="text-[#5a5a5a] inline-flex gap-1.5 items-center text-sm">
                  <User size={14} /> 3 Seater
                </span>
                <span className="text-[#5a5a5a] inline-flex gap-1.5 items-center text-sm">
                  <Wind size={14} /> AC
                </span>
                <span className="text-[#5a5a5a] inline-flex gap-1.5 items-center text-sm">
                  <LifeBuoy size={14} /> First Aid
                </span>
              </div>
            </div>
          </div>

          {/* Pickup → Dropoff */}
          <div className="px-4 pb-4 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 border border-[#e5e5e5] rounded-lg py-2 px-4 text-sm text-[#0c2536]">
              <MapPin size={14} /> {pickup_location || 'Airport'}
            </span>
            <div className="flex items-center gap-2 flex-1 mx-2">
              <div className="flex-1 border-t border-dashed border-[#ccc]" />
              {transferDuration && <span className="text-xs text-[#5a5a5a] whitespace-nowrap">{transferDuration}</span>}
              <div className="flex-1 border-t border-dashed border-[#ccc]" />
            </div>
            <span className="inline-flex items-center gap-2 border border-[#e5e5e5] rounded-lg py-2 px-4 text-sm text-[#0c2536]">
              <MapPin size={14} /> {dropoff_location || 'Hotel'}
            </span>
          </div>
        </div>
      )}

      {/* Activity Card */}
      {activityName && (
        <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-[#f8f9f9] border-b border-[#e5e5e5]">
            <span className="text-sm font-semibold text-[#0c2536]">Activity in {location || 'Melaka'} {activityDuration || '1.5 Hrs'}</span>
            <span className="text-sm text-[#5a5a5a]">Description</span>
          </div>
          <div className="flex gap-4 p-4">
            <img
              src={featured_image || 'https://picsum.photos/300/200?random=2'}
              alt={activityName}
              className="w-[140px] h-[100px] object-cover rounded-lg flex-shrink-0"
            />
            <div className="flex flex-col justify-center gap-2 flex-1">
              <h3 className="text-[#0c2536] text-base font-semibold">{activityName}</h3>
              {location && <p className="text-sm text-[#5a5a5a]">{location}</p>}
              <div className="flex gap-4 flex-wrap mt-1">
                {activity.tags?.map((tag, i) => (
                  <span key={i} className="text-[#5a5a5a] inline-flex gap-1.5 items-center text-sm">
                    <Eye size={14} /> {tag}
                  </span>
                ))}
                {activityDuration && (
                  <span className="text-[#5a5a5a] inline-flex gap-1.5 items-center text-sm">
                    <Clock4 size={14} /> {activityDuration}
                  </span>
                )}
                {activityType && (
                  <span className="text-[#5a5a5a] inline-flex gap-1.5 items-center text-sm">
                    <Eye size={14} /> {activityType}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Activity Locations */}
          {pickup_location && dropoff_location && (
            <div className="px-4 pb-4 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 border border-[#e5e5e5] rounded-lg py-2 px-4 text-sm text-[#0c2536]">
                <MapPin size={14} /> {pickup_location}
              </span>
              <div className="flex items-center gap-2 flex-1 mx-2">
                <div className="flex-1 border-t border-dashed border-[#ccc]" />
                {activityDuration && <span className="text-xs text-[#5a5a5a] whitespace-nowrap">{activityDuration}</span>}
                <div className="flex-1 border-t border-dashed border-[#ccc]" />
              </div>
              <span className="inline-flex items-center gap-2 border border-[#e5e5e5] rounded-lg py-2 px-4 text-sm text-[#0c2536]">
                <MapPin size={14} /> {dropoff_location}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ItineraryPanel;
```

- [ ] **Step 2: Verify build passes**

```bash
cd /home/khawla/Documents/weelp/frontend && npx next build 2>&1 | tail -20
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/components/Pages/FRONT_END/singleproduct/ItineraryPanel.jsx
git commit -m "feat: create enhanced ItineraryPanel with date-driven schedule navigation"
```

---

### Task 5: Create Unified `SingleProductTabSection.jsx`

**Files:**
- Create: `src/app/components/Pages/FRONT_END/singleproduct/SingleProductTabSection.jsx`

The core task: one component that replaces `TabSectionActivity`, `TabSectionIterenary`, and `TabSectionPackage`. Uses the activity page's modern styling for all three product types.

- [ ] **Step 1: Create `SingleProductTabSection.jsx`**

Create file `src/app/components/Pages/FRONT_END/singleproduct/SingleProductTabSection.jsx` with:

```jsx
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import throttle from 'lodash/throttle';
import { OverViewPanel, WhatIncludedPanel, ReviewPanel, FaqPanel } from './TabSection__modules';
import SimilarExperiences from './SimilarExperiences';
import ProductSidebar from './ProductSidebar';
import ItineraryPanel from './ItineraryPanel';

const HEADER_HEIGHT = 66;
const TAB_BAR_HEIGHT = 60;

const SIDEBAR_IMAGES = {
  activity: '/assets/images/activity-sidebar-bottom.png',
  itinerary: '/assets/images/itinerary-sidebar-bottom.png',
  package: '/assets/images/itinerary-sidebar-bottom.png',
};

const TAB_1_LABELS = {
  activity: 'Overview',
  itinerary: 'Itinerary',
  package: 'Package',
};

const getDefaultDateRange = (scheduleCount) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const endDate = new Date(tomorrow);
  endDate.setDate(endDate.getDate() + Math.max(0, (scheduleCount || 1) - 1));

  return { from: tomorrow, to: endDate };
};

const SingleProductTabSection = ({
  productType = 'activity',
  productId,
  productData,
  similarActivities = [],
  activitySlug,
  sidebarBottomImage,
}) => {
  const [activeTab, setActiveTab] = useState('tab_1');
  const sectionRefs = useRef({});
  const [fixedTab, setFixedTab] = useState(false);

  // Date state for itinerary/package
  const isScheduleType = productType === 'itinerary' || productType === 'package';
  const scheduleCount = productData?.schedules?.length || 0;

  const [selectedStartDate, setSelectedStartDate] = useState(() => {
    if (isScheduleType) {
      return getDefaultDateRange(scheduleCount).from;
    }
    return null;
  });

  const defaultDateRange = useMemo(() => {
    if (isScheduleType) {
      return getDefaultDateRange(scheduleCount);
    }
    return null;
  }, [isScheduleType, scheduleCount]);

  const handleDateChange = (dateRange) => {
    if (dateRange?.from) {
      setSelectedStartDate(dateRange.from);
    }
  };

  // Check if reviews exist
  const hasReviews = productData?.review_summary?.total_reviews > 0;
  const faqs = productData?.faqs || [];

  // Build tabs
  const tabs = useMemo(() => [
    { id: 'tab_1', label: TAB_1_LABELS[productType] },
    { id: 'tab_2', label: "What's Included" },
    ...(hasReviews ? [{ id: 'tab_3', label: 'Reviews' }] : []),
    { id: 'tab_4', label: 'FAQs' },
  ], [productType, hasReviews]);

  // Sticky tab + intersection observer
  useEffect(() => {
    const checkScrollY = () => {
      setFixedTab(window.scrollY > 700);
    };

    const throttledCheckScrollY = throttle(checkScrollY, 100);
    window.addEventListener('scroll', throttledCheckScrollY);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveTab(entry.target.id);
          }
        });
      },
      { threshold: 0.3 },
    );

    Object.values(sectionRefs.current).forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      window.removeEventListener('scroll', throttledCheckScrollY);
      observer.disconnect();
    };
  }, []);

  const toggleTab = (tab) => {
    setActiveTab(tab);
    const element = sectionRefs.current[tab];
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.scrollY - TAB_BAR_HEIGHT - 16;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  };

  const bottomImage = sidebarBottomImage || SIDEBAR_IMAGES[productType];

  return (
    <section className="w-full bg-white mt-[70px]">
      {/* Sticky Tab Bar */}
      <div
        className={`${fixedTab ? 'fixed' : 'relative'} z-[999] w-full bg-white shadow-[0_4px_8px_rgba(0,0,0,0.1)]`}
        style={fixedTab ? { top: `${HEADER_HEIGHT}px` } : undefined}
      >
        <div className="flex items-center justify-center">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => toggleTab(tab.id)}
              className={`relative px-6 lg:px-8 py-4 text-sm lg:text-[14px] cursor-pointer transition-colors ${activeTab === tab.id ? 'font-bold text-[#0c2536]' : 'font-normal text-black'}`}
              style={index < tabs.length - 1 ? { marginRight: '44px' } : undefined}
            >
              {tab.label}
              {activeTab === tab.id && <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#0c2536]" />}
            </button>
          ))}
        </div>
      </div>

      {/* Two-Column Content */}
      <div className={`flex flex-col xl:flex-row ${fixedTab ? 'mt-[60px]' : ''}`}>
        {/* Left Column — Content */}
        <div className="w-full xl:w-[58%]">
          <div className="max-w-[838px] mx-auto xl:ml-auto xl:mr-0 px-4 lg:px-0">
            {/* Tab 1: varies by productType */}
            <div id="tab_1" ref={(el) => (sectionRefs.current['tab_1'] = el)} className="pt-[70px] lg:mb-[35px]">
              {productType === 'activity' ? (
                <OverViewPanel description={productData?.description} />
              ) : (
                productData?.schedules?.length > 0 && (
                  <ItineraryPanel
                    schedules={productData.schedules}
                    startDate={selectedStartDate}
                    title={TAB_1_LABELS[productType]}
                  />
                )
              )}
            </div>

            {/* Tab 2: What's Included */}
            <div id="tab_2" ref={(el) => (sectionRefs.current['tab_2'] = el)} className="pt-[35px] lg:mb-[35px]">
              <WhatIncludedPanel />
            </div>

            {/* Tab 3: Reviews (conditional) */}
            {hasReviews && (
              <div id="tab_3" ref={(el) => (sectionRefs.current['tab_3'] = el)} className="pt-[35px] lg:mb-[35px]">
                <ReviewPanel productData={productData} activitySlug={activitySlug} />
              </div>
            )}

            {/* Tab 4: FAQs */}
            <div id="tab_4" ref={(el) => (sectionRefs.current['tab_4'] = el)} className="pt-[35px] lg:mb-[35px]">
              <FaqPanel faqs={faqs} />
            </div>

            {/* Similar Experiences */}
            <div className="lg:mb-[70px]">
              <SimilarExperiences activities={similarActivities} />
            </div>
          </div>
        </div>

        {/* Right Column — Booking Sidebar */}
        <div className="w-full xl:w-[42%] relative" style={{ background: 'linear-gradient(180deg, #f5f9fa 0%, rgba(255, 255, 255, 0.4) 100%)' }}>
          {/* Bottom decorative image */}
          <div className="absolute bottom-0 left-0 w-full h-auto pointer-events-none">
            <img src={bottomImage} alt="" className="w-full h-auto object-cover" style={{ maxHeight: '150px' }} />
            <div className="absolute bottom-0 left-0 w-full h-24 backdrop-blur-3xl opacity-70" />
          </div>
          <ProductSidebar
            productId={productId}
            productData={productData}
            defaultDateRange={defaultDateRange}
            onDateChange={isScheduleType ? handleDateChange : null}
          />
        </div>
      </div>
    </section>
  );
};

export default SingleProductTabSection;
```

- [ ] **Step 2: Verify build passes**

```bash
cd /home/khawla/Documents/weelp/frontend && npx next build 2>&1 | tail -20
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/components/Pages/FRONT_END/singleproduct/SingleProductTabSection.jsx
git commit -m "feat: create unified SingleProductTabSection component"
```

---

### Task 6: Update Activity Page to Use `SingleProductTabSection`

**Files:**
- Modify: `src/app/(frontend)/activity/[slug]/page.js`

- [ ] **Step 1: Replace `TabSectionActivity` with `SingleProductTabSection`**

Replace the entire contents of `src/app/(frontend)/activity/[slug]/page.js` with:

```jsx
/** This File Will Handle Destination Page (Single Product) */
import dynamic from 'next/dynamic';
import BannerSection from '@/app/components/Pages/FRONT_END/singleproduct/BannerSection';
import { notFound } from 'next/navigation';
import { getSingleActivity } from '@/lib/services/activites';
import { isEmpty } from 'lodash';

const SingleProductTabSection = dynamic(() => import('@/app/components/Pages/FRONT_END/singleproduct/SingleProductTabSection'));

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const { data: activityData = [] } = await getSingleActivity(slug);

  const { name, description } = activityData;

  return {
    title: name || '',
    description: description || '',
  };
}

export default async function SingleActivityPage({ params }) {
  const { slug } = await params;

  const { data: activityData = [] } = await getSingleActivity(slug);

  // if activity not found
  if (isEmpty(activityData)) {
    notFound();
  }

  const {
    id,
    name,
    description,
    item_type,
    pricing: { regular_price },
    media_gallery,
    review_summary,
  } = activityData;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': item_type,
    name: name,
    description: description,
  };

  return (
    <>
      <BannerSection activityName={name} media_gallery={media_gallery} reviewSummary={review_summary} />
      <SingleProductTabSection
        productType="activity"
        productId={id}
        productData={activityData}
        activitySlug={slug}
      />

      {/* Add JSON-LD to your page */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
```

- [ ] **Step 2: Verify build passes**

```bash
cd /home/khawla/Documents/weelp/frontend && npx next build 2>&1 | tail -20
```

Expected: Build succeeds. Activity page now uses the shared component.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(frontend\)/activity/\[slug\]/page.js
git commit -m "refactor: update activity page to use SingleProductTabSection"
```

---

### Task 7: Update Itinerary Page to Use `SingleProductTabSection`

**Files:**
- Modify: `src/app/(frontend)/itinerary/[itinerary]/page.js`

- [ ] **Step 1: Replace `TabSectionIterenary` with `SingleProductTabSection`**

Replace the entire contents of `src/app/(frontend)/itinerary/[itinerary]/page.js` with:

```jsx
import dynamic from 'next/dynamic';
import BannerSection from '@/app/components/Pages/FRONT_END/singleproduct/BannerSection';
import { notFound } from 'next/navigation';
import { getSingleItinerary } from '@/lib/services/itineraries';

const SingleProductTabSection = dynamic(() => import('@/app/components/Pages/FRONT_END/singleproduct/SingleProductTabSection'));

export async function generateMetadata({ params }) {
  const { itinerary } = await params;

  const iterenaryData = await getSingleItinerary(itinerary);

  if (!iterenaryData || iterenaryData.length === 0) {
    return {
      title: 'Itinerary Not Found',
    };
  }

  const { data } = iterenaryData;
  const { meta_title, meta_description, keywords } = data.seo || {};

  return {
    title: meta_title || data.name || 'Default Title',
    description: meta_description || 'Default description for itinerary page',
    keywords: keywords || undefined,
  };
}

export default async function IterenaryPage({ params }) {
  const { itinerary } = await params;

  const iterenaryData = await getSingleItinerary(itinerary);

  if (iterenaryData.length === 0) {
    notFound();
  }

  const { data, id } = iterenaryData;
  const { name, seo, media_gallery = [], review_summary } = data;

  let schemaJson = {};
  try {
    schemaJson = seo?.schema_data ? JSON.parse(seo.schema_data) : {};
  } catch (error) {
    console.error('Invalid JSON schema_data:', error);
  }

  return (
    <>
      <BannerSection activityName={name} media_gallery={media_gallery} reviewSummary={review_summary} />
      <SingleProductTabSection
        productType="itinerary"
        productId={id}
        productData={data}
      />

      {schemaJson && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }} />}
    </>
  );
}
```

- [ ] **Step 2: Verify build passes**

```bash
cd /home/khawla/Documents/weelp/frontend && npx next build 2>&1 | tail -20
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(frontend\)/itinerary/\[itinerary\]/page.js
git commit -m "refactor: update itinerary page to use SingleProductTabSection"
```

---

### Task 8: Update Package Page to Use `SingleProductTabSection`

**Files:**
- Modify: `src/app/(frontend)/package/[package]/page.js`

- [ ] **Step 1: Replace `TabSectionPackage` with `SingleProductTabSection`**

Replace the entire contents of `src/app/(frontend)/package/[package]/page.js` with:

```jsx
import dynamic from 'next/dynamic';
import BannerSection from '@/app/components/Pages/FRONT_END/singleproduct/BannerSection';
import { notFound } from 'next/navigation';
import { getSinglePackage } from '@/lib/services/package';
import { isEmpty } from 'lodash';

const SingleProductTabSection = dynamic(() => import('@/app/components/Pages/FRONT_END/singleproduct/SingleProductTabSection'));

export async function generateMetadata({ params }) {
  const { package: pack } = await params;
  const { data: packageData = [] } = await getSinglePackage(pack);

  if (!isEmpty(packageData)) {
    const { name, description } = packageData;

    return {
      title: name,
      description,
    };
  }
}

export default async function PackagePage({ params }) {
  const { package: pack } = await params;
  const { data: packageData = [] } = await getSinglePackage(pack);

  if (!packageData || packageData.length === 0) {
    notFound();
  }

  const { id, name, media_gallery = [], review_summary } = packageData;

  return (
    <>
      <BannerSection activityName={name} media_gallery={media_gallery} reviewSummary={review_summary} />
      <SingleProductTabSection
        productType="package"
        productId={id}
        productData={packageData}
      />
    </>
  );
}
```

- [ ] **Step 2: Verify build passes**

```bash
cd /home/khawla/Documents/weelp/frontend && npx next build 2>&1 | tail -20
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(frontend\)/package/\[package\]/page.js
git commit -m "refactor: update package page to use SingleProductTabSection"
```

---

### Task 9: Update Cities Itinerary Page

**Files:**
- Modify: `src/app/(frontend)/cities/[city]/itineraries/[itinerary]/page.js`

- [ ] **Step 1: Replace `TabSectionIterenary` with `SingleProductTabSection`**

Replace the entire contents of `src/app/(frontend)/cities/[city]/itineraries/[itinerary]/page.js` with:

```jsx
/** This File Will Handle Itinerary Page under City context */
import dynamic from 'next/dynamic';
import BannerSection from '@/app/components/Pages/FRONT_END/singleproduct/BannerSection';
import { notFound } from 'next/navigation';
import { getSingleItinerary } from '@/lib/services/itineraries';

const SingleProductTabSection = dynamic(() => import('@/app/components/Pages/FRONT_END/singleproduct/SingleProductTabSection'));

export async function generateMetadata({ params }) {
  const { itinerary } = await params;

  const iterenaryData = await getSingleItinerary(itinerary);

  if (!iterenaryData || iterenaryData.length === 0) {
    return {
      title: 'Itinerary Not Found',
    };
  }

  const { data } = iterenaryData;
  const { meta_title, meta_description, keywords } = data.seo || {};

  return {
    title: meta_title || data.name || 'Default Title',
    description: meta_description || 'Default description for itinerary page',
    keywords: keywords || undefined,
  };
}

export default async function IterenaryPage({ params }) {
  const { itinerary } = await params;

  const iterenaryData = await getSingleItinerary(itinerary);

  if (iterenaryData.length === 0) {
    notFound();
  }

  const { data, id } = iterenaryData;
  const { name, seo, media_gallery = [], review_summary } = data;

  let schemaJson = {};
  try {
    schemaJson = seo?.schema_data ? JSON.parse(seo.schema_data) : {};
  } catch (error) {
    console.error('Invalid JSON schema_data:', error);
  }

  return (
    <>
      <BannerSection activityName={name} media_gallery={media_gallery} reviewSummary={review_summary} />
      <SingleProductTabSection
        productType="itinerary"
        productId={id}
        productData={data}
      />

      {schemaJson && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }} />}
    </>
  );
}
```

- [ ] **Step 2: Verify build passes**

```bash
cd /home/khawla/Documents/weelp/frontend && npx next build 2>&1 | tail -20
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(frontend\)/cities/\[city\]/itineraries/\[itinerary\]/page.js
git commit -m "refactor: update cities itinerary page to use SingleProductTabSection"
```

---

### Task 10: Clean Up Old Code

**Files:**
- Modify: `src/app/components/Pages/FRONT_END/singleproduct/TabSection.jsx` (clear file, add deprecation re-exports)
- Modify: `src/app/components/Pages/FRONT_END/singleproduct/TabSection__modules.jsx` (remove old sidebar/itinerary exports)
- Delete: `src/app/components/Form/SingleProductFormItinerary.jsx`
- Delete: `src/app/components/Form/SingleProductFormPackage.jsx`

- [ ] **Step 1: Replace `TabSection.jsx` with re-export for backward compatibility**

Replace the entire contents of `src/app/components/Pages/FRONT_END/singleproduct/TabSection.jsx` with:

```jsx
// DEPRECATED: These exports are kept for backward compatibility only.
// All pages should import SingleProductTabSection directly.
// This file can be deleted once all imports are updated.

export { default as SingleProductTabSection } from './SingleProductTabSection';
```

- [ ] **Step 2: Remove old exports from `TabSection__modules.jsx`**

In `src/app/components/Pages/FRONT_END/singleproduct/TabSection__modules.jsx`:

Remove these imports (lines 8-11):
```jsx
import SingleProductFormItinerary from '@/app/components/Form/SingleProductFormItinerary';
import SingleProductFormPackage from '@/app/components/Form/SingleProductFormPackage';
```

Remove these imports that are no longer needed by this file (line 7, 11-13):
```jsx
import SingleProductForm from '@/app/components/Form/SingleProductForm';
import { usePathname } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import useMiniCartStore from '@/lib/store/useMiniCartStore';
```

Remove these exports entirely (the complete functions):
- `ProductForm` (lines 132-253) — replaced by `ProductSidebar.jsx`
- `ItineraryPanel` (lines 260-282) — replaced by `ItineraryPanel.jsx`
- `ProductFormItinerary` (lines 285-305) — deleted
- `ProductFormPackage` (lines 308-328) — deleted
- `IterinaryPanelCard` (lines 331-410) — moved to `ItineraryPanel.jsx`

The file should only keep these exports:
- `OverViewPanel`
- `WhatIncludedPanel`
- `ReviewPanel`
- `FaqPanel` (+ `FaqAccordionItem` as local helper)

The cleaned file should look like:

```jsx
'use client';

import React, { useState } from 'react';
import { Check, X, ChevronRight } from 'lucide-react';
import { SingleProductReview } from './SingleProductReview';
import { activityHighlights, inclusionsList, activityFaqs } from '@/app/Data/SingleActivityData';
import BreakSection from '@/app/components/BreakSection';

// OverView Panel
export const OverViewPanel = ({ description }) => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-[28px] font-semibold text-[#273f4e] capitalize">Overview</h2>
      {description && <p className="text-base text-black leading-[1.5]">{description}</p>}
      <ul className="flex flex-col gap-3 mt-2">
        {activityHighlights.map((item, index) => (
          <li key={index} className="flex items-start gap-3 text-base text-black leading-[1.5]">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-black flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

// What's Included
export const WhatIncludedPanel = () => {
  const included = inclusionsList.filter((item) => item.included);
  const excluded = inclusionsList.filter((item) => !item.included);

  return (
    <div className="flex flex-col border-t border-[#d9d9d9]">
      <h2 className="text-[28px] font-semibold text-[#273f4e] capitalize pt-6">What&apos;s Included</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mt-4">
        <ul className="flex flex-col gap-4">
          {included.map((item, index) => (
            <li key={index} className="flex items-start gap-3 text-base text-black">
              <Check className="w-5 h-5 flex-shrink-0 mt-0.5" size={20} />
              {item.text}
            </li>
          ))}
        </ul>
        <ul className="flex flex-col gap-4">
          {excluded.map((item, index) => (
            <li key={index} className="flex items-start gap-3 text-base text-black">
              <X className="w-5 h-5 flex-shrink-0 mt-0.5" size={20} />
              {item.text}
            </li>
          ))}
        </ul>
      </div>
      <button className="text-left text-base text-black mt-4 hover:underline">See 14 More</button>
    </div>
  );
};

// Review Panel
export const ReviewPanel = ({ productData, activitySlug }) => {
  return (
    <div>
      <SingleProductReview productData={productData} activitySlug={activitySlug} />
    </div>
  );
};

// FAQ Panel
export const FaqPanel = ({ faqs = [] }) => {
  const faqData = faqs.length > 0 ? faqs : activityFaqs;

  return (
    <div className="flex flex-col border-t border-[#d9d9d9]">
      <h2 className="text-[28px] font-semibold text-[#273f4e] capitalize pt-6 mb-4">FAQs</h2>

      {/* Inclusion checklist repeated per design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-6">
        <ul className="flex flex-col gap-4">
          {inclusionsList
            .filter((i) => i.included)
            .map((item, index) => (
              <li key={index} className="flex items-start gap-3 text-base text-black">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" size={20} />
                {item.text}
              </li>
            ))}
        </ul>
        <ul className="flex flex-col gap-4">
          {inclusionsList
            .filter((i) => !i.included)
            .map((item, index) => (
              <li key={index} className="flex items-start gap-3 text-base text-black">
                <X className="w-5 h-5 flex-shrink-0 mt-0.5" size={20} />
                {item.text}
              </li>
            ))}
        </ul>
      </div>

      {/* Accordion FAQ items */}
      <div className="flex flex-col gap-3">
        {faqData.map((faq, index) => (
          <FaqAccordionItem key={index} question={faq.title} answer={faq.content} defaultOpen={index === 0} />
        ))}
      </div>
    </div>
  );
};

const FaqAccordionItem = ({ question, answer, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-[#e5e5e5] rounded-xl overflow-hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-5 text-left">
        <span className="text-base font-semibold text-[#0c2536]">{question}</span>
        <ChevronRight className={`transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-90' : ''}`} size={16} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="px-5 pb-5 text-sm text-black/80 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};
```

- [ ] **Step 3: Delete old form files**

```bash
cd /home/khawla/Documents/weelp/frontend
rm src/app/components/Form/SingleProductFormItinerary.jsx
rm src/app/components/Form/SingleProductFormPackage.jsx
```

- [ ] **Step 4: Check for any remaining imports of deleted files**

```bash
cd /home/khawla/Documents/weelp/frontend
grep -r "SingleProductFormItinerary\|SingleProductFormPackage\|TabSectionActivity\|TabSectionIterenary\|TabSectionPackage\|ProductFormItinerary\|ProductFormPackage" src/ --include="*.jsx" --include="*.js" -l
```

Expected: No results (or only `TabSection.jsx` which we already replaced). If any other files reference these, update them.

- [ ] **Step 5: Verify build passes**

```bash
cd /home/khawla/Documents/weelp/frontend && npx next build 2>&1 | tail -20
```

Expected: Build succeeds with no errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: clean up old tab section and form components

Remove TabSectionActivity, TabSectionIterenary, TabSectionPackage exports.
Remove ProductForm, ProductFormItinerary, ProductFormPackage from modules.
Delete SingleProductFormItinerary.jsx and SingleProductFormPackage.jsx.
All pages now use the unified SingleProductTabSection component."
```

---

### Task 11: Final Verification

**Files:** None (verification only)

- [ ] **Step 1: Run lint**

```bash
cd /home/khawla/Documents/weelp/frontend && npm run lint 2>&1 | tail -30
```

Expected: No new lint errors.

- [ ] **Step 2: Run type-check (if configured)**

```bash
cd /home/khawla/Documents/weelp/frontend && npm run type-check 2>&1 | tail -30
```

Expected: Passes or was not configured (check package.json for the script).

- [ ] **Step 3: Run tests**

```bash
cd /home/khawla/Documents/weelp/frontend && npm test 2>&1 | tail -20
```

Expected: All existing tests pass.

- [ ] **Step 4: Full build verification**

```bash
cd /home/khawla/Documents/weelp/frontend && npx next build 2>&1 | tail -30
```

Expected: Build succeeds with no errors or warnings related to the changed files.

- [ ] **Step 5: Visual check (dev server)**

```bash
cd /home/khawla/Documents/weelp/frontend && npm run dev
```

Open these pages and verify they render correctly with the modern activity design:
1. `http://localhost:3000/activity/[any-slug]` — should look identical to before
2. `http://localhost:3000/itinerary/[any-slug]` — should now match activity design with Itinerary tab
3. `http://localhost:3000/package/[any-slug]` — should now match activity design with Package tab

Check:
- Sticky tab bar works at correct offset (below header)
- Tab switching scrolls correctly
- Sidebar has gradient background and decorative bottom image
- Date pre-selection shows tomorrow in itinerary/package forms
- Date navigation buttons appear above schedule in itinerary/package Tab 1
