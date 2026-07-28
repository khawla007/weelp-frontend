import { fireEvent, render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';

import Accordion from '../Faq';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const items = [{ title: 'How does pickup work?', content: 'Meet your driver at the selected location.' }];
const multipleItems = [
  { id: 1, title: 'How does pickup work?', content: 'Meet your driver at the selected location.' },
  { id: 2, title: 'Can I change the date?', content: 'Contact support before the pickup time.' },
];
const originalRequestAnimationFrame = window.requestAnimationFrame;
const originalScrollBy = window.scrollBy;

afterEach(() => {
  window.requestAnimationFrame = originalRequestAnimationFrame;
  window.scrollBy = originalScrollBy;
});

describe('Accordion heading', () => {
  it('uses the established shared heading style by default', () => {
    usePathname.mockReturnValue('/cities/dubai');

    render(<Accordion items={items} />);

    const heading = screen.getByRole('heading', { name: 'FAQs' });

    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass('text-lg', 'font-extrabold', 'md:text-2xl', 'lg:text-[28px]');
  });

  it('supports page-specific heading typography', () => {
    usePathname.mockReturnValue('/transfers');

    render(<Accordion items={items} headingClassName="py-6 text-2xl font-semibold text-[var(--weelp-home-ink)] sm:text-3xl" />);

    expect(screen.getByRole('heading', { name: 'FAQs' })).toHaveClass('text-2xl', 'font-semibold', 'sm:text-3xl');
  });

  it('keeps the FAQ heading hidden on the booking page', () => {
    usePathname.mockReturnValue('/booking');

    render(<Accordion items={items} />);

    expect(screen.queryByRole('heading', { name: 'FAQs' })).not.toBeInTheDocument();
  });
});

describe('Accordion interaction', () => {
  beforeEach(() => {
    usePathname.mockReturnValue('/transfers');
  });

  it('uses accessible single-open triggers with smooth height and opacity transitions', () => {
    render(<Accordion items={multipleItems} />);

    const firstQuestion = screen.getByRole('button', { name: 'How does pickup work?' });
    const secondQuestion = screen.getByRole('button', { name: 'Can I change the date?' });

    expect(firstQuestion).toHaveAttribute('aria-expanded', 'false');
    expect(secondQuestion).toHaveAttribute('aria-expanded', 'false');
    expect(firstQuestion).toHaveAttribute('aria-controls');
    expect(document.getElementById(firstQuestion.getAttribute('aria-controls'))).toHaveAttribute('aria-hidden', 'true');
    expect(document.getElementById(firstQuestion.getAttribute('aria-controls'))).toHaveAttribute('inert');

    fireEvent.click(firstQuestion);
    fireEvent.click(secondQuestion);

    expect(firstQuestion).toHaveAttribute('aria-expanded', 'false');
    expect(secondQuestion).toHaveAttribute('aria-expanded', 'true');
    expect(document.getElementById(secondQuestion.getAttribute('aria-controls'))).toHaveAttribute('aria-hidden', 'false');
    expect(document.getElementById(secondQuestion.getAttribute('aria-controls'))).not.toHaveAttribute('inert');
    expect(screen.getByText('Contact support before the pickup time.')).toHaveClass('pt-2');
    expect(screen.getByText('Contact support before the pickup time.').parentElement.parentElement).toHaveClass('grid-rows-[1fr]', 'transition-[grid-template-rows,opacity]');
  });

  it('keeps the clicked trigger anchored when an open FAQ above it closes', () => {
    const animationFrames = [];
    window.requestAnimationFrame = jest.fn((callback) => {
      animationFrames.push(callback);
      return animationFrames.length;
    });
    window.scrollBy = jest.fn();

    render(<Accordion items={multipleItems} />);

    const firstQuestion = screen.getByRole('button', { name: 'How does pickup work?' });
    const secondQuestion = screen.getByRole('button', { name: 'Can I change the date?' });

    fireEvent.click(firstQuestion);
    secondQuestion.getBoundingClientRect = jest.fn().mockReturnValueOnce({ top: 320 }).mockReturnValueOnce({ top: 260 });
    fireEvent.click(secondQuestion);
    animationFrames.forEach((callback) => callback());

    expect(window.scrollBy).toHaveBeenCalledWith({ top: -60, left: 0, behavior: 'instant' });
  });
});
