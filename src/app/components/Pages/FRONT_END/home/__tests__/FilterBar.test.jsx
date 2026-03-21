import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

import FilterBar from '../FilterBar';
import { getCitiesRegions } from '../../../../../../lib/services/global';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('../../../../../../lib/services/global', () => ({
  getCitiesRegions: jest.fn().mockResolvedValue([]),
}));

describe('FilterBar', () => {
  it('renders the old design filter fields (Where to, When, How Many)', async () => {
    render(<FilterBar />);
    await waitFor(() => expect(getCitiesRegions).toHaveBeenCalled());

    expect(screen.getByPlaceholderText('Where To?')).toBeInTheDocument();
    expect(screen.getByText('When?')).toBeInTheDocument();
    expect(screen.getByText(/Guest/i)).toBeInTheDocument();
  });
});
