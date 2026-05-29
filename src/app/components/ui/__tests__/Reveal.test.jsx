import { render, screen, act } from '@testing-library/react';
import Reveal from '../Reveal';

// Controllable IntersectionObserver mock
let ioInstances = [];
class MockIO {
  constructor(cb, opts) {
    this.cb = cb;
    this.opts = opts;
    this.observed = [];
    this.disconnected = false;
    ioInstances.push(this);
  }
  observe(el) {
    this.observed.push(el);
  }
  disconnect() {
    this.disconnected = true;
  }
  trigger(isIntersecting, boundingClientRect = { top: 400 }) {
    act(() => this.cb([{ isIntersecting, boundingClientRect, target: this.observed[0] }], this));
  }
}

const setReducedMotion = (matches) => {
  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
  }));
};

beforeEach(() => {
  ioInstances = [];
  global.IntersectionObserver = MockIO;
  setReducedMotion(false);
  // default: element below the fold
  jest.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({ top: 2000, bottom: 2400 });
  window.innerHeight = 800;
});

afterEach(() => jest.restoreAllMocks());

test('renders children', () => {
  render(<Reveal>hello</Reveal>);
  expect(screen.getByText('hello')).toBeInTheDocument();
});

test('below-fold element starts pending then reveals on intersect', () => {
  render(<Reveal>content</Reveal>);
  const el = screen.getByText('content');
  expect(el).toHaveAttribute('data-reveal', 'pending');
  ioInstances[0].trigger(true);
  expect(el).toHaveAttribute('data-reveal', 'shown');
  expect(ioInstances[0].disconnected).toBe(true);
});

test('reveals when scrolled past (above viewport) even if not intersecting', () => {
  render(<Reveal>content</Reveal>);
  const el = screen.getByText('content');
  expect(el).toHaveAttribute('data-reveal', 'pending');
  // fast scroll carried it above the viewport: not intersecting, top < 0
  ioInstances[0].trigger(false, { top: -500 });
  expect(el).toHaveAttribute('data-reveal', 'shown');
  expect(ioInstances[0].disconnected).toBe(true);
});

test('above-fold element reveals immediately without observing', () => {
  Element.prototype.getBoundingClientRect.mockReturnValue({ top: 100, bottom: 400 });
  render(<Reveal>hero</Reveal>);
  const el = screen.getByText('hero');
  expect(el).toHaveAttribute('data-reveal', 'shown');
});

test('reduced motion shows content immediately, no observer', () => {
  setReducedMotion(true);
  render(<Reveal>content</Reveal>);
  const el = screen.getByText('content');
  expect(el).toHaveAttribute('data-reveal', 'shown');
  expect(ioInstances.length).toBe(0);
});

test('delay, y, duration map to style vars', () => {
  render(
    <Reveal delay={120} y={20} duration={700}>
      content
    </Reveal>,
  );
  const el = screen.getByText('content');
  expect(el.style.getPropertyValue('--weelp-motion-delay')).toBe('120ms');
  expect(el.style.getPropertyValue('--weelp-fade-up-y')).toBe('20px');
  expect(el.style.getPropertyValue('--weelp-motion-duration')).toBe('700ms');
});

test('renders custom element via `as`', () => {
  render(<Reveal as="section">content</Reveal>);
  expect(screen.getByText('content').tagName).toBe('SECTION');
});
