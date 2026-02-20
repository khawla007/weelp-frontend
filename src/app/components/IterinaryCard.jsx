import Link from 'next/link';
import React from 'react';
import Image from 'next/image';

const ItineraryCard = ({ productId, imgsrc, productTitle, category }) => {
  return (
    <div className={`${'product_' + productId} bg-white rounded-lg gap-3 shadow-md sm:max-w-fit max-w-full min-h-fit h-fit w-full sm:mx-0`}>
      <Link href={'/blogs/blog'}>
        <div className="relative w-full sm:w-[349px] h-72">
          <Image src={imgsrc || '/assets/Card.png'} alt="product image" fill className="rounded-t-lg object-cover" />
        </div>

        <div className="flex justify-between p-4">
          <div className="flex flex-col gap-[6px] justify-evenly py-1">
            <p className="text-[#506672] text-lg font-medium">{category ? category : 'Itinerary'}</p>
            <h3 className="text-black text-lg font-semibold">{productTitle || 'Evening Dessert - Premium'}</h3>
          </div>
          <div className="flex justify-between flex-wrap gap-2 items-end">
            <button className="w-fit h-fit border border-secondaryDark  text-secondaryDark font-semibold py-2 px-4 capitalize rounded-md">Explore</button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ItineraryCard;
