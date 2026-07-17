import { render, screen } from '@testing-library/react';

const gallerySliderMock = jest.fn(() => <div data-testid="gallery-slider" />);

jest.mock('@/app/components/sliders/GallerySlider', () => ({
  __esModule: true,
  default: (props) => gallerySliderMock(props),
}));

jest.mock('@/app/components/BreadCrumb', () => ({
  __esModule: true,
  default: ({ className = '' }) => <nav className={className}>Breadcrumb</nav>,
}));

import BannerSectionBlog from '../BannerSection';

const media = [
  { media_id: 11, url: '/api/media/11', alt: 'First image', is_featured: 0 },
  { media_id: 12, url: '/api/media/12', alt: 'Featured image', is_featured: 1 },
  { media_id: 13, url: '/api/media/13', alt: 'Last image', is_featured: 0 },
];

describe('BannerSectionBlog', () => {
  beforeEach(() => {
    gallerySliderMock.mockClear();
  });

  it('uses the public API name as the responsive page heading', () => {
    render(<BannerSectionBlog name="A published travel story" excerpt="Story summary" />);

    expect(screen.getByRole('heading', { level: 1, name: 'A published travel story' })).toHaveClass('text-2xl', 'lg:text-[38px]');
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

    expect(screen.getByTestId('gallery-slider')).toBeInTheDocument();
    expect(gallerySliderMock).toHaveBeenCalledWith({
      data: [
        { ...media[1], image: media[1].url, alt_text: 'Featured image' },
        { ...media[0], image: media[0].url, alt_text: 'First image' },
        { ...media[2], image: media[2].url, alt_text: 'Last image' },
      ],
      collapseHiddenThumbnails: true,
    });
    expect(container.querySelector('[data-blog-gallery]')).toHaveClass('weelp-hero-ui-rise', 'mt-6');
  });

  it('ignores media records without usable URLs', () => {
    render(<BannerSectionBlog name="Story" media_gallery={[{ media_id: 1, url: null }, { media_id: 2, url: '' }, media[0]]} />);

    expect(gallerySliderMock).toHaveBeenCalledWith({
      data: [{ ...media[0], image: media[0].url, alt_text: 'First image' }],
      collapseHiddenThumbnails: true,
    });
  });

  it('keeps image-only media records that the shared gallery slider supports', () => {
    render(<BannerSectionBlog name="Story" media_gallery={[{ media_id: 20, image: '/api/media/20', alt_text: 'Image-only media', is_featured: 0 }]} />);

    expect(gallerySliderMock).toHaveBeenCalledWith({
      data: [{ media_id: 20, image: '/api/media/20', url: '/api/media/20', alt_text: 'Image-only media', is_featured: 0 }],
      collapseHiddenThumbnails: true,
    });
  });

  it('uses the shared single item gallery slider for one image too', () => {
    const { container } = render(<BannerSectionBlog name="Story" media_gallery={[media[0]]} />);

    expect(container.querySelector('[data-blog-gallery]')).toBeInTheDocument();
    expect(gallerySliderMock).toHaveBeenCalledWith({
      data: [{ ...media[0], image: media[0].url, alt_text: 'First image' }],
      collapseHiddenThumbnails: true,
    });
  });
});
