import { StrictMode } from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
import AboutFAQ from '../AboutFAQ';
import FaqJourneyAnimation, { COMPACT_ROAD_PATH, DESKTOP_ROAD_PATH } from '../FaqJourneyAnimation';

const originalObserver = Object.getOwnPropertyDescriptor(global, 'IntersectionObserver');
let observer;
let observers;

beforeEach(() => {
  observer = undefined;
  observers = [];
  global.IntersectionObserver = class MockIntersectionObserver {
    constructor(callback, options) {
      this.callback = callback;
      this.options = options;
      this.observe = jest.fn();
      this.disconnect = jest.fn();
      observer = this;
      observers.push(this);
    }
  };
});

afterEach(() => {
  cleanup();
  if (originalObserver) Object.defineProperty(global, 'IntersectionObserver', originalObserver);
  else delete global.IntersectionObserver;
});

test('renders a static decorative journey scene without media elements', () => {
  const { container } = render(<FaqJourneyAnimation />);
  const scene = screen.getByTestId('about-faq-background-image');
  const svg = screen.getByTestId('about-faq-journey-svg');

  expect(scene).toHaveAttribute('data-motion', 'static');
  expect(scene).toHaveAttribute('aria-hidden', 'true');
  expect(svg).toHaveAttribute('aria-hidden', 'true');
  expect(svg).toHaveAttribute('focusable', 'false');
  expect(svg).toHaveAttribute('viewBox', '0 0 1600 560');
  expect(svg).toHaveAttribute('preserveAspectRatio', 'xMidYMid slice');
  const roads = screen.getAllByTestId('about-faq-journey-road');
  const reveals = screen.getAllByTestId('about-faq-journey-road-reveal');
  const roadContracts = [
    { maskId: 'faq-journey-road-mask-desktop', path: DESKTOP_ROAD_PATH },
    { maskId: 'faq-journey-road-mask-compact', path: COMPACT_ROAD_PATH },
  ];

  expect(container.querySelectorAll('mask')).toHaveLength(2);
  expect(roads).toHaveLength(2);
  expect(reveals).toHaveLength(2);
  expect(container.querySelectorAll('[data-journey-element="car"]')).toHaveLength(2);
  expect(container.querySelectorAll('[data-journey-element="pin"]')).toHaveLength(2);

  for (const { maskId, path } of roadContracts) {
    const mask = container.querySelector(`mask#${maskId}`);
    const road = container.querySelector(`g[data-testid="about-faq-journey-road"][mask="url(#${maskId})"]`);
    const reveal = mask?.querySelector('path[data-testid="about-faq-journey-road-reveal"]');
    const roadLayers = road ? [...road.children].filter((child) => child.tagName.toLowerCase() === 'path') : [];
    const divider = roadLayers.find((layer) => layer.classList.contains('faqJourneyRoadDivider'));

    expect(mask).toBeInTheDocument();
    expect(road).toBeInTheDocument();
    expect(reveal).toBeInTheDocument();
    expect(reveal).toHaveAttribute('pathLength', '1');
    expect(reveal).toHaveAttribute('d', path);
    expect(roadLayers).toHaveLength(3);
    for (const layer of roadLayers) expect(layer).toHaveAttribute('d', path);
    expect(divider).toHaveAttribute('pathLength', '1');
  }

  expect(screen.getByTestId('about-faq-journey-car-desktop')).toHaveStyle({
    '--faq-journey-car-path': `path("${DESKTOP_ROAD_PATH}")`,
  });
  expect(screen.getByTestId('about-faq-journey-car-compact')).toHaveStyle({
    '--faq-journey-car-path': `path("${COMPACT_ROAD_PATH}")`,
  });
  expect(DESKTOP_ROAD_PATH).toBe('M112 488C326 370 456 488 671 399C873 316 998 422 1185 377C1257 342 1310 355 1360 395');
  expect(COMPACT_ROAD_PATH).toBe('M585 474C680 426 737 456 802 420C846 396 879 393 900 395');
  expect(screen.getByTestId('about-faq-journey-pin-desktop')).toHaveAttribute('transform', 'translate(1360 273)');
  expect(screen.getByTestId('about-faq-journey-pin-compact')).toHaveAttribute('transform', 'translate(900 273)');
  expect(scene.querySelector('a,button,input,select,textarea,[tabindex]')).not.toBeInTheDocument();
  expect(container.querySelector('video')).not.toBeInTheDocument();
  expect(container.querySelector('img')).not.toBeInTheDocument();
  expect(observer.options).toEqual({ rootMargin: '160px 0px', threshold: 0.05 });
  expect(observer.observe).toHaveBeenCalledWith(scene);
});

test('paints each arrived car above its destination pin', () => {
  render(<FaqJourneyAnimation />);

  for (const variant of ['desktop', 'compact']) {
    const pin = screen.getByTestId(`about-faq-journey-pin-${variant}`);
    const car = screen.getByTestId(`about-faq-journey-car-${variant}`);

    expect(pin.compareDocumentPosition(car) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  }
});

test('runs near the viewport, pauses outside it, and disconnects on unmount', () => {
  const { unmount } = render(<FaqJourneyAnimation />);
  const scene = screen.getByTestId('about-faq-background-image');

  act(() => observer.callback([{ isIntersecting: true }]));
  expect(scene).toHaveAttribute('data-motion', 'running');

  act(() => observer.callback([{ isIntersecting: false }]));
  expect(scene).toHaveAttribute('data-motion', 'paused');

  unmount();
  expect(observer.disconnect).toHaveBeenCalledTimes(1);
});

test('keeps the completed static fallback when IntersectionObserver is unavailable', () => {
  delete global.IntersectionObserver;

  render(<FaqJourneyAnimation />);

  expect(screen.getByTestId('about-faq-background-image')).toHaveAttribute('data-motion', 'static');
});

test('keeps the completed static fallback when observation setup fails', () => {
  global.IntersectionObserver = class FailingIntersectionObserver {
    constructor() {
      throw new Error('Observer setup failed');
    }
  };

  expect(() => render(<FaqJourneyAnimation />)).not.toThrow();
  expect(screen.getByTestId('about-faq-background-image')).toHaveAttribute('data-motion', 'static');
});

test('ignores stale observer callbacks after StrictMode replaces the effect', () => {
  render(
    <StrictMode>
      <FaqJourneyAnimation />
    </StrictMode>,
  );

  expect(observers).toHaveLength(2);
  const [staleObserver, activeObserver] = observers;
  const scene = screen.getByTestId('about-faq-background-image');

  expect(staleObserver.disconnect).toHaveBeenCalledTimes(1);
  expect(activeObserver.disconnect).not.toHaveBeenCalled();
  expect(activeObserver.observe).toHaveBeenCalledWith(scene);

  act(() => activeObserver.callback([{ isIntersecting: true }]));
  expect(scene).toHaveAttribute('data-motion', 'running');

  act(() => staleObserver.callback([{ isIntersecting: false }]));
  expect(scene).toHaveAttribute('data-motion', 'running');
});

test('changes journey motion without remounting the FAQ content', () => {
  render(<AboutFAQ />);
  const content = screen.getByTestId('about-faq-content');
  const firstTrigger = screen.getByRole('button', { name: 'Which destinations does Weelp cover?' });
  const roads = screen.getAllByTestId('about-faq-journey-road');
  const cars = [...document.querySelectorAll('[data-journey-element="car"]')];
  const pins = [...document.querySelectorAll('[data-journey-element="pin"]')];

  act(() => observer.callback([{ isIntersecting: true }]));
  act(() => observer.callback([{ isIntersecting: false }]));
  act(() => observer.callback([{ isIntersecting: true }]));

  expect(screen.getByTestId('about-faq-content')).toBe(content);
  expect(screen.getByRole('button', { name: 'Which destinations does Weelp cover?' })).toBe(firstTrigger);
  const currentRoads = screen.getAllByTestId('about-faq-journey-road');
  const currentCars = [...document.querySelectorAll('[data-journey-element="car"]')];
  const currentPins = [...document.querySelectorAll('[data-journey-element="pin"]')];

  expect(currentRoads).toHaveLength(roads.length);
  expect(currentCars).toHaveLength(cars.length);
  expect(currentPins).toHaveLength(pins.length);
  currentRoads.forEach((road, index) => expect(road).toBe(roads[index]));
  currentCars.forEach((car, index) => expect(car).toBe(cars[index]));
  currentPins.forEach((pin, index) => expect(pin).toBe(pins[index]));
});
