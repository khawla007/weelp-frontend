import React from 'react';
import { render, screen, within } from '@testing-library/react';

import { OtpInput } from '../OtpInput';

describe('OtpInput mobile containment', () => {
  it('shares the available 320px width without overflowing', () => {
    render(<OtpInput length={6} autoFocus={false} />);

    const inputs = screen.getAllByRole('textbox');
    const group = inputs[0].parentElement;

    expect(group).toHaveClass('w-full', 'min-w-0', 'gap-1');
    inputs.forEach((input) => {
      expect(input).toHaveClass('min-w-0', 'flex-1', 'max-w-12');
    });
  });

  it('announces the verification-code group and each digit position', () => {
    render(<OtpInput length={6} autoFocus={false} />);

    const group = screen.getByRole('group', { name: 'Verification code' });
    const inputs = within(group).getAllByRole('textbox');

    expect(inputs).toHaveLength(6);
    inputs.forEach((input, index) => {
      expect(input).toHaveAccessibleName(`Digit ${index + 1} of 6`);
    });
  });
});
