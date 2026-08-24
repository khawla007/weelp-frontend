import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');
const root = "[data-guide-section-entrance='editorial-right']";

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

test('defines a translation-only guide card reveal keyframe', () => {
  const keyframes = css.match(/@keyframes weelpGuideCardReveal\s*{\s*from\s*{([^}]*)}\s*to\s*{([^}]*)}\s*}/s);
  expect(keyframes).not.toBeNull();
  expect(keyframes[1]).toMatch(/opacity:\s*0;/);
  expect(keyframes[1]).toMatch(/transform:\s*translate3d\(var\(--weelp-guide-x, 0\), var\(--weelp-guide-y, 0\), 0\);/);
  expect(keyframes[2]).toMatch(/opacity:\s*1;/);
  expect(keyframes[2]).toMatch(/transform:\s*translate3d\(0, 0, 0\);/);
  expect(keyframes[0]).not.toContain('scale(');
});

test('keeps guide variables state-independent and assigns pending and shown motion', () => {
  const neutralRoot = extractRule(`${root}[data-reveal='pending'],\n  ${root}[data-reveal='shown']`);
  expect(neutralRoot).toMatch(/opacity:\s*1;/);
  expect(neutralRoot).toMatch(/transform:\s*none;/);
  expect(neutralRoot).toMatch(/animation:\s*none;/);

  expect(extractRule(`${root}[data-reveal] [data-guide-section-header]`)).toMatch(/--weelp-reveal-y:\s*24px;/);
  const slideVariables = extractRule(`${root}[data-reveal] .swiper-slide`);
  expect(slideVariables).toMatch(/--weelp-guide-x:\s*0;/);
  expect(slideVariables).toMatch(/--weelp-guide-y:\s*16px;/);

  const pendingHeader = extractRule(`${root}[data-reveal='pending'] [data-guide-section-header]`);
  expect(pendingHeader).toMatch(/opacity:\s*0;/);
  expect(pendingHeader).toMatch(/transform:\s*translate3d\(0, var\(--weelp-reveal-y, 24px\), 0\);/);
  expect(pendingHeader).toMatch(/will-change:\s*transform, opacity;/);

  const pendingSlides = extractRule(`${root}[data-reveal='pending'] .swiper-slide`);
  expect(pendingSlides).toMatch(/opacity:\s*0;/);
  expect(pendingSlides).toMatch(/transform:\s*translate3d\(var\(--weelp-guide-x, 0\), var\(--weelp-guide-y, 0\), 0\);/);
  expect(pendingSlides).toMatch(/will-change:\s*transform, opacity;/);

  const shownHeader = extractRule(`${root}[data-reveal='shown'] [data-guide-section-header]`);
  expect(shownHeader).toMatch(/animation:\s*weelpRevealUp 700ms var\(--weelp-ease-out\) both;/);
  expect(shownHeader).toMatch(/animation-delay:\s*0ms;/);

  const shownSlides = extractRule(`${root}[data-reveal='shown'] .swiper-slide`);
  expect(shownSlides).toMatch(/animation:\s*weelpGuideCardReveal 850ms var\(--weelp-ease-out\) both;/);
  expect(shownSlides).toMatch(/animation-delay:\s*calc\(var\(--weelp-carousel-reveal-index, 0\) \* 110ms\);/);
});

test('switches guide cards to horizontal travel on desktop', () => {
  const desktop = css.match(/@media\s*\(min-width:\s*1024px\)\s*{([\s\S]*?)\n  }/);
  expect(desktop).not.toBeNull();
  const slideRule = desktop[1].match(new RegExp(`${escapeRegExp(`${root}[data-reveal] .swiper-slide`)}\\s*\\{([^}]*)\\}`, 's'));
  expect(slideRule).not.toBeNull();
  expect(slideRule[1]).toMatch(/--weelp-guide-x:\s*28px;/);
  expect(slideRule[1]).toMatch(/--weelp-guide-y:\s*0;/);
});

test('fully resets guide motion for reduced motion and bypassed reveal support', () => {
  const resetProperties = (rule) => {
    expect(rule).toMatch(/opacity:\s*1;/);
    expect(rule).toMatch(/transform:\s*none;/);
    expect(rule).toMatch(/animation:\s*none;/);
    expect(rule).toMatch(/animation-delay:\s*0ms;/);
    expect(rule).toMatch(/will-change:\s*auto;/);
  };

  const bypass = extractRule(`${root}[data-reveal-motion='bypassed'] [data-guide-section-header],\n  ${root}[data-reveal-motion='bypassed'] .swiper-slide`);
  resetProperties(bypass);

  const reducedMotion = extractBalancedBlock(css, '@media (prefers-reduced-motion: reduce)');
  const reset = extractRuleFrom(reducedMotion, `${root}[data-reveal] [data-guide-section-header],\n    ${root}[data-reveal] .swiper-slide`);
  resetProperties(reset);
});

test('editorial guide styles avoid scaling, blur, filters, and overflow clipping', () => {
  const guideKeyframe = extractBalancedBlock(css, '@keyframes weelpGuideCardReveal');
  const editorialRuleBodies = [...css.matchAll(new RegExp(`${escapeRegExp(root)}[^{}]*\\{([^{}]*)\\}`, 'gs'))].map((match) => match[1]);
  expect(editorialRuleBodies.length).toBeGreaterThan(0);

  const completeEditorialMotion = [guideKeyframe, ...editorialRuleBodies].join('\n');
  expect(completeEditorialMotion).not.toMatch(/scale\(|blur\(|\bfilter\s*:|\boverflow(?:-[xy])?\s*:/);
});
