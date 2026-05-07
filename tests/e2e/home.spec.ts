import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('renders header, nav and a featured article', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle('GotoBurg');
    await expect(page.getByRole('heading', { level: 1, name: 'GotoBurg' })).toBeVisible();
    await expect(page.getByText('Det senaste från wetcoasten')).toBeVisible();

    await expect(page.getByRole('link', { name: 'Utforska Staden' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Mat & Dryck' }).first()).toBeVisible();

    const articleHeadings = page.locator('main h2.font-serif');
    await expect(articleHeadings.first()).toBeVisible();
    expect(await articleHeadings.count()).toBeGreaterThan(0);

    await expect(page.getByText('Senaste nytt')).toBeVisible();
    await expect(page.getByText('Just nu')).toBeVisible();
  });

  test('clicking the featured article navigates to its article page', async ({ page }) => {
    await page.goto('/');

    const featuredHeading = page.locator('main h2.font-serif').first();
    const titleText = (await featuredHeading.textContent())?.trim();
    expect(titleText, 'expected at least one article on the home page').toBeTruthy();

    await featuredHeading.click();

    await expect(page).toHaveURL(/#\/[^/]+/);
    await expect(page.getByRole('heading', { level: 1, name: titleText! })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Hem' })).toBeVisible();
  });

  test('category filter via query string narrows the feed', async ({ page }) => {
    await page.goto('/#/?category=Mat%20%26%20Dryck');

    const categoryLabels = page.locator('[data-testid="article-category"]');
    await expect(categoryLabels.first()).toBeVisible();

    const labels = await categoryLabels.allTextContents();
    expect(labels.length).toBeGreaterThan(0);
    for (const label of labels) {
      expect(label.trim()).toBe('Mat & Dryck');
    }
  });
});
