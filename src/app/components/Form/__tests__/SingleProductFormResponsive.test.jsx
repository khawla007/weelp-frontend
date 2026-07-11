import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('@/lib/store/useMiniCartStore', () => ({
  __esModule: true,
  default: () => ({ setMiniCartOpen: jest.fn(), addItem: jest.fn(), clearCart: jest.fn() }),
}));
jest.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: jest.fn() }) }));
jest.mock('@/components/calendar', () => ({
  EMPTY_DATE_RANGE: { from: null, to: null },
  WeelpCalendar: () => <div>Calendar choices</div>,
}));

import SingleProductForm from '../SingleProductForm';

const Wrapper = ({ children }) => {
  const methods = useForm({ defaultValues: { howMany: { adults: 1, children: 0, infants: 0 }, dateRange: { from: null, to: null } } });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

it('renders responsive keyboard-operable date and traveler controls', async () => {
  render(<SingleProductForm productData={{ id: 2 }} formId="booking-form-2" scheduleCount={3} />, { wrapper: Wrapper });

  const travelerButton = await screen.findByRole('button', { name: '1 Travelers' });
  const dateButton = screen.getByRole('button', { name: 'When?' });
  const controls = travelerButton.parentElement;

  expect(controls).toHaveClass('flex-col', 'sm:flex-row');
  expect(travelerButton).toHaveClass('min-w-0');
  expect(dateButton).toHaveClass('min-w-0');
  expect(travelerButton).toHaveAttribute('aria-expanded', 'false');
  expect(dateButton).toHaveAttribute('aria-expanded', 'false');
  expect(travelerButton).toHaveAttribute('aria-controls', 'traveler-selector-2');
  expect(dateButton).toHaveAttribute('aria-controls', 'date-selector-2');

  fireEvent.click(travelerButton);
  expect(travelerButton).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('dialog', { name: 'Traveler selector' })).toBeInTheDocument();

  fireEvent.click(dateButton);
  expect(dateButton).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('dialog', { name: 'Date selector' })).toBeInTheDocument();
  await waitFor(() => expect(screen.getByText('Calendar choices')).toBeInTheDocument());
});
