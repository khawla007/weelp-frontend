'use client';
import React, { useState, useEffect } from 'react';
import { ReviewCard2 } from '@/app/components/ReviewCard';
import TotalReviews from '@/app/components/TotalReviews';
import { SingleProductPhotoGallery } from '@/app/components/SingleProductPhotoGallery';
import { allReviews } from '@/app/Data/ShopData';

export const SingleProductReview = () => {
  return (
    <div className="flex flex-col gap-4">
      <TotalReviews /> {/*Only Total Review Count */}
      <SingleProductPhotoGallery photos={allReviews?.at(0)?.galleryImages} /> {/* Display Only Gallery */}
      <SingleProductReviewSlider /> {/* Review Slider For Single Product */}
      <SingleProductAllReview />
    </div>
  );
};

// Only Use In Single Product

const SingleProductReviewSlider = () => {
  return (
    <div className="flex flex-col singleproduct_reviewslider">
      <h2 className={`text-lg sm:text-[28px] font-medium text-Nileblue capitalize `}>Featured Review</h2>
      <ReviewSlider />
    </div>
  );
};

// For Review Panel
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { SingleProductReviewCard } from '@/app/components/ReviewCard';
import { ReviewCardCarouselAnimation } from '@/app/components/Animation/ProductAnimation';
import 'swiper/css';
import 'swiper/css/navigation';

const ReviewSlider = () => {
  const [initialize, setInitialize] = useState(null);
  useEffect(() => {
    setInitialize(true);
  }, []);
  if (initialize) {
    return (
      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={20}
        navigation={true}
        loop={true}
        autoplay={{
          delay: 2000,
        }}
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
        }}
        className="w-full py-8 "
      >
        {[...Array(6)].map((_, index) => (
          <SwiperSlide key={index}>
            <SingleProductReviewCard title={'Markus_K'} rating={4} comment={'Very well and good organized trip to the Desert West Quads, Falcon Show, Camelriding and Delicious Barbecue.'} />
          </SwiperSlide>
        ))}
      </Swiper>
    );
  }
  return <ReviewCardCarouselAnimation />;
};

// Single Prouct Review
import TabButton from '@/app/components/TabButton';
import { ListFilter } from 'lucide-react';

const SingleProductAllReview = () => {
  const [showsort, setShowSort] = useState(null);
  const buttonItems = ['all reviews', 'influencer', 'with photos only'];

  // display sort
  const handleSort = () => {
    setShowSort(!showsort);
  };

  // handleSortValue
  const handleSortValue = (e) => {
    setShowSort(!showsort);
  };
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg sm:text-[28px] font-medium text-Nileblue capitalize mb-2">All Reviews</h3>
      <div className="flex flex-col gap-4">
        <div className="flex justify-end sm:justify-between">
          <ul className="hidden sm:flex gap-4 flex-wrap">
            {buttonItems.map((val, index) => {
              return <TabButton key={index} text={val} className={' border-none bg-inherit first:bg-graycolor'} />;
            })}
          </ul>

          <div className="relative">
            <button className="flex items-center gap-4 text-grayDark border text-base p-2 px-6  rounded-lg ret" onClick={handleSort}>
              Sort <ListFilter size={18} />
            </button>

            {showsort && (
              <div className="absolute z-10 right-0 mt-2">
                {/* <input type='hidden' value={sortData} /> */}
                <ul className=" border flex flex-col bg-white rounded-md text-sm">
                  <li className="cursor-pointer ease-in-out duration-200 p-4 capitalize hover:bg-[#f2f7f5] text-nowrap  text-grayDark" onClick={handleSortValue} value={'5'}>
                    Sort By Popularity
                  </li>
                  <li className="cursor-pointer ease-in-out duration-200 p-4 capitalize hover:bg-[#f2f7f5] text-nowrap  text-grayDark" onClick={handleSortValue} value={5}>
                    Sort By Rating: low to high
                  </li>
                  <li className="cursor-pointer ease-in-out duration-200 p-4 capitalize hover:bg-[#f2f7f5] text-nowrap  text-grayDark" onClick={handleSortValue} value={2}>
                    Sort By Rating : High to Low
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {allReviews &&
            allReviews.map((val, index) => {
              if (index > 1) {
                return null;
              }
              return (
                <ReviewCard2
                  key={index}
                  userImageSrc={val?.userImageSrc || null}
                  galleryImages={val?.galleryImages || null}
                  userName={val?.userName || null}
                  date={val?.date || null}
                  title={val?.title || null}
                  rating={val?.rating}
                  comment={val?.comment}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
};
