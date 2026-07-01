export const normalizeBlogPayload = (data = {}) => ({
  ...data,
  media_gallery: Array.isArray(data.media_gallery)
    ? data.media_gallery.map((media) => ({
        media_id: media.media_id ?? media.id,
        is_featured: media.is_featured ?? false,
      }))
    : [],
  categories: Array.isArray(data.categories) ? data.categories.map((category) => category.value ?? category.id).filter(Boolean) : [],
  tags: Array.isArray(data.tags) ? data.tags.map((tag) => tag.value ?? tag.id).filter(Boolean) : [],
});
