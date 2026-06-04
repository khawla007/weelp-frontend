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
    expect(section.style.backgroundImage).toContain('weelp-home-hero.png');
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

  it('wraps the heading in a mask-clip rise with the 200ms delay slot', () => {
    const { container } = render(<HeroSection />);

    const heading = container.querySelector('h1');
    const mask = heading.querySelector('.weelp-rise-mask');
    const item = mask.querySelector('.weelp-rise-item');
    expect(item).not.toBeNull();
    expect(item.getAttribute('style')).toContain('--weelp-rise-delay: 200ms');
  });

  it('wraps the subtitle in a mask-clip rise with the 280ms delay slot', () => {
    const { container } = render(<HeroSection />);

    const subtitle = container.querySelector('p');
    const item = subtitle.querySelector('.weelp-rise-mask .weelp-rise-item');
    expect(item).not.toBeNull();
    expect(item.getAttribute('style')).toContain('--weelp-rise-delay: 280ms');
  });

  it('animates the hero badge as a whole pill, not just the badge text', () => {
    const { getByText } = render(<HeroSection />);

    const badge = getByText('Plan calmer escapes').closest('span');
    expect(badge).not.toBeNull();
    expect(badge).toHaveClass('weelp-hero-ui-rise');
    expect(badge).not.toHaveClass('weelp-rise-mask');
    expect(badge.querySelector('.weelp-rise-item')).toBeNull();
    expect(badge.getAttribute('style')).toContain('--weelp-motion-delay: 120ms');
  });

  it('layers FilterBar above the hero chips so dropdowns are not covered', () => {
    const { container } = render(<HeroSection />);

    const wrapper = container.querySelector('span.weelp-hero-ui-rise.inline-block');
    const chipRow = container.querySelector('div.weelp-hero-ui-rise.flex');

    expect(wrapper).not.toBeNull();
    expect(wrapper).toHaveClass('relative');
    expect(wrapper).toHaveClass('z-30');
    expect(wrapper.getAttribute('style')).toContain('--weelp-motion-delay: 360ms');

    expect(chipRow).not.toBeNull();
    expect(chipRow).toHaveClass('relative');
    expect(chipRow).toHaveClass('z-0');
    expect(chipRow.getAttribute('style')).toContain('--weelp-motion-delay: 440ms');
  });
});
