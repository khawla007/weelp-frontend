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

  it('renders a Sparkles Globe inspired cobe scene in the personalised card', async () => {
    const ui = await AiSection();
    const { container } = render(ui);

    const stage = container.querySelector('[data-personalised-globe-stage]');
    const shell = container.querySelector('[data-personalised-cobe-shell]');
    const globe = container.querySelector('[data-personalised-cobe-globe]');

    expect(stage).toHaveClass('absolute', 'inset-0', 'overflow-hidden', 'bg-[#020817]');
    expect(container.querySelector('[data-personalised-sparkles]')).toBeInTheDocument();
    expect(shell).toHaveClass('bottom-[-86px]', 'right-[-18px]', 'size-[390px]', 'md:size-[470px]', 'lg:size-[540px]');
    expect(globe).toHaveClass('personalised-cobe-globe', 'size-full');
    expect(container.querySelector('[data-personalised-globe-loading]')).not.toBeInTheDocument();
    expect(container.querySelector('[data-personalised-globe-map-overlay]')).not.toBeInTheDocument();
    expect(container.querySelector('[data-personalised-globe-fallback]')).not.toBeInTheDocument();
  });

  it('uses white copy on the dark personalised globe card', async () => {
    const ui = await AiSection();
    const { getByText } = render(ui);

    expect(getByText('Personalised for you')).toHaveClass('text-white');
    expect(getByText('Tailored recommendations.')).toHaveClass('text-white/85');
  });
});
