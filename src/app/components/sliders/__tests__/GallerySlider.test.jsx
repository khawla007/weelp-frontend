import { fireEvent, render, screen } from '@testing-library/react';

jest.mock('swiper/react', () => ({
  Swiper: ({ children, className = '', onSlideChange, navigation }) => (
    <div className={className} data-navigation={String(navigation)}>
      {children}
      {onSlideChange ? (
        <button type="button" onClick={() => onSlideChange({ activeIndex: 1 })}>
          Simulate slide 2
        </button>
      ) : null}
    </div>
  ),
  SwiperSlide: ({ children, className = '' }) => <div className={className}>{children}</div>,
}));

jest.mock('swiper/modules', () => ({
  Navigation: {},
}));

import GallerySlider from '../GallerySlider';

const images = [
  { url: '/api/media/1', alt_text: 'Dubai skyline' },
  { url: '/api/media/2', alt_text: 'Dubai creek' },
];

describe('GallerySlider', () => {
  it('removes the inline thumbnail gallery and opens the counted lightbox', () => {
    const { container } = render(<GallerySlider data={images} collapseHiddenThumbnails />);

    expect(container.querySelector('.thumbnail-gallery')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'See all 2 photos' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'See all 2 photos' }));
    expect(screen.getByRole('dialog', { name: 'Photo gallery' })).toBeInTheDocument();
  });

  it('filters invalid and duplicate media before displaying the count', () => {
    render(<GallerySlider data={[images[0], { url: '' }, { image: images[0].url }, images[1]]} />);
    expect(screen.getByRole('button', { name: 'See all 2 photos' })).toBeInTheDocument();
  });

  it('renders one image without slider navigation or a gallery action', () => {
    const { container } = render(<GallerySlider data={[images[0]]} />);
    expect(container.querySelector('.main-slider')).toHaveAttribute('data-navigation', 'false');
    expect(screen.queryByRole('button', { name: /see all/i })).not.toBeInTheDocument();
  });

  it('renders nothing when no valid images are supplied', () => {
    const { container } = render(<GallerySlider data={[null, { url: '' }]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('opens the lightbox on the active inline slide', () => {
    render(<GallerySlider data={images} />);
    fireEvent.click(screen.getByRole('button', { name: 'Simulate slide 2' }));
    fireEvent.click(screen.getByRole('button', { name: 'See all 2 photos' }));
    expect(screen.getByRole('img', { name: 'Dubai creek' })).toBeInTheDocument();
  });
});
