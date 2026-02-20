// Single Post Sliders -{Guide Card}
'use client';
import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import Singleproductguide from '../singleproductguide';
import { DestinationCarouselAnimation } from '../Animation/ProductAnimation';

const PostSlider = ({ data }) => {
  const [intialize, setInitialize] = useState('');
  useEffect(() => {
    setInitialize(true);
  }, []);

  if (intialize) {
    return (
      <div className="">
        <Swiper
          modules={[Navigation]}
          spaceBetween={20}
          navigation={true}
          loop={true}
          breakpoints={{
            450: {
              slidesPerView: 1,
              spaceBetween: 10,
            },
            640: {
              slidesPerView: 2,
              spaceBetween: 15,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 15,
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 20,
            },
          }}
          className=""
        >
          {data.map((val, index) => (
            <SwiperSlide key={index}>
              <Singleproductguide postTitle={val?.name} imageSrc={val?.image} subtitle={val?.description} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    );
  }
  return <DestinationCarouselAnimation />;
};

export default PostSlider;
