import { render } from '@testing-library/react';

import AiSection from '../AiSection';

describe('AiSection', () => {
  it('renders the four pen-canonical card titles', () => {
    const { getByText } = render(<AiSection />);
    expect(getByText('AI Chat Assistant')).toBeInTheDocument();
    expect(getByText('Suggestions on Map')).toBeInTheDocument();
    expect(getByText('Save Money')).toBeInTheDocument();
    expect(getByText('Personalised for you')).toBeInTheDocument();
  });

  it('uses the pen-canonical heading copy', () => {
    const { getByText } = render(<AiSection />);
    expect(getByText('Your AI Travel Buddy')).toBeInTheDocument();
  });
});
