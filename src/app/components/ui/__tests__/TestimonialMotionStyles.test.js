import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');
const swiperCss = readFileSync(join(process.cwd(), 'src/app/styles/swiper.css'), 'utf8');

test('defines the approved homepage testimonial stagger-up contract', () => {
  const keyframeTravel = css.match(/@keyframes weelpTestimonialRevealUp\s*{\s*from\s*{[^}]*translate3d\(0, (\d+)px, 0\) scale\(0\.985\)/s);
  const pendingTravel = css.match(/\[data-testimonial-section-entrance='stagger-up'\]\[data-reveal='pending'\] \.swiper-slide\s*{[^}]*translate3d\(0, (\d+)px, 0\) scale\(0\.985\)/s);
  const wrapperPadding = swiperCss.match(/\.carousel-shell-wrapper\s*{[^}]*padding:\s*(\d+)px\s+4px/s);

  expect(keyframeTravel).not.toBeNull();
  expect(pendingTravel).not.toBeNull();
  expect(wrapperPadding).not.toBeNull();
  expect(Number(keyframeTravel[1])).toBe(16);
  expect(Number(pendingTravel[1])).toBe(Number(keyframeTravel[1]));
  expect(Number(pendingTravel[1])).toBeLessThanOrEqual(Number(wrapperPadding[1]));
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
