import { test, expect } from '@playwright/test';

test.describe('Article page', () => {
  test('unknown slug shows the not-found view', async ({ page }) => {
    await page.goto('/#/this-slug-definitely-does-not-exist');

    await expect(page.getByRole('heading', { name: 'Sidan hittades inte' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Till startsidan' })).toBeVisible();
  });

  test('not-found page links back to home', async ({ page }) => {
    await page.goto('/#/another-missing-article');

    await page.getByRole('link', { name: 'Till startsidan' }).click();

    await expect(page).toHaveURL(/#\/$/);
    await expect(page.getByText('Senaste nytt')).toBeVisible();
  });

  test('first home article opens with related articles sidebar', async ({ page }) => {
    await page.goto('/');

    const firstCardLink = page.locator('main a[href^="#/"]').first();
    await firstCardLink.click();

    await expect(page.getByRole('link', { name: 'Hem' })).toBeVisible();
    await expect(page.getByText('Läs också')).toBeVisible();
  });
});
