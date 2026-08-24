import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');

test('defines the approved homepage testimonial stagger-up contract', () => {
  expect(css).toContain('@keyframes weelpTestimonialRevealUp');
  expect(css).toContain('transform: translate3d(0, 24px, 0) scale(0.985)');
  expect(css).toContain("[data-testimonial-section-entrance='stagger-up'][data-reveal='pending'] [data-testimonial-section-heading]");
  expect(css).toContain("[data-testimonial-section-entrance='stagger-up'][data-reveal='shown'] .swiper-slide");
  expect(css).toContain('animation: weelpTestimonialRevealUp 800ms var(--weelp-ease-out) both');
  expect(css).toContain('animation-delay: calc(var(--weelp-testimonial-reveal-index, 0) * 100ms)');
});

test('removes testimonial entrance motion for reduced-motion users', () => {
  const reducedMotionBlock = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));
  const reducedTestimonialRule =
    /\[data-testimonial-section-entrance='stagger-up'\]\[data-reveal\] \[data-testimonial-section-heading\],\s*\[data-testimonial-section-entrance='stagger-up'\]\[data-reveal\] \.swiper-slide\s*\{[^}]*opacity: 1;[^}]*transform: none;[^}]*animation: none;[^}]*will-change: auto;[^}]*\}/s;

  expect(reducedMotionBlock).toMatch(reducedTestimonialRule);
});
