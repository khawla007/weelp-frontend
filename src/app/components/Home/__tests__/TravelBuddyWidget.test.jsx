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
    return <div data-testid="featured-carousel">{props.items.map((item) => <div key={item.id}>{props.renderSlide(item)}</div>)}</div>;
  },
}));

it('renders one featured activity at a time through the full shared product card', () => {
  const { container } = render(<TravelBuddyWidget items={[{ id: 42, title: 'Desert Safari Adventure' }]} />);

  const card = screen.getByTestId('shared-item-card');
  expect(card).toHaveAttribute('data-variant', 'full');
  expect(card).not.toHaveAttribute('data-image-class');
  expect(card).toHaveTextContent('Desert Safari Adventure');
  expect(mockCarouselProps.navigationPrefix).toBe('buddy-activities');
  expect(mockCarouselProps.breakpoints).toEqual({ 0: { slidesPerView: 1, spaceBetween: 12 } });
  expect(mockCarouselProps.slideClassName).toBe('!h-auto');
  expect(screen.getByRole('button', { name: 'Previous featured activities' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Next featured activities' })).toBeInTheDocument();
  expect(container.querySelector('[data-public-card="ai-chat"]')).toHaveClass('rounded-[24px]');
  expect(container.querySelector('[data-public-card="ai-map"]')).toHaveClass('rounded-[24px]');
});
