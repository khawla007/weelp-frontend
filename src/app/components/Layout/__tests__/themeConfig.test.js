import React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { renderToStaticMarkup } from 'react-dom/server.node';

import { DEFAULT_THEME, EXPLICIT_THEMES, THEME_BOOTSTRAP_SCRIPT, THEME_COLORS, THEME_STORAGE_KEY, resolveExplicitTheme } from '../themeConfig';

function executeBootstrap(storage) {
  // The bootstrap is deliberately shipped as source so it can run before React.
  Function('document', 'localStorage', THEME_BOOTSTRAP_SCRIPT)(document, storage);
}

function createStorage(savedTheme) {
  return {
    getItem: jest.fn(() => savedTheme),
    removeItem: jest.fn(),
    setItem: jest.fn(),
  };
}

function appendThemeColorMeta(content) {
  const meta = document.createElement('meta');
  meta.name = 'theme-color';
  meta.content = content;
  document.head.append(meta);
  return meta;
}

function createStatefulStorage(savedTheme, { throwOnSet = false } = {}) {
  const values = new Map([[THEME_STORAGE_KEY, savedTheme]]);

  return {
    getItem: jest.fn((key) => values.get(key) ?? null),
    removeItem: jest.fn((key) => {
      values.delete(key);
    }),
    setItem: jest.fn((key, value) => {
      if (throwOnSet) {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      }
      values.set(key, value);
    }),
    storedTheme: () => values.get(THEME_STORAGE_KEY) ?? null,
  };
}

function getNextThemesBootstrapScript() {
  const markup = renderToStaticMarkup(
    React.createElement(
      NextThemesProvider,
      {
        attribute: 'class',
        defaultTheme: DEFAULT_THEME,
        enableSystem: false,
        storageKey: THEME_STORAGE_KEY,
        themes: EXPLICIT_THEMES,
      },
      React.createElement('span', null, 'Theme content'),
    ),
  );
  const template = document.createElement('template');
  template.innerHTML = markup;
  return template.content.querySelector('script').textContent;
}

describe('themeConfig', () => {
  afterEach(() => {
    document.documentElement.className = '';
    document.documentElement.style.colorScheme = '';
    document.head.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.remove());
  });

  it('defines dark as the explicit first-visit default', () => {
    expect(DEFAULT_THEME).toBe('dark');
    expect(THEME_STORAGE_KEY).toBe('weelp-theme');
    expect(THEME_COLORS).toEqual({
      dark: '#08110e',
      light: '#ffffff',
    });
  });

  it.each([
    ['light', 'light'],
    ['dark', 'dark'],
    ['system', 'dark'],
    ['', 'dark'],
    ['corrupt', 'dark'],
    [undefined, 'dark'],
  ])('normalizes %p to %s', (theme, expected) => {
    expect(resolveExplicitTheme(theme)).toBe(expected);
  });

  it.each([
    ['light', 'light'],
    ['dark', 'dark'],
  ])('applies a saved %s preference before hydration', (savedTheme, expected) => {
    const storage = createStorage(savedTheme);

    executeBootstrap(storage);

    expect(document.documentElement).toHaveClass(expected);
    expect(document.documentElement).not.toHaveClass(expected === 'dark' ? 'light' : 'dark');
    expect(document.documentElement.style.colorScheme).toBe(expected);
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it('corrects the server-dark theme color to a saved light preference before hydration', () => {
    const serverMeta = appendThemeColorMeta(THEME_COLORS.dark);

    executeBootstrap(createStorage('light'));

    expect(document.head.querySelectorAll('meta[name="theme-color"]')).toHaveLength(1);
    expect(document.head.querySelector('meta[name="theme-color"]')).toBe(serverMeta);
    expect(serverMeta).toHaveAttribute('content', THEME_COLORS.light);
  });

  it('creates one theme-color meta before hydration when the server tag is missing', () => {
    executeBootstrap(createStorage('light'));

    expect(document.head.querySelectorAll('meta[name="theme-color"]')).toHaveLength(1);
    expect(document.head.querySelector('meta[name="theme-color"]')).toHaveAttribute('content', THEME_COLORS.light);
  });

  it.each([
    ['light', 'system dark'],
    ['dark', 'system light dark'],
  ])('replaces stale theme classes with only the saved %s class', (savedTheme, staleClasses) => {
    document.documentElement.className = staleClasses;

    executeBootstrap(createStorage(savedTheme));

    expect([...document.documentElement.classList]).toEqual([savedTheme]);
  });

  it.each([null, undefined, '', 'system', 'corrupt'])('normalizes %p to dark and persists the repaired preference', (savedTheme) => {
    const storage = createStorage(savedTheme);
    const serverMeta = appendThemeColorMeta(THEME_COLORS.light);

    executeBootstrap(storage);

    expect(document.documentElement).toHaveClass('dark');
    expect(document.documentElement).not.toHaveClass('light');
    expect(document.documentElement.style.colorScheme).toBe('dark');
    expect(serverMeta).toHaveAttribute('content', THEME_COLORS.dark);
    expect(document.head.querySelectorAll('meta[name="theme-color"]')).toHaveLength(1);
    expect(storage.setItem).toHaveBeenCalledWith('weelp-theme', 'dark');
  });

  it('still applies dark when storage access is denied', () => {
    const serverMeta = appendThemeColorMeta(THEME_COLORS.light);
    const storage = {
      getItem: jest.fn(() => {
        throw new DOMException('Denied', 'SecurityError');
      }),
      setItem: jest.fn(() => {
        throw new DOMException('Denied', 'SecurityError');
      }),
    };

    expect(() => executeBootstrap(storage)).not.toThrow();
    expect(document.documentElement).toHaveClass('dark');
    expect(document.documentElement).not.toHaveClass('light');
    expect(document.documentElement.style.colorScheme).toBe('dark');
    expect(serverMeta).toHaveAttribute('content', THEME_COLORS.dark);
    expect(document.head.querySelectorAll('meta[name="theme-color"]')).toHaveLength(1);
  });

  it.each(['system', 'corrupt'])('removes readable invalid storage before a failed dark repair for %s', (invalidTheme) => {
    const storage = createStatefulStorage(invalidTheme, { throwOnSet: true });

    expect(() => executeBootstrap(storage)).not.toThrow();

    expect(storage.removeItem).toHaveBeenCalledWith(THEME_STORAGE_KEY);
    expect(storage.storedTheme()).toBeNull();
    expect(document.documentElement).toHaveClass('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it.each(['system', 'corrupt'])('keeps the real next-themes bootstrap dark after failed repair of %s', (invalidTheme) => {
    const storage = createStatefulStorage(invalidTheme, { throwOnSet: true });

    executeBootstrap(storage);
    Function('document', 'localStorage', 'window', getNextThemesBootstrapScript())(document, storage, window);

    expect([...document.documentElement.classList]).toEqual(['dark']);
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('preserves an unrelated class that happens to equal invalid storage', () => {
    const storage = createStatefulStorage('application-shell');
    const serverMeta = appendThemeColorMeta(THEME_COLORS.light);
    document.documentElement.classList.add('application-shell');

    executeBootstrap(storage);

    expect([...document.documentElement.classList]).toEqual(['application-shell', 'dark']);
    expect(storage.storedTheme()).toBe('dark');
    expect(serverMeta).toHaveAttribute('content', THEME_COLORS.dark);
  });

  it('normalizes invalid storage before the real next-themes bootstrap can apply it', () => {
    const storage = createStatefulStorage('corrupt-value');
    const serverMeta = appendThemeColorMeta(THEME_COLORS.light);
    document.documentElement.classList.add('application-shell');

    executeBootstrap(storage);
    Function('document', 'localStorage', 'window', getNextThemesBootstrapScript())(document, storage, window);

    expect([...document.documentElement.classList]).toEqual(['application-shell', 'dark']);
    expect(storage.storedTheme()).toBe('dark');
    expect(serverMeta).toHaveAttribute('content', THEME_COLORS.dark);
  });

  it.each([
    ['', 'application-shell stray', ['application-shell', 'stray', 'dark']],
    [' ', 'application-shell stray', ['application-shell', 'stray', 'dark']],
    ['\t', 'application-shell stray', ['application-shell', 'stray', 'dark']],
    ['corrupt value', 'application-shell corrupt value system', ['application-shell', 'corrupt', 'value', 'dark']],
  ])('normalizes malformed value %p without removing unrelated classes or throwing', (invalidTheme, initialClasses, expectedClasses) => {
    const storage = createStatefulStorage(invalidTheme);
    const serverMeta = appendThemeColorMeta(THEME_COLORS.light);
    document.documentElement.className = initialClasses;

    expect(() => executeBootstrap(storage)).not.toThrow();

    expect([...document.documentElement.classList]).toEqual(expectedClasses);
    expect(storage.storedTheme()).toBe('dark');
    expect(serverMeta).toHaveAttribute('content', THEME_COLORS.dark);
  });
});
