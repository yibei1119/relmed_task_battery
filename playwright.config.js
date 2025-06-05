// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './validation/playwright',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 12,
  reporter: process.env.CI ? [['blob'], ['github']] : 'html',
  
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'RELMED simulation',
      testMatch: /.*simulate_test\.spec\.js/,
      use: {
        baseURL: 'http://127.0.0.1:3000',
      }
    },
    {
      name: 'RELMED loading tests',
      testMatch: /.*load_test\.spec\.js/,
      // No baseURL - uses external site
    }
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run start',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes timeout
    stdout: 'ignore',
    stderr: 'pipe',
  }
});