'use client';
import React from 'react';
import { Star } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';

export const GlobalCard = ({ productId, item_type, productSlug, imgsrc, productRating, productTitle, productPrice, currency }) => {
  return (
    <div className={`${'product_' + productId} bg-white  rounded-lg p-4 gap-3 shadow-md sm:max-w-fit max-w-full min-h-[360px] h-fit w-full sm:mx-0`}>
      <Link href={`/${item_type}/${productSlug}`}>
        {' '}
        {/** this is static link */}
        <img src={imgsrc ?? '/assets/Card.png'} alt="productimage" className="rounded-lg w-full sm:w-72 h-52 object-cover " />
        <div className="flex flex-col gap-[6px] justify-evenly py-1">
          <div className="flex gap-1 text-secondaryDark text-sm pt-2">
            <Star className="fill-current" size={18} />
            {productRating || 4.5}
            <span className="text-[#5A5A5A]" dangerouslySetInnerHTML={{ __html: '(3.4K)' }} />
          </div>
          <h3 className="text-[#142A38] text-lg font-semibold">{productTitle || 'Evening Dessert - Premium'}</h3>
          <hr className=" border-t border-dashed border-gray-300 mb-3" />
          <div className="flex justify-between flex-wrap gap-2">
            <h5 className="flex flex-col  text-gray-500 font-semibold space-y-4">
              {/* For activity */}
              {item_type === 'activity' && (
                <>
                  <span className="font-normal text-xs">From</span>

                  {productPrice && currency ? (
                    <>{formatCurrency(parseInt(productPrice), currency)}</>
                  ) : (
                    <>
                      <span className="font-medium">{`$${productPrice}`}</span>
                    </>
                  )}
                </>
              )}

              {/* For package */}
              {item_type === 'package' && (
                <>
                  {productPrice && currency ? (
                    <>{formatCurrency(parseInt(productPrice), currency)}</>
                  ) : (
                    <>
                      <span className="font-normal">From</span>
                      {`$ ${productPrice}`}
                    </>
                  )}
                </>
              )}

              {/* For itinerary */}
              {item_type === 'itinerary' && (
                <>
                  <span className="font-normal">From</span>
                  {`$ ${productPrice}`}
                </>
              )}
            </h5>

            <button className="border border-dangerSecondary text-dangerSecondary bg-dangerLite font-semibold py-1 px-4 uppercase rounded-md text-xs">40% off</button>
          </div>
        </div>
      </Link>
    </div>
  );
};

const SingleProductCard = ({ productId, imgsrc, productRating, productTitle, productPrice, discount, productSlug, productRegion, productCity, featured_activity }) => {
  const params = useParams();
  const { region, city } = params;

  return (
    <div className={`${'product_' + productId} bg-white  rounded-lg p-4 gap-3 shadow-md sm:max-w-fit max-w-full min-h-[360px] h-fit w-full sm:mx-0`}>
      <Link href={`/activity/${productSlug}`}>
        {' '}
        {/** this is static link */}
        <img src={imgsrc || '/assets/Card.png'} alt="productimage" className="rounded-lg w-full sm:w-72 h-52 object-cover " />
        <div className="flex flex-col gap-[6px] justify-evenly py-1">
          <div className="flex gap-1 text-secondaryDark text-sm">
            <Star className="fill-current" size={18} />
            {productRating || 4.5}
            <span className="text-[#5A5A5A]" dangerouslySetInnerHTML={{ __html: '(3.4K)' }} />
          </div>
          <h3 className="text-black text-lg font-semibold">{productTitle || 'Evening Dessert - Premium'}</h3>
          <hr className=" border-t border-dashed border-gray-300 mb-1" />
          <div className="flex justify-between flex-wrap gap-2">
            <h5 className="flex flex-col  text-gray-500 font-semibold">
              {productPrice && (
                <>
                  <span className="font-normal">From</span>
                  {`$ ${productPrice}`}
                </>
              )}
            </h5>
            <button className=" border border-dangerSecondary text-dangerSecondary bg-dangerLite font-semibold py-2 px-4 uppercase rounded-md">40% off</button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default SingleProductCard;

// Itinerary card
export const SingleProductCardItinerary = ({ productId, imgsrc, productRating, productTitle, productPrice, discount, productSlug }) => {
  const params = useParams();
  const { region, city } = params;
  return (
    <div className={`${'product_' + productId} bg-white  rounded-lg p-4 gap-3 shadow-md sm:max-w-fit max-w-full min-h-[360px] h-fit w-full sm:mx-0`}>
      <Link href={`/itinerary/${productSlug}`}>
        {' '}
        {/** this is static link */}
        <img src={imgsrc || '/assets/Card.png'} alt="productimage" className="rounded-lg w-full sm:w-72 h-52 object-cover " />
        <div className="flex flex-col gap-[6px] justify-evenly py-1">
          <div className="flex gap-1 text-secondaryDark text-sm">
            <Star className="fill-current" size={18} />
            {productRating || 4.5}
            <span className="text-[#5A5A5A]" dangerouslySetInnerHTML={{ __html: '(3.4K)' }} />
          </div>
          <h3 className="text-black text-lg font-semibold">{productTitle || 'Evening Dessert - Premium'}</h3>
          <hr className=" border-t border-dashed border-gray-300 mb-1" />
          <div className="flex justify-between flex-wrap gap-2">
            <h5 className="flex flex-col  text-gray-500 font-semibold">
              <span className="font-normal">From</span>
              {productPrice || '$1200'}
            </h5>
            <button className=" border border-dangerSecondary text-dangerSecondary bg-dangerLite font-semibold py-2 px-4 uppercase rounded-md">40% off</button>
          </div>
        </div>
      </Link>
    </div>
  );
};

// package card
export const SingleProductCardPackage = ({ productId, imgsrc, productRating, productTitle, productPrice, discount, productSlug }) => {
  const params = useParams();
  const { region, city } = params;

  return (
    <div className={`${'product_' + productId} bg-white  rounded-lg p-4 gap-3 shadow-md sm:max-w-fit max-w-full min-h-[360px] h-fit w-full sm:mx-0`}>
      <Link href={`/package/${productSlug}`}>
        {' '}
        {/** this is static link */}
        <img src={imgsrc || '/assets/Card.png'} alt="productimage" className="rounded-lg w-full sm:w-72 h-52 object-cover " />
        <div className="flex flex-col gap-[6px] justify-evenly py-1">
          <div className="flex gap-1 text-secondaryDark text-sm">
            <Star className="fill-current" size={18} />
            {productRating || 4.5}
            <span className="text-[#5A5A5A]" dangerouslySetInnerHTML={{ __html: '(3.4K)' }} />
          </div>
          <h3 className="text-black text-lg font-semibold">{productTitle || 'Evening Dessert - Premium'}</h3>
          <hr className=" border-t border-dashed border-gray-300 mb-1" />
          <div className="flex justify-between flex-wrap gap-2">
            <h5 className="flex flex-col  text-gray-500 font-semibold">
              <span className="font-normal">From</span>
              {productPrice || '$1200'}
            </h5>
            <button className=" border border-dangerSecondary text-dangerSecondary bg-dangerLite font-semibold py-2 px-4 uppercase rounded-md">40% off</button>
          </div>
        </div>
      </Link>
    </div>
  );
};
