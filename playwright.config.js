// playwright.config.js
// This file controls HOW Playwright runs your tests: which browsers, what
// timeouts, how many retries, what evidence to collect, and where reports go.
// Everything here is deliberately kept simple enough to explain line-by-line
// in an interview.

const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config();

module.exports = defineConfig({
  // Where Playwright should look for test files.
  testDir: './tests',

  // Maximum time one test is allowed to run before it's marked as failed.
  timeout: 30 * 1000,

  // Timeout for each individual expect() assertion (e.g. toBeVisible()).
  expect: {
    timeout: 5000,
  },

  // Fail the build if someone accidentally leaves `.only` in a test file
  // when running in CI. This stops a whole suite from being silently skipped.
  forbidOnly: !!process.env.CI,

  // Retries: locally we don't retry (we want to see real failures).
  // On CI, network/environment hiccups are more common on shared demo sites,
  // so we retry once to reduce false negatives before we investigate.
  retries: process.env.CI ? 1 : 0,

  // Workers = how many tests run in parallel. CI runners are usually smaller,
  // so we cap workers there but let Playwright use more locally.
  workers: process.env.CI ? 2 : undefined,

  // Reporters: 'html' generates the interactive HTML report + trace links.
  // 'list' prints readable pass/fail output straight into the terminal.
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['list'],
  ],

  use: {
    // Base URL lets every test call page.goto('/login') instead of typing
    // the full domain every time. Pulled from .env so it's easy to swap
    // environments (see README > "Adapting to a different demo site").
    baseURL: process.env.BASE_URL || 'https://automationexercise.com',

    // 'on-first-retry' captures a trace ONLY when a test fails and is
    // retried — this keeps CI fast while still giving us debugging evidence
    // (DOM snapshots, network calls, console logs) when something breaks.
    trace: 'on-first-retry',

    // Only keep a screenshot when a test actually fails — avoids clutter.
    screenshot: 'only-on-failure',

    // Only keep a video when a test fails and had to be retried.
    video: 'retain-on-failure',

    // Run without a visible browser window by default (faster, CI-friendly).
    // Override with `npm run test:headed` when you want to watch it run.
    headless: true,

    // How long actions (click, fill, etc.) wait for an element before failing.
    actionTimeout: 10 * 1000,
  },

  // Cross-browser coverage: the same test suite runs against Chromium,
  // Firefox and WebKit (Safari's engine) without rewriting a single test.
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
