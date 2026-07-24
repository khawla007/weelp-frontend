import React from 'react';
import { render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server.node';

import RootLayout from '@/app/layout';
import { ThemeBootstrap } from '../ThemeBootstrap';
import { ThemeProvider } from '../ThemeProvider';
import { THEME_BOOTSTRAP_SCRIPT } from '../themeConfig';

let mockNextThemesProps;

jest.mock('next-themes', () => ({
  ThemeProvider: ({ children, ...props }) => {
    mockNextThemesProps = props;
    return <div data-testid="next-themes-provider">{children}</div>;
  },
  useTheme: () => ({ resolvedTheme: 'dark' }),
}));

jest.mock('next/script', () => ({
  __esModule: true,
  default: ({ id, strategy, dangerouslySetInnerHTML }) => <script id={id} data-strategy={strategy} dangerouslySetInnerHTML={dangerouslySetInnerHTML} />,
}));

jest.mock('next/font/google', () => ({
  Cormorant_Garamond: () => ({ variable: '--font-cormorant' }),
  Inter: () => ({ variable: '--font-inter' }),
  Inter_Tight: () => ({ variable: '--font-inter-tight' }),
  Montez: () => ({ variable: '--font-montez' }),
  Outfit: () => ({ variable: '--font-outfit' }),
}));

describe('ThemeProvider', () => {
  beforeEach(() => {
    mockNextThemesProps = undefined;
  });

  it('configures next-themes for persisted explicit themes', () => {
    render(
      <ThemeProvider>
        <span>Child content</span>
      </ThemeProvider>,
    );

    expect(screen.getByTestId('next-themes-provider')).toHaveTextContent('Child content');
    expect(mockNextThemesProps).toMatchObject({
      attribute: 'class',
      defaultTheme: 'dark',
      enableSystem: false,
      disableTransitionOnChange: true,
      storageKey: 'weelp-theme',
      themes: ['light', 'dark'],
    });
  });

  it('renders the bootstrap as a native inline script for parser-ordered execution', () => {
    const bootstrap = ThemeBootstrap();
    const { container } = render(bootstrap);
    const script = container.querySelector('#weelp-theme-bootstrap');

    expect(bootstrap.type).toBe('script');
    expect(script.innerHTML).toBe(THEME_BOOTSTRAP_SCRIPT);
  });

  it('mounts the bootstrap before application content without turning the layout into a client component', () => {
    const layout = RootLayout({ children: <main id="application-content">Application</main> });
    const markup = renderToStaticMarkup(layout);

    expect(layout.type).toBe('html');
    expect(layout.props.suppressHydrationWarning).toBe(true);
    expect(markup.indexOf('weelp-theme-bootstrap')).toBeGreaterThan(-1);
    expect(markup.indexOf('weelp-theme-bootstrap')).toBeLessThan(markup.indexOf('application-content'));
  });
});
