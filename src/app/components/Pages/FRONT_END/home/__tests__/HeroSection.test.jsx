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
    expect(section.style.backgroundImage).toContain('hero_redesigned_bg.jpeg');
  });

  it('renders the homepage heading text from the pen design', () => {
    const { getByText } = render(<HeroSection />);

    expect(getByText('Find your next escape')).toBeInTheDocument();
    expect(getByText('Beach stays, marina views, and easy city plans in one place.')).toBeInTheDocument();
  });

  it('allows search dropdowns to extend below the hero without being clipped', () => {
    const { container } = render(<HeroSection />);

    const heroSection = container.querySelector('section');
    expect(heroSection).not.toHaveClass('overflow-hidden');
  });

  it('applies hero-rise to the heading', () => {
    const { container } = render(<HeroSection />);

    const heading = container.querySelector('h1');
    expect(heading).toHaveClass('hero-rise');
  });

  it('applies hero-rise with 120ms delay to the subtitle', () => {
    const { container } = render(<HeroSection />);

    const subtitle = container.querySelector('p');
    expect(subtitle).toHaveClass('hero-rise');
    expect(subtitle.getAttribute('style')).toContain('--hero-rise-delay: 160ms');
  });

  it('layers FilterBar above the hero chips so dropdowns are not covered', () => {
    const { container } = render(<HeroSection />);

    const wrapper = container.querySelector('span.hero-rise.inline-block');
    const chipRow = container.querySelector('div.hero-rise.flex');

    expect(wrapper).not.toBeNull();
    expect(wrapper).toHaveClass('relative');
    expect(wrapper).toHaveClass('z-30');
    expect(wrapper.getAttribute('style')).toContain('--hero-rise-delay: 240ms');

    expect(chipRow).not.toBeNull();
    expect(chipRow).toHaveClass('relative');
    expect(chipRow).toHaveClass('z-0');
  });
});
