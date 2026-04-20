'use client';
import React, { useEffect, useState } from 'react';
const bannerImage = '/assets/images/CountryBanner.webp';
import * as Icons from '../../../../../../public/assets/Icons/Icons';
import { useParams } from 'next/navigation';
import { fetchRegionDetails } from '@/lib/services/region';

const BannerSection = () => {
  const { region } = useParams();
  const [regionDetails, setRegionDetails] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchRegionDetails(region);
        setRegionDetails(data);
      } catch (error) {
        console.log('Error fetching region details:', error);
      }
    };

    if (region) load();
  }, [region]);

  const { name, description } = regionDetails;

  return (
    <section
      className="relative flex min-h-[420px] sm:min-h-[480px] md:min-h-[520px] lg:min-h-[60vh] page_country_banner"
      style={{ background: 'linear-gradient(to bottom, #FFFFFF, #EAF1EE)' }}
    >
      <div className="relative mx-auto flex h-full w-full items-center">
        <div className="flex flex-[1] flex-col items-start gap-4 p-5 sm:p-8 md:p-12 lg:p-20">
          <div className="flex flex-col justify-start gap-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold capitalize text-Nileblue">{name}</h1>
            <p className="mb-4 text-base sm:text-lg font-medium text-grayDark">{description}</p>
          </div>
        </div>
        <Icons.Vector1 className="absolute left-[48%] z-10 hidden xl:block" />
        <Icons.Vector2 className="absolute bottom-0 left-2 z-0 w-32 sm:w-40 lg:w-48" />
        <div
          className="relative hidden h-full w-full flex-[1] items-end justify-start bg-cover bg-no-repeat lg:flex"
          style={{ backgroundImage: `url(${bannerImage})` }}
        >
          <div className="absolute left-[20%] top-[70%]">
            <p className="w-3/5 text-lg text-[#DFDFEB]">
              This far flung region is made of icy blue waters and snow covered landscapes of incredible beauty.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerSection;
