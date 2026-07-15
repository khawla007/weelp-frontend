import { render, screen } from '@testing-library/react';

jest.mock('@/app/components/Navigation/NavigationLink', () => ({
  __esModule: true,
  default: ({ href, children }) => (
    <a href={href} data-navigation-link>
      {children}
    </a>
  ),
}));

import { RichTextRenderer } from '../RichTextRenderer';

const content = JSON.stringify({
  type: 'doc',
  content: [
    { type: 'paragraph', content: [{ type: 'text', text: 'https://example.com/averyveryveryveryveryveryveryverylongpath' }] },
    { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'List item' }] }] }] },
    { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Quotation' }] }] },
    { type: 'image', attrs: { src: '/image.jpg', alt: 'Inline media' } },
    { type: 'video', attrs: { src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', title: 'Fixture video' } },
    { type: 'iframe', attrs: { src: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', title: 'Fixture iframe' } },
    { type: 'table', content: [{ type: 'tableRow', content: [{ type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Table cell' }] }] }] }] },
    { type: 'codeBlock', content: [{ type: 'text', text: 'averyveryveryveryveryveryveryverylongcodevalue' }] },
  ],
});

describe('RichTextRenderer public mode', () => {
  it('opts public content into wrapping without masking intentional table and code overflow', () => {
    const { container } = render(<RichTextRenderer content={content} className="public-rich-text" />);

    expect(container.firstElementChild).toHaveClass('public-rich-text');
    expect(screen.getByRole('img', { name: 'Inline media' })).toBeInTheDocument();
    expect(container.querySelector('video')).toHaveClass('rich-text-editor-media');
    expect(container.querySelector('.rich-text-editor-embed iframe')).toHaveAttribute('title', 'Fixture iframe');
    expect(container.querySelector('.rich-text-editor-table-wrap')).toBeInTheDocument();
    expect(container.querySelector('pre')).toBeInTheDocument();
  });

  it('uses NavigationLink for internal links and ordinary anchors for external URLs', () => {
    const links = JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Internal', marks: [{ type: 'link', attrs: { href: '/blogs/story' } }] },
            { type: 'text', text: 'External', marks: [{ type: 'link', attrs: { href: 'https://example.com' } }] },
          ],
        },
      ],
    });

    const { container } = render(<RichTextRenderer content={links} className="public-rich-text" />);

    expect(container.querySelector('a[href="/blogs/story"]')).toHaveAttribute('data-navigation-link');
    expect(container.querySelector('a[href="https://example.com"]')).not.toHaveAttribute('data-navigation-link');
  });
});
