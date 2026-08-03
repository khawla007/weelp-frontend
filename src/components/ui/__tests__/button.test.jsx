import { render, screen } from '@testing-library/react';

import { Button } from '../button';

describe('Button', () => {
  it('marks non-link asChild anchors as button-shaped controls', () => {
    render(
      <Button asChild>
        <a href="/test">Continue</a>
      </Button>,
    );

    expect(screen.getByRole('link', { name: 'Continue' })).toHaveAttribute('data-weelp-button-link');
  });

  it('leaves link-variant asChild anchors unmarked', () => {
    render(
      <Button asChild variant="link">
        <a href="/help">Help</a>
      </Button>,
    );

    expect(screen.getByRole('link', { name: 'Help' })).not.toHaveAttribute('data-weelp-button-link');
  });
});
