import React from 'react';
import Link from 'next/link';
import { ArrowRight, BadgeCheck } from 'lucide-react';

const Testimonial = ({ username, email, title, imageSrc, date }) => {
  return (
    <div className="bg-white rounded-lg p-4 flex flex-col gap-4 flex-wrap  shadow-md h-full justify-evenly">
      {/* imagesrc ,username ,email*/}
      <div className="flex gap-4 items-center flex-wrap">
        <img src="/assets/testimonial.png" alt="testimonial" className="rounded-full w-16" />
        <div>
          <h3 className="text-black text-xl font-semibold flex items-center gap-2">
            Oguz <BadgeCheck className="text-white fill-sky-500 text-xl" />
          </h3>
          <span className="font-normal text-gray-500 ">@oguzyagizkara</span>
        </div>
        <button className="border text-sm p-2 px-6 rounded-3xl shadow-md w-fit text-gray-500 font-nomal">Top Tier Explorer</button>
      </div>
      {/* title */}
      <div>
        <h3 className="text-black text-xl mb-3">Best Way to explore goa is to go the offbeat places.</h3>
      </div>
      {/* date */}
      <div className="flex justify-between flex-wrap">
        <span className="text-gray-400 font-normal text-base uppercase">15 Oct, 1997</span>
        <Link href={'/'} className="text-secondaryDark text-base uppercase flex items-center gap-2">
          View <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};
export default Testimonial;
