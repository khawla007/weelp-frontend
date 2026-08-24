import { render } from '@testing-library/react';

import WanderersBanner from '../WanderersBanner';

const getSection = (container) => container.querySelector('section[aria-labelledby="wanderers-heading"]');
const getPatternLeaves = (container) => container.querySelectorAll('[data-wanderers-pattern] svg');
const getDividerLines = (container) => container.querySelectorAll('[data-wanderers-line]');

describe('WanderersBanner', () => {
  it('keeps the default pattern teal in light and dark mode', () => {
    const { container } = render(<WanderersBanner />);
    const leaves = getPatternLeaves(container);
    const lines = getDividerLines(container);

    expect(leaves).toHaveLength(2);
    expect(lines).toHaveLength(2);
    leaves.forEach((leaf) => {
      expect(leaf).toHaveClass('text-weelp-sage-deep');
      expect(leaf.className.baseVal).not.toContain('dark:text-[oklch');
    });
    lines.forEach((line) => {
      expect(line).toHaveClass('bg-current', 'text-weelp-sage-deep');
      expect(line.className).not.toContain('dark:text-[oklch');
    });
  });

  it('uses teal in light mode and gold in dark mode for the gold-page pattern', () => {
    const { container } = render(<WanderersBanner patternTone="gold-dark" />);
    const leaves = getPatternLeaves(container);
    const lines = getDividerLines(container);

    expect(leaves).toHaveLength(2);
    expect(lines).toHaveLength(2);
    leaves.forEach((leaf) => {
      expect(leaf).toHaveClass('text-weelp-sage-deep', 'dark:text-[oklch(0.7_0.075_78/0.48)]');
      expect(leaf.className.baseVal).not.toContain('text-[oklch(0.72_0.055_75/0.45)]');
    });
    lines.forEach((line) => {
      expect(line).toHaveClass('bg-current', 'text-weelp-sage-deep', 'dark:text-[oklch(0.7_0.075_78/0.48)]');
      expect(line.className).not.toContain('text-[oklch(0.72_0.055_75/0.45)]');
    });
  });

  it('exposes the inward-frame choreography from one parent reveal', () => {
    const { container } = render(<WanderersBanner entrance="inward-frame" />);
    const section = getSection(container);

    expect(section).toHaveAttribute('data-wanderers-entrance', 'inward-frame');
    expect(section.querySelector('[data-wanderers-top]')).toBeInTheDocument();
    expect(section.querySelectorAll('[data-wanderers-pattern]')).toHaveLength(2);
    expect(section.querySelector('[data-wanderers-pattern="left"]')).toBeInTheDocument();
    expect(section.querySelector('[data-wanderers-pattern="right"]')).toBeInTheDocument();
    expect(section.querySelector('[data-wanderers-line="left"]')).toBeInTheDocument();
    expect(section.querySelector('[data-wanderers-line="right"]')).toBeInTheDocument();
    expect(section.querySelector('[data-wanderers-button]')).toHaveAttribute('href', '/cities');
    expect(section.querySelectorAll('[data-reveal]')).toHaveLength(0);
  });

  it('retains the existing grouped reveal when no entrance variant is requested', () => {
    const { container } = render(<WanderersBanner />);
    const section = getSection(container);

    expect(section).not.toHaveAttribute('data-wanderers-entrance');
    expect(section.querySelectorAll('[data-reveal]')).toHaveLength(2);
  });
});
