import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Ensure the DOM is reset between tests even when running with non-global
// test hooks, so queries never leak across cases.
afterEach(() => {
  cleanup();
});
