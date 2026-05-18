import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ModalForm from '../ModalForm';

jest.mock('../../Form/Form', () => {
  const BookingFormMock = ({ controlsSlot, isSearching, onSearchStart }) => (
    <form
      aria-label="Booking search form"
      onSubmit={(event) => {
        event.preventDefault();
        onSearchStart?.();
      }}
    >
      <div data-testid="filter-bar-shell">
        <input aria-label="Where to" />
        {controlsSlot}
      </div>
      <button type="submit" aria-label="Search trips" disabled={isSearching}>
        {isSearching ? <span data-testid="search-submit-loader" /> : 'Search'}
      </button>
    </form>
  );
  BookingFormMock.displayName = 'BookingFormMock';
  return BookingFormMock;
});

const mockPathState = {
  pathname: '/',
  search: '',
};

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathState.pathname,
  useSearchParams: () => new URLSearchParams(mockPathState.search),
}));

describe('ModalForm', () => {
  beforeEach(() => {
    mockPathState.pathname = '/';
    mockPathState.search = '';
  });

  afterEach(() => {
    document.querySelectorAll('[data-testid="external-search-trigger"]').forEach((element) => element.remove());
    document.querySelectorAll('[data-testid="background-content"]').forEach((element) => element.remove());
  });

  it('renders the open search shell as a labelled modal dialog and moves focus inside', async () => {
    const trigger = document.createElement('button');
    trigger.dataset.testid = 'external-search-trigger';
    trigger.textContent = 'Open search';
    document.body.appendChild(trigger);
    trigger.focus();

    render(<ModalForm showForm setShowForm={jest.fn()} handleShowForm={jest.fn()} />);

    const dialog = screen.getByRole('dialog', { name: /search trips/i });
    expect(dialog).toHaveAccessibleDescription(/choose a destination/i);
    expect(screen.getByLabelText(/booking search form/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close search/i })).toHaveClass('-right-3', '-top-3', 'bg-white', 'text-red-600');
    expect(screen.getByRole('button', { name: /search trips/i })).toBeInTheDocument();
    expect(screen.getByTestId('search-modal-panel')).toHaveAttribute('data-state', 'open');
    expect(screen.getByTestId('search-modal-panel').className).toEqual(expect.stringContaining('data-[state=open]:[--tw-enter-scale:0.98]'));
    expect(screen.getByTestId('search-modal-panel').className).toEqual(expect.stringContaining('data-[state=closed]:[--tw-exit-scale:0.98]'));

    await waitFor(() => {
      expect(dialog).toContainElement(document.activeElement);
    });
  });

  it('closes from Escape', () => {
    const setShowForm = jest.fn();

    render(<ModalForm showForm setShowForm={setShowForm} handleShowForm={jest.fn()} />);

    fireEvent.keyDown(screen.getByRole('dialog', { name: /search trips/i }), { key: 'Escape' });
    expect(setShowForm).toHaveBeenCalledWith(false);
  });

  it('closes from the close control', async () => {
    function ModalFormHarness() {
      const [showForm, setShowForm] = React.useState(true);

      return <ModalForm showForm={showForm} setShowForm={setShowForm} handleShowForm={() => setShowForm((isOpen) => !isOpen)} />;
    }

    render(<ModalFormHarness />);

    fireEvent.click(screen.getByRole('button', { name: /close search/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /search trips/i })).not.toBeInTheDocument();
    });
  });

  it('shows a loader in the modal search button after submit', () => {
    render(<ModalForm showForm setShowForm={jest.fn()} handleShowForm={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /search trips/i }));

    expect(screen.getByTestId('search-submit-loader')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search trips/i })).toBeDisabled();
  });

  it('closes the modal after search navigation reaches the search route', async () => {
    const setShowForm = jest.fn();
    const { rerender } = render(<ModalForm showForm setShowForm={setShowForm} handleShowForm={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /search trips/i }));

    mockPathState.pathname = '/search';
    mockPathState.search = 'location=dubai';
    rerender(<ModalForm showForm setShowForm={setShowForm} handleShowForm={jest.fn()} />);

    await waitFor(() => {
      expect(setShowForm).toHaveBeenCalledWith(false);
    });
  });

  it('marks background content inert while the modal is open and restores it on close', async () => {
    const background = document.createElement('main');
    background.dataset.testid = 'background-content';
    background.innerHTML = '<button type="button">Background action</button>';
    document.body.appendChild(background);

    function ModalFormHarness() {
      const [showForm, setShowForm] = React.useState(true);

      return <ModalForm showForm={showForm} setShowForm={setShowForm} handleShowForm={() => setShowForm((isOpen) => !isOpen)} />;
    }

    render(<ModalFormHarness />);

    expect(background).toHaveAttribute('aria-hidden', 'true');
    expect(background.inert).toBe(true);

    fireEvent.keyDown(screen.getByRole('dialog', { name: /search trips/i }), { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /search trips/i })).not.toBeInTheDocument();
    });
    expect(background).not.toHaveAttribute('aria-hidden');
    expect(background.inert).toBe(false);
  });

  it('preserves existing background aria-hidden and inert values after close', async () => {
    const background = document.createElement('main');
    background.dataset.testid = 'background-content';
    background.setAttribute('aria-hidden', 'true');
    background.inert = true;
    document.body.appendChild(background);

    function ModalFormHarness() {
      const [showForm, setShowForm] = React.useState(true);

      return <ModalForm showForm={showForm} setShowForm={setShowForm} handleShowForm={() => setShowForm((isOpen) => !isOpen)} />;
    }

    render(<ModalFormHarness />);

    fireEvent.keyDown(screen.getByRole('dialog', { name: /search trips/i }), { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /search trips/i })).not.toBeInTheDocument();
    });
    expect(background).toHaveAttribute('aria-hidden', 'true');
    expect(background.inert).toBe(true);
  });

  it('returns focus to the trigger after Escape closes the modal', async () => {
    function ModalFormHarness() {
      const [showForm, setShowForm] = React.useState(false);

      return (
        <>
          <button type="button" onClick={() => setShowForm(true)}>
            Open search
          </button>
          <ModalForm showForm={showForm} setShowForm={setShowForm} handleShowForm={() => setShowForm((isOpen) => !isOpen)} />
        </>
      );
    }

    render(<ModalFormHarness />);

    const trigger = screen.getByRole('button', { name: /open search/i });
    trigger.focus();
    fireEvent.click(trigger);

    const dialog = screen.getByRole('dialog', { name: /search trips/i });
    await waitFor(() => {
      expect(dialog).toContainElement(document.activeElement);
    });

    fireEvent.keyDown(dialog, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /search trips/i })).not.toBeInTheDocument();
    });
    expect(trigger).toHaveFocus();
  });

  it('removes the dialog from the accessibility tree when closed', () => {
    render(<ModalForm showForm={false} setShowForm={jest.fn()} handleShowForm={jest.fn()} />);

    expect(screen.queryByRole('dialog', { name: /search trips/i })).not.toBeInTheDocument();
  });
});
