# Deep Forest Dark Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Deep Forest the default theme across Weelp while preserving a remembered light-mode option and applying the approved forest palette to every semantic dark surface.

**Architecture:** Keep `next-themes` as the single theme-state owner and keep CSS variables in `globals.css` as the single palette boundary. Components continue consuming semantic utilities; only standalone CSS surfaces and the city hero that bypass the token layer receive focused migrations.

**Tech Stack:** Next.js 16 App Router, React 19, next-themes, Tailwind CSS, CSS custom properties, Jest, Testing Library

---

## Required execution skills

Before changing Next.js or React code, invoke `next-best-practices`, `vercel-react-best-practices`, and `vercel-composition-patterns`. Use `test-driven-development` for every behavior change. After every task that changes code, invoke `error-handling-patterns` immediately before that task’s type-check, lint, and visible-browser checkpoint. After implementation, perform the full visible-browser matrix, dispatch the code-reviewer agent, and invoke `simplify` before the final verification and push.

Run every command from the frontend repository:

```bash
cd "/run/media/ashish-khawla/Website data/Fanatic Developement/weelp/frontend"
```

Do not create intermediate commits. The project workflow requires the code-review, simplify, and verification gates to pass before the first implementation commit.

The user approved the plan-review accessibility refinement on July 24, 2026: use `#4D8069` instead of `#304B40` for input/control boundaries, and use `#F87171` with `#07100D` for destructive surfaces. Task 5 preserves that decision in the design specification.

## File map

- `src/app/components/Layout/themeConfig.js` — shared theme constants, explicit-value normalization, and pre-hydration bootstrap source.
- `src/app/components/Layout/ThemeBootstrap.jsx` — places the bootstrap before hydration.
- `src/app/components/Layout/ThemeColorMeta.jsx` — keeps ordinary browser chrome synchronized after theme changes.
- `src/app/components/Layout/ThemeProvider.jsx` — first-visit default and persistence behavior.
- `src/app/components/Layout/__tests__/themeConfig.test.js` — saved light, legacy/corrupt value, missing storage, and storage-denied behavior.
- `src/app/components/Layout/__tests__/ThemeProvider.test.jsx` — provider and bootstrap placement contract.
- `src/app/components/Layout/__tests__/ThemePersistence.test.jsx` — real next-themes persistence for explicit Light and Dark choices.
- `src/app/components/Layout/__tests__/ThemeHydration.test.jsx` — server/client markup hydration remains warning-free.
- `src/app/components/Pages/DASHBOARD/customer/settings/__tests__/ThemeControlsAgreement.test.jsx` — global and dashboard controls expose the same explicit choices.
- `src/app/components/Layout/__tests__/ThemeColorMeta.test.jsx` — browser theme-color synchronization.
- `src/app/components/Pages/DASHBOARD/customer/settings/AppearanceSettings.jsx` — dashboard theme selector hydration fallback and copy.
- `src/app/layout.js` — pre-hydration bootstrap, viewport defaults, and runtime browser color synchronization.
- `src/app/manifest.js` — installed-app launch colors.
- `src/app/__tests__/manifest.test.js` — manifest dark-first contract.
- `src/app/globals.css` — Deep Forest semantic tokens, native `color-scheme`, and tokenized switch surfaces.
- `src/app/__tests__/deepForestTheme.test.js` — exact palette and contrast contract.
- `src/app/styles/date-picker.css` — standalone calendar variables mapped back to semantic tokens.
- `src/app/components/Pages/FRONT_END/city/CityHeroBanner.jsx` — remove the literal black dark gradient.
- `src/app/components/Pages/FRONT_END/city/__tests__/CityHeroBanner.test.jsx` — city hero token-gradient assertion.
- `docs/dark-mode/spec.md` — update the existing dark-mode contract from light/system to dark/light.
- `docs/dark-mode/qa/phase5/matrix.md` — replace obsolete system-follow checks with first-visit and saved-light checks.
- `docs/dark-mode/qa/phase5/home/home-first-visit-dark.md` — replace the obsolete System artifact with dark-default evidence.

### Task 0: Start the persistent visible verification environment

**Files:**

- No file changes.

- [ ] **Step 1: Start the frontend in a dedicated terminal**

```bash
npm run dev
```

Expected: Next.js listens on `http://localhost:3000`.

- [ ] **Step 2: Open the required named headed browser**

```bash
agent-browser --session weelp-deep-forest-visible --headed --args "--no-sandbox" open http://localhost:3000
```

Expected: a visible desktop browser window opens. Keep this named session open through Tasks 1–6; do not substitute headless screenshots for visual checks.

### Task 1: Make dark the persisted first-visit default

**Files:**

- Create: `src/app/components/Layout/themeConfig.js`
- Create: `src/app/components/Layout/ThemeBootstrap.jsx`
- Create: `src/app/components/Layout/__tests__/themeConfig.test.js`
- Create: `src/app/components/Layout/__tests__/ThemeProvider.test.jsx`
- Create: `src/app/components/Layout/__tests__/ThemePersistence.test.jsx`
- Create: `src/app/components/Layout/__tests__/ThemeHydration.test.jsx`
- Create: `src/app/components/Pages/DASHBOARD/customer/settings/__tests__/ThemeControlsAgreement.test.jsx`
- Modify: `src/app/components/Layout/ThemeProvider.jsx:1-11`
- Modify: `src/app/components/Pages/DASHBOARD/customer/settings/AppearanceSettings.jsx:1-45`
- Modify: `src/app/layout.js:1-54`

- [ ] **Step 1: Write behavior tests for the pre-hydration theme boundary**

```js
import { runInNewContext } from 'node:vm';

import { DEFAULT_THEME, THEME_BOOTSTRAP_SCRIPT, THEME_STORAGE_KEY, resolveExplicitTheme } from '../themeConfig';

function runBootstrap(windowOverride = window) {
  runInNewContext(THEME_BOOTSTRAP_SCRIPT, { document, window: windowOverride });
}

describe('theme bootstrap', () => {
  beforeEach(() => {
    document.documentElement.className = '';
    document.documentElement.style.colorScheme = '';
    window.localStorage.clear();
  });

  it('keeps a saved light preference', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'light');

    runBootstrap();

    expect(document.documentElement).toHaveClass('light');
    expect(document.documentElement).not.toHaveClass('dark');
    expect(document.documentElement.style.colorScheme).toBe('light');
  });

  it.each(['system', 'corrupt-theme', ''])('normalizes %p to dark before hydration', (storedTheme) => {
    if (storedTheme) {
      window.localStorage.setItem(THEME_STORAGE_KEY, storedTheme);
    }

    runBootstrap();

    expect(document.documentElement).toHaveClass('dark');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('stays dark when storage access throws', () => {
    const deniedWindow = {
      localStorage: {
        getItem() {
          throw new Error('Storage denied');
        },
        setItem() {
          throw new Error('Storage denied');
        },
      },
    };

    runBootstrap(deniedWindow);

    expect(document.documentElement).toHaveClass('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('normalizes display-only values to an explicit supported theme', () => {
    expect(DEFAULT_THEME).toBe('dark');
    expect(resolveExplicitTheme('light')).toBe('light');
    expect(resolveExplicitTheme('dark')).toBe('dark');
    expect(resolveExplicitTheme('system')).toBe('dark');
    expect(resolveExplicitTheme(undefined)).toBe('dark');
  });
});
```

- [ ] **Step 2: Write the provider and bootstrap placement contract**

```jsx
import { render, screen } from '@testing-library/react';

import { ThemeBootstrap } from '../ThemeBootstrap';
import { ThemeProvider } from '../ThemeProvider';

const mockProviderProps = jest.fn();

jest.mock('next/script', () => ({
  __esModule: true,
  default: ({ children, id, strategy }) => (
    <script data-testid="theme-bootstrap" data-script-id={id} data-strategy={strategy}>
      {children}
    </script>
  ),
}));

jest.mock('next-themes', () => ({
  ThemeProvider: ({ children, ...props }) => {
    mockProviderProps(props);
    return <div data-testid="next-themes-provider">{children}</div>;
  },
}));

describe('ThemeProvider', () => {
  beforeEach(() => {
    mockProviderProps.mockClear();
  });

  it('places the normalizer before hydration', () => {
    render(<ThemeBootstrap />);

    expect(screen.getByTestId('theme-bootstrap')).toHaveAttribute('data-script-id', 'weelp-theme-bootstrap');
    expect(screen.getByTestId('theme-bootstrap')).toHaveAttribute('data-strategy', 'beforeInteractive');
  });

  it('defaults the provider to dark and persists only explicit themes', () => {
    render(
      <ThemeProvider>
        <span>Weelp</span>
      </ThemeProvider>,
    );

    expect(screen.getByText('Weelp')).toBeInTheDocument();
    expect(mockProviderProps).toHaveBeenLastCalledWith(
      expect.objectContaining({
        attribute: 'class',
        defaultTheme: 'dark',
        enableSystem: false,
        disableTransitionOnChange: true,
        storageKey: 'weelp-theme',
      }),
    );
  });
});
```

Add a separate test that uses the real `next-themes` package instead of the provider mock:

```jsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useTheme } from 'next-themes';

import { THEME_STORAGE_KEY } from '../themeConfig';
import { ThemeProvider } from '../ThemeProvider';

function ThemeProbe() {
  const { setTheme } = useTheme();

  return (
    <>
      <button type="button" onClick={() => setTheme('light')}>
        Set Light
      </button>
      <button type="button" onClick={() => setTheme('dark')}>
        Set Dark
      </button>
    </>
  );
}

describe('theme persistence', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.className = '';
  });

  it('persists explicit Light and Dark choices', async () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Set Light' }));
    await waitFor(() => expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light'));

    fireEvent.click(screen.getByRole('button', { name: 'Set Dark' }));
    await waitFor(() => expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark'));
  });
});
```

Add a hydration test using the real provider:

```jsx
import { act } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server.node';

import { ThemeProvider } from '../ThemeProvider';

describe('theme hydration', () => {
  it('hydrates stable provider markup without mismatch warnings', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const container = document.createElement('div');
    const content = (
      <ThemeProvider>
        <main>Weelp theme</main>
      </ThemeProvider>
    );

    container.innerHTML = renderToString(content);
    document.body.appendChild(container);

    let root;
    try {
      await act(async () => {
        root = hydrateRoot(container, content);
      });

      const hydrationErrors = consoleError.mock.calls.filter(([message]) => /hydrat|did(?: not|n't) match/i.test(String(message)));
      expect(hydrationErrors).toEqual([]);
    } finally {
      if (root) {
        await act(async () => {
          root.unmount();
        });
      }
      container.remove();
      consoleError.mockRestore();
    }
  });
});
```

Add a focused agreement test for the two user-facing controls:

```jsx
import { fireEvent, render, screen } from '@testing-library/react';

import { ThemeToggle } from '@/components/ui/theme-toggle';
import { AppearanceSettings } from '../AppearanceSettings';

const mockSetTheme = jest.fn();
const mockThemeState = {
  theme: 'dark',
  resolvedTheme: 'dark',
};

jest.mock('next-themes', () => ({
  useTheme: () => ({ ...mockThemeState, setTheme: mockSetTheme }),
}));
jest.mock('@/hooks/useIsClient', () => ({ useIsClient: () => true }));
jest.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: jest.fn() }) }));
jest.mock('@/lib/store/uiStore', () => ({ useUIStore: () => ({ font: 'Inter', setFont: jest.fn() }) }));
jest.mock('@hookform/resolvers/zod', () => ({ zodResolver: () => () => ({ values: {}, errors: {} }) }));
jest.mock('react-hook-form', () => ({
  useForm: () => ({
    control: {},
    formState: { isDirty: false },
    handleSubmit: (handler) => (event) => {
      event?.preventDefault();
      return handler({ font: 'Inter' });
    },
  }),
}));
jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children, ...props }) => <button {...props}>{children}</button>,
  DropdownMenuContent: ({ children }) => <div role="menu">{children}</div>,
  DropdownMenuItem: ({ children, onSelect }) => (
    <button type="button" role="menuitem" onClick={onSelect}>
      {children}
    </button>
  ),
}));
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
}));
jest.mock('@/components/ui/label', () => ({
  Label: ({ asChild, children, ...props }) => (asChild ? children : <label {...props}>{children}</label>),
}));
jest.mock('@/components/ui/card', () => ({
  Card: ({ children }) => <div>{children}</div>,
  CardDescription: ({ children }) => <p>{children}</p>,
  CardTitle: ({ children }) => <h2>{children}</h2>,
}));
jest.mock('@/components/ui/select', () => ({
  Select: ({ children }) => <div>{children}</div>,
  SelectContent: ({ children }) => <div>{children}</div>,
  SelectItem: ({ children }) => <div>{children}</div>,
  SelectTrigger: ({ children }) => <button type="button">{children}</button>,
  SelectValue: () => <span>Select font</span>,
}));
jest.mock('@/components/ui/form', () => ({
  Form: ({ children }) => <div>{children}</div>,
  FormControl: ({ children }) => children,
  FormDescription: ({ children }) => <p>{children}</p>,
  FormField: ({ render }) => render({ field: { onChange: jest.fn(), value: 'Inter' } }),
  FormItem: ({ children }) => <div>{children}</div>,
  FormMessage: () => null,
}));

describe('theme controls agreement', () => {
  beforeEach(() => {
    mockSetTheme.mockClear();
    mockThemeState.theme = 'dark';
    mockThemeState.resolvedTheme = 'dark';
  });

  it('offers Light from dark and Dark from light in both controls', () => {
    const { rerender } = render(
      <>
        <ThemeToggle />
        <AppearanceSettings />
      </>,
    );

    expect(screen.getByRole('button', { name: /^Dark\s+Deep Forest/i })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: /^Light\s+Bright surfaces/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /light/i }));
    expect(mockSetTheme).toHaveBeenNthCalledWith(1, 'light');
    expect(mockSetTheme).toHaveBeenNthCalledWith(2, 'light');

    mockThemeState.theme = 'light';
    mockThemeState.resolvedTheme = 'light';
    rerender(
      <>
        <ThemeToggle />
        <AppearanceSettings />
      </>,
    );

    expect(screen.getByRole('button', { name: /^Light\s+Bright surfaces/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('menuitem', { name: /dark/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run the tests and verify the missing boundary fails**

Run:

```bash
npx jest src/app/components/Layout/__tests__/themeConfig.test.js src/app/components/Layout/__tests__/ThemeProvider.test.jsx src/app/components/Layout/__tests__/ThemePersistence.test.jsx src/app/components/Layout/__tests__/ThemeHydration.test.jsx src/app/components/Pages/DASHBOARD/customer/settings/__tests__/ThemeControlsAgreement.test.jsx --runInBand
```

Expected: FAIL because the bootstrap/config modules do not exist and the provider still uses light/system.

- [ ] **Step 4: Add the shared theme configuration and synchronous bootstrap**

```js
export const DEFAULT_THEME = 'dark';
export const THEME_STORAGE_KEY = 'weelp-theme';
export const THEME_COLORS = {
  dark: '#08110e',
  light: '#ffffff',
};

export function resolveExplicitTheme(theme) {
  return theme === 'light' ? 'light' : DEFAULT_THEME;
}

export const THEME_BOOTSTRAP_SCRIPT = `(() => {
  const root = document.documentElement;
  let theme = '${DEFAULT_THEME}';

  try {
    const storedTheme = window.localStorage.getItem('${THEME_STORAGE_KEY}');
    theme = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : '${DEFAULT_THEME}';

    if (storedTheme !== theme) {
      window.localStorage.setItem('${THEME_STORAGE_KEY}', theme);
    }
  } catch {
    theme = '${DEFAULT_THEME}';
  }

  root.classList.remove('light', 'dark', 'system');
  root.classList.add(theme);
  root.style.colorScheme = theme;
})();`;
```

```jsx
import Script from 'next/script';

import { THEME_BOOTSTRAP_SCRIPT } from './themeConfig';

export function ThemeBootstrap() {
  return (
    <Script id="weelp-theme-bootstrap" strategy="beforeInteractive">
      {THEME_BOOTSTRAP_SCRIPT}
    </Script>
  );
}
```

- [ ] **Step 5: Change the provider to dark-first without adding another React state owner**

```jsx
'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

import { DEFAULT_THEME, THEME_STORAGE_KEY } from './themeConfig';

export function ThemeProvider({ children }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme={DEFAULT_THEME} enableSystem={false} disableTransitionOnChange storageKey={THEME_STORAGE_KEY}>
      {children}
    </NextThemesProvider>
  );
}
```

- [ ] **Step 6: Mount the bootstrap before the provider**

Import `ThemeBootstrap` in `src/app/layout.js` and place it in an explicit `<head>` before the body:

```jsx
<html lang="en" suppressHydrationWarning={true}>
  <head>
    <ThemeBootstrap />
  </head>
  <body className={`${interTight.variable} ${inter.variable} ${outfit.variable} ${montez.variable} ${cormorant.variable} font-sans antialiased tfc_scroll`}>
    <ThemeProvider>{children}</ThemeProvider>
  </body>
</html>
```

- [ ] **Step 7: Remove the obsolete System-theme effect from dashboard appearance settings**

Remove the `useEffect` import and the effect that converts `system` to `light` or `dark`. Replace the hook and fallback lines with:

```jsx
import { DEFAULT_THEME, resolveExplicitTheme } from '@/app/components/Layout/themeConfig';

const { theme, setTheme } = useTheme();
const { toast } = useToast();
const isClient = useIsClient();
const activeTheme = isClient ? resolveExplicitTheme(theme) : DEFAULT_THEME;
```

Update the Dark option description to name the approved palette:

```jsx
{ value: 'dark', label: 'Dark', icon: Moon, description: 'Deep Forest surfaces, light text.' },
```

This derives the display state during render and avoids a second effect-driven theme transition.

- [ ] **Step 8: Run the bootstrap, provider, and existing toggle tests**

Run:

```bash
npx jest src/app/components/Layout/__tests__/themeConfig.test.js src/app/components/Layout/__tests__/ThemeProvider.test.jsx src/app/components/Layout/__tests__/ThemePersistence.test.jsx src/app/components/Layout/__tests__/ThemeHydration.test.jsx src/app/components/Pages/DASHBOARD/customer/settings/__tests__/ThemeControlsAgreement.test.jsx src/components/ui/__tests__/theme-toggle.test.jsx --runInBand
```

Expected: PASS.

- [ ] **Step 9: Run the required checkpoint without committing**

```bash
npm run type-check
npm run lint
git diff --check
agent-browser --session weelp-deep-forest-visible reload
```

Expected: all commands exit 0. In the visible browser, remove only `weelp-theme`, reload, and confirm the first paint is dark without a light flash; then set Light and confirm a reload stays light. Keep the implementation uncommitted until the final review, simplify, and verification gate.

### Task 2: Apply the Deep Forest semantic palette

**Files:**

- Create: `src/app/__tests__/deepForestTheme.test.js`
- Modify: `src/app/globals.css:52-265`

- [ ] **Step 1: Write the palette and contrast contract**

```js
import fs from 'node:fs';
import path from 'node:path';

const css = fs.readFileSync(path.join(process.cwd(), 'src/app/globals.css'), 'utf8');
const darkBlock = css.match(/\.dark\s*\{([\s\S]*?)\n  \}/)?.[1] ?? '';

function relativeLuminance(hex) {
  const channels = hex
    .replace('#', '')
    .match(/.{2}/g)
    .map((value) => Number.parseInt(value, 16) / 255)
    .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(foreground, background) {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

describe('Deep Forest theme tokens', () => {
  it.each([
    ['--background', '160 36% 5%'],
    ['--foreground', '144 26% 96%'],
    ['--card', '159 30% 9%'],
    ['--popover', '158 29% 11%'],
    ['--muted', '158 28% 13%'],
    ['--border', '157 22% 19%'],
    ['--input', '153 25% 40%'],
    ['--ring', '154 29% 63%'],
    ['--destructive', '0 91% 71%'],
    ['--weelp-sage-deep', '153 25% 40%'],
    ['--weelp-gray-rgb', '24 43 36'],
    ['--weelp-blueish-rgb', '243 248 245'],
    ['--weelp-solitude-rgb', '159 177 169'],
  ])('sets %s to %s', (token, value) => {
    expect(darkBlock).toContain(`${token}: ${value};`);
  });

  it('keeps approved text and action pairings above WCAG AA', () => {
    expect(contrast('#F3F8F5', '#08110E')).toBeGreaterThanOrEqual(4.5);
    expect(contrast('#C8D7D0', '#101E19')).toBeGreaterThanOrEqual(4.5);
    expect(contrast('#07100D', '#86BDA5')).toBeGreaterThanOrEqual(4.5);
    expect(contrast('#FFFFFF', '#4D8069')).toBeGreaterThanOrEqual(4.5);
    expect(contrast('#4D8069', '#101E19')).toBeGreaterThanOrEqual(3);
    expect(contrast('#86BDA5', '#08110E')).toBeGreaterThanOrEqual(3);
    expect(contrast('#F87171', '#101E19')).toBeGreaterThanOrEqual(4.5);
    expect(contrast('#07100D', '#F87171')).toBeGreaterThanOrEqual(4.5);
    expect(contrast('#9FB1A9', '#182B24')).toBeGreaterThanOrEqual(4.5);
    expect(contrast('#C8D7D0', '#14241E')).toBeGreaterThanOrEqual(4.5);
  });

  it.each([
    ['success', '#42D778'],
    ['warning', '#EBAF47'],
    ['info', '#3D90F5'],
  ])('keeps %s data and status marks distinguishable', (_name, color) => {
    expect(contrast(color, '#101E19')).toBeGreaterThanOrEqual(3);
  });
});
```

- [ ] **Step 2: Run the palette test and verify the neutral palette fails**

Run:

```bash
npx jest src/app/__tests__/deepForestTheme.test.js --runInBand
```

Expected: FAIL because the current `.dark` block uses neutral HSL values.

- [ ] **Step 3: Add native control color-scheme declarations**

Inside the existing `:root` and `.dark` blocks, add:

```css
:root {
  color-scheme: light;
}

.dark {
  color-scheme: dark;
}
```

Keep these declarations in the existing blocks; do not create competing selectors.

- [ ] **Step 4: Replace the core dark semantic roles**

Replace the corresponding variables in `.dark` with:

```css
--background: 160 36% 5%;
--foreground: 144 26% 96%;
--card: 159 30% 9%;
--card-foreground: 144 26% 96%;
--popover: 158 29% 11%;
--popover-foreground: 144 26% 96%;
--primary: 154 29% 63%;
--primary-foreground: 160 39% 5%;
--secondary: 158 28% 13%;
--secondary-foreground: 144 26% 96%;
--muted: 158 28% 13%;
--muted-foreground: 153 10% 66%;
--accent: 158 28% 13%;
--accent-foreground: 144 26% 96%;
--destructive: 0 91% 71%;
--destructive-foreground: 160 39% 5%;
--border: 157 22% 19%;
--input: 153 25% 40%;
--ring: 154 29% 63%;
--surface-elevated: 158 29% 11%;
--surface-tint: 159 30% 9%;
--weelp-auth-neu-surface: 159 30% 9%;
```

Keep the existing success, warning, info, and chart hues so status and data colors do not collapse into the brand palette. The destructive pair uses light red on dark surfaces and dark text on filled destructive controls; one red token can then satisfy both error-copy and filled-control contrast.

- [ ] **Step 5: Align sidebar, text, home, card, and city token families**

Use these values in the same `.dark` block:

```css
--sidebar-background: 159 30% 9%;
--sidebar-foreground: 144 26% 96%;
--sidebar-primary: 154 29% 63%;
--sidebar-primary-foreground: 160 39% 5%;
--sidebar-accent: 158 28% 13%;
--sidebar-accent-foreground: 144 26% 96%;
--sidebar-border: 157 22% 19%;
--sidebar-ring: 154 29% 63%;

--ink: #f3f8f5;
--copy: #c8d7d0;
--label: #9fb1a9;
--ink-rgb: 243 248 245;
--copy-rgb: 200 215 208;
--label-rgb: 159 177 169;
--link-default: #c8d7d0;
--link-hover: #86bda5;

--weelp-home-page: #08110e;
--weelp-home-ink: #f3f8f5;
--weelp-home-copy: #c8d7d0;
--weelp-home-label: #9fb1a9;
--weelp-home-soft: #182b24;
--weelp-home-surface: #101e19;
--weelp-home-border: #263b33;
--weelp-home-brand: #86bda5;
--weelp-home-muted: #9fb1a9;
--weelp-home-search-shell: rgba(20, 36, 30, 0.95);
--weelp-home-search-border: #304b40;

--weelp-sage-deep-rgb: 77 128 105;
--weelp-sage-hover-rgb: 66 107 89;
--weelp-sage-tint-rgb: 48 75 64;
--weelp-sage-deep: 153 25% 40%;
--weelp-sage-hover: 154 24% 34%;
--weelp-sage-tint: 156 22% 24%;
--weelp-sage-wash: 159 30% 9%;
--weelp-steel: 152 16% 81%;

--weelp-gray-rgb: 24 43 36;
--weelp-bluewhale-rgb: 200 215 208;
--weelp-blueish-rgb: 243 248 245;
--weelp-lynch-rgb: 159 177 169;
--weelp-solitude-rgb: 159 177 169;
--weelp-blackish-rgb: 200 215 208;

--weelp-card-border: #263b33;
--weelp-card-badge-bg: #182b24;
--weelp-card-badge-text: #c8d7d0;

--weelp-city-tab-text: #c8d7d0;
--weelp-city-tab-bg: rgba(134, 189, 165, 0.08);
--weelp-city-tab-active-bg: rgba(134, 189, 165, 0.14);
--weelp-city-tab-active-border: rgba(134, 189, 165, 0.35);
```

Leave hero text tokens unchanged because they sit on photography and are controlled by image readability rather than the page surface.

The lighter `#86BDA5` remains the semantic `primary`, `ring`, link-hover, and home-brand accent with dark `primary-foreground`. The filled `weelp-sage-deep` role stays deeper at `#4D8069` because existing brand controls pair it with white text; that pairing passes 4.5:1 without migrating 157 established control call sites.

The standard `#263B33` border may remain subtle where tonal surface separation already defines the component. Inputs use `#4D8069` because their outline can be the only visual boundary; it exceeds 3:1 against the standard card surface.

- [ ] **Step 6: Run the palette test**

Run:

```bash
npx jest src/app/__tests__/deepForestTheme.test.js --runInBand
```

Expected: PASS with all token rows and contrast pairings.

- [ ] **Step 7: Run the required checkpoint without committing**

```bash
npm run type-check
npm run lint
git diff --check
agent-browser --session weelp-deep-forest-visible reload
```

Expected: all commands exit 0. Visually confirm the homepage canvas, navigation, cards, focus rings, errors, and inputs use the approved hierarchy. Keep the implementation uncommitted.

### Task 3: Migrate dark surfaces that bypass the token layer

**Files:**

- Modify: `src/app/globals.css:976-1055`
- Modify: `src/app/__tests__/deepForestTheme.test.js`
- Modify: `src/app/styles/date-picker.css:64-71`
- Modify: `src/app/components/Pages/FRONT_END/city/CityHeroBanner.jsx:10`
- Modify: `src/app/components/Pages/FRONT_END/city/__tests__/CityHeroBanner.test.jsx:20-39`

- [ ] **Step 1: Update the city hero test to require a semantic gradient class**

Replace the two literal gradient assertions with:

```jsx
expect(hero).toHaveClass('weelp-city-hero-surface');
expect(hero).not.toHaveClass('dark:bg-[radial-gradient(circle_at_78%_22%,rgba(255,255,255,0.08),transparent_34%),linear-gradient(145deg,#050505_0%,#111111_48%,#000000_100%)]');
```

In `deepForestTheme.test.js`, add the standalone CSS source immediately after the existing `css` constant:

```js
const datePickerCss = fs.readFileSync(path.join(process.cwd(), 'src/app/styles/date-picker.css'), 'utf8');
const darkCalendarBlock = datePickerCss.match(/\.dark \.weelp-calendar\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';
const darkSwitchStart = css.indexOf('.dark .neumorphism-switch-root');
const darkSwitchEnd = css.indexOf('/* Range slider', darkSwitchStart);
const darkSwitchCss = css.slice(darkSwitchStart, darkSwitchEnd);
```

Add this assertion inside the existing `describe('Deep Forest theme tokens', ...)` block:

```js
it('removes neutral dark literals from standalone theme surfaces', () => {
  expect(darkCalendarBlock).not.toMatch(/#(?:e5e7eb|9ca3af|374151|27272a|3f3f46)/i);
  expect(darkSwitchCss).not.toMatch(/#(?:202020|2a2a2a|0c0c0c|171717|2f2f2f|070707|2c2c2c|1b1b1b|303030|050505)/i);
});

it('preserves the approved light city hero while tokenizing its dark gradient', () => {
  expect(css).toContain('background: linear-gradient(-165deg, #f8faf9, #f2f7f5);');
  expect(css).toContain('linear-gradient(145deg, hsl(var(--background)) 0%, hsl(var(--card)) 48%, hsl(var(--background)) 100%);');
});
```

- [ ] **Step 2: Run the city hero test and verify it fails**

Run:

```bash
npx jest src/app/__tests__/deepForestTheme.test.js src/app/components/Pages/FRONT_END/city/__tests__/CityHeroBanner.test.jsx --runInBand
```

Expected: FAIL because `weelp-city-hero-surface` does not exist and neutral literals remain in the standalone dark CSS.

- [ ] **Step 3: Move the city hero gradients behind a focused CSS class**

In `CityHeroBanner.jsx`, replace both arbitrary gradient utilities with `weelp-city-hero-surface` and leave the remaining layout classes unchanged.

Add this component rule to `globals.css`:

```css
.weelp-city-hero-surface {
  background: linear-gradient(-165deg, #f8faf9, #f2f7f5);
}

.dark .weelp-city-hero-surface {
  background: radial-gradient(circle at 78% 22%, hsl(var(--ring) / 0.12), transparent 34%), linear-gradient(145deg, hsl(var(--background)) 0%, hsl(var(--card)) 48%, hsl(var(--background)) 100%);
}
```

This preserves the existing light appearance and makes the dark gradient follow the semantic palette.

- [ ] **Step 4: Replace standalone calendar dark neutrals with shared roles**

```css
.dark .weelp-calendar {
  --weelp-cal-fg: hsl(var(--foreground));
  --weelp-cal-muted: hsl(var(--muted-foreground));
  --weelp-cal-disabled: hsl(var(--muted-foreground) / 0.45);
  --weelp-cal-selected-soft: hsl(var(--weelp-sage-deep) / 0.32);
  --weelp-cal-single: hsl(var(--muted));
  --weelp-cal-single-hover: hsl(var(--accent));
}
```

- [ ] **Step 5: Tokenize the dark neumorphism switch**

Replace only the `.dark` switch rules with:

```css
.dark .neumorphism-switch-root,
.dark .neumorphism-switch-root[data-state='checked'] {
  background: hsl(var(--muted)) !important;
}

.dark .neumorphism-switch-root {
  box-shadow:
    inset -3px -3px 6px hsl(var(--input)),
    inset 3px 3px 6px hsl(var(--background)) !important;
}

.dark .neumorphism-switch-toggle,
.dark .neumorphism-switch-root[data-state='checked'] .neumorphism-switch-toggle {
  background: linear-gradient(145deg, hsl(var(--input)), hsl(var(--card)));
  box-shadow:
    -2px -2px 4px hsl(var(--border)),
    2px 2px 4px hsl(var(--background));
}

.dark .neumorphism-switch-root:hover .neumorphism-switch-toggle {
  box-shadow:
    -2px -2px 6px hsl(var(--border)),
    2px 2px 6px hsl(var(--background));
}
```

Keep light-mode switch declarations unchanged.

- [ ] **Step 6: Run focused visual-surface tests and the hardcoded-color guard**

Run:

```bash
npx jest src/app/__tests__/deepForestTheme.test.js src/app/components/Pages/FRONT_END/city/__tests__/CityHeroBanner.test.jsx --runInBand
npm run dark:guard
```

Expected: both Jest suites PASS and the guard reports no new findings.

- [ ] **Step 7: Run the required checkpoint without committing**

```bash
npm run type-check
npm run lint
git diff --check
agent-browser --session weelp-deep-forest-visible open http://localhost:3000/cities/dubai
```

Expected: all commands exit 0. Visually confirm the city hero, gallery panel, calendar if reachable, and neumorphism switch where used. Keep the implementation uncommitted.

### Task 4: Synchronize installed-app and ordinary browser chrome

**Files:**

- Create: `src/app/__tests__/manifest.test.js`
- Create: `src/app/components/Layout/ThemeColorMeta.jsx`
- Create: `src/app/components/Layout/__tests__/ThemeColorMeta.test.jsx`
- Modify: `src/app/manifest.js:1-22`
- Modify: `src/app/layout.js:42-54`

- [ ] **Step 1: Write launch-color and runtime browser-color tests**

```js
import manifest from '../manifest';

describe('web app manifest', () => {
  it('uses Deep Forest while the installed app launches', () => {
    expect(manifest()).toEqual(
      expect.objectContaining({
        background_color: '#08110e',
        theme_color: '#08110e',
      }),
    );
  });
});
```

```jsx
import { render, waitFor } from '@testing-library/react';

import { ThemeColorMeta } from '../ThemeColorMeta';

const mockThemeState = {
  resolvedTheme: 'dark',
};

jest.mock('next-themes', () => ({
  useTheme: () => mockThemeState,
}));

describe('ThemeColorMeta', () => {
  beforeEach(() => {
    document.head.querySelector('meta[name="theme-color"]')?.remove();
    mockThemeState.resolvedTheme = 'dark';
  });

  it('creates a dark browser color and follows an explicit light choice', async () => {
    const { rerender } = render(<ThemeColorMeta />);

    await waitFor(() => {
      expect(document.head.querySelector('meta[name="theme-color"]')).toHaveAttribute('content', '#08110e');
    });

    mockThemeState.resolvedTheme = 'light';
    rerender(<ThemeColorMeta />);

    await waitFor(() => {
      expect(document.head.querySelector('meta[name="theme-color"]')).toHaveAttribute('content', '#ffffff');
    });
  });
});
```

- [ ] **Step 2: Run the tests and verify the missing contracts fail**

Run:

```bash
npx jest src/app/__tests__/manifest.test.js src/app/components/Layout/__tests__/ThemeColorMeta.test.jsx --runInBand
```

Expected: FAIL because the manifest is white-first and the runtime meta component does not exist.

- [ ] **Step 3: Add the runtime browser-color synchronizer**

```jsx
'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

import { THEME_COLORS, resolveExplicitTheme } from './themeConfig';

export function ThemeColorMeta() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const theme = resolveExplicitTheme(resolvedTheme);
    let meta = document.head.querySelector('meta[name="theme-color"]');

    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }

    meta.setAttribute('content', THEME_COLORS[theme]);
  }, [resolvedTheme]);

  return null;
}
```

- [ ] **Step 4: Give the server-rendered document a dark browser default**

Import `THEME_COLORS` and `ThemeColorMeta` in `src/app/layout.js`, then export:

```js
export const viewport = {
  colorScheme: 'dark light',
  themeColor: THEME_COLORS.dark,
};
```

Mount `ThemeColorMeta` inside the provider so it can read `next-themes`:

```jsx
<ThemeProvider>
  <ThemeColorMeta />
  {children}
</ThemeProvider>
```

- [ ] **Step 5: Update the installed-app manifest**

```js
export default function manifest() {
  return {
    name: 'Weelp',
    short_name: 'Weelp',
    description: 'A Progressive Web App built with Next.js',
    start_url: '/',
    display: 'standalone',
    background_color: '#08110e',
    theme_color: '#08110e',
    icons: [
      {
        src: '/assets/images/Weelp..jpg',
        sizes: '192x192',
        type: 'image/jpeg',
      },
      {
        src: '/assets/images/Weelp..jpg',
        sizes: '400x400',
        type: 'image/jpeg',
      },
    ],
  };
}
```

- [ ] **Step 6: Run the browser-color tests**

Run:

```bash
npx jest src/app/__tests__/manifest.test.js src/app/components/Layout/__tests__/ThemeColorMeta.test.jsx --runInBand
```

Expected: PASS.

- [ ] **Step 7: Run the required checkpoint without committing**

```bash
npm run type-check
npm run lint
git diff --check
agent-browser --session weelp-deep-forest-visible open http://localhost:3000
```

Expected: all commands exit 0. Toggle Dark and Light in the visible browser and confirm the browser theme-color meta content follows both states. Keep the implementation uncommitted.

### Task 5: Update the existing dark-mode contract

**Files:**

- Modify: `src/docs/superpowers/specs/2026-07-24-deep-forest-dark-mode-design.md`
- Modify: `docs/dark-mode/spec.md`
- Modify: `docs/dark-mode/qa/phase5/matrix.md`
- Rename: `docs/dark-mode/qa/phase5/home/home-system.md` → `docs/dark-mode/qa/phase5/home/home-first-visit-dark.md`

- [ ] **Step 1: Record the accessibility refinement in the approved design**

In the palette table, change the input/control boundary target from `#304B40` to `#4D8069`. Add this sentence below the table:

```markdown
The stronger control boundary is an accessibility refinement: `#4D8069`
exceeds 3:1 against the standard card surface, while `#304B40` remains
available as a non-essential tonal step.
```

In the surface rules, state that destructive copy uses `#F87171` on forest surfaces and filled destructive controls use the dark `#07100D` foreground. This records the contrast-safe status pairing discovered during plan review.

- [ ] **Step 2: Update the decision log in the existing dark-mode specification**

Change the decision rows to:

```markdown
| Decision        | Choice                                                                      |
| --------------- | --------------------------------------------------------------------------- |
| Theme manager   | `next-themes`                                                               |
| Persistence key | `weelp-theme`                                                               |
| Default theme   | `dark` (Deep Forest)                                                        |
| System theme    | Disabled; users explicitly choose Dark or Light                             |
| Token model     | CSS variables in `globals.css`, consumed by Tailwind                        |
| Component rule  | Token utilities only; no new hardcoded neutral or hex color utilities       |
| Exemptions      | `dark-mode-exempt` comment directly above the intentional line              |
| Shadow policy   | Standard shadows are normalized off in dark mode; color bridges are removed |
```

Add a short Deep Forest note after the token table that links to:

```markdown
The approved Deep Forest palette and behavior are defined in
`src/docs/superpowers/specs/2026-07-24-deep-forest-dark-mode-design.md`.
```

Document that a pre-hydration bootstrap normalizes missing, legacy `system`, and corrupt stored values to dark, while a saved `light` value remains unchanged. If storage access throws, the bootstrap still applies the dark class and color scheme for the current page.

- [ ] **Step 3: Replace obsolete System-follow QA columns and artifacts**

In `docs/dark-mode/qa/phase5/matrix.md`, replace each `System follow` column with `First visit dark`. Replace `<route-slug>-system.md` with:

```text
<route-slug>-first-visit-dark.md
<route-slug>-saved-light.md
```

Replace the Artifact Naming section’s system note with:

```markdown
First-visit notes should record that `localStorage['weelp-theme']` was absent
before reload, `html.dark` was present on first paint, and no light flash was
visible. Saved-light notes should record that the stored `light` preference won
after reload.
```

Rename the existing home System artifact and replace its obsolete media-query checks with the checks already completed in the visible Task 1 checkpoint:

```markdown
# Home Dark-Default Check

Visible browser session:

`agent-browser --session weelp-deep-forest-visible`

Checks performed:

- Missing preference: removed `weelp-theme`, reloaded, and verified `html.dark` before content became visible.
- Flash prevention: observed no light canvas between navigation and the rendered homepage.
- Saved light: selected Light, reloaded, and verified `weelp-theme='light'` with `html.light`.
- Legacy value: set `weelp-theme='system'`, reloaded, and verified normalization to `dark`.
- Corrupt value: set an unsupported value, reloaded, and verified normalization to `dark`.
- Storage denial: covered by `themeConfig.test.js`; the bootstrap applies `html.dark` even when storage throws.

Visual artifacts remain:

- `home-light-desktop.png`
- `home-dark-desktop.png`
- `home-light-mobile.png`
- `home-dark-mobile.png`
```

- [ ] **Step 4: Format and inspect the documentation diff**

Run:

```bash
npx prettier --write src/docs/superpowers/specs/2026-07-24-deep-forest-dark-mode-design.md docs/dark-mode/spec.md docs/dark-mode/qa/phase5/matrix.md docs/dark-mode/qa/phase5/home/home-first-visit-dark.md
git diff --check
```

Expected: all four files format successfully and `git diff --check` prints nothing.

- [ ] **Step 5: Run the required checkpoint without committing**

```bash
npm run type-check
npm run lint
git diff --check
```

Expected: all commands exit 0. Keep the implementation uncommitted.

### Task 6: Run the full verification and visible-browser matrix

**Files:**

- Modify only if verification exposes a scoped Deep Forest regression.

- [ ] **Step 1: Run focused theme suites**

Run:

```bash
npx jest src/app/components/Layout/__tests__/themeConfig.test.js src/app/components/Layout/__tests__/ThemeProvider.test.jsx src/app/components/Layout/__tests__/ThemePersistence.test.jsx src/app/components/Layout/__tests__/ThemeHydration.test.jsx src/app/components/Pages/DASHBOARD/customer/settings/__tests__/ThemeControlsAgreement.test.jsx src/app/components/Layout/__tests__/ThemeColorMeta.test.jsx src/components/ui/__tests__/theme-toggle.test.jsx src/app/__tests__/deepForestTheme.test.js src/app/__tests__/manifest.test.js src/app/components/Pages/FRONT_END/city/__tests__/CityHeroBanner.test.jsx --runInBand
```

Expected: all suites PASS.

- [ ] **Step 2: Run project-required static verification**

Invoke `error-handling-patterns` and confirm that the synchronous bootstrap handles missing, legacy, corrupt, and storage-denied states without adding React state or taking persistence ownership away from `next-themes`. Then run:

Run:

```bash
npm run type-check
npm run lint
npm run dark:audit
node -e "const audit = require('./docs/dark-mode/audit.json'); if (audit.totalFindings !== 0) { console.error(audit.totalFindings + ' dark-mode findings remain'); process.exit(1); }"
npm run build
git diff --check
```

Expected:

- TypeScript exits 0.
- ESLint exits 0 with no warnings.
- The dark guard reports no new findings.
- The dark audit reports 0 findings across 0 files.
- `docs/dark-mode/audit.json` contains the verified zero-finding result and is retained for the final commit rather than left as unexplained timestamp churn.
- The production build exits 0.
- `git diff --check` prints nothing.

- [ ] **Step 3: Confirm the persistent visible session is still active**

Run:

```bash
agent-browser --session weelp-deep-forest-visible open http://localhost:3000
```

Expected: the named visible window from Task 0 navigates to the homepage. If it was closed, reopen it with `--headed --args "--no-sandbox"` before continuing.

- [ ] **Step 4: Verify first visit and saved light behavior**

In the named visible session:

1. Remove only `localStorage['weelp-theme']`.
2. Reload `/` and confirm `html.dark` exists before content becomes visible.
3. Watch for any white/light flash.
4. Use the global toggle to select Light.
5. Reload and confirm `localStorage['weelp-theme'] === 'light'` and `html.dark` is absent.
6. Select Dark again and confirm the stored value becomes `dark`.
7. Set the stored value to `system`, reload, and confirm it is normalized to `dark`.
8. Set the stored value to an arbitrary corrupt string, reload, and confirm it is normalized to `dark`.

- [ ] **Step 5: Inspect representative public routes at desktop and mobile widths**

Use the visible browser to inspect:

- `/`
- `/cities`
- `/cities/dubai`
- `/user/login`
- a reachable activity or itinerary detail page
- the corresponding booking/checkout flow through Stripe Elements where test inventory permits

Check canvas, cards, navigation, city hero, forms, dropdowns, calendar surfaces, focus rings, validation errors, disabled buttons and inputs, Stripe fields, imagery, and horizontal overflow. Disabled controls must remain identifiable while clearly less prominent than enabled controls. Open at least one header dropdown, authentication dialog, calendar popover, and toast. Repeat at a mobile viewport near `390x844`.

- [ ] **Step 6: Inspect authenticated customer and admin routes**

Using the test accounts documented in the project instructions, inspect:

- `/dashboard/customer/overview`
- `/dashboard/customer/analytics`
- `/dashboard/customer/settings/appearance`
- `/dashboard/customer/my-itineraries`
- `/dashboard/admin`
- one admin table route
- one admin create/edit form

Use the customer-and-creator account for the creator route and the super-admin account for admin routes. Confirm that dense tables remain readable, sidebars and popovers use the forest hierarchy, theme settings agree with the global toggle, and a saved Light choice still restores the existing light appearance. On analytics screens, inspect chart labels, legends, axes, data marks, and tooltip copy against their actual surfaces.

Exercise concrete component states: open a delete/confirmation dialog without confirming the destructive action, trigger the appearance-setting success toast, inspect an empty state where available, and use a safe failed/invalid form submission to expose error copy and input boundaries. Do not create or delete production data.

- [ ] **Step 7: Run the mandatory review and simplify loop**

1. Format all scoped files before review:

   ```bash
   npx prettier --write src/app/components/Layout/themeConfig.js src/app/components/Layout/ThemeBootstrap.jsx src/app/components/Layout/ThemeColorMeta.jsx src/app/components/Layout/ThemeProvider.jsx src/app/components/Layout/__tests__/themeConfig.test.js src/app/components/Layout/__tests__/ThemeProvider.test.jsx src/app/components/Layout/__tests__/ThemePersistence.test.jsx src/app/components/Layout/__tests__/ThemeHydration.test.jsx src/app/components/Layout/__tests__/ThemeColorMeta.test.jsx src/app/components/Pages/DASHBOARD/customer/settings/AppearanceSettings.jsx src/app/components/Pages/DASHBOARD/customer/settings/__tests__/ThemeControlsAgreement.test.jsx src/app/layout.js src/app/manifest.js src/app/__tests__/manifest.test.js src/app/globals.css src/app/__tests__/deepForestTheme.test.js src/app/styles/date-picker.css src/app/components/Pages/FRONT_END/city/CityHeroBanner.jsx src/app/components/Pages/FRONT_END/city/__tests__/CityHeroBanner.test.jsx src/docs/superpowers/specs/2026-07-24-deep-forest-dark-mode-design.md docs/dark-mode/spec.md docs/dark-mode/qa/phase5/matrix.md docs/dark-mode/qa/phase5/home/home-first-visit-dark.md docs/dark-mode/audit.json
   ```

2. Dispatch the project’s code-reviewer agent over the complete formatted diff.
3. Address every critical or high-confidence theme regression.
4. Re-run the focused suites after each fix.
5. Invoke the `simplify` skill to remove needless duplication without changing behavior.
6. Run `npm run type-check`, `npm run lint`, the focused Jest command, the zero-finding dark-audit assertion, `npm run build`, and `git diff --check` again.
7. Re-review if the reviewer requested changes or simplify changed runtime code.

- [ ] **Step 8: Commit the reviewed implementation once and push `main`**

```bash
git diff --check
git add src/app/components/Layout/themeConfig.js src/app/components/Layout/ThemeBootstrap.jsx src/app/components/Layout/ThemeColorMeta.jsx src/app/components/Layout/ThemeProvider.jsx src/app/components/Layout/__tests__/themeConfig.test.js src/app/components/Layout/__tests__/ThemeProvider.test.jsx src/app/components/Layout/__tests__/ThemePersistence.test.jsx src/app/components/Layout/__tests__/ThemeHydration.test.jsx src/app/components/Layout/__tests__/ThemeColorMeta.test.jsx src/app/components/Pages/DASHBOARD/customer/settings/AppearanceSettings.jsx src/app/components/Pages/DASHBOARD/customer/settings/__tests__/ThemeControlsAgreement.test.jsx src/app/layout.js src/app/manifest.js src/app/__tests__/manifest.test.js src/app/globals.css src/app/__tests__/deepForestTheme.test.js src/app/styles/date-picker.css src/app/components/Pages/FRONT_END/city/CityHeroBanner.jsx src/app/components/Pages/FRONT_END/city/__tests__/CityHeroBanner.test.jsx src/docs/superpowers/specs/2026-07-24-deep-forest-dark-mode-design.md docs/dark-mode/spec.md docs/dark-mode/qa/phase5/matrix.md docs/dark-mode/qa/phase5/home/home-system.md docs/dark-mode/qa/phase5/home/home-first-visit-dark.md docs/dark-mode/audit.json
git commit -m "feat: adopt Deep Forest as the default theme"
git status --short
git push origin main
```

Expected: the pre-commit hook passes, the worktree is clean, and the verified commit is present on `origin/main`. If the hook unexpectedly changes a tracked file after committing, do not push: repeat the code-review, simplify, and full verification gate for that diff, stage it, amend the reviewed commit with `git commit --amend --no-edit`, confirm a clean worktree, and only then push.
