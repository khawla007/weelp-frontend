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
      hero_overlay_color: '',
      hero_overlay_opacity: '',
      hero_content_vertical_position: '',
      hero_heading_size: '',
      hero_heading_color: '',
      hero_heading_align: '',
      hero_heading_bold: false,
      hero_heading_italic: false,
      hero_heading_underline: false,
      hero_text_size: '',
      hero_text_color: '',
      hero_text_align: '',
      hero_text_bold: false,
      hero_text_italic: false,
      hero_text_underline: false,
      hero_button_radius: '',
      hero_button_border_width: '',
      hero_button_padding: '',
      hero_button_margin: '',
      hero_button_text_color: '',
      hero_button_bg_color: '',
      hero_button_border_color: '',
      hero_button_text_size: '',
      hero_button_align: '',
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

  test('normalizes hero style controls in form payloads', () => {
    expect(
      normalizePageFormPayload({
        title: ' About ',
        slug: ' about ',
        status: 'published',
        hero_overlay_color: ' #000000 ',
        hero_overlay_opacity: '0.5',
        hero_content_vertical_position: ' middle ',
        hero_heading_size: ' 56px ',
        hero_heading_color: ' #ffffff ',
        hero_heading_align: ' center ',
        hero_heading_bold: true,
        hero_heading_italic: false,
        hero_heading_underline: true,
        hero_text_size: ' 20px ',
        hero_text_color: ' #f8fafc ',
        hero_text_align: ' right ',
        hero_text_bold: false,
        hero_text_italic: true,
        hero_text_underline: false,
        hero_button_radius: ' 999px ',
        hero_button_border_width: ' 2px ',
        hero_button_padding: ' 14px 28px ',
        hero_button_margin: ' 24px 0 0 ',
        hero_button_text_color: ' #111827 ',
        hero_button_bg_color: ' #ffffff ',
        hero_button_border_color: ' #ffffff ',
        hero_button_text_size: ' 16px ',
        hero_button_align: ' center ',
      }),
    ).toMatchObject({
      hero_overlay_color: '#000000',
      hero_overlay_opacity: '0.5',
      hero_content_vertical_position: 'middle',
      hero_heading_size: '56px',
      hero_heading_color: '#ffffff',
      hero_heading_align: 'center',
      hero_heading_bold: true,
      hero_heading_italic: false,
      hero_heading_underline: true,
      hero_text_size: '20px',
      hero_text_color: '#f8fafc',
      hero_text_align: 'right',
      hero_text_italic: true,
      hero_button_radius: '999px',
      hero_button_border_width: '2px',
      hero_button_padding: '14px 28px',
      hero_button_margin: '24px 0 0',
      hero_button_text_color: '#111827',
      hero_button_bg_color: '#ffffff',
      hero_button_border_color: '#ffffff',
      hero_button_text_size: '16px',
      hero_button_align: 'center',
    });
  });

  test('preserves numeric decimal overlay opacity from edit payloads', () => {
    expect(
      normalizePageFormPayload({
        title: 'About',
        slug: 'about',
        status: 'published',
        hero_overlay_opacity: 0.5,
      }),
    ).toMatchObject({
      hero_overlay_opacity: '0.5',
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
