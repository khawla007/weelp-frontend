import fs from 'node:fs';
import path from 'node:path';

const stylesheet = fs.readFileSync(path.join(process.cwd(), 'src/app/components/Pages/FRONT_END/About/AboutPage.module.css'), 'utf8');

const declarationsFor = (selector) => {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = stylesheet.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`));

  if (!match) throw new Error(`Missing CSS rule for ${selector}`);

  return match[1].replace(/\s+/g, ' ').trim();
};

const paddingBlockValuesFor = (selector) => {
  const rules = stylesheet.matchAll(/([^{}]+)\{([^{}]*)\}/g);

  return [...rules].flatMap(([, selectors, declarations]) => {
    const includesSelector = selectors
      .split(',')
      .map((item) => item.trim())
      .includes(selector);
    if (!includesSelector) return [];

    const paddingBlock = declarations.match(/padding-block:\s*([^;]+);/);
    return paddingBlock ? [paddingBlock[1].trim()] : [];
  });
};

describe('About page Home spacing', () => {
  test('uses the Home page mobile, tablet, and desktop spacing for sections two and three', () => {
    const storySection = declarationsFor('.storySection');
    const masonrySection = declarationsFor('.masonrySection');
    const masonryInner = declarationsFor('.masonryInner');

    expect(storySection).not.toMatch(/min-height:/);
    expect(masonrySection).not.toMatch(/min-height:/);
    expect(masonryInner).not.toMatch(/min-height:/);
    expect(paddingBlockValuesFor('.storySection')).toEqual(['6rem', '4rem', '2.5rem']);
    expect(paddingBlockValuesFor('.masonrySection')).toEqual(['6rem', '4rem', '2.5rem']);
  });

  test('keeps the offer contact row centered', () => {
    const masonryContact = declarationsFor('.masonryContact');

    expect(masonryContact).toContain('justify-content: center;');
    expect(masonryContact).toContain('margin-top: 3.75rem;');
    expect(masonryContact).not.toMatch(/border-top:/);
    expect(masonryContact).not.toMatch(/padding-top:/);
  });

  test('fits the Why Choose section below the desktop header and uses a theme-aware glass metric', () => {
    const whyGrid = declarationsFor('.whyGrid');
    const whyContent = declarationsFor('.whyContent');
    const whyMetric = declarationsFor('.whyMetric');

    expect(whyGrid).toContain('min-height: min(58.375rem, calc(100svh - 4.125rem));');
    expect(whyContent).toContain('padding: clamp(3rem, 7vh, 5.5rem) clamp(2.875rem, 5vw, 5.5rem);');
    expect(whyMetric).toContain('border: 3px solid hsl(var(--foreground) / 16%);');
    expect(whyMetric).toContain('border-radius: 1.5625rem;');
    expect(whyMetric).toContain('background: hsl(var(--background) / 88%);');
    expect(whyMetric).toContain('backdrop-filter: blur(0.625rem);');
  });

  test('tightens only the short-desktop Why Choose vertical padding', () => {
    expect(stylesheet).toMatch(/@media \(min-width: 1024px\) and \(max-height: 760px\)\s*\{\s*\.whyContent\s*\{\s*padding-block: 1.75rem;\s*\}\s*\}/);
  });

  test('uses the measured Team section rhythm inside its page container', () => {
    const teamSection = declarationsFor('.teamSection');
    const teamInner = declarationsFor('.teamInner');
    const teamHeader = declarationsFor('.teamHeader');
    const teamImage = declarationsFor('.teamImage');

    expect(teamSection).not.toMatch(/min-height:/);
    expect(teamSection).toContain('padding-block: 6rem;');
    expect(teamInner).toContain('display: flex;');
    expect(teamInner).toContain('flex-direction: column;');
    expect(teamHeader).toContain('margin-bottom: 3.875rem;');
    expect(teamImage).toContain('aspect-ratio: 1;');
    expect(teamImage).toContain('border-radius: 1rem;');
    expect(paddingBlockValuesFor('.teamSection')).toEqual(['6rem', '4rem', '2.5rem']);
  });
});
