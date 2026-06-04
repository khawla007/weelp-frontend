'use client';

import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import Reveal from '@/app/components/ui/Reveal';

export default function CarouselShell({ items = [], navigationPrefix, renderSlide, breakpoints, className = '', slideClassName = '', showMobilePagination = false }) {
  const swiperRef = useRef(null);
  const hasNavigation = Boolean(navigationPrefix);

  const modules = [];
  if (hasNavigation) modules.push(Navigation);
  if (showMobilePagination) modules.push(Pagination);

  if (!items.length) return null;

  return (
    <Reveal initialHidden variant="lift" className={`carousel-shell-wrapper ${showMobilePagination ? 'has-mobile-pagination' : ''}`}>
      <Swiper
        modules={modules}
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
        watchOverflow={true}
        rewind={false}
        slidesPerView={1.08}
        spaceBetween={18}
        breakpoints={breakpoints}
        pagination={showMobilePagination ? { clickable: true, dynamicBullets: true } : undefined}
        className={className}
      >
        {items.map((item, index) => (
          <SwiperSlide key={item.id || index} className={slideClassName}>
            {renderSlide(item, index)}
          </SwiperSlide>
        ))}
      </Swiper>
    </Reveal>
  );
}
