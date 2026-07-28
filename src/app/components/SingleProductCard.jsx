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

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const formatRating = (value) => {
  const number = toNumber(value);
  if (!number || number <= 0) return null;
  return Number.isInteger(number) ? `${number}` : number.toFixed(1);
};

const formatReviewCount = (value) => {
  const number = toNumber(value);
  if (!number || number <= 0) return null;
  return `${number >= 1000 ? `${(number / 1000).toFixed(1)}K` : number}`;
};

const RatingSummary = ({ rating, reviewCount }) => {
  const displayRating = formatRating(rating);
  const displayReviewCount = formatReviewCount(reviewCount);

  if (!displayRating) return null;

  return (
    <div className="flex gap-1 text-weelp-copy text-sm">
      <Star className="fill-current" size={18} />
      {displayRating}
      {displayReviewCount && <span className="text-copy">({displayReviewCount})</span>}
    </div>
  );
};

export const GlobalCard = ({
  productId,
  item_type,
  productSlug,
  imgsrc,
  productRating,
  reviewCount,
  productTitle,
  productPrice,
  currency,
  is_featured,
  citySlug: citySlugProp,
  as: TitleTag = 'h3',
  stretch = false,
}) => {
  const params = useParams();
  const citySlug = citySlugProp || params?.city;
  const pluralType = ITEM_TYPE_PLURAL[item_type] || item_type;
  const itemHref = citySlug ? `/cities/${citySlug}/${pluralType}/${productSlug}` : `/${item_type}/${productSlug}`;
  const cardSizeClass = stretch ? 'h-full sm:max-w-none' : 'h-fit sm:max-w-fit';

  return (
    <div
      className={`${'product_' + productId} bg-background rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_30px_rgba(0,0,0,0.18)] transition-shadow duration-300 ease-[var(--weelp-ease-out)] motion-reduce:transition-none border border-border ${cardSizeClass} max-w-full w-full sm:mx-0 relative`}
    >
      {is_featured && (
        <>
          <div className="absolute top-4 left-4 z-10 bg-weelp-sage-deep text-white text-xs px-2 py-1 rounded-md font-medium">Featured</div>
          <Star size={24} fill="currentColor" strokeWidth={2} className="absolute top-4 right-4 z-10 text-weelp-sage-deep drop-shadow-[0_2px_4px_rgba(86,143,124,0.3)]" />
        </>
      )}
      <NavigationLink href={itemHref} className={stretch ? 'flex h-full flex-col' : 'block'}>
        <img src={imgsrc ?? '/assets/Card.webp'} alt="productimage" className={`${stretch ? 'w-full' : 'w-full sm:w-72'} h-52 object-cover`} />
        <div className={`flex ${stretch ? 'flex-1' : ''} flex-col gap-[6px] justify-evenly p-4`}>
          <RatingSummary rating={productRating} reviewCount={reviewCount} />
          <TitleTag className="text-foreground text-lg font-semibold">{productTitle || 'Evening Dessert - Premium'}</TitleTag>
          <hr className=" border-t border-dashed border-border mb-3" />
          <div className={`flex justify-between flex-wrap gap-2 ${stretch ? 'mt-auto' : ''}`}>
            <div className="flex flex-col  text-muted-foreground font-semibold space-y-4">
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
            </div>

            <button className="border border-weelp-discount text-weelp-discount bg-destructive/5 font-semibold py-1 px-4 uppercase rounded-md text-xs">40% off</button>
          </div>
        </div>
      </NavigationLink>
    </div>
  );
};

const SingleProductCard = ({ productId, imgsrc, productRating, reviewCount, productTitle, productPrice, discount, productSlug, featured_activity, as: TitleTag = 'h3' }) => {
  const params = useParams();
  const { region, city } = params;

  return (
    <div
      className={`${'product_' + productId} bg-background rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_30px_rgba(0,0,0,0.18)] transition-shadow duration-300 ease-[var(--weelp-ease-out)] motion-reduce:transition-none border border-border sm:max-w-fit max-w-full h-fit w-full sm:mx-0 relative`}
    >
      {featured_activity && (
        <>
          <div className="absolute top-4 left-4 z-10 bg-weelp-sage-deep text-white text-xs px-2 py-1 rounded-md font-medium">Featured</div>
          <Star size={24} fill="currentColor" strokeWidth={2} className="absolute top-4 right-4 z-10 text-weelp-sage-deep drop-shadow-[0_2px_4px_rgba(86,143,124,0.3)]" />
        </>
      )}
      <NavigationLink href={city ? `/cities/${city}/activities/${productSlug}` : `/activity/${productSlug}`} className="block">
        <img src={imgsrc || '/assets/Card.webp'} alt="productimage" className="w-full sm:w-72 h-52 object-cover" />
        <div className="flex flex-col gap-[6px] justify-evenly p-4">
          <RatingSummary rating={productRating} reviewCount={reviewCount} />
          <TitleTag className="text-foreground text-lg font-semibold">{productTitle || 'Evening Dessert - Premium'}</TitleTag>
          <hr className=" border-t border-dashed border-border mb-1" />
          <div className="flex justify-between flex-wrap gap-2">
            <div className="flex flex-col  text-muted-foreground font-semibold">
              {productPrice && (
                <>
                  <span className="font-normal">From</span>
                  {`$ ${productPrice}`}
                </>
              )}
            </div>
            <button className=" border border-weelp-discount text-weelp-discount bg-destructive/5 font-semibold py-2 px-4 uppercase rounded-md">40% off</button>
          </div>
        </div>
      </NavigationLink>
    </div>
  );
};

export default SingleProductCard;

// Itinerary card
export const SingleProductCardItinerary = ({ productId, imgsrc, productRating, reviewCount, productTitle, productPrice, discount, productSlug, is_featured, as: TitleTag = 'h3' }) => {
  const params = useParams();
  const { region, city } = params;
  return (
    <div
      className={`${'product_' + productId} bg-background rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_30px_rgba(0,0,0,0.18)] transition-shadow duration-300 ease-[var(--weelp-ease-out)] motion-reduce:transition-none border border-border sm:max-w-fit max-w-full h-fit w-full sm:mx-0 relative`}
    >
      {is_featured && (
        <>
          <div className="absolute top-4 left-4 z-10 bg-weelp-sage-deep text-white text-xs px-2 py-1 rounded-md font-medium">Featured</div>
          <Star size={24} fill="currentColor" strokeWidth={2} className="absolute top-4 right-4 z-10 text-weelp-sage-deep drop-shadow-[0_2px_4px_rgba(86,143,124,0.3)]" />
        </>
      )}
      <NavigationLink href={city ? `/cities/${city}/itineraries/${productSlug}` : `/itinerary/${productSlug}`} className="block">
        <img src={imgsrc || '/assets/Card.webp'} alt="productimage" className="w-full sm:w-72 h-52 object-cover" />
        <div className="flex flex-col gap-[6px] justify-evenly p-4">
          <RatingSummary rating={productRating} reviewCount={reviewCount} />
          <TitleTag className="text-foreground text-lg font-semibold">{productTitle || 'Evening Dessert - Premium'}</TitleTag>
          <hr className=" border-t border-dashed border-border mb-1" />
          <div className="flex justify-between flex-wrap gap-2">
            <div className="flex flex-col  text-muted-foreground font-semibold">
              <span className="font-normal">From</span>
              {productPrice || '$1200'}
            </div>
            <button className=" border border-weelp-discount text-weelp-discount bg-destructive/5 font-semibold py-2 px-4 uppercase rounded-md">40% off</button>
          </div>
        </div>
      </NavigationLink>
    </div>
  );
};

// package card
export const SingleProductCardPackage = ({ productId, imgsrc, productRating, reviewCount, productTitle, productPrice, discount, productSlug, is_featured, as: TitleTag = 'h3' }) => {
  const params = useParams();
  const { region, city } = params;

  return (
    <div
      className={`${'product_' + productId} bg-background rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_30px_rgba(0,0,0,0.18)] transition-shadow duration-300 ease-[var(--weelp-ease-out)] motion-reduce:transition-none border border-border sm:max-w-fit max-w-full h-fit w-full sm:mx-0 relative`}
    >
      {is_featured && (
        <>
          <div className="absolute top-4 left-4 z-10 bg-weelp-sage-deep text-white text-xs px-2 py-1 rounded-md font-medium">Featured</div>
          <Star size={24} fill="currentColor" strokeWidth={2} className="absolute top-4 right-4 z-10 text-weelp-sage-deep drop-shadow-[0_2px_4px_rgba(86,143,124,0.3)]" />
        </>
      )}
      <NavigationLink href={city ? `/cities/${city}/packages/${productSlug}` : `/package/${productSlug}`} className="block">
        <img src={imgsrc || '/assets/Card.webp'} alt="productimage" className="w-full sm:w-72 h-52 object-cover" />
        <div className="flex flex-col gap-[6px] justify-evenly p-4">
          <RatingSummary rating={productRating} reviewCount={reviewCount} />
          <TitleTag className="text-foreground text-lg font-semibold">{productTitle || 'Evening Dessert - Premium'}</TitleTag>
          <hr className=" border-t border-dashed border-border mb-1" />
          <div className="flex justify-between flex-wrap gap-2">
            <div className="flex flex-col  text-muted-foreground font-semibold">
              <span className="font-normal">From</span>
              {productPrice || '$1200'}
            </div>
            <button className=" border border-weelp-discount text-weelp-discount bg-destructive/5 font-semibold py-2 px-4 uppercase rounded-md">40% off</button>
          </div>
        </div>
      </NavigationLink>
    </div>
  );
};
