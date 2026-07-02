import { fireEvent, render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';

import SeoFields, { defaultSeoValues } from '../SeoFields';

const renderSeoFields = () => {
  const Wrapper = () => {
    const methods = useForm({
      defaultValues: {
        seo: defaultSeoValues,
      },
    });

    return (
      <FormProvider {...methods}>
        <SeoFields itemType="page" requiredBasicFields={false} />
      </FormProvider>
    );
  };

  return render(<Wrapper />);
};

describe('SeoFields', () => {
  it('starts every accordion section closed and lets sections open independently', () => {
    renderSeoFields();

    const basicSettings = screen.getByRole('button', { name: /basic settings/i });
    const schemaMarkup = screen.getByRole('button', { name: /schema markup/i });
    const scriptSlots = screen.getByRole('button', { name: /script slots/i });

    expect(basicSettings).toHaveAttribute('data-state', 'closed');
    expect(schemaMarkup).toHaveAttribute('data-state', 'closed');
    expect(scriptSlots).toHaveAttribute('data-state', 'closed');

    fireEvent.click(basicSettings);
    fireEvent.click(schemaMarkup);

    expect(basicSettings).toHaveAttribute('data-state', 'open');
    expect(schemaMarkup).toHaveAttribute('data-state', 'open');
    expect(scriptSlots).toHaveAttribute('data-state', 'closed');

    fireEvent.click(basicSettings);

    expect(basicSettings).toHaveAttribute('data-state', 'closed');
    expect(schemaMarkup).toHaveAttribute('data-state', 'open');
  });
});
