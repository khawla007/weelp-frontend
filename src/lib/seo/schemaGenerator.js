const ORGANIZATION_NAME = 'Weelp';
const DEFAULT_CONTEXT = 'https://schema.org';
const DEFAULT_CURRENCY = 'USD';

const recommendedTypes = {
  activity: 'Product',
  blog: 'BlogPosting',
  itinerary: 'TouristTrip',
  transfer: 'Service',
};

const cleanString = (value) => {
  if (value === null || value === undefined) return undefined;
  const text = String(value).trim();
  return text || undefined;
};

const cleanNumberString = (value) => {
  if (value === null || value === undefined || value === '') return undefined;
  const text = String(value).trim();
  return text || undefined;
};

const stripHtml = (value) =>
  cleanString(value)
    ?.replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const joinParts = (parts = []) => parts.map(stripHtml).filter(Boolean).join(' ');

const absoluteUrl = (url, siteUrl) => {
  const cleanedUrl = cleanString(url);
  if (!cleanedUrl) return undefined;
  if (/^https?:\/\//i.test(cleanedUrl)) return cleanedUrl;

  const cleanedSiteUrl = cleanString(siteUrl);
  if (!cleanedSiteUrl) return cleanedUrl;

  return `${cleanedSiteUrl.replace(/\/$/, '')}/${cleanedUrl.replace(/^\//, '')}`;
};

const compact = (value) => {
  if (Array.isArray(value)) {
    const items = value.map(compact).filter((item) => {
      if (item === undefined || item === null || item === '') return false;
      if (Array.isArray(item)) return item.length > 0;
      if (typeof item === 'object') return Object.keys(item).length > 0;
      return true;
    });

    return items.length ? items : undefined;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value)
      .map(([key, itemValue]) => [key, compact(itemValue)])
      .filter(([, itemValue]) => {
        if (itemValue === undefined || itemValue === null || itemValue === '') return false;
        if (Array.isArray(itemValue)) return itemValue.length > 0;
        if (typeof itemValue === 'object') return Object.keys(itemValue).length > 0;
        return true;
      });

    return entries.length ? Object.fromEntries(entries) : undefined;
  }

  return value;
};

const getImages = (values = {}, siteUrl) => {
  const gallery = Array.isArray(values.media_gallery) ? values.media_gallery : [];
  const sorted = [...gallery].sort((a, b) => Number(Boolean(b?.is_featured)) - Number(Boolean(a?.is_featured)));
  const images = sorted.map((media) => absoluteUrl(media?.url || media?.preview_url || media?.original_url || media?.path, siteUrl)).filter(Boolean);

  return [...new Set(images)];
};

const getInclusionText = (values = {}) => {
  const inclusions = Array.isArray(values.inclusions_exclusions) ? values.inclusions_exclusions : [];
  const includedItems = inclusions
    .filter((item) => item?.included !== false)
    .map((item) => joinParts([item?.title, item?.description]))
    .filter(Boolean);

  return joinParts([values.whats_included, values.what_included, values.what_is_included, values.included, values.inclusions, values.inclusion, includedItems.join(' ')]);
};

const getInformationText = (values = {}) => {
  const information = Array.isArray(values.information) ? values.information : [];
  return joinParts(information.map((item) => joinParts([item?.section_title, item?.content])));
};

const getScheduleText = (values = {}) => {
  const schedules = Array.isArray(values.schedules) ? values.schedules : [];
  return joinParts(
    schedules.map((schedule) =>
      joinParts([
        schedule?.title,
        Array.isArray(schedule?.activities) ? schedule.activities.map((activity) => joinParts([activity?.name, activity?.notes])).join(' ') : '',
        Array.isArray(schedule?.transfers) ? schedule.transfers.map((transfer) => joinParts([transfer?.name, transfer?.pickup_location, transfer?.dropoff_location])).join(' ') : '',
      ]),
    ),
  );
};

const getDescription = (values = {}) => {
  const candidates = [
    values.seo?.meta_description,
    values.overview,
    values.description,
    values.short_description,
    values.excerpt,
    values.content,
    getInformationText(values),
    getInclusionText(values),
    getScheduleText(values),
  ]
    .map(stripHtml)
    .filter(Boolean);

  if (!candidates.length) return undefined;

  return candidates.sort((a, b) => b.length - a.length)[0];
};

const getCanonical = (values = {}, siteUrl) => absoluteUrl(values.seo?.canonical_url, siteUrl);

const organization = () => ({
  '@type': 'Organization',
  name: ORGANIZATION_NAME,
});

const offer = ({ price, currency, availability } = {}) => {
  const cleanPrice = cleanNumberString(price);
  if (!cleanPrice) return undefined;

  return compact({
    '@type': 'Offer',
    price: cleanPrice,
    priceCurrency: cleanString(currency) || DEFAULT_CURRENCY,
    availability,
  });
};

const aggregateRating = (summary = {}) => {
  const ratingValue = cleanNumberString(summary.average_rating ?? summary.rating_average ?? summary.ratingValue);
  const reviewCount = cleanNumberString(summary.total_reviews ?? summary.review_count ?? summary.reviewCount);

  if (!ratingValue || !reviewCount) return undefined;

  return {
    '@type': 'AggregateRating',
    ratingValue,
    reviewCount,
  };
};

const getFaqQuestion = (faq = {}) => cleanString(faq.question || faq.title || faq.name);
const getFaqAnswer = (faq = {}) => stripHtml(faq.answer || faq.content || faq.text || faq.description);

const faqPage = (faqs = []) => {
  if (!Array.isArray(faqs)) return undefined;

  const mainEntity = faqs
    .map((faq) =>
      compact({
        '@type': 'Question',
        name: getFaqQuestion(faq),
        acceptedAnswer: {
          '@type': 'Answer',
          text: getFaqAnswer(faq),
        },
      }),
    )
    .filter(Boolean);

  if (!mainEntity.length) return undefined;

  return {
    '@type': 'FAQPage',
    mainEntity,
  };
};

const reviewSchemas = (reviews = []) => {
  if (!Array.isArray(reviews)) return undefined;

  return reviews
    .map((review) =>
      compact({
        '@type': 'Review',
        reviewRating: cleanNumberString(review.rating)
          ? {
              '@type': 'Rating',
              ratingValue: cleanNumberString(review.rating),
            }
          : undefined,
        author: cleanString(review.author || review.user_name || review.name)
          ? {
              '@type': 'Person',
              name: cleanString(review.author || review.user_name || review.name),
            }
          : undefined,
        reviewBody: stripHtml(review.review_text || review.comment || review.body || review.text),
        datePublished: cleanString(review.created_at || review.date),
      }),
    )
    .filter(Boolean);
};

const graphSchema = (mainEntity, values = {}) => {
  const faqs = faqPage(values.faqs);
  const graph = [mainEntity, faqs].filter(Boolean);

  if (graph.length <= 1) {
    return compact({
      '@context': DEFAULT_CONTEXT,
      ...mainEntity,
    });
  }

  return compact({
    '@context': DEFAULT_CONTEXT,
    '@graph': graph,
  });
};

const locationName = (location = {}) =>
  cleanString(location.name) ||
  cleanString(location.city) ||
  cleanString(location.city_name) ||
  cleanString(location.location_label) ||
  cleanString(location.route_name) ||
  cleanString(location.label);

const generateBlogSchema = ({ schemaType, values, siteUrl }) =>
  compact({
    '@context': DEFAULT_CONTEXT,
    '@type': schemaType || recommendedTypes.blog,
    headline: cleanString(values.name || values.title),
    description: getDescription(values),
    image: getImages(values, siteUrl),
    author: organization(),
    publisher: organization(),
    datePublished: cleanString(values.created_at || values.published_at),
    dateModified: cleanString(values.updated_at),
    mainEntityOfPage: getCanonical(values, siteUrl)
      ? {
          '@type': 'WebPage',
          '@id': getCanonical(values, siteUrl),
        }
      : undefined,
  });

const generateActivitySchema = ({ schemaType, values, siteUrl }) =>
  graphSchema(
    compact({
      '@type': schemaType || recommendedTypes.activity,
      name: cleanString(values.name),
      description: getDescription(values),
      image: getImages(values, siteUrl),
      offers: offer({
        price: values.pricing?.regular_price ?? values.regular_price,
        currency: values.pricing?.currency ?? values.currency,
        availability: 'https://schema.org/InStock',
      }),
      aggregateRating: aggregateRating(values.review_summary),
      review: reviewSchemas(values.reviews),
    }),
    values,
  );

const generateTransferSchema = ({ schemaType, values }) =>
  compact({
    '@context': DEFAULT_CONTEXT,
    '@type': schemaType || recommendedTypes.transfer,
    name: cleanString(values.name),
    description: getDescription(values),
    serviceType: cleanString(values.transfer_type),
    provider: organization(),
    offers: offer({
      price: values.transfer_price ?? values.pricing_availability?.transfer_price,
      currency: values.currency ?? values.pricing_availability?.currency,
    }),
    areaServed: locationName(values.route || values.transfer_route || values.vendor_routes || {})
      ? {
          '@type': 'Place',
          name: locationName(values.route || values.transfer_route || values.vendor_routes || {}),
        }
      : undefined,
  });

const generateItinerarySchema = ({ schemaType, values, siteUrl }) =>
  graphSchema(
    compact({
      '@type': schemaType || recommendedTypes.itinerary,
      name: cleanString(values.name),
      description: getDescription(values),
      image: getImages(values, siteUrl),
      itinerary: Array.isArray(values.locations)
        ? values.locations.map((location) =>
            compact({
              '@type': 'Place',
              name: locationName(location),
              description: cleanString(location.description || location.location_label),
            }),
          )
        : undefined,
      offers: offer({
        price: values.pricing?.regular_price ?? values.regular_price,
        currency: values.pricing?.currency ?? values.currency,
      }),
      aggregateRating: aggregateRating(values.review_summary),
      review: reviewSchemas(values.reviews),
    }),
    values,
  );

export const getRecommendedSchemaType = (itemType) => recommendedTypes[itemType] || 'Thing';

export const generateSchema = ({ itemType, schemaType, values = {}, siteUrl } = {}) => {
  const selectedType = cleanString(schemaType) || getRecommendedSchemaType(itemType);

  if (itemType === 'blog') {
    return generateBlogSchema({ schemaType: selectedType, values, siteUrl });
  }

  if (itemType === 'activity') {
    return generateActivitySchema({ schemaType: selectedType, values, siteUrl });
  }

  if (itemType === 'transfer') {
    return generateTransferSchema({ schemaType: selectedType, values, siteUrl });
  }

  if (itemType === 'itinerary') {
    return generateItinerarySchema({ schemaType: selectedType, values, siteUrl });
  }

  return compact({
    '@context': DEFAULT_CONTEXT,
    '@type': selectedType,
    name: cleanString(values.name || values.title),
    description: getDescription(values),
    image: getImages(values, siteUrl),
  });
};
