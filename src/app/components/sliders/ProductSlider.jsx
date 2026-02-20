'use client';
import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { ProductCarouselAnimation } from '../Animation/ProductAnimation';
import { GlobalCard } from '../SingleProductCard'; // global card for items
import { useIsClient } from '@/hooks/useIsClient';

const ProductSlider = ({ data }) => {
  const isClient = useIsClient(); // intialize hydration
  const [productData, setProductData] = useState([]);

  useEffect(() => {
    setProductData(data); // get array data from Api
  }, [data]);

  if (isClient) {
    return (
      <div>
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
          {productData.map((product, index) => (
            <SwiperSlide key={index}>
              <GlobalCard
                productId={product?.id}
                productTitle={product?.name}
                productSlug={product?.slug}
                item_type={product?.item_type}
                productPrice={product?.pricing?.regular_price ?? product?.base_pricing?.variations[0]?.regular_price}
                currency={product?.pricing?.currency}
                productRating={product?.rating}
                productCity={String(product?.locations[0]?.city).toLowerCase()}
                productRegion={String(product?.locations[0]?.region).toLowerCase()}
                imgsrc={product?.media_gallery?.[0]?.url}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    );
  }
  return <ProductCarouselAnimation />;
};
export default ProductSlider;
