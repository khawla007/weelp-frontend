import { render, act } from '@testing-library/react';

import AnimatedGlobe from '../AnimatedGlobe';

// AnimatedGlobe already gates the heavy modules (cobe + tsparticles-backed
// GlobeSparkles) behind `isActive`. These tests cover the viewport activation
// path: with `activateOnVisible`, isActive must stay false until an
// IntersectionObserver reports the globe near the viewport.

describe('AnimatedGlobe activateOnVisible', () => {
  let ioCallback;
  let observeSpy;
  let disconnectSpy;

  beforeEach(() => {
    ioCallback = null;
    observeSpy = jest.fn();
    disconnectSpy = jest.fn();

    global.IntersectionObserver = class {
      constructor(cb) {
        ioCallback = cb;
      }

      observe(...args) {
        observeSpy(...args);
      }

      disconnect() {
        disconnectSpy();
      }
    };
  });

  afterEach(() => {
    delete global.IntersectionObserver;
  });

  it('stays inactive until the globe scrolls near the viewport', () => {
    const { container } = render(<AnimatedGlobe activateOnVisible />);

    // Observer wired to the globe root; sparkles (isActive proxy) not yet mounted.
    expect(observeSpy).toHaveBeenCalledTimes(1);
    expect(container.querySelector('[data-personalised-sparkles]')).not.toBeInTheDocument();

    act(() => {
      ioCallback([{ isIntersecting: true, boundingClientRect: { top: 120 } }], { disconnect: disconnectSpy });
    });

    // Now active: sparkles mounted and the one-shot observer torn down.
    expect(container.querySelector('[data-personalised-sparkles]')).toBeInTheDocument();
    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('activates immediately when activateOnVisible is not set (default unchanged)', () => {
    const { container } = render(<AnimatedGlobe />);

    expect(observeSpy).not.toHaveBeenCalled();
    expect(container.querySelector('[data-personalised-sparkles]')).toBeInTheDocument();
  });
});
