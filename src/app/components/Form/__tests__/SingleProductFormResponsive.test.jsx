import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { bookingSchema } from '@/lib/validation/bookingSchema';

const mockAddItem = jest.fn();
const mockSetMiniCartOpen = jest.fn();

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('@/lib/store/useMiniCartStore', () => ({
  __esModule: true,
  default: () => ({ setMiniCartOpen: mockSetMiniCartOpen, addItem: mockAddItem }),
}));
jest.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: jest.fn() }) }));
jest.mock('@/components/calendar', () => ({
  EMPTY_DATE_RANGE: { from: null, to: null },
  WeelpCalendar: () => <div>Calendar choices</div>,
}));

import SingleProductForm from '../SingleProductForm';

const Wrapper = ({ children, defaultValues = { howMany: { adults: 1, children: 0, infants: 0 }, dateRange: { from: null, to: null } } }) => {
  const methods = useForm({ resolver: zodResolver(bookingSchema), defaultValues });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

beforeEach(() => {
  jest.clearAllMocks();
});

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
  expect(screen.getByText('adults', { selector: 'h3' })).toHaveClass('text-base');
  expect(screen.getByText('children', { selector: 'h3' })).toHaveClass('text-base');
  expect(screen.getByText('infants', { selector: 'h3' })).toHaveClass('text-base');
  expect(screen.getByText('Above 13 or above')).toHaveClass('text-sm');
  expect(screen.getByText('Age 2-12')).toHaveClass('text-sm');
  expect(screen.getByText('Under 2')).toHaveClass('text-sm');
  expect(screen.getByRole('button', { name: /decrease adults/i })).toHaveClass('size-11');
  expect(screen.getByRole('button', { name: /increase children/i })).toHaveClass('size-11');

  fireEvent.click(dateButton);
  expect(dateButton).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('dialog', { name: 'Date selector' })).toBeInTheDocument();
  await waitFor(() => expect(screen.getByText('Calendar choices')).toBeInTheDocument());
});

it('adds activity route metadata to cart items so mini-cart edit can render', async () => {
  render(
    <Wrapper
      defaultValues={{
        howMany: { adults: 2, children: 1, infants: 0 },
        dateRange: { from: new Date('2026-08-20T00:00:00'), to: new Date('2026-08-20T00:00:00') },
      }}
    >
      <SingleProductForm
        productData={{
          id: 42,
          item_type: 'activity',
          name: 'Dubai Desert Safari With BBQ',
          slug: 'dubai-desert-safari-with-bbq',
          locations: [{ location_type: 'primary', city_slug: 'dubai' }],
          pricing: { regular_price: 100, currency: 'USD' },
        }}
        formId="booking-form-42"
      />
    </Wrapper>,
  );

  fireEvent.submit(document.querySelector('#booking-form-42'));

  await waitFor(() => expect(mockAddItem).toHaveBeenCalledTimes(1));
  expect(mockAddItem).toHaveBeenCalledWith(
    expect.objectContaining({
      id: 42,
      type: 'activity',
      slug: 'dubai-desert-safari-with-bbq',
      city_slug: 'dubai',
    }),
  );
});

it('submits the displayed package variation price and currency', async () => {
  render(
    <Wrapper
      defaultValues={{
        howMany: { adults: 1, children: 0, infants: 0 },
        dateRange: { from: new Date('2026-08-20T00:00:00'), to: new Date('2026-08-20T00:00:00') },
      }}
    >
      <SingleProductForm
        productData={{
          id: 2,
          item_type: 'package',
          name: 'Holidays In Kerala',
          base_pricing: {
            currency: 'EUR',
            variations: [{ regular_price: 1000 }],
          },
        }}
        formId="booking-form-2"
      />
    </Wrapper>,
  );

  fireEvent.submit(document.querySelector('#booking-form-2'));

  await waitFor(() => expect(mockAddItem).toHaveBeenCalledTimes(1));
  expect(mockAddItem).toHaveBeenCalledWith(
    expect.objectContaining({
      id: 2,
      type: 'package',
      base_price: 1000,
      price: 1000,
      currency: 'EUR',
    }),
  );
});

it('returns an invalid external submit to the required date control', async () => {
  const originalScrollIntoView = Element.prototype.scrollIntoView;
  const scrollIntoView = jest.fn();
  let externalSubmit;
  Element.prototype.scrollIntoView = scrollIntoView;

  try {
    render(<SingleProductForm productData={{ id: 2 }} formId="booking-form-2" />, { wrapper: Wrapper });

    externalSubmit = document.createElement('button');
    externalSubmit.type = 'submit';
    externalSubmit.setAttribute('form', 'booking-form-2');
    document.body.appendChild(externalSubmit);
    fireEvent.click(externalSubmit);

    const dateButton = await screen.findByRole('button', { name: 'When?' });
    await waitFor(() => expect(dateButton).toHaveFocus());
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
  } finally {
    externalSubmit?.remove();
    Element.prototype.scrollIntoView = originalScrollIntoView;
  }
});
