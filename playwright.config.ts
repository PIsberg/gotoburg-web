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
    env: {
      ...process.env,
      // Pinned so the build always bakes a key in and /explore always takes the
      // load-the-Maps-API path. Without this the value comes from .env.local,
      // which CI does not have; the component then short-circuits on the empty
      // key and renders its fallback, and tests/e2e/renders.spec.ts would assert
      // that /explore survives the map without ever loading a map. That is how
      // the blank-page bug lived in production while CI stayed green.
      //
      // Deliberately not key-shaped. Only two things matter here: that the
      // value is non-empty, so GoogleMapSection does not short-circuit before
      // it loads anything, and that the Maps API rejects it. A realistic
      // `AIza...` string would do both, and would also match the regex GitHub's
      // secret scanning uses, raising a false alert on a repository that
      // already carries a real one for the browser key in the bundle. An alert
      // people learn to ignore is worse than no alert.
      //
      // What is under test is that the page survives whatever the Maps API
      // does, which is the property that broke, not that the map draws. If
      // maps.googleapis.com is unreachable the loader errors and the same
      // fallback renders, so the test cannot flake into a false failure.
      VITE_GOOGLE_MAPS_API_KEY: 'invalid-key-for-tests-do-not-replace',
    },
  },
});
