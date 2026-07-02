export const PAGE_STATUS = {
  draft: 'draft',
  published: 'published',
};

export const PAGE_STATUS_OPTIONS = [
  { name: 'All statuses', value: 'all' },
  { name: 'Published', value: PAGE_STATUS.published },
  { name: 'Draft', value: PAGE_STATUS.draft },
];

export const PAGE_SORT_OPTIONS = [
  { name: 'Latest', value: 'latest' },
  { name: 'Oldest', value: 'oldest' },
  { name: 'Title: A to Z', value: 'title_asc' },
  { name: 'Title: Z to A', value: 'title_desc' },
  { name: 'Published First', value: 'published_first' },
  { name: 'Draft First', value: 'draft_first' },
];

export function getPageStatus(page = {}) {
  if (page.status === PAGE_STATUS.published || page.publish === true || page.published === true || page.is_published === true) {
    return PAGE_STATUS.published;
  }

  return PAGE_STATUS.draft;
}

export function isPublishedPage(page = {}) {
  return getPageStatus(page) === PAGE_STATUS.published;
}

export function normalizePageSummary(page = {}) {
  return {
    id: page.id,
    title: page.title || page.name || 'Untitled page',
    slug: page.slug || '',
    excerpt: page.excerpt || '',
    status: getPageStatus(page),
    updated_at: page.updated_at || page.created_at || null,
  };
}

export function unwrapPageListResponse(payload) {
  const source = payload?.data || payload || {};
  const items = Array.isArray(source) ? source : source.data || source.items || [];

  return {
    data: items.map(normalizePageSummary),
    current_page: source.current_page || source.currentPage || 1,
    per_page: source.per_page || source.perPage || items.length || 10,
    total: source.total || items.length || 0,
  };
}

export function normalizePageFormPayload(data = {}) {
  const status = data.status === PAGE_STATUS.published ? PAGE_STATUS.published : PAGE_STATUS.draft;

  return {
    title: data.title?.trim() || '',
    slug: data.slug?.trim() || '',
    status,
    excerpt: data.excerpt || '',
    content: data.content || '',
    hero_background_image_url: data.hero_background_image_url?.trim() || '',
    hero_heading: data.hero_heading?.trim() || '',
    hero_text: data.hero_text?.trim() || '',
    hero_button_label: data.hero_button_label?.trim() || '',
    hero_button_url: data.hero_button_url?.trim() || '',
    seo: data.seo || {},
  };
}
