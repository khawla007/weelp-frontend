import { render } from '@testing-library/react';

import HeroSection from '../HeroSection';

jest.mock('../../shared/ActivityItinerarySearch', () => ({
  HomeActivityItinerarySearch: () => <div data-testid="home-discovery-search" />,
}));

describe('HeroSection', () => {
  it('uses tighter mobile spacing while preserving the desktop hero hierarchy', () => {
    const { container } = render(<HeroSection />);

    const hero = container.querySelector('[data-home-hero]');
    const content = hero.querySelector('.container-page');

    expect(hero).not.toHaveClass('weelp-hero-rise');
    expect(hero).toHaveAttribute('data-home-hero-motion', 'pending');
    expect(hero).toHaveClass('mb-10', 'sm:mb-16', 'md:h-[100svh]', 'lg:mb-24');
    expect(content).toHaveClass('pt-[135px]', 'pb-10', 'sm:pb-16', 'md:h-full', 'md:pb-20', 'lg:pb-32');
  });

  it('applies mobile-only padding to the panel around the search controls', () => {
    const { getByTestId } = render(<HeroSection />);

    const search = getByTestId('home-discovery-search');
    const searchPanel = search.parentElement;
    const heroSearchWrapper = search.closest('.weelp-hero-ui-rise');

    expect(search).toBeInTheDocument();
    expect(searchPanel).toHaveClass('p-[0.9rem]', 'sm:p-0');
    expect(heroSearchWrapper).not.toHaveClass('p-[0.9rem]');
    expect(heroSearchWrapper).not.toHaveClass('sm:p-0');
  });

  it('places a 10 percent white overlay over the background image', () => {
    const { getByTestId } = render(<HeroSection />);

    // dark-mode-exempt: assertion locks the requested white 10 percent photographic overlay
    expect(getByTestId('home-hero-overlay')).toHaveClass('absolute', 'inset-0', '-z-10', 'bg-white/10');
  });

  it('keeps the hero badge and escape accent on the light-mode color in both themes', () => {
    const { getByText } = render(<HeroSection />);

    const badge = getByText('Plan calmer escapes');
    const escapeAccent = getByText('escape', { selector: '.sr-only' }).parentElement;

    expect(badge).toHaveClass('weelp-home-hero-eyebrow');
    expect(badge).toHaveClass('text-[var(--weelp-home-hero-accent)]');
    expect(escapeAccent).toHaveClass('text-[var(--weelp-home-hero-accent)]');
    expect(badge).not.toHaveClass('text-weelp-sage-text');
    expect(escapeAccent).not.toHaveClass('text-weelp-sage-text');
  });

  it('exposes the hero headline once while providing character-level visual hooks', () => {
    const { container, getByRole, getByText } = render(<HeroSection />);

    expect(getByRole('heading', { name: 'Find your next' })).toBeInTheDocument();
    expect(getByText('Find your next', { selector: '.sr-only' })).toBeInTheDocument();
    expect(getByText('escape', { selector: '.sr-only' })).toBeInTheDocument();
    expect(container.querySelectorAll('[data-home-hero-character]')).toHaveLength(18);
    expect(container.querySelectorAll('[data-home-hero-visual][aria-hidden="true"]')).toHaveLength(2);
  });

  it('assigns continuous character indices across both headline lines', () => {
    const { container } = render(<HeroSection />);

    const characters = container.querySelectorAll('[data-home-hero-character]');

    expect(characters[0]).toHaveTextContent('F');
    expect(characters[0]).toHaveStyle({ '--weelp-hero-character-index': '0' });
    expect(characters[11]).toHaveTextContent('t');
    expect(characters[11]).toHaveStyle({ '--weelp-hero-character-index': '11' });
    expect(characters[12]).toHaveTextContent('e');
    expect(characters[12]).toHaveStyle({ '--weelp-hero-character-index': '12' });
  });

  it('stages the supporting hero elements without changing responsive layout offsets', () => {
    const { container, getByTestId, getByText } = render(<HeroSection />);

    const content = container.querySelector('.container-page');
    const eyebrow = getByText('Plan calmer escapes');
    const subtitle = getByText('Beach stays, marina views, and easy city plans in one place.').closest('p');
    const searchWrapper = getByTestId('home-discovery-search').closest('.weelp-hero-ui-rise');
    const trustList = container.querySelector('ul.weelp-hero-ui-rise');

    expect(eyebrow).toHaveStyle({ '--weelp-motion-delay': '0ms', '--weelp-motion-duration': '1250ms', '--weelp-motion-ease': 'ease', '--weelp-reveal-y': '20px' });
    expect(subtitle).toHaveClass('weelp-hero-ui-rise');
    expect(subtitle).toHaveStyle({ '--weelp-motion-delay': '600ms', '--weelp-motion-duration': '1250ms', '--weelp-motion-ease': 'ease', '--weelp-reveal-y': '20px' });
    expect(searchWrapper).toHaveStyle({ '--weelp-motion-delay': '0ms', '--weelp-motion-duration': '1250ms', '--weelp-motion-ease': 'ease', '--weelp-reveal-y': '20px' });
    expect(trustList).toHaveStyle({ '--weelp-motion-delay': '600ms', '--weelp-motion-duration': '1250ms', '--weelp-motion-ease': 'ease', '--weelp-reveal-y': '20px' });
    expect(content).toHaveClass('pt-[135px]', 'sm:pt-[170px]', 'lg:pt-[214px]');
  });

  it('keeps the hero subtitle on a soft blurred mobile shade', () => {
    const { getByText } = render(<HeroSection />);

    const subtitle = getByText('Beach stays, marina views, and easy city plans in one place.').closest('p');

    expect(subtitle).toHaveClass('relative', 'isolate', 'text-white');
    expect(subtitle).toHaveClass('[text-shadow:0_1px_8px_rgba(0,0,0,0.5)]');
    expect(subtitle).toHaveClass('before:-inset-x-5', 'before:-inset-y-3', 'before:rounded-full', 'before:bg-[var(--weelp-hero-subtitle-shade)]', 'before:blur-2xl', "before:content-['']");
    expect(subtitle).toHaveStyle({ '--weelp-hero-subtitle-shade': 'rgba(0, 0, 0, 0.35)' });
    expect(subtitle).toHaveClass('sm:text-[var(--weelp-home-hero-copy)]');
    expect(subtitle).toHaveClass('sm:[background:radial-gradient(ellipse_at_center,rgba(255,255,255,0.6)_0%,rgba(255,255,255,0.25)_45%,rgba(255,255,255,0)_75%)]');
    expect(subtitle).toHaveClass('sm:[text-shadow:none]', 'sm:before:hidden');
  });
});
