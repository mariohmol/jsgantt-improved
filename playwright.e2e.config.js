// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './dist-e2e',
  timeout: 30000,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: process.env.JSGANTT_E2E_BASE_URL ?? 'http://localhost:8080',
    headless: true,
    viewport: { width: 1400, height: 900 },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
