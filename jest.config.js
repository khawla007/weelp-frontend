import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  coverageProvider: 'v8',
  // Next 16's unhandled-rejection instrumentation accumulates listeners
  // across test files on Node 23, causing a recursive setImmediate stack
  // overflow during teardown. forceExit short-circuits teardown after
  // tests finish so the hook doesn't see a non-zero exit.
  forceExit: true,
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig);
