import { Star } from 'lucide-react';
import React from 'react';

const MiniCartReviewCard = ({ imageSrc, productTitle, review, totalReview }) => {
  if (productTitle && imageSrc) {
    return (
      <div className="flex gap-6 items-center bg-white p-4 py-6 max-w-xs w-full rounded-xl">
        <div>
          <img src={imageSrc} alt="cartReviewimage" className="max-w-20 min-h-20 w-full h-[100%] object-cover rounded-md" />
        </div>
        <div>
          <h5 className="text-black font-bold text-base uppercase">4wd tours</h5>
          <div className="flex items-center gap-2">
            {review && (
              <ul className="flex">
                {Array.from({ length: review }).map((_, index) => (
                  <li key={index}>
                    {' '}
                    <Star size={16} className="fill-yellow-400 text-yellow-400" key={index} />
                  </li>
                ))}
              </ul>
            )}

            {totalReview && <span className="capitalize text-[#5a5a5a] text-xs">{`${totalReview} reviews`}</span>}
          </div>
        </div>
      </div>
    );
  }
};

export default MiniCartReviewCard;

export const MinicartReviewcontent = () => {
  return (
    <div className="py-4">
      <h3 className="text-2xl font-bold capitalize text-black">Are You Interested In ?</h3>
      <ul className="flex flex-nowrap gap-4 overflow-x-scroll cursor-pointer tfc_scroll py-4 w-full">
        {Array.from({ length: 3 }).map((_, index) => (
          <li key={index} className="min-w-80 w-full">
            <MiniCartReviewCard productTitle={'4WD TOURS'} imageSrc={'https://picsum.photos/300/200?random=4'} totalReview={'3.4k'} review={3} />
          </li>
        ))}
      </ul>
    </div>
  );
};
