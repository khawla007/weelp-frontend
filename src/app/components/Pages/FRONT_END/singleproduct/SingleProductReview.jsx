'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { getActivityReviews, getActivityFeaturedReviews, getItineraryReviews, getItineraryFeaturedReviews } from '@/lib/services/reviews';
import useSWR from 'swr';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import SectionHeader from '@/app/components/ui/SectionHeader';
import { COMPACT_SLIDER_NAV_BUTTON_CLASS } from '@/app/components/ui/sliderNavigationClasses';
import '@/app/styles/swiper.css';

const REVIEW_FILTER_LOADING_MS = 350;
const REVIEW_FILTER_SCROLL_OFFSET = 140;

export const SingleProductReview = ({ productData, productType = 'activity', activitySlug, itinerarySlug }) => {
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

  const reviewSlug = productType === 'itinerary' ? itinerarySlug : activitySlug;
  const getReviews = productType === 'itinerary' ? getItineraryReviews : getActivityReviews;
  const getFeaturedReviews = productType === 'itinerary' ? getItineraryFeaturedReviews : getActivityFeaturedReviews;

  // Fetch reviews from API
  const { data: reviewsData } = useSWR(reviewSlug ? `/api/reviews/${productType}/${reviewSlug}` : null, () => getReviews(reviewSlug, { sort: 'recent', per_page: 50 }), {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // Cache for 1 minute
  });

  // Fetch featured reviews
  const { data: featuredData } = useSWR(reviewSlug ? `/api/reviews/${productType}/${reviewSlug}/featured` : null, () => getFeaturedReviews(reviewSlug), {
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
      isInfluencer: Boolean(review.is_influencer || review.is_influencer_review || review.user?.is_influencer || review.user?.is_creator),
    };
  };

  // Static sample reviews do not represent persisted review records.
  const apiReviews = reviewsData?.data || [];
  const transformedReviews = apiReviews.map(transformReview);

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
      case 'influencers':
        filtered = filtered.filter((review) => review.isInfluencer);
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
  const averageRating = reviewSummary?.average_rating ?? 0;

  return (
    <div className="flex flex-col border-t border-border">
      {/* Reviews Header - Reviews heading with rating below */}
      <div className="pt-6 pb-2">
        <SectionHeader title="Reviews" />
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[38px] font-bold leading-none text-foreground">{averageRating}</span>
          <div className="flex gap-[2px]" role="img" aria-label={`${averageRating} out of 5 stars`}>
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Star key={i} className={i < Math.round(averageRating) ? 'fill-warning stroke-none' : 'fill-muted stroke-none'} size={24} aria-hidden="true" />
              ))}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{reviewSummary?.total_reviews || 0} reviews</p>
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
            loop={false}
            rewind={false}
            watchOverflow={true}
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
                <div className="h-[248px] rounded-xl overflow-hidden bg-muted cursor-pointer hover:opacity-90 transition-opacity">
                  <img src={review.image} alt={`Review photo ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          {/* Navigation buttons - bottom right with 10px spacing */}
          {allReviewsWithPhotos.length > 2 && (
            <div className="absolute bottom-[10px] right-[10px] flex gap-3 z-10">
              <button type="button" className={`photo-prev ${COMPACT_SLIDER_NAV_BUTTON_CLASS} disabled:cursor-not-allowed disabled:opacity-50`} aria-label="Previous review photo">
                <ChevronLeft size={16} />
              </button>
              <button type="button" className={`photo-next ${COMPACT_SLIDER_NAV_BUTTON_CLASS} disabled:cursor-not-allowed disabled:opacity-50`} aria-label="Next review photo">
                <ChevronRight size={16} />
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
            <h3 className="text-lg sm:text-[28px] text-foreground">Featured review</h3>
            {featuredReviewsData.length > 2 && (
              <div className="flex items-center gap-1">
                <button type="button" className={`featured-prev ${COMPACT_SLIDER_NAV_BUTTON_CLASS} disabled:cursor-not-allowed disabled:opacity-50`} aria-label="Previous featured review">
                  <ChevronLeft size={16} />
                </button>
                <button type="button" className={`featured-next ${COMPACT_SLIDER_NAV_BUTTON_CLASS} disabled:cursor-not-allowed disabled:opacity-50`} aria-label="Next featured review">
                  <ChevronRight size={16} />
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
            loop={false}
            rewind={false}
            watchOverflow={true}
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
                <div className="bg-background p-8 rounded-xl border border-border hover:border-transparent hover:shadow-[0_1px_2px_rgba(24,24,27,0.06),0_4px_12px_rgba(24,24,27,0.08)] dark:hover:shadow-none transition-[border-color,box-shadow] duration-300 ease-[var(--weelp-ease-out)] motion-reduce:transition-none flex flex-col gap-[17px] w-full">
                  <h5 className="text-foreground font-medium text-base">{review.userName}</h5>
                  <div className="flex gap-[7px]">
                    {Array(review.rating)
                      .fill(0)
                      .map((_, i) => (
                        <Star key={i} className="fill-warning stroke-none" size={16} />
                      ))}
                  </div>
                  <p className="text-base text-foreground overflow-x-hidden">{review.comment}</p>
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
  const [isReviewListLoading, setIsReviewListLoading] = useState(false);
  const sectionRef = useRef(null);
  const filterRowRef = useRef(null);
  const loadingTimerRef = useRef(null);
  const maxGroup = Math.max(totalGroups - 1, 0);
  const visibleGroup = Math.min(currentGroup, maxGroup);
  const isFirstGroup = visibleGroup === 0;
  const isLastGroup = visibleGroup >= maxGroup;

  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, []);

  // Get the 3 reviews for the current group
  const getCurrentReviews = () => {
    const start = visibleGroup * REVIEWS_PER_GROUP;
    const end = start + REVIEWS_PER_GROUP;
    return filteredReviews.slice(start, end);
  };

  const scrollToFilterControls = () => {
    if (!filterRowRef.current) {
      return;
    }

    const targetTop = filterRowRef.current.getBoundingClientRect().top + window.scrollY - REVIEW_FILTER_SCROLL_OFFSET;
    window.scrollTo({ top: Math.max(targetTop, 0), behavior: 'smooth' });
    filterRowRef.current.focus({ preventScroll: true });
  };

  const handlePrevious = () => {
    if (isFirstGroup) {
      return;
    }

    setCurrentGroup(visibleGroup - 1);
    scrollToFilterControls();
  };

  const handleNext = () => {
    if (isLastGroup) {
      return;
    }

    setCurrentGroup(visibleGroup + 1);
    scrollToFilterControls();
  };

  const showReviewListLoading = () => {
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
    }

    setIsReviewListLoading(true);
    loadingTimerRef.current = setTimeout(() => {
      setIsReviewListLoading(false);
      loadingTimerRef.current = null;
    }, REVIEW_FILTER_LOADING_MS);
  };

  const handleFilterChange = (filter) => {
    if (filter === activeFilter) {
      return;
    }

    showReviewListLoading();
    setActiveFilter(filter);
    setCurrentGroup(0); // Reset to first group when filter changes
    onFilterChange();
  };

  const handleSortChange = (order) => {
    if (order === sortOrder) {
      setShowSortDropdown(false);
      return;
    }

    showReviewListLoading();
    setSortOrder(order);
    setShowSortDropdown(false);
    setCurrentGroup(0); // Reset to first group when sort changes
    onFilterChange();
  };

  return (
    <div ref={sectionRef} className="flex flex-col gap-4 mt-8">
      <h3 className="text-lg sm:text-[28px] text-foreground capitalize">All Reviews</h3>

      {/* Filter + Sort Row - Match pen design */}
      <div ref={filterRowRef} tabIndex={-1} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-0 scroll-mt-24 focus:outline-none">
        <div className="flex flex-wrap gap-2 sm:gap-[22px]">
          <button
            type="button"
            onClick={() => handleFilterChange('all')}
            aria-pressed={activeFilter === 'all'}
            className={`px-[21px] py-[7px] rounded-[8px] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${activeFilter === 'all' ? 'bg-muted text-weelp-steel' : 'bg-transparent text-weelp-steel hover:bg-muted/70'}`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange('photos')}
            aria-pressed={activeFilter === 'photos'}
            className={`px-[21px] py-[7px] rounded-[8px] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${activeFilter === 'photos' ? 'bg-muted text-weelp-steel' : 'bg-transparent text-weelp-steel hover:bg-muted/70'}`}
          >
            With Photos Only
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange('influencers')}
            aria-pressed={activeFilter === 'influencers'}
            className={`px-[21px] py-[7px] rounded-[8px] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${activeFilter === 'influencers' ? 'bg-muted text-weelp-steel' : 'bg-transparent text-weelp-steel hover:bg-muted/70'}`}
          >
            Influencers
          </button>
        </div>

        {/* Sort Dropdown - Newest/Oldest */}
        <div className="relative" ref={sortDropdownRef}>
          <button
            type="button"
            onClick={() => setShowSortDropdown((prev) => !prev)}
            aria-expanded={showSortDropdown}
            aria-haspopup="true"
            className="flex w-full sm:w-auto items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium text-weelp-steel border border-border bg-background min-w-[141px]"
          >
            <span className="sr-only">Sort reviews by </span>
            {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
            <ChevronDown size={16} className="text-weelp-steel" />
          </button>
          {showSortDropdown && (
            <div className="absolute right-0 mt-2 bg-background rounded-lg shadow-lg dark:shadow-none border border-border py-1 min-w-[141px] z-20">
              <button type="button" onClick={() => handleSortChange('newest')} className={`w-full text-left px-4 py-2 text-sm ${sortOrder === 'newest' ? 'bg-muted font-medium' : 'text-copy'}`}>
                Newest
              </button>
              <button type="button" onClick={() => handleSortChange('oldest')} className={`w-full text-left px-4 py-2 text-sm ${sortOrder === 'oldest' ? 'bg-muted font-medium' : 'text-copy'}`}>
                Oldest
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Review Cards Slider - Custom Vertical Slider (3 cards stacked) */}
      <div className="mt-4" aria-busy={isReviewListLoading}>
        {/* Reviews Container - Fixed height for 3 cards */}
        <div className="flex flex-col gap-4 min-h-[600px]">
          {isReviewListLoading ? (
            <div className="flex flex-col gap-4" role="status" aria-label="Loading reviews">
              <span className="sr-only">Loading reviews</span>
              <ReviewListSkeleton />
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="rounded-xl border border-border bg-background p-6 text-sm text-muted-foreground">No reviews match this filter yet.</div>
          ) : (
            getCurrentReviews().map((review, index) => (
              <div key={index} className="p-6 bg-background rounded-xl border border-border">
                {/* First Row: Avatar + Name/Date */}
                <div className="flex items-center gap-3">
                  {/* Left: Avatar */}
                  <div className="w-[44px] h-[44px] rounded-full overflow-hidden bg-muted border border-border flex-shrink-0">
                    {review.avatar ? (
                      <img src={review.avatar} alt={review.userName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold text-copy">{review.userName.charAt(0)}</div>
                    )}
                  </div>

                  {/* Right: 2 divs - Name above, Date below */}
                  <div className="flex flex-col justify-center">
                    <p className="text-base font-semibold text-foreground">{review.userName}</p>
                    <p className="text-sm font-semibold text-foreground">{review.date}</p>
                  </div>
                </div>

                {/* Stars - increased spacing */}
                <div className="flex gap-[7px] mt-4">
                  {Array(review.rating)
                    .fill(0)
                    .map((_, i) => (
                      <Star key={i} className="fill-warning stroke-none" size={16} />
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
                        loop={false}
                        rewind={false}
                        watchOverflow={true}
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
                            <div className="h-[280px] rounded-xl overflow-hidden bg-muted cursor-pointer hover:opacity-90 transition-opacity">
                              <img src={img} alt={`Review ${imgIndex + 1}`} className="w-full h-full object-cover" />
                            </div>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                      {review.images.length > 1 && (
                        <div className="absolute bottom-[10px] right-[10px] flex gap-3 z-10">
                          <button
                            type="button"
                            className={`review-img-prev-${index} ${COMPACT_SLIDER_NAV_BUTTON_CLASS} disabled:cursor-not-allowed disabled:opacity-50`}
                            aria-label={`Previous image for ${review.userName}'s review`}
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <button
                            type="button"
                            className={`review-img-next-${index} ${COMPACT_SLIDER_NAV_BUTTON_CLASS} disabled:cursor-not-allowed disabled:opacity-50`}
                            aria-label={`Next image for ${review.userName}'s review`}
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-[280px] rounded-xl overflow-hidden bg-muted mt-4">
                      <img src={review.images[0]} alt="Review" className="w-full h-full object-cover" />
                    </div>
                  ))}

                {/* Review Content - increased spacing */}
                <p className="text-base text-foreground leading-[1.5] my-6">{review.comment}</p>

                {/* Separator Line + Helpful Section - increased spacing */}
                <div className="border-t border-border pt-4 mt-6">
                  <div className="flex items-center gap-2 py-2">
                    <button type="button" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-copy transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                      </svg>
                      Helpful
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Navigation buttons - right side without dots */}
        {!isReviewListLoading && filteredReviews.length > 3 && (
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={isFirstGroup}
              className={`${COMPACT_SLIDER_NAV_BUTTON_CLASS} disabled:cursor-not-allowed disabled:opacity-50`}
              aria-label="Previous review page"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={isLastGroup}
              className={`${COMPACT_SLIDER_NAV_BUTTON_CLASS} disabled:cursor-not-allowed disabled:opacity-50`}
              aria-label="Next review page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ReviewListSkeleton = () => {
  return Array.from({ length: 3 }).map((_, index) => (
    <div key={index} className="rounded-xl border border-border bg-background p-6" aria-hidden="true">
      <div className="animate-pulse">
        <div className="flex items-center gap-3">
          <div className="size-[44px] rounded-full bg-muted" />
          <div className="flex flex-col gap-2">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-3 w-20 rounded bg-muted" />
          </div>
        </div>
        <div className="mt-4 flex gap-[7px]">
          {Array.from({ length: 5 }).map((__, starIndex) => (
            <div key={starIndex} className="size-4 rounded-sm bg-muted" />
          ))}
        </div>
        <div className="mt-6 space-y-3">
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-11/12 rounded bg-muted" />
          <div className="h-4 w-8/12 rounded bg-muted" />
        </div>
        <div className="mt-6 border-t border-border pt-4">
          <div className="h-4 w-24 rounded bg-muted" />
        </div>
      </div>
    </div>
  ));
};
