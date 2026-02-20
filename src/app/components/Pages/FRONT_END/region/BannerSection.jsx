'use client';
import React, { useEffect, useState } from 'react';
import BookingForm2 from '../../../Form/Form2';
const bannerImage2 = '/assets/images/CountryBanner2.png';
const bannerImage = '/assets/images/CountryBanner.jpeg';
import * as Icons from '../../../../../../public/assets/Icons/Icons';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { log } from '@/lib/utils';
import { fetchRegionDetails } from '@/lib/services/region';

// get region details
const BannerSection = () => {
  const { region } = useParams();
  const [regionDetails, setRegionDetails] = useState({});

  // fetch dynamic region
  useEffect(() => {
    const regionDetails = async () => {
      try {
        const data = await fetchRegionDetails(region);
        setRegionDetails(data);
      } catch (error) {
        console.log('Error fetching region details:', error);
        return [];
      }
    };

    if (region) regionDetails();
  }, [region]);

  // destructure data
  const { name, description } = regionDetails;

  // log(regionDetails);
  return (
    <section className="flex h-[60vh] page_country_banner" style={{ background: 'linear-gradient(to bottom, #FFFFFF, #EAF1EE)' }}>
      <div className="flex mx-auto w-full h-full items-center relative">
        <div className="flex flex-col flex-[1] p-6 lg:p-20 items-start  gap-4">
          <div className="xl:translate-x-20 flex flex-col gap-4 justify-start">
            <h1 className="text-2xl sm:text-5xl  font-semibold text-Nileblue capitalize">{name}</h1>
            <p className="text-grayDark text-lg mb-8 font-medium">{description}</p>
            {/* <BookingForm2 /> */}
          </div>
        </div>
        <Icons.Vector1 className={'hidden xl:block absolute left-[48%] z-10 '} />
        <Icons.Vector2 className={'w-48 absolute left-2 bottom-0 z-0 lg:block'} />
        <div className="hidden xl:flex flex-[1] h-full w-full  justify-start items-end bg-cover bg-no-repeat relative" style={{ backgroundImage: `url(${bannerImage})` }}>
          <div className="absolute left-[20%] top-[70%]">
            <p className="text-[#DFDFEB] text-lg w-3/5">This far flung region is made of icy blue waters and snow covered landscapes of incredible beauty.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerSection;
