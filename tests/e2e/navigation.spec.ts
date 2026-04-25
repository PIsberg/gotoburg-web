import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('header logo returns to the home page from an article', async ({ page }) => {
    await page.goto('/');
    await page.locator('main a[href^="#/"]').first().click();
    await expect(page.getByText('Läs också')).toBeVisible();

    await page.getByRole('link', { name: 'GotoBurg' }).click();

    await expect(page).toHaveURL(/#\/$/);
    await expect(page.getByText('Senaste nytt')).toBeVisible();
  });

  test('explore link routes to the explore page', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Utforska Staden' }).click();

    await expect(page).toHaveURL(/#\/explore$/);
    await expect(page.getByRole('heading', { name: 'Utforska Staden' })).toBeVisible();
    await expect(
      page.getByText('Här kan du se var våra artiklar utspelar sig.')
    ).toBeVisible();
  });

  test('footer category link filters the home page', async ({ page }) => {
    await page.goto('/');

    await page.locator('footer').getByRole('link', { name: 'Kultur' }).click();

    await expect(page).toHaveURL(/category=Kultur/);
  });
});
