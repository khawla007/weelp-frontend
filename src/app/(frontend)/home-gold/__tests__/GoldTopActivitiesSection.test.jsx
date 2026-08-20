import { render, screen } from '@testing-library/react';

const mockMapProductToItemCard = jest.fn((activity) => ({
  id: activity.id,
  href: '/cities/dubai/activities/desert-safari',
  image: '/desert-safari.jpg',
  title: activity.name,
  category: 'Desert Safari & Tour',
  price: '$130.00',
  shortDescription: activity.short_description ?? null,
  attributes: Array.isArray(activity.attributes) ? activity.attributes.slice(0, 3) : [],
}));

const mockCarouselShell = jest.fn(({ items, renderSlide }) => (
  <div data-testid="carousel-shell">
    {items.map((item, index) => (
      <div key={item.id}>{renderSlide(item, index)}</div>
    ))}
  </div>
));

const mockGoldActivityCard = jest.fn(({ item, wishlistItem }) => (
  <a data-testid="home-gold-activity-card" href={item.href}>
    {item.title} — {item.category} — {item.price} — wishlist {wishlistItem.id}
  </a>
));

jest.mock('@/lib/mapProductToItemCard', () => ({
  mapProductToItemCard: (...args) => mockMapProductToItemCard(...args),
}));

jest.mock('@/app/components/ui/CarouselShell', () => ({
  __esModule: true,
  default: (props) => mockCarouselShell(props),
}));

jest.mock('../GoldActivityCard', () => ({
  __esModule: true,
  default: (props) => mockGoldActivityCard(props),
}));

import GoldTopActivitiesSection from '../GoldTopActivitiesSection';

const rawActivity = {
  id: 42,
  item_type: 'activity',
  name: 'Desert Safari Adventure',
  city_slug: 'dubai',
  categories: [{ name: 'Outdoor adventure' }],
  short_description: 'Ride the dunes at golden hour.',
  attributes: [
    { slug: 'duration', name: 'Duration', attribute_value: '4 Hours' },
    { slug: 'group-size', name: 'Group Size', attribute_value: '6-10' },
    { slug: 'age-restriction', name: 'Age Restriction', attribute_value: '12+' },
  ],
};

describe('GoldTopActivitiesSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps the Top activities heading, navigation, and shared carousel layout', () => {
    render(<GoldTopActivitiesSection activities={[rawActivity]} />);

    expect(screen.getByRole('heading', { name: 'Top activities' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Previous Top activities item' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Next Top activities item' })).toBeVisible();
    expect(mockCarouselShell).toHaveBeenCalledWith(
      expect.objectContaining({
        navigationPrefix: 'top-activities',
        breakpoints: {
          450: { slidesPerView: 1, spaceBetween: 18 },
          640: { slidesPerView: 2, spaceBetween: 18 },
          768: { slidesPerView: 2, spaceBetween: 18 },
          1024: { slidesPerView: 3, spaceBetween: 18 },
          1440: { slidesPerView: 4, spaceBetween: 18 },
        },
        slideClassName: '!h-auto',
        showMobilePagination: true,
      }),
    );
  });

  it('maps each raw activity into a linked Gold activity card while retaining the wishlist item', () => {
    render(<GoldTopActivitiesSection activities={[rawActivity]} />);

    expect(mockMapProductToItemCard).toHaveBeenCalledWith(rawActivity);
    expect(screen.getByRole('link', { name: /Desert Safari Adventure/ })).toHaveAttribute('href', '/cities/dubai/activities/desert-safari');
    expect(screen.getByTestId('home-gold-activity-card')).toHaveTextContent('Outdoor adventure');
    expect(screen.getByTestId('home-gold-activity-card')).toHaveTextContent('$130.00');
    expect(mockGoldActivityCard).toHaveBeenCalledWith({
      item: expect.objectContaining({
        id: 42,
        title: 'Desert Safari Adventure',
        href: '/cities/dubai/activities/desert-safari',
        category: 'Outdoor adventure',
      }),
      wishlistItem: rawActivity,
    });
  });

  it('threads short_description and first three attributes from raw activity through to the card', () => {
    render(<GoldTopActivitiesSection activities={[rawActivity]} />);

    expect(mockMapProductToItemCard).toHaveBeenCalledWith(rawActivity);
    expect(mockGoldActivityCard).toHaveBeenCalledWith(
      expect.objectContaining({
        item: expect.objectContaining({
          shortDescription: 'Ride the dunes at golden hour.',
          attributes: [
            { slug: 'duration', name: 'Duration', attribute_value: '4 Hours' },
            { slug: 'group-size', name: 'Group Size', attribute_value: '6-10' },
            { slug: 'age-restriction', name: 'Age Restriction', attribute_value: '12+' },
          ],
        }),
        wishlistItem: rawActivity,
      }),
    );
  });

  it('renders nothing when activities are empty', () => {
    const { container } = render(<GoldTopActivitiesSection activities={[]} />);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('heading', { name: 'Top activities' })).not.toBeInTheDocument();
    expect(mockCarouselShell).not.toHaveBeenCalled();
  });
});
