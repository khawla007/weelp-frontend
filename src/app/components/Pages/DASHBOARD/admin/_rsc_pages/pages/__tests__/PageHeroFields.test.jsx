import { fireEvent, render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';

import { PageHeroFields } from '../PageHeroFields';

jest.mock('../../media/MediaLibrary', () => ({
  Medialibrary: () => <div data-testid="media-library" />,
}));

const renderPageHeroFields = () => {
  const Wrapper = () => {
    const methods = useForm({
      defaultValues: {
        hero_background_image_url: '',
        hero_heading: '',
        hero_text: '',
        hero_button_label: '',
        hero_button_url: '',
      },
    });

    return (
      <FormProvider {...methods}>
        <PageHeroFields />
      </FormProvider>
    );
  };

  return render(<Wrapper />);
};

describe('PageHeroFields', () => {
  it('keeps new hero style inputs controlled when legacy page data has no style values', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    renderPageHeroFields();
    fireEvent.click(screen.getByRole('button', { name: /background/i }));

    fireEvent.change(screen.getByLabelText('Overlay opacity'), { target: { value: '0.5' } });

    expect(consoleError).not.toHaveBeenCalledWith(expect.stringContaining('A component is changing an uncontrolled input to be controlled'));

    consoleError.mockRestore();
  });

  it('uses a decimal text field for overlay opacity values from zero to one', () => {
    renderPageHeroFields();
    fireEvent.click(screen.getByRole('button', { name: /background/i }));

    const opacityInput = screen.getByLabelText('Overlay opacity');

    expect(opacityInput).toHaveAttribute('type', 'text');
    expect(opacityInput).toHaveAttribute('inputmode', 'decimal');
    expect(opacityInput).not.toHaveAttribute('pattern');
    expect(opacityInput).toHaveAttribute('placeholder', '0.5');

    fireEvent.change(opacityInput, { target: { value: '0.4' } });

    expect(opacityInput).toHaveValue('0.4');
  });

  it('groups hero controls into named accordion sections', () => {
    renderPageHeroFields();

    const triggers = [
      screen.getByRole('button', { name: /background/i }),
      screen.getByRole('button', { name: /content/i }),
      screen.getByRole('button', { name: /^heading$/i }),
      screen.getByRole('button', { name: /^text$/i }),
      screen.getByRole('button', { name: /^button$/i }),
    ];

    triggers.forEach((trigger) => {
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute('data-state', 'closed');
    });
    expect(screen.queryByText('Hero copy')).not.toBeInTheDocument();
  });
});
