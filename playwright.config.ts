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
    // No env pin any more. The Google Maps era needed VITE_GOOGLE_MAPS_API_KEY
    // forced here so CI, which has no .env.local, would still exercise the
    // load-the-Maps-API path instead of short-circuiting on an empty key; the
    // Leaflet map has no key to short-circuit on, so every build takes the same
    // path and tests/e2e/renders.spec.ts asserts the map actually draws.
  },
});
