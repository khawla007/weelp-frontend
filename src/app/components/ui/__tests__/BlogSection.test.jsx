import { render } from '@testing-library/react';

import BlogSection from '../BlogSection';

const mockProductSliderSection = jest.fn(() => <section data-testid="product-slider" />);

jest.mock('@/app/components/ui/ProductSliderSection', () => ({
  __esModule: true,
  default: (props) => mockProductSliderSection(props),
}));

jest.mock('@/app/components/ui/CarouselShell', () => ({
  __esModule: true,
  default: () => <div data-testid="legacy-carousel" />,
}));

jest.mock('@/app/components/ui/item-card', () => ({
  __esModule: true,
  default: () => null,
}));

const blog = {
  id: 17,
  name: 'Hidden corners of Paris',
  slug: 'hidden-corners-of-paris',
  excerpt: 'Must not become the title',
  published_at: '2026-08-20',
  categories: [{ category_name: 'City guide' }],
  media_gallery: [{ is_featured: true, url: '/paris-guide.jpg' }],
};

beforeEach(() => {
  mockProductSliderSection.mockClear();
});

test('returns null when no blogs are supplied', () => {
  const { container } = render(<BlogSection blogs={[]} />);

  expect(container).toBeEmptyDOMElement();
  expect(mockProductSliderSection).not.toHaveBeenCalled();
});

test('delegates normalized editorial cards to the canonical product carousel', () => {
  render(<BlogSection blogs={[blog]} title="Recommended" navigationId="guide-blog" className="pb-0" />);

  expect(mockProductSliderSection).toHaveBeenCalledWith({
    items: [
      {
        id: 17,
        href: '/blogs/hidden-corners-of-paris',
        image: '/paris-guide.jpg',
        title: 'Hidden corners of Paris',
        category: 'City guide',
      },
    ],
    title: 'Recommended',
    navigationId: 'guide-blog',
    itemVariant: 'editorial',
    carouselEntrance: 'stagger-right',
    className: 'pb-0',
  });
});
