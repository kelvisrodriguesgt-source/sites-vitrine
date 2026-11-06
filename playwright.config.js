import { defineConfig, devices } from '@playwright/test';

// No CI o Playwright baixa o próprio Chromium. Localmente, PW_CHROMIUM_PATH aponta para um já instalado.
const launchOptions = process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {};

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'reports/playwright' }]],
  use: { launchOptions, trace: 'retain-on-failure' },
  webServer: [
    { command: 'node tools/serve.mjs grupo-kr-motion 4311', port: 4311, reuseExistingServer: !process.env.CI },
    { command: 'node tools/serve.mjs grupo-kr 4312', port: 4312, reuseExistingServer: !process.env.CI }
  ],
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], launchOptions } },
    { name: 'mobile', use: { ...devices['Pixel 5'], launchOptions } }
  ]
});
