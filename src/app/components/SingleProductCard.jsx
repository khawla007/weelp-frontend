'use client';
import React from 'react';
import { Star } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import NavigationLink from '@/app/components/Navigation/NavigationLink';

const ITEM_TYPE_PLURAL = {
  activity: 'activities',
  itinerary: 'itineraries',
  package: 'packages',
  transfer: 'transfers',
};

export const GlobalCard = ({ productId, item_type, productSlug, imgsrc, productRating, productTitle, productPrice, currency, is_featured, citySlug: citySlugProp }) => {
  const params = useParams();
  const citySlug = citySlugProp || params?.city;
  const pluralType = ITEM_TYPE_PLURAL[item_type] || item_type;
  const itemHref = citySlug ? `/cities/${citySlug}/${pluralType}/${productSlug}` : `/${item_type}/${productSlug}`;

  return (
    <div
      className={`${'product_' + productId} bg-white rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_30px_rgba(0,0,0,0.18)] transition-all duration-300 border border-gray-50 sm:max-w-fit max-w-full h-fit w-full sm:mx-0 relative`}
    >
      {is_featured && (
        <>
          <div className="absolute top-4 left-4 z-10 bg-[#568f7c] text-white text-xs px-2 py-1 rounded-md font-medium">Featured</div>
          <Star size={24} fill="#568f7c" strokeWidth={2} className="absolute top-4 right-4 z-10 text-[#568f7c] drop-shadow-[0_2px_4px_rgba(86,143,124,0.3)]" />
        </>
      )}
      <NavigationLink href={itemHref} className="block">
        <img src={imgsrc ?? '/assets/Card.webp'} alt="productimage" className="w-full sm:w-72 h-52 object-cover" />
        <div className="flex flex-col gap-[6px] justify-evenly p-4">
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
      </NavigationLink>
    </div>
  );
};

const SingleProductCard = ({ productId, imgsrc, productRating, productTitle, productPrice, discount, productSlug, featured_activity }) => {
  const params = useParams();
  const { region, city } = params;

  return (
    <div
      className={`${'product_' + productId} bg-white rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_30px_rgba(0,0,0,0.18)] transition-all duration-300 border border-gray-50 sm:max-w-fit max-w-full h-fit w-full sm:mx-0 relative`}
    >
      {featured_activity && (
        <>
          <div className="absolute top-4 left-4 z-10 bg-[#568f7c] text-white text-xs px-2 py-1 rounded-md font-medium">Featured</div>
          <Star size={24} fill="#568f7c" strokeWidth={2} className="absolute top-4 right-4 z-10 text-[#568f7c] drop-shadow-[0_2px_4px_rgba(86,143,124,0.3)]" />
        </>
      )}
      <NavigationLink href={city ? `/cities/${city}/activities/${productSlug}` : `/activity/${productSlug}`} className="block">
        <img src={imgsrc || '/assets/Card.webp'} alt="productimage" className="w-full sm:w-72 h-52 object-cover" />
        <div className="flex flex-col gap-[6px] justify-evenly p-4">
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
      </NavigationLink>
    </div>
  );
};

export default SingleProductCard;

// Itinerary card
export const SingleProductCardItinerary = ({ productId, imgsrc, productRating, productTitle, productPrice, discount, productSlug, is_featured }) => {
  const params = useParams();
  const { region, city } = params;
  return (
    <div
      className={`${'product_' + productId} bg-white rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_30px_rgba(0,0,0,0.18)] transition-all duration-300 border border-gray-50 sm:max-w-fit max-w-full h-fit w-full sm:mx-0 relative`}
    >
      {is_featured && (
        <>
          <div className="absolute top-4 left-4 z-10 bg-[#568f7c] text-white text-xs px-2 py-1 rounded-md font-medium">Featured</div>
          <Star size={24} fill="#568f7c" strokeWidth={2} className="absolute top-4 right-4 z-10 text-[#568f7c] drop-shadow-[0_2px_4px_rgba(86,143,124,0.3)]" />
        </>
      )}
      <NavigationLink href={city ? `/cities/${city}/itineraries/${productSlug}` : `/itinerary/${productSlug}`} className="block">
        <img src={imgsrc || '/assets/Card.webp'} alt="productimage" className="w-full sm:w-72 h-52 object-cover" />
        <div className="flex flex-col gap-[6px] justify-evenly p-4">
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
      </NavigationLink>
    </div>
  );
};

// package card
export const SingleProductCardPackage = ({ productId, imgsrc, productRating, productTitle, productPrice, discount, productSlug, is_featured }) => {
  const params = useParams();
  const { region, city } = params;

  return (
    <div
      className={`${'product_' + productId} bg-white rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_30px_rgba(0,0,0,0.18)] transition-all duration-300 border border-gray-50 sm:max-w-fit max-w-full h-fit w-full sm:mx-0 relative`}
    >
      {is_featured && (
        <>
          <div className="absolute top-4 left-4 z-10 bg-[#568f7c] text-white text-xs px-2 py-1 rounded-md font-medium">Featured</div>
          <Star size={24} fill="#568f7c" strokeWidth={2} className="absolute top-4 right-4 z-10 text-[#568f7c] drop-shadow-[0_2px_4px_rgba(86,143,124,0.3)]" />
        </>
      )}
      <NavigationLink href={city ? `/cities/${city}/packages/${productSlug}` : `/package/${productSlug}`} className="block">
        <img src={imgsrc || '/assets/Card.webp'} alt="productimage" className="w-full sm:w-72 h-52 object-cover" />
        <div className="flex flex-col gap-[6px] justify-evenly p-4">
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
      </NavigationLink>
    </div>
  );
};
