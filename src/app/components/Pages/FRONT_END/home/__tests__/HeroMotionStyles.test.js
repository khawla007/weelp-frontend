import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import postcss from 'postcss';

const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');
const root = postcss.parse(css);

const declarations = (selector, container = root) => {
  const values = {};

  container.walkRules((rule) => {
    if (container === root && rule.parent?.type === 'atrule' && rule.parent.name === 'media') return;
    if (!rule.selectors?.includes(selector)) return;

    rule.walkDecls((declaration) => {
      values[declaration.prop] = declaration.value;
    });
  });

  return values;
};

const keyframeDeclarations = (keyframes, selector) => {
  const rule = keyframes.nodes?.find((node) => node.type === 'rule' && node.selectors?.includes(selector));
  const values = {};

  rule?.nodes?.forEach((node) => {
    if (node.type === 'decl') values[node.prop] = node.value;
  });

  return values;
};

describe('homepage hero motion styles', () => {
  it('reveals the hero headline character by character without clipping italic glyphs', () => {
    let revealKeyframes;
    root.walkAtRules('keyframes', (atRule) => {
      if (atRule.params === 'weelpHomeHeroBlurReveal') revealKeyframes = atRule;
    });

    expect(revealKeyframes).toBeDefined();
    expect(keyframeDeclarations(revealKeyframes, 'from')).toEqual({
      opacity: '0',
      filter: 'blur(10px)',
    });
    expect(keyframeDeclarations(revealKeyframes, 'to')).toEqual({
      opacity: '1',
      filter: 'blur(0)',
    });
    expect(declarations('.weelp-home-hero-blur-character')).toMatchObject({
      display: 'inline-block',
      opacity: '0',
      filter: 'blur(10px)',
    });
    expect(declarations("[data-home-hero-motion='ready'] .weelp-home-hero-blur-character")).toMatchObject({
      animation: 'weelpHomeHeroBlurReveal 1000ms cubic-bezier(0.33, 1, 0.68, 1) both',
      'animation-delay': 'calc(var(--weelp-hero-character-index, 0) * 70ms)',
    });
    expect(declarations("[data-home-hero-motion='pending'] .weelp-home-hero-blur-character")).toMatchObject({
      animation: 'weelpHomeHeroMotionFallback 0ms linear 5000ms both',
    });
    expect(declarations("[data-home-hero-motion='pending'] .weelp-hero-ui-rise")).toMatchObject({
      visibility: 'hidden',
      'pointer-events': 'none',
      animation: 'weelpHomeHeroMotionFallback 0ms linear 5000ms both',
    });
    expect(declarations("[data-home-hero-motion='fallback'] .weelp-hero-ui-rise")).toMatchObject({
      visibility: 'visible',
      'pointer-events': 'auto',
      opacity: '1',
      transform: 'none',
      animation: 'none',
    });
    expect(declarations('.weelp-home-hero-blur-visual')).toMatchObject({
      display: 'block',
      'padding-bottom': '0.08em',
      'vertical-align': 'top',
    });
  });

  it('crossfades opposing home search CTA gradients and gently rotates only its icon', () => {
    const guard = ".weelp-home-search-cta:not(:disabled):not([aria-busy='true'])";

    expect(declarations('.weelp-home-search-cta::before')).toMatchObject({
      opacity: '1',
      background: 'linear-gradient(90deg, hsl(var(--weelp-sage-deep)) 0%, hsl(var(--weelp-sage-hover)) 100%)',
    });
    expect(declarations('.weelp-home-search-cta::after')).toMatchObject({
      opacity: '0',
      background: 'linear-gradient(-90deg, hsl(var(--weelp-sage-deep)) 0%, hsl(var(--weelp-sage-hover)) 100%)',
      transition: 'opacity 300ms ease',
    });
    expect(declarations(`${guard}:hover::after`)).toMatchObject({ opacity: '1' });
    expect(declarations(`${guard}:focus-visible::after`)).toEqual({ opacity: '1' });
    expect(declarations('.dark .weelp-home-search-cta::before')).toEqual({
      background: 'linear-gradient(90deg, var(--weelp-home-page) 0%, var(--weelp-home-surface) 100%)',
    });
    expect(declarations('.dark .weelp-home-search-cta::after')).toEqual({
      background: 'linear-gradient(-90deg, var(--weelp-home-page) 0%, var(--weelp-home-surface) 100%)',
    });
    expect(declarations(`.dark ${guard}:hover`)).toEqual({ opacity: '1' });
    expect(declarations('.weelp-home-search-cta__icon')).toMatchObject({ transition: 'transform 300ms ease' });
    expect(declarations(`${guard}:hover .weelp-home-search-cta__icon`)).toMatchObject({ transform: 'rotate(-12deg)' });
    expect(declarations(`${guard}:focus-visible .weelp-home-search-cta__icon`)).toMatchObject({ transform: 'rotate(-12deg)' });
  });

  it('removes homepage character and CTA motion when reduced motion is requested', () => {
    let reducedMotion;
    root.walkAtRules('media', (atRule) => {
      if (!reducedMotion && atRule.params === '(prefers-reduced-motion: reduce)') reducedMotion = atRule;
    });

    expect(reducedMotion).toBeDefined();
    expect(declarations('.weelp-home-hero-blur-character', reducedMotion)).toMatchObject({
      opacity: '1',
      filter: 'none',
      transform: 'none',
      animation: 'none',
    });
    expect(declarations('[data-home-hero-motion] .weelp-home-hero-blur-character', reducedMotion)).toMatchObject({
      opacity: '1',
      filter: 'none',
      animation: 'none',
    });
    expect(declarations('[data-home-hero-motion] .weelp-hero-ui-rise', reducedMotion)).toMatchObject({
      visibility: 'visible',
      'pointer-events': 'auto',
      opacity: '1',
      animation: 'none',
    });
    expect(declarations('.weelp-home-search-cta::after', reducedMotion)).toMatchObject({ transition: 'none' });
    expect(declarations('.weelp-home-search-cta__icon', reducedMotion)).toMatchObject({ transition: 'none' });

    const guard = ".weelp-home-search-cta:not(:disabled):not([aria-busy='true'])";
    expect(declarations(`${guard}:hover .weelp-home-search-cta__icon`, reducedMotion)).toMatchObject({ transform: 'none' });
    expect(declarations(`${guard}:focus-visible .weelp-home-search-cta__icon`, reducedMotion)).toMatchObject({ transform: 'none' });
  });
});
