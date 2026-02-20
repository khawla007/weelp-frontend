'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const DestinationCard = ({ url, imgHeight, imgWidth, imgUrl, title, description }) => {
  const pathname = usePathname();

  return (
    <div className="relative w-full max-w-sm sm:w-fit mx-auto">
      <Link href={`/city/${url}`}>
        <Image
          src={imgUrl || '/assets/images/china.jpg'}
          alt="image"
          className={`object-cover w-full duration-1000 hover:scale-105 ${imgHeight ?? 'h-[360px]'} ${imgWidth ?? 'sm:w-[278px]'} rounded-lg`}
          width={imgWidth || 278} // Default width if imgWidth is undefined
          height={imgHeight || 360} // Default height if imgHeight is undefined
        />

        {/* Text Overlay */}
        <div className="absolute bottom-0 w-full p-6 rounded-b-lg">
          <h2 className="text-[24px] font-semibold text-white">{title}</h2>

          {description && <p className="text-[16px] font-medium text-white">{description}</p>}
        </div>
      </Link>
    </div>
  );
};
export default DestinationCard;

export const DestinationCard2 = ({ imgUrl, title, description }) => {
  return (
    <div className="relative w-full mx-auto">
      {/* Set relative position on the image container */}
      <Link href={'/'}>
        <img
          src="/assets/images/china.jpg"
          alt="China"
          className={`object-cover h-24 w-full max-w-full rounded-lg`} // Full width inside the container
        />

        {/* Text Overlay */}
        <div className="absolute bottom-0 w-full p-2 rounded-b-lg">
          <h2 className=" text-left text-base font-semibold text-white">3. China</h2>
          <p className=" text-left text-xs font-medium text-solitude">140 Activities</p>
        </div>
      </Link>
    </div>
  );
};
