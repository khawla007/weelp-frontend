import { render } from '@testing-library/react';

import ToursHero from '../ToursHero';

jest.mock(
  '../ToursFilterBar',
  () =>
    function ToursFilterBarMock() {
      return <div data-testid="tours-filter-bar" />;
    },
);

describe('ToursHero', () => {
  it('renders the shared animated globe in the desktop background slot', () => {
    const { container, getByText, getByTestId } = render(<ToursHero />);

    expect(getByText('Plan your Holiday.')).toBeInTheDocument();
    expect(getByTestId('tours-filter-bar')).toBeInTheDocument();

    const background = container.querySelector('[data-tours-globe-background]');
    const stage = container.querySelector('[data-animated-globe]');
    const shell = container.querySelector('[data-personalised-cobe-shell]');

    expect(background).toHaveClass('hidden', '2xl:block', 'absolute', 'inset-0', 'overflow-hidden');
    expect(stage).toBeInTheDocument();
    expect(stage).toHaveClass('bg-transparent');
    expect(stage).toHaveAttribute('data-animated-globe-activation-query', '(min-width: 1536px)');
    expect(shell).toHaveClass('right-[-120px]', 'size-[760px]', 'translate-y-[40%]', '2xl:size-[880px]');
    expect(container.querySelector('[data-personalised-cobe-globe]')).toBeInTheDocument();
    expect(container.querySelector('[data-personalised-sparkles]')).not.toBeInTheDocument();
    expect(container.querySelector('img[src="/assets/Group5.png"]')).not.toBeInTheDocument();
  });
});
