'use client';
import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import required modules
import { FreeMode, Navigation, Thumbs } from 'swiper/modules';
import { ProductGalleryAnimation } from '../Animation/ProductAnimation';
import '@/app/styles/swiper.css';

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
            <SwiperSlide key={index} className="group overflow-hidden">
              <img
                loading="lazy"
                src={val?.url || val?.image}
                alt={val?.alt_text || `Slide ${index + 1}`}
                className="max-w-full xs:max-w-80 w-full h-[240px] sm:h-[280px] md:h-[280px] lg:h-[400px] object-cover transition-transform duration-500 ease-[var(--weelp-ease-out)] group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            </SwiperSlide>
          ))}

          {/* Show Gallery Button */}
          <button
            className="md:block absolute bottom-4 right-4 text-weelp-steel text-sm font-medium z-10 capitalize bg-background py-3 px-6 rounded-lg active:bg-weelp-steel active:text-white gallery_slider_toggle_btn"
            onClick={toggleGallery}
          >
            View Gallery
          </button>
        </Swiper>

        {/* Thumbnail Slider — grid-rows 0fr->1fr eases to the exact content
            height (no max-height overshoot), so the reveal has no early-stop jump. */}
        <div
          className={`thumbnail-gallery grid transition-[grid-template-rows,margin-top,opacity] duration-500 ease-[var(--weelp-ease-panel)] motion-reduce:transition-none ${showGallery ? 'mt-4 grid-rows-[1fr] opacity-100' : collapseHiddenThumbnails ? 'mt-0 grid-rows-[0fr] opacity-0 pointer-events-none' : 'mt-4 grid-rows-[1fr] opacity-0'}`}
        >
          <div className="min-h-0 overflow-hidden">
            <Swiper
              onSwiper={setThumbsSwiper}
              loop={false}
              watchOverflow={true}
              spaceBetween={8}
              slidesPerView={2.5}
              freeMode={true}
              watchSlidesProgress={true}
              modules={[FreeMode, Navigation, Thumbs]}
              breakpoints={{
                640: { slidesPerView: 3.5 },
                1024: { slidesPerView: 4.5 },
              }}
              className="thumbnail-slider"
            >
              {imageData.map((val, index) => (
                <SwiperSlide key={index}>
                  <img loading="lazy" src={val?.url || val?.image} alt={`Thumbnail ${index + 1}`} className="w-full h-16 sm:h-20 lg:h-24 object-cover object-center rounded-md cursor-pointer" />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    );
  }
};

export default GallerySlider;
