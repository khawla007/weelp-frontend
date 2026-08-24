import { render, screen } from '@testing-library/react';

import TestimonialSection from '../TestimonialSection';

const mockTestimonialSlider = jest.fn(() => <div data-testid="testimonial-slider" />);
const mockReveal = jest.fn(({ children, className = '', as: Component = 'div', initialHidden, ...props }) => (
  <Component className={className} data-initial-hidden={initialHidden ? 'true' : undefined} {...props}>
    {children}
  </Component>
));

jest.mock('@/app/components/sliders/TestimonialSlider', () => ({
  TestmonialSlider: (props) => mockTestimonialSlider(props),
}));

jest.mock('@/app/components/ui/Reveal', () => ({
  __esModule: true,
  default: (props) => mockReveal(props),
}));

const reviews = [{ id: 1, review_text: 'Wonderful trip' }];

beforeEach(() => {
  mockTestimonialSlider.mockClear();
  mockReveal.mockClear();
});

test('preserves independent heading and slider reveals by default', () => {
  const { container } = render(<TestimonialSection reviews={reviews} />);

  expect(mockReveal).toHaveBeenCalledTimes(2);
  expect(mockReveal.mock.calls[0][0]).toEqual(expect.objectContaining({ as: 'section', initialHidden: true }));
  expect(mockReveal.mock.calls[1][0]).toEqual(expect.objectContaining({ as: 'h2', variant: 'lift' }));
  expect(container.querySelector('[data-testimonial-section-entrance]')).not.toBeInTheDocument();
  expect(mockTestimonialSlider.mock.calls.at(-1)[0].entrance).toBeUndefined();
  expect(mockTestimonialSlider.mock.calls.at(-1)[0].observeReveal).toBeUndefined();
});

test('uses one section reveal to coordinate the stagger-up heading and cards', () => {
  render(<TestimonialSection reviews={reviews} entrance="stagger-up" />);

  const section = screen.getByRole('region', { name: 'Postcards from travelers.' });
  expect(mockReveal).toHaveBeenCalledTimes(1);
  expect(section).toHaveAttribute('data-testimonial-section-entrance', 'stagger-up');
  expect(section).toHaveAttribute('data-initial-hidden', 'true');
  expect(section.querySelector('[data-testimonial-section-heading]')).toBeInTheDocument();
  expect(mockTestimonialSlider.mock.calls.at(-1)[0]).toEqual(expect.objectContaining({ entrance: 'stagger-up', observeReveal: false }));
});
