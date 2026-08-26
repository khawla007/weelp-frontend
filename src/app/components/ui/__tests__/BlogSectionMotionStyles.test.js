import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');

test('uses the shared carousel motion instead of a guide-only contract', () => {
  expect(css).toContain('@keyframes weelpCarouselRevealRight');
  expect(css).toContain("data-carousel-section-entrance='stagger-right'");
  expect(css).not.toContain('weelpGuideCardReveal');
  expect(css).not.toContain("data-guide-section-entrance='editorial-right'");
});
