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
  const textField = (field) => {
    const value = data[field];
    if (value === null || value === undefined) return '';
    return String(value).trim();
  };
  const boolField = (field) => Boolean(data[field]);

  return {
    title: textField('title'),
    slug: textField('slug'),
    status,
    excerpt: data.excerpt || '',
    content: data.content || '',
    hero_background_image_url: textField('hero_background_image_url'),
    hero_heading: textField('hero_heading'),
    hero_text: textField('hero_text'),
    hero_button_label: textField('hero_button_label'),
    hero_button_url: textField('hero_button_url'),
    hero_overlay_color: textField('hero_overlay_color'),
    hero_overlay_opacity: textField('hero_overlay_opacity'),
    hero_content_vertical_position: textField('hero_content_vertical_position'),
    hero_heading_size: textField('hero_heading_size'),
    hero_heading_color: textField('hero_heading_color'),
    hero_heading_align: textField('hero_heading_align'),
    hero_heading_bold: boolField('hero_heading_bold'),
    hero_heading_italic: boolField('hero_heading_italic'),
    hero_heading_underline: boolField('hero_heading_underline'),
    hero_text_size: textField('hero_text_size'),
    hero_text_color: textField('hero_text_color'),
    hero_text_align: textField('hero_text_align'),
    hero_text_bold: boolField('hero_text_bold'),
    hero_text_italic: boolField('hero_text_italic'),
    hero_text_underline: boolField('hero_text_underline'),
    hero_button_radius: textField('hero_button_radius'),
    hero_button_border_width: textField('hero_button_border_width'),
    hero_button_padding: textField('hero_button_padding'),
    hero_button_margin: textField('hero_button_margin'),
    hero_button_text_color: textField('hero_button_text_color'),
    hero_button_bg_color: textField('hero_button_bg_color'),
    hero_button_border_color: textField('hero_button_border_color'),
    hero_button_text_size: textField('hero_button_text_size'),
    hero_button_align: textField('hero_button_align'),
    seo: data.seo || {},
  };
}
