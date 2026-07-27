import { fireEvent, render, screen } from '@testing-library/react';

jest.mock('../SingleProductReview', () => ({
  SingleProductReview: () => null,
}));

import { FaqPanel, WhatIncludedPanel } from '../TabSection__modules';

describe('WhatIncludedPanel', () => {
  it("renders dynamic What's Included rows without static placeholders", () => {
    render(
      <WhatIncludedPanel
        items={[
          { title: 'Hotel pickup', description: 'From selected hotels.', included: true },
          { title: 'Tips', description: 'Optional gratuities.', included: false },
        ]}
      />,
    );

    expect(screen.getByRole('heading', { name: "What's Included" })).toBeInTheDocument();
    expect(screen.getByText('Hotel pickup')).toBeInTheDocument();
    expect(screen.getByText('From selected hotels.')).toBeInTheDocument();
    expect(screen.getByText('Tips')).toBeInTheDocument();
    expect(screen.queryByText('60-Minutes Quad Bike Ride at Red dunes open desert with Fuel & Helmet')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /See/i })).not.toBeInTheDocument();
  });

  it('keeps the static fallback only when explicitly requested', () => {
    render(<WhatIncludedPanel useStaticFallback />);

    expect(screen.getByText('Pick-up and drop off at your selected hotel/location by air-conditioned vehicle')).toBeInTheDocument();
    expect(screen.getByText('Tipping')).toBeInTheDocument();
  });

  it('does not render static fallback when activity rows are empty', () => {
    render(<WhatIncludedPanel items={[]} />);

    expect(screen.getByRole('heading', { name: "What's Included" })).toBeInTheDocument();
    expect(screen.queryByText('Pick-up and drop off at your selected hotel/location by air-conditioned vehicle')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /See/i })).not.toBeInTheDocument();
  });

  it('expands hidden dynamic inclusion rows only when more than six rows exist', () => {
    const items = Array.from({ length: 7 }, (_, index) => ({
      title: `Included item ${index + 1}`,
      description: '',
      included: true,
    }));

    render(<WhatIncludedPanel items={items} />);

    expect(screen.getByText('Included item 1')).toBeInTheDocument();
    expect(screen.queryByText('Included item 7')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'See 1 more' }));

    expect(screen.getByText('Included item 7')).toBeInTheDocument();
  });
});

describe('FaqPanel', () => {
  it("does not render What's Included items inside FAQs", () => {
    render(
      <FaqPanel
        faqs={[
          {
            title: 'Can I update my booking?',
            content: 'Contact support to change your selected date or package.',
          },
        ]}
      />,
    );

    expect(screen.getByRole('heading', { name: 'FAQs' })).toBeInTheDocument();
    expect(screen.getByText('Can I update my booking?')).toBeInTheDocument();
    expect(screen.getByText('Contact support to change your selected date or package.')).toBeInTheDocument();
    expect(screen.queryByText('Pick-up and drop off at your selected hotel/location by air-conditioned vehicle')).not.toBeInTheDocument();
    expect(screen.queryByText('Tipping')).not.toBeInTheDocument();
  });

  it('renders backend FAQ question and answer fields without falling back to static FAQs', () => {
    render(
      <FaqPanel
        faqs={[
          {
            question: 'What should I bring?',
            answer: 'Bring comfortable shoes and a refillable water bottle.',
          },
        ]}
      />,
    );

    expect(screen.getByText('What should I bring?')).toBeInTheDocument();
    expect(screen.getByText('Bring comfortable shoes and a refillable water bottle.')).toBeInTheDocument();
    expect(screen.queryByText('Pick-up and drop off at your selected hotel/location by air-conditioned vehicle')).not.toBeInTheDocument();
  });

  it('does not render the FAQ section when backend FAQs are empty', () => {
    render(<FaqPanel faqs={[]} />);

    expect(screen.queryByRole('heading', { name: 'FAQs' })).not.toBeInTheDocument();
    expect(screen.queryByText('Pick-up and drop off at your selected hotel/location by air-conditioned vehicle')).not.toBeInTheDocument();
    expect(screen.queryByText('Tipping')).not.toBeInTheDocument();
  });
});
