'use client';

import { useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import Reveal from '@/app/components/ui/Reveal';
import '@/app/styles/swiper.css';

export default function CarouselShell({
  items = [],
  navigationPrefix,
  renderSlide,
  breakpoints,
  slidesPerView = 1.08,
  className = '',
  slideClassName = '',
  showMobilePagination = false,
  entrance,
  observeReveal = true,
}) {
  const swiperRef = useRef(null);
  const hasNavigation = Boolean(navigationPrefix);
  const usesIndexedEntrance = entrance === 'stagger-right' || entrance === 'editorial-right';
  const prevSelector = hasNavigation ? `.${navigationPrefix}-prev` : undefined;
  const nextSelector = hasNavigation ? `.${navigationPrefix}-next` : undefined;
  const navigationSelectors = hasNavigation ? { prevEl: prevSelector, nextEl: nextSelector } : undefined;

  const modules = [];
  if (hasNavigation) modules.push(Navigation);
  if (showMobilePagination) modules.push(Pagination);

  useEffect(() => {
    const swiper = swiperRef.current;

    if (!swiper?.navigation || !prevSelector || !nextSelector) return;

    const prevEl = document.querySelector(prevSelector);
    const nextEl = document.querySelector(nextSelector);

    if (!prevEl || !nextEl) return;

    swiper.params.navigation = {
      ...(swiper.params.navigation || {}),
      prevEl,
      nextEl,
    };

    swiper.navigation.destroy();
    swiper.navigation.init();
    swiper.navigation.update();
  }, [nextSelector, prevSelector]);

  if (!items.length) return null;

  const Root = observeReveal ? Reveal : 'div';
  const revealProps = observeReveal ? { initialHidden: true, variant: 'lift' } : {};

  return (
    <Root {...revealProps} data-carousel-entrance={usesIndexedEntrance ? entrance : undefined} className={`carousel-shell-wrapper ${showMobilePagination ? 'has-mobile-pagination' : ''}`}>
      <Swiper
        modules={modules}
        onBeforeInit={(swiper) => {
          swiperRef.current = swiper;
          if (navigationSelectors) {
            swiper.params.navigation = {
              ...(swiper.params.navigation || {}),
              ...navigationSelectors,
            };
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
        slidesPerView={slidesPerView}
        spaceBetween={18}
        breakpoints={breakpoints}
        navigation={navigationSelectors}
        pagination={showMobilePagination ? { clickable: true, dynamicBullets: true } : undefined}
        className={className}
      >
        {items.map((item, index) => (
          <SwiperSlide key={item.id || index} className={slideClassName} style={usesIndexedEntrance ? { '--weelp-carousel-reveal-index': Math.min(index, 4) } : undefined}>
            {renderSlide(item, index)}
          </SwiperSlide>
        ))}
      </Swiper>
    </Root>
  );
}
