import { render, screen } from '@testing-library/react';

jest.mock('../SingleProductReview', () => ({
  SingleProductReview: () => null,
}));

import { FaqPanel } from '../TabSection__modules';

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

  it('does not render static FAQs when backend FAQs are empty', () => {
    render(<FaqPanel faqs={[]} />);

    expect(screen.getByRole('heading', { name: 'FAQs' })).toBeInTheDocument();
    expect(screen.queryByText('Pick-up and drop off at your selected hotel/location by air-conditioned vehicle')).not.toBeInTheDocument();
    expect(screen.queryByText('Tipping')).not.toBeInTheDocument();
  });
});
