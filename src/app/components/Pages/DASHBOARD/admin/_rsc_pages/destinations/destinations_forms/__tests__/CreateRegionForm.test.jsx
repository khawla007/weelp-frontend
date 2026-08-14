import { render, screen } from '@testing-library/react';

import { CreateRegionForm } from '../CreateRegionForm';

jest.mock('next/navigation', () => ({
  useParams: () => ({}),
  useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: jest.fn() }),
}));

jest.mock('@/lib/actions/regionActions', () => ({
  createRegion: jest.fn(),
  editRegion: jest.fn(),
}));

jest.mock('swr', () => ({
  __esModule: true,
  default: () => ({ data: { data: [] } }),
}));

jest.mock('@/lib/store/useMediaStore', () => ({
  useMediaStore: () => ({ resetMedia: jest.fn(), selectedMedia: [] }),
}));

jest.mock('@/app/components/Pages/DASHBOARD/admin/_rsc_pages/media/MediaLibrary', () => ({
  Medialibrary: () => null,
}));

jest.mock('@/components/ui/combobox_multi', () => ({
  ComboboxMultiple: ({ searchInputClassName }) => <input aria-label="Country search" data-search-input-class-name={searchInputClassName} />,
}));

describe('CreateRegionForm', () => {
  it('removes the focus outline from the country dropdown search', () => {
    render(<CreateRegionForm />);

    expect(screen.getByLabelText('Country search')).toHaveAttribute('data-search-input-class-name', 'focus-visible:outline-none');
  });
});
