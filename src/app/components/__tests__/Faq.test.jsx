import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';

import Accordion from '../Faq';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const items = [{ title: 'How does pickup work?', content: 'Meet your driver at the selected location.' }];

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
