import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { transform } from '@swc/core'

/**
 * Vite plugin that uses SWC to transform Pulsar editor source files.
 * The editor codebase uses TC39 stage-3 decorators (`accessor` keyword,
 * standard `@decorator` syntax) which esbuild cannot parse. SWC handles them.
 */
function pulsarSwcPlugin() {
  return {
    name: 'pulsar-swc',
    enforce: 'pre' as const,
    async transform(code: string, id: string) {
      // Only transform editor .ts files under packages/blocksuite/ (not .tsx, not node_modules)
      if (!id.includes('packages/blocksuite/') || !id.match(/\.ts$/)) return
      const result = await transform(code, {
        filename: id,
        sourceMaps: true,
        jsc: {
          parser: {
            syntax: 'typescript',
            decorators: true,
          },
          transform: {
            legacyDecorator: false,
            decoratorVersion: '2022-03',
            useDefineForClassFields: false,
          },
          target: 'es2022',
        },
      })
      return { code: result.code, map: result.map }
    },
  }
}

export default defineConfig({
  plugins: [pulsarSwcPlugin(), react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:6420',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:6420',
        ws: true,
      },
    },
  },
})
