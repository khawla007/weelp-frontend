import fs from 'node:fs';
import path from 'node:path';

const stylesheet = fs.readFileSync(path.join(process.cwd(), 'src/app/components/Pages/FRONT_END/About/AboutPage.module.css'), 'utf8');

const declarationsFor = (selector) => {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = stylesheet.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`));

  if (!match) throw new Error(`Missing CSS rule for ${selector}`);

  return match[1].replace(/\s+/g, ' ').trim();
};

const paddingBlockValuesFor = (selector) => {
  const rules = stylesheet.matchAll(/([^{}]+)\{([^{}]*)\}/g);

  return [...rules].flatMap(([, selectors, declarations]) => {
    const includesSelector = selectors
      .split(',')
      .map((item) => item.trim())
      .includes(selector);
    if (!includesSelector) return [];

    const paddingBlock = declarations.match(/padding-block:\s*([^;]+);/);
    return paddingBlock ? [paddingBlock[1].trim()] : [];
  });
};

const normalizedCss = (value) => value.replace(/\s+/g, ' ').trim();

const blocksIn = (source) => {
  const blocks = [];
  let blockStart = 0;
  let bodyStart = 0;
  let depth = 0;

  for (let index = 0; index < source.length; index += 1) {
    if (source[index] === '{') {
      if (depth === 0) bodyStart = index + 1;
      depth += 1;
    } else if (source[index] === '}') {
      depth -= 1;
      if (depth === 0) {
        blocks.push({
          prelude: normalizedCss(source.slice(blockStart, bodyStart - 1)),
          body: source.slice(bodyStart, index),
        });
        blockStart = index + 1;
      }
    }
  }

  return blocks;
};

const bodyFor = (source, prelude) => {
  const block = blocksIn(source).find((candidate) => candidate.prelude === prelude);

  if (!block) throw new Error(`Missing CSS block for ${prelude}`);

  return block.body;
};

const declarationsForSelectors = (source, selectors) => {
  const expectedPrelude = selectors.join(', ');

  return normalizedCss(bodyFor(source, expectedPrelude));
};

const keyframesFor = (name) => {
  return normalizedCss(bodyFor(stylesheet, `@keyframes ${name}`));
};

describe('About page Home spacing', () => {
  test('uses the Home page mobile, tablet, and desktop spacing for sections two and three', () => {
    const storySection = declarationsFor('.storySection');
    const masonrySection = declarationsFor('.masonrySection');
    const masonryInner = declarationsFor('.masonryInner');

    expect(storySection).not.toMatch(/min-height:/);
    expect(masonrySection).not.toMatch(/min-height:/);
    expect(masonryInner).not.toMatch(/min-height:/);
    expect(paddingBlockValuesFor('.storySection')).toEqual(['6rem', '4rem', '2.5rem']);
    expect(paddingBlockValuesFor('.masonrySection')).toEqual(['6rem', '4rem', '2.5rem']);
  });

  test('keeps the offer contact row centered', () => {
    const masonryContact = declarationsFor('.masonryContact');

    expect(masonryContact).toContain('justify-content: center;');
    expect(masonryContact).toContain('margin-top: 3.75rem;');
    expect(masonryContact).not.toMatch(/border-top:/);
    expect(masonryContact).not.toMatch(/padding-top:/);
  });

  test('fits the Why Choose section below the desktop header and uses a theme-aware glass metric', () => {
    const whyGrid = declarationsFor('.whyGrid');
    const whyContent = declarationsFor('.whyContent');
    const whyMetric = declarationsFor('.whyMetric');

    expect(whyGrid).toContain('min-height: min(58.375rem, calc(100svh - 4.125rem));');
    expect(whyContent).toContain('padding: clamp(3rem, 7vh, 5.5rem) clamp(2.875rem, 5vw, 5.5rem);');
    expect(whyMetric).toContain('border: 3px solid hsl(var(--foreground) / 16%);');
    expect(whyMetric).toContain('border-radius: 1.5625rem;');
    expect(whyMetric).toContain('background: hsl(var(--background) / 88%);');
    expect(whyMetric).toContain('backdrop-filter: blur(0.625rem);');
  });

  test('tightens only the short-desktop Why Choose vertical padding', () => {
    expect(stylesheet).toMatch(/@media \(min-width: 1024px\) and \(max-height: 760px\)\s*\{\s*\.whyContent\s*\{\s*padding-block: 1.75rem;\s*\}\s*\}/);
  });

  test('uses the measured Team section rhythm inside its page container', () => {
    const teamSection = declarationsFor('.teamSection');
    const teamInner = declarationsFor('.teamInner');
    const teamHeader = declarationsFor('.teamHeader');
    const teamImage = declarationsFor('.teamImage');

    expect(teamSection).not.toMatch(/min-height:/);
    expect(teamSection).toContain('padding-block: 6rem;');
    expect(teamInner).toContain('display: flex;');
    expect(teamInner).toContain('flex-direction: column;');
    expect(teamHeader).toContain('margin-bottom: 3.875rem;');
    expect(teamImage).toContain('aspect-ratio: 1;');
    expect(teamImage).toContain('border-radius: 1rem;');
    expect(paddingBlockValuesFor('.teamSection')).toEqual(['6rem', '4rem', '2.5rem']);
  });

  test('fits Traveler Stories below the desktop header and keeps responsive section spacing', () => {
    const testimonialSection = declarationsFor('.testimonialSection');
    const testimonialInner = declarationsFor('.testimonialInner');
    const testimonialHeader = declarationsFor('.testimonialHeader');
    const testimonialSlide = declarationsFor('.testimonialSlide');

    expect(testimonialSection).not.toMatch(/min-height:/);
    expect(testimonialSection).toContain('padding-block: 6rem;');
    expect(testimonialInner).not.toMatch(/min-height:/);
    expect(testimonialHeader).not.toMatch(/min-height:/);
    expect(testimonialHeader).toContain('margin-bottom: 2rem;');
    expect(testimonialSlide).toContain('min-height: 26rem;');
    expect(paddingBlockValuesFor('.testimonialSection')).toEqual(['6rem', 'clamp(2rem, calc((100svh - 45rem) / 2), 6rem)', '1.5rem', '4rem', '2.5rem']);
  });

  test('rounds the outer testimonial card corners and compresses short desktops', () => {
    const testimonialImage = declarationsFor('.testimonialImage');
    const testimonialPanel = declarationsFor('.testimonialPanel');

    expect(testimonialImage).toContain('border-radius: 1rem 0 0 1rem;');
    expect(testimonialPanel).toContain('border-radius: 0 1rem 1rem 0;');
    expect(stylesheet).toMatch(
      /@media \(min-width: 1024px\) and \(max-height: 900px\)\s*\{\s*\.testimonialSection\s*\{\s*padding-block: clamp\(2rem, calc\(\(100svh - 45rem\) \/ 2\), 6rem\);\s*\}\s*\}/,
    );
    expect(stylesheet).toMatch(
      /@media \(min-width: 1024px\) and \(max-height: 780px\)[\s\S]*?\.testimonialSection\s*\{\s*padding-block: 1\.5rem;\s*\}[\s\S]*?\.testimonialPanel\s*\{\s*padding: 2\.25rem;\s*\}/,
    );
    expect(stylesheet).toMatch(
      /@media \(max-width: 1023px\)[\s\S]*?\.testimonialImage\s*\{[^}]*border-radius: 1rem 1rem 0 0;[^}]*\}[\s\S]*?\.testimonialPanel\s*\{\s*border-radius: 0 0 1rem 1rem;\s*\}/,
    );
  });

  test('uses a viewport-wide FAQ image band with canonical spacing below the FAQ card', () => {
    const faqHeadingRow = declarationsFor('.faqHeadingRow');
    const faqContentRow = declarationsFor('.faqContentRow');
    const faqContent = declarationsFor('.faqContent');
    const faqButton = declarationsFor('.faqButton');
    const faqIcon = declarationsFor('.faqIcon');
    const faqIconOpen = declarationsFor('.faqIconOpen');
    const faqButtonFocus = declarationsFor('.faqButton:focus-visible');

    expect(faqHeadingRow).toContain('min-height: 21.25rem;');
    expect(faqHeadingRow).toContain('padding: 6rem 0 2rem;');
    expect(faqContentRow).toContain('min-height: 21.3125rem;');
    expect(faqContentRow).toContain('display: flow-root;');
    expect(faqContentRow).toContain('padding-bottom: 6rem;');
    expect(stylesheet).toMatch(
      /\.faqImage\s*\{\s*position: absolute;\s*top: 0;\s*bottom: 0;\s*left: 50%;\s*z-index: 1;[^}]*width: calc\(100vw \+ 1rem\);[^}]*height: 100%;[^}]*transform: translateX\(-50%\);/,
    );
    expect(faqContent).toContain('width: 58.5%;');
    expect(faqContent).toContain('margin-top: -5rem;');
    expect(faqContent).toContain('min-height: 0;');
    expect(stylesheet).not.toMatch(/@media \(min-width: 1280px\)[\s\S]*?\.faqSection\s*\{[^}]*height:/);
    expect(faqButton).toContain('font-size: 1.1875rem;');
    expect(faqButton).toContain('border: 0;');
    expect(faqButton).toContain('border-bottom: 1px solid hsl(var(--border));');
    expect(faqButton).toContain('background: transparent;');
    expect(faqButton).toContain('cursor: pointer;');
    expect(stylesheet).toMatch(/\.faqButton:global\(\.weelp-plain-action\)\s*\{[^}]*border-bottom: 1px solid hsl\(var\(--border\)\) !important;/);
    expect(faqIcon).toContain('width: 1.875rem;');
    expect(faqIcon).toContain('height: 1.875rem;');
    expect(faqIconOpen).toContain('background: hsl(var(--weelp-sage-deep));');
    expect(faqButtonFocus).toContain('outline: 2px solid hsl(var(--weelp-sage-deep));');
    expect(stylesheet).toMatch(/@media \(max-width: 1279px\)[\s\S]*?\.faqHeadingRow\s*\{[^}]*padding: 4rem 0 1\.5rem;[^}]*\}[\s\S]*?\.faqContentRow\s*\{[^}]*padding: 0 0 4rem;[^}]*\}/);
    expect(stylesheet).toMatch(
      /@media \(max-width: 1279px\)[\s\S]*?\.faqImage\s*\{[^}]*position: relative;[^}]*top: auto;[^}]*bottom: auto;[^}]*left: 50%;[^}]*width: calc\(100vw \+ 1rem\);[^}]*height: auto;[^}]*margin-left: 0;[^}]*transform: translateX\(-50%\);/,
    );
    expect(stylesheet).toMatch(/@media \(max-width: 1279px\)[\s\S]*?\.faqImage\s*\{[^}]*border-radius: 0;[^}]*\}[\s\S]*?\.faqContent\s*\{[^}]*border-radius: 0 0 1\.5rem 1\.5rem;[^}]*\}/);
    expect(stylesheet).toMatch(/@media \(max-width: 767px\)[\s\S]*?\.faqHeadingRow\s*\{[^}]*padding: 2\.5rem 0 1rem;[^}]*\}[\s\S]*?\.faqContentRow\s*\{[^}]*padding: 0 0 2\.5rem;[^}]*\}/);
  });

  test('styles the FAQ road-and-car journey with responsive motion fallbacks', () => {
    const compactComposition = declarationsFor('.faqJourneyCompositionCompact');
    const runningAndPausedRoad = declarationsForSelectors(stylesheet, [".faqJourney[data-motion='running'] .faqJourneyRoadReveal", ".faqJourney[data-motion='paused'] .faqJourneyRoadReveal"]);
    const runningAndPausedCar = declarationsForSelectors(stylesheet, [".faqJourney[data-motion='running'] .faqJourneyCar", ".faqJourney[data-motion='paused'] .faqJourneyCar"]);
    const runningAndPausedPin = declarationsForSelectors(stylesheet, [".faqJourney[data-motion='running'] .faqJourneyPinPulse", ".faqJourney[data-motion='paused'] .faqJourneyPinPulse"]);
    const runningAndPausedCloud = declarationsForSelectors(stylesheet, [".faqJourney[data-motion='running'] .faqJourneyCloud", ".faqJourney[data-motion='paused'] .faqJourneyCloud"]);
    const pausedMotion = declarationsForSelectors(stylesheet, [
      ".faqJourney[data-motion='paused'] .faqJourneyRoadReveal",
      ".faqJourney[data-motion='paused'] .faqJourneyCar",
      ".faqJourney[data-motion='paused'] .faqJourneyPinPulse",
      ".faqJourney[data-motion='paused'] .faqJourneyCloud",
    ]);
    const compactMedia = bodyFor(stylesheet, '@media (max-width: 1279px)');
    const reducedMotionMedia = bodyFor(stylesheet, '@media (prefers-reduced-motion: reduce)');

    expect(stylesheet).toMatch(/\.faqJourney\s*\{[^}]*overflow: hidden;[^}]*background: hsl\(var\(--weelp-sage-wash\)\);[^}]*\}/);
    expect(stylesheet).toMatch(/\.faqJourneySvg\s*\{[^}]*position: absolute;[^}]*inset: 0;[^}]*width: 100%;[^}]*height: 100%;[^}]*\}/);
    expect(stylesheet).toMatch(/\.faqJourneyRoadEdge\s*\{[^}]*stroke-width: 18;[^}]*\}/);
    expect(stylesheet).toMatch(/\.faqJourneyRoadSurface\s*\{[^}]*stroke-width: 12;[^}]*\}/);
    expect(stylesheet).toMatch(/\.faqJourneyRoadDivider\s*\{[^}]*stroke: var\(--weelp-home-accent\);[^}]*stroke-dasharray: 0\.025 0\.02;[^}]*\}/);
    expect(stylesheet).toMatch(/\.faqJourneyRoadReveal\s*\{[^}]*stroke-dasharray: 1;[^}]*stroke-dashoffset: 0;[^}]*\}/);
    expect(stylesheet).toMatch(/\.faqJourneyCar\s*\{[^}]*offset-path: var\(--faq-journey-car-path\);[^}]*offset-distance: 100%;[^}]*opacity: 1;[^}]*\}/);
    expect(compactComposition).toContain('display: none;');
    expect(stylesheet).toMatch(/@keyframes faqJourneyRoadBuild\s*\{[\s\S]*?stroke-dashoffset: 1;[\s\S]*?stroke-dashoffset: 0;[\s\S]*?\}/);
    expect(keyframesFor('faqJourneyCarDrive')).toBe(
      '0% { offset-distance: 0%; opacity: 0; } 3% { opacity: 1; } 56%, 76% { offset-distance: 100%; opacity: 1; } 80% { offset-distance: 100%; opacity: 0; } 80.01%, 100% { offset-distance: 0%; opacity: 0; }',
    );
    expect(keyframesFor('faqJourneyPinPulse')).toBe('0%, 56% { transform: scale(1); } 63% { transform: scale(1.14); } 70%, 100% { transform: scale(1); }');
    expect(runningAndPausedRoad).toBe('animation: faqJourneyRoadBuild 4s var(--weelp-ease-out) both;');
    expect(runningAndPausedCar).toBe('animation: faqJourneyCarDrive 10s 4s ease-in-out infinite both;');
    expect(runningAndPausedPin).toBe('animation: faqJourneyPinPulse 10s 4s ease-in-out infinite;');
    expect(runningAndPausedCloud).toBe('animation: faqJourneyCloud 28s ease-in-out infinite alternate;');
    expect(stylesheet).toMatch(/@keyframes faqJourneyCloud\s*\{[\s\S]*?transform: translateX\(-2%\);[\s\S]*?transform: translateX\(8%\);[\s\S]*?\}/);
    expect(pausedMotion).toBe('animation-play-state: paused;');
    expect(declarationsForSelectors(compactMedia, ['.faqJourneyCompositionDesktop'])).toBe('display: none;');
    expect(declarationsForSelectors(compactMedia, ['.faqJourneyCompositionCompact'])).toBe('display: block;');
    expect(
      declarationsForSelectors(reducedMotionMedia, [
        '.faqJourney[data-motion] .faqJourneyRoadReveal',
        '.faqJourney[data-motion] .faqJourneyCar',
        '.faqJourney[data-motion] .faqJourneyPinPulse',
        '.faqJourney[data-motion] .faqJourneyCloud',
      ]),
    ).toBe('animation: none;');
    expect(declarationsForSelectors(reducedMotionMedia, ['.faqJourney[data-motion] .faqJourneyRoadReveal'])).toBe('stroke-dashoffset: 0;');
    expect(declarationsForSelectors(reducedMotionMedia, ['.faqJourney[data-motion] .faqJourneyCar'])).toBe('offset-distance: 100%; opacity: 1;');
    expect(declarationsForSelectors(reducedMotionMedia, ['.faqJourney[data-motion] .faqJourneyPinPulse', '.faqJourney[data-motion] .faqJourneyCloud'])).toBe('transform: none;');
  });
});
