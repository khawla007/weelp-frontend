import { render } from '@testing-library/react';

import AiSection from '../AiSection';

jest.mock('../../../../../../lib/services/activites', () => ({
  getAllFeaturedActivities: jest.fn(() => Promise.resolve([])),
}));

jest.mock(
  '../../../../ui/CarouselShell',
  () =>
    function CarouselShellMock() {
      return null;
    },
);

describe('AiSection', () => {
  it('renders the four pen-canonical card titles', async () => {
    const ui = await AiSection();
    const { getByText } = render(ui);
    expect(getByText('Buddy — AI Travel Guide')).toBeInTheDocument();
    expect(getByText('Suggestions on Map')).toBeInTheDocument();
    expect(getByText('Save Money')).toBeInTheDocument();
    expect(getByText('Personalised for you')).toBeInTheDocument();
  });

  it('uses the pen-canonical heading copy', async () => {
    const ui = await AiSection();
    const { getByText } = render(ui);
    expect(getByText('Your AI Travel Buddy')).toBeInTheDocument();
  });
});
