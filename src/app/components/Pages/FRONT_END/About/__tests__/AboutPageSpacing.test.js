import fs from 'node:fs';
import path from 'node:path';

const stylesheet = fs.readFileSync(path.join(process.cwd(), 'src/app/components/Pages/FRONT_END/About/AboutPage.module.css'), 'utf8');

const declarationsFor = (selector) => {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = stylesheet.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`));

  if (!match) throw new Error(`Missing CSS rule for ${selector}`);

  return match[1].replace(/\s+/g, ' ').trim();
};

describe('About page reference spacing', () => {
  test('keeps the story content between equal 140px section gutters', () => {
    const storySection = declarationsFor('.storySection');

    expect(storySection).not.toMatch(/min-height:/);
    expect(storySection).toContain('padding-block: 8.75rem;');
  });

  test('centers the offer contact row with the reference bottom spacing', () => {
    const masonrySection = declarationsFor('.masonrySection');
    const masonryInner = declarationsFor('.masonryInner');
    const masonryContact = declarationsFor('.masonryContact');

    expect(masonrySection).toContain('padding-block: 8.75rem 9.3125rem;');
    expect(masonryInner).not.toMatch(/min-height:/);
    expect(masonryContact).toContain('justify-content: center;');
    expect(masonryContact).toContain('margin-top: 3.75rem;');
    expect(masonryContact).not.toMatch(/border-top:/);
    expect(masonryContact).not.toMatch(/padding-top:/);
  });
});
