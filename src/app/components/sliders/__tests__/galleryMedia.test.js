import { normalizeGalleryMedia } from '../galleryMedia';

describe('normalizeGalleryMedia', () => {
  it('keeps valid url and image records with useful fallback alt text', () => {
    expect(
      normalizeGalleryMedia([
        { url: '/one.jpg', alt_text: 'Dubai skyline' },
        { image: '/two.jpg', name: 'Dubai creek' },
      ]),
    ).toEqual([
      { src: '/one.jpg', alt: 'Dubai skyline' },
      { src: '/two.jpg', alt: 'Dubai creek' },
    ]);
  });

  it('removes invalid records and duplicate sources without mutating the input', () => {
    const media = [
      { url: '/one.jpg' },
      { image: ' /one.jpg ', alt_text: 'Duplicate' },
      { url: '' },
      { url: ' ', image: '/fallback.jpg', name: 'Fallback image' },
      { url: 42 },
      { image: { path: '/invalid.jpg' } },
      null,
      { image: '/two.jpg' },
    ];
    const originalMedia = JSON.parse(JSON.stringify(media));

    expect(normalizeGalleryMedia(media)).toEqual([
      { src: '/one.jpg', alt: 'Photo 1' },
      { src: '/fallback.jpg', alt: 'Fallback image' },
      { src: '/two.jpg', alt: 'Photo 3' },
    ]);
    expect(media).toEqual(originalMedia);
  });

  it('returns an empty array for non-array values', () => {
    expect(normalizeGalleryMedia()).toEqual([]);
    expect(normalizeGalleryMedia({ url: '/one.jpg' })).toEqual([]);
  });
});
