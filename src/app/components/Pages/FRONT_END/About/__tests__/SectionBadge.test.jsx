// frontend/src/app/components/Pages/FRONT_END/About/__tests__/SectionBadge.test.jsx
import { render, screen } from '@testing-library/react';
import { Star } from 'lucide-react';
import SectionBadge from '../SectionBadge';

describe('SectionBadge', () => {
  it('renders its label text', () => {
    render(<SectionBadge icon={Star}>Our Story</SectionBadge>);
    expect(screen.getByText('Our Story')).toBeInTheDocument();
  });

  it('renders without an icon', () => {
    render(<SectionBadge>No Icon</SectionBadge>);
    expect(screen.getByText('No Icon')).toBeInTheDocument();
  });

  it('appends a custom className', () => {
    render(<SectionBadge className="mx-auto">Centered</SectionBadge>);
    expect(screen.getByText('Centered').className).toContain('mx-auto');
  });
});
