import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

import NavigationLink from '@/app/components/Navigation/NavigationLink';
import BlogPublishedDate from '@/app/components/ui/BlogPublishedDate';
import { FEATURE_CARD_HEIGHT_CLASS } from '@/app/components/ui/cardSizing';
import { PUBLIC_CARD_MEDIA_RADIUS_CLASS, PUBLIC_CARD_RADIUS_CLASS } from '@/app/components/ui/cardStyles';
import ItemCardWishlistButton from '@/app/components/Wishlist/ItemCardWishlistButton';
import { getAttributeIcon } from '@/lib/attributeIcons';
import { IMAGE_BLUR_DATA_URL } from '@/lib/imagePlaceholder';
import { cn } from '@/lib/utils';

const SUPPORTED_SCHEMA_CURRENCIES = typeof Intl.supportedValuesOf === 'function' ? new Set(Intl.supportedValuesOf('currency')) : new Set();
const SUPPORTED_SCHEMA_AVAILABILITY = new Set(['https://schema.org/InStock', 'https://schema.org/OutOfStock', 'https://schema.org/PreOrder']);
const PRODUCT_CARD_SURFACE_CLASS = cn('overflow-hidden border border-[var(--weelp-card-border)] bg-background p-2', PUBLIC_CARD_RADIUS_CLASS);
const PRODUCT_CARD_HOVER_CLASS = 'transition-shadow duration-300 hover:[box-shadow:var(--weelp-card-hover-shadow)] motion-reduce:transition-none';
const PRODUCT_CARD_FOCUS_CLASS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2';
const PRODUCT_CARD_IMAGE_MOTION_CLASS =
  'object-cover transition-transform duration-700 ease-out group-hover/card-link:scale-105 motion-reduce:transition-none motion-reduce:group-hover/card-link:scale-100';

function SharedCardImage({ image, title, children }) {
  return (
    <div className={cn('relative aspect-[5/3] w-full shrink-0 overflow-hidden bg-weelp-sage-wash sm:aspect-[4/3]', PUBLIC_CARD_MEDIA_RADIUS_CLASS)}>
      <Image
        fill
        src={image}
        alt={title}
        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, (max-width: 1440px) 33vw, 25vw"
        placeholder="blur"
        blurDataURL={IMAGE_BLUR_DATA_URL}
        className={PRODUCT_CARD_IMAGE_MOTION_CLASS}
      />
      {children}
    </div>
  );
}

function EditorialItemCard({ href, image, title, category, shortDescription = null, tag = null, additionalTagCount = 0, className = '', style, LinkComponent = NavigationLink }) {
  const CardRoot = href ? LinkComponent : 'div';
  const cardRootProps = href ? { href, 'aria-label': `Read ${title}` } : {};

  return (
    <article data-testid="editorial-item-card" className={cn('flex h-full flex-col', PRODUCT_CARD_SURFACE_CLASS, PRODUCT_CARD_HOVER_CLASS, className)} style={style}>
      <CardRoot {...cardRootProps} className={cn('group/card-link flex h-full flex-col', PRODUCT_CARD_FOCUS_CLASS)}>
        <SharedCardImage image={image} title={title} />
        <div className="flex flex-1 flex-col gap-3 px-2 pb-2 pt-4">
          {category ? <span className="w-fit rounded-md bg-weelp-sage-deep/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-weelp-copy">{category}</span> : null}
          <h3 className="line-clamp-2 text-xl font-medium leading-snug tracking-tight text-foreground">{title}</h3>
          {shortDescription ? (
            <p data-testid="editorial-description" className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {shortDescription}
            </p>
          ) : null}
          {tag ? (
            <div data-testid="editorial-tags" className="mt-auto flex min-w-0 items-center gap-2 pt-1">
              <span title={tag} className="min-w-0 max-w-full truncate rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                {tag}
              </span>
              {additionalTagCount > 0 ? <span className="shrink-0 text-xs font-medium text-muted-foreground">+{additionalTagCount}</span> : null}
            </div>
          ) : null}
        </div>
      </CardRoot>
    </article>
  );
}

function CompactItemCard({ href, image, title, category, publishedAt, className = '', imageClassName = '', style, LinkComponent = NavigationLink }) {
  return (
    <LinkComponent
      href={href}
      style={style}
      className={`group flex h-full flex-col overflow-hidden rounded-[8.5px] border border-border bg-background transition-shadow duration-300 hover:shadow-[0_1px_2px_rgba(24,24,27,0.06),0_4px_12px_rgba(24,24,27,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${className}`}
    >
      <div className="px-3 pt-3">
        <div className={`relative h-[175px] w-full overflow-hidden rounded-lg bg-weelp-sage-wash sm:h-[185px] lg:h-[200px] ${imageClassName}`}>
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 33vw, (max-width: 1440px) 25vw, 20vw"
            placeholder="blur"
            blurDataURL={IMAGE_BLUR_DATA_URL}
            className="object-cover transition duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100"
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-3 pb-3 pt-3 sm:px-4 sm:pb-4 lg:gap-[5.7px] lg:px-[17px] lg:pb-[17px] lg:pt-[15.6px]">
        {category ? <span className="w-fit rounded-md bg-weelp-sage-deep/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-weelp-copy">{category}</span> : null}
        <BlogPublishedDate date={publishedAt} className="text-xs text-muted-foreground" />
        <h3 className="line-clamp-2 text-[15px] leading-[1.59] text-foreground sm:text-base lg:text-[18px]" style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 600 }}>
          {title}
        </h3>
      </div>
    </LinkComponent>
  );
}

function ProductCompactItemCard({ href, image, title, category, className = '', imageClassName = '', style, LinkComponent = NavigationLink }) {
  const CardRoot = href ? LinkComponent : 'div';
  const cardRootProps = href ? { href } : {};

  return (
    <CardRoot
      {...cardRootProps}
      style={style}
      data-testid="product-compact-item-card"
      className={cn('group/card-link flex h-full flex-col', PRODUCT_CARD_SURFACE_CLASS, PRODUCT_CARD_HOVER_CLASS, PRODUCT_CARD_FOCUS_CLASS, className)}
    >
      <div className={cn('relative h-[175px] w-full shrink-0 overflow-hidden rounded-[16px] bg-weelp-sage-wash sm:h-[185px] lg:h-[200px]', imageClassName)}>
        <Image src={image} alt={title} fill sizes="(max-width: 1024px) 45vw, 20vw" placeholder="blur" blurDataURL={IMAGE_BLUR_DATA_URL} className={PRODUCT_CARD_IMAGE_MOTION_CLASS} />
      </div>
      <div className="flex flex-1 flex-col gap-2 px-2 pb-2 pt-3">
        {category ? <span className="w-fit rounded-md bg-weelp-sage-deep/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-weelp-copy">{category}</span> : null}
        <h3 className="line-clamp-2 text-base font-medium leading-snug tracking-tight text-foreground sm:text-lg">{title}</h3>
      </div>
    </CardRoot>
  );
}

function FullItemCard({
  productId = null,
  itemType = null,
  slug = null,
  citySlug = null,
  hasValidIdentity = false,
  hasRealTitle = false,
  hasRealImage = false,
  href,
  image,
  title,
  category,
  price,
  priceValue = null,
  priceCurrency = null,
  originalPrice = null,
  rating,
  ratingValue = null,
  reviewCount,
  reviewCountValue = null,
  discount,
  availability = null,
  shortDescription = null,
  attributes = [],
  wishlistItem = null,
  cornerAction = null,
  className = '',
  style,
  LinkComponent = NavigationLink,
}) {
  const safeAttributes = Array.isArray(attributes)
    ? attributes.filter((attribute) => attribute && attribute.name && attribute.attribute_value !== undefined && attribute.attribute_value !== null && String(attribute.attribute_value).trim())
    : [];
  const discountLabel = typeof discount === 'string' && discount.trim() ? `-${discount.trim().replace(/^-+\s*/, '')}` : null;
  const hasProductSchema = Boolean(hasValidIdentity && hasRealTitle && hasRealImage && productId !== null && itemType && slug && citySlug && title && image && href);
  const hasSchemaCurrency = typeof priceCurrency === 'string' && SUPPORTED_SCHEMA_CURRENCIES.has(priceCurrency);
  const hasOffer = hasProductSchema && Number.isFinite(priceValue) && priceValue >= 0 && hasSchemaCurrency;
  const hasReviewDisplay =
    Number.isFinite(ratingValue) && ratingValue >= 0 && ratingValue <= 5 && Number.isInteger(reviewCountValue) && reviewCountValue >= 0 && rating !== null && reviewCount !== null;
  const hasAggregateRating = hasProductSchema && Number.isFinite(ratingValue) && ratingValue > 0 && ratingValue <= 5 && Number.isInteger(reviewCountValue) && reviewCountValue > 0;
  const hasAvailability = hasOffer && SUPPORTED_SCHEMA_AVAILABILITY.has(availability);
  const ProductContentRoot = href ? LinkComponent : 'div';
  const productContentProps = href ? { href, itemProp: hasProductSchema ? 'url' : undefined, 'aria-label': `Explore ${title}` } : {};

  return (
    <article
      itemScope={hasProductSchema || undefined}
      itemType={hasProductSchema ? 'https://schema.org/Product' : undefined}
      data-testid="product-item-card"
      className={cn('relative flex flex-col', PRODUCT_CARD_SURFACE_CLASS, PRODUCT_CARD_HOVER_CLASS, FEATURE_CARD_HEIGHT_CLASS, className)}
      style={style}
    >
      {hasProductSchema ? <meta itemProp="name" content={title} /> : null}
      {hasProductSchema ? <meta itemProp="image" content={image} /> : null}
      {hasProductSchema && category ? <meta itemProp="category" content={category} /> : null}

      <ProductContentRoot {...productContentProps} className={cn('group/card-link flex h-full flex-col', PRODUCT_CARD_FOCUS_CLASS)}>
        <SharedCardImage image={image} title={title}>
          {discountLabel ? (
            <span className="absolute left-3 top-3 z-10 inline-flex rounded-full border border-weelp-sage-deep bg-weelp-sage-deep px-3 py-1 text-xs font-semibold text-white dark:border-border dark:bg-[var(--weelp-home-page)]">
              {discountLabel}
            </span>
          ) : null}
        </SharedCardImage>

        <div className="flex flex-1 flex-col px-2 pb-2 pt-3 sm:pt-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-2 text-xl font-medium leading-snug tracking-tight text-foreground">{title}</h3>
            {hasReviewDisplay ? (
              <div
                data-testid="product-item-review"
                itemScope={hasAggregateRating || undefined}
                itemProp={hasAggregateRating ? 'aggregateRating' : undefined}
                itemType={hasAggregateRating ? 'https://schema.org/AggregateRating' : undefined}
                className="flex shrink-0 items-center gap-1 font-semibold text-foreground"
              >
                {hasAggregateRating ? <meta itemProp="bestRating" content="5" /> : null}
                {hasAggregateRating ? <meta itemProp="ratingValue" content={String(ratingValue)} /> : null}
                {hasAggregateRating ? <meta itemProp="reviewCount" content={String(reviewCountValue)} /> : null}
                <span aria-hidden="true" className="text-sm text-amber-500">
                  ★
                </span>
                <span className="text-sm">{rating}</span>
                <span className="text-xs">({reviewCount})</span>
              </div>
            ) : null}
          </div>

          {shortDescription ? <p className="mt-1.5 line-clamp-2 text-sm text-foreground sm:mt-2">{shortDescription}</p> : null}

          {safeAttributes.length ? (
            <div data-testid="product-item-attributes" className="flex items-center py-2 sm:py-3">
              <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-foreground">
                {safeAttributes.map((attribute, index) => {
                  const Icon = getAttributeIcon(attribute.slug);
                  const label = `${attribute.name}: ${attribute.attribute_value}`;
                  return (
                    <li key={`${attribute.slug || attribute.name}-${index}`} data-testid="product-item-attribute" aria-label={label} title={label} className="inline-flex items-center gap-1.5">
                      <Icon aria-hidden="true" className="size-4" strokeWidth={1.75} />
                      <span>{attribute.attribute_value}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          <div className="mt-auto flex items-end justify-between gap-3">
            {price ? (
              hasOffer ? (
                <div itemScope itemProp="offers" itemType="https://schema.org/Offer" className="flex flex-col gap-0.5 text-foreground">
                  <meta itemProp="priceCurrency" content={priceCurrency} />
                  <meta itemProp="price" content={String(priceValue)} />
                  {hasAvailability ? <link itemProp="availability" href={availability} /> : null}
                  <span className="text-[10px] uppercase tracking-wider">From</span>
                  <div className="flex items-baseline gap-1.5">
                    <strong className="text-lg font-semibold tracking-tight">{price}</strong>
                    {originalPrice ? <span className="text-xs line-through">{originalPrice}</span> : null}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-0.5 text-foreground">
                  <span className="text-[10px] uppercase tracking-wider">From</span>
                  <strong className="text-lg font-semibold">{price}</strong>
                </div>
              )
            ) : (
              <div />
            )}

            {href ? (
              <span className="inline-flex h-10 shrink-0 items-center gap-3 rounded-full border border-border bg-background pl-4 pr-1 text-sm font-medium text-foreground shadow-sm">
                Explore
                <span className="grid size-8 place-items-center rounded-full border border-border bg-background text-amber-500 transition-transform duration-300 group-hover/card-link:-rotate-45 motion-reduce:transition-none">
                  <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2.5} />
                </span>
              </span>
            ) : null}
          </div>
        </div>
      </ProductContentRoot>

      {cornerAction || (hasValidIdentity && wishlistItem) ? <div className="absolute right-2.5 top-2.5 z-20">{cornerAction || <ItemCardWishlistButton item={wishlistItem} />}</div> : null}
    </article>
  );
}

export default function ItemCard({ variant = 'full', ...props }) {
  if (variant === 'editorial') {
    return <EditorialItemCard {...props} />;
  }

  if (variant === 'product-compact') {
    return <ProductCompactItemCard {...props} />;
  }

  return variant === 'full' ? <FullItemCard {...props} /> : <CompactItemCard {...props} />;
}
