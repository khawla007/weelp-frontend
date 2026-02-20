'use client';
import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

// Import required modules
import { FreeMode, Navigation, Thumbs } from 'swiper/modules';
import { ProductGalleryAnimation } from '../Animation/ProductAnimation';

// Slider for City Page and
const GallerySlider = ({ data, classNames = '' }) => {
  const [showGallery, setShowGallery] = useState(false); // toggle gallery visibility
  const [imageData, setImageData] = useState([]);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  // Handle Toggle Gallery visibility
  const toggleGallery = () => {
    setShowGallery(!showGallery);
  };

  useEffect(() => {
    if (data) {
      setImageData(data);
    }
  }, [data]);

  // check for having data
  if (imageData.length > 0) {
    return (
      <div className={`gallery_slider ${classNames}`}>
        {/* Main Slider */}
        <Swiper
          style={{
            '--swiper-navigation-color': '#fff',
            '--swiper-pagination-color': '#fff',
          }}
          loop={true}
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
              <img loading="lazy" src={val?.url || val?.image} alt={val?.alt_text || `Slide ${index + 1}`} className="max-w-full xs:max-w-80 w-full h-[400px] object-cover" />
            </SwiperSlide>
          ))}

          {/* Show Gallery Button */}
          <button
            className="sm:block absolute bottom-4 right-4 text-grayDark text-sm font-medium z-10 capitalize bg-white py-3 px-6 rounded-lg active:bg-grayDark active:text-white gallery_slider_toggle_btn"
            onClick={toggleGallery}
          >
            View Gallery
          </button>
        </Swiper>

        {/* Thumbnail Slider */}
        <Swiper
          onSwiper={setThumbsSwiper}
          loop={true}
          spaceBetween={7}
          slidesPerView={5}
          freeMode={true}
          watchSlidesProgress={true}
          modules={[FreeMode, Navigation, Thumbs]}
          className={`thumbnail-slider transition-all duration-500 ${showGallery ? 'opacity-100' : 'opacity-0 '} mt-4`}
        >
          {imageData.map((val, index) => (
            <SwiperSlide key={index}>
              <img loading="lazy" src={val?.url || val?.image} alt={`Thumbnail ${index + 1}`} className="max-w-80 w-full max-h-[70px] h-20 object-cover rounded-md cursor-pointer" />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    );
  }
};

export default GallerySlider;
