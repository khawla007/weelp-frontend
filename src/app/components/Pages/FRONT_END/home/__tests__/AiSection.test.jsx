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

  it('applies responsive top padding for the section background', async () => {
    const ui = await AiSection();
    const { container } = render(ui);

    expect(container.querySelector('section')).toHaveClass('pt-14', 'md:pt-[72px]', 'lg:pt-24');
  });

  it('renders a Sparkles Globe inspired cobe scene in the personalised card', async () => {
    const ui = await AiSection();
    const { container } = render(ui);

    const stage = container.querySelector('[data-personalised-globe-stage]');
    const shell = container.querySelector('[data-personalised-cobe-shell]');
    const globe = container.querySelector('[data-personalised-cobe-globe]');

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
    const dots = container.querySelectorAll('[data-personalised-flight-dot]');

    expect(flight).toHaveAttribute('aria-hidden', 'true');
    expect(flight).toHaveClass('personalised-flight');
    expect(path).toHaveClass('personalised-flight-path');
    expect(plane).toHaveClass('personalised-flight-plane', 'personalised-flight-boeing');
    expect(plane).toHaveAttribute('viewBox', '0 0 48 48');
    expect(dots).toHaveLength(2);
    expect(dots[0]).toHaveClass('personalised-flight-dot');
    expect(dots[1]).toHaveClass('personalised-flight-dot');
    expect(dots[0]).toHaveAttribute('r', '1.2');
    expect(dots[1]).toHaveAttribute('r', '1.05');
    expect(plane.querySelector('path')).toHaveAttribute('stroke-width', '1.8');
    expect(container.querySelector('[data-personalised-flight-motion]')).toBeInTheDocument();
    expect(container.querySelector('animateMotion')).not.toBeInTheDocument();
  });

  it('uses black copy on the light personalised globe card', async () => {
    const ui = await AiSection();
    const { getByText } = render(ui);

    expect(getByText('Personalised for you')).toHaveClass('text-black');
    expect(getByText('Tailored recommendations.')).toHaveClass('text-black/70');
  });
});
