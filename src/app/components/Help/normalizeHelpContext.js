import { normalizeFaqItems } from '../Pages/FRONT_END/singleproduct/TabSection__modules';

const ITEM_ROUTE_SEGMENTS = Object.freeze({
  activity: 'activities',
  package: 'packages',
  itinerary: 'itineraries',
});

const trimString = (value) => (typeof value === 'string' ? value.trim() : '');

export const normalizeHelpContext = ({ productType, productId, productData, citySlug, itemSlug } = {}) => {
  const itemType = trimString(productType);
  const routeSegment = ITEM_ROUTE_SEGMENTS[itemType];
  const itemTitle = trimString(productData?.name);
  const normalizedItemSlug = trimString(itemSlug) || trimString(productData?.slug);
  const normalizedCitySlug = trimString(citySlug);

  if (!routeSegment || !Number.isInteger(productId) || productId <= 0 || !itemTitle || !normalizedItemSlug || !normalizedCitySlug) {
    return null;
  }

  return {
    itemType,
    itemId: productId,
    itemTitle,
    itemSlug: normalizedItemSlug,
    citySlug: normalizedCitySlug,
    pagePath: `/cities/${normalizedCitySlug}/${routeSegment}/${normalizedItemSlug}`,
    faqs: normalizeFaqItems(productData?.faqs),
  };
};
