import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  reporter: [['list']],
  testDir: './e2e',
  timeout: 60_000,
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run start -- --host 127.0.0.1',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: 'http://127.0.0.1:5173',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
