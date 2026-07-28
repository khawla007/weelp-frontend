import { render } from '@testing-library/react';

import HeroSection from '../HeroSection';

jest.mock('../../shared/ActivityItinerarySearch', () => ({
  HomeActivityItinerarySearch: () => <div data-testid="home-discovery-search" />,
}));

describe('HeroSection', () => {
  it('uses tighter mobile spacing while preserving the desktop hero hierarchy', () => {
    const { container } = render(<HeroSection />);

    const hero = container.querySelector('.weelp-hero-rise');
    const content = hero.querySelector('.container-page');

    expect(hero).toHaveClass('mb-10', 'sm:mb-16', 'md:h-[100svh]', 'lg:mb-24');
    expect(content).toHaveClass('pt-[135px]', 'pb-10', 'sm:pb-16', 'md:h-full', 'md:pb-20', 'lg:pb-32');
  });

  it('renders the shared home discovery presentation', () => {
    const { getByTestId } = render(<HeroSection />);

    expect(getByTestId('home-discovery-search')).toBeInTheDocument();
  });

  it('places a 10 percent white overlay over the background image', () => {
    const { getByTestId } = render(<HeroSection />);

    // dark-mode-exempt: assertion locks the requested white 10 percent photographic overlay
    expect(getByTestId('home-hero-overlay')).toHaveClass('absolute', 'inset-0', '-z-10', 'bg-white/10');
  });

  it('keeps the hero subtitle on a soft blurred mobile shade', () => {
    const { getByText } = render(<HeroSection />);

    const subtitle = getByText('Beach stays, marina views, and easy city plans in one place.').closest('p');

    expect(subtitle).toHaveClass('relative', 'isolate', 'text-white');
    expect(subtitle).toHaveClass('[text-shadow:0_1px_8px_rgba(0,0,0,0.5)]');
    expect(subtitle).toHaveClass("before:-inset-x-5", "before:-inset-y-3", "before:rounded-full", "before:bg-[var(--weelp-hero-subtitle-shade)]", "before:blur-2xl", "before:content-['']");
    expect(subtitle).toHaveStyle({ '--weelp-hero-subtitle-shade': 'rgba(0, 0, 0, 0.35)' });
    expect(subtitle).toHaveClass('sm:text-[var(--weelp-home-hero-copy)]');
    expect(subtitle).toHaveClass('sm:[background:radial-gradient(ellipse_at_center,rgba(255,255,255,0.6)_0%,rgba(255,255,255,0.25)_45%,rgba(255,255,255,0)_75%)]');
    expect(subtitle).toHaveClass('sm:[text-shadow:none]', 'sm:before:hidden');
  });
});
