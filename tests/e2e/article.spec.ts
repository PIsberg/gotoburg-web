import { test, expect } from '@playwright/test';

test.describe('Article page', () => {
  test('unknown slug shows the not-found view', async ({ page }) => {
    await page.goto('/this-slug-definitely-does-not-exist');

    await expect(page.getByRole('heading', { name: 'Sidan hittades inte' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Till startsidan' })).toBeVisible();
  });

  test('not-found page links back to home', async ({ page }) => {
    await page.goto('/another-missing-article');

    await page.getByRole('link', { name: 'Till startsidan' }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText('Senaste nytt')).toBeVisible();
  });

  test('first home article opens with related articles sidebar', async ({ page }) => {
    await page.goto('/');

    const firstCardLink = page.locator('main a[href^="/"]').first();
    await firstCardLink.click();

    await expect(page.getByRole('link', { name: 'Hem' })).toBeVisible();
    await expect(page.getByText('Läs också')).toBeVisible();
  });
});

/**
 * Article.content entries are plain strings, so the only way an article body can
 * carry a link is the [etikett](href) form that Block in pages/ArticlePage.tsx
 * interprets. Before that existed the syntax shipped verbatim, brackets and all.
 * Asserted against the prerendered HTML rather than the hydrated page: a link in
 * the body is only worth anything to a crawler if it is in the served markup.
 */
test.describe('Inline links in the article body', () => {
  const SLUG = '/masthuggskajen-ny-stadsdel-goteborg-alvstranden';

  test('an external link renders as an anchor, not as markdown source', async ({ page }) => {
    const response = await page.request.get(SLUG);
    expect(response.status(), `GET ${SLUG}`).toBe(200);
    const html = await response.text();

    expect(html).toContain('href="https://masthuggskajen.se/"');
    expect(html).toContain('projektets egen sajt masthuggskajen.se');
    expect(html).not.toContain('](https://masthuggskajen.se/)');
  });

  test('the external link opens in a new tab with a safe rel', async ({ page }) => {
    await page.goto(SLUG);

    const link = page.getByRole('link', { name: 'projektets egen sajt masthuggskajen.se' });

    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', 'https://masthuggskajen.se/');
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
