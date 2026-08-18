import { test, expect, Page } from '@playwright/test';

// The project-level storageState pre-answers the banner. These tests need a
// visitor who has not chosen yet, so opt back out to a clean origin.
test.use({ storageState: { cookies: [], origins: [] } });

const CONSENT_KEY = 'gotoburg:consent';

/** Reads the gtag consent calls queued on dataLayer, oldest first. */
const consentCalls = (page: Page) =>
  page.evaluate(() =>
    ((window as any).dataLayer ?? [])
      .map((entry: any) => Array.from(entry as ArrayLike<unknown>))
      .filter((args: unknown[]) => args[0] === 'consent')
      .map((args: unknown[]) => ({ type: args[1], signals: args[2] }))
  );

const storedChoice = (page: Page) =>
  page.evaluate((key) => localStorage.getItem(key), CONSENT_KEY);

test.describe('Cookie consent', () => {
  test('defaults every ad and analytics signal to denied before any choice', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('cookie-consent')).toBeVisible();

    const calls = await consentCalls(page);
    expect(calls[0]?.type, 'expected a consent default before anything else').toBe('default');
    expect(calls.some((c: any) => c.type === 'update')).toBe(false);
    expect(calls[0].signals).toMatchObject({
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
    });
    expect(await storedChoice(page)).toBeNull();
  });

  test('"Acceptera alla" grants the signals and remembers the choice', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Acceptera alla' }).click();

    await expect(page.getByTestId('cookie-consent')).toHaveCount(0);
    expect(await storedChoice(page)).toBe('granted');

    const update = (await consentCalls(page)).find((c: any) => c.type === 'update');
    expect(update, 'expected a consent update after accepting').toBeTruthy();
    expect(update.signals).toMatchObject({
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted',
    });
  });

  test('"Endast nödvändiga" keeps the signals denied and remembers the choice', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Endast nödvändiga' }).click();

    await expect(page.getByTestId('cookie-consent')).toHaveCount(0);
    expect(await storedChoice(page)).toBe('denied');

    const update = (await consentCalls(page)).find((c: any) => c.type === 'update');
    expect(update, 'expected a consent update after declining').toBeTruthy();
    expect(update.signals).toMatchObject({
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
    });
  });

  test('the choice survives a reload and the banner stays away', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Acceptera alla' }).click();

    await page.reload();

    await expect(page.getByTestId('cookie-consent')).toHaveCount(0);
    expect(await storedChoice(page)).toBe('granted');
  });

  test('the footer link re-opens the banner so consent can be withdrawn', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Acceptera alla' }).click();
    await expect(page.getByTestId('cookie-consent')).toHaveCount(0);

    await page.locator('footer').getByRole('button', { name: 'Cookie-inställningar' }).click();
    await expect(page.getByTestId('cookie-consent')).toBeVisible();

    await page.getByRole('button', { name: 'Endast nödvändiga' }).click();
    expect(await storedChoice(page)).toBe('denied');
  });

  test('the privacy page can re-open the banner too', async ({ page }) => {
    await page.goto('/integritetspolicy');
    await page.getByRole('button', { name: 'Acceptera alla' }).click();
    await expect(page.getByTestId('cookie-consent')).toHaveCount(0);

    await page.getByRole('button', { name: 'Ändra cookie-inställningar' }).click();

    await expect(page.getByTestId('cookie-consent')).toBeVisible();
  });
});
