import { act, render } from '@testing-library/react';

import HeroMotionReady from '../HeroMotionReady';

describe('HeroMotionReady', () => {
  let frames;
  let originalFonts;
  let originalReadyState;
  let originalAnimationFrame;
  let originalCancelAnimationFrame;
  let originalGetAnimations;

  beforeEach(() => {
    jest.useFakeTimers();
    frames = [];
    originalFonts = document.fonts;
    originalReadyState = Object.getOwnPropertyDescriptor(document, 'readyState');
    originalAnimationFrame = window.requestAnimationFrame;
    originalCancelAnimationFrame = window.cancelAnimationFrame;
    originalGetAnimations = window.Element.prototype.getAnimations;

    Object.defineProperty(document, 'readyState', { configurable: true, value: 'complete' });
    Object.defineProperty(document, 'fonts', { configurable: true, value: { ready: Promise.resolve() } });
    window.requestAnimationFrame = jest.fn((callback) => {
      frames.push(callback);
      return frames.length;
    });
    window.cancelAnimationFrame = jest.fn();
    window.Element.prototype.getAnimations = jest.fn(() => []);
    jest.spyOn(performance, 'now').mockReturnValue(10000);
  });

  afterEach(() => {
    Object.defineProperty(document, 'fonts', { configurable: true, value: originalFonts });
    if (originalReadyState) Object.defineProperty(document, 'readyState', originalReadyState);
    window.requestAnimationFrame = originalAnimationFrame;
    window.cancelAnimationFrame = originalCancelAnimationFrame;
    if (originalGetAnimations) window.Element.prototype.getAnimations = originalGetAnimations;
    else delete window.Element.prototype.getAnimations;
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  const renderGate = () =>
    render(
      <section data-home-hero data-home-hero-motion="pending">
        <HeroMotionReady />
      </section>,
    );

  it('starts the hero choreography only after load, fonts, a settle window, and two painted frames', async () => {
    const { container } = renderGate();
    const hero = container.querySelector('[data-home-hero]');
    const controller = container.querySelector('[data-home-hero-motion-controller]');

    expect(controller).toHaveAttribute('hidden');
    expect(controller).toHaveAttribute('aria-hidden', 'true');
    expect(hero).toHaveAttribute('data-home-hero-motion', 'pending');
    await act(async () => Promise.resolve());
    expect(frames).toHaveLength(0);

    act(() => jest.advanceTimersByTime(150));
    expect(frames).toHaveLength(1);
    act(() => frames.shift()(16));
    expect(hero).toHaveAttribute('data-home-hero-motion', 'pending');
    act(() => frames.shift()(32));
    expect(hero).toHaveAttribute('data-home-hero-motion', 'ready');
  });

  it('keeps fallback terminal when fonts become ready after the five-second deadline', async () => {
    let resolveFonts;
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { ready: new Promise((resolve) => (resolveFonts = resolve)) },
    });

    const { container } = renderGate();
    const hero = container.querySelector('[data-home-hero]');

    act(() => jest.advanceTimersByTime(5000));
    expect(hero).toHaveAttribute('data-home-hero-motion', 'fallback');

    await act(async () => resolveFonts());
    act(() => jest.advanceTimersByTime(150));
    expect(frames).toHaveLength(0);
    expect(hero).toHaveAttribute('data-home-hero-motion', 'fallback');
  });

  it('detects a descendant fallback that finished before hydration', async () => {
    window.Element.prototype.getAnimations.mockReturnValue([{ animationName: 'weelpHomeHeroMotionFallback', playState: 'finished' }]);

    const { container } = renderGate();
    const hero = container.querySelector('[data-home-hero]');

    expect(window.Element.prototype.getAnimations).toHaveBeenCalledWith({ subtree: true });
    expect(hero).toHaveAttribute('data-home-hero-motion', 'fallback');
    await act(async () => Promise.resolve());
    act(() => jest.advanceTimersByTime(5000));
    expect(frames).toHaveLength(0);
    expect(hero).toHaveAttribute('data-home-hero-motion', 'fallback');
  });

  it('cancels scheduled frames when the controller unmounts', async () => {
    const { unmount } = renderGate();

    await act(async () => Promise.resolve());
    act(() => jest.advanceTimersByTime(150));
    expect(frames).toHaveLength(1);

    unmount();
    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(1);
  });
});
