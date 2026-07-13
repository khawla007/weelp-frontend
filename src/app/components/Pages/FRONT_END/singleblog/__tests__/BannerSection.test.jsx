import { render, screen } from '@testing-library/react';

jest.mock('@/app/components/sliders/GallerySlider', () => ({
  __esModule: true,
  default: () => null,
}));

import BannerSectionBlog from '../BannerSection';

const media = [
  { media_id: 11, url: '/api/media/11', alt: 'First image', is_featured: 0 },
  { media_id: 12, url: '/api/media/12', alt: 'Featured image', is_featured: 1 },
  { media_id: 13, url: '/api/media/13', alt: 'Last image', is_featured: 0 },
];

describe('BannerSectionBlog', () => {
  it('uses the public API name as the responsive page heading', () => {
    render(<BannerSectionBlog name="A published travel story" excerpt="Story summary" />);

    expect(screen.getByRole('heading', { level: 1, name: 'A published travel story' })).toHaveClass('text-3xl', 'sm:text-[52px]');
  });

  it('renders tags as wrapping labels rather than inert controls', () => {
    const { container } = render(
      <BannerSectionBlog
        name="Story"
        tags={[
          { id: 1, name: 'Eco Friendly' },
          { id: 2, name: 'Photography' },
        ]}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Eco Friendly' })).not.toBeInTheDocument();
    expect(screen.getByText('Eco Friendly').parentElement).toHaveClass('flex-wrap');
    expect(container.querySelectorAll('[data-blog-tag]')).toHaveLength(2);
  });

  it('shows every gallery image in featured-first order with stable responsive media wrappers', () => {
    const { container } = render(<BannerSectionBlog name="Story" media_gallery={media} />);

    const images = screen.getAllByRole('img');
    expect(images.map((image) => image.getAttribute('alt'))).toEqual(['Featured image', 'First image', 'Last image']);
    expect(images[0]).toHaveAttribute('sizes', '(max-width: 1023px) 82vw, 320px');
    expect(container.querySelector('[data-blog-gallery]')).toHaveClass('overflow-x-auto', 'max-w-full');
    expect(container.querySelectorAll('[data-blog-gallery-item]')).toHaveLength(3);
    expect(container.querySelector('[data-blog-gallery-item]')).toHaveClass('aspect-[4/3]', 'shrink-0');
  });

  it('ignores media records without usable URLs', () => {
    render(<BannerSectionBlog name="Story" media_gallery={[{ media_id: 1, url: null }, { media_id: 2, url: '' }, media[0]]} />);

    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(screen.getByRole('img')).toHaveAttribute('src', expect.stringContaining('/api/media/11'));
  });

  it('keeps a single desktop hero image wide while retaining the mobile card ratio', () => {
    const { container } = render(<BannerSectionBlog name="Story" media_gallery={[media[0]]} />);

    expect(container.querySelector('[data-blog-gallery-item]')).toHaveClass('lg:w-full', 'lg:max-w-none', 'lg:aspect-[2/1]');
    expect(screen.getByRole('img')).toHaveAttribute('sizes', '(max-width: 1023px) 82vw, 50vw');
  });
});
