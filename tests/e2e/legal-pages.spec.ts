import { test, expect } from '@playwright/test';

const PAGES = [
  { path: '/om-oss', heading: 'Om GotoBurg', marker: 'Så arbetar vi med innehållet' },
  { path: '/kontakt', heading: 'Kontakta oss', marker: 'Tipsa redaktionen' },
  { path: '/integritetspolicy', heading: 'Integritetspolicy och cookies', marker: 'Personuppgiftsansvarig' },
  { path: '/villkor', heading: 'Användarvillkor', marker: 'Upphovsrätt' },
];

test.describe('Static pages', () => {
  for (const { path, heading, marker } of PAGES) {
    test(`${path} renders its own content, not the article catch-all`, async ({ page }) => {
      await page.goto(`/#${path}`);

      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
      await expect(page.getByRole('heading', { level: 2, name: marker })).toBeVisible();

      // /:slug would render ArticlePage's not-found state for these paths.
      await expect(page.getByText('Sidan hittades inte')).toHaveCount(0);
    });
  }

  const FOOTER_LINKS = [
    { name: 'Om GotoBurg', url: /#\/om-oss$/, heading: 'Om GotoBurg' },
    { name: 'Kontakta oss', url: /#\/kontakt$/, heading: 'Kontakta oss' },
    { name: 'Integritetspolicy', url: /#\/integritetspolicy$/, heading: 'Integritetspolicy och cookies' },
    { name: 'Användarvillkor', url: /#\/villkor$/, heading: 'Användarvillkor' },
  ];

  for (const { name, url, heading } of FOOTER_LINKS) {
    test(`footer link "${name}" reaches its page`, async ({ page }) => {
      await page.goto('/');

      await page.locator('footer').getByRole('link', { name, exact: true }).click();

      await expect(page).toHaveURL(url);
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    });
  }

  test('the privacy page discloses the AdSense and Analytics ids in use', async ({ page }) => {
    await page.goto('/#/integritetspolicy');

    await expect(page.getByText('ca-pub-2203695397498260')).toBeVisible();
    await expect(page.getByText('G-E8GTTBK08V')).toBeVisible();
  });
});
