'use client';

// Destination Slider
import { useState, useEffect, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import DestinationCard from '../DestinationCard';
import { DestinationCarouselAnimation } from '../Animation/ProductAnimation';

const DestinationSlider = ({ data }) => {
  const [initialize, setInitialize] = useState(null);
  // const [postData, setPostData] = useState()

  const postData = useMemo(() => data || [], [data]);

  useEffect(() => {
    // setPostData(data)
    setInitialize(true);
  }, [data]);
  if (initialize) {
    return (
      <div>
        {/* <h2 className='text-[28px] font-medium text-Nileblue'>Top Activities</h2> */}
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
            1440: {
              slidesPerView: 5,
              spaceBetween: 20,
            },
          }}
          className=""
        >
          {postData &&
            postData.map((val, index) => (
              <SwiperSlide key={index}>
                <DestinationCard imgUrl={val?.image} url={val?.slug} title={val?.name} description={String(val?.description).slice(0, 25)} />
              </SwiperSlide>
            ))}
        </Swiper>
      </div>
    );
  }
  return <DestinationCarouselAnimation />;
};

export default DestinationSlider;
