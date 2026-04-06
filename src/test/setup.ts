import '@testing-library/jest-dom/vitest'

// jsdom does not implement ResizeObserver; stub it for WebGLManager tests
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof globalThis.ResizeObserver
}
