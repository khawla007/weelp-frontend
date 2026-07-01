import { isBlogCreateReady } from '../BlogHeader';

const filledContent = JSON.stringify({
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Blog body' }] }],
});

describe('isBlogCreateReady', () => {
  it('requires all fields needed for a valid blog create request', () => {
    expect(
      isBlogCreateReady({
        name: 'Editor QA Draft',
        slug: 'editor-qa-draft',
        content: filledContent,
        excerpt: '',
        mediaGallery: [],
        categories: [],
        tags: [],
      }),
    ).toBe(false);

    expect(
      isBlogCreateReady({
        name: 'Editor QA Draft',
        slug: 'editor-qa-draft',
        content: filledContent,
        excerpt: 'Short excerpt',
        mediaGallery: [{ media_id: 1, is_featured: true }],
        categories: [{ value: 1, label: 'Travel' }],
        tags: [{ value: 2, label: 'Guide' }],
      }),
    ).toBe(true);
  });
});
