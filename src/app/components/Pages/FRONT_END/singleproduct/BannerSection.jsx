'use client';

import Image from 'next/image';
import { useState } from 'react';
import BreadCrumb from '@/app/components/BreadCrumb';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import { CircleCheckBig, Clock4, MapPin, Star, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { IMAGE_BLUR_DATA_URL } from '@/lib/imagePlaceholder';

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#588f7a]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white';

const BannerSection = ({ activityName, media_gallery = [], reviewSummary = null, primaryLocation = null, city = null, scheduleDisplay = null }) => {
  const galleryLen = media_gallery?.length || 0;
  const [activeIndex, setActiveIndex] = useState(0);
  const handlePrev = () => setActiveIndex((i) => (i - 1 + galleryLen) % galleryLen);
  const handleNext = () => setActiveIndex((i) => (i + 1) % galleryLen);

  return (
    <section className="bg-white mb-10 md:mb-16 lg:mb-24">
      <div className="max-w-pen mx-auto px-4">
        {/* Breadcrumb + Title + Stats */}
        <div className="flex flex-col gap-2 pt-[70px]">
          <BreadCrumb className="mb-2" />

          <h1 className="text-[#18181b] text-2xl lg:text-[38px] capitalize">{activityName ?? 'Melaka Wonderland Water Theme Park Ticket'}</h1>

          {/* Stats Row + Save to Wishlist */}
          <div className="flex flex-wrap items-center justify-between pb-4">
            <ul className="flex flex-wrap items-center gap-4">
              <li className="flex items-center gap-2 pr-4 border-r border-[#e4e4e7]">
                <span className="flex">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Star key={i} className={i < Math.round(reviewSummary?.average_rating || 0) ? 'stroke-none fill-[#fed141]' : 'stroke-none fill-zinc-300'} size={16} />
                    ))}
                </span>
                <span className="text-[#71717a] text-sm lg:text-base font-medium">{reviewSummary?.total_reviews || 0} Reviews</span>
              </li>
              <li className="flex items-center gap-2 pr-4 border-r border-[#e4e4e7]">
                <CircleCheckBig size={18} className="text-[#71717a]" />
                <span className="text-[#71717a] text-sm lg:text-base font-medium">3M+ booked</span>
              </li>
              <li className="flex items-center gap-2 pr-4 border-r border-[#e4e4e7]">
                <MapPin size={18} className="text-[#71717a]" />
                <NavigationLink href={`/cities/${city || '#'}`} className={`text-[#71717a] text-sm lg:text-base font-medium hover:text-[#18181b] transition-colors rounded-sm ${focusRing}`}>
                  {primaryLocation?.city || 'Location'} {primaryLocation?.location_label && `(${primaryLocation.location_label})`}
                </NavigationLink>
              </li>
              <li className="flex items-center gap-2">
                <Clock4 size={18} className="text-[#71717a]" />
                <span className="text-[#71717a] text-sm lg:text-base font-medium">{scheduleDisplay || (primaryLocation?.duration ? `${primaryLocation.duration} Minutes` : 'Flexible')}</span>
              </li>
            </ul>

            {/* Save to Wishlist — desktop only */}
            <button type="button" className={`hidden lg:flex items-center gap-2 text-[#52525b] hover:text-[#18181b] font-medium text-base rounded-sm px-1 py-1 transition-colors ${focusRing}`}>
              <Heart size={18} />
              Save to Wishlist
            </button>
          </div>

          {/* Separator */}
          <div className="border-b border-[#e4e4e7]" />
        </div>

        {/* Image Gallery */}
        {media_gallery?.length > 0 && (
          <div className="relative mt-6">
            <div className="flex gap-1 h-[250px] lg:h-[349px] overflow-hidden">
              {/* Hero column */}
              <div className="relative flex-1 overflow-hidden rounded-l-xl group">
                {media_gallery.map((img, i) => (
                  <Image
                    key={i}
                    src={img?.url}
                    alt={img?.alt_text || `${activityName} Image ${i + 1}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 720px"
                    placeholder="blur"
                    blurDataURL={IMAGE_BLUR_DATA_URL}
                    priority={i === 0}
                    className={`object-cover transition-[opacity,transform] duration-[260ms] ease-[var(--weelp-ease-out)] motion-reduce:transition-none group-hover:scale-[1.02] ${
                      i === activeIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                ))}
              </div>

              {/* Thumb column — lg+ only, when at least 2 images */}
              {galleryLen > 1 && (
                <div className="hidden lg:flex flex-col gap-1 basis-1/3 max-w-[33%]">
                  {media_gallery.slice(1, 3).map((img, offset) => {
                    const thumbIndex = offset + 1;
                    const isFirst = offset === 0;
                    const isLast = thumbIndex === Math.min(galleryLen, 3) - 1;
                    const corners = `${isFirst ? 'rounded-tr-xl' : ''} ${isLast ? 'rounded-br-xl' : ''}`;
                    return (
                      <button
                        key={thumbIndex}
                        type="button"
                        onClick={() => setActiveIndex(thumbIndex)}
                        aria-label={`Show gallery image ${thumbIndex + 1}`}
                        aria-current={activeIndex === thumbIndex ? 'true' : undefined}
                        className={`relative flex-1 overflow-hidden ${corners} ${focusRing} group/thumb`}
                      >
                        <Image
                          src={img?.url}
                          alt={img?.alt_text || ''}
                          fill
                          sizes="240px"
                          placeholder="blur"
                          blurDataURL={IMAGE_BLUR_DATA_URL}
                          className="object-cover transition-transform duration-[260ms] ease-[var(--weelp-ease-out)] motion-reduce:transition-none group-hover/thumb:scale-[1.02]"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* View Gallery Button */}
            <button
              type="button"
              className={`absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-[4px_4px_12px_rgba(0,0,0,0.1)] text-[#18181b] text-sm font-medium hover:bg-[#f4f4f5] hover:scale-[1.03] active:scale-100 transition-[background-color,transform] duration-150 ease-[var(--weelp-ease-out)] motion-reduce:transition-none ${focusRing}`}
            >
              View Gallery
            </button>

            {/* Navigation Arrows */}
            <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous gallery image"
                onClick={handlePrev}
                disabled={galleryLen <= 1}
                className={`flex items-center justify-center w-11 h-11 bg-white rounded-full shadow-[4px_4px_12px_rgba(0,0,0,0.1)] border border-[#e4e4e7] text-[#18181b] hover:bg-[#f4f4f5] hover:scale-[1.03] active:scale-100 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed transition-[background-color,transform] duration-150 ease-[var(--weelp-ease-out)] motion-reduce:transition-none ${focusRing}`}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                aria-label="Next gallery image"
                onClick={handleNext}
                disabled={galleryLen <= 1}
                className={`flex items-center justify-center w-11 h-11 bg-white rounded-full shadow-[4px_4px_12px_rgba(0,0,0,0.1)] border border-[#e4e4e7] text-[#18181b] hover:bg-[#f4f4f5] hover:scale-[1.03] active:scale-100 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed transition-[background-color,transform] duration-150 ease-[var(--weelp-ease-out)] motion-reduce:transition-none ${focusRing}`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default BannerSection;
