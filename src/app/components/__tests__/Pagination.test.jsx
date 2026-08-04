import { fireEvent, render, screen } from '@testing-library/react';

import { CustomPagination } from '../Pagination';

describe('CustomPagination', () => {
  it('shows page one for an empty first-page result', () => {
    render(<CustomPagination totalItems={0} itemsPerPage={3} currentPage={1} onPageChange={jest.fn()} />);

    expect(screen.getByRole('textbox', { name: 'Page number' })).toHaveValue('1');
    expect(screen.getByText('of 1')).toBeInTheDocument();
  });

  it('provides named controls and keeps touch sizing and layout composition opt-in', () => {
    const onPageChange = jest.fn();
    const { container } = render(
      <CustomPagination
        totalItems={30}
        itemsPerPage={10}
        currentPage={2}
        onPageChange={onPageChange}
        className="max-sm:flex-col"
        controlsClassName="max-sm:flex-wrap"
        controlClassName="h-11 min-w-11"
        inputClassName="h-11 w-14"
      />,
    );

    const first = screen.getByRole('button', { name: 'First page' });
    const previous = screen.getByRole('button', { name: 'Previous page' });
    const next = screen.getByRole('button', { name: 'Next page' });
    const last = screen.getByRole('button', { name: 'Last page' });

    for (const control of [first, previous, next, last]) {
      expect(control).toHaveClass('h-11', 'min-w-11');
    }
    expect(screen.getByRole('textbox', { name: 'Page number' })).toHaveClass('h-11');
    expect(container.firstElementChild).toHaveClass('max-sm:flex-col');
    expect(next.parentElement).toHaveClass('max-sm:flex-wrap');

    fireEvent.click(first);
    fireEvent.click(previous);
    fireEvent.click(next);
    fireEvent.click(last);
    expect(onPageChange.mock.calls.map(([page]) => page)).toEqual([1, 1, 3, 3]);
  });

  it('preserves the original shared control sizing by default', () => {
    const { container } = render(<CustomPagination totalItems={30} itemsPerPage={10} currentPage={1} onPageChange={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Next page' })).toHaveClass('h-9');
    expect(screen.getByRole('textbox', { name: 'Page number' })).toHaveClass('h-9', 'w-16');
    expect(container.firstElementChild).toHaveClass('min-w-0', 'flex-col', 'items-start', 'lg:flex-row', 'lg:justify-between');
    expect(screen.getByRole('button', { name: 'Next page' }).parentElement).toHaveClass('w-full', 'min-w-0', 'flex-wrap', 'justify-center', 'lg:w-auto', 'lg:flex-nowrap', 'lg:justify-end');
    expect(container.firstElementChild).not.toHaveClass('md:flex-row');
    expect(screen.getByRole('button', { name: 'Next page' }).parentElement).not.toHaveClass('md:flex-nowrap');
  });
});
