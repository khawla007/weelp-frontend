'use client';
import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import required modules
import { FreeMode, Navigation, Thumbs } from 'swiper/modules';
import { ProductGalleryAnimation } from '../Animation/ProductAnimation';

// Slider for City Page and
const GallerySlider = ({ data, classNames = '', navColor = '#fff', collapseHiddenThumbnails = false }) => {
  const [showGallery, setShowGallery] = useState(false); // toggle gallery visibility
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  // Handle Toggle Gallery visibility
  const toggleGallery = () => {
    setShowGallery(!showGallery);
  };

  const imageData = data || [];

  // check for having data
  if (imageData.length > 0) {
    return (
      <div className={`gallery_slider ${classNames}`}>
        {/* Main Slider */}
        <Swiper
          style={{
            '--swiper-navigation-color': navColor,
            '--swiper-pagination-color': navColor,
          }}
          loop={false}
          watchOverflow={true}
          spaceBetween={6} // Adjust the spacing between slides
          navigation={true}
          // thumbs={thumbsSwiper ? { swiper: thumbsSwiper } : undefined}
          // thumbs={{ swiper: thumbsSwiper }}
          watchSlidesProgress
          onSwiper={setThumbsSwiper}
          modules={[FreeMode, Navigation, Thumbs]}
          breakpoints={{
            450: {
              slidesPerView: 1,
            },
            640: {
              slidesPerView: 2,
            },
            1440: {
              slidesPerView: 3,
            },
          }}
          className="main-slider w-full relative has-[.swiper-slide-active]:odd:rounded-xl"
        >
          {imageData.map((val, index) => (
            <SwiperSlide key={index}>
              <img
                loading="lazy"
                src={val?.url || val?.image}
                alt={val?.alt_text || `Slide ${index + 1}`}
                className="max-w-full xs:max-w-80 w-full h-[240px] sm:h-[300px] md:h-[360px] lg:h-[400px] object-cover"
              />
            </SwiperSlide>
          ))}

          {/* Show Gallery Button */}
          <button
            className="md:block absolute bottom-4 right-4 text-[#435a67] text-sm font-medium z-10 capitalize bg-white py-3 px-6 rounded-lg active:bg-[#435a67] active:text-white gallery_slider_toggle_btn"
            onClick={toggleGallery}
          >
            View Gallery
          </button>
        </Swiper>

        {/* Thumbnail Slider */}
        <Swiper
          onSwiper={setThumbsSwiper}
          loop={false}
          watchOverflow={true}
          spaceBetween={7}
          slidesPerView={5}
          freeMode={true}
          watchSlidesProgress={true}
          modules={[FreeMode, Navigation, Thumbs]}
          className={`thumbnail-slider overflow-hidden transition-[max-height,margin-top,opacity] duration-500 ease-[var(--weelp-ease-out)] motion-reduce:transition-none ${showGallery ? 'mt-4 max-h-24 opacity-100' : collapseHiddenThumbnails ? 'mt-0 max-h-0 opacity-0 pointer-events-none' : 'mt-4 opacity-0'}`}
        >
          {imageData.map((val, index) => (
            <SwiperSlide key={index}>
              <img
                loading="lazy"
                src={val?.url || val?.image}
                alt={`Thumbnail ${index + 1}`}
                className="max-w-80 w-full max-h-[56px] h-14 sm:max-h-[70px] sm:h-20 object-cover rounded-md cursor-pointer"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    );
  }
};

export default GallerySlider;
