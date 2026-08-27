import { formatCurrency } from '@/lib/utils';

const ITEM_TYPE_PLURAL = {
  activity: 'activities',
  itinerary: 'itineraries',
  package: 'packages',
  transfer: 'transfers',
};

const SCHEMA_AVAILABILITY = {
  in_stock: 'https://schema.org/InStock',
  instock: 'https://schema.org/InStock',
  out_of_stock: 'https://schema.org/OutOfStock',
  outofstock: 'https://schema.org/OutOfStock',
  preorder: 'https://schema.org/PreOrder',
  pre_order: 'https://schema.org/PreOrder',
};

const SUPPORTED_ITEM_TYPES = new Set(Object.keys(ITEM_TYPE_PLURAL));
const SUPPORTED_AVAILABILITY = new Set(Object.values(SCHEMA_AVAILABILITY));
const SUPPORTED_CURRENCIES = typeof Intl.supportedValuesOf === 'function' ? new Set(Intl.supportedValuesOf('currency')) : new Set();

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const normalizeText = (value) => (typeof value === 'string' && value.trim() ? value.trim() : null);

const normalizeCurrency = (value) => {
  const currency = normalizeText(value)?.toUpperCase() ?? null;
  if (!currency || !/^[A-Z]{3}$/.test(currency) || !SUPPORTED_CURRENCIES.has(currency)) return null;

  try {
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(0);
    return currency;
  } catch {
    return null;
  }
};

const safeFormatCurrency = (amount, currency) => {
  if (amount === null || !currency) return '';

  try {
    return formatCurrency(amount, currency);
  } catch {
    return '';
  }
};

const normalizeAvailability = (value) => {
  const normalized = normalizeText(value);
  if (!normalized) return null;
  if (SUPPORTED_AVAILABILITY.has(normalized)) return normalized;
  return SCHEMA_AVAILABILITY[normalized.toLowerCase().replaceAll(' ', '_')] ?? null;
};

const isValidAttribute = (attribute) =>
  Boolean(
    attribute &&
    typeof attribute === 'object' &&
    normalizeText(attribute.name) &&
    attribute.attribute_value !== undefined &&
    attribute.attribute_value !== null &&
    String(attribute.attribute_value).trim(),
  );

const formatRating = (value) => {
  const number = toNumber(value);
  if (number === null || number < 0) return null;
  return Number.isInteger(number) ? `${number}` : number.toFixed(1);
};

const formatReviewCount = (value) => {
  const number = toNumber(value);
  if (number === null || number < 0) return null;
  return `${number >= 1000 ? `${(number / 1000).toFixed(1)}K` : number}`;
};

/**
 * Maps a raw API product object to ItemCard props.
 * @param {object} product - Raw product from API
 * @param {string} [citySlug] - Current city slug for URL building
 * @returns {{ href: string, image: string, title: string, category: string, price: string }}
 */
export function mapProductToItemCard(product = {}, citySlug) {
  const itemType = normalizeText(product.item_type)?.toLowerCase() ?? null;
  const productId = product.id ?? null;
  const slug = normalizeText(product.slug);
  const realTitle = normalizeText(product.name);
  const resolvedCitySlug = normalizeText(citySlug) || normalizeText(product.city_slug) || normalizeText(product.locations?.[0]?.city_slug);
  const hasValidIdentity = Boolean(SUPPORTED_ITEM_TYPES.has(itemType) && productId !== null && productId !== '' && slug && resolvedCitySlug);
  const href = hasValidIdentity ? `/cities/${resolvedCitySlug}/${ITEM_TYPE_PLURAL[itemType]}/${slug}` : null;

  // Look for is_featured image in media_gallery first
  const mediaGallery = Array.isArray(product.media_gallery) ? product.media_gallery : [];
  const featuredImage = mediaGallery.find((media) => media?.is_featured === true || media?.is_featured === 1);
  const image =
    featuredImage?.url || featuredImage?.media?.url || product.featured_images || product.featured_image || mediaGallery[0]?.media?.url || mediaGallery[0]?.url || product.image || '/assets/Card.webp';

  let rawPrice;
  let rawCurrency;
  if (itemType === 'transfer') {
    rawPrice = product.route_price ?? null;
    rawCurrency = product.route_currency;
  } else {
    rawPrice =
      product.listing_price ?? (itemType === 'itinerary' ? (product.schedule_total_price ?? null) : (product.pricing?.regular_price ?? product.base_pricing?.variations?.[0]?.regular_price ?? null));
    rawCurrency = itemType === 'itinerary' ? product.schedule_total_currency : (product.pricing?.currency ?? product.base_pricing?.currency);
  }

  const parsedPrice = toNumber(rawPrice);
  const priceValue = parsedPrice !== null && parsedPrice >= 0 ? parsedPrice : null;
  const normalizedCurrency = normalizeCurrency(rawCurrency);
  const priceCurrency = priceValue !== null ? normalizedCurrency : null;
  const price = priceValue !== null && priceCurrency ? safeFormatCurrency(priceValue, priceCurrency) : '';

  const category = normalizeText(product.categories?.[0]?.name) || normalizeText(product.categories?.[0]?.category_name) || (itemType ? itemType.charAt(0).toUpperCase() + itemType.slice(1) : '');

  const parsedRating = toNumber(product.average_rating ?? product.rating_average ?? product.review_summary?.average_rating ?? product.reviewSummary?.averageRating);
  const ratingValue = parsedRating !== null && parsedRating >= 0 && parsedRating <= 5 ? parsedRating : null;
  const rating = formatRating(ratingValue);

  const parsedReviewCount = toNumber(product.reviews_count ?? product.review_count ?? product.review_summary?.total_reviews ?? product.reviewSummary?.totalReviews);
  const reviewCountValue = parsedReviewCount !== null && Number.isInteger(parsedReviewCount) && parsedReviewCount >= 0 ? parsedReviewCount : null;
  const reviewCount = formatReviewCount(reviewCountValue);

  const parsedDiscount = toNumber(product.discount_percentage);
  const discountPercentage = parsedDiscount !== null && parsedDiscount > 0 && parsedDiscount < 100 ? parsedDiscount : null;
  const discount = discountPercentage ? `${discountPercentage}% OFF` : null;

  let originalPrice = null;
  if (discountPercentage && priceValue !== null && priceCurrency) {
    const originalPriceValue = Math.round(priceValue / (1 - discountPercentage / 100));
    originalPrice = safeFormatCurrency(originalPriceValue, priceCurrency) || null;
  }

  const hasRealImage = image !== '/assets/Card.webp';
  const wishlistItem = hasValidIdentity
    ? {
        item_type: itemType,
        item_id: productId,
        title: realTitle,
        slug,
        city_slug: resolvedCitySlug,
        image_url: image,
        price: priceValue,
        currency: priceCurrency,
      }
    : null;

  return {
    id: productId,
    productId,
    itemType,
    slug,
    citySlug: resolvedCitySlug,
    hasValidIdentity,
    href,
    image,
    hasRealImage,
    title: realTitle || 'Untitled',
    hasRealTitle: Boolean(realTitle),
    category,
    price,
    priceValue,
    priceCurrency,
    originalPrice,
    rating,
    ratingValue,
    reviewCount,
    reviewCountValue,
    discount,
    availability: normalizeAvailability(product.availability ?? product.stock_status),
    shortDescription: product.short_description ?? null,
    attributes: Array.isArray(product.attributes) ? product.attributes.filter(isValidAttribute).slice(0, 3) : [],
    wishlistItem,
  };
}

/**
 * Maps a raw blog object to the editorial ItemCard contract.
 * @param {object} blog - Raw or legacy-normalized blog object
 * @returns {{ id: unknown, href: string|null, image: string, title: string, category: string|null }}
 */
export function mapBlogToItemCard(blog = {}) {
  const mediaGallery = Array.isArray(blog.media_gallery) ? blog.media_gallery : [];
  const featured = mediaGallery.find((media) => media?.is_featured === 1 || media?.is_featured === true);
  const image = featured?.url || featured?.media?.url || mediaGallery[0]?.url || mediaGallery[0]?.media?.url || blog.image || '/assets/images/home-tour-hero.jpg';
  const slug = normalizeText(blog.slug);
  const category =
    normalizeText(blog.categories?.[0]?.category_name) ||
    normalizeText(blog.categories?.[0]?.name) ||
    normalizeText(blog.category?.category_name) ||
    normalizeText(blog.category?.name) ||
    normalizeText(blog.category);

  return {
    id: blog.id,
    href: slug ? `/blogs/${slug}` : null,
    image,
    title: normalizeText(blog.name) || 'Untitled',
    category,
  };
}

export function mapCreatorItineraryToItemCard(itinerary = {}) {
  const creatorName = normalizeText(itinerary.creator?.name);
  const attributes = [];
  const views = toNumber(itinerary.views_count);
  const likes = toNumber(itinerary.likes_count);

  if (Number.isInteger(views) && views >= 0) attributes.push({ slug: 'views', name: 'Views', attribute_value: String(views) });
  if (Number.isInteger(likes) && likes >= 0) attributes.push({ slug: 'likes', name: 'Likes', attribute_value: String(likes) });

  return mapProductToItemCard({
    ...itinerary,
    item_type: 'itinerary',
    city_slug: itinerary.locations?.[0]?.city?.slug,
    schedule_total_price: itinerary.display_price,
    schedule_total_currency: itinerary.display_currency,
    short_description: creatorName ? `By ${creatorName}` : null,
    categories: Array.isArray(itinerary.categories) && itinerary.categories.length ? itinerary.categories : [{ name: 'Itinerary' }],
    attributes,
  });
}
