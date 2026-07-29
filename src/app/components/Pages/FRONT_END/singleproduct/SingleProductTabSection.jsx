'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Image from 'next/image';
import throttle from 'lodash/throttle';
import { OverViewPanel, WhatIncludedPanel, ReviewPanel, FaqPanel, normalizeFaqItems, normalizeInclusionItems } from './TabSection__modules';
import SimilarExperiences from './SimilarExperiences';
import ProductSidebar from './ProductSidebar';
import ItineraryPanel from './ItineraryPanel';
import ItineraryEditActionBar from './ItineraryEditActionBar';
import Reveal from '@/app/components/ui/Reveal';

const HEADER_HEIGHT = 66;
const TAB_BAR_HEIGHT = 60;
const TAB_SCROLL_GAP = 16;
const TAB_SCROLL_CORRECTION_DELAYS = [800, 1600, 2400];
const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white';

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
  const scrollCorrectionTimers = useRef([]);
  const [fixedTab, setFixedTab] = useState(false);
  const [pinSettled, setPinSettled] = useState(false);

  const clearScrollCorrectionTimers = useCallback(() => {
    scrollCorrectionTimers.current.forEach((timer) => window.clearTimeout(timer));
    scrollCorrectionTimers.current = [];
  }, []);

  // Date state for itinerary/package
  const isActivityProduct = productType === 'activity';
  const usesDynamicInclusions = productType === 'activity' || productType === 'itinerary';
  const isScheduleType = productType === 'itinerary' || productType === 'package';
  const firstSectionSpacing = productType === 'itinerary' ? 'pt-8 md:pt-[70px]' : 'pt-[70px]';
  const scheduleCount = productData?.schedules?.length || 0;
  const inclusionItems = usesDynamicInclusions ? productData?.inclusions_exclusions || [] : undefined;
  const hasInclusionRows = usesDynamicInclusions ? normalizeInclusionItems(inclusionItems).length > 0 : true;

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
  const hasFaqs = normalizeFaqItems(faqs).length > 0;

  // Build tabs
  const tabs = useMemo(
    () => [
      { id: 'tab_1', label: TAB_1_LABELS[productType] },
      ...(hasInclusionRows ? [{ id: 'tab_2', label: "What's Included" }] : []),
      ...(hasReviews ? [{ id: 'tab_3', label: 'Reviews' }] : []),
      ...(hasFaqs ? [{ id: 'tab_4', label: 'FAQs' }] : []),
    ],
    [productType, hasInclusionRows, hasReviews, hasFaqs],
  );

  useEffect(() => {
    if (!tabs.some((tab) => tab.id === activeTab) && tabs[0]) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reconciles tab state when optional sections disappear after data changes
      setActiveTab(tabs[0].id);
    }
  }, [activeTab, tabs]);

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
  }, [tabs]);

  useEffect(() => {
    if (fixedTab) {
      const id = requestAnimationFrame(() => setPinSettled(true));
      return () => cancelAnimationFrame(id);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset paired pin-settle state on unpin; runs only when fixedTab transitions to false
    setPinSettled(false);
  }, [fixedTab]);

  useEffect(
    () => () => {
      clearScrollCorrectionTimers();
    },
    [clearScrollCorrectionTimers],
  );

  useEffect(() => {
    const cancelPendingCorrections = () => clearScrollCorrectionTimers();

    window.addEventListener('wheel', cancelPendingCorrections, { passive: true });
    window.addEventListener('touchstart', cancelPendingCorrections, { passive: true });
    window.addEventListener('keydown', cancelPendingCorrections);

    return () => {
      window.removeEventListener('wheel', cancelPendingCorrections);
      window.removeEventListener('touchstart', cancelPendingCorrections);
      window.removeEventListener('keydown', cancelPendingCorrections);
    };
  }, [clearScrollCorrectionTimers]);

  const toggleTab = (tab) => {
    setActiveTab(tab);
    clearScrollCorrectionTimers();
    const element = sectionRefs.current[tab];
    if (!element) return;
    const scrollTarget = tab === 'tab_1' && productType === 'itinerary' ? element : element.querySelector('h2, h3') || element;
    const getOffsetTop = () => scrollTarget.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT - TAB_BAR_HEIGHT - TAB_SCROLL_GAP;
    const offsetTop = getOffsetTop();
    const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: offsetTop, behavior: prefersReduced ? 'instant' : 'smooth' });
    const correctionDelays = prefersReduced ? [0] : TAB_SCROLL_CORRECTION_DELAYS;
    scrollCorrectionTimers.current = correctionDelays.map((delay) =>
      window.setTimeout(() => {
        const correctedOffsetTop = getOffsetTop();
        if (Math.abs(correctedOffsetTop - window.scrollY) > 2) {
          window.scrollTo({ top: correctedOffsetTop, behavior: prefersReduced ? 'instant' : 'smooth' });
        }
      }, delay),
    );
  };

  const bottomImage = sidebarBottomImage || SIDEBAR_IMAGES[productType];

  return (
    <section className="w-full bg-background">
      {/* Sticky Tab Bar */}
      <div
        className={`sticky z-[11] w-full bg-card border-b border-border transition-[opacity,transform,box-shadow] duration-200 ease-[var(--weelp-ease-out)] motion-reduce:transition-none ${
          fixedTab ? `shadow-[0_4px_12px_rgba(0,0,0,0.06)] dark:shadow-none ${pinSettled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}` : 'opacity-100 translate-y-0'
        }`}
        style={{ top: `${HEADER_HEIGHT}px` }}
      >
        <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-6 lg:gap-11 overflow-x-auto px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => toggleTab(tab.id)}
              aria-current={activeTab === tab.id ? 'true' : undefined}
              className={`weelp-single-product-tab relative shrink-0 px-4 sm:px-6 lg:px-8 py-4 text-sm cursor-pointer transition-colors rounded-sm ${FOCUS_RING} ${
                activeTab === tab.id ? 'font-semibold text-foreground' : 'font-normal text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
              <span
                className={`absolute bottom-0 left-0 w-full h-[2px] bg-weelp-sage-deep origin-left transition-transform duration-[180ms] ease-[var(--weelp-ease-out)] motion-reduce:transition-none ${
                  activeTab === tab.id ? 'scale-x-100' : 'scale-x-0'
                }`}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Two-Column Content */}
      <div className="max-w-pen mx-auto px-4">
        <div className="flex flex-col xl:flex-row">
          {/* Left Column — Content */}
          <div className="w-full xl:w-[58%]">
            <div className="xl:pr-[15px]">
              {/* Tab 1: varies by productType */}
              <Reveal variant="lift">
                <div id="tab_1" ref={(el) => (sectionRefs.current['tab_1'] = el)} className={`${firstSectionSpacing} lg:mb-[35px]`}>
                  {productType === 'activity' ? (
                    <OverViewPanel description={productData?.description} />
                  ) : (
                    productData?.schedules?.length > 0 && (
                      <ItineraryPanel schedules={productData.schedules} startDate={selectedStartDate} title={TAB_1_LABELS[productType]} session={session} itinerary={itinerary} readOnly={readOnly} />
                    )
                  )}
                </div>
              </Reveal>

              {/* Tab 2: What's Included */}
              {hasInclusionRows && (
                <Reveal variant="lift">
                  <div id="tab_2" ref={(el) => (sectionRefs.current['tab_2'] = el)} className="pt-[35px] lg:mb-[35px]">
                    <WhatIncludedPanel items={inclusionItems} useStaticFallback={!usesDynamicInclusions} />
                  </div>
                </Reveal>
              )}

              {/* Tab 3: Reviews (conditional) */}
              {hasReviews && (
                <Reveal variant="lift">
                  <div id="tab_3" ref={(el) => (sectionRefs.current['tab_3'] = el)} className="pt-[35px] lg:mb-[35px]">
                    <ReviewPanel productData={productData} productType={productType} activitySlug={activitySlug} itinerarySlug={itinerarySlug} />
                  </div>
                </Reveal>
              )}

              {/* Tab 4: FAQs */}
              {hasFaqs ? (
                <Reveal variant="lift">
                  <div id="tab_4" ref={(el) => (sectionRefs.current['tab_4'] = el)} className="pt-[35px] lg:mb-[35px]">
                    <FaqPanel faqs={faqs} />
                  </div>
                </Reveal>
              ) : null}

              {/* Similar Experiences */}
              <Reveal variant="lift" className="hidden md:block lg:mb-[70px]">
                <SimilarExperiences activities={similarActivities} />
              </Reveal>
            </div>
          </div>

          {/* Right Column — Booking Sidebar */}
          <Reveal variant="lift" delay={120} className="relative w-full bg-surface-tint xl:w-[42%] xl:self-start">
            {/* Bottom decorative image */}
            <div className="absolute bottom-0 left-0 z-0 w-full pointer-events-none overflow-hidden" style={{ maxHeight: '150px' }} aria-hidden="true">
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
              mobileSimilarActivities={similarActivities}
            />
          </Reveal>
        </div>
      </div>

      {/* Edit Action Bar for logged-in users on itinerary pages */}
      {productType === 'itinerary' && !readOnly && <ItineraryEditActionBar session={session} />}
    </section>
  );
};

export default SingleProductTabSection;
