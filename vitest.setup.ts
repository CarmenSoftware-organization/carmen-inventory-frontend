import "@testing-library/jest-dom/vitest";

// Polyfill ResizeObserver for Radix UI components
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
