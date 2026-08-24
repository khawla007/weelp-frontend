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

const root = "[data-ai-travel-buddy-entrance='guided-split']";
const role = (name, state = '') => `${root}${state ? `[data-reveal='${state}']` : '[data-reveal]'} [data-ai-travel-buddy-role='${name}']`;

test('defines the variable-driven AI Travel Buddy reveal keyframe', () => {
  expect(extractRule('@keyframes weelpAiTravelBuddyReveal')).toMatch(
    /from\s*{\s*opacity: 0;\s*transform: translate3d\(var\(--weelp-ai-x, 0\), var\(--weelp-ai-y, 0\), 0\) scale\(var\(--weelp-ai-scale, 1\)\);\s*}\s*to\s*{\s*opacity: 1;\s*transform: translate3d\(0, 0, 0\) scale\(1\);/s,
  );
});

test('keeps the root neutral and assigns state-independent mobile transform variables', () => {
  expect(extractRule(`${root}[data-reveal='pending']`)).toMatch(/opacity: 1;\s*transform: none;\s*animation: none;/s);
  expect(extractRule(`${root}[data-reveal='shown']`)).toMatch(/opacity: 1;\s*transform: none;\s*animation: none;/s);

  const roles = extractRule(`${root}[data-reveal] [data-ai-travel-buddy-role]`);
  expect(roles).toMatch(/--weelp-ai-x: 0;\s*--weelp-ai-y: 16px;\s*--weelp-ai-scale: 1;/s);
  expect(extractRule(role('heading'))).toMatch(/--weelp-ai-y: 24px;/);
  expect(extractRule(role('personalised'))).toMatch(/--weelp-ai-scale: 0\.985;/);

  const pendingRoles = extractRule(`${root}[data-reveal='pending'] [data-ai-travel-buddy-role]`);
  expect(pendingRoles).toMatch(/opacity: 0;\s*transform: translate3d\(var\(--weelp-ai-x, 0\), var\(--weelp-ai-y, 0\), 0\) scale\(var\(--weelp-ai-scale, 1\)\);\s*will-change: transform, opacity;/s);
});

test('uses the approved heading and four-card timing sequence', () => {
  expect(extractRule(role('heading', 'shown'))).toMatch(/animation: weelpAiTravelBuddyReveal 700ms var\(--weelp-ease-out\) both;\s*animation-delay: 0ms;/s);
  expect(extractRule(role('chat', 'shown'))).toMatch(/animation: weelpAiTravelBuddyReveal 850ms var\(--weelp-ease-out\) both;\s*animation-delay: 100ms;/s);
  expect(extractRule(role('map', 'shown'))).toMatch(/animation: weelpAiTravelBuddyReveal 850ms var\(--weelp-ease-out\) both;\s*animation-delay: 200ms;/s);
  expect(extractRule(role('savings', 'shown'))).toMatch(/animation: weelpAiTravelBuddyReveal 850ms var\(--weelp-ease-out\) both;\s*animation-delay: 300ms;/s);
  expect(extractRule(role('personalised', 'shown'))).toMatch(/animation: weelpAiTravelBuddyReveal 850ms var\(--weelp-ease-out\) both;\s*animation-delay: 400ms;/s);
});

test('switches only the desktop chat, map, and savings cards to horizontal motion', () => {
  const desktopStart = css.indexOf('@media (min-width: 1024px)', css.indexOf('@keyframes weelpAiTravelBuddyReveal'));
  const reducedMotionStart = css.indexOf('@media (prefers-reduced-motion: reduce)', desktopStart);
  const desktopBlock = css.slice(desktopStart, reducedMotionStart);

  expect(desktopStart).toBeGreaterThanOrEqual(0);
  expect(desktopBlock).toMatch(new RegExp(`${role('chat').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*{[^}]*--weelp-ai-x: -32px;[^}]*--weelp-ai-y: 0;`, 's'));
  ['map', 'savings'].forEach((name) => {
    expect(desktopBlock).toMatch(new RegExp(`${role(name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*{[^}]*--weelp-ai-x: 32px;[^}]*--weelp-ai-y: 0;`, 's'));
  });
  expect(desktopBlock).not.toContain(role('personalised'));
});

test('removes the full choreography for reduced-motion users', () => {
  const reducedMotion = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));
  const roles = ['heading', 'chat', 'map', 'savings', 'personalised'];

  roles.forEach((name) => expect(reducedMotion).toContain(role(name)));
  expect(reducedMotion).toMatch(/opacity: 1;\s*transform: none;\s*animation: none;\s*animation-delay: 0ms;\s*will-change: auto;/s);
});
