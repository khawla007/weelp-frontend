import { getBlogReadinessItems, isBlogCreateReady } from '../blogReadiness';

const filledContent = JSON.stringify({
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Useful editor content.' }],
    },
  ],
});

describe('blogReadiness', () => {
  it('returns checklist items for each publish dependency', () => {
    const items = getBlogReadinessItems({
      name: 'Editor improvements',
      slug: 'editor-improvements',
      content: filledContent,
      excerpt: '',
      mediaGallery: [{ media_id: 1 }],
      categories: [{ value: 2 }],
      tags: [],
    });

    expect(items).toEqual([
      { key: 'title', label: 'Title', complete: true },
      { key: 'slug', label: 'Slug', complete: true },
      { key: 'body', label: 'Body content', complete: true },
      { key: 'excerpt', label: 'Excerpt', complete: false },
      { key: 'media', label: 'Media', complete: true },
      { key: 'category', label: 'Category', complete: true },
      { key: 'tag', label: 'Tag', complete: false },
    ]);
  });

  it('requires every checklist item before create is ready', () => {
    expect(
      isBlogCreateReady({
        name: 'Editor improvements',
        slug: 'editor-improvements',
        content: filledContent,
        excerpt: '',
        mediaGallery: [{ media_id: 1 }],
        categories: [{ value: 2 }],
        tags: [{ value: 3 }],
      }),
    ).toBe(false);

    expect(
      isBlogCreateReady({
        name: 'Editor improvements',
        slug: 'editor-improvements',
        content: filledContent,
        excerpt: 'Short excerpt',
        mediaGallery: [{ media_id: 1 }],
        categories: [{ value: 2 }],
        tags: [{ value: 3 }],
      }),
    ).toBe(true);
  });
});
