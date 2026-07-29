import { fireEvent, render, screen } from '@testing-library/react';

jest.mock('../SingleProductReview', () => ({
  SingleProductReview: () => null,
}));

import { FaqPanel, WhatIncludedPanel } from '../TabSection__modules';

const originalRequestAnimationFrame = window.requestAnimationFrame;
const originalScrollBy = window.scrollBy;

afterEach(() => {
  window.requestAnimationFrame = originalRequestAnimationFrame;
  window.scrollBy = originalScrollBy;
  jest.restoreAllMocks();
});

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
  it('reserves the tallest answer height so the following section stays fixed', () => {
    const rectSpy = jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
      return {
        width: 600,
        height: this.dataset.stableFaq === 'true' ? 180 : 0,
        top: 0,
        right: 600,
        bottom: 0,
        left: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      };
    });
    const scrollHeightSpy = jest.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(function () {
      if (this.dataset.faqAnswerContent === 'true') {
        return this.textContent.includes('longer answer') ? 90 : 50;
      }

      return 0;
    });

    render(
      <FaqPanel
        faqs={[
          { question: 'Short answer?', answer: 'A short answer.' },
          { question: 'Long answer?', answer: 'A longer answer that needs more reserved space.' },
        ]}
      />,
    );

    const faqPanel = document.querySelector('[data-stable-faq="true"]');
    expect(faqPanel).toHaveStyle({ minHeight: '270px' });

    fireEvent.click(screen.getByRole('button', { name: 'Long answer?' }));
    expect(faqPanel).toHaveStyle({ minHeight: '270px' });

    rectSpy.mockRestore();
    scrollHeightSpy.mockRestore();
  });

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

  it('closes the previously open FAQ when another FAQ is opened', () => {
    render(
      <FaqPanel
        faqs={[
          {
            question: 'What should I bring?',
            answer: 'Bring comfortable shoes.',
          },
          {
            question: 'Is this suitable for beginners?',
            answer: 'Yes, beginners can join.',
          },
        ]}
      />,
    );

    const firstQuestion = screen.getByRole('button', { name: 'What should I bring?' });
    const secondQuestion = screen.getByRole('button', { name: 'Is this suitable for beginners?' });
    const firstItem = firstQuestion.parentElement;

    expect(firstQuestion).toHaveAttribute('aria-expanded', 'true');
    expect(secondQuestion).toHaveAttribute('aria-expanded', 'false');
    expect(firstItem).toHaveClass('overflow-hidden', 'rounded-2xl', 'bg-background', 'shadow-sm');
    expect(firstQuestion).toHaveClass('rounded-2xl', 'p-3', 'md:p-4', 'focus-visible:ring-inset');
    expect(firstQuestion.firstElementChild).toHaveClass('text-sm', 'font-bold', 'leading-[1.2]');
    expect(firstQuestion).not.toHaveClass('rounded-t-2xl');
    expect(firstQuestion).not.toHaveClass('rounded-b-2xl');
    expect(firstQuestion).not.toHaveClass('p-5');
    expect(firstQuestion).not.toHaveClass('hover:bg-surface-tint');
    expect(firstQuestion).not.toHaveClass('focus-visible:ring-offset-2');
    expect(secondQuestion).toHaveClass('rounded-2xl', 'focus-visible:ring-inset');
    expect(screen.getByText('Bring comfortable shoes.')).toHaveClass('px-4', 'pb-4');
    expect(firstQuestion).toHaveAttribute('aria-controls');
    expect(document.getElementById(firstQuestion.getAttribute('aria-controls'))).toHaveAttribute('aria-hidden', 'false');
    const secondPanel = document.getElementById(secondQuestion.getAttribute('aria-controls'));
    expect(secondPanel).toHaveAttribute('aria-hidden', 'true');
    expect(secondPanel).toHaveAttribute('inert');
    expect(secondPanel).toHaveClass('grid-rows-[0fr]', 'opacity-0', 'overflow-hidden');
    expect(secondQuestion.querySelector('svg')).toHaveClass('motion-reduce:transition-none');

    fireEvent.click(secondQuestion);

    expect(firstQuestion).toHaveAttribute('aria-expanded', 'false');
    expect(secondQuestion).toHaveAttribute('aria-expanded', 'true');
    expect(firstQuestion).toHaveClass('rounded-2xl');
    expect(secondQuestion).toHaveClass('rounded-2xl');
    expect(firstQuestion).not.toHaveClass('rounded-t-2xl');
    expect(firstQuestion).not.toHaveClass('rounded-b-2xl');
    expect(secondQuestion).not.toHaveClass('rounded-t-2xl');
    expect(secondQuestion).not.toHaveClass('rounded-b-2xl');
    expect(document.getElementById(firstQuestion.getAttribute('aria-controls'))).toHaveClass('grid-rows-[0fr]', 'opacity-0', 'overflow-hidden');
  });

  it('keeps the same FAQ open when backend items reorder', () => {
    const firstFaq = { id: 11, question: 'What should I bring?', answer: 'Bring comfortable shoes.' };
    const secondFaq = { id: 12, question: 'Is this suitable for beginners?', answer: 'Yes, beginners can join.' };
    const { rerender } = render(<FaqPanel faqs={[firstFaq, secondFaq]} />);

    fireEvent.click(screen.getByRole('button', { name: secondFaq.question }));
    rerender(<FaqPanel faqs={[secondFaq, firstFaq]} />);

    expect(screen.getByRole('button', { name: secondFaq.question })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: firstFaq.question })).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps all FAQs closed when backend items reorder after the user collapses the open item', () => {
    const firstFaq = { id: 11, question: 'What should I bring?', answer: 'Bring comfortable shoes.' };
    const secondFaq = { id: 12, question: 'Is this suitable for beginners?', answer: 'Yes, beginners can join.' };
    const { rerender } = render(<FaqPanel faqs={[firstFaq, secondFaq]} />);

    fireEvent.click(screen.getByRole('button', { name: firstFaq.question }));
    rerender(<FaqPanel faqs={[secondFaq, firstFaq]} />);

    expect(screen.getByRole('button', { name: firstFaq.question })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: secondFaq.question })).toHaveAttribute('aria-expanded', 'false');
  });

  it('preserves the open FAQ when its answer text changes and no backend ID is available', () => {
    const firstFaq = { question: 'What should I bring?', answer: 'Bring comfortable shoes.' };
    const secondFaq = { question: 'Is this suitable for beginners?', answer: 'Yes, beginners can join.' };
    const { rerender } = render(<FaqPanel faqs={[firstFaq, secondFaq]} />);

    fireEvent.click(screen.getByRole('button', { name: secondFaq.question }));
    rerender(<FaqPanel faqs={[firstFaq, { ...secondFaq, answer: 'Yes, no previous experience is required.' }]} />);

    expect(screen.getByRole('button', { name: secondFaq.question })).toHaveAttribute('aria-expanded', 'true');
  });

  it('animates FAQ height and opacity together to avoid abrupt layout jumps', () => {
    render(
      <FaqPanel
        faqs={[
          {
            question: 'What should I bring?',
            answer: 'Bring comfortable shoes.',
          },
        ]}
      />,
    );

    expect(screen.getByText('Bring comfortable shoes.')).toHaveClass('pt-2');
    expect(screen.getByText('Bring comfortable shoes.').parentElement.parentElement).toHaveClass('grid-rows-[1fr]', 'transition-[grid-template-rows,opacity]');
  });

  it('keeps the clicked FAQ trigger anchored when switching from an open FAQ above it', () => {
    const animationFrames = [];
    window.requestAnimationFrame = jest.fn((callback) => {
      animationFrames.push(callback);
      return animationFrames.length;
    });
    window.scrollBy = jest.fn();

    render(
      <FaqPanel
        faqs={[
          {
            question: 'What should I bring?',
            answer: 'Bring comfortable shoes.',
          },
          {
            question: 'Is this suitable for beginners?',
            answer: 'Yes, beginners can join.',
          },
        ]}
      />,
    );

    const secondQuestion = screen.getByRole('button', { name: 'Is this suitable for beginners?' });
    secondQuestion.getBoundingClientRect = jest.fn().mockReturnValueOnce({ top: 320 }).mockReturnValueOnce({ top: 260 });

    fireEvent.click(secondQuestion);
    animationFrames.forEach((callback) => callback());

    expect(window.scrollBy).toHaveBeenCalledWith({ top: -60, left: 0, behavior: 'instant' });
  });

  it('does not render the FAQ section when backend FAQs are empty', () => {
    render(<FaqPanel faqs={[]} />);

    expect(screen.queryByRole('heading', { name: 'FAQs' })).not.toBeInTheDocument();
    expect(screen.queryByText('Pick-up and drop off at your selected hotel/location by air-conditioned vehicle')).not.toBeInTheDocument();
    expect(screen.queryByText('Tipping')).not.toBeInTheDocument();
  });
});
