import { fireEvent, render, screen } from '@testing-library/react';

jest.mock('swiper/react', () => ({
  Swiper: ({ children, className = '', onSwiper }) => {
    const React = require('react');
    React.useEffect(() => {
      onSwiper?.({ destroyed: false });
    }, [onSwiper]);
    return <div className={className}>{children}</div>;
  },
  SwiperSlide: ({ children, className = '' }) => <div className={className}>{children}</div>,
}));

jest.mock('swiper/modules', () => ({
  FreeMode: {},
  Navigation: {},
  Thumbs: {},
}));

jest.mock('../../Animation/ProductAnimation', () => ({
  ProductGalleryAnimation: () => null,
}));

import GallerySlider from '../GallerySlider';

const images = [
  { url: '/dubai-1.jpg', alt_text: 'Dubai skyline' },
  { url: '/dubai-2.jpg', alt_text: 'Dubai creek' },
];

describe('GallerySlider', () => {
  it('keeps the interactive gallery controls from selecting text on double click', () => {
    const { container } = render(<GallerySlider data={images} collapseHiddenThumbnails />);

    const gallery = container.querySelector('.gallery_slider');
    const toggle = screen.getByRole('button', { name: /view gallery/i });

    expect(gallery).toHaveClass('select-none');
    expect(toggle).toHaveClass('select-none');

    expect(fireEvent.mouseDown(toggle, { detail: 2 })).toBe(false);

    expect(toggle).toHaveTextContent('View Gallery');
  });
});
