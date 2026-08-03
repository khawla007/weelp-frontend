import { useState } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { SupportRequestForm } from '../SupportRequestForm';
import { submitSupportRequest } from '@/lib/services/supportRequests';

jest.mock('@/lib/services/supportRequests', () => ({
  submitSupportRequest: jest.fn(),
}));

const context = {
  itemType: 'activity',
  itemId: 161,
  itemTitle: 'Dubai Desert Safari With BBQ',
  itemSlug: 'dubai-desert-safari-with-bbq',
  citySlug: 'dubai',
  pagePath: '/cities/dubai/activities/dubai-desert-safari-with-bbq',
  faqs: [],
};

const validUuid = '550e8400-e29b-41d4-a716-446655440000';

const createDeferred = () => {
  let resolve;
  const promise = new Promise((nextResolve) => {
    resolve = nextResolve;
  });

  return { promise, resolve };
};

const renderForm = (props = {}) => render(<SupportRequestForm context={context} selectedTopic="before_booking" session={null} onBack={jest.fn()} onSuccess={jest.fn()} {...props} />);

const fillGuest = ({ message = 'Please tell me whether this is suitable for children.' } = {}) => {
  fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'Test Guest' } });
  fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'guest@example.com' } });
  fireEvent.change(screen.getByLabelText('Message'), { target: { value: message } });
};

describe('SupportRequestForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(globalThis.crypto, 'randomUUID', {
      configurable: true,
      value: jest.fn(() => validUuid),
    });
  });

  it('keeps the back action inside a padded single-line button', () => {
    renderForm();

    expect(screen.getByRole('button', { name: 'Back to help' })).toHaveClass('h-10', 'max-w-full', 'px-3', 'whitespace-nowrap');
  });

  it('prefills session identity while keeping guest fields editable', () => {
    renderForm({
      session: { user: { name: 'Aisha Traveller', email: 'aisha@example.com' } },
    });

    const name = screen.getByLabelText('Your name');
    const email = screen.getByLabelText('Email address');
    expect(name).toHaveValue('Aisha Traveller');
    expect(email).toHaveValue('aisha@example.com');

    fireEvent.change(name, { target: { value: 'Aisha K.' } });
    fireEvent.change(email, { target: { value: 'new@example.com' } });
    expect(name).toHaveValue('Aisha K.');
    expect(email).toHaveValue('new@example.com');
  });

  it('prefills a late session only into empty pristine fields', () => {
    const { rerender } = renderForm();

    rerender(
      <SupportRequestForm context={context} selectedTopic="before_booking" session={{ user: { name: 'Late Traveller', email: 'late@example.com' } }} onBack={jest.fn()} onSuccess={jest.fn()} />,
    );

    expect(screen.getByLabelText('Your name')).toHaveValue('Late Traveller');
    expect(screen.getByLabelText('Email address')).toHaveValue('late@example.com');
  });

  it('never overwrites typed or intentionally cleared identity when a session changes', () => {
    const { rerender } = renderForm({
      session: { user: { name: 'Original Name', email: 'original@example.com' } },
    });
    fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'My typed name' } });
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: '' } });

    rerender(
      <SupportRequestForm
        context={context}
        selectedTopic="before_booking"
        session={{ user: { name: 'Replacement Name', email: 'replacement@example.com' } }}
        onBack={jest.fn()}
        onSuccess={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('Your name')).toHaveValue('My typed name');
    expect(screen.getByLabelText('Email address')).toHaveValue('');
  });

  it('preserves intentionally blank identity fields after a guest types and clears them before a late session', () => {
    const { rerender } = renderForm();
    const name = screen.getByLabelText('Your name');
    const email = screen.getByLabelText('Email address');
    fireEvent.change(name, { target: { value: 'Temporary name' } });
    fireEvent.change(email, { target: { value: 'temporary@example.com' } });
    fireEvent.change(name, { target: { value: '' } });
    fireEvent.change(email, { target: { value: '' } });

    rerender(
      <SupportRequestForm context={context} selectedTopic="before_booking" session={{ user: { name: 'Late Traveller', email: 'late@example.com' } }} onBack={jest.fn()} onSuccess={jest.fn()} />,
    );

    expect(screen.getByLabelText('Your name')).toHaveValue('');
    expect(screen.getByLabelText('Email address')).toHaveValue('');
  });

  it('blocks submission and connects the short-message validation error', async () => {
    renderForm();
    fillGuest({ message: 'Too short' });
    fireEvent.click(screen.getByRole('button', { name: 'Send request' }));

    expect(await screen.findByText('Tell us a little more')).toHaveAttribute('id', 'support-message-error');
    expect(screen.getByLabelText('Message')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Message')).toHaveAttribute('aria-describedby', 'support-message-error');
    expect(submitSupportRequest).not.toHaveBeenCalled();
  });

  it('reuses the generated UUID and keeps input values after a network failure', async () => {
    submitSupportRequest
      .mockResolvedValueOnce({
        success: false,
        status: 0,
        message: 'We could not send your request. Please try again.',
        errors: {},
      })
      .mockResolvedValueOnce({
        success: true,
        data: { reference: 'WLP-123456' },
      });
    const onSuccess = jest.fn();
    renderForm({ onSuccess });
    fillGuest();

    fireEvent.click(screen.getByRole('button', { name: 'Send request' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('We could not send your request. Please try again.');
    expect(screen.getByLabelText('Message')).toHaveValue('Please tell me whether this is suitable for children.');

    fireEvent.click(screen.getByRole('button', { name: 'Send request' }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith('WLP-123456'));

    const firstPayload = submitSupportRequest.mock.calls[0][0];
    expect(submitSupportRequest).toHaveBeenNthCalledWith(2, expect.objectContaining({ client_request_id: firstPayload.client_request_id }));
    expect(firstPayload.client_request_id).toBe(validUuid);
  });

  it('maps every Laravel field error in stable order, announces them, and focuses the first invalid field', async () => {
    submitSupportRequest.mockResolvedValue({
      success: false,
      status: 422,
      message: 'Please check the highlighted fields.',
      errors: {
        message: ['The message is too long.'],
        name: ['The name has already been used.', 'Choose another name.'],
        ignored: ['Do not render this unknown field.'],
        email: ['The email is invalid.'],
      },
    });
    renderForm();
    fillGuest();
    fireEvent.click(screen.getByRole('button', { name: 'Send request' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Please check the highlighted fields.');
    expect(alert).toHaveTextContent('The name has already been used.');
    expect(alert).toHaveTextContent('Choose another name.');
    expect(alert).toHaveTextContent('The email is invalid.');
    expect(alert).toHaveTextContent('The message is too long.');
    expect(screen.queryByText('Do not render this unknown field.')).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText('Your name')).toHaveFocus());
    expect(screen.getByLabelText('Your name')).toHaveAttribute('aria-describedby', 'support-name-error');
  });

  it('announces the 429 wait message', async () => {
    submitSupportRequest.mockResolvedValue({
      success: false,
      status: 429,
      message: 'Too many support requests. Please wait and try again.',
      errors: {},
    });
    renderForm();
    fillGuest();
    fireEvent.click(screen.getByRole('button', { name: 'Send request' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Too many support requests. Please wait and try again.');
  });

  it('calls onSuccess and submits the exact backend payload with an absolute page URL', async () => {
    submitSupportRequest.mockResolvedValue({
      success: true,
      data: { reference: 'WLP-777777' },
    });
    const onSuccess = jest.fn();
    renderForm({ onSuccess });
    fillGuest();
    fireEvent.click(screen.getByRole('button', { name: 'Send request' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith('WLP-777777'));
    expect(submitSupportRequest).toHaveBeenCalledWith({
      name: 'Test Guest',
      email: 'guest@example.com',
      topic: 'before_booking',
      message: 'Please tell me whether this is suitable for children.',
      website: '',
      item_type: 'activity',
      item_id: 161,
      item_title: 'Dubai Desert Safari With BBQ',
      city_slug: 'dubai',
      item_slug: 'dubai-desert-safari-with-bbq',
      page_url: 'http://localhost/cities/dubai/activities/dubai-desert-safari-with-bbq',
      client_request_id: validUuid,
    });
    expect(submitSupportRequest.mock.calls[0][0]).not.toHaveProperty('page_path');
  });

  it('ignores a request that resolves after Back unmounts the form', async () => {
    const deferred = createDeferred();
    const onSuccess = jest.fn();
    submitSupportRequest.mockReturnValue(deferred.promise);

    function BackHarness() {
      const [showForm, setShowForm] = useState(true);

      return showForm ? <SupportRequestForm context={context} selectedTopic="before_booking" session={null} onBack={() => setShowForm(false)} onSuccess={onSuccess} /> : <p>Overview restored</p>;
    }

    render(<BackHarness />);
    fillGuest();
    fireEvent.click(screen.getByRole('button', { name: 'Send request' }));
    fireEvent.click(screen.getByRole('button', { name: 'Back to help' }));

    await act(async () => {
      deferred.resolve({ success: true, data: { reference: 'WLP-STALE' } });
      await deferred.promise;
    });

    expect(screen.getByText('Overview restored')).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it.each([
    [{ success: true, data: { reference: { unsafe: true } } }],
    [{ success: true, data: { reference: '   ' } }],
    [{ success: false, status: 500, message: ['Unsafe response'], errors: {} }],
    [{ success: false, status: 500, message: { unsafe: true }, errors: {} }],
  ])('keeps malformed resolved responses safe and visible in the form', async (result) => {
    const onSuccess = jest.fn();
    submitSupportRequest.mockResolvedValue(result);
    renderForm({ onSuccess });
    fillGuest();
    fireEvent.click(screen.getByRole('button', { name: 'Send request' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('We could not send your request. Please try again.');
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('generates one RFC 4122 v4 fallback UUID and keeps it stable across retries without randomUUID', async () => {
    Object.defineProperty(globalThis.crypto, 'randomUUID', {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(globalThis.crypto, 'getRandomValues', {
      configurable: true,
      value: jest.fn((bytes) => {
        bytes.set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
        return bytes;
      }),
    });
    submitSupportRequest.mockResolvedValueOnce({ success: false, status: 0, message: 'Try again.', errors: {} }).mockResolvedValueOnce({ success: true, data: { reference: 'WLP-FALLBACK' } });
    renderForm();
    fillGuest();

    fireEvent.click(screen.getByRole('button', { name: 'Send request' }));
    await screen.findByRole('alert');
    fireEvent.click(screen.getByRole('button', { name: 'Send request' }));
    await waitFor(() => expect(submitSupportRequest).toHaveBeenCalledTimes(2));

    const firstId = submitSupportRequest.mock.calls[0][0].client_request_id;
    const secondId = submitSupportRequest.mock.calls[1][0].client_request_id;
    expect(firstId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(secondId).toBe(firstId);
  });
});
