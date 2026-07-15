import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import axios from 'axios';

import SharedFilterSection from '../SharedFilterSection';

jest.mock('axios');

// Filter sidebar/drawer are not under test here; render them as no-ops to keep
// the test focused on the grid refresh + reveal behavior.
jest.mock('../FilterSidebar', () => {
  const MockFilterSidebar = () => <div data-testid="filter-sidebar" />;
  return MockFilterSidebar;
});
jest.mock('../FilterDrawer', () => {
  const MockFilterDrawer = () => <div data-testid="filter-drawer" />;
  return MockFilterDrawer;
});

jest.mock('@/app/components/ui/item-card', () => ({
  __esModule: true,
  default: ({ title, className = '', style }) => (
    <div className={className} style={style}>
      {title}
    </div>
  ),
}));

const makeProduct = (id) => ({
  id,
  item_type: 'activity',
  name: `Item ${id}`,
  slug: `item-${id}`,
  city_slug: 'dubai',
});

const respond = (count) => ({
  status: 200,
  data: { data: Array.from({ length: count }, (_, i) => makeProduct(i + 1)), last_page: 2 },
});

describe('SharedFilterSection grid refresh + reveal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  const flushFetch = async () => {
    await act(async () => {
      // advance past the 500ms debounce so the fetch effect fires, then let
      // the resolved axios promise + finally settle in the same act boundary.
      jest.advanceTimersByTime(500);
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });
  };

  it('shows skeletons on the true first load, not real cards', async () => {
    let resolveFetch;
    axios.get.mockReturnValue(
      new Promise((res) => {
        resolveFetch = res;
      }),
    );

    const { container } = render(<SharedFilterSection scope="city" slug="dubai" />);
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    // before first response settles: skeletons present, no real card links
    expect(container.querySelector('.weelp-fade-up')).toBeNull();
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();

    await act(async () => {
      resolveFetch(respond(8));
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('dims previous results during a refresh instead of showing skeletons', async () => {
    axios.get.mockResolvedValue(respond(8));
    const { container, rerender } = render(<SharedFilterSection scope="city" slug="dubai" />);
    await flushFetch();

    // first results are in
    expect(screen.getByText('Item 1')).toBeInTheDocument();

    // trigger a refresh by re-running the debounced effect with a pending promise.
    // MUST use rerender (same component instance, hasLoaded stays true) — a second
    // render() would mount a fresh instance with hasLoaded=false and show skeletons.
    let resolveSecond;
    axios.get.mockReturnValue(
      new Promise((res) => {
        resolveSecond = res;
      }),
    );
    rerender(<SharedFilterSection scope="city" slug="dubai-refresh" />);

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    const grid = container.querySelector('[data-testid="result-grid"]');
    expect(grid).not.toBeNull();
    expect(grid.className).toContain('pointer-events-none');
    expect(grid.className).toContain('opacity-60');
    expect(grid).toHaveAttribute('aria-busy', 'true');
    // previous cards still visible during refresh — no skeleton swap
    expect(grid.querySelectorAll('.weelp-fade-up').length).toBeGreaterThan(0);

    await act(async () => {
      resolveSecond(respond(8));
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });
  });

  it('staggers the first 8 cards and drops per-item delay for card 9+', async () => {
    axios.get.mockResolvedValue(respond(10));
    const { container } = render(<SharedFilterSection scope="city" slug="dubai" />);
    await flushFetch();

    const cards = container.querySelectorAll('.weelp-fade-up');
    expect(cards.length).toBe(10);
    expect(cards[0].style.getPropertyValue('--weelp-motion-duration')).toBe('260ms');
    expect(cards[0].style.getPropertyValue('--weelp-motion-delay')).toBe('0ms');
    expect(cards[1].style.getPropertyValue('--weelp-motion-delay')).toBe('50ms');
    expect(cards[7].style.getPropertyValue('--weelp-motion-delay')).toBe('350ms');
    // card 9 (index 8) and beyond: no per-item delay
    expect(cards[8].style.getPropertyValue('--weelp-motion-delay')).toBe('0ms');
    expect(cards[9].style.getPropertyValue('--weelp-motion-delay')).toBe('0ms');
  });

  it('dim wrapper carries the reduced-motion overrides during refresh', async () => {
    axios.get.mockResolvedValue(respond(8));
    const { container, rerender } = render(<SharedFilterSection scope="city" slug="dubai" />);
    await flushFetch();

    // settled grid has the always-on transition guard
    const settled = container.querySelector('[data-testid="result-grid"]');
    expect(settled.className).toContain('motion-reduce:transition-none');

    // enter an in-flight refresh so the dim (opacity) override is present
    axios.get.mockReturnValue(new Promise(() => {}));
    rerender(<SharedFilterSection scope="city" slug="dubai-refresh" />);
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    const grid = container.querySelector('[data-testid="result-grid"]');
    expect(grid.className).toContain('motion-reduce:opacity-100');
    expect(grid.className).toContain('motion-reduce:transition-none');
  });
});

describe('SharedFilterSection empty state + pagination scroll', () => {
  let scrollSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    scrollSpy = jest.fn();
    Element.prototype.scrollIntoView = scrollSpy;
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
    delete window.matchMedia;
  });

  const flushFetch = async () => {
    await act(async () => {
      jest.advanceTimersByTime(500);
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });
  };

  const setReducedMotion = (matches) => {
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));
  };

  it('renders a calm fade-in empty state with a working Clear filters action', async () => {
    axios.get.mockResolvedValue({ status: 200, data: { data: [], last_page: 1 } });
    const { container } = render(<SharedFilterSection scope="city" slug="dubai" />);
    await flushFetch();

    const empty = container.querySelector('[data-testid="empty-state"]');
    expect(empty).not.toBeNull();
    // calm fade-in via the shared utility (reduced-motion collapse handled in globals.css)
    expect(empty.className).toContain('weelp-fade-up');

    const clearBtn = screen.getByRole('button', { name: /clear filters/i });
    expect(clearBtn).toBeInTheDocument();

    axios.get.mockClear();
    axios.get.mockResolvedValue({ status: 200, data: { data: [], last_page: 1 } });
    fireEvent.click(clearBtn);
    // clearing resets the price range (new array) so the debounced fetch refires
    await flushFetch();
    expect(axios.get).toHaveBeenCalled();
  });

  it('separates API failures from empty filters and retries the same destination request', async () => {
    axios.get.mockRejectedValueOnce(new Error('controlled destination failure'));
    render(<SharedFilterSection scope="city" slug="dubai" />);
    await flushFetch();

    expect(screen.getByText('We could not load these destination listings.')).toBeInTheDocument();
    expect(screen.queryByText('No items match your filters.')).not.toBeInTheDocument();
    expect(screen.getByTestId('result-grid')).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'md:grid-cols-3', 'xl:grid-cols-4');

    axios.get.mockResolvedValueOnce({ status: 200, data: { data: [makeProduct(1)], last_page: 1 } });
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await flushFetch();

    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('uses smooth scroll on page change when reduced-motion is not preferred', async () => {
    setReducedMotion(false);
    axios.get.mockResolvedValue({ status: 200, data: { data: [{ id: 1, item_type: 'activity', slug: 'a', city_slug: 'dubai' }], last_page: 3 } });
    render(<SharedFilterSection scope="city" slug="dubai" />);
    await flushFetch();

    fireEvent.click(screen.getByRole('button', { name: '2' }));
    await act(async () => {
      jest.advanceTimersByTime(50);
    });

    expect(scrollSpy).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }));
  });

  it('uses instant scroll on page change when reduced-motion is preferred', async () => {
    setReducedMotion(true);
    axios.get.mockResolvedValue({ status: 200, data: { data: [{ id: 1, item_type: 'activity', slug: 'a', city_slug: 'dubai' }], last_page: 3 } });
    render(<SharedFilterSection scope="city" slug="dubai" />);
    await flushFetch();

    fireEvent.click(screen.getByRole('button', { name: '2' }));
    await act(async () => {
      jest.advanceTimersByTime(50);
    });

    expect(scrollSpy).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'auto' }));
  });
});
