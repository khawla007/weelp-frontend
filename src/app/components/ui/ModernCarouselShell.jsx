'use client';

import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

export default function ModernCarouselShell({
  items = [],
  navigationPrefix,
  renderSlide,
  breakpoints,
  className = '',
  slideClassName = '',
}) {
  const swiperRef = useRef(null);

  if (!items.length) {
    return null;
  }

  return (
    <div className="modern-carousel-shell overflow-hidden py-4 -my-4 px-1 -mx-1">
      <Swiper
        modules={[Navigation]}
        onBeforeInit={(swiper) => {
          swiperRef.current = swiper;
          if (typeof swiper.params.navigation === 'object') {
            swiper.params.navigation.prevEl = `.${navigationPrefix}-prev`;
            swiper.params.navigation.nextEl = `.${navigationPrefix}-next`;
          }
        }}
        onInit={(swiper) => {
          swiper.navigation.init();
          swiper.navigation.update();
        }}
        watchOverflow={false}
        rewind={true}
        slidesPerView={1.08}
        spaceBetween={18}
        breakpoints={breakpoints}
        className={className}
      >
        {items.map((item, index) => (
          <SwiperSlide key={item.id || index} className={slideClassName}>
            {renderSlide(item, index)}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
