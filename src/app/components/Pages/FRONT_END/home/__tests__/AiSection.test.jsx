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

  it('owns the next-section gap with bottom padding only, per the public section spacing contract', async () => {
    const ui = await AiSection();
    const { container } = render(ui);
    const section = container.querySelector('section');

    // Normal content section: bottom padding owns the gap, no page-level top padding.
    expect(section).toHaveClass('pb-10', 'md:pb-16', 'lg:pb-24');
    expect(section).not.toHaveClass('pt-14', 'md:pt-[72px]', 'lg:pt-24');
  });

  it('renders a Sparkles Globe inspired cobe scene in the personalised card', async () => {
    const ui = await AiSection();
    const { container } = render(ui);

    const stage = container.querySelector('[data-personalised-globe-stage]');
    const shell = container.querySelector('[data-personalised-cobe-shell]');
    const globe = container.querySelector('[data-personalised-cobe-globe]');
    const card = container.querySelector('[data-personalised-card]');

    expect(card).toHaveClass('min-h-[260px]', 'sm:min-h-[300px]', 'md:min-h-[360px]', 'lg:min-h-[440px]');
    expect(card).not.toHaveClass('aspect-[32/10]');
    expect(stage).toHaveClass('absolute', 'inset-0', 'overflow-hidden', 'bg-white');
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

  it('uses black copy on the light personalised globe card', async () => {
    const ui = await AiSection();
    const { getByText } = render(ui);

    expect(getByText('Personalised for you')).toHaveClass('text-black');
    expect(getByText('Tailored recommendations.')).toHaveClass('text-black/70');
  });
});
