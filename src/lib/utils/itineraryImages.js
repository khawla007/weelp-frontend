/**
 * Get the featured image URL for an itinerary with fallback logic
 * Priority: itinerary featured → first activity → first transfer → null
 *
 * @param {object} itinerary - Itinerary object
 * @returns {string|null} Featured image URL or null
 */
export function getItineraryFeaturedImage(itinerary) {
  if (!itinerary) return null;

  // 1. Itinerary featured image (use backend computed value if available)
  if (itinerary.featured_image) {
    return itinerary.featured_image;
  }

  // 2. Fallback to media_gallery featured
  const featured = itinerary.media_gallery?.find(m => m.is_featured);
  if (featured?.url) return featured.url;

  // 3. First activity's first image
  const firstActivity = itinerary.schedules?.[0]?.activities?.[0];
  if (firstActivity?.featured_image) return firstActivity.featured_image;

  // 4. First transfer (if transfers have images - need to check data structure)
  const firstTransfer = itinerary.schedules?.[0]?.transfers?.[0];
  // Note: Transfers may not have images in current response structure
  // This can be enhanced later if transfers include images

  return null;
}

/**
 * Get all gallery images for an itinerary with fallback and deduplication
 * Priority: itinerary → all activities → all transfers
 *
 * @param {object} itinerary - Itinerary object
 * @returns {array} Array of image objects with id, url, alt_text
 */
export function getItineraryGalleryImages(itinerary) {
  if (!itinerary) return [];

  // Use backend computed value if available
  if (itinerary.gallery_images && itinerary.gallery_images.length > 0) {
    return itinerary.gallery_images;
  }

  const images = new Map();
  const addImage = (img) => {
    if (!img?.url) return;
    if (!images.has(img.url)) {
      images.set(img.url, {
        id: img.id,
        url: img.url,
        alt_text: img.alt_text || img.alt || '',
      });
    }
  };

  // 1. Itinerary images
  itinerary.media_gallery?.forEach(m => addImage(m));

  // 2. Activity images
  itinerary.schedules?.forEach(schedule => {
    schedule.activities?.forEach(activity => {
      if (activity.featured_image) {
        addImage({ url: activity.featured_image, id: activity.activity_id });
      }
    });
  });

  // 3. Transfer images (if available)
  itinerary.schedules?.forEach(schedule => {
    schedule.transfers?.forEach(transfer => {
      // Add transfer images if available in data structure
    });
  });

  return Array.from(images.values());
}

/**
 * Get a display image for cards/lists (uses featured or first gallery image)
 *
 * @param {object} itinerary - Itinerary object
 * @returns {string|null} Image URL or null
 */
export function getItineraryDisplayImage(itinerary) {
  const featured = getItineraryFeaturedImage(itinerary);
  if (featured) return featured;

  const gallery = getItineraryGalleryImages(itinerary);
  return gallery.length > 0 ? gallery[0].url : null;
}
