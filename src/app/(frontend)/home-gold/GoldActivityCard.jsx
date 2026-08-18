import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

import NavigationLink from '@/app/components/Navigation/NavigationLink';
import { IMAGE_BLUR_DATA_URL } from '@/lib/imagePlaceholder';

import GoldActivityWishlistButton from './GoldActivityWishlistButton';

const IMAGE_SIZES = '(max-width: 640px) 90vw, (max-width: 1024px) 33vw, (max-width: 1440px) 25vw, 20vw';

export default function GoldActivityCard({ item, wishlistItem }) {
  const category = item.category || 'Activity';
  const hasRating = Boolean(item.rating);

  return (
    <article
      data-testid="home-gold-activity-card"
      className="relative min-h-[300px] overflow-hidden rounded-[24px] border border-[oklch(0.72_0.055_75/0.45)] bg-[oklch(0.96_0.02_80)] shadow-[0_12px_26px_rgba(76,53,31,0.14)] dark:border-[oklch(0.7_0.075_78/0.48)] dark:bg-[oklch(0.17_0.03_155)] dark:shadow-[0_12px_28px_rgba(5,15,11,0.32)]"
    >
      <NavigationLink
        href={item.href}
        aria-label={`Explore ${item.title}`}
        className="group relative block min-h-[300px] overflow-hidden rounded-[24px] transition-shadow focus-visible:outline-none motion-reduce:transition-none"
      >
        <Image
          fill
          src={item.image}
          alt={item.title}
          sizes={IMAGE_SIZES}
          placeholder="blur"
          blurDataURL={IMAGE_BLUR_DATA_URL}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />

        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[oklch(0.14_0.025_40/0.3)] via-transparent to-transparent dark:from-[oklch(0.09_0.025_155/0.4)]" />

        <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-[oklch(0.93_0.018_80/0.42)] bg-[oklch(0.2_0.035_50/0.94)] p-3.5 text-[oklch(0.97_0.012_80)] shadow-[0_8px_20px_rgba(52,34,20,0.24)] backdrop-blur-md dark:border-[oklch(0.76_0.07_80/0.42)] dark:bg-[oklch(0.12_0.035_155/0.94)] dark:shadow-[0_8px_20px_rgba(5,15,11,0.3)]">
          <div className="flex min-w-0 items-center gap-1.5 text-xs leading-none">
            {hasRating ? (
              <>
                <span aria-hidden="true" className="text-[oklch(0.82_0.14_80)]">
                  ★
                </span>
                <span className="font-semibold">{item.rating}</span>
                {item.reviewCount ? <span className="text-[oklch(0.94_0.012_80)]">({item.reviewCount})</span> : null}
                <span aria-hidden="true" className="text-[oklch(0.94_0.012_80)]">
                  ·
                </span>
              </>
            ) : null}
            <span className="truncate text-[oklch(0.94_0.012_80)]">{category}</span>
          </div>

          <h3 className="mt-1 line-clamp-1 text-lg font-semibold leading-tight text-[oklch(0.97_0.012_80)]">{item.title}</h3>

          <div className="mt-3 flex items-end justify-between gap-2">
            {item.price ? (
              <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-xs">
                <span className="text-[oklch(0.94_0.012_80)]">From</span>
                <strong className="text-base leading-none text-[oklch(0.98_0.012_80)]">{item.price}</strong>
                {item.originalPrice ? <span className="line-through text-[oklch(0.94_0.012_80)]">{item.originalPrice}</span> : null}
                <span className="text-[oklch(0.94_0.012_80)]">per person</span>
              </div>
            ) : null}

            <span className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-[oklch(0.8_0.035_75/0.7)] bg-[oklch(0.96_0.018_80)] px-2.5 py-1.5 text-xs font-semibold text-[oklch(0.3_0.03_50)] transition-colors group-hover:bg-[oklch(0.91_0.035_80)] motion-reduce:transition-none dark:border-[oklch(0.72_0.08_80/0.65)] dark:bg-[oklch(0.72_0.08_80)] dark:text-[oklch(0.17_0.03_155)] dark:group-hover:bg-[oklch(0.78_0.09_80)]">
              <span className="grid size-5 place-items-center rounded-full border border-current">
                <ArrowRight aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
              </span>
              Explore
            </span>
          </div>
        </div>

        <span
          aria-hidden="true"
          data-testid="home-gold-activity-focus"
          className="pointer-events-none absolute inset-0 z-30 rounded-[24px] opacity-0 shadow-[inset_0_0_0_2px_oklch(0.98_0.01_80),inset_0_0_0_4px_oklch(0.2_0.03_155)] group-focus-visible:opacity-100"
        />
      </NavigationLink>

      <div className="pointer-events-none absolute left-4 top-4 z-20 flex items-center gap-2">
        {/* dark-mode-exempt: discount badge requires a theme-independent dark foreground for contrast */}
        <span className="rounded-lg bg-weelp-discount px-3 py-2 text-xs font-bold text-zinc-950">{item.discount || '40% OFF'}</span>
        <div className="pointer-events-auto">
          <GoldActivityWishlistButton item={wishlistItem} />
        </div>
      </div>
    </article>
  );
}
