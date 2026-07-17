import { render } from '@testing-library/react';

import HeroSection from '../HeroSection';

describe('HeroSection', () => {
  it('uses tighter mobile spacing while preserving the desktop hero hierarchy', () => {
    const { container } = render(<HeroSection />);

    const hero = container.querySelector('.weelp-hero-rise');
    const content = hero.querySelector('.container-page');

    expect(hero).toHaveClass('mb-10', 'sm:mb-16', 'md:h-[100svh]', 'lg:mb-24');
    expect(content).toHaveClass('pt-[135px]', 'pb-10', 'sm:pb-16', 'md:h-full', 'md:pb-20', 'lg:pb-32');
  });

  it('places a 10 percent white overlay over the background image', () => {
    const { getByTestId } = render(<HeroSection />);

    // dark-mode-exempt: assertion locks the requested white 10 percent photographic overlay
    expect(getByTestId('home-hero-overlay')).toHaveClass('absolute', 'inset-0', '-z-10', 'bg-white/10');
  });
});
