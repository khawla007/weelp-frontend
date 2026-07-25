import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';

import Accordion from '../Faq';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const items = [{ title: 'How does pickup work?', content: 'Meet your driver at the selected location.' }];

describe('Accordion heading', () => {
  it('shows the FAQ heading on the transfers page', () => {
    usePathname.mockReturnValue('/transfers');

    render(<Accordion items={items} />);

    expect(screen.getByRole('heading', { name: 'FAQs' })).toBeInTheDocument();
  });

  it('keeps the FAQ heading hidden on the booking page', () => {
    usePathname.mockReturnValue('/booking');

    render(<Accordion items={items} />);

    expect(screen.queryByRole('heading', { name: 'FAQs' })).not.toBeInTheDocument();
  });
});
