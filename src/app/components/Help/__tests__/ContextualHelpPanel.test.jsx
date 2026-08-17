import { createRef, useState } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { ContextualHelpPanel } from '../ContextualHelpPanel';
import { submitSupportRequest } from '@/lib/services/supportRequests';

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
}));

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
  faqs: [
    { id: 12, question: 'Where is pickup?', answer: 'Pickup is from central Dubai hotels.' },
    { id: 19, question: 'What should I bring?', answer: 'Bring sun protection and water.' },
  ],
};

const createDeferred = () => {
  let resolve;
  const promise = new Promise((nextResolve) => {
    resolve = nextResolve;
  });

  return { promise, resolve };
};

const completeForm = () => {
  fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'Test Guest' } });
  fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'guest@example.com' } });
  fireEvent.change(screen.getByLabelText('Message'), {
    target: { value: 'Please tell me whether this is suitable for children.' },
  });
};

function PanelHarness({ initialOpen = true }) {
  const [open, setOpen] = useState(initialOpen);
  const triggerRef = createRef();

  return (
    <>
      <button ref={triggerRef} type="button" onClick={() => setOpen(true)}>
        Open help
      </button>
      <ContextualHelpPanel open={open} onOpenChange={setOpen} context={context} triggerRef={triggerRef} />
    </>
  );
}

describe('ContextualHelpPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the contextual overview, carries a selected topic into the form, and discloses FAQs', () => {
    render(<PanelHarness />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Help with this experience' })).toBeInTheDocument();
    expect(screen.getByText('Dubai Desert Safari With BBQ')).toBeInTheDocument();
    expect(screen.getByText('Activity #161')).toBeInTheDocument();
    expect(screen.getByText('No booking required to ask a question')).toBeInTheDocument();

    const faq = screen.getByRole('button', { name: 'Where is pickup?' });
    expect(faq).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(faq);
    expect(faq).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Pickup is from central Dubai hotels.')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Pickup & location' }));
    fireEvent.click(screen.getByRole('button', { name: 'I still need help' }));

    const formHeading = screen.getByRole('heading', { name: 'Tell us what you need' });
    expect(formHeading).toHaveFocus();
    expect(screen.getByText('Support request form')).toBeInTheDocument();
    expect(screen.getByLabelText('What do you need help with?')).toHaveValue('pickup_location');
  });

  it('presents help topics as selectable pills instead of accordion rows', () => {
    render(<PanelHarness />);

    const topic = screen.getByRole('button', { name: 'Pickup & location' });
    const topicList = topic.parentElement;

    expect(topicList).toHaveClass('flex', 'flex-wrap');
    expect(topic).toHaveClass('rounded-full');
    expect(topic.querySelector('svg')).not.toBeInTheDocument();

    fireEvent.click(topic);
    expect(topic).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('heading', { name: 'Help with this experience' })).toBeInTheDocument();
  });

  it('gives every common-question row and answer consistent spacing', () => {
    render(<PanelHarness />);

    const firstFaq = screen.getByRole('button', { name: 'Where is pickup?' });
    const secondFaq = screen.getByRole('button', { name: 'What should I bring?' });
    const faqList = firstFaq.parentElement?.parentElement;

    expect(faqList).toHaveClass('space-y-2');
    expect(firstFaq.parentElement).toHaveClass('rounded-xl', 'border');
    expect(secondFaq.parentElement).toHaveClass('rounded-xl', 'border');

    fireEvent.click(secondFaq);
    const answer = screen.getByRole('region', { name: 'What should I bring?' });
    expect(answer).toHaveClass('py-4');
  });

  it('has a visible named close control and returns focus after Escape', async () => {
    const onOpenChange = jest.fn();
    const triggerRef = createRef();
    const { unmount } = render(
      <>
        <button ref={triggerRef} type="button">
          Help Center
        </button>
        <ContextualHelpPanel open onOpenChange={onOpenChange} context={context} triggerRef={triggerRef} />
      </>,
    );

    const closeButton = screen.getByRole('button', { name: 'Close help' });
    expect(closeButton).toBeVisible();
    fireEvent.click(closeButton);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    unmount();

    render(<PanelHarness />);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Open help' })).toHaveFocus());
  });

  it('resets the form view and selected topic after close and reopen', async () => {
    render(<PanelHarness />);
    fireEvent.click(screen.getByRole('button', { name: 'Pickup & location' }));
    fireEvent.click(screen.getByRole('button', { name: 'I still need help' }));
    expect(screen.getByLabelText('What do you need help with?')).toHaveValue('pickup_location');

    fireEvent.click(screen.getByRole('button', { name: 'Close help' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Open help' }));

    expect(screen.getByRole('heading', { name: 'Help with this experience' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'I still need help' }));
    expect(screen.getByLabelText('What do you need help with?')).toHaveValue('');
  });

  it('resets the success reference after close and reopen', async () => {
    submitSupportRequest.mockResolvedValue({
      success: true,
      data: { reference: 'WLP-654321' },
    });
    render(<PanelHarness />);
    fireEvent.click(screen.getByRole('button', { name: 'I still need help' }));
    completeForm();
    fireEvent.change(screen.getByLabelText('What do you need help with?'), {
      target: { value: 'before_booking' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send request' }));

    expect(await screen.findByText('WLP-654321')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Your request is on its way' })).toHaveFocus();
    const transitionStatus = screen.getByText('Support request sent. Reference WLP-654321');
    expect(transitionStatus).toHaveAttribute('aria-live', 'polite');
    fireEvent.click(screen.getByRole('button', { name: 'Close help' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Open help' }));

    expect(screen.getByRole('heading', { name: 'Help with this experience' })).toBeInTheDocument();
    expect(screen.queryByText('WLP-654321')).not.toBeInTheDocument();
  });

  it('ignores a completion after the panel closes and reopens without stale success state', async () => {
    const deferred = createDeferred();
    submitSupportRequest.mockReturnValue(deferred.promise);
    render(<PanelHarness />);
    fireEvent.click(screen.getByRole('button', { name: 'I still need help' }));
    completeForm();
    fireEvent.change(screen.getByLabelText('What do you need help with?'), {
      target: { value: 'before_booking' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send request' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close help' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    await act(async () => {
      deferred.resolve({ success: true, data: { reference: 'WLP-STALE' } });
      await deferred.promise;
    });
    fireEvent.click(screen.getByRole('button', { name: 'Open help' }));

    expect(screen.getByRole('heading', { name: 'Help with this experience' })).toHaveFocus();
    expect(screen.getByText('Help overview')).toBeInTheDocument();
    expect(screen.queryByText('WLP-STALE')).not.toBeInTheDocument();
  });
});
