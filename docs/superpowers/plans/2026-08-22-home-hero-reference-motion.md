# Home Hero Reference Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Match SteelNova's character-blur hero entrance and primary-button hover feel on Weelp's homepage without changing layout, content, colors, or search behavior.

**Architecture:** Keep the homepage hero server-rendered and drive all entrance motion from CSS at first paint. Add deterministic, accessible character spans inside the two existing headline lines, scope the hover markup to the home search variant, and extend the existing motion utilities and reduced-motion reset without adding a dependency.

**Tech Stack:** Next.js 16 App Router, React 19, JavaScript/JSX, Tailwind CSS, plain CSS keyframes, Jest, React Testing Library, PostCSS.

---

## File map

- Modify `src/app/components/Pages/FRONT_END/home/HeroSection.jsx`: render accessible character-level headline hooks and set the approved entrance delays while preserving every layout class.
- Modify `src/app/components/Pages/FRONT_END/home/__tests__/HeroSection.test.jsx`: lock the accessible text, deterministic character indices, and unchanged hero hierarchy.
- Modify `src/app/components/Pages/FRONT_END/shared/ActivityItinerarySearch.jsx`: add home-only CTA hooks and inner icon/text spans; leave compact, results, and modal variants unchanged.
- Modify `src/app/components/Pages/FRONT_END/shared/__tests__/ActivityItinerarySearch.test.jsx`: prove the hover hook is limited to the home variant and preserves the visible label.
- Create `src/app/components/Pages/FRONT_END/home/__tests__/HeroMotionStyles.test.js`: parse `globals.css` and lock the character animation, scoped hover/focus behavior, and reduced-motion contract.
- Modify `src/app/globals.css`: add the at-paint blur keyframe and home CTA overlay/icon rules beside the existing hero utilities.

## Required execution workflow

Before implementation, invoke `test-driven-development`, `next-best-practices`, `vercel-react-best-practices`, and `vercel-composition-patterns`. Execute with `executing-plans` or `subagent-driven-development`. After each production-code change, invoke `error-handling-patterns`, run the relevant focused test, then run type-check and lint before moving on. At completion, run the required code-review and simplification gates before the final verification and commit.

### Task 0: Visible-browser preflight

**Files:** None.

- [ ] **Step 1: Open localhost in a named visible headed browser before UI work**

```bash
agent-browser --session weelp-visible --headed --args "--no-sandbox" open http://localhost:3000
```

Expected: a browser window visible to the user opens the local Weelp homepage. Keep this named session open for every later smoke check; do not substitute a hidden session or production URL.

### Task 1: Character-level headline markup

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/home/__tests__/HeroSection.test.jsx`
- Modify: `src/app/components/Pages/FRONT_END/home/HeroSection.jsx`

- [ ] **Step 1: Write the failing character-markup tests**

In the existing `keeps the hero badge and escape accent...` test, obtain the new screen-reader text node and its styled parent instead of direct visual text that will be split into characters:

```jsx
const { getByText } = render(<HeroSection />);
const badge = getByText('Plan calmer escapes');
const escapeAccent = getByText('escape', { selector: '.sr-only' }).parentElement;
```

Keep its existing color-class assertions. Then append these tests inside the existing `describe('HeroSection', ...)` block:

```jsx
it('keeps readable hero text while rendering decorative character hooks', () => {
  const { container, getByRole, getByText } = render(<HeroSection />);

  expect(getByRole('heading', { name: 'Find your next' })).toBeInTheDocument();
  expect(getByText('Find your next', { selector: '.sr-only' })).toBeInTheDocument();
  expect(getByText('escape', { selector: '.sr-only' })).toBeInTheDocument();
  expect(container.querySelectorAll('[data-home-hero-character]')).toHaveLength(18);
  expect(container.querySelectorAll('[data-home-hero-visual][aria-hidden="true"]')).toHaveLength(2);
});

it('continues the character stagger across the second hero line', () => {
  const { container } = render(<HeroSection />);
  const characters = Array.from(container.querySelectorAll('[data-home-hero-character]'));

  expect(characters[0]).toHaveTextContent('F');
  expect(characters[0]).toHaveStyle({ '--weelp-hero-character-index': '0' });
  expect(characters[11]).toHaveTextContent('t');
  expect(characters[11]).toHaveStyle({ '--weelp-hero-character-index': '11' });
  expect(characters[12]).toHaveTextContent('e');
  expect(characters[12]).toHaveStyle({ '--weelp-hero-character-index': '16' });
});

it('keeps the approved supporting-content delays and existing layout classes', () => {
  const { container, getByText, getByTestId } = render(<HeroSection />);

  expect(getByText('Plan calmer escapes')).toHaveStyle({ '--weelp-motion-delay': '80ms' });
  expect(getByText('Beach stays, marina views, and easy city plans in one place.')).toHaveStyle({ '--weelp-motion-delay': '560ms' });
  expect(getByTestId('home-discovery-search').closest('.weelp-hero-ui-rise')).toHaveStyle({ '--weelp-motion-delay': '700ms' });
  expect(container.querySelector('ul.weelp-hero-ui-rise')).toHaveStyle({ '--weelp-motion-delay': '840ms' });
  expect(container.querySelector('.container-page')).toHaveClass('pt-[135px]', 'sm:pt-[170px]', 'lg:pt-[214px]');
});
```

- [ ] **Step 2: Run the focused test and confirm the new assertions fail**

Run:

```bash
npx jest src/app/components/Pages/FRONT_END/home/__tests__/HeroSection.test.jsx --runInBand
```

Expected: FAIL because the current title uses `.weelp-rise-item`, has no character hooks, and still uses the 320/400/480 millisecond supporting delays.

- [ ] **Step 3: Add a deterministic server-rendered line helper**

Add this helper above `HeroSection` in `HeroSection.jsx`:

```jsx
const HeroBlurLine = ({ text, startIndex = 0, className = '' }) => {
  let characterIndex = startIndex;

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" data-home-hero-visual className="weelp-home-hero-blur-visual">
        {text.split(' ').map((word, wordIndex, words) => (
          <span key={`${word}-${wordIndex}`} className="weelp-home-hero-blur-word">
            {Array.from(word).map((character) => {
              const index = characterIndex;
              characterIndex += 1;

              return (
                <span key={`${character}-${index}`} data-home-hero-character className="weelp-home-hero-blur-character" style={{ '--weelp-hero-character-index': index }}>
                  {character}
                </span>
              );
            })}
            {wordIndex < words.length - 1 ? <span className="weelp-home-hero-blur-space"> </span> : null}
          </span>
        ))}
      </span>
    </span>
  );
};

const ESCAPE_CHARACTER_START_INDEX = 16;
```

Replace only the current masked text children, leaving the `h1` and second-line outer class names and inline font styles intact:

```jsx
<HeroBlurLine text="Find your next" className="block font-medium" />
```

and:

```jsx
<HeroBlurLine text="escape" startIndex={ESCAPE_CHARACTER_START_INDEX} className="block italic font-medium text-[var(--weelp-home-hero-accent)]" />
```

The named start index intentionally leaves four stagger beats (88 milliseconds) between the two lines. Move the Cormorant font-family declaration from the removed inner span to the unchanged second-line outer span so its typography stays identical. Do not add a client directive.

On the subtitle `<p>`, add `weelp-hero-ui-rise` to its existing class list. Keep the existing outer `<span className="weelp-rise-mask weelp-rise-mask--block">` so its block formatting and `0.08em` bottom padding remain unchanged, but remove the inner animated `.weelp-rise-item` span and place the same text directly inside the retained mask. Use this combined style object on the `<p>`:

```jsx
style={{ '--weelp-motion-delay': '560ms', '--weelp-hero-subtitle-shade': 'rgba(0, 0, 0, 0.35)' }}
```

Keep the subtitle's existing `--weelp-hero-subtitle-shade` declaration in the same style object. Set the existing search wrapper to `700ms` and the existing trust row to `840ms`. Keep the eyebrow at `80ms`.

- [ ] **Step 4: Run the focused test and confirm it passes**

Run:

```bash
npx jest src/app/components/Pages/FRONT_END/home/__tests__/HeroSection.test.jsx --runInBand
```

Expected: PASS, including all pre-existing spacing, overlay, theme-color, and subtitle-shade assertions.

- [ ] **Step 5: Run static checks for the JSX change**

Run:

```bash
npm run type-check
npm run lint
```

Expected: both exit 0 with no new warning. Review the helper through `error-handling-patterns`; it has no async or failure path and must remain a pure deterministic render helper.

- [ ] **Step 6: Run the required visible-browser smoke check**

```bash
agent-browser --session weelp-visible reload
```

Expected: the visible localhost hero retains its prior title size, line positions, subtitle spacing, search-panel position, and trust-row position. The new spans must not create a hydration warning or horizontal overflow. Leave the implementation uncommitted for the final review gate.

### Task 2: Home-only search CTA markup

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/shared/__tests__/ActivityItinerarySearch.test.jsx`
- Modify: `src/app/components/Pages/FRONT_END/shared/ActivityItinerarySearch.jsx`

- [ ] **Step 1: Write the failing scope test**

Append this test after `preserves the Home Search action spacing and radius`:

```jsx
it('scopes the reference hover hooks to the Home Search action', () => {
  const { unmount } = renderSearch(<HomeActivityItinerarySearch />);
  const homeButton = screen.getByRole('button', { name: /search trips/i });

  expect(homeButton).toHaveClass('weelp-home-search-cta');
  expect(homeButton).toHaveAttribute('aria-busy', 'false');
  expect(within(homeButton).getByText('Search escapes')).toHaveClass('weelp-home-search-cta__text');
  expect(homeButton.querySelector('.weelp-home-search-cta__icon')).toBeInTheDocument();

  unmount();
  renderSearch(<CompactActivityItinerarySearch />);

  const compactButton = screen.getByRole('button', { name: /search trips/i });
  expect(compactButton).not.toHaveClass('weelp-home-search-cta');
  expect(compactButton.querySelector('.weelp-home-search-cta__icon')).not.toBeInTheDocument();
});

it('marks a searching Home Search action busy for motion guards', () => {
  renderSearch(<HomeActivityItinerarySearch isSearching />);

  expect(screen.getByRole('button', { name: /search trips/i })).toHaveAttribute('aria-busy', 'true');
});
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run:

```bash
npx jest src/app/components/Pages/FRONT_END/shared/__tests__/ActivityItinerarySearch.test.jsx --runInBand
```

Expected: FAIL because the home button has no scoped class or stable inner spans.

- [ ] **Step 3: Add home-only CTA hooks without changing behavior**

In the non-modal submit button, add `aria-busy={isSearching}`. In the `isPill` class branch, add these classes while retaining all current size, border, background, color, shadow, hover, focus, dark-mode, and responsive utilities:

```text
weelp-home-search-cta relative isolate overflow-hidden
```

Replace the button children with this presentation branch:

```jsx
<button>
  {isPill ? (
    <>
      <span aria-hidden="true" className="weelp-home-search-cta__icon relative z-[1] inline-flex">
        <Search className="size-4" strokeWidth={2} />
      </span>
      <span className="weelp-home-search-cta__text relative z-[1]">Search escapes</span>
    </>
  ) : (
    <>
      <Search className="size-4" strokeWidth={2} />
      Search
    </>
  )}
</button>
```

Do not touch the modal submit button or any form-submit logic.

- [ ] **Step 4: Run the shared-search and hero tests**

Run:

```bash
npx jest src/app/components/Pages/FRONT_END/shared/__tests__/ActivityItinerarySearch.test.jsx src/app/components/Pages/FRONT_END/home/__tests__/HeroSection.test.jsx --runInBand
```

Expected: PASS. Existing tests must still prove compact/results labels, radii, dark classes, URL construction, and popovers are unchanged.

- [ ] **Step 5: Run static checks for the shared component change**

Run:

```bash
npm run type-check
npm run lint
```

Expected: both exit 0. Review through `error-handling-patterns`; the added markup must not alter submission or disabled-state propagation.

- [ ] **Step 6: Run the required visible-browser smoke check**

```bash
agent-browser --session weelp-visible reload
agent-browser --session weelp-visible snapshot -i
```

Expected: `Search escapes` remains the visible button label, the search action remains submit-capable, and compact/results/modal variants are unchanged. Leave the implementation uncommitted for the final review gate.

### Task 3: Character animation and button interaction CSS

**Files:**

- Create: `src/app/components/Pages/FRONT_END/home/__tests__/HeroMotionStyles.test.js`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Write the failing CSS contract test**

Create `HeroMotionStyles.test.js` with:

```js
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import postcss from 'postcss';

const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');
const root = postcss.parse(css);

const declarations = (selector, container = root) => {
  const values = {};
  container.walkRules((rule) => {
    if (container === root && rule.parent?.type === 'atrule' && rule.parent.name === 'media') return;
    if (!rule.selectors.includes(selector)) return;
    rule.walkDecls((declaration) => {
      values[declaration.prop] = declaration.value;
    });
  });
  return values;
};

describe('home hero reference motion styles', () => {
  it('reveals characters from blurred and offset to sharp', () => {
    expect(css).toContain('@keyframes weelpHomeHeroBlurReveal');
    expect(declarations('.weelp-home-hero-blur-character')).toMatchObject({
      display: 'inline-block',
      opacity: '0',
      filter: 'blur(10px)',
      transform: 'translate3d(0, 0.12em, 0)',
      'animation-delay': 'calc(160ms + var(--weelp-hero-character-index, 0) * 22ms)',
    });
    expect(declarations('.weelp-home-hero-blur-visual')).toMatchObject({
      display: 'block',
      'padding-bottom': '0.08em',
      'vertical-align': 'top',
    });
  });

  it('uses a 300ms home-only overlay and rotates only the home icon', () => {
    expect(declarations('.weelp-home-search-cta::before')).toMatchObject({
      opacity: '1',
      background: 'linear-gradient(90deg, hsl(var(--weelp-sage-deep)) 0%, hsl(var(--weelp-sage-hover)) 100%)',
    });
    expect(declarations('.weelp-home-search-cta::after')).toMatchObject({
      opacity: '0',
      background: 'linear-gradient(270deg, hsl(var(--weelp-sage-deep)) 0%, hsl(var(--weelp-sage-hover)) 100%)',
      transition: 'opacity 300ms linear',
    });
    expect(declarations(".weelp-home-search-cta:not(:disabled):not([aria-busy='true']):hover::after").opacity).toBe('1');
    expect(declarations(".weelp-home-search-cta:not(:disabled):not([aria-busy='true']):hover .weelp-home-search-cta__icon").transform).toBe('rotate(-45deg)');
    expect(declarations(".weelp-home-search-cta:not(:disabled):not([aria-busy='true']):focus-visible .weelp-home-search-cta__icon").transform).toBe('rotate(-45deg)');
  });

  it('removes character and CTA movement for reduced motion', () => {
    let reducedMotion;
    root.walkAtRules('media', (rule) => {
      if (!reducedMotion && rule.params === '(prefers-reduced-motion: reduce)') reducedMotion = rule;
    });
    expect(declarations('.weelp-home-hero-blur-character', reducedMotion)).toMatchObject({
      opacity: '1',
      filter: 'none',
      transform: 'none',
      animation: 'none',
    });
    expect(declarations('.weelp-home-search-cta::after', reducedMotion).transition).toBe('none');
    expect(declarations('.weelp-home-search-cta__icon', reducedMotion).transition).toBe('none');
    expect(declarations(".weelp-home-search-cta:not(:disabled):not([aria-busy='true']):hover .weelp-home-search-cta__icon", reducedMotion).transform).toBe('none');
    expect(declarations(".weelp-home-search-cta:not(:disabled):not([aria-busy='true']):focus-visible .weelp-home-search-cta__icon", reducedMotion).transform).toBe('none');
  });
});
```

- [ ] **Step 2: Run the CSS contract and confirm it fails**

Run:

```bash
npx jest src/app/components/Pages/FRONT_END/home/__tests__/HeroMotionStyles.test.js --runInBand
```

Expected: FAIL because the new keyframe and scoped CTA rules do not exist.

- [ ] **Step 3: Add the at-paint character animation**

In the existing `@layer utilities`, immediately after the current `.weelp-rise-item` rule, add:

```css
@keyframes weelpHomeHeroBlurReveal {
  from {
    opacity: 0;
    filter: blur(10px);
    transform: translate3d(0, 0.12em, 0);
  }

  to {
    opacity: 1;
    filter: blur(0);
    transform: translate3d(0, 0, 0);
  }
}

.weelp-home-hero-blur-word,
.weelp-home-hero-blur-character {
  display: inline-block;
}

.weelp-home-hero-blur-visual {
  display: block;
  overflow: visible;
  padding-bottom: 0.08em;
  vertical-align: top;
}

.weelp-home-hero-blur-space {
  white-space: pre;
}

.weelp-home-hero-blur-character {
  display: inline-block;
  opacity: 0;
  filter: blur(10px);
  transform: translate3d(0, 0.12em, 0);
  animation: weelpHomeHeroBlurReveal 720ms var(--weelp-ease-out) both;
  animation-delay: calc(160ms + var(--weelp-hero-character-index, 0) * 22ms);
  will-change: opacity, filter, transform;
}
```

This is separate from the existing below-fold `.weelp-blur-reveal__character` transition because the homepage must animate at first paint without an IntersectionObserver state change.

- [ ] **Step 4: Add the scoped CTA overlay and icon motion**

Immediately after `.weelp-home-hero-blur-character`, add:

```css
.weelp-home-search-cta::before,
.weelp-home-search-cta::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  pointer-events: none;
}

.weelp-home-search-cta::before {
  background: linear-gradient(90deg, hsl(var(--weelp-sage-deep)) 0%, hsl(var(--weelp-sage-hover)) 100%);
  opacity: 1;
}

.weelp-home-search-cta::after {
  background: linear-gradient(270deg, hsl(var(--weelp-sage-deep)) 0%, hsl(var(--weelp-sage-hover)) 100%);
  opacity: 0;
  transition: opacity 300ms linear;
}

.dark .weelp-home-search-cta::before {
  background: linear-gradient(90deg, var(--weelp-home-page) 0%, var(--weelp-home-surface) 100%);
}

.dark .weelp-home-search-cta::after {
  background: linear-gradient(270deg, var(--weelp-home-page) 0%, var(--weelp-home-surface) 100%);
}

.weelp-home-search-cta__icon {
  transition: transform 300ms linear;
}

.weelp-home-search-cta:not(:disabled):not([aria-busy='true']):hover::after,
.weelp-home-search-cta:not(:disabled):not([aria-busy='true']):focus-visible::after {
  opacity: 1;
}

.weelp-home-search-cta:not(:disabled):not([aria-busy='true']):hover .weelp-home-search-cta__icon,
.weelp-home-search-cta:not(:disabled):not([aria-busy='true']):focus-visible .weelp-home-search-cta__icon {
  transform: rotate(-45deg);
}
```

The overlay uses only existing theme tokens. It sits below the existing icon/text spans and does not replace the button's resting background.

- [ ] **Step 5: Extend the existing reduced-motion block**

Add `.weelp-home-hero-blur-character` to the existing group that resets opacity, transform, filter, animation, and `will-change`. Then add these rules inside the same media query:

```css
.weelp-home-search-cta::after,
.weelp-home-search-cta__icon {
  transition: none;
}

.weelp-home-search-cta:not(:disabled):not([aria-busy='true']):hover .weelp-home-search-cta__icon,
.weelp-home-search-cta:not(:disabled):not([aria-busy='true']):focus-visible .weelp-home-search-cta__icon {
  transform: none;
}
```

- [ ] **Step 6: Run all focused motion tests**

Run:

```bash
npx jest src/app/components/Pages/FRONT_END/home/__tests__/HeroSection.test.jsx src/app/components/Pages/FRONT_END/home/__tests__/HeroMotionStyles.test.js src/app/components/Pages/FRONT_END/shared/__tests__/ActivityItinerarySearch.test.jsx --runInBand
```

Expected: PASS with no console warnings.

- [ ] **Step 7: Run static checks**

Run:

```bash
npm run type-check
npm run lint
git diff --check
```

Expected: all exit 0. Invoke `error-handling-patterns` and confirm reduced motion resolves to readable final-state content.

- [ ] **Step 8: Run the required visible-browser smoke check**

```bash
agent-browser --session weelp-visible reload
agent-browser --session weelp-visible hover "button[aria-label='Search trips']"
```

Expected: the visible entrance completes without layout shift; the CTA gradient visibly reverses and the icon rotates without moving the text or button. Leave all code uncommitted for the final review and simplification gates.

### Task 4: Review, simplify, and visible-browser verification

**Files:**

- Review all files changed in Tasks 1–3.
- Modify only files required to address confirmed review findings.

- [ ] **Step 1: Run the full required verification set**

```bash
npm run type-check
npm run lint
npx jest src/app/components/Pages/FRONT_END/home/__tests__/HeroSection.test.jsx src/app/components/Pages/FRONT_END/home/__tests__/HeroMotionStyles.test.js src/app/components/Pages/FRONT_END/shared/__tests__/ActivityItinerarySearch.test.jsx --runInBand
git diff --check
```

Expected: every command exits 0.

- [ ] **Step 2: Run the mandatory code-review gate**

Dispatch the `code-reviewer` agent against the implementation diff and this plan. Address every critical or high-confidence issue. If code changes, rerun Step 1 and dispatch the reviewer again until no blocking finding remains.

- [ ] **Step 3: Run the mandatory simplification gate**

Invoke `simplify` on the reviewed diff. If that named skill is unavailable in the execution environment, announce the missing skill and use the available `karpathy-guidelines` skill for the equivalent focused simplicity pass, as required by the platform's missing-skill fallback rule. Accept only changes that preserve the exact spec, accessibility contract, CSS-at-paint behavior, and home-only scope. Rerun Step 1 after any simplification edit.

- [ ] **Step 4: Replay the entrance in visible headed browsers**

Keep the reference visible:

```bash
agent-browser --session weelp-reference --headed --args "--no-sandbox" open https://demo.casethemes.net/steelnova/
```

Open and reload localhost in a separate visible session:

```bash
agent-browser --session weelp-visible --headed --args "--no-sandbox" open http://localhost:3000
agent-browser --session weelp-visible reload
```

Expected: the Weelp eyebrow rises first; both title lines resolve character by character from blur; subtitle, search panel, and trust row follow; no content shifts; the sequence does not replay after hydration.

- [ ] **Step 5: Verify hover, focus, responsive layout, reduced motion, and console**

In the visible localhost session, hover the `Search escapes` button and confirm the same-palette overlay resolves over 300 milliseconds while the search icon rotates 45 degrees and the button does not move. Tab to the button and confirm the same treatment plus the existing focus ring. Verify desktop and mobile widths retain the current layout.

Use the browser's reduced-motion emulation, reload, and confirm all hero text is immediately sharp and stationary and the CTA icon does not rotate. Check the browser console for hydration, React, CSS, or runtime errors; expected result is none.

- [ ] **Step 6: Commit the fully reviewed and verified implementation**

```bash
git add src/app/components/Pages/FRONT_END/home/HeroSection.jsx src/app/components/Pages/FRONT_END/home/__tests__/HeroSection.test.jsx src/app/components/Pages/FRONT_END/home/__tests__/HeroMotionStyles.test.js src/app/components/Pages/FRONT_END/shared/ActivityItinerarySearch.jsx src/app/components/Pages/FRONT_END/shared/__tests__/ActivityItinerarySearch.test.jsx src/app/globals.css
git commit -m "feat(home): match reference hero motion"
```

Expected final state: frontend `main` contains only the approved motion changes and the worktree is clean.

- [ ] **Step 7: Push the verified frontend main branch**

```bash
git push origin main
```

Expected: the remote `main` branch advances through the design, implementation, and any review-fix commits from this task.
