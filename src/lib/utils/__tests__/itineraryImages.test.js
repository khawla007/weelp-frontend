import { getItineraryFeaturedImage, getItineraryGalleryImages, getItineraryDisplayImage } from '../itineraryImages';

describe('itineraryImages', () => {
  describe('getItineraryFeaturedImage', () => {
    it('returns null for null itinerary', () => {
      expect(getItineraryFeaturedImage(null)).toBeNull();
    });

    it('returns featured_image from backend if available', () => {
      const itinerary = {
        featured_image: 'http://example.com/featured.jpg',
        media_gallery: [],
      };
      expect(getItineraryFeaturedImage(itinerary)).toBe('http://example.com/featured.jpg');
    });

    it('returns featured media from media_gallery', () => {
      const itinerary = {
        media_gallery: [{ id: 1, url: 'http://example.com/featured.jpg', is_featured: true }],
      };
      expect(getItineraryFeaturedImage(itinerary)).toBe('http://example.com/featured.jpg');
    });

    it('falls back to first activity image', () => {
      const itinerary = {
        media_gallery: [],
        schedules: [
          {
            activities: [
              {
                featured_image: 'http://example.com/activity.jpg',
              },
            ],
          },
        ],
      };
      expect(getItineraryFeaturedImage(itinerary)).toBe('http://example.com/activity.jpg');
    });

    it('returns null when no images available', () => {
      const itinerary = {
        media_gallery: [],
        schedules: [],
      };
      expect(getItineraryFeaturedImage(itinerary)).toBeNull();
    });
  });

  describe('getItineraryGalleryImages', () => {
    it('returns empty array for null itinerary', () => {
      expect(getItineraryGalleryImages(null)).toEqual([]);
    });

    it('returns gallery_images from backend if available', () => {
      const backendImages = [{ id: 1, url: 'http://example.com/img1.jpg', alt_text: 'Image 1' }];
      const itinerary = { gallery_images: backendImages };
      expect(getItineraryGalleryImages(itinerary)).toEqual(backendImages);
    });

    it('deduplicates images by URL', () => {
      const itinerary = {
        media_gallery: [{ id: 1, url: 'http://example.com/duplicate.jpg' }],
        schedules: [
          {
            activities: [
              {
                featured_image: 'http://example.com/duplicate.jpg',
              },
            ],
          },
        ],
      };
      const result = getItineraryGalleryImages(itinerary);
      expect(result).toHaveLength(1);
      expect(result[0].url).toBe('http://example.com/duplicate.jpg');
    });

    it('combines itinerary and activity images', () => {
      const itinerary = {
        media_gallery: [{ id: 1, url: 'http://example.com/itinerary.jpg', alt_text: 'Itinerary' }],
        schedules: [
          {
            activities: [
              { featured_image: 'http://example.com/activity1.jpg', activity_id: 10 },
              { featured_image: 'http://example.com/activity2.jpg', activity_id: 11 },
            ],
          },
        ],
      };
      const result = getItineraryGalleryImages(itinerary);
      expect(result).toHaveLength(3);
    });
  });

  describe('getItineraryDisplayImage', () => {
    it('returns featured image when available', () => {
      const itinerary = {
        featured_image: 'http://example.com/featured.jpg',
        gallery_images: [],
      };
      expect(getItineraryDisplayImage(itinerary)).toBe('http://example.com/featured.jpg');
    });

    it('falls back to first gallery image', () => {
      const itinerary = {
        featured_image: null,
        gallery_images: [{ id: 1, url: 'http://example.com/gallery.jpg', alt_text: 'Gallery' }],
      };
      expect(getItineraryDisplayImage(itinerary)).toBe('http://example.com/gallery.jpg');
    });

    it('returns null when no images', () => {
      const itinerary = {
        featured_image: null,
        gallery_images: [],
      };
      expect(getItineraryDisplayImage(itinerary)).toBeNull();
    });
  });
});
