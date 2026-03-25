'use client';

import React, { useState, useEffect, useRef } from 'react';
import throttle from 'lodash/throttle';
import { OverViewPanel, WhatIncludedPanel, ReviewPanel, FaqPanel, ProductForm, ItineraryPanel, ProductFormItinerary, ProductFormPackage } from './TabSection__modules';
import SimilarExperiences from './SimilarExperiences';

export const TabSectionActivity = ({ productId, productData, similarActivities = [], activitySlug }) => {
  const [activeTab, setActiveTab] = useState('tab_1');
  const sectionRefs = useRef({});
  const [fixedTab, setFixedTab] = useState(false);
  const tabBarHeight = 60;
  const HEADER_HEIGHT = 66; // Height of sticky header

  // Check if reviews exist — hide reviews tab and section if no reviews
  const hasReviews = productData?.review_summary?.total_reviews > 0;

  // Build tabs array - conditionally include Reviews
  const tabs = [{ id: 'tab_1', label: 'Overview' }, { id: 'tab_2', label: "What's Included" }, ...(hasReviews ? [{ id: 'tab_3', label: 'Reviews' }] : []), { id: 'tab_4', label: 'FAQs' }];

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
      const offsetTop = element.getBoundingClientRect().top + window.scrollY - tabBarHeight - 16;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full bg-white mt-[70px]">
      {/* Sticky Tab Bar */}
      <div className={`${fixedTab ? 'fixed' : 'relative'} z-[999] w-full bg-white shadow-[0_4px_8px_rgba(0,0,0,0.1)]`} style={fixedTab ? { top: `${HEADER_HEIGHT}px` } : undefined}>
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
            <div id="tab_1" ref={(el) => (sectionRefs.current['tab_1'] = el)} className="pt-[70px] lg:mb-[35px]">
              <OverViewPanel description={productData?.description} />
            </div>
            <div id="tab_2" ref={(el) => (sectionRefs.current['tab_2'] = el)} className="pt-[35px] lg:mb-[35px]">
              <WhatIncludedPanel />
            </div>
            {hasReviews && (
              <div id="tab_3" ref={(el) => (sectionRefs.current['tab_3'] = el)} className="pt-[35px] lg:mb-[35px]">
                <ReviewPanel productData={productData} activitySlug={activitySlug} />
              </div>
            )}
            <div id="tab_4" ref={(el) => (sectionRefs.current['tab_4'] = el)} className="pt-[35px] lg:mb-[35px]">
              <FaqPanel />
            </div>
            <div className="lg:mb-[70px]">
              <SimilarExperiences activities={similarActivities} />
            </div>
          </div>
        </div>

        {/* Right Column — Booking Sidebar */}
        <div className="w-full xl:w-[42%] relative" style={{ background: 'linear-gradient(180deg, #f5f9fa 0%, rgba(255, 255, 255, 0.4) 100%)' }}>
          {/* Bottom decorative image */}
          <div className="absolute bottom-0 left-0 w-full h-auto pointer-events-none">
            <img src="/assets/images/activity-sidebar-bottom.png" alt="" className="w-full h-auto object-cover" style={{ maxHeight: '150px' }} />
            {/* Blur overlay effect */}
            <div className="absolute bottom-0 left-0 w-full h-24 backdrop-blur-3xl opacity-70" />
          </div>
          <ProductForm productId={productId} productData={productData} />
        </div>
      </div>
    </section>
  );
};

// Separate for Iterinary Page
export const TabSectionIterenary = ({ productData }) => {
  const [activeTab, setActiveTab] = useState('tab_1');
  const sectionRefs = useRef({});
  const [fixedTab, setFixedTab] = useState(false);
  const tabBarHeight = 68;

  useEffect(() => {
    const checkScrollY = () => {
      if (window.scrollY > 700) {
        setFixedTab(true);
      } else {
        setFixedTab(false);
      }
    };

    // Use lodash's throttle to limit execution frequency
    const throttledCheckScrollY = throttle(checkScrollY, 100);

    window.addEventListener('scroll', throttledCheckScrollY);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveTab(entry.target.id); // Update active tab when section is in viewport
          }
        });
      },
      { threshold: 0.5 }, // Trigger when 50% of the section is in view
    );

    // Observe all sections
    Object.values(sectionRefs.current).forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      window.removeEventListener('scroll', throttledCheckScrollY, checkScrollY);
      observer.disconnect();
    }; // Cleanup on unmount
  }, []);

  const toggleTab = (tab) => {
    setActiveTab(tab);
    const element = sectionRefs.current[tab];
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.scrollY - tabBarHeight - 16; // Offset to account for the sticky tab bar and some margin
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full border-2 bg-mainBackground singleProduct_tabSection">
      {/* Sticky Tab Bar */}
      <div className={`${fixedTab ? 'fixed top-0 z-20' : ''} flex flex-col w-full  shadow-md bg-mainBackground`}>
        <ul className="flex items-center justify-center sm:gap-x-12 container mx-auto ">
          {[
            { id: 'tab_1', label: 'Itirenary' },
            { id: 'tab_2', label: "What's Included" },
            { id: 'tab_3', label: 'Reviews' },
            { id: 'tab_4', label: 'FAQs' },
          ].map((tab) => (
            <li
              key={tab.id}
              onClick={() => toggleTab(tab.id)}
              className={`${activeTab === tab.id ? 'font-semibold border-b-2 border-black ' : ''} sm:text-base text-black cursor-pointer p-2 py-4 sm:px-6 sm:py-6  capitalize`}
            >
              {tab.label}
            </li>
          ))}
        </ul>
      </div>

      {/* Content */}
      <div className={`flex flex-col  xl:flex-row justify-between pt-4   mx-auto`}>
        <div className={`w-full xl:w-3/5  flex ${fixedTab ? 'mt-12' : ''}`}>
          <div className={`flex flex-col gap-8 p-6 lg:p-12 max-w-fit w-full xl:w-4/5  ml-auto `}>
            {productData?.schedules.length > 0 && (
              <div id="tab_1" ref={(el) => (sectionRefs.current['tab_1'] = el)}>
                <ItineraryPanel schedules={productData?.schedules} />;
              </div>
            )}
            <div id="tab_2" ref={(el) => (sectionRefs.current['tab_2'] = el)}>
              <WhatIncludedPanel />
            </div>
            <div id="tab_3" ref={(el) => (sectionRefs.current['tab_3'] = el)}>
              <ReviewPanel />
            </div>
            <div id="tab_4" ref={(el) => (sectionRefs.current['tab_4'] = el)}>
              <FaqPanel />
            </div>
          </div>
        </div>

        {/* Cart Functionality */}
        <div className={`${fixedTab ? 'mt-12   ' : ''} relative h-auto bg-[#f4f5f7]  w-full xl:w-2/5`}>
          <ProductFormItinerary productData={productData} />
        </div>
      </div>
    </section>
  );
};

// Separate for Iterinary Page
export const TabSectionPackage = ({ productData }) => {
  const [activeTab, setActiveTab] = useState('tab_1');
  const sectionRefs = useRef({});
  const [fixedTab, setFixedTab] = useState(false);
  const tabBarHeight = 68;
  const faqs = productData?.faqs || []; // fallback to empty array if faqs is undefined

  useEffect(() => {
    const checkScrollY = () => {
      if (window.scrollY > 700) {
        setFixedTab(true);
      } else {
        setFixedTab(false);
      }
    };

    // Use lodash's throttle to limit execution frequency
    const throttledCheckScrollY = throttle(checkScrollY, 100);

    window.addEventListener('scroll', throttledCheckScrollY);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveTab(entry.target.id); // Update active tab when section is in viewport
          }
        });
      },
      { threshold: 0.5 }, // Trigger when 50% of the section is in view
    );

    // Observe all sections
    Object.values(sectionRefs.current).forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      window.removeEventListener('scroll', throttledCheckScrollY, checkScrollY);
      observer.disconnect();
    }; // Cleanup on unmount
  }, []);

  const toggleTab = (tab) => {
    setActiveTab(tab);
    const element = sectionRefs.current[tab];
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.scrollY - tabBarHeight - 16; // Offset to account for the sticky tab bar and some margin
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full border-2 bg-mainBackground singleProduct_tabSection">
      {/* Sticky Tab Bar */}
      <div className={`${fixedTab ? 'fixed top-0 z-20' : ''} flex flex-col w-full  shadow-md bg-mainBackground`}>
        <ul className="flex items-center justify-center sm:gap-x-12 container mx-auto ">
          {[
            { id: 'tab_1', label: 'Package' },
            { id: 'tab_2', label: "What's Included" },
            { id: 'tab_3', label: 'Reviews' },
            { id: 'tab_4', label: 'FAQs' },
          ].map((tab) => (
            <li
              key={tab.id}
              onClick={() => toggleTab(tab.id)}
              className={`${activeTab === tab.id ? 'font-semibold border-b-2 border-black ' : ''} sm:text-base text-black cursor-pointer p-2 py-4 sm:px-6 sm:py-6  capitalize`}
            >
              {tab.label}
            </li>
          ))}
        </ul>
      </div>

      {/* Content */}
      <div className={`flex flex-col  xl:flex-row justify-between pt-4   mx-auto`}>
        <div className={`w-full xl:w-3/5  flex ${fixedTab ? 'mt-12' : ''}`}>
          <div className={`flex flex-col gap-8 p-6 lg:p-12 max-w-fit w-full xl:w-4/5  ml-auto `}>
            {productData?.schedules.length > 0 && (
              <div id="tab_1" ref={(el) => (sectionRefs.current['tab_1'] = el)}>
                <ItineraryPanel schedules={productData?.schedules} />;
              </div>
            )}
            <div id="tab_2" ref={(el) => (sectionRefs.current['tab_2'] = el)}>
              <WhatIncludedPanel />
            </div>
            <div id="tab_3" ref={(el) => (sectionRefs.current['tab_3'] = el)}>
              <ReviewPanel />
            </div>
            <div id="tab_4" ref={(el) => (sectionRefs.current['tab_4'] = el)}>
              <FaqPanel faqs={faqs} />
            </div>
          </div>
        </div>

        {/* Cart Functionality */}
        <div className={`${fixedTab ? 'mt-12   ' : ''} relative h-auto bg-[#f4f5f7]  w-full xl:w-2/5`}>
          <ProductFormPackage productData={productData} />
        </div>
      </div>
    </section>
  );
};
