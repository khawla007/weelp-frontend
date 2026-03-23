import React from 'react';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Star } from 'lucide-react';

const Testimonial = ({ username, title, date, itemName, rating }) => {
  return (
    <div className="bg-white rounded-lg p-4 flex flex-col gap-4 flex-wrap shadow-md h-full justify-evenly">
      {/* username */}
      <div className="flex gap-4 items-center flex-wrap">
        <img src="/assets/testimonial.png" alt="testimonial" className="rounded-full w-16" />
        <div>
          <h3 className="text-black text-xl font-semibold flex items-center gap-2">
            {username || 'Anonymous'} <BadgeCheck className="text-white fill-sky-500 text-xl" />
          </h3>
          {itemName && <span className="font-normal text-gray-500">{itemName}</span>}
        </div>
        {rating && (
          <div className="flex gap-0.5 ml-auto">
            {Array.from({ length: rating }).map((_, i) => (
              <Star key={i} className="size-4 fill-yellow-400 stroke-none" />
            ))}
          </div>
        )}
      </div>
      {/* title / review text */}
      <div>
        <h3 className="text-black text-xl mb-3 line-clamp-3">{title || 'Great experience!'}</h3>
      </div>
      {/* date */}
      <div className="flex justify-between flex-wrap">
        <span className="text-gray-400 font-normal text-base uppercase">{date || ''}</span>
      </div>
    </div>
  );
};
export default Testimonial;
