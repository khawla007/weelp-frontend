import { getPageStatus, normalizePageFormPayload, normalizePageSummary, unwrapPageListResponse } from '../normalizers';

describe('CMS page normalizers', () => {
  test('normalizes legacy publish booleans to published status', () => {
    expect(getPageStatus({ publish: true })).toBe('published');
    expect(getPageStatus({ is_published: true })).toBe('published');
    expect(getPageStatus({ status: 'draft' })).toBe('draft');
  });

  test('normalizes list payloads from common pagination wrappers', () => {
    const result = unwrapPageListResponse({
      data: {
        data: [{ id: 1, name: 'About', slug: 'about', publish: true }],
        current_page: 2,
        per_page: 15,
        total: 31,
      },
    });

    expect(result).toEqual({
      data: [{ id: 1, title: 'About', slug: 'about', excerpt: '', status: 'published', updated_at: null }],
      current_page: 2,
      per_page: 15,
      total: 31,
    });
  });

  test('trims form title and slug while preserving seo data', () => {
    expect(normalizePageFormPayload({ title: ' About ', slug: ' about ', status: 'published', seo: { meta_title: 'About' } })).toEqual({
      title: 'About',
      slug: 'about',
      status: 'published',
      excerpt: '',
      content: '',
      hero_background_image_url: '',
      hero_heading: '',
      hero_text: '',
      hero_button_label: '',
      hero_button_url: '',
      seo: { meta_title: 'About' },
    });
  });

  test('trims hero fields in form payloads', () => {
    expect(
      normalizePageFormPayload({
        title: ' About ',
        slug: ' about ',
        status: 'published',
        content: '{}',
        excerpt: 'Summary',
        hero_background_image_url: ' /storage/hero.jpg ',
        hero_heading: ' Hero ',
        hero_text: ' Hero text ',
        hero_button_label: ' Start ',
        hero_button_url: ' /start ',
      }),
    ).toMatchObject({
      hero_background_image_url: '/storage/hero.jpg',
      hero_heading: 'Hero',
      hero_text: 'Hero text',
      hero_button_label: 'Start',
      hero_button_url: '/start',
    });
  });

  test('uses safe defaults for incomplete summaries', () => {
    expect(normalizePageSummary({ id: 7 })).toMatchObject({
      id: 7,
      title: 'Untitled page',
      slug: '',
      status: 'draft',
    });
  });
});
