import { hasEditorContent } from '../../shared/richTextContent';

const hasItems = (items = []) => Array.isArray(items) && items.length > 0;

export const getBlogReadinessItems = ({ name, slug, content, excerpt, mediaGallery, categories, tags }) => [
  { key: 'title', label: 'Title', complete: Boolean(name?.trim()) },
  { key: 'slug', label: 'Slug', complete: Boolean(slug?.trim()) },
  { key: 'body', label: 'Body content', complete: hasEditorContent(content) },
  { key: 'excerpt', label: 'Excerpt', complete: Boolean(excerpt?.trim()) },
  { key: 'media', label: 'Media', complete: hasItems(mediaGallery) },
  { key: 'category', label: 'Category', complete: hasItems(categories) },
  { key: 'tag', label: 'Tag', complete: hasItems(tags) },
];

export const isBlogCreateReady = (values) => getBlogReadinessItems(values).every((item) => item.complete);
