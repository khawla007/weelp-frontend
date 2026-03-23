'use client';

import React, { useState } from 'react';
import { Star, ListFilter } from 'lucide-react';
import { featuredReviews, allReviewsData } from '@/app/Data/SingleActivityData';

export const SingleProductReview = () => {
  return (
    <div className="flex flex-col border-t border-[#d9d9d9]">
      {/* Reviews heading */}
      <h2 className="text-[28px] font-semibold text-[#273f4e] capitalize pt-6">Reviews</h2>

      {/* Rating Summary */}
      <div className="flex items-center gap-3 mt-2">
        <span className="text-2xl font-bold text-[#d4a017]">5.0</span>
        <div className="flex">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Star key={i} className="fill-yellow-500 stroke-none" size={18} />
            ))}
        </div>
      </div>
      <p className="text-sm text-[#5a5a5a] mt-1">18,313 reviews</p>

      {/* Photo Strip */}
      <div className="flex gap-2 mt-4">
        {allReviewsData.slice(0, 3).map((review, i) => (
          <div key={i} className="w-[100px] h-[70px] rounded-lg overflow-hidden bg-gray-200">
            <img src={review.image || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200&h=140&fit=crop'} alt="Review" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      {/* Featured Reviews */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-[#5a5a5a] mb-3">Featured review</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {featuredReviews.map((review, index) => (
            <div key={index} className="flex flex-col gap-2 p-4 bg-white rounded-lg border border-[#e5e5e5]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">{review.userName.charAt(0)}</div>
                <span className="text-sm font-medium text-[#0c2536]">{review.userName}</span>
              </div>
              <p className="text-sm text-black leading-relaxed">{review.comment}</p>
              <span className="text-xs text-[#5a5a5a]">{review.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* All Reviews */}
      <AllReviewsList />
    </div>
  );
};

const AllReviewsList = () => {
  const [showSort, setShowSort] = useState(false);
  const filterTabs = ['Most Recent', 'All Languages'];

  return (
    <div className="flex flex-col gap-4 mt-8">
      <h3 className="text-[28px] font-semibold text-[#273f4e] capitalize">All Reviews</h3>

      {/* Filter + Sort Row */}
      <div className="flex items-center justify-between">
        <div className="hidden sm:flex gap-3">
          {filterTabs.map((tab, i) => (
            <button key={i} className={`px-4 py-2 rounded-lg text-sm border ${i === 0 ? 'bg-[#f2f2f2] border-[#e5e5e5] font-medium' : 'border-[#e5e5e5] text-[#5a5a5a]'}`}>
              {tab}
            </button>
          ))}
        </div>
        <div className="relative">
          <button onClick={() => setShowSort(!showSort)} className="flex items-center gap-2 text-[#5a5a5a] border border-[#e5e5e5] text-sm px-4 py-2 rounded-lg">
            Sort <ListFilter size={16} />
          </button>
        </div>
      </div>

      {/* Review Cards */}
      <div className="flex flex-col gap-6">
        {allReviewsData.map((review, index) => (
          <div key={index} className="flex flex-col gap-3">
            {/* User Info Row */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                {review.avatar ? (
                  <img src={review.avatar} alt={review.userName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-medium text-gray-600">{review.userName.charAt(0)}</div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-[#0c2536]">{review.userName}</p>
                <p className="text-xs text-[#5a5a5a]">{review.date}</p>
              </div>
            </div>

            {/* Stars */}
            <div className="flex">
              {Array(review.rating)
                .fill(0)
                .map((_, i) => (
                  <Star key={i} className="fill-yellow-500 stroke-none" size={14} />
                ))}
            </div>

            {/* Review Content */}
            <div className="flex gap-4">
              <div className="flex-1">
                <h4 className="font-semibold text-base text-[#0c2536] mb-1">{review.title}</h4>
                <p className="text-sm text-black/80 leading-relaxed">{review.comment}</p>
              </div>
              {review.image && (
                <div className="w-[120px] h-[90px] rounded-lg overflow-hidden flex-shrink-0">
                  <img src={review.image} alt="Review" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
