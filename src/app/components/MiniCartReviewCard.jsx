import React from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import useMiniCartStore from '@/lib/store/useMiniCartStore';
import { getRandomSimilarItineraries } from '@/lib/services/itineraries';

const MiniCartReviewCard = ({ imageSrc, productTitle, href }) => {
  if (!productTitle) return null;
  const card = (
    <div className="flex gap-4 items-center bg-white p-3 max-w-xs w-full rounded-xl border border-[#eee] hover:shadow-sm transition-shadow">
      <img src={imageSrc || 'https://picsum.photos/120/120'} alt={productTitle} className="w-20 h-20 object-cover rounded-md flex-shrink-0" />
      <div className="min-w-0">
        <h5 className="text-black font-semibold text-sm capitalize line-clamp-2">{productTitle}</h5>
      </div>
    </div>
  );
  return href ? <Link href={href}>{card}</Link> : card;
};

export default MiniCartReviewCard;

// Pulls 2 similar itineraries from the same city as the first itinerary
// in the cart, excluding that one. Falls back to nothing if there's no
// itinerary in the cart yet.
export const MinicartReviewcontent = () => {
  const { cartItems } = useMiniCartStore();
  const firstItinerary = cartItems.find((i) => i?.type === 'itinerary');
  const citySlug = firstItinerary?.city_slug ?? null;
  const excludeId = firstItinerary?.id ?? null;

  const swrKey = firstItinerary ? `cart-similar/${citySlug ?? 'any'}/${excludeId}` : null;

  const { data: similar = [] } = useSWR(swrKey, () => getRandomSimilarItineraries(citySlug, excludeId), { revalidateOnFocus: false, dedupingInterval: 60000 });

  if (!firstItinerary || !Array.isArray(similar) || similar.length === 0) {
    return null;
  }

  return (
    <div className="py-4">
      <h3 className="text-2xl font-bold capitalize text-black">Are You Interested In ?</h3>
      <ul className="flex flex-nowrap gap-4 overflow-x-scroll cursor-pointer tfc_scroll py-4 w-full">
        {similar.slice(0, 4).map((it) => {
          const city = it?.city_slug ?? it?.locations?.[0]?.city?.slug ?? citySlug;
          const href = city && it?.slug ? `/cities/${city}/itineraries/${it.slug}` : undefined;
          return (
            <li key={it.id} className="min-w-72">
              <MiniCartReviewCard productTitle={it?.name} imageSrc={it?.featured_image} href={href} />
            </li>
          );
        })}
      </ul>
    </div>
  );
};
