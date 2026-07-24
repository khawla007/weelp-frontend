import React, { act } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server.node';

import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ThemeBootstrap } from '../ThemeBootstrap';
import { ThemeProvider } from '../ThemeProvider';

const HYDRATION_WARNING = /hydrat|did(?: not|n't) match/i;

function HydrationFixture() {
  return (
    <>
      <ThemeBootstrap />
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    </>
  );
}

describe('theme hydration', () => {
  let container;
  let root;
  let previousActEnvironment;

  beforeEach(() => {
    previousActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    localStorage.setItem('weelp-theme', 'dark');
    document.documentElement.className = 'dark';
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root.unmount();
      });
    }
    container.remove();
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.style.colorScheme = '';
    globalThis.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
    root = undefined;
  });

  it('hydrates explicit theme controls without React mismatch warnings', async () => {
    container.innerHTML = renderToString(<HydrationFixture />);
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    try {
      await act(async () => {
        root = hydrateRoot(container, <HydrationFixture />);
        await Promise.resolve();
      });

      const messages = [...consoleError.mock.calls, ...consoleWarn.mock.calls].flat().map(String);
      expect(messages.filter((message) => HYDRATION_WARNING.test(message))).toEqual([]);
    } finally {
      consoleError.mockRestore();
      consoleWarn.mockRestore();
    }
  });
});
