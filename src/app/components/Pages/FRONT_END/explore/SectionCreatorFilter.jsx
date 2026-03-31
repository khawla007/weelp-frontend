'use client';
import React, { useState } from 'react';
import { CreatorCard } from '@/app/components/CreatorCard';
import { fakeData } from '@/app/Data/ShopData';
import { Menu, ChevronDown } from 'lucide-react';

const NAV_TABS = ['Home', 'Explore', 'Create'];

const CreatorFilter = () => {
  const [visibleCount, setVisibleCount] = useState(15);
  const [activeTab, setActiveTab] = useState('Home');

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 15);
  };

  return (
    <section className="relative max-w-[95%] mx-auto">
      {/* Top Bar */}
      <div className="flex justify-between items-center flex-col sm:flex-row px-6">
        {/* Top Rated Button */}
        <div className="mt-4">
          <button className="flex items-center gap-2 bg-transparent border border-[#435a6742] rounded-[8px] px-4 py-2 text-[17px] font-medium text-[#435a67]">
            Top Rated
            <ChevronDown size={16} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-4">
          <ul className="flex items-center gap-[22px]">
            {NAV_TABS.map((tab) => (
              <li key={tab}>
                <button
                  onClick={() => setActiveTab(tab)}
                  className="text-[18px] font-medium"
                  style={{
                    color: '#435a67',
                    padding: activeTab === tab ? '7px 21px' : '7px 0',
                    backgroundColor: activeTab === tab ? '#cfdbe54d' : 'transparent',
                    borderRadius: activeTab === tab ? '8.5px' : '0',
                  }}
                >
                  {tab}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Filters Button */}
        <div className="mt-4">
          <button className="flex items-center justify-center gap-3 text-[17px] font-medium text-[#435a67] border border-[#435a6742] rounded-[7.86px] w-[114px] h-[38px]">
            Filters
            <Menu size={18} />
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="flex flex-col gap-4 py-6">
        <ul className="w-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {fakeData.slice(0, visibleCount).map((val) => (
            <li key={val.id}>
              <CreatorCard imagSrc={val?.image} title={val?.name} rating={val?.rating} />
            </li>
          ))}
        </ul>

        {/* View More Button */}
        {visibleCount < fakeData.length && (
          <div className="flex justify-center">
            <button
              onClick={handleShowMore}
              className="bg-secondaryDark hover:bg-[#ffffff] text-[#ffffff] hover:text-secondaryDark border border-secondaryDark text-base font-medium rounded-md w-fit py-2 px-6"
            >
              View More
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CreatorFilter;
