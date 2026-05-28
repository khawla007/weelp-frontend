import BreadCrumb from '@/app/components/BreadCrumb';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import { CircleCheckBig, Clock4, MapPin, Star, Heart } from 'lucide-react';
import GallerySlider from '@/app/components/sliders/GallerySlider';

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#588f7a]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white';

const BannerSection = ({ activityName, media_gallery = [], reviewSummary = null, primaryLocation = null, city = null, scheduleDisplay = null }) => {
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
          <div className="mt-6">
            <GallerySlider data={media_gallery} collapseHiddenThumbnails />
          </div>
        )}
      </div>
    </section>
  );
};

export default BannerSection;
