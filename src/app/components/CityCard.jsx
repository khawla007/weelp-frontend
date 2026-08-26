import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import { cn, formatCurrency } from '@/lib/utils';
import { IMAGE_BLUR_DATA_URL } from '@/lib/imagePlaceholder';

const DESTINATION_ACTION_CLASS =
  // dark-mode-exempt: translucent white glass action remains legible over the permanent image overlay
  'grid size-10 shrink-0 place-items-center rounded-full border border-white/55 bg-white/15 text-white shadow-sm backdrop-blur-md transition-transform duration-300 group-hover:-rotate-45 motion-reduce:transition-none motion-reduce:group-hover:rotate-0';

export default function CityCard({ city, className = '', subtitleMode = 'count' }) {
  const image = city.featured_image || city.feature_image || city.image || '/assets/Card.webp';
  const activitiesCount = city.activities_count ?? city.activitiesCount ?? 0;
  const blogsCount = city.blogs_count ?? city.blogsCount ?? 0;
  const hasPrice = city.starting_price != null;

  let subtitle = null;
  if (subtitleMode === 'price') {
    if (hasPrice) {
      subtitle = `Starting at ${formatCurrency(city.starting_price, city.currency)}`;
    }
  } else if (subtitleMode === 'blogs') {
    subtitle = `${blogsCount} ${blogsCount === 1 ? 'Blog' : 'Blogs'}`;
  } else {
    subtitle = `${activitiesCount} ${activitiesCount === 1 ? 'Activity' : 'Activities'}`;
  }

  return (
    <NavigationLink
      href={`/cities/${city.slug}`}
      className={cn(
        'weelp-destination-card group relative block h-[280px] overflow-hidden rounded-[24px] border border-[var(--weelp-card-border)] bg-weelp-sage-wash transition-shadow duration-300 hover:[box-shadow:var(--weelp-card-hover-shadow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none sm:h-[320px] xl:h-[360px]',
        className,
      )}
    >
      <Image
        src={image}
        alt=""
        fill
        sizes="(max-width: 639px) 90vw, (max-width: 1023px) 50vw, (max-width: 1439px) 33vw, 25vw"
        placeholder="blur"
        blurDataURL={IMAGE_BLUR_DATA_URL}
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-3 p-4 pt-20 sm:p-5 sm:pt-24">
        <div className="min-w-0">
          <h3
            className="line-clamp-2 text-[20px] leading-tight text-white drop-shadow-md"
            style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 600 }}
          >
            {city.name}
          </h3>
          {subtitle && (
            <p
              className="mt-1 truncate text-[13px] text-white/90 drop-shadow-md"
              style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif' }}
            >
              {subtitle}
            </p>
          )}
        </div>
        <span data-testid="destination-card-action" aria-hidden="true" className={DESTINATION_ACTION_CLASS}>
          <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2.5} />
        </span>
      </div>
    </NavigationLink>
  );
}
