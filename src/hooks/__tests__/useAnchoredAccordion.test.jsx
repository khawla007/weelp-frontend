import { act, renderHook } from '@testing-library/react';

import { useAnchoredAccordion } from '../useAnchoredAccordion';

const originalCancelAnimationFrame = window.cancelAnimationFrame;
const originalMatchMedia = window.matchMedia;
const originalRequestAnimationFrame = window.requestAnimationFrame;
const originalScrollBy = window.scrollBy;

describe('useAnchoredAccordion', () => {
  let animationFrames;
  let now;

  beforeEach(() => {
    animationFrames = [];
    now = 0;
    jest.spyOn(performance, 'now').mockImplementation(() => now);
    window.requestAnimationFrame = jest.fn((callback) => {
      animationFrames.push(callback);
      return animationFrames.length;
    });
    window.cancelAnimationFrame = jest.fn();
    window.scrollBy = jest.fn();
    window.matchMedia = jest.fn(() => ({ matches: false }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    window.cancelAnimationFrame = originalCancelAnimationFrame;
    window.matchMedia = originalMatchMedia;
    window.requestAnimationFrame = originalRequestAnimationFrame;
    window.scrollBy = originalScrollBy;
  });

  const runNextFrame = (elapsed) => {
    now = elapsed;
    const callback = animationFrames.shift();
    act(() => callback());
  };

  it('keeps correcting the trigger position for the full transition', () => {
    const trigger = {
      getBoundingClientRect: jest
        .fn()
        .mockReturnValueOnce({ top: 320 })
        .mockReturnValueOnce({ top: 300 })
        .mockReturnValueOnce({ top: 300 })
        .mockReturnValueOnce({ top: 300 })
        .mockReturnValueOnce({ top: 320 }),
      isConnected: true,
    };
    const { result } = renderHook(() => useAnchoredAccordion(['first', 'second'], 0));

    act(() => result.current[1](1, trigger));
    runNextFrame(100);
    runNextFrame(200);
    runNextFrame(300);
    runNextFrame(350);

    expect(window.scrollBy).toHaveBeenNthCalledWith(1, { top: -20, left: 0, behavior: 'instant' });
    expect(window.scrollBy).toHaveBeenNthCalledWith(2, { top: -20, left: 0, behavior: 'instant' });
    expect(window.scrollBy).toHaveBeenNthCalledWith(3, { top: -20, left: 0, behavior: 'instant' });
    expect(animationFrames).toHaveLength(0);
  });

  it('cancels an active correction when another item is toggled', () => {
    const trigger = {
      getBoundingClientRect: jest.fn(() => ({ top: 320 })),
      isConnected: true,
    };
    const { result } = renderHook(() => useAnchoredAccordion(['first', 'second'], 0));

    act(() => result.current[1](1, trigger));
    act(() => result.current[1](0, trigger));

    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(1);
  });

  it('cancels an active correction when the accordion unmounts', () => {
    const trigger = {
      getBoundingClientRect: jest.fn(() => ({ top: 320 })),
      isConnected: true,
    };
    const { result, unmount } = renderHook(() => useAnchoredAccordion(['first', 'second'], 0));

    act(() => result.current[1](1, trigger));
    unmount();

    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(1);
  });

  it('stops correcting when the clicked trigger disconnects', () => {
    const trigger = {
      getBoundingClientRect: jest.fn(() => ({ top: 320 })),
      isConnected: false,
    };
    const { result } = renderHook(() => useAnchoredAccordion(['first', 'second'], 0));

    act(() => result.current[1](1, trigger));
    runNextFrame(100);

    expect(window.scrollBy).not.toHaveBeenCalled();
    expect(animationFrames).toHaveLength(0);
  });

  it('uses one position correction when reduced motion is requested', () => {
    window.matchMedia = jest.fn(() => ({ matches: true }));
    const trigger = {
      getBoundingClientRect: jest.fn().mockReturnValueOnce({ top: 320 }).mockReturnValueOnce({ top: 260 }),
      isConnected: true,
    };
    const { result } = renderHook(() => useAnchoredAccordion(['first', 'second'], 0));

    act(() => result.current[1](1, trigger));
    runNextFrame(0);

    expect(window.scrollBy).toHaveBeenCalledTimes(1);
    expect(animationFrames).toHaveLength(0);
  });
});
