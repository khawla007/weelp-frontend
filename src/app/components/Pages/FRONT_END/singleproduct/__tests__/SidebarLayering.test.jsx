import { render, screen } from '@testing-library/react';

jest.mock('../TabSection__modules', () => ({
  OverViewPanel: () => <div />,
  WhatIncludedPanel: () => <div />,
  ReviewPanel: () => <div />,
  FaqPanel: () => <div />,
  normalizeFaqItems: () => [],
  normalizeInclusionItems: () => [],
}));

jest.mock('../SimilarExperiences', () => ({
  __esModule: true,
  default: () => <section aria-label="Similar Experiences">Similar Experiences</section>,
}));

jest.mock('../ItineraryPanel', () => ({
  __esModule: true,
  default: () => <div />,
}));

jest.mock('../ItineraryEditActionBar', () => ({
  __esModule: true,
  default: () => <div />,
}));

jest.mock('@/app/components/ui/Reveal', () => ({
  __esModule: true,
  default: ({ children, className = '', ...props }) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
}));

jest.mock('@/lib/store/useMiniCartStore', () => ({
  __esModule: true,
  default: () => ({ cartItems: [], setMiniCartOpen: jest.fn() }),
}));

jest.mock('@/app/components/Form/SingleProductForm', () => ({
  __esModule: true,
  default: ({ formId }) => <form id={formId} />,
}));

jest.mock('swr', () => ({
  __esModule: true,
  default: () => ({ data: undefined }),
}));

import SingleProductTabSection from '../SingleProductTabSection';
import ProductSidebar from '../ProductSidebar';

describe('single product sidebar layering', () => {
  beforeEach(() => {
    window.IntersectionObserver = jest.fn(() => ({
      observe: jest.fn(),
      disconnect: jest.fn(),
    }));
  });

  it('keeps the decorative bottom image behind the sidebar column content', () => {
    const { container } = render(
      <SingleProductTabSection
        productType="activity"
        productId={3}
        productData={{ id: 3, name: 'Desert Safari', pricing: { regular_price: 244, currency: 'USD' }, addons: [], faqs: [] }}
        citySlug="dubai"
        activitySlug="desert-safari"
      />,
    );

    const decorativeImageLayer = [...container.querySelectorAll('[aria-hidden="true"]')].find((element) => element.className.includes('pointer-events-none'));

    expect(decorativeImageLayer).toHaveClass('z-0');
    expect(decorativeImageLayer.parentElement).toHaveClass('xl:self-start');
    expect(screen.getByRole('heading', { name: 'Questions?' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Help Center' })).toBeInTheDocument();
  });

  it('positions ProductSidebar content above decorative backgrounds', () => {
    const { container } = render(<ProductSidebar productId={3} productType="activity" productData={{ id: 3, pricing: { regular_price: 244, currency: 'USD' }, addons: [] }} />);

    expect(container.firstElementChild).toHaveClass('relative', 'z-[1]');
    expect(screen.getByRole('heading', { name: 'Questions?' })).toBeInTheDocument();
  });

  it('keeps the questions card after mobile similar experiences', () => {
    render(
      <ProductSidebar
        productId={3}
        productType="activity"
        productData={{ id: 3, pricing: { regular_price: 244, currency: 'USD' }, addons: [] }}
        mobileSimilarActivities={[{ id: 10, name: 'Desert Safari' }]}
      />,
    );

    const bookingAction = screen.getByRole('button', { name: 'Select' });
    const similarExperiences = screen.getByLabelText('Similar Experiences');
    const questionsHeading = screen.getByRole('heading', { name: 'Questions?' });

    expect(bookingAction.compareDocumentPosition(similarExperiences)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(similarExperiences.compareDocumentPosition(questionsHeading)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });
});
