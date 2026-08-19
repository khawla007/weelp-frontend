import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

import NavigationLink from '@/app/components/Navigation/NavigationLink';
import { IMAGE_BLUR_DATA_URL } from '@/lib/imagePlaceholder';

import GoldActivityWishlistButton from './GoldActivityWishlistButton';

const IMAGE_SIZES = '(max-width: 640px) 90vw, (max-width: 1024px) 50vw, (max-width: 1440px) 33vw, 25vw';

function deriveOriginalPrice(price) {
  if (typeof price !== 'string') return null;

  const match = price.trim().match(/^([^\d]*)(\d+(?:,\d{3})*(?:\.\d+)?)([^\d]*)$/);
  if (!match) return null;

  const [, prefix, amountText, suffix] = match;
  const amount = Number(amountText.replaceAll(',', ''));
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const decimalPlaces = amountText.includes('.') ? amountText.split('.')[1].length : 0;
  const originalAmount = amount / 0.6;
  const formattedAmount = originalAmount.toLocaleString('en-US', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
    useGrouping: amountText.includes(','),
  });

  return `${prefix}${formattedAmount}${suffix}`;
}

export default function GoldActivityCard({ item, wishlistItem }) {
  const category = item.category || 'Activity';
  const hasRating = Boolean(item.rating);
  const usesFallbackDiscount = !item.discount?.trim();
  const discountLabel = `-${(usesFallbackDiscount ? '40% OFF' : item.discount).trim().replace(/^-+\s*/, '')}`;
  const originalPrice = item.originalPrice || (usesFallbackDiscount ? deriveOriginalPrice(item.price) : null);

  return (
    <article
      data-testid="home-gold-activity-card"
      className="relative min-h-[440px] overflow-hidden rounded-[24px] border border-[oklch(0.72_0.055_75/0.45)] bg-[oklch(0.96_0.02_80)] shadow-[0_16px_36px_rgba(76,53,31,0.2)] transition-all duration-500 hover:shadow-[0_24px_52px_rgba(0,0,0,0.38)] sm:min-h-[460px] md:min-h-[480px] lg:aspect-[3/4] lg:min-h-0 dark:border-[oklch(0.7_0.075_78/0.48)] dark:bg-[oklch(0.17_0.03_155)] dark:shadow-[0_18px_40px_rgba(5,15,11,0.5)]"
    >
      <NavigationLink
        href={item.href}
        aria-label={`Explore ${item.title}`}
        className="group relative block h-full min-h-[440px] overflow-hidden rounded-[24px] transition-all duration-500 focus-visible:outline-none sm:min-h-[460px] md:min-h-[480px] lg:min-h-0 motion-reduce:transition-none"
      >
        <Image
          fill
          src={item.image}
          alt={item.title}
          sizes={IMAGE_SIZES}
          placeholder="blur"
          blurDataURL={IMAGE_BLUR_DATA_URL}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />

        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 transition-opacity duration-500 group-hover:opacity-95" />

        <div className="absolute inset-x-3.5 bottom-3.5 rounded-2xl border border-[oklch(0.93_0.018_80/0.42)] bg-[oklch(0.2_0.035_50/0.94)] p-4 sm:p-4.5 text-[oklch(0.97_0.012_80)] shadow-[0_12px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-all duration-500 group-hover:border-[oklch(0.85_0.12_80/0.6)] dark:border-[oklch(0.76_0.07_80/0.42)] dark:bg-[oklch(0.12_0.035_155/0.94)] dark:shadow-[0_14px_36px_rgba(0,0,0,0.55)]">
          <div className="flex min-w-0 items-center gap-2 text-xs leading-none">
            {hasRating ? (
              <>
                <div className="flex items-center gap-1 rounded-full bg-[oklch(0.98_0.012_80/0.15)] px-2.5 py-1 border border-[oklch(0.98_0.012_80/0.2)] backdrop-blur-xs">
                  <span aria-hidden="true" className="text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]">
                    ★
                  </span>
                  <span className="font-bold text-[oklch(0.98_0.012_80)]">{item.rating}</span>
                  {item.reviewCount ? <span className="text-[oklch(0.94_0.012_80)] font-medium">({item.reviewCount})</span> : null}
                </div>
                <span aria-hidden="true" className="text-[oklch(0.94_0.012_80)] opacity-60">
                  ·
                </span>
              </>
            ) : null}
            <span className="truncate text-[oklch(0.94_0.012_80)] font-semibold tracking-wider uppercase text-[10px]">{category}</span>
          </div>

          <h3 className="mt-2.5 line-clamp-2 text-xl font-extrabold leading-snug tracking-tight text-[oklch(0.98_0.012_80)] transition-colors duration-300 group-hover:text-white">{item.title}</h3>

          <div className="mt-4 flex items-end justify-between gap-3 pt-2.5 border-t border-white/12">
            {item.price ? (
              <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-xs">
                <span className="text-[oklch(0.94_0.012_80)] opacity-80">From</span>
                <strong className="text-xl font-extrabold leading-none text-white tracking-tight">{item.price}</strong>
                {originalPrice ? <span className="line-through text-[oklch(0.94_0.012_80)] opacity-75 text-xs">{originalPrice}</span> : null}
                <span className="text-[oklch(0.94_0.012_80)] opacity-80">per person</span>
              </div>
            ) : null}

            {/* dark-mode-exempt: explore button requires theme-independent dark text on amber hover fill */}
            <span className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-[oklch(0.8_0.035_75/0.7)] bg-[oklch(0.96_0.018_80)] px-4 py-2 text-xs font-extrabold text-[oklch(0.3_0.03_50)] shadow-md transition-all duration-300 group-hover:bg-amber-400 group-hover:text-zinc-950 group-hover:shadow-amber-400/30 group-hover:border-amber-300 motion-reduce:transition-none dark:border-[oklch(0.72_0.08_80/0.65)] dark:bg-[oklch(0.72_0.08_80)] dark:text-[oklch(0.17_0.03_155)] dark:group-hover:bg-amber-400 dark:group-hover:text-zinc-950">
              <span className="grid size-5 place-items-center rounded-full border border-current transition-transform duration-300 group-hover:translate-x-0.5">
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
        <span className="rounded-full bg-weelp-discount px-3.5 py-1.5 text-xs font-extrabold text-zinc-950 shadow-md uppercase tracking-wider border border-amber-300/40 backdrop-blur-md">
          {discountLabel}
        </span>
        {/* dark-mode-exempt: wishlist button shell uses a semi-transparent black overlay for photo contrast */}
        <div className="pointer-events-auto rounded-full bg-black/30 p-1.5 backdrop-blur-md border border-white/20 shadow-md">
          <GoldActivityWishlistButton item={wishlistItem} />
        </div>
      </div>
    </article>
  );
}
