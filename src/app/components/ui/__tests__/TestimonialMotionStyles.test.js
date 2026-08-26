import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');

test('uses the shared carousel entrance instead of a testimonial-only motion contract', () => {
  expect(css).toContain('@keyframes weelpCarouselRevealRight');
  expect(css).not.toContain('weelpTestimonialRevealUp');
  expect(css).not.toContain("data-testimonial-section-entrance='stagger-up'");
});
