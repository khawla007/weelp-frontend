import React from 'react';
import { Star } from 'lucide-react';

const TotalReviews = ({ title, rating, totalReviews }) => {
  const numericRating = Number(rating) || 0;
  const roundedRating = Math.round(numericRating);
  const formattedRating = numericRating > 0 ? numericRating.toFixed(1) : '0.0';

  return (
    <div className="flex flex-col gap-2">
      <h3 className={`text-lg sm:text-[28px] font-medium text-foreground capitalize`}>{title || 'Reviews'}</h3>
      <div className="flex items-center gap-4">
        <h2 className="text-3xl text-foreground font-extrabold">{formattedRating}</h2>

        <div className="flex" role="img" aria-label={`${formattedRating} out of 5 stars`}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} className={index < roundedRating ? 'fill-yellow-400 stroke-none' : 'fill-muted stroke-none'} />
          ))}
        </div>
      </div>
      <p className="lowercase mb-4">{`${Number(totalReviews) || 0} reviews`}</p>
    </div>
  );
};

export default TotalReviews;
