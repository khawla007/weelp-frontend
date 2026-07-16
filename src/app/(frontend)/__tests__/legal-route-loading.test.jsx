import { render, screen } from '@testing-library/react';

import CancellationLoading from '../cancellation/loading';
import PrivacyLoading from '../privacy/loading';
import TermsLoading from '../terms/loading';

describe('Step 7 legal route loading states', () => {
  it.each([
    ['privacy', PrivacyLoading],
    ['terms', TermsLoading],
    ['cancellation', CancellationLoading],
  ])('renders a contained CMS loading placeholder for %s', (_slug, LoadingComponent) => {
    const { container } = render(<LoadingComponent />);

    expect(screen.getByRole('status', { name: 'Loading legal page' })).toBeInTheDocument();
    expect(container.querySelector('[data-legal-page-loading]')).toBeInTheDocument();
  });
});
