import { render } from '@testing-library/react';

import WanderersBanner from '../WanderersBanner';

const getPatternLeaves = (container) => container.querySelectorAll('section[aria-labelledby="wanderers-heading"] > svg');

describe('WanderersBanner', () => {
  it('keeps the default pattern teal in light and dark mode', () => {
    const { container } = render(<WanderersBanner />);
    const leaves = getPatternLeaves(container);

    expect(leaves).toHaveLength(2);
    leaves.forEach((leaf) => {
      expect(leaf).toHaveClass('text-weelp-sage-deep');
      expect(leaf.className.baseVal).not.toContain('dark:text-[oklch');
    });
  });

  it('uses teal in light mode and gold in dark mode for the gold-page pattern', () => {
    const { container } = render(<WanderersBanner patternTone="gold-dark" />);
    const leaves = getPatternLeaves(container);

    expect(leaves).toHaveLength(2);
    leaves.forEach((leaf) => {
      expect(leaf).toHaveClass('text-weelp-sage-deep', 'dark:text-[oklch(0.7_0.075_78/0.48)]');
      expect(leaf.className.baseVal).not.toContain('text-[oklch(0.72_0.055_75/0.45)]');
    });
  });
});
