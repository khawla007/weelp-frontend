import BreadCrumb from '@/app/components/BreadCrumb';
import GallerySlider from '@/app/components/sliders/GallerySlider';
import { CircleCheckBig, Clock4, MapPin, Star } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

const BannerSection = ({ activityName, media_gallery = [] }) => {
  return (
    <section className="flex items-center justify-center lg:h-full p-6 sm:p-0 sm:py-4 bg-[#FFFFFF] page_destination_banner ">
      <div className="container md:max-w-[80%] mx-auto">
        <div className="flex flex-col gap-2 mb-6 pb-4 border-b-[1px]">
          <BreadCrumb className={'mb-6 mt-4'} />

          <h1 className="text-Blueish font-semibold text-xl sm:text-4xl capitalize">{activityName ?? 'Melaka Wonderland Water Theme Park Ticket'}</h1>

          <ul className="flex flex-wrap gap-4 pb-4">
            <li className="flex items-center justify-center gap-2 pr-4 border-0 border-r-2 last:border-0">
              <ul className="flex">
                {Array(3)
                  .fill(0)
                  .map((val, index) => {
                    return (
                      <li key={index}>
                        <Star className="stroke-none fill-yellow-500" />
                      </li>
                    );
                  })}
              </ul>
              <span className="text-[#5A5A5A]  capitalize text-sm sm:text-base font-medium">3.4k reviews</span>
            </li>
            <li className="flex items-center text-secondaryDark px-4 gap-2 justify-center border-0 border-r-2 last:border-0">
              <CircleCheckBig size={20} /> <span className="text-[#5A5A5A]  capitalize text-sm sm:text-base font-medium">3M+ booked</span>
            </li>
            <li className="flex items-center text-secondaryDark px-4 gap-2 justify-center border-0 border-r-2 last:border-0">
              <MapPin size={20} /> <span className="text-[#5A5A5A]  capitalize text-sm sm:text-base font-medium border-b-[2px] border-inherit">melaka Wonderland</span>
            </li>
            <li className="flex items-center text-secondaryDark px-4 gap-2 justify-center border-0 border-r-2 last:border-0">
              <Clock4 size={20} /> <span className="text-[#5A5A5A]  capitalize text-sm sm:text-base font-medium">4 hours approx</span>
            </li>
          </ul>
        </div>

        {/* Gallery Slider displaying images */}
        {media_gallery?.length > 0 &&
          (media_gallery.length === 1 ? (
            <img
              src={media_gallery?.[0]?.url}
              alt={media_gallery?.[0]?.alt_text || `${activityName} Image`}
              width={500}
              height={200}
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover rounded-lg"
            />
          ) : (
            <GallerySlider data={media_gallery} />
          ))}
      </div>
    </section>
  );
};

export default BannerSection;
