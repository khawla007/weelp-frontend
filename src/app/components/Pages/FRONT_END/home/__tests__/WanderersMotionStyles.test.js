import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');

const extractRule = (selector) => {
  const start = css.indexOf(selector);
  if (start === -1) return '';
  const open = css.indexOf('{', start);
  let depth = 0;
  for (let index = open; index < css.length; index += 1) {
    if (css[index] === '{') depth += 1;
    if (css[index] === '}') depth -= 1;
    if (depth === 0) return css.slice(start, index + 1);
  }
  return '';
};

const keyframe = (name) => extractRule(`@keyframes ${name}`);
const inward = "[data-wanderers-entrance='inward-frame']";

test('defines each Curate inward-frame keyframe contract', () => {
  expect(keyframe('weelpWanderersTopReveal')).toMatch(/from\s*{\s*opacity: 0;\s*transform: translate3d\(0, 12px, 0\);\s*}\s*to\s*{\s*opacity: 1;\s*transform: translate3d\(0, 0, 0\);/s);
  expect(keyframe('weelpWanderersPatternLeft')).toMatch(/from\s*{\s*opacity: 0;\s*transform: translate3d\(-36px, 0, 0\);\s*}\s*to\s*{\s*opacity: 1;\s*transform: translate3d\(0, 0, 0\);/s);
  expect(keyframe('weelpWanderersPatternRight')).toMatch(/from\s*{\s*opacity: 0;\s*transform: translate3d\(36px, 0, 0\);\s*}\s*to\s*{\s*opacity: 1;\s*transform: translate3d\(0, 0, 0\);/s);
  expect(keyframe('weelpWanderersLineDraw')).toMatch(/from\s*{\s*transform: scaleX\(0\);\s*}\s*to\s*{\s*transform: scaleX\(1\);/s);
  expect(keyframe('weelpWanderersButtonReveal')).toMatch(
    /from\s*{\s*opacity: 0;\s*transform: translate3d\(0, 14px, 0\) scale\(0\.97\);\s*}\s*to\s*{\s*opacity: 1;\s*transform: translate3d\(0, 0, 0\) scale\(1\);/s,
  );
});

test('attaches Curate timings and directions to their exact selectors', () => {
  const pendingRoot = extractRule(`${inward}[data-reveal='pending']`);
  const shownRoot = extractRule(`${inward}[data-reveal='shown']`);
  const pendingTop = extractRule(`${inward}[data-reveal='pending'] [data-wanderers-top]`);
  const pendingLeft = extractRule(`${inward}[data-reveal='pending'] [data-wanderers-pattern='left']`);
  const pendingRight = extractRule(`${inward}[data-reveal='pending'] [data-wanderers-pattern='right']`);
  const shownTop = extractRule(`${inward}[data-reveal='shown'] [data-wanderers-top]`);
  const shownLeft = extractRule(`${inward}[data-reveal='shown'] [data-wanderers-pattern='left']`);
  const shownRight = extractRule(`${inward}[data-reveal='shown'] [data-wanderers-pattern='right']`);
  const pendingLines = extractRule(`${inward}[data-reveal='pending'] [data-wanderers-line]`);
  const shownLines = extractRule(`${inward}[data-reveal='shown'] [data-wanderers-line]`);
  const shownButton = extractRule(`${inward}[data-reveal='shown'] [data-wanderers-button]`);
  const pendingButton = extractRule(`${inward}[data-reveal='pending'] [data-wanderers-button]`);
  const leftLine = extractRule(`${inward}[data-reveal] [data-wanderers-line='left']`);
  const rightLine = extractRule(`${inward}[data-reveal] [data-wanderers-line='right']`);

  expect(pendingRoot).toMatch(/opacity: 1;\s*transform: none;\s*animation: none;/s);
  expect(shownRoot).toMatch(/opacity: 1;\s*transform: none;\s*animation: none;/s);
  expect(pendingTop).toMatch(/opacity: 0;\s*transform: translate3d\(0, 12px, 0\);/s);
  expect(pendingLeft).toMatch(/opacity: 0;\s*transform: translate3d\(-36px, 0, 0\);/s);
  expect(pendingRight).toMatch(/opacity: 0;\s*transform: translate3d\(36px, 0, 0\);/s);
  expect(pendingLines).toMatch(/transform: scaleX\(0\);/);
  expect(pendingButton).toMatch(/opacity: 0;\s*transform: translate3d\(0, 14px, 0\) scale\(0\.97\);/s);
  expect(leftLine).toMatch(/transform-origin: left center;/);
  expect(rightLine).toMatch(/transform-origin: right center;/);
  expect(shownTop).toMatch(/animation: weelpWanderersTopReveal 700ms var\(--weelp-ease-out\) both;/);
  expect(shownTop).not.toContain('animation-delay:');
  expect(shownLeft).toMatch(/animation: weelpWanderersPatternLeft 850ms var\(--weelp-ease-out\) both;\s*animation-delay: 80ms;/s);
  expect(shownRight).toMatch(/animation: weelpWanderersPatternRight 850ms var\(--weelp-ease-out\) both;\s*animation-delay: 80ms;/s);
  expect(shownLines).toMatch(/animation: weelpWanderersLineDraw 700ms var\(--weelp-ease-out\) both;\s*animation-delay: 160ms;/s);
  expect(shownButton).toMatch(/animation: weelpWanderersButtonReveal 700ms var\(--weelp-ease-out\) both;\s*animation-delay: 260ms;/s);
});

test('removes Curate choreography for reduced-motion users', () => {
  const reducedMotionStart = css.indexOf('@media (prefers-reduced-motion: reduce)');
  const reducedMotionBlock = css.slice(reducedMotionStart, css.indexOf('\n  }', reducedMotionStart) + 4);
  const selectors = [
    `${inward}[data-reveal] [data-wanderers-top]`,
    `${inward}[data-reveal] [data-wanderers-pattern='left']`,
    `${inward}[data-reveal] [data-wanderers-pattern='right']`,
    `${inward}[data-reveal] [data-wanderers-line]`,
    `${inward}[data-reveal] [data-wanderers-button]`,
  ];
  const listStart = reducedMotionBlock.indexOf(selectors[0]);
  const listEnd = reducedMotionBlock.indexOf('{', listStart);
  const resetRule = reducedMotionBlock.slice(listStart, reducedMotionBlock.indexOf('}', listEnd) + 1);

  expect(listStart).toBeGreaterThanOrEqual(0);
  selectors.forEach((selector) => expect(resetRule).toContain(selector));
  expect(resetRule).toMatch(/opacity: 1;\s*transform: none;\s*animation: none;\s*animation-delay: 0ms;\s*will-change: auto;/s);
});
