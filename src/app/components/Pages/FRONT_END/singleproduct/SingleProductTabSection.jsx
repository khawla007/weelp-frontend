'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import throttle from 'lodash/throttle';
import { OverViewPanel, WhatIncludedPanel, ReviewPanel, FaqPanel } from './TabSection__modules';
import SimilarExperiences from './SimilarExperiences';
import ProductSidebar from './ProductSidebar';
import ItineraryPanel from './ItineraryPanel';
import ItineraryEditActionBar from './ItineraryEditActionBar';

const HEADER_HEIGHT = 66;
const TAB_BAR_HEIGHT = 60;
const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#588f7a]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white';

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
  itinerarySlug,
  packageSlug,
  sidebarBottomImage,
  session = null,
  itinerary = null,
  readOnly = false,
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
  const tabs = useMemo(
    () => [{ id: 'tab_1', label: TAB_1_LABELS[productType] }, { id: 'tab_2', label: "What's Included" }, ...(hasReviews ? [{ id: 'tab_3', label: 'Reviews' }] : []), { id: 'tab_4', label: 'FAQs' }],
    [productType, hasReviews],
  );

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
        className={`${fixedTab ? 'fixed' : 'relative'} z-[11] w-full bg-white border-b border-[#e4e4e7] transition-[background-color,border-color,box-shadow,opacity,transform] duration-200 ease-[var(--weelp-ease-out)] motion-reduce:transition-none ${fixedTab ? 'shadow-[0_4px_12px_rgba(0,0,0,0.06)]' : ''}`}
        style={fixedTab ? { top: `${HEADER_HEIGHT}px` } : undefined}
      >
        <div className="flex items-center justify-center">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => toggleTab(tab.id)}
              aria-current={activeTab === tab.id ? 'true' : undefined}
              className={`relative px-6 lg:px-8 py-4 text-sm cursor-pointer transition-colors rounded-sm ${FOCUS_RING} ${
                activeTab === tab.id ? 'font-semibold text-[#18181b]' : 'font-normal text-[#71717a] hover:text-[#18181b]'
              }`}
              style={index < tabs.length - 1 ? { marginRight: '44px' } : undefined}
            >
              {tab.label}
              <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-[#588f7a] transition-opacity duration-200 ease-[var(--weelp-ease-out)] motion-reduce:transition-none ${activeTab === tab.id ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>

      {/* Two-Column Content */}
      <div className={`max-w-pen mx-auto px-4 ${fixedTab ? 'mt-[60px]' : ''}`}>
        <div className="flex flex-col xl:flex-row">
          {/* Left Column — Content */}
          <div className="w-full xl:w-[58%]">
            <div className="xl:pr-[15px]">
              {/* Tab 1: varies by productType */}
              <div id="tab_1" ref={(el) => (sectionRefs.current['tab_1'] = el)} className="pt-[70px] lg:mb-[35px]">
                {productType === 'activity' ? (
                  <OverViewPanel description={productData?.description} />
                ) : (
                  productData?.schedules?.length > 0 && (
                    <ItineraryPanel schedules={productData.schedules} startDate={selectedStartDate} title={TAB_1_LABELS[productType]} session={session} itinerary={itinerary} readOnly={readOnly} />
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
          <div className="w-full xl:w-[42%] relative bg-[#f8faf9]">
            {/* Bottom decorative image */}
            <div className="absolute bottom-0 left-0 w-full pointer-events-none overflow-hidden" style={{ maxHeight: '150px' }} aria-hidden="true">
              <Image src={bottomImage} alt="" width={640} height={150} sizes="(max-width: 1280px) 100vw, 640px" className="w-full h-auto object-cover opacity-70" />
            </div>
            <ProductSidebar
              productId={productId}
              productData={productData}
              productType={productType}
              itinerarySlug={itinerarySlug}
              packageSlug={packageSlug}
              defaultDateRange={defaultDateRange}
              onDateChange={isScheduleType ? handleDateChange : null}
              scheduleCount={isScheduleType ? scheduleCount : 0}
            />
          </div>
        </div>
      </div>

      {/* Edit Action Bar for logged-in users on itinerary pages */}
      {productType === 'itinerary' && !readOnly && <ItineraryEditActionBar session={session} />}
    </section>
  );
};

export default SingleProductTabSection;
