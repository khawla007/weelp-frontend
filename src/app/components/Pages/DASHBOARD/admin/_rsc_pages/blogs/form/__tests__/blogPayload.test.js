import { normalizeBlogPayload } from '../blogPayload';

describe('normalizeBlogPayload', () => {
  it('normalizes blog form values for Laravel create and update requests', () => {
    const payload = normalizeBlogPayload({
      name: 'Dubai Guide',
      slug: 'dubai-guide',
      content: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Body"}]}]}',
      excerpt: 'Short excerpt',
      publish: true,
      media_gallery: [
        { media_id: 10, url: '/media.jpg', is_featured: true },
        { id: 11, url: '/fallback-id.jpg' },
      ],
      categories: [{ value: 2, label: 'Travel' }],
      tags: [{ value: 3, label: 'Guide' }],
      seo: { meta_title: 'Dubai Guide' },
    });

    expect(payload).toMatchObject({
      name: 'Dubai Guide',
      slug: 'dubai-guide',
      excerpt: 'Short excerpt',
      publish: true,
      media_gallery: [
        { media_id: 10, is_featured: true },
        { media_id: 11, is_featured: false },
      ],
      categories: [2],
      tags: [3],
      seo: { meta_title: 'Dubai Guide' },
    });
  });

  it('falls back to empty arrays when optional collection fields are absent', () => {
    expect(normalizeBlogPayload({ name: 'Draft' })).toMatchObject({
      media_gallery: [],
      categories: [],
      tags: [],
    });
  });
});
