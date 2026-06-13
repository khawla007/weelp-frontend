// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Next 16's unhandled-rejection instrumentation registers a listener per
// imported module; on Node 23 this cascades into a stack overflow during
// jest teardown when many suites have been loaded in one process. Disable
// the per-module listener cap so teardown unwinds cleanly.
process.setMaxListeners(0);

// next-auth v5 (@auth/core → jose/oauth4webapi/preact) ships ESM-only. In this
// repo's flat node_modules, next/jest's default transformIgnorePatterns only
// transforms `geist`, so every other node_module is left untransformed. Any
// suite that reaches `next-auth/jwt` — directly, or transitively through
// axiosInstance → clientRefresh → logoutAction — therefore crashes the whole
// run with "Unexpected token 'export'". No test needs real JWT crypto in
// jsdom, so stub the module globally here. Suites that assert on these (e.g.
// logoutAction) re-mock locally, which overrides this per file.
jest.mock('next-auth/jwt', () => ({ decode: jest.fn(), encode: jest.fn(), getToken: jest.fn() }));

// jsdom doesn't implement `window.matchMedia`; useIsMobile (and any
// suite that mounts WeelpCalendar) reaches for it on first render.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}
