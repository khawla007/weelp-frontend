import React from 'react';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { render } from '@testing-library/react';

import RootLayout, { viewport } from '@/app/layout';
import { ThemeColorMeta } from '../ThemeColorMeta';
import { ThemeProvider } from '../ThemeProvider';
import { THEME_COLORS } from '../themeConfig';

let mockResolvedTheme = 'dark';

jest.mock('next-themes', () => ({
  ThemeProvider: ({ children }) => children,
  useTheme: () => ({ resolvedTheme: mockResolvedTheme }),
}));

jest.mock('next/font/google', () => ({
  Cormorant_Garamond: () => ({ variable: '--font-cormorant' }),
  Inter: () => ({ variable: '--font-inter' }),
  Inter_Tight: () => ({ variable: '--font-inter-tight' }),
  Montez: () => ({ variable: '--font-montez' }),
  Outfit: () => ({ variable: '--font-outfit' }),
}));

describe('ThemeColorMeta', () => {
  beforeEach(() => {
    mockResolvedTheme = 'dark';
    document.head.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.remove());
  });

  afterEach(() => {
    document.head.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.remove());
  });

  it('updates the existing server meta from dark to light without competing with it', () => {
    const serverMeta = document.createElement('meta');
    serverMeta.name = 'theme-color';
    serverMeta.content = THEME_COLORS.dark;
    document.head.append(serverMeta);

    const { rerender, unmount } = render(<ThemeColorMeta />);

    expect(document.head.querySelectorAll('meta[name="theme-color"]')).toHaveLength(1);
    expect(document.head.querySelector('meta[name="theme-color"]')).toBe(serverMeta);
    expect(serverMeta).toHaveAttribute('content', THEME_COLORS.dark);

    mockResolvedTheme = 'light';
    rerender(<ThemeColorMeta />);

    expect(document.head.querySelectorAll('meta[name="theme-color"]')).toHaveLength(1);
    expect(document.head.querySelector('meta[name="theme-color"]')).toBe(serverMeta);
    expect(serverMeta).toHaveAttribute('content', THEME_COLORS.light);

    unmount();
    expect(serverMeta).toBeInTheDocument();
  });

  it('creates one durable meta when missing and never duplicates it across rerenders', () => {
    const { rerender, unmount } = render(<ThemeColorMeta />);
    const createdMeta = document.head.querySelector('meta[name="theme-color"]');

    expect(document.head.querySelectorAll('meta[name="theme-color"]')).toHaveLength(1);
    expect(createdMeta).toHaveAttribute('content', THEME_COLORS.dark);

    mockResolvedTheme = 'light';
    rerender(<ThemeColorMeta />);
    mockResolvedTheme = 'dark';
    rerender(<ThemeColorMeta />);

    expect(document.head.querySelectorAll('meta[name="theme-color"]')).toHaveLength(1);
    expect(document.head.querySelector('meta[name="theme-color"]')).toBe(createdMeta);
    expect(createdMeta).toHaveAttribute('content', THEME_COLORS.dark);

    unmount();
    expect(createdMeta).toBeInTheDocument();
  });

  it('keeps a created document singleton available to another mounted instance', () => {
    const creator = render(<ThemeColorMeta />);
    const remaining = render(<ThemeColorMeta />);
    const createdMeta = document.head.querySelector('meta[name="theme-color"]');

    expect(document.head.querySelectorAll('meta[name="theme-color"]')).toHaveLength(1);

    creator.unmount();

    expect(document.head.querySelectorAll('meta[name="theme-color"]')).toHaveLength(1);
    expect(createdMeta).toBeInTheDocument();

    mockResolvedTheme = 'light';
    remaining.rerender(<ThemeColorMeta />);

    expect(document.head.querySelectorAll('meta[name="theme-color"]')).toHaveLength(1);
    expect(document.head.querySelector('meta[name="theme-color"]')).toBe(createdMeta);
    expect(createdMeta).toHaveAttribute('content', THEME_COLORS.light);
  });

  it.each([undefined, 'system', 'corrupt'])('falls back to dark for an unresolved theme value of %p', (resolvedTheme) => {
    mockResolvedTheme = resolvedTheme;

    render(<ThemeColorMeta />);

    expect(document.head.querySelector('meta[name="theme-color"]')).toHaveAttribute('content', THEME_COLORS.dark);
  });
});

describe('root theme-color integration', () => {
  it('exports the server viewport configuration', () => {
    expect(viewport).toEqual({
      colorScheme: 'dark light',
      themeColor: THEME_COLORS.dark,
    });
  });

  it('keeps the layout server-side and mounts ThemeColorMeta inside ThemeProvider before children', () => {
    const source = readFileSync(path.join(process.cwd(), 'src/app/layout.js'), 'utf8');
    const application = <main id="application-content">Application</main>;
    const layout = RootLayout({ children: application });
    const body = layout.props.children;
    const bodyChildren = React.Children.toArray(body.props.children);
    const provider = bodyChildren.find((child) => child.type === ThemeProvider);
    const providerChildren = provider.props.children;

    expect(source).not.toMatch(/^\s*['"]use client['"]/);
    expect(providerChildren[0].type).toBe(ThemeColorMeta);
    expect(providerChildren[1]).toBe(application);
  });
});
