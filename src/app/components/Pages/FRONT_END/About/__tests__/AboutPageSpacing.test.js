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
});
