import { formatCurrency } from '@/lib/utils';

const ITEM_TYPE_PLURAL = {
  activity: 'activities',
  itinerary: 'itineraries',
  package: 'packages',
  transfer: 'transfers',
};

/**
 * Maps a raw API product object to ItemCard props.
 * @param {object} product - Raw product from API
 * @param {string} [citySlug] - Current city slug for URL building
 * @returns {{ href: string, image: string, title: string, category: string, price: string }}
 */
export function mapProductToItemCard(product, citySlug) {
  const pluralType = ITEM_TYPE_PLURAL[product.item_type] || product.item_type;
  const resolvedCitySlug = citySlug || product.city_slug || product.locations?.[0]?.city_slug;
  const href = resolvedCitySlug ? `/cities/${resolvedCitySlug}/${pluralType}/${product.slug}` : `/${product.item_type}/${product.slug}`;

  // Look for is_featured image in media_gallery first
  const featuredImage = product.media_gallery?.find((m) => m.is_featured === true || m.is_featured === 1);
  const image =
    featuredImage?.url ||
    featuredImage?.media?.url ||
    product.featured_images ||
    product.featured_image ||
    product.media_gallery?.[0]?.media?.url ||
    product.media_gallery?.[0]?.url ||
    product.image ||
    '/assets/Card.webp';

  const rawPrice = product.item_type === 'itinerary'
    ? (product.schedule_total_price ?? null)
    : (product.pricing?.regular_price ?? product.base_pricing?.variations?.[0]?.regular_price ?? null);
  const currency = product.item_type === 'itinerary'
    ? product.schedule_total_currency
    : (product.pricing?.currency ?? product.base_pricing?.currency ?? null);
  const price = rawPrice && currency ? formatCurrency(parseInt(rawPrice), currency) : rawPrice ? `$${rawPrice}` : '';

  const category = product.item_type ? product.item_type.charAt(0).toUpperCase() + product.item_type.slice(1) : '';

  const rating = product.average_rating ? `${product.average_rating}` : null;

  const reviewCount = product.reviews_count ? `${product.reviews_count >= 1000 ? `${(product.reviews_count / 1000).toFixed(1)}K` : product.reviews_count}` : null;

  const discount = product.discount_percentage ? `${product.discount_percentage}% OFF` : null;

  let originalPrice = null;
  if (product.discount_percentage && rawPrice) {
    const originalRaw = Math.round(parseInt(rawPrice) / (1 - product.discount_percentage / 100));
    originalPrice = rawPrice && currency ? formatCurrency(originalRaw, currency) : `$${originalRaw}`;
  }

  return {
    id: product.id,
    href,
    image,
    title: product.name || 'Untitled',
    category,
    price,
    originalPrice,
    rating,
    reviewCount,
    discount,
  };
}

/**
 * Maps a raw blog object to ItemCard compact props.
 * @param {object} blog - Blog object (already transformed in page.js)
 * @returns {{ href: string, image: string, title: string, category: string }}
 */
export function mapBlogToItemCard(blog) {
  const featured = blog.media_gallery?.find((m) => m.is_featured === 1 || m.is_featured === true);
  const image = featured?.url || blog.media_gallery?.[0]?.url || blog.image || '/assets/images/home-tour-hero.jpg';

  const category = blog.categories?.[0]?.category_name || blog.name || 'Travel';

  return {
    id: blog.id,
    href: `/blogs/${blog.slug}`,
    image,
    title: blog.excerpt || blog.name || 'Untitled',
    category,
  };
}
