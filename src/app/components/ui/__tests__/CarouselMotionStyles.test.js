import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');

test('defines the approved homepage carousel entrance contract', () => {
  expect(css).toContain('@keyframes weelpCarouselRevealRight');
  expect(css).toContain('transform: translate3d(32px, 0, 0) scale(0.985)');
  expect(css).toContain("[data-carousel-section-entrance='stagger-right'][data-reveal='pending'] [data-carousel-section-header]");
  expect(css).toContain("[data-carousel-section-entrance='stagger-right'][data-reveal='shown'] .swiper-slide");
  expect(css).toContain('animation: weelpCarouselRevealRight 850ms var(--weelp-ease-out) both');
  expect(css).toContain('animation-delay: calc(var(--weelp-carousel-reveal-index, 0) * 90ms)');
});

test('removes carousel entrance motion for reduced-motion users', () => {
  const reducedMotionBlock = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));
  const reducedCarouselRule =
    /\[data-carousel-section-entrance='stagger-right'\]\[data-reveal\] \[data-carousel-section-header\],\s*\[data-carousel-section-entrance='stagger-right'\]\[data-reveal\] \.swiper-slide\s*\{[^}]*opacity: 1;[^}]*transform: none;[^}]*animation: none;[^}]*will-change: auto;[^}]*\}/s;

  expect(reducedMotionBlock).toMatch(reducedCarouselRule);
});

test('bypasses carousel entrance motion when observation is unavailable', () => {
  const bypassRule = css.match(
    /\[data-carousel-section-entrance='stagger-right'\]\[data-reveal-motion='bypassed'\] \[data-carousel-section-header\],\s*\[data-carousel-section-entrance='stagger-right'\]\[data-reveal-motion='bypassed'\] \.swiper-slide\s*\{([^}]*)\}/s,
  );
  const declarations = bypassRule?.[1] || '';

  expect(bypassRule).not.toBeNull();
  expect(declarations).toMatch(/opacity:\s*1;/);
  expect(declarations).toMatch(/transform:\s*none;/);
  expect(declarations).toMatch(/animation:\s*none;/);
  expect(declarations).toMatch(/animation-delay:\s*0ms;/);
  expect(declarations).toMatch(/will-change:\s*auto;/);
});
