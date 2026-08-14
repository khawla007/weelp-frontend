import { render, screen } from '@testing-library/react';

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../dialog';

describe('DialogContent', () => {
  it('applies custom classes to its close button', () => {
    render(
      <Dialog open>
        <DialogContent closeClassName="weelp-plain-action border-0 bg-transparent text-red-400 shadow-none hover:text-red-600">
          <DialogTitle>Choose an item</DialogTitle>
          <DialogDescription>Choose an item to add.</DialogDescription>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByRole('button', { name: /close/i })).toHaveClass('weelp-plain-action', 'border-0', 'bg-transparent', 'text-red-400', 'shadow-none', 'hover:text-red-600');
  });
});
