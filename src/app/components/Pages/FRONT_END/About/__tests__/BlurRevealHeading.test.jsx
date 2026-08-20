import { render, screen } from '@testing-library/react';
import BlurRevealHeading from '../BlurRevealHeading';

jest.mock('@/app/components/ui/Reveal', () => {
  const MockReveal = ({ as: Tag = 'div', children, variant, delay, ...props }) => (
    <Tag data-reveal-variant={variant} data-reveal-delay={delay} {...props}>
      {children}
    </Tag>
  );
  MockReveal.displayName = 'MockReveal';
  return MockReveal;
});

test('keeps one semantic heading while preserving visual spacing and reveal delay', () => {
  render(
    <BlurRevealHeading as="h2" delay={140}>
      Meaningful journeys
    </BlurRevealHeading>,
  );

  const heading = screen.getByRole('heading', { name: 'Meaningful journeys' });
  expect(heading).toHaveAttribute('data-reveal-delay', '140');
  expect(heading.querySelector('[aria-hidden="true"]')).toHaveTextContent('Meaningful journeys');
  expect(screen.getAllByTestId('blur-reveal-character')).toHaveLength('Meaningfuljourneys'.length);
  expect(screen.getAllByTestId('blur-reveal-character').every((node) => node.closest('[aria-hidden="true"]'))).toBe(true);
});
