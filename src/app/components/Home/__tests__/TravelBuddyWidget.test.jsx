import { render, screen } from '@testing-library/react';

import TravelBuddyWidget from '../TravelBuddyWidget';

let mockCarouselProps;

jest.mock('../BuddyChat', () => ({ __esModule: true, default: () => <div>Buddy chat</div> }));
jest.mock('../TravelBuddyMapClient', () => ({ __esModule: true, default: () => <div>Buddy map</div> }));
jest.mock('@/hooks/useBuddyChat', () => ({
  __esModule: true,
  default: () => ({ messages: [], isThinking: false, sendMessage: jest.fn(), presets: [], lastPayload: { markers: [], route: [], fitBounds: false } }),
}));
jest.mock('@/app/components/ui/item-card', () => ({
  __esModule: true,
  default: ({ variant, title, imageClassName }) => (
    <div data-testid="shared-item-card" data-variant={variant} data-image-class={imageClassName}>
      {title}
    </div>
  ),
}));
jest.mock('@/app/components/ui/CarouselShell', () => ({
  __esModule: true,
  default: (props) => {
    mockCarouselProps = props;
    return (
      <div data-testid="featured-carousel">
        {props.items.map((item) => (
          <div key={item.id}>{props.renderSlide(item)}</div>
        ))}
      </div>
    );
  },
}));

it('renders two compact featured activities with the reduced shared-card composition', () => {
  const items = [
    { id: 42, title: 'Desert Safari Adventure', category: 'Safari', rating: '5', price: '$130.00', shortDescription: 'Dune bashing' },
    { id: 43, title: 'Old Dubai Walk', category: 'Culture', rating: '4.8', price: '$80.00', shortDescription: 'Historic lanes' },
  ];
  const { container } = render(<TravelBuddyWidget items={items} />);

  const cards = screen.getAllByTestId('shared-item-card');
  expect(cards).toHaveLength(2);
  cards.forEach((card) => {
    expect(card).toHaveAttribute('data-variant', 'product-compact');
    expect(card).toHaveAttribute('data-image-class', 'h-[112px] sm:h-[185px] lg:h-[200px]');
  });
  expect(cards[0]).toHaveTextContent('Desert Safari Adventure');
  expect(cards[1]).toHaveTextContent('Old Dubai Walk');
  expect(mockCarouselProps.navigationPrefix).toBe('buddy-activities');
  expect(mockCarouselProps.breakpoints).toEqual({ 0: { slidesPerView: 2, spaceBetween: 12 } });
  expect(mockCarouselProps.slideClassName).toBe('!h-auto');
  expect(screen.getByRole('button', { name: 'Previous featured activities' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Next featured activities' })).toBeInTheDocument();
  expect(container.querySelector('[data-public-card="ai-chat"]')).toHaveClass('rounded-[24px]');
  expect(container.querySelector('[data-public-card="ai-map"]')).toHaveClass('rounded-[24px]');
});
