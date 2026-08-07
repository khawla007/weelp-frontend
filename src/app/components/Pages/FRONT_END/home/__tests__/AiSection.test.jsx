import { render } from '@testing-library/react';

import AiSection from '../AiSection';

jest.mock('../../../../../../lib/services/activites', () => ({
  getAllFeaturedActivities: jest.fn(() => Promise.resolve([])),
}));

jest.mock(
  '../../../../ui/CarouselShell',
  () =>
    function CarouselShellMock() {
      return null;
    },
);

describe('AiSection', () => {
  it('renders the four pen-canonical card titles', async () => {
    const ui = await AiSection();
    const { getByText } = render(ui);
    expect(getByText('Buddy — AI Travel Guide')).toBeInTheDocument();
    expect(getByText('Suggestions on Map')).toBeInTheDocument();
    expect(getByText('Save Money')).toBeInTheDocument();
    expect(getByText('Personalised for you')).toBeInTheDocument();
  });

  it('uses the pen-canonical heading copy', async () => {
    const ui = await AiSection();
    const { getByText } = render(ui);
    expect(getByText('Your AI Travel Buddy')).toBeInTheDocument();
  });

  it('keeps the Buddy conversation inside a fixed-height scroll viewport', async () => {
    const ui = await AiSection();
    const { getByRole } = render(ui);
    const chatViewport = getByRole('log', { name: 'Conversation with Buddy' }).parentElement.parentElement;

    expect(chatViewport).toHaveClass('h-[300px]', 'md:h-[360px]', 'shrink-0');
    expect(chatViewport).not.toHaveClass('flex-1', 'min-h-[300px]', 'md:min-h-[360px]');
  });

  it('owns the next-section gap with bottom padding only, per the public section spacing contract', async () => {
    const ui = await AiSection();
    const { container } = render(ui);
    const section = container.querySelector('section');

    // Normal content section: bottom padding owns the gap, no page-level top padding.
    expect(section).toHaveClass('pb-12', 'md:pb-16', 'lg:pb-24');
    expect(section).not.toHaveClass('pt-14', 'md:pt-[72px]', 'lg:pt-24');
  });

  it('renders a Sparkles Globe inspired cobe scene in the personalised card', async () => {
    const ui = await AiSection();
    const { container } = render(ui);

    const stage = container.querySelector('[data-personalised-globe-stage]');
    const shell = container.querySelector('[data-personalised-cobe-shell]');
    const globe = container.querySelector('[data-personalised-cobe-globe]');
    const card = container.querySelector('[data-personalised-card]');

    expect(card).toHaveClass('min-h-[220px]', 'sm:min-h-[300px]', 'md:min-h-[360px]', 'lg:min-h-[440px]');
    expect(card).not.toHaveClass('aspect-[32/10]');
    expect(stage).toHaveClass('absolute', 'inset-0', 'overflow-hidden', 'bg-card');
    expect(stage).toHaveAttribute('data-animated-globe');
    expect(container.querySelector('[data-personalised-sparkles]')).toBeInTheDocument();
    expect(container.querySelector('[data-personalised-left-sparkles]')).toBeInTheDocument();
    expect(shell).toHaveClass('bottom-[-86px]', 'right-[-18px]', 'size-[507px]', 'md:size-[611px]', 'lg:size-[702px]');
    expect(globe).toHaveClass('personalised-cobe-globe', 'size-full');
    expect(container.querySelector('[data-personalised-globe-loading]')).not.toBeInTheDocument();
    expect(container.querySelector('[data-personalised-globe-map-overlay]')).not.toBeInTheDocument();
    expect(container.querySelector('[data-personalised-globe-fallback]')).not.toBeInTheDocument();
  });

  it('renders a monochrome plane flying between globe markers', async () => {
    const ui = await AiSection();
    const { container } = render(ui);

    const flight = container.querySelector('[data-personalised-flight]');
    const path = container.querySelector('[data-personalised-flight-path]');
    const plane = container.querySelector('[data-personalised-flight-plane]');
    const shell = container.querySelector('[data-personalised-cobe-shell]');

    expect(flight).toHaveAttribute('aria-hidden', 'true');
    expect(flight).toHaveClass('personalised-flight');
    expect(path).toHaveClass('personalised-flight-path');
    expect(plane).toHaveClass('personalised-flight-plane', 'personalised-flight-boeing');
    expect(plane).toHaveAttribute('viewBox', '0 0 48 48');
    expect(shell).toHaveClass('size-[507px]', 'md:size-[611px]', 'lg:size-[702px]');
    expect(plane.querySelector('path')).toHaveAttribute('stroke-width', '1.1');
    expect(container.querySelector('[data-personalised-flight-motion]')).toBeInTheDocument();
    expect(container.querySelector('[data-personalised-flight-static-plane]')).toBeInTheDocument();
    expect(container.querySelector('animateMotion')).not.toBeInTheDocument();
  });

  it('wraps the section in a Reveal (data-reveal present) and gives the Save-Money image a capped hover-zoom', async () => {
    const ui = await AiSection();
    const { container } = render(ui);

    const section = container.querySelector('section');
    expect(section).toHaveAttribute('data-reveal');

    const moneyImg = container.querySelector('img[alt="AI suggesting price-aware combinations"]');
    expect(moneyImg).toBeTruthy();
    expect(moneyImg.className).toContain('group-hover:scale-[1.02]');
    expect(moneyImg.className).toContain('motion-reduce:group-hover:scale-100');
  });

  it('uses artwork-safe dark copy on the personalised globe card in both themes', async () => {
    const ui = await AiSection();
    const { getByText } = render(ui);

    expect(getByText('Personalised for you')).toHaveClass('text-weelp-hero-foreground');
    expect(getByText('Tailored recommendations.')).toHaveClass('text-weelp-hero-foreground/75');
  });
});
