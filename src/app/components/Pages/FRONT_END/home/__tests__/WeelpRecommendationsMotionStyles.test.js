import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');
const root = "[data-recommendations-section-entrance='rule-led-cascade']";

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const extractRuleFrom = (source, selector) => {
  const match = source.match(new RegExp(`${escapeRegExp(selector)}\\s*\\{([^}]*)\\}`, 's'));
  expect(match).not.toBeNull();
  return match[1];
};
const extractRule = (selector) => extractRuleFrom(css, selector);

const extractBalancedBlock = (source, prelude) => {
  const start = source.indexOf(prelude);
  expect(start).toBeGreaterThanOrEqual(0);
  const openingBrace = source.indexOf('{', start + prelude.length);
  expect(openingBrace).toBeGreaterThan(start);

  let depth = 0;
  for (let index = openingBrace; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') depth -= 1;
    if (depth === 0) return source.slice(openingBrace + 1, index);
  }

  throw new Error(`Unclosed CSS block: ${prelude}`);
};

const expectStaticMotion = (rule) => {
  expect(rule).toMatch(/opacity:\s*1;/);
  expect(rule).toMatch(/transform:\s*none;/);
  expect(rule).toMatch(/animation:\s*none;/);
  expect(rule).toMatch(/animation-delay:\s*0ms;/);
  expect(rule).toMatch(/will-change:\s*auto;/);
};

test('defines a divider-only horizontal rule reveal', () => {
  const keyframes = css.match(/@keyframes weelpRecommendationsRuleReveal\s*{\s*from\s*{([^}]*)}\s*to\s*{([^}]*)}\s*}/s);

  expect(keyframes).not.toBeNull();
  expect(keyframes[1]).toMatch(/transform:\s*scaleX\(0\);/);
  expect(keyframes[2]).toMatch(/transform:\s*scaleX\(1\);/);
  expect(keyframes[0]).not.toMatch(/opacity|translate|width|filter|blur/);
});

test('coordinates the pending and shown recommendation cascade', () => {
  const neutralRoot = extractRule(`${root}[data-reveal='pending'],\n  ${root}[data-reveal='shown']`);
  expect(neutralRoot).toMatch(/opacity:\s*1;/);
  expect(neutralRoot).toMatch(/transform:\s*none;/);
  expect(neutralRoot).toMatch(/animation:\s*none;/);

  expect(extractRule(`${root}[data-reveal] [data-recommendations-heading]`)).toMatch(/--weelp-reveal-y:\s*18px;/);
  expect(extractRule(`${root}[data-reveal] [data-recommendations-link]`)).toMatch(/--weelp-reveal-y:\s*12px;/);
  expect(extractRule(`${root}[data-reveal] [data-recommendations-rule]`)).toMatch(/transform-origin:\s*left center;/);

  const pendingHeading = extractRule(`${root}[data-reveal='pending'] [data-recommendations-heading]`);
  expect(pendingHeading).toMatch(/opacity:\s*0;/);
  expect(pendingHeading).toMatch(/transform:\s*translate3d\(0, var\(--weelp-reveal-y, 18px\), 0\);/);
  expect(pendingHeading).toMatch(/will-change:\s*transform, opacity;/);

  const pendingRule = extractRule(`${root}[data-reveal='pending'] [data-recommendations-rule]`);
  expect(pendingRule).toMatch(/transform:\s*scaleX\(0\);/);
  expect(pendingRule).toMatch(/will-change:\s*transform;/);

  const pendingLink = extractRule(`${root}[data-reveal='pending'] [data-recommendations-link]`);
  expect(pendingLink).toMatch(/opacity:\s*0;/);
  expect(pendingLink).toMatch(/transform:\s*translate3d\(0, var\(--weelp-reveal-y, 12px\), 0\);/);
  expect(pendingLink).toMatch(/will-change:\s*transform, opacity;/);

  const shownHeading = extractRule(`${root}[data-reveal='shown'] [data-recommendations-heading]`);
  expect(shownHeading).toMatch(/animation:\s*weelpRevealUp 650ms var\(--weelp-ease-out\) both;/);
  expect(shownHeading).toMatch(/animation-delay:\s*0ms;/);

  const shownRule = extractRule(`${root}[data-reveal='shown'] [data-recommendations-rule]`);
  expect(shownRule).toMatch(/animation:\s*weelpRecommendationsRuleReveal 700ms var\(--weelp-ease-out\) both;/);
  expect(shownRule).toMatch(/animation-delay:\s*100ms;/);

  const shownLink = extractRule(`${root}[data-reveal='shown'] [data-recommendations-link]`);
  expect(shownLink).toMatch(/animation:\s*weelpRevealUp 700ms var\(--weelp-ease-out\) both;/);
  expect(shownLink).toMatch(/animation-delay:\s*calc\(180ms \+ var\(--weelp-recommendations-index, 0\) \* 60ms\);/);
});

test('fully resets recommendation motion for bypassed and reduced-motion states', () => {
  const bypass = extractRule(
    `${root}[data-reveal-motion='bypassed'] [data-recommendations-heading],\n  ${root}[data-reveal-motion='bypassed'] [data-recommendations-rule],\n  ${root}[data-reveal-motion='bypassed'] [data-recommendations-link]`,
  );
  expectStaticMotion(bypass);

  const reducedMotion = extractBalancedBlock(css, '@media (prefers-reduced-motion: reduce)');
  const reduced = extractRuleFrom(
    reducedMotion,
    `${root}[data-reveal] [data-recommendations-heading],\n    ${root}[data-reveal] [data-recommendations-rule],\n    ${root}[data-reveal] [data-recommendations-link]`,
  );
  expectStaticMotion(reduced);
});

test('avoids clipping, filters, width animation, and content scaling', () => {
  const ruleKeyframe = extractBalancedBlock(css, '@keyframes weelpRecommendationsRuleReveal');
  const scopedBodies = [...css.matchAll(new RegExp(`${escapeRegExp(root)}[^{}]*\\{([^{}]*)\\}`, 'gs'))].map((match) => match[1]);
  const contentBodies = [...css.matchAll(new RegExp(`${escapeRegExp(root)}[^{}]*(?:heading|link)[^{}]*\\{([^{}]*)\\}`, 'gs'))].map((match) => match[1]);

  expect(scopedBodies.length).toBeGreaterThan(0);
  expect([ruleKeyframe, ...scopedBodies].join('\n')).not.toMatch(/blur\(|\bfilter\s*:|\boverflow(?:-[xy])?\s*:|\bwidth\s*:/);
  expect(contentBodies.join('\n')).not.toMatch(/scale(?:X|Y)?\(/);
});
