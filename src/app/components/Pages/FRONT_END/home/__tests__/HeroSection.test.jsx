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

jest.mock(
  '../FeaturedPackagesSlider',
  () =>
    function FeaturedPackagesSliderMock() {
      return <div>Featured packages</div>;
    },
);

describe('HeroSection', () => {
  it('uses the homepage hero background image', () => {
    const { container } = render(<HeroSection />);

    const section = container.querySelector('section');
    expect(section.style.backgroundImage).toContain('hero_illustration.png');
  });

  it('renders the old homepage heading text', () => {
    const { getByText } = render(<HeroSection />);

    expect(getByText('Plan and Book')).toBeInTheDocument();
  });

  it('allows search dropdowns to extend below the hero without being clipped', () => {
    const { container } = render(<HeroSection />);

    const heroSection = container.querySelector('section');
    expect(heroSection).not.toHaveClass('overflow-hidden');
  });
});
