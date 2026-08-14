import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import postcss from 'postcss';
import ts from 'typescript';

import tailwindConfig from '../../../tailwind.config';

const globalsCss = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');
const stylesheet = postcss.parse(globalsCss);
const datePickerCss = readFileSync(join(process.cwd(), 'src/app/styles/date-picker.css'), 'utf8');
const datePickerStylesheet = postcss.parse(datePickerCss);

function extractDeclarations(selector, sourceStylesheet = stylesheet) {
  const matchingRules = [];

  sourceStylesheet.walkRules((rule) => {
    if (rule.selector === selector) {
      matchingRules.push(rule);
    }
  });

  if (matchingRules.length !== 1) {
    throw new Error(`Expected one exact ${selector} token block in globals.css, found ${matchingRules.length}`);
  }

  const declarations = {};

  matchingRules[0].each((node) => {
    if (node.type === 'decl') {
      declarations[node.prop] = node.value.trim();
    }
  });

  return declarations;
}

function findExactRule(selectors, sourceStylesheet = stylesheet) {
  const expectedSelectors = Array.isArray(selectors) ? selectors : [selectors];
  const normalizeSelector = (selector) =>
    selector
      .replace(/\s+/g, ' ')
      .replace(/:not\(\s+/g, ':not(')
      .replace(/\s+\)/g, ')')
      .trim();
  const normalizedExpectedSelectors = expectedSelectors.map(normalizeSelector);
  const matchingRules = [];
  let order = 0;

  sourceStylesheet.walkRules((rule) => {
    const ruleSelectors = rule.selector.split(',').map(normalizeSelector);

    if (ruleSelectors.length === normalizedExpectedSelectors.length && ruleSelectors.every((selector, index) => selector === normalizedExpectedSelectors[index])) {
      matchingRules.push({ order, rule });
    }

    order += 1;
  });

  if (matchingRules.length !== 1) {
    throw new Error(`Expected one exact ${expectedSelectors.join(', ')} rule, found ${matchingRules.length}`);
  }

  return matchingRules[0];
}

function extractDeclarationContract(selectors) {
  const { rule } = findExactRule(selectors);
  const declarations = {};

  rule.each((node) => {
    if (node.type === 'decl') {
      declarations[node.prop] = {
        important: Boolean(node.important),
        value: node.value.trim().replace(/\s+/g, ' '),
      };
    }
  });

  return declarations;
}

function extractSelectorContract(selectors) {
  const { order, rule } = findExactRule(selectors);
  const declarations = {};

  rule.each((node) => {
    if (node.type === 'decl') {
      declarations[node.prop] = {
        important: Boolean(node.important),
        value: node.value.trim().replace(/\s+/g, ' '),
      };
    }
  });

  return { declarations, order };
}

function extractRulesContainingSelector(sourceStylesheet, selector) {
  const matchingRules = [];

  sourceStylesheet.walkRules((rule) => {
    const selectors = rule.selector.split(',').map((member) => member.trim());

    if (selectors.includes(selector)) {
      matchingRules.push(rule);
    }
  });

  return matchingRules;
}

function hslToRgb(hue, saturation, lightness) {
  const normalizedHue = (((hue % 360) + 360) % 360) / 360;
  const normalizedSaturation = saturation / 100;
  const normalizedLightness = lightness / 100;

  if (normalizedSaturation === 0) {
    const channel = normalizedLightness * 255;
    return [channel, channel, channel];
  }

  const q = normalizedLightness < 0.5 ? normalizedLightness * (1 + normalizedSaturation) : normalizedLightness + normalizedSaturation - normalizedLightness * normalizedSaturation;
  const p = 2 * normalizedLightness - q;
  const hueToRgb = (offset) => {
    let channel = offset;

    if (channel < 0) channel += 1;
    if (channel > 1) channel -= 1;
    if (channel < 1 / 6) return p + (q - p) * 6 * channel;
    if (channel < 1 / 2) return q;
    if (channel < 2 / 3) return p + (q - p) * (2 / 3 - channel) * 6;
    return p;
  };

  return [hueToRgb(normalizedHue + 1 / 3) * 255, hueToRgb(normalizedHue) * 255, hueToRgb(normalizedHue - 1 / 3) * 255];
}

function parseCssColor(value) {
  const hexMatch = value.match(/^#([\da-f]{6})$/i);
  if (hexMatch) {
    return {
      channels: hexMatch[1].match(/.{2}/g).map((channel) => Number.parseInt(channel, 16)),
      alpha: 1,
    };
  }

  const hslMatch = value.match(/^(-?\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/);
  if (hslMatch) {
    return {
      channels: hslToRgb(...hslMatch.slice(1).map(Number)),
      alpha: 1,
    };
  }

  const rgbFunctionMatch = value.match(/^rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)(?:\s*,\s*(\d*(?:\.\d+)?))?\s*\)$/);
  if (rgbFunctionMatch) {
    return {
      channels: rgbFunctionMatch.slice(1, 4).map(Number),
      alpha: rgbFunctionMatch[4] === undefined ? 1 : Number(rgbFunctionMatch[4]),
    };
  }

  const rgbChannelsMatch = value.match(/^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)$/);
  if (rgbChannelsMatch) {
    return {
      channels: rgbChannelsMatch.slice(1).map(Number),
      alpha: 1,
    };
  }

  throw new Error(`Unsupported CSS color value: ${value}`);
}

function composite(color, backdrop) {
  return color.channels.map((channel, index) => channel * color.alpha + backdrop.channels[index] * (1 - color.alpha));
}

function opaqueChannels(value, backdropValue) {
  const color = parseCssColor(value);

  if (color.alpha === 1) {
    return color.channels;
  }

  if (!backdropValue) {
    throw new Error(`A backdrop is required for translucent color: ${value}`);
  }

  return composite(color, parseCssColor(backdropValue));
}

function relativeLuminance(channels) {
  const linearChannels = channels.map((channel) => channel / 255).map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));

  return 0.2126 * linearChannels[0] + 0.7152 * linearChannels[1] + 0.0722 * linearChannels[2];
}

function contrastRatio(foregroundValue, backgroundValue, backdropValue) {
  const background = opaqueChannels(backgroundValue, backdropValue);
  const foreground = opaqueChannels(foregroundValue, backgroundValue);
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));

  return (lighter + 0.05) / (darker + 0.05);
}

function collectSourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      return ['docs', 'codemod-preview'].includes(entry.name) ? [] : collectSourceFiles(path);
    }

    return /\.(?:css|js|jsx|mdx|ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}

function findDirectSageTextBindings() {
  const forbiddenTokenPattern = /--weelp-sage-(?:deep|hover)\b/;

  return collectSourceFiles(join(process.cwd(), 'src')).flatMap((path) => {
    const source = readFileSync(path, 'utf8');

    if (!forbiddenTokenPattern.test(source)) {
      return [];
    }

    if (path.endsWith('.css')) {
      const violations = [];

      postcss.parse(source, { from: path }).walkDecls('color', (declaration) => {
        if (forbiddenTokenPattern.test(declaration.value)) {
          violations.push({
            line: declaration.source.start.line,
            path,
            value: declaration.value,
          });
        }
      });

      return violations;
    }

    if (!/\.(?:js|jsx|ts|tsx)$/.test(path)) {
      return [];
    }

    const scriptKinds = {
      '.js': ts.ScriptKind.JS,
      '.jsx': ts.ScriptKind.JSX,
      '.ts': ts.ScriptKind.TS,
      '.tsx': ts.ScriptKind.TSX,
    };
    const extension = path.match(/\.(?:js|jsx|ts|tsx)$/)[0];
    const sourceFile = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, scriptKinds[extension]);
    const violations = [];
    const initializerContainsForbiddenToken = (initializer) => {
      let containsForbiddenToken = false;

      const visitInitializer = (node) => {
        if ((ts.isStringLiteralLike(node) || ts.isTemplateExpression(node)) && forbiddenTokenPattern.test(node.getText(sourceFile))) {
          containsForbiddenToken = true;
          return;
        }

        ts.forEachChild(node, visitInitializer);
      };

      visitInitializer(initializer);
      return containsForbiddenToken;
    };
    const visit = (node) => {
      if (ts.isPropertyAssignment(node) && (ts.isIdentifier(node.name) || ts.isStringLiteralLike(node.name)) && node.name.text === 'color' && initializerContainsForbiddenToken(node.initializer)) {
        violations.push({
          line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1,
          path,
          value: node.initializer.getText(sourceFile),
        });
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    return violations;
  });
}

const rootTokens = extractDeclarations(':root');
const darkTokens = extractDeclarations('.dark');

describe('Deep Forest semantic theme', () => {
  it('declares the native control scheme in the existing light and dark token blocks', () => {
    expect(rootTokens['color-scheme']).toBe('light');
    expect(darkTokens['color-scheme']).toBe('dark');

    const colorSchemeDeclarations = [];
    stylesheet.walkDecls('color-scheme', (declaration) => {
      colorSchemeDeclarations.push({
        owner: declaration.parent.selector,
        value: declaration.value,
      });
    });

    expect(colorSchemeDeclarations).toEqual([
      { owner: ':root', value: 'light' },
      { owner: '.dark', value: 'dark' },
    ]);
  });

  it('defines the core dark semantic tokens', () => {
    expect(darkTokens).toMatchObject({
      '--background': '160 36% 5%',
      '--foreground': '153.33 10.35% 65.88%',
      '--card': '159 30% 9%',
      '--card-foreground': '153.33 10.35% 65.88%',
      '--popover': '158 29% 11%',
      '--popover-foreground': '153.33 10.35% 65.88%',
      '--primary': '154 29% 63%',
      '--primary-foreground': '153.33 10.35% 65.88%',
      '--secondary': '158 28% 13%',
      '--secondary-foreground': '153.33 10.35% 65.88%',
      '--muted': '158 28% 13%',
      '--muted-foreground': '153.33 10.35% 65.88%',
      '--accent': '158 28% 13%',
      '--accent-foreground': '153.33 10.35% 65.88%',
      '--destructive': '0 91% 71%',
      '--destructive-foreground': '160 39% 5%',
      '--border': '157 22% 19%',
      '--input': '153 25% 40%',
      '--ring': '154 29% 63%',
      '--surface-elevated': '158 29% 11%',
      '--surface-tint': '159 30% 9%',
      '--weelp-auth-neu-surface': '159 30% 9%',
    });
  });

  it('defines the dark sidebar palette', () => {
    expect(darkTokens).toMatchObject({
      '--sidebar-background': '160 36% 5%',
      '--sidebar-foreground': '153.33 10.35% 65.88%',
      '--sidebar-primary': '154 29% 63%',
      '--sidebar-primary-foreground': '160 39% 5%',
      '--sidebar-accent': '158 28% 13%',
      '--sidebar-accent-foreground': '153.33 10.35% 65.88%',
      '--sidebar-border': '157 22% 19%',
      '--sidebar-ring': '154 29% 63%',
    });

    expect(darkTokens['--sidebar-background']).toBe(darkTokens['--background']);
  });

  it('defines the dark text and link palette', () => {
    expect(darkTokens).toMatchObject({
      '--foreground': '153.33 10.35% 65.88%',
      '--card-foreground': '153.33 10.35% 65.88%',
      '--popover-foreground': '153.33 10.35% 65.88%',
      '--primary-foreground': '153.33 10.35% 65.88%',
      '--secondary-foreground': '153.33 10.35% 65.88%',
      '--accent-foreground': '153.33 10.35% 65.88%',
      '--ink': '#9fb1a9',
      '--copy': '#9fb1a9',
      '--label': '#9fb1a9',
      '--ink-rgb': '159 177 169',
      '--copy-rgb': '159 177 169',
      '--label-rgb': '159 177 169',
      '--link-default': '#9fb1a9',
      '--link-hover': '#9fb1a9',
    });
  });

  it('defines the dark home palette without overriding photography text', () => {
    expect(darkTokens).toMatchObject({
      '--weelp-home-page': '#08110e',
      '--weelp-home-ink': '#9fb1a9',
      '--weelp-home-copy': '#9fb1a9',
      '--weelp-home-label': '#9fb1a9',
      '--weelp-home-soft': '#182b24',
      '--weelp-home-surface': '#101e19',
      '--weelp-home-border': '#263b33',
      '--weelp-home-brand': '#9fb1a9',
      '--weelp-home-muted': '#9fb1a9',
      '--weelp-home-search-shell': 'rgba(20, 36, 30, 0.95)',
      '--weelp-home-search-border': '#304b40',
    });
    expect(rootTokens).toMatchObject({
      '--weelp-home-hero-accent': '#426c59',
      '--weelp-home-hero-ink': '#18181b',
      '--weelp-home-hero-copy': 'rgba(24, 24, 27, 0.8)',
      '--weelp-home-hero-muted': 'rgba(24, 24, 27, 0.72)',
    });
    expect(darkTokens).not.toHaveProperty('--weelp-home-hero-accent');
    expect(darkTokens).not.toHaveProperty('--weelp-home-hero-ink');
    expect(darkTokens).not.toHaveProperty('--weelp-home-hero-copy');
    expect(darkTokens).not.toHaveProperty('--weelp-home-hero-muted');
  });

  it('keeps the unscrolled over-hero header black in both themes', () => {
    const headerSources = ['MobileMenu.jsx', 'NavigationMenu.jsx'].map((filename) => readFileSync(join(process.cwd(), 'src/app/components/Layout', filename), 'utf8'));

    expect({
      dark: darkTokens['--weelp-hero-foreground'],
      light: rootTokens['--weelp-hero-foreground'],
      mapping: tailwindConfig.theme.extend.colors.weelp['hero-foreground'],
    }).toEqual({
      dark: '0 0% 0%',
      light: '0 0% 0%',
      mapping: 'hsl(var(--weelp-hero-foreground) / <alpha-value>)',
    });
    expect(headerSources).toEqual(expect.arrayContaining([expect.stringContaining('text-weelp-hero-foreground/70'), expect.stringContaining('border-weelp-hero-foreground/10')]));
    headerSources.forEach((source) => {
      expect(source).not.toMatch(/\b(?:text|border)-black(?:\/\d+)?\b/);
    });
  });

  it('defines the dark sage and legacy aliases', () => {
    expect(rootTokens['--weelp-sage-text']).toBe('154 24% 34%');
    expect(darkTokens).toMatchObject({
      '--weelp-sage-deep-rgb': '77 128 105',
      '--weelp-sage-hover-rgb': '66 107 89',
      '--weelp-sage-tint-rgb': '48 75 64',
      '--weelp-sage-deep': '153 25% 40%',
      '--weelp-sage-text': '153.33 10.35% 65.88%',
      '--weelp-sage-hover': '154 24% 34%',
      '--weelp-sage-tint': '156 22% 24%',
      '--weelp-sage-wash': '159 30% 9%',
      '--weelp-steel': '152 16% 81%',
      '--weelp-steel-rgb': '199 214 207',
      '--weelp-gray-rgb': '24 43 36',
      '--weelp-bluewhale-rgb': '159 177 169',
      '--weelp-blueish-rgb': '159 177 169',
      '--weelp-lynch-rgb': '159 177 169',
      '--weelp-solitude-rgb': '159 177 169',
      '--weelp-blackish-rgb': '159 177 169',
    });
  });

  it('defines the dark card and city-tab aliases', () => {
    expect(darkTokens).toMatchObject({
      '--weelp-card-border': '#263b33',
      '--weelp-card-badge-bg': '#182b24',
      '--weelp-card-badge-text': '#9fb1a9',
      '--weelp-city-tab-text': '#9fb1a9',
      '--weelp-city-tab-bg': 'rgba(134, 189, 165, 0.08)',
      '--weelp-city-tab-active-bg': 'rgba(134, 189, 165, 0.14)',
      '--weelp-city-tab-active-border': 'rgba(134, 189, 165, 0.35)',
    });
  });

  it('preserves distinct status and chart hues', () => {
    expect(darkTokens).toMatchObject({
      '--success': '142 65% 55%',
      '--warning': '38 80% 60%',
      '--info': '213 90% 60%',
      '--chart-1': '220 70% 50%',
      '--chart-2': '160 60% 45%',
      '--chart-3': '30 80% 55%',
      '--chart-4': '280 65% 60%',
      '--chart-5': '340 75% 55%',
    });
  });

  it('maps the readable sage text role in Tailwind', () => {
    expect(tailwindConfig.theme.extend.colors.weelp['sage-text']).toBe('hsl(var(--weelp-sage-text) / <alpha-value>)');
  });

  it('uses the deep-sage text utility only as an audited artwork color carrier', () => {
    const expectedCarrierCounts = {
      'src/app/components/DashboardShared/Card/CardBadge.jsx': 1,
      'src/app/components/Help/HelpOverview.jsx': 1,
      'src/app/components/Help/SupportRequestSuccess.jsx': 1,
      'src/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/CustomerBookingDetail.jsx': 1,
      'src/app/components/Pages/FRONT_END/city/CityHeroBanner.jsx': 2,
      'src/app/components/Pages/FRONT_END/home/WanderersBanner.jsx': 2,
      'src/app/components/Pages/FRONT_END/shop/BannerSection.jsx': 1,
      'src/app/components/Pages/FRONT_END/singleproduct/ReviewHelpfulButton.jsx': 1,
      'src/app/components/Pages/FRONT_END/tours/ToursHeroDecor.jsx': 3,
      'src/app/components/SingleProductCard.jsx': 4,
    };
    const actualCarrierCounts = {};

    collectSourceFiles(join(process.cwd(), 'src')).forEach((path) => {
      if (path.includes('/__tests__/')) return;

      const source = readFileSync(path, 'utf8');
      const matches = source.match(/\btext-weelp-sage-deep(?:\/[\w[\].-]+)?\b/g) ?? [];

      if (matches.length > 0) {
        actualCarrierCounts[path.replace(`${process.cwd()}/`, '')] = matches.length;
      }
    });

    expect(actualCarrierCounts).toEqual(expectedCarrierCounts);
  });

  it.each([
    'activities/CreateActivityForm.jsx',
    'activities/EditActivityForm.jsx',
    'blogs/PostMedia.jsx',
    'destinations/tabs/MediaTab.jsx',
    'itineraries/CreateItineraryForm.jsx',
    'itineraries/EditItineraryForm.jsx',
    'packages/CreatePackageForm.jsx',
    'packages/EditPackageForm.jsx',
    'transfers/tabs/MediaTab.jsx',
  ])('keeps the interactive featured-media star on sage-text in %s', (relativePath) => {
    const source = readFileSync(join(process.cwd(), 'src/app/components/Pages/DASHBOARD/admin/_rsc_pages', relativePath), 'utf8');
    const fillIndex = source.indexOf("fill={isFeatured ? '#588f7a' : 'white'}");
    const interactiveStar = source.slice(fillIndex, fillIndex + 600);

    expect(fillIndex).toBeGreaterThan(-1);
    expect(interactiveStar).toContain('onClick=');
    expect(interactiveStar).toContain('cursor-pointer');
    expect(interactiveStar).toContain('text-weelp-sage-text');
    expect(interactiveStar).not.toContain('text-weelp-sage-deep');
  });

  it('keeps readable copy and interactive accents on the sage-text role', () => {
    const controls = readFileSync(join(process.cwd(), 'src/app/components/Pages/FRONT_END/shared/ActivityItinerarySearch.jsx'), 'utf8');
    const themeToggle = readFileSync(join(process.cwd(), 'src/components/ui/theme-toggle.jsx'), 'utf8');

    expect(controls).toContain('text-weelp-sage-text">Where to?</span>');
    expect(themeToggle).toContain('hover:text-weelp-sage-text');
    expect(controls).not.toContain('text-weelp-sage-deep">Where to?</span>');
  });

  it.each([
    ['WanderersBanner.jsx', 'fill="currentColor"'],
    ['ToursHeroDecor.jsx', 'stroke="currentColor"'],
  ])('keeps decorative currentColor artwork on the deep fill role in %s', (filename, currentColorBinding) => {
    const source = readFileSync(join(process.cwd(), 'src/app/components/Pages/FRONT_END', filename === 'WanderersBanner.jsx' ? 'home' : 'tours', filename), 'utf8');

    expect(source).toContain('text-weelp-sage-deep');
    expect(source).toContain(currentColorBinding);
  });

  it('leaves no direct CSS or inline text-color bindings on fill-only sage roles', () => {
    expect(findDirectSageTextBindings()).toEqual([]);
  });

  it.each(['activities/FilterActivityPage.jsx', 'itineraries/FilteredItineraryPage.jsx', 'packages/FilteredPackagePage.jsx', 'transfers/FilteredTransferPage.jsx'])(
    'uses copy text on the sage-tint rating badge in %s',
    (relativePath) => {
      const source = readFileSync(join(process.cwd(), 'src/app/components/Pages/DASHBOARD/admin/_rsc_pages', relativePath), 'utf8');

      expect(source).toContain('bg-weelp-sage-tint hover:bg-weelp-sage-tint text-copy');
    },
  );

  it.each([
    ['sage text on page', '--weelp-sage-text', '--background', 4.5],
    ['sage text on card', '--weelp-sage-text', '--card', 4.5],
    ['sage text on muted surface', '--weelp-sage-text', '--muted', 4.5],
    ['primary text on page', '--foreground', '--background', 4.5],
    ['copy on card', '--weelp-home-copy', '--weelp-home-surface', 4.5],
    ['input boundary on card', '--weelp-sage-deep', '--card', 3],
    ['primary mark on page', '--primary', '--background', 3],
    ['destructive text on card', '--destructive', '--card', 4.5],
    ['dark text on destructive', '--destructive-foreground', '--destructive', 4.5],
    ['label on soft surface', '--weelp-home-label', '--weelp-home-soft', 4.5],
    ['success mark on card', '--success', '--card', 3],
    ['warning mark on card', '--warning', '--card', 3],
    ['info mark on card', '--info', '--card', 3],
  ])('%s meets its minimum contrast ratio from parsed dark tokens', (_name, foreground, background, minimum) => {
    expect(darkTokens[foreground]).toBeDefined();
    expect(darkTokens[background]).toBeDefined();
    expect(contrastRatio(darkTokens[foreground], darkTokens[background])).toBeGreaterThanOrEqual(minimum);
  });

  it('keeps white text readable on the deep sage fill', () => {
    expect(contrastRatio('#ffffff', darkTokens['--weelp-sage-deep'])).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps booking cancellation actions in the canonical dark button hierarchy', () => {
    const excludedRules = [];

    stylesheet.walkRules((rule) => {
      if (rule.selector.includes(':not(.weelp-booking-status-action)')) {
        excludedRules.push(rule.selector);
      }
    });

    expect(excludedRules).toEqual([]);
  });

  const darkInteractiveControlSelectors = [
    ".dark button:not(:disabled):not([aria-disabled='true']):not(.weelp-auth-mode-switch):not(.weelp-header-nav-item):not(.review-featured-switch):not(.weelp-creator-like-button):not(.weelp-search-control):not(.weelp-plain-action):not([data-sidebar='menu-button']):not([data-sidebar='rail'])",
    ".dark a[role='button']:not([aria-disabled='true'])",
    ".dark a[data-weelp-button-link]:not([aria-disabled='true'])",
    ".dark a[class~='bg-weelp-sage-deep']:not([aria-disabled='true'])",
    ".dark a[class~='bg-primary']:not([aria-disabled='true'])",
  ];
  const darkInteractiveControlHoverSelectors = [
    ".dark button:not(:disabled):not([aria-disabled='true']):not(.weelp-auth-mode-switch):not(.weelp-header-nav-item):not(.review-featured-switch):not(.weelp-creator-like-button):not(.weelp-search-control):not(.weelp-plain-action):not(.weelp-add-day-button):not([data-sidebar='menu-button']):not([data-sidebar='rail']):hover",
    ...darkInteractiveControlSelectors.slice(1).map((selector) => `${selector}:hover`),
  ];

  it('gives enabled dark buttons and button-shaped anchors the Dubai Tours hover shadow', () => {
    const restingRule = extractSelectorContract(darkInteractiveControlSelectors);
    const hoverRule = extractSelectorContract(darkInteractiveControlHoverSelectors);
    const { rule: reducedMotionRule } = findExactRule(['*', '*::before', '*::after']);

    expect(restingRule.declarations).toMatchObject({
      'transition-property': { important: true, value: 'color, background-color, border-color, box-shadow, opacity, transform' },
      'transition-duration': { important: true, value: '200ms' },
      'transition-timing-function': { important: true, value: 'cubic-bezier(0.4, 0, 0.2, 1)' },
    });
    expect(hoverRule.declarations).toMatchObject({
      'box-shadow': {
        important: true,
        value: 'var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 4px 4px 15px rgba(88, 143, 122, 0.3)',
      },
    });
    expect(hoverRule.order).toBeGreaterThan(restingRule.order);
    expect(reducedMotionRule.parent.type).toBe('atrule');
    expect(reducedMotionRule.parent.name).toBe('media');
    expect(reducedMotionRule.parent.params).toBe('(prefers-reduced-motion: reduce)');
    expect(reducedMotionRule.nodes.find((node) => node.type === 'decl' && node.prop === 'transition-duration')).toMatchObject({
      important: true,
      value: '0.01ms',
    });

    darkInteractiveControlSelectors.forEach((selector) => {
      expect(selector.startsWith('.dark ')).toBe(true);
      expect(selector).toContain(":not([aria-disabled='true'])");
    });
    expect(darkInteractiveControlSelectors[0]).toContain(':not(:disabled)');
    expect(darkInteractiveControlSelectors).not.toContain('.dark a');
    expect(extractRulesContainingSelector(stylesheet, '.dark a:hover')).toHaveLength(0);

    const fixture = document.createElement('div');
    fixture.className = 'dark';
    fixture.innerHTML = `
      <button data-testid="enabled-button">Continue</button>
      <button data-testid="auth-mode-switch" class="weelp-auth-mode-switch">Sign Up</button>
      <button data-testid="header-nav-button" class="weelp-header-nav-item">Dashboard</button>
      <button data-testid="review-featured-switch" class="review-featured-switch">Featured Review</button>
      <button data-testid="creator-like-button" class="weelp-creator-like-button">Like itinerary</button>
      <button data-testid="sidebar-button" data-sidebar="menu-button">Creators</button>
      <button data-testid="sidebar-rail" data-sidebar="rail">Toggle Sidebar</button>
      <a data-testid="marked-anchor" data-weelp-button-link href="/continue">Continue</a>
      <a data-testid="filled-anchor" class="bg-weelp-sage-deep" href="/book">Book</a>
      <a data-testid="card-anchor" class="group block border" href="/tour">Tour card</a>
      <a data-testid="nav-anchor" class="border" href="/destinations">Destinations</a>
      <a data-testid="text-anchor" href="/about">About</a>
      <a data-testid="disabled-anchor" data-weelp-button-link aria-disabled="true" href="/unavailable">Unavailable</a>
      <button data-testid="disabled-button" disabled>Unavailable</button>
    `;

    const selectedControls = Array.from(fixture.querySelectorAll(darkInteractiveControlSelectors.join(','))).map((element) => element.dataset.testid);

    expect(selectedControls).toEqual(['enabled-button', 'marked-anchor', 'filled-anchor']);
  });

  it.each([
    ['src/app/(frontend)/cms-page-template.js', 2],
    ['src/app/(frontend)/cities/page.js', 5],
    ['src/app/components/Pages/FRONT_END/city/CityItemsListing.jsx', 5],
    ['src/app/components/Pages/FRONT_END/cities/CitiesListingControls.jsx', 1],
    ['src/app/(dashboard)/dashboard/customer/wishlist/WishlistClient.jsx', 1],
    ['src/app/components/Pages/FRONT_END/checkout/CheckoutResultState.jsx', 1],
    ['src/app/components/ui/ProductSliderSection.jsx', 1],
    ['src/app/components/Form/FormResetPassword.jsx', 2],
    ['src/app/components/Layout/MobileMenu.jsx', 3],
  ])('marks every audited direct button-shaped anchor for the dark hover contract', (relativePath, expectedCount) => {
    const source = readFileSync(join(process.cwd(), relativePath), 'utf8');

    expect(source.match(/\bdata-weelp-button-link\b/g)?.length ?? 0).toBe(expectedCount);
  });

  it('sets the dark site-wide button surface and border to the requested tokens', () => {
    const buttonRule = extractSelectorContract([
      ".dark button:not(.weelp-auth-mode-switch):not(.weelp-header-nav-item):not(.weelp-single-product-tab):not(.review-featured-switch):not(.weelp-creator-like-button):not(.weelp-search-control):not(.weelp-plain-action):not(.weelp-add-day-button):not(.bg-card):not([data-sidebar='menu-button']):not([data-sidebar='rail'])",
      ".dark a[role='button']",
      ".dark [role='button']",
      ".dark a[class~='bg-weelp-sage-deep']",
      ".dark a[class~='bg-primary']",
    ]);
    const fieldButtonRule = extractSelectorContract('.dark button.bg-card');

    expect(buttonRule.declarations).toMatchObject({
      border: { important: true, value: '1px solid hsl(var(--border))' },
      'background-color': { important: true, value: 'var(--weelp-home-page)' },
      color: { important: true, value: 'var(--weelp-home-muted)' },
    });
    expect(fieldButtonRule.declarations).toMatchObject({
      'background-color': { important: true, value: 'var(--weelp-home-surface)' },
    });
    expect(darkTokens['--weelp-home-page']).toBe('#08110e');
    expect(darkTokens['--weelp-home-surface']).toBe('#101e19');
    expect(darkTokens['--border']).toBe('157 22% 19%');
    expect(darkTokens['--weelp-home-muted']).toBe('#9fb1a9');
  });

  it('keeps header navigation buttons transparent and borderless in dark mode', () => {
    const headerNavigationRule = extractSelectorContract('.dark button.weelp-header-nav-item');

    expect(headerNavigationRule.declarations).toMatchObject({
      border: { important: true, value: '0' },
      'background-color': { important: true, value: 'transparent' },
    });
    expect(headerNavigationRule.declarations.color).toBeUndefined();
  });

  it('keeps inactive sidebar menu buttons transparent and borderless in dark mode', () => {
    const sidebarMenuButtonRule = extractSelectorContract(".dark button[data-sidebar='menu-button']:not([data-active='true'])");

    expect(sidebarMenuButtonRule.declarations).toMatchObject({
      border: { important: true, value: '0' },
      'background-color': { important: true, value: 'transparent' },
    });
    expect(sidebarMenuButtonRule.declarations.color).toBeUndefined();
  });

  it('keeps the sidebar rail transparent, borderless, and shadowless in dark mode', () => {
    const sidebarRailRule = extractSelectorContract(".dark button[data-sidebar='rail']");

    expect(sidebarRailRule.declarations).toMatchObject({
      border: { important: true, value: '0' },
      'background-color': { important: true, value: 'transparent' },
      'box-shadow': { important: true, value: 'none' },
    });
    expect(sidebarRailRule.declarations.color).toBeUndefined();
  });

  it('keeps single-product tabs transparent and borderless in dark mode', () => {
    const tabRule = extractSelectorContract('.dark button.weelp-single-product-tab');

    expect(tabRule.declarations).toMatchObject({
      border: { important: true, value: '0' },
      'background-color': { important: true, value: 'transparent' },
    });
    expect(tabRule.declarations.color).toBeUndefined();
  });

  it('keeps copy readable on the translucent search shell', () => {
    expect(contrastRatio(darkTokens['--weelp-home-copy'], darkTokens['--weelp-home-search-shell'], darkTokens['--weelp-home-page'])).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps autofilled auth inputs on the auth surface', () => {
    const lightAutofillRule = extractSelectorContract([
      '.weelp-auth-input:-webkit-autofill',
      '.weelp-auth-input:-webkit-autofill:hover',
      '.weelp-auth-input:-webkit-autofill:focus',
      '.weelp-auth-input:-webkit-autofill:active',
    ]);
    const darkAutofillRule = extractSelectorContract([
      '.dark .weelp-auth-input:-webkit-autofill',
      '.dark .weelp-auth-input:-webkit-autofill:hover',
      '.dark .weelp-auth-input:-webkit-autofill:focus',
      '.dark .weelp-auth-input:-webkit-autofill:active',
    ]);

    expect(lightAutofillRule.declarations['-webkit-box-shadow']).toEqual({
      important: true,
      value: '0 0 0 30px hsl(var(--weelp-auth-neu-surface)) inset',
    });
    expect(darkAutofillRule.declarations['-webkit-box-shadow']).toEqual({
      important: true,
      value: '0 0 0 30px hsl(var(--weelp-auth-neu-surface)) inset',
    });
  });

  it.each([
    ['light page', '--background'],
    ['light card', '--card'],
    ['light muted surface', '--muted'],
  ])('keeps sage text readable on the %s', (_name, background) => {
    expect(contrastRatio(rootTokens['--weelp-sage-text'], rootTokens[background])).toBeGreaterThanOrEqual(4.5);
  });

  it('uses semantic dark calendar variables without legacy neutral literals', () => {
    const declarations = extractDeclarations('.dark .weelp-calendar', datePickerStylesheet);
    const darkCalendarRule = extractRulesContainingSelector(datePickerStylesheet, '.dark .weelp-calendar')[0].toString();

    expect(declarations).toMatchObject({
      '--weelp-cal-fg': 'hsl(var(--foreground))',
      '--weelp-cal-muted': 'hsl(var(--muted-foreground))',
      '--weelp-cal-disabled': 'hsl(var(--muted-foreground) / 0.45)',
      '--weelp-cal-selected-soft': 'hsl(var(--weelp-sage-deep) / 0.32)',
      '--weelp-cal-single': 'hsl(var(--muted))',
      '--weelp-cal-single-hover': 'hsl(var(--accent))',
    });
    expect(darkCalendarRule).not.toMatch(/#(?:e5e7eb|9ca3af|374151|27272a|3f3f46)\b/i);
  });

  it('uses a dark selected calendar fill with readable foreground contrast', () => {
    const declarations = extractDeclarations('.dark .weelp-calendar', datePickerStylesheet);

    expect(declarations['--weelp-cal-selected']).toBe('hsl(var(--background))');
    expect(darkTokens['--foreground']).toBeDefined();
    expect(darkTokens['--background']).toBeDefined();
    expect(contrastRatio(darkTokens['--foreground'], darkTokens['--background'])).toBeGreaterThanOrEqual(4.5);
  });

  it('uses semantic tokens for every dark neumorphism switch surface', () => {
    const rootSurface = extractSelectorContract(['.dark .neumorphism-switch-root', ".dark .neumorphism-switch-root[data-state='checked']"]);
    const rootShadow = extractSelectorContract('.dark .neumorphism-switch-root');
    const toggleSurface = extractSelectorContract(['.dark .neumorphism-switch-toggle', ".dark .neumorphism-switch-root[data-state='checked'] .neumorphism-switch-toggle"]);
    const hoverShadow = extractSelectorContract('.dark .neumorphism-switch-root:hover .neumorphism-switch-toggle');
    const lightCheckedRoot = findExactRule(".neumorphism-switch-root[data-state='checked']");
    const lightCheckedToggle = findExactRule(".neumorphism-switch-root[data-state='checked'] .neumorphism-switch-toggle");
    const lightHover = findExactRule('.neumorphism-switch-root:hover .neumorphism-switch-toggle');
    const darkSwitchRules = [];

    stylesheet.walkRules((rule) => {
      if (rule.selector.split(',').some((selector) => selector.trim().startsWith('.dark .neumorphism-switch'))) {
        darkSwitchRules.push(rule.toString());
      }
    });

    const darkSwitchSource = darkSwitchRules.join('\n');

    expect(rootSurface.declarations).toEqual({
      background: { important: true, value: 'hsl(var(--muted))' },
    });
    expect(rootShadow.declarations).toEqual({
      'box-shadow': {
        important: true,
        value: 'inset -3px -3px 6px hsl(var(--input)), inset 3px 3px 6px hsl(var(--background))',
      },
    });
    expect(toggleSurface.declarations).toEqual({
      background: {
        important: false,
        value: 'linear-gradient(145deg, hsl(var(--input)), hsl(var(--card)))',
      },
      'box-shadow': {
        important: false,
        value: '-2px -2px 4px hsl(var(--border)), 2px 2px 4px hsl(var(--background))',
      },
    });
    expect(hoverShadow.declarations).toEqual({
      'box-shadow': {
        important: false,
        value: '-2px -2px 6px hsl(var(--border)), 2px 2px 6px hsl(var(--background))',
      },
    });
    expect(darkSwitchRules).toHaveLength(4);
    expect(lightCheckedRoot.order).toBeLessThan(rootSurface.order);
    expect(rootSurface.order).toBeLessThan(rootShadow.order);
    expect(lightCheckedToggle.order).toBeLessThan(toggleSurface.order);
    expect(toggleSurface.order).toBeLessThan(hoverShadow.order);
    expect(lightHover.order).toBeLessThan(hoverShadow.order);
    expect(darkSwitchSource).not.toMatch(/#(?:202020|2a2a2a|0c0c0c|171717|2f2f2f|070707|2c2c2c|1b1b1b|303030|050505)\b/i);
  });

  it('preserves the exact light neumorphism switch declarations', () => {
    expect(extractDeclarationContract('.neumorphism-switch-root')).toEqual({
      position: { important: false, value: 'relative' },
      display: { important: false, value: 'inline-flex' },
      'align-items': { important: false, value: 'center' },
      'flex-shrink': { important: false, value: '0' },
      width: { important: false, value: '58px' },
      height: { important: false, value: '30px' },
      background: { important: false, value: '#d6d6d6' },
      'border-radius': { important: false, value: '999px' },
      cursor: { important: false, value: 'pointer' },
      'box-shadow': {
        important: true,
        value: 'inset -3px -3px 6px #ffffff, inset 3px 3px 6px #b0b0b0',
      },
    });
    expect(extractDeclarationContract(".neumorphism-switch-root[data-state='checked']")).toEqual({
      background: { important: true, value: '#d6d6d6' },
    });
    expect(extractDeclarationContract('.neumorphism-switch-root:focus-visible')).toEqual({
      outline: { important: false, value: '2px solid rgba(88, 143, 122, 0.45)' },
      'outline-offset': { important: false, value: '2px' },
    });
    expect(extractDeclarationContract('.neumorphism-switch-toggle')).toEqual({
      position: { important: false, value: 'absolute' },
      top: { important: false, value: '3px' },
      left: { important: false, value: '3px' },
      width: { important: false, value: '28px' },
      height: { important: false, value: '22px' },
      display: { important: false, value: 'flex' },
      'align-items': { important: false, value: 'center' },
      'justify-content': { important: false, value: 'flex-start' },
      'padding-left': { important: false, value: '5px' },
      background: { important: false, value: 'linear-gradient(145deg, #d9d9d9, #bfbfbf)' },
      'border-radius': { important: false, value: '999px' },
      'box-shadow': {
        important: false,
        value: '-2px -2px 4px #ffffff, 2px 2px 4px #b0b0b0',
      },
      transition: {
        important: false,
        value: 'left 0.3s ease-in-out, background 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
      },
    });
    expect(extractDeclarationContract('.neumorphism-switch-led')).toEqual({
      width: { important: false, value: '6px' },
      height: { important: false, value: '6px' },
      background: { important: false, value: 'grey' },
      'border-radius': { important: false, value: '50%' },
      'box-shadow': { important: false, value: '0 0 6px 1px rgba(0, 0, 0, 0.2)' },
      transition: {
        important: false,
        value: 'background 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
      },
    });
    expect(extractDeclarationContract(".neumorphism-switch-root[data-state='checked'] .neumorphism-switch-toggle")).toEqual({
      left: { important: false, value: '25px' },
      background: { important: false, value: 'linear-gradient(145deg, #cfcfcf, #a9a9a9)' },
      'box-shadow': {
        important: false,
        value: '-2px -2px 4px #ffffff, 2px 2px 4px #8a8a8a',
      },
    });
    expect(extractDeclarationContract(".neumorphism-switch-root[data-state='checked'] .neumorphism-switch-led")).toEqual({
      background: { important: false, value: 'yellow' },
      'box-shadow': { important: false, value: '0 0 8px 2px yellow' },
    });
    expect(extractDeclarationContract('.neumorphism-switch-root:hover .neumorphism-switch-toggle')).toEqual({
      'box-shadow': {
        important: false,
        value: '-2px -2px 6px #ffffff, 2px 2px 6px #9b9b9b',
      },
    });
  });

  it('keeps the approved city hero light gradient and uses semantic dark surface tokens', () => {
    expect(extractDeclarations('.weelp-city-hero-surface')).toEqual({
      background: 'linear-gradient(-165deg, #f8faf9, #f2f7f5)',
    });
    expect(extractDeclarations('.dark .weelp-city-hero-surface').background.replace(/\s+/g, ' ')).toBe(
      'radial-gradient(circle at 78% 22%, hsl(var(--ring) / 0.12), transparent 34%), linear-gradient(145deg, hsl(var(--background)) 0%, hsl(var(--card)) 48%, hsl(var(--background)) 100%)',
    );
  });
});
