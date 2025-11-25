import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  define: {
    'process.env': {},
  },
  optimizeDeps: {
    force: true,
    include: ['./app/**/*.tsx'],
  },
  test: {
    include: ['**/*.browser.test.tsx'],
    setupFiles: './vitest.browser.setup.ts',
    browser: {
      headless: false,
      enabled: true,
      screenshotFailures: false,
      provider: playwright({
        launchOptions: {
          slowMo: 5000,
        },
      }),
      instances: [{ browser: 'chromium' }],
    },
  },
})
