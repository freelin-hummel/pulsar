import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: true,
    // BlockSuite's Lit custom elements trigger async rendering via
    // requestAnimationFrame that touches Canvas/WebGL APIs unavailable
    // in jsdom. These unhandled errors don't affect test correctness
    // but cause vitest to report false failures.
    dangerouslyIgnoreUnhandledErrors: true,
  },
})
