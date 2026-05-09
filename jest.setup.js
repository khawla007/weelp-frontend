// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Next 16's unhandled-rejection instrumentation registers a listener per
// imported module; on Node 23 this cascades into a stack overflow during
// jest teardown when many suites have been loaded in one process. Disable
// the per-module listener cap so teardown unwinds cleanly.
process.setMaxListeners(0);
