import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { RichTextRenderer } from '../RichTextRenderer';

describe('RichTextRenderer', () => {
  it('renders Tiptap JSON content on the server', () => {
    const content = JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Policy page' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Read the ' },
            {
              type: 'text',
              text: 'terms',
              marks: [{ type: 'link', attrs: { href: 'https://example.com/terms' } }],
            },
          ],
        },
        {
          type: 'image',
          attrs: { src: '/storage/media/policy.jpg', alt: 'Policy' },
        },
      ],
    });

    const html = renderToStaticMarkup(<RichTextRenderer content={content} />);

    expect(html).toContain('<h2>Policy page</h2>');
    expect(html).toContain('href="https://example.com/terms"');
    expect(html).toContain('src="/storage/media/policy.jpg"');
    expect(html).toContain('alt="Policy"');
  });

  it('drops unsafe link and image URLs', () => {
    const content = JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Unsafe link',
              marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }],
            },
          ],
        },
        {
          type: 'image',
          attrs: { src: 'javascript:alert(1)', alt: 'Unsafe' },
        },
      ],
    });

    const html = renderToStaticMarkup(<RichTextRenderer content={content} />);

    expect(html).toContain('Unsafe link');
    expect(html).not.toContain('javascript:');
    expect(html).not.toContain('<img');
  });
});
