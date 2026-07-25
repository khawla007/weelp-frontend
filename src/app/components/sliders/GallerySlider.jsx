'use client';

import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';

import MediaImage from '../MediaImage';
import GalleryLightbox from './GalleryLightbox';
import { normalizeGalleryMedia } from './galleryMedia';
import '@/app/styles/swiper.css';

const GallerySlider = ({ data, classNames = '', navColor = '#588f7a' }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const images = normalizeGalleryMedia(data);

  if (images.length === 0) return null;

  return (
    <div className={`gallery_slider select-none ${classNames}`}>
      <Swiper
        style={{
          '--swiper-navigation-color': navColor,
          '--swiper-pagination-color': navColor,
        }}
        loop={false}
        watchOverflow
        spaceBetween={6}
        navigation={images.length > 1}
        watchSlidesProgress
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        modules={[Navigation]}
        breakpoints={{
          450: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          1440: { slidesPerView: 3 },
        }}
        className="main-slider relative w-full has-[.swiper-slide-active]:odd:rounded-xl"
      >
        {images.map((image) => (
          <SwiperSlide key={image.src} className="group overflow-hidden">
            <MediaImage
              loading="lazy"
              src={image.src}
              alt={image.alt}
              width={960}
              height={640}
              sizes="(min-width: 1440px) 22vw, (min-width: 640px) 44vw, 100vw"
              className="h-[240px] w-full max-w-full object-cover transition-transform duration-500 ease-[var(--weelp-ease-out)] group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100 xs:max-w-80 sm:h-[280px] md:h-[280px] lg:h-[400px]"
            />
          </SwiperSlide>
        ))}

        {images.length > 1 ? <GalleryLightbox images={images} initialIndex={activeIndex} /> : null}
      </Swiper>
    </div>
  );
};

export default GallerySlider;
