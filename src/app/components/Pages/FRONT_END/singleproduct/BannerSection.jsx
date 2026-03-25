import BreadCrumb from '@/app/components/BreadCrumb';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import { CircleCheckBig, Clock4, MapPin, Star, Heart, ChevronLeft, ChevronRight } from 'lucide-react';

const BannerSection = ({ activityName, media_gallery = [], reviewSummary = null, primaryLocation = null, city = null }) => {
  return (
    <section className="bg-white">
      <div className="max-w-[1480px] mx-auto px-4">
        {/* Breadcrumb + Title + Stats */}
        <div className="flex flex-col gap-2 pt-[70px]">
          <BreadCrumb className="mb-2" />

          <h1 className="text-[#273f4e] font-semibold text-xl lg:text-4xl capitalize">{activityName ?? 'Melaka Wonderland Water Theme Park Ticket'}</h1>

          {/* Stats Row + Save to Wishlist */}
          <div className="flex flex-wrap items-center justify-between pb-4">
            <ul className="flex flex-wrap items-center gap-4">
              <li className="flex items-center gap-2 pr-4 border-r border-[#143042]/40">
                <span className="flex">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Star key={i} className={i < Math.round(reviewSummary?.average_rating || 0) ? 'stroke-none fill-[#fed141ff]' : 'stroke-none fill-gray-300'} size={16} />
                    ))}
                </span>
                <span className="text-[#5a5a5a] text-sm lg:text-base font-medium">{reviewSummary?.total_reviews || 0} Reviews</span>
              </li>
              <li className="flex items-center gap-2 pr-4 border-r border-[#143042]/40">
                <CircleCheckBig size={18} className="text-[#5a5a5a]" />
                <span className="text-[#5a5a5a] text-sm lg:text-base font-medium">3M+ booked</span>
              </li>
              <li className="flex items-center gap-2 pr-4 border-r border-[#143042]/40">
                <MapPin size={18} className="text-[#5a5a5a]" />
                <NavigationLink href={`/cities/${city || '#'}`} className="text-[#5a5a5a] text-sm lg:text-base font-medium hover:text-[#0c2536] transition-colors">
                  {primaryLocation?.city || 'Location'} {primaryLocation?.location_label && `(${primaryLocation.location_label})`}
                </NavigationLink>
              </li>
              <li className="flex items-center gap-2">
                <Clock4 size={18} className="text-[#5a5a5a]" />
                <span className="text-[#5a5a5a] text-sm lg:text-base font-medium">{primaryLocation?.duration ? `${primaryLocation.duration} Minutes` : 'Flexible'}</span>
              </li>
            </ul>

            {/* Save to Wishlist — desktop only */}
            <button className="hidden lg:flex items-center gap-2 text-[#5a5a5a] font-medium text-base">
              <Heart size={18} />
              Save to Wishlist
            </button>
          </div>

          {/* Separator */}
          <div className="border-b border-[#e3e3e3]/65" />
        </div>

        {/* Image Gallery */}
        {media_gallery?.length > 0 && (
          <div className="relative mt-6">
            <div className="flex gap-1 h-[250px] lg:h-[349px] overflow-hidden">
              {media_gallery.slice(0, 3).map((img, index) => (
                <div key={index} className={`flex-1 overflow-hidden ${index === 0 ? 'rounded-l-xl' : ''} ${index === Math.min(media_gallery.length, 3) - 1 ? 'rounded-r-xl' : ''}`}>
                  <img src={img?.url} alt={img?.alt_text || `${activityName} Image ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            {/* View Gallery Button */}
            <button className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md text-[#5a5a5a] text-sm font-medium hover:bg-gray-50 transition-colors">
              View Gallery
            </button>

            {/* Navigation Arrows */}
            <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
              <button className="flex items-center justify-center w-9 h-9 bg-white rounded-full shadow-md border border-[#e0e6eb] hover:bg-gray-50 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button className="flex items-center justify-center w-9 h-9 bg-white rounded-full shadow-md border border-[#e0e6eb] hover:bg-gray-50 transition-colors">
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
