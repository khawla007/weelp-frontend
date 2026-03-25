'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { allReviewsData } from '@/app/Data/SingleActivityData';
import { getActivityReviews, getActivityFeaturedReviews } from '@/lib/services/reviews';
import useSWR from 'swr';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';

export const SingleProductReview = ({ productData, activitySlug }) => {
  const [activeFilter, setActiveFilter] = useState('all'); // all, photos
  const [sortOrder, setSortOrder] = useState('newest'); // newest, oldest
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const sortDropdownRef = useRef(null);
  const featuredSwiperRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
    };

    if (showSortDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSortDropdown]);

  // Fetch reviews from API
  const {
    data: reviewsData,
    error: reviewsError,
    isLoading: reviewsLoading,
  } = useSWR(activitySlug ? `/api/reviews/activity/${activitySlug}` : null, () => getActivityReviews(activitySlug, { sort: 'recent', per_page: 50 }), {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // Cache for 1 minute
  });

  // Fetch featured reviews
  const { data: featuredData } = useSWR(activitySlug ? `/api/reviews/activity/${activitySlug}/featured` : null, () => getActivityFeaturedReviews(activitySlug), {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  // Use review_summary from productData (from main activity API) or from reviews API
  const reviewSummary = productData?.review_summary || reviewsData?.summary || null;

  // Transform API reviews to match our component structure
  const transformReview = (review) => {
    // Handle user name - use name field or fallback to 'Anonymous'
    let userName = 'Anonymous';
    if (review.user) {
      userName = review.user.name || `User${review.user.id}`;
    }

    // Format date - API returns 'Y-m-d', convert to readable format
    let formattedDate = 'Recently';
    if (review.created_at) {
      try {
        const date = new Date(review.created_at);
        formattedDate = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      } catch (e) {
        formattedDate = review.created_at;
      }
    }

    // Extract all images from media_gallery
    const images = review.media_gallery && review.media_gallery.length > 0 ? review.media_gallery.map((m) => m.url) : [];

    return {
      userName,
      date: formattedDate,
      sortDate: review.created_at, // Keep original date for sorting
      rating: review.rating || 5,
      title: 'Great experience', // Default title since API doesn't have it
      comment: review.review_text || '',
      avatar: null, // Avatar not in current API response
      image: images.length > 0 ? images[0] : null, // Keep first image for backward compatibility
      images, // All images for slider
    };
  };

  // Use API reviews or fallback to static data
  const apiReviews = reviewsData?.data || [];
  const transformedReviews = apiReviews.length > 0 ? apiReviews.map(transformReview) : allReviewsData;

  // Featured reviews from API or filtered from all reviews
  const featuredReviewsData =
    featuredData?.data && featuredData.data.length > 0 ? featuredData.data.map(transformReview) : transformedReviews.filter((r) => r.images && r.images.length > 0).slice(0, 4);

  const allReviewsDataFinal = transformedReviews;

  // Get all reviews with photos
  const allReviewsWithPhotos = allReviewsDataFinal.filter((review) => review.images && review.images.length > 0);

  // Filter and sort reviews based on active filter and sort order
  const getFilteredReviews = () => {
    let filtered = allReviewsDataFinal;

    // Apply filter
    switch (activeFilter) {
      case 'photos':
        filtered = filtered.filter((review) => review.images && review.images.length > 0);
        break;
      default:
        // all reviews
        break;
    }

    // Apply sort
    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.sortDate || a.date);
      const dateB = new Date(b.sortDate || b.date);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return sorted;
  };

  const filteredReviews = getFilteredReviews();

  return (
    <div className="flex flex-col border-t border-[#d9d9d9]">
      {/* Reviews Header - Reviews heading with rating below */}
      <div className="pt-6 pb-2">
        <h2 className="text-[28px] font-semibold text-[#273f4e] capitalize">Reviews</h2>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[36px] font-extrabold text-[#273f4e] leading-none">{reviewSummary?.average_rating || '5.0'}</span>
          <div className="flex gap-[2px]">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Star key={i} className={i < Math.round(reviewSummary?.average_rating || 5) ? 'fill-[#fed141ff] stroke-none' : 'fill-gray-300 stroke-none'} size={24} />
              ))}
          </div>
        </div>
        <p className="text-sm text-[#5a5a5a] mt-1">{reviewSummary?.total_reviews || 0} reviews</p>
      </div>

      {/* Photo Gallery - Using Swiper like city page */}
      {allReviewsWithPhotos.length > 0 && (
        <div className="mt-10 relative">
          <Swiper
            modules={[Navigation]}
            spaceBetween={20}
            navigation={{
              prevEl: '.photo-prev',
              nextEl: '.photo-next',
            }}
            loop={allReviewsWithPhotos.length > 3}
            breakpoints={{
              450: {
                slidesPerView: 1,
                spaceBetween: 10,
              },
              640: {
                slidesPerView: 2,
              },
              768: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
            className="w-full"
          >
            {allReviewsWithPhotos.map((review, index) => (
              <SwiperSlide key={index}>
                <div className="h-[248px] rounded-xl overflow-hidden bg-gray-200 cursor-pointer hover:opacity-90 transition-opacity">
                  <img src={review.image} alt={`Review photo ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          {/* Navigation buttons - bottom right with 10px spacing */}
          {allReviewsWithPhotos.length > 2 && (
            <div className="absolute bottom-[10px] right-[10px] flex gap-3 z-10">
              <button
                className="photo-prev w-9 h-9 rounded-full flex items-center justify-center bg-white shadow-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous photo"
              >
                <ChevronLeft size={16} className="text-[#3c4257]" />
              </button>
              <button
                className="photo-next w-9 h-9 rounded-full flex items-center justify-center bg-white shadow-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Next photo"
              >
                <ChevronRight size={16} className="text-[#3c4257]" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Featured Reviews Slider - using Swiper like city page */}
      {featuredReviewsData.length > 0 && (
        <div className="mt-10">
          {/* Heading with navigation arrows on right side */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[28px] font-semibold text-[#273f4e]">Featured review</h3>
            {featuredReviewsData.length > 2 && (
              <div className="flex items-center gap-1">
                <button
                  className="featured-prev w-9 h-9 rounded-full flex items-center justify-center bg-white shadow-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Scroll featured reviews left"
                >
                  <ChevronLeft size={16} className="text-[#3c4257]" />
                </button>
                <button
                  className="featured-next w-9 h-9 rounded-full flex items-center justify-center bg-white shadow-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Scroll featured reviews right"
                >
                  <ChevronRight size={16} className="text-[#3c4257]" />
                </button>
              </div>
            )}
          </div>

          <Swiper
            modules={[Navigation]}
            spaceBetween={20}
            navigation={{
              prevEl: '.featured-prev',
              nextEl: '.featured-next',
            }}
            loop={featuredReviewsData.length > 2}
            ref={featuredSwiperRef}
            breakpoints={{
              450: {
                slidesPerView: 1,
                spaceBetween: 10,
              },
              640: {
                slidesPerView: 1.5,
              },
              768: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 2,
              },
            }}
            className="w-full p-[10px]"
            style={{
              display: 'flex',
              alignItems: 'stretch',
            }}
          >
            {featuredReviewsData.map((review, index) => (
              <SwiperSlide key={index} style={{ height: 'auto', display: 'flex' }}>
                <div className="bg-white p-8 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_30px_rgba(0,0,0,0.18)] transition-all duration-300 flex flex-col gap-[17px] w-full">
                  <h5 className="text-black font-medium text-base">{review.userName}</h5>
                  <div className="flex gap-[7px]">
                    {Array(review.rating)
                      .fill(0)
                      .map((_, i) => (
                        <Star key={i} className="fill-[#fed141ff] stroke-none" size={16} />
                      ))}
                  </div>
                  <p className="text-base text-black overflow-x-hidden">{review.comment}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* All Reviews */}
      <AllReviewsList
        filteredReviews={filteredReviews}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        showSortDropdown={showSortDropdown}
        setShowSortDropdown={setShowSortDropdown}
        sortDropdownRef={sortDropdownRef}
        onFilterChange={() => {
          // Reset slider state when filter changes (handled internally by AllReviewsList)
        }}
      />
    </div>
  );
};

const AllReviewsList = ({ filteredReviews, activeFilter, setActiveFilter, sortOrder, setSortOrder, showSortDropdown, setShowSortDropdown, sortDropdownRef, onFilterChange }) => {
  // Custom vertical slider state - groups of 3 reviews
  const REVIEWS_PER_GROUP = 3;
  const totalGroups = Math.ceil(filteredReviews.length / REVIEWS_PER_GROUP);
  const [currentGroup, setCurrentGroup] = useState(0);
  const sectionRef = useRef(null);

  // Get the 3 reviews for the current group
  const getCurrentReviews = () => {
    const start = currentGroup * REVIEWS_PER_GROUP;
    const end = start + REVIEWS_PER_GROUP;
    return filteredReviews.slice(start, end);
  };

  const scrollToSection = () => {
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePrevious = () => {
    setCurrentGroup((prev) => (prev === 0 ? totalGroups - 1 : prev - 1));
    scrollToSection();
  };

  const handleNext = () => {
    setCurrentGroup((prev) => (prev === totalGroups - 1 ? 0 : prev + 1));
    scrollToSection();
  };

  const handleDotClick = (groupIndex) => {
    setCurrentGroup(groupIndex);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentGroup(0); // Reset to first group when filter changes
    onFilterChange();
  };

  const handleSortChange = (order) => {
    setSortOrder(order);
    setShowSortDropdown(false);
    setCurrentGroup(0); // Reset to first group when sort changes
    onFilterChange();
  };

  return (
    <div ref={sectionRef} className="flex flex-col gap-4 mt-8">
      <h3 className="text-[28px] font-semibold text-[#273f4e] capitalize">All Reviews</h3>

      {/* Filter + Sort Row - Match pen design */}
      <div className="flex items-center justify-between px-0">
        <div className="flex gap-[22px]">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-[21px] py-[7px] rounded-[8px] text-sm font-medium ${activeFilter === 'all' ? 'bg-[#cfdbe3] text-[#435a67]' : 'bg-transparent text-[#435a67]'}`}
          >
            All
          </button>
          <button
            onClick={() => handleFilterChange('photos')}
            className={`px-[21px] py-[7px] rounded-[8px] text-sm font-medium ${activeFilter === 'photos' ? 'bg-[#cfdbe3] text-[#435a67]' : 'bg-transparent text-[#435a67]'}`}
          >
            With Photos Only
          </button>
          <span className="px-[21px] py-[7px] rounded-[8px] text-sm font-medium text-[#435a67]">Influencers</span>
        </div>

        {/* Sort Dropdown - Newest/Oldest */}
        <div className="relative" ref={sortDropdownRef}>
          <button
            onClick={() => setShowSortDropdown((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#435a67] border border-[#cccccc80] bg-white min-w-[141px]"
          >
            {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
            <ChevronDown size={16} className="text-[#435a67]" />
          </button>
          {showSortDropdown && (
            <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg border border-[#e5e5e5] py-1 min-w-[141px] z-20">
              <button onClick={() => handleSortChange('newest')} className={`w-full text-left px-4 py-2 text-sm ${sortOrder === 'newest' ? 'bg-gray-100 font-medium' : 'text-gray-700'}`}>
                Newest
              </button>
              <button onClick={() => handleSortChange('oldest')} className={`w-full text-left px-4 py-2 text-sm ${sortOrder === 'oldest' ? 'bg-gray-100 font-medium' : 'text-gray-700'}`}>
                Oldest
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Review Cards Slider - Custom Vertical Slider (3 cards stacked) */}
      <div className="mt-4">
        {/* Reviews Container - Fixed height for 3 cards */}
        <div className="flex flex-col gap-4 min-h-[600px]">
          {getCurrentReviews().map((review, index) => (
            <div key={index} className="p-6 bg-white rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.1)]">
              {/* First Row: Avatar + Name/Date */}
              <div className="flex items-center gap-3">
                {/* Left: Avatar */}
                <div className="w-[44px] h-[44px] rounded-full overflow-hidden bg-[#f5f5f5] border border-[#e5e5e5] flex-shrink-0">
                  {review.avatar ? (
                    <img src={review.avatar} alt={review.userName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm font-bold text-[#3c4257]">{review.userName.charAt(0)}</div>
                  )}
                </div>

                {/* Right: 2 divs - Name above, Date below */}
                <div className="flex flex-col justify-center">
                  <p className="text-base font-semibold text-[#000000]">{review.userName}</p>
                  <p className="text-sm font-semibold text-[#000000]">{review.date}</p>
                </div>
              </div>

              {/* Stars - increased spacing */}
              <div className="flex gap-[7px] mt-4">
                {Array(review.rating)
                  .fill(0)
                  .map((_, i) => (
                    <Star key={i} className="fill-[#fed141ff] stroke-none" size={16} />
                  ))}
              </div>

              {/* Review Images - Single image or Slider - increased spacing */}
              {review.images &&
                review.images.length > 0 &&
                (review.images.length > 1 ? (
                  <div className="relative w-full mt-4">
                    <Swiper
                      key={`review-slider-${index}`}
                      modules={[Navigation]}
                      spaceBetween={12}
                      navigation={{
                        prevEl: `.review-img-prev-${index}`,
                        nextEl: `.review-img-next-${index}`,
                      }}
                      loop={review.images.length > 1}
                      slidesPerView={1.2}
                      breakpoints={{
                        640: { slidesPerView: 2 },
                        768: { slidesPerView: 2.5 },
                        1024: { slidesPerView: 3 },
                      }}
                      className="w-full"
                    >
                      {review.images.map((img, imgIndex) => (
                        <SwiperSlide key={`${index}-${imgIndex}`}>
                          <div className="h-[280px] rounded-xl overflow-hidden bg-gray-200 cursor-pointer hover:opacity-90 transition-opacity">
                            <img src={img} alt={`Review ${imgIndex + 1}`} className="w-full h-full object-cover" />
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                    {review.images.length > 1 && (
                      <div className="absolute bottom-[10px] right-[10px] flex gap-3 z-10">
                        <button
                          className={`review-img-prev-${index} w-9 h-9 rounded-full flex items-center justify-center bg-white shadow-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                          aria-label="Previous image"
                        >
                          <ChevronLeft size={16} className="text-[#3c4257]" />
                        </button>
                        <button
                          className={`review-img-next-${index} w-9 h-9 rounded-full flex items-center justify-center bg-white shadow-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                          aria-label="Next image"
                        >
                          <ChevronRight size={16} className="text-[#3c4257]" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-[280px] rounded-xl overflow-hidden bg-gray-200 mt-4">
                    <img src={review.images[0]} alt="Review" className="w-full h-full object-cover" />
                  </div>
                ))}

              {/* Review Content - increased spacing */}
              <p className="text-base text-[#000000] leading-[1.5] my-6">{review.comment}</p>

              {/* Separator Line + Helpful Section - increased spacing */}
              <div className="border-t border-[#e3e3e3] pt-4 mt-6">
                <div className="flex items-center gap-2 py-2">
                  <button className="flex items-center gap-2 text-sm text-[#5a5a5a] hover:text-[#3c4257] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                    </svg>
                    Helpful
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation buttons - right side without dots */}
        {filteredReviews.length > 3 && (
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={handlePrevious}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-white shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
              aria-label="Previous reviews"
            >
              <ChevronLeft size={16} className="text-[#3c4257]" />
            </button>
            <button
              onClick={handleNext}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-white shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
              aria-label="Next reviews"
            >
              <ChevronRight size={16} className="text-[#3c4257]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
