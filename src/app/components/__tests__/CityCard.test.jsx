import { render, screen } from '@testing-library/react';

import CityCard from '../CityCard';

const city = {
  id: 1,
  name: 'Dubai',
  slug: 'dubai',
  featured_image: '/assets/Card.webp',
  activities_count: 13,
};

test('keeps white overlay text by default', () => {
  render(<CityCard city={city} />);

  expect(screen.getByText('Dubai')).toHaveClass('text-white');
  expect(screen.getByText('13 Activities')).toHaveClass('text-white/95');
});

test('supports the shared foreground color for homepage destination cards', () => {
  render(<CityCard city={city} textTone="foreground" />);

  expect(screen.getByText('Dubai')).toHaveClass('text-foreground');
  expect(screen.getByText('13 Activities')).toHaveClass('text-foreground');
});
