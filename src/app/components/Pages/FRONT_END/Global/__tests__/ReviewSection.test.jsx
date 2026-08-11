import { render, screen } from '@testing-library/react';

import { ReviewSectionCity, ReviewSectionRegion } from '../ReviewSection';

jest.mock('../../../../WhatAbout', () => ({
  WhatAboutCity: () => <div data-testid="what-about-city" />,
  WhatAboutRegion: () => <div data-testid="what-about-region" />,
}));

jest.mock('../../../../sliders/ReviewSlider', () => ({
  __esModule: true,
  default: () => <div data-testid="review-slider" />,
}));

jest.mock('../../../../TotalReviews', () => ({
  __esModule: true,
  default: () => <div data-testid="total-reviews" />,
}));

jest.mock('../../../../Faq', () => ({
  __esModule: true,
  default: ({ layout }) => <div data-testid="faq" data-layout={layout} />,
}));

describe('ReviewSectionCity layout', () => {
  it('keeps the destination panel self-sized and pins its image to the bottom', () => {
    render(
      <ReviewSectionCity
        cityData={{
          location_details: {
            ignoredOne: 'one',
            ignoredTwo: 'two',
            latitude: '25.2048',
          },
        }}
      />,
    );

    const destinationPanel = screen.getByTestId('what-about-city').parentElement;
    const contentPanel = screen.getByTestId('faq').parentElement;

    expect(destinationPanel).toHaveClass('self-start', 'pb-[200px]');
    expect(destinationPanel.style.backgroundPosition).toBe('center bottom');
    expect(contentPanel).not.toHaveClass('p-4');
    expect(contentPanel).toHaveClass('pt-6', 'md:p-6');
    expect(screen.getByTestId('faq')).toHaveAttribute('data-layout', 'stable');
  });
});

describe('ReviewSectionRegion layout', () => {
  it('keeps the destination panel self-sized and pins its image to the bottom', () => {
    render(<ReviewSectionRegion />);

    const destinationPanel = screen.getByTestId('what-about-region').parentElement;

    expect(destinationPanel).toHaveClass('self-start', 'pb-[200px]');
    expect(destinationPanel.style.backgroundPosition).toBe('center bottom');
    expect(screen.getByTestId('faq')).not.toHaveAttribute('data-layout');
  });
});
