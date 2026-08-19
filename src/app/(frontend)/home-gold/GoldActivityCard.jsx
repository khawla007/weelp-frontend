import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

import NavigationLink from '@/app/components/Navigation/NavigationLink';
import { IMAGE_BLUR_DATA_URL } from '@/lib/imagePlaceholder';
import { getAttributeIcon } from '@/lib/attributeIcons';

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
  const shortDescription = item.shortDescription ?? null;
  const attributes = Array.isArray(item.attributes) ? item.attributes : [];
  const category = item.category || 'Activity';
  const hasRating = Boolean(item.rating);
  const usesFallbackDiscount = !item.discount?.trim();
  const discountLabel = `-${(usesFallbackDiscount ? '40% OFF' : item.discount).trim().replace(/^-+\s*/, '')}`;
  const originalPrice = item.originalPrice || (usesFallbackDiscount ? deriveOriginalPrice(item.price) : null);

  return (
    <article
      itemScope
      itemType="https://schema.org/Product"
      data-testid="home-gold-activity-card"
      className="group flex h-full flex-col overflow-hidden rounded-[24px] p-2 border border-[oklch(0.72_0.055_75/0.45)] bg-[oklch(0.96_0.02_80)] transition-all duration-300 dark:border-[oklch(0.7_0.075_78/0.48)] dark:bg-[oklch(0.17_0.03_155)]"
    >
      <meta itemProp="name" content={item.title} />
      <meta itemProp="image" content={item.image} />
      <meta itemProp="category" content={category} />

      <NavigationLink
        href={item.href}
        itemProp="url"
        aria-label={`Explore ${item.title}`}
        className="flex h-full flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[oklch(0.17_0.03_155)]"
      >
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-[16px] bg-zinc-100 dark:bg-[oklch(0.12_0.035_155/0.94)]">
          <Image
            fill
            src={item.image}
            alt={item.title}
            sizes={IMAGE_SIZES}
            placeholder="blur"
            blurDataURL={IMAGE_BLUR_DATA_URL}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />

          <div className="absolute left-3 top-3 z-20 flex flex-wrap gap-2 pr-16">
            <span className="inline-flex rounded-full bg-white/20 backdrop-blur-md border border-white/20 px-2.5 py-1 text-[11px] font-medium text-white shadow-sm">{category}</span>
            <span className="inline-flex rounded-full bg-white/20 backdrop-blur-md border border-white/20 px-2.5 py-1 text-[11px] font-medium text-white shadow-sm">{discountLabel}</span>
          </div>

          <div className="absolute right-3 top-3 z-20">
            <GoldActivityWishlistButton item={wishlistItem} />
          </div>
        </div>

        <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h3
                itemProp="name"
                className="line-clamp-2 text-xl font-medium leading-snug tracking-tight text-zinc-900 transition-colors group-hover:text-amber-600 dark:text-[oklch(0.98_0.012_80)] dark:group-hover:text-white"
              >
                {item.title}
              </h3>

              <div className="shrink-0">
                {hasRating ? (
                  <div
                    itemScope
                    itemProp="aggregateRating"
                    itemType="https://schema.org/AggregateRating"
                    className="flex items-center gap-1 font-semibold text-zinc-900 dark:text-[oklch(0.98_0.012_80)]"
                  >
                    <meta itemProp="bestRating" content="5" />
                    <span aria-hidden="true" className="text-amber-500 text-sm">
                      ★
                    </span>
                    <span itemProp="ratingValue" className="text-sm">
                      {item.rating}
                    </span>
                    {item.reviewCount ? (
                      <span itemProp="reviewCount" className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        ({item.reviewCount})
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>

            {shortDescription ? (
              // dark-mode-exempt: paired dark: variant provides dark-mode color
              <p className="mt-2 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">{shortDescription}</p>
            ) : null}
          </div>

          <div className="mt-auto flex flex-col gap-3 pt-4">
            {attributes.length > 0 ? (
              // dark-mode-exempt: paired dark: variant provides dark-mode color
              <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-600 dark:text-zinc-300">
                {attributes.map((attribute) => {
                  const Icon = getAttributeIcon(attribute.slug);
                  const label = `${attribute.name}: ${attribute.attribute_value}`;
                  return (
                    <li key={attribute.slug || attribute.name} data-testid="home-gold-activity-attribute" aria-label={label} title={label} className="inline-flex items-center gap-1.5">
                      {/* dark-mode-exempt: paired dark: variant provides dark-mode color */}
                      <Icon aria-hidden="true" className="size-4 text-zinc-500 dark:text-zinc-400" strokeWidth={1.75} />
                      <span>{attribute.attribute_value}</span>
                    </li>
                  );
                })}
              </ul>
            ) : null}

            <div className="flex items-end justify-between">
              {item.price ? (
                <div itemScope itemProp="offers" itemType="https://schema.org/Offer" className="flex flex-col gap-0.5">
                  <meta itemProp="priceCurrency" content="USD" />
                  <link itemProp="availability" href="https://schema.org/InStock" />
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-[oklch(0.94_0.012_80)] dark:opacity-80">From</span>
                  <div className="flex items-baseline gap-1.5">
                    <strong itemProp="price" content={item.price.replace(/[^0-9.]/g, '')} className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
                      {item.price}
                    </strong>
                    {originalPrice ? <span className="ml-1 text-xs text-zinc-400 line-through dark:text-[oklch(0.94_0.012_80)] dark:opacity-60">{originalPrice}</span> : null}
                  </div>
                </div>
              ) : (
                <div />
              )}

              <span className="inline-flex h-10 shrink-0 items-center gap-3 rounded-full bg-zinc-900 pl-4 pr-1 text-sm font-medium text-white shadow-sm transition-all duration-300 group-hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:group-hover:bg-zinc-200">
                Explore
                <span className="grid size-8 place-items-center rounded-full bg-white text-zinc-900 transition-transform duration-300 group-hover:-rotate-45 dark:bg-zinc-900 dark:text-white">
                  <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2.5} />
                </span>
              </span>
            </div>
          </div>
        </div>
      </NavigationLink>
    </article>
  );
}
