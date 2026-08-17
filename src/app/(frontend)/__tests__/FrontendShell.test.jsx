import { render } from '@testing-library/react';

import { FrontendShell } from '../FrontendShell';

const usePathnameMock = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
}));

jest.mock('@/hooks/useNavigationEvents', () => ({
  useNavigationEvents: jest.fn(),
}));

jest.mock('@/app/components/Navigation/NavigationProgressBar', () => ({
  NavigationProgressBar: () => null,
}));

beforeEach(() => {
  usePathnameMock.mockReset();
  window.scrollTo = jest.fn();
  document.body.classList.remove('home-gold-theme');
});

describe('FrontendShell home theme scope', () => {
  it('scopes the gold theme to /home-gold', () => {
    usePathnameMock.mockReturnValue('/home-gold');

    const { container } = render(
      <FrontendShell header={<header />} footer={<footer />}>
        Content
      </FrontendShell>,
    );

    expect(container.firstChild).toHaveClass('home-gold-theme');
    expect(container.firstChild).toHaveAttribute('data-weelp-home-variant', 'gold');
    expect(document.body).toHaveClass('home-gold-theme');
  });

  it('leaves the canonical homepage theme unchanged', () => {
    usePathnameMock.mockReturnValue('/');

    const { container } = render(
      <FrontendShell header={<header />} footer={<footer />}>
        Content
      </FrontendShell>,
    );

    expect(container.firstChild).not.toHaveClass('home-gold-theme');
    expect(container.firstChild).not.toHaveAttribute('data-weelp-home-variant');
    expect(document.body).not.toHaveClass('home-gold-theme');
  });

  it('cleans the portal-host scope when navigation leaves /home-gold', () => {
    usePathnameMock.mockReturnValue('/home-gold');
    const { rerender } = render(
      <FrontendShell header={<header />} footer={<footer />}>
        Content
      </FrontendShell>,
    );
    expect(document.body).toHaveClass('home-gold-theme');

    usePathnameMock.mockReturnValue('/');
    rerender(
      <FrontendShell header={<header />} footer={<footer />}>
        Content
      </FrontendShell>,
    );

    expect(document.body).not.toHaveClass('home-gold-theme');
  });
});
