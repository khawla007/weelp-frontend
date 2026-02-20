'use client';
import React, { useEffect, useState } from 'react';
import GallerySlider from '@/app/components/sliders/GallerySlider';
import { fakeData } from '@/app/Data/ShopData';
import * as Icons from '../../../../../../public/assets/Icons/Icons';
import BreadCrumb from '@/app/components/BreadCrumb';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { log } from '@/lib/utils';

// banner section city
const BannerSection = () => {
  const [initialize, setInitialize] = useState(false);
  const { city } = useParams();

  const [cityDetails, setcityDetails] = useState({});

  // fetch dynamic city
  useEffect(() => {
    const fetchcityDetails = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URLL}api/city/${city}/`);
        setcityDetails(response?.data);
      } catch (error) {
        console.log('Error fetching city details:', error);
        return [];
      }
    };

    if (city) fetchcityDetails();
    setInitialize(true);
  }, [city]);

  if (initialize) {
    // get details
    const { data = [] } = cityDetails;
    const { name, description } = data;
    return (
      <section className="flex lg:h-[60vh] py-12 relative page_city_banner" style={{ background: 'linear-gradient(to bottom, #FFFFFF, #EAF1EE)' }}>
        <div className="flex flex-col lg:flex-row container mx-auto gap-4 p-6">
          <div className="relative flex-1 w-full lg:w-1/3 py-4 ">
            <h2 className="text-2xl font-medium text-[#143042] mb-4 capitalize">Things to do In</h2>
            <h1 className="font-semibold text-5xl text-[#143042]  mb-4 capitalize">{name}</h1>
            <p className="font-medium text-lg text-grayDark text-wrap">{description}</p>

            <BreadCrumb className={'absolute xl:top-[70%] -top-4'} />
          </div>

          <div className="w-full lg:w-2/3">
            <GallerySlider data={fakeData} />
          </div>
        </div>

        <Icons.Vector2 className={'hidden lg:block absolute bottom-0 left-0 -translate-x-14 scale-125 rotate-45'} />
        <Icons.Vector2 className={'hidden lg:block absolute bottom-16 left-4 rotate-45 scale-[.2]'} />
      </section>
    );
  }
};

export default BannerSection;
