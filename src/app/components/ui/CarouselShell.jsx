'use client';

import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
export default function CarouselShell({ items = [], navigationPrefix, renderSlide, breakpoints, className = '', slideClassName = '' }) {
  const swiperRef = useRef(null);
  const hasNavigation = Boolean(navigationPrefix);

  if (!items.length) {
    return null;
  }

  return (
    <div className="carousel-shell-wrapper">
      <Swiper
        modules={hasNavigation ? [Navigation] : []}
        onBeforeInit={(swiper) => {
          swiperRef.current = swiper;
          if (hasNavigation && typeof swiper.params.navigation === 'object') {
            swiper.params.navigation.prevEl = `.${navigationPrefix}-prev`;
            swiper.params.navigation.nextEl = `.${navigationPrefix}-next`;
          }
        }}
        onInit={(swiper) => {
          if (hasNavigation) {
            swiper.navigation.init();
            swiper.navigation.update();
          }
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
