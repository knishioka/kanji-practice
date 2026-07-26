import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: '**/production.spec.ts',
    },
    {
      name: 'production-chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:4173/kanji-practice/',
      },
      testMatch: '**/production.spec.ts',
    },
  ],
  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    {
      command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173',
      url: 'http://localhost:4173/kanji-practice/',
      reuseExistingServer: false,
      timeout: 120000,
    },
  ],
});
