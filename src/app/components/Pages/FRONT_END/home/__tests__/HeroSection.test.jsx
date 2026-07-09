import { render } from '@testing-library/react';

import HeroSection from '../HeroSection';

describe('HeroSection', () => {
  it('places a 10 percent white overlay over the background image', () => {
    const { getByTestId } = render(<HeroSection />);

    // dark-mode-exempt: assertion locks the requested white 10 percent photographic overlay
    expect(getByTestId('home-hero-overlay')).toHaveClass('absolute', 'inset-0', '-z-10', 'bg-white/10');
  });
});
