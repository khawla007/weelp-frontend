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
  const href = citySlug
    ? `/cities/${citySlug}/${pluralType}/${product.slug}`
    : `/${product.item_type}/${product.slug}`;

  const image =
    product.featured_image ||
    product.media_gallery?.[0]?.media?.url ||
    product.media_gallery?.[0]?.url ||
    product.image ||
    '/assets/Card.png';

  const rawPrice =
    product.pricing?.regular_price ??
    product.base_pricing?.variations?.[0]?.regular_price;
  const currency = product.pricing?.currency;
  const price =
    rawPrice && currency
      ? formatCurrency(parseInt(rawPrice), currency)
      : rawPrice
        ? `$${rawPrice}`
        : '';

  const category =
    product.item_type
      ? product.item_type.charAt(0).toUpperCase() + product.item_type.slice(1)
      : '';

  return {
    id: product.id,
    href,
    image,
    title: product.name || 'Untitled',
    category,
    price,
  };
}

/**
 * Maps a raw blog object to ItemCard compact props.
 * @param {object} blog - Blog object (already transformed in page.js)
 * @returns {{ href: string, image: string, title: string, category: string }}
 */
export function mapBlogToItemCard(blog) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

  let image = blog.image || '/assets/images/home-tour-hero.jpg';
  if (image && !image.startsWith('http') && !image.startsWith('/assets/')) {
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const normalizedPath = image.startsWith('/') ? image : `/${image}`;
    image = `${normalizedBase}${normalizedPath}`;
  }

  return {
    id: blog.id,
    href: `/blogs/${blog.slug}`,
    image,
    title: blog.description || blog.name || 'Untitled',
    category: blog.name || 'Travel',
  };
}
