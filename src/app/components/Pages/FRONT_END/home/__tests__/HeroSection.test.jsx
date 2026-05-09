import React from 'react';
import { render } from '@testing-library/react';

import HeroSection from '../HeroSection';

jest.mock(
  '../FilterBar',
  () =>
    function FilterBarMock() {
      return <div>Search controls</div>;
    },
);

describe('HeroSection', () => {
  it('uses the homepage hero background image', () => {
    const { container } = render(<HeroSection />);

    const section = container.querySelector('section');
    expect(section.style.backgroundImage).toContain('hero_illustration.png');
  });

  it('renders the editorial homepage heading text', () => {
    const { getByText } = render(<HeroSection />);

    expect(getByText('The cities, picked. The days, planned.')).toBeInTheDocument();
  });

  it('allows search dropdowns to extend below the hero without being clipped', () => {
    const { container } = render(<HeroSection />);

    const heroSection = container.querySelector('section');
    expect(heroSection).not.toHaveClass('overflow-hidden');
  });
});
