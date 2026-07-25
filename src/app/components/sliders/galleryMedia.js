export const normalizeGalleryMedia = (data) => {
  if (!Array.isArray(data)) return [];

  const seenSources = new Set();

  return data.reduce((images, media) => {
    const src = [media?.url, media?.image].find((value) => typeof value === 'string' && value.trim())?.trim();

    if (!src || seenSources.has(src)) return images;

    seenSources.add(src);
    images.push({
      src,
      alt: media.alt_text || media.alt || media.name || `Photo ${images.length + 1}`,
    });

    return images;
  }, []);
};
