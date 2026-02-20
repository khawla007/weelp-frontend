import React from 'react';
import { Star } from 'lucide-react';

const TotalReviews = ({ title, rating, totalReviews }) => {
  return (
    <div className="flex flex-col gap-2">
      <h3 className={`text-lg sm:text-[28px] font-medium text-Nileblue capitalize`}>Reviews</h3>
      <div className="flex items-center gap-4">
        <h2 className="text-3xl text-Nileblue font-extrabold">{rating || '5.0'}</h2>

        <div className="flex">
          <Star className="fill-yellow-400 stroke-none" />
          <Star className="fill-yellow-400 stroke-none" />
          <Star className="fill-yellow-400 stroke-none" />
        </div>
      </div>
      <p className="lowercase mb-4">{totalReviews ? `${totalReviews} reviews` : '18,313 reviews'}</p>
    </div>
  );
};

export default TotalReviews;
