import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('header logo returns to the home page from an article', async ({ page }) => {
    await page.goto('/');
    await page.locator('main a[href^="/"]').first().click();
    await expect(page.getByText('Läs också')).toBeVisible();

    // getByRole('banner') rather than locator('header'): the footer also links
    // to 'Om GotoBurg', and an article page has a second <header> around the
    // byline, which matches 'GotoBurg' whenever the byline is GotoBurgs redaktion.
    await page.getByRole('banner').getByRole('link', { name: 'GotoBurg' }).click();

    await expect(page).toHaveURL(/localhost:\d+\/$/);
    await expect(page.getByText('Senaste nytt')).toBeVisible();
  });

  test('explore link routes to the explore page', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Utforska Staden' }).click();

    await expect(page).toHaveURL(/\/explore$/);
    await expect(page.getByRole('heading', { name: 'Utforska Staden' })).toBeVisible();
    await expect(
      page.getByText('Här kan du se var våra artiklar utspelar sig.')
    ).toBeVisible();
  });

  test('footer category link reaches the category page', async ({ page }) => {
    await page.goto('/');

    await page.locator('footer').getByRole('link', { name: 'Kultur' }).click();

    await expect(page).toHaveURL(/\/kategori\/kultur$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Kultur i Göteborg' })).toBeVisible();
  });
});
