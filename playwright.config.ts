import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['github']] : 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
    // Pre-answer the cookie banner so it does not sit over the footer and
    // swallow clicks. consent.spec.ts opts back out to exercise the banner.
    storageState: {
      cookies: [],
      origins: [
        {
          origin: baseURL,
          localStorage: [{ name: 'gotoburg:consent', value: 'granted' }],
        },
      ],
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // Not `vite preview`: it serves the SPA fallback index.html for every path,
    // so the per-route HTML from scripts/prerender.mjs is never exercised and
    // tests/e2e/seo.spec.ts would pass against a completely broken prerender.
    // scripts/serve-dist.mjs resolves URLs the way Netlify does.
    command: `npm run build && npm run serve -- ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
