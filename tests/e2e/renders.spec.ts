import { test, expect } from '@playwright/test';

import { ADSENSE_CONFIG, ARTICLES } from '../../src/constants';
import { CATEGORIES, categoryPath, countByCategory } from '../../src/categories';
import { MIN_ARTICLES_TO_INDEX_CATEGORY } from '../../src/seo';

/**
 * The counterpart to seo.spec.ts, which asserts the served HTML using
 * page.request and therefore never runs a line of JavaScript. That blind spot
 * was not theoretical: production served /explore, the first link in the main
 * nav, as a completely blank white page from the day the map code shipped,
 * because `google.maps.Map is not a constructor` escaped an effect and React
 * unmounted the tree. The prerendered HTML was perfect the whole time, so every
 * check in the suite stayed green.
 *
 * Everything here therefore drives a real browser and asserts what a visitor,
 * or an AdSense policy reviewer, actually sees.
 */

const ROUTES = [
  '/',
  '/explore',
  '/om-oss',
  '/kontakt',
  '/redaktionen',
  '/bildkredit',
  '/integritetspolicy',
  '/villkor',
  ...CATEGORIES.filter(c => countByCategory(ARTICLES, c.name) > 0).map(c => categoryPath(c.name)),
  '/' + ARTICLES[0].slug,
];

test.describe('Every route paints something in a real browser', () => {
  for (const route of ROUTES) {
    test(`${route} renders content and throws nothing`, async ({ page }) => {
      const crashes: string[] = [];
      page.on('pageerror', err => crashes.push(err.message));

      await page.goto(route);
      await page.waitForLoadState('networkidle');
      // networkidle can be reached before code that runs after mount has run.
      // The Google Maps loader was exactly that, and the Leaflet chunk /explore
      // now imports inside an effect is the same shape: without this wait the
      // page still holds its prerendered markup at assertion time and goes
      // blank a moment later, so this test passed against the very bug it
      // exists to catch.
      await page.waitForTimeout(2000);

      // The header is outside every route's own component, so if it is missing
      // the whole tree came down rather than one section failing.
      await expect(page.getByRole('banner')).toBeVisible();

      const text = (await page.locator('main').innerText()).trim();
      expect(text.length, `${route} rendered ${text.length} chars of body text`).toBeGreaterThan(100);

      expect(crashes, `${route} threw: ${crashes.join(' | ')}`).toEqual([]);
    });
  }
});

test.describe('The map draws, and cannot take the page down with it', () => {
  const withCoordinates = ARTICLES.filter(a => /@-?\d+\.\d+,-?\d+\.\d+/.test(a.googleMapsUrl || ''));

  test('/explore lists its places whether or not the map draws', async ({ page }) => {
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // The places are the actual content of the page and the map is an
    // enhancement. That division of labour predates the Leaflet swap, and it
    // stays: a map failure must never take the list with it.
    await expect(page.getByRole('heading', { name: /Platser vi har skrivit om/i })).toBeVisible();

    expect(withCoordinates.length).toBeGreaterThan(0);
    await expect(page.getByRole('link', { name: withCoordinates[0].title })).toBeVisible();
  });

  test('/explore draws the Leaflet map with one marker per mapped place', async ({ page }) => {
    // Under Google Maps this assertion was impossible: the Cloud project had no
    // billing, the API refused to draw, and the suite could only prove the page
    // survived the wreck. Leaflet has no key and no billing to fail on, so a
    // map that does not draw is a plain regression from here on.
    await page.goto('/explore');

    await expect(page.locator('.leaflet-container')).toBeVisible();
    await expect(page.locator('.leaflet-marker-icon')).toHaveCount(withCoordinates.length);

    // The attribution control is an OpenStreetMap licence term (ODbL), not
    // styling. Removing it is a compliance bug.
    await expect(page.locator('.leaflet-control-attribution')).toContainText('OpenStreetMap');
  });

  test('the page survives the tile server being unreachable', async ({ page }) => {
    // Tiles come from tile.openstreetmap.org at runtime. If it is down the
    // canvas stays grey, but the markers are DOM nodes of our own and the rest
    // of the page must be untouched — the analogue of the old requirement that
    // a Google loader failure could not blank the route.
    await page.route('https://tile.openstreetmap.org/**', route => route.abort());

    const crashes: string[] = [];
    page.on('pageerror', err => crashes.push(err.message));

    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.leaflet-container')).toBeVisible();
    await expect(page.locator('.leaflet-marker-icon')).toHaveCount(withCoordinates.length);
    await expect(page.getByRole('heading', { name: /Platser vi har skrivit om/i })).toBeVisible();
    // The fallback panel is for a map that failed to initialise. Unreachable
    // tiles are not that, and must not swap a working marker map for an excuse.
    await expect(page.getByText('Kartan kan inte visas just nu')).toHaveCount(0);
    expect(crashes, `/explore threw: ${crashes.join(' | ')}`).toEqual([]);
  });
});

test.describe('No ad slot reserves space it cannot fill', () => {
  // Placeholder ids like `header-banner-12345` shipped for months. AdSense
  // reserves layout height for an <ins> it cannot fill, so every page opened
  // with roughly 330px of blank white above the first line of content.
  for (const route of ['/', '/' + ARTICLES[0].slug]) {
    test(`${route} renders no unfillable <ins class="adsbygoogle">`, async ({ page }) => {
      await page.goto(route);
      // Scoped to [data-ad-slot], which is what components/AdSense.tsx emits.
      // adsbygoogle.js injects bare <ins class="adsbygoogle"> elements of its
      // own that carry no slot id, and those are not ours to assert about.
      const slots = await page.locator('ins.adsbygoogle[data-ad-slot]').evaluateAll(nodes =>
        nodes.map(n => n.getAttribute('data-ad-slot') || '')
      );
      for (const slot of slots) {
        expect(slot, `ad slot "${slot}" is not a real AdSense unit id`).toMatch(/^\d{6,}$/);
      }
    });
  }
});

test.describe('Ad slots follow the approval switch', () => {
  /**
   * Which branch runs follows the same env var the build under test was given,
   * so flipping the switch on approval day moves the coverage with it rather
   * than leaving a stale expectation behind.
   *
   * Read from process.env rather than by importing ADSENSE_ENABLED: that
   * constant resolves `import.meta.env`, which Vite fills in at build time and
   * which is undefined in the Node process the tests run in. Importing it would
   * make this branch always take the disabled path, and the enabled path would
   * silently never run.
   */
  const adsEnabled = process.env.VITE_ADSENSE_ENABLED === 'true';

  test('the slot ids and layout key in the config are real', async () => {
    // Independent of the switch: these are what get served the moment it flips,
    // and a placeholder creeping back in is the regression that cost 330px of
    // blank white above the fold on every page.
    for (const key of ['HEADER_BANNER', 'HOME_FEED_MIDDLE', 'SIDEBAR_RIGHT', 'IN_ARTICLE_FLUID', 'ARTICLE_SIDEBAR'] as const) {
      expect(ADSENSE_CONFIG[key], `${key} is not a real ad unit id`).toMatch(/^\d{6,}$/);
    }
    // Generated with the in-feed unit; it cannot be guessed or shared.
    expect(ADSENSE_CONFIG.HOME_FEED_MIDDLE_LAYOUT_KEY).toMatch(/^[-+A-Za-z0-9]+$/);
  });

  if (!adsEnabled) {
    test('no ad slot is served, so none can reserve empty space', async ({ page }) => {
      // Before approval adsbygoogle.js sets an inline height on every <ins> and
      // then never fills it, because no ad comes back. data-ad-status is never
      // set either, so the usual collapse-on-unfilled CSS cannot fire.
      for (const path of ['/', '/' + ARTICLES[0].slug, '/explore']) {
        const html = await (await page.request.get(path)).text();
        expect(html.match(/<ins[^>]*class="adsbygoogle"/g), `ad slot served on ${path}`).toBeNull();
      }
    });

    test('the site-level AdSense script is still present', async ({ page }) => {
      // This is what AdSense needs to verify the site. It is unaffected by
      // whether any ad unit is on the page, and removing it would undo the
      // Search Console and AdSense wiring both.
      const html = await (await page.request.get('/')).text();
      expect(html).toContain('adsbygoogle.js');
      expect(html).toContain(ADSENSE_CONFIG.PUBLISHER_ID);
    });

    test('no page opens with a band of reserved empty space', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      const gap = await page.evaluate(() => {
        const header = document.querySelector('header')!.getBoundingClientRect().bottom;
        const main = document.querySelector('main')!;
        const first = [...main.querySelectorAll('*')]
          .map(n => n.getBoundingClientRect())
          .filter(r => r.height > 20)
          .sort((a, b) => a.top - b.top)[0];
        return Math.round(first.top - header);
      });
      // Production measured 312px on 2026-08-28 with real ids and no approval.
      expect(gap, `${gap}px of dead space above the first content`).toBeLessThan(150);
    });
  } else {
    test('the in-article slot declares its layout', async ({ page }) => {
      const html = await (await page.request.get('/' + ARTICLES[0].slug)).text();
      const ins = html.match(new RegExp(`<ins[^>]*data-ad-slot="${ADSENSE_CONFIG.IN_ARTICLE_FLUID}"[^>]*>`));
      expect(ins, 'in-article slot not found in the served HTML').not.toBeNull();
      expect(ins![0]).toContain('data-ad-layout="in-article"');
      expect(ins![0]).toContain('data-ad-format="fluid"');
    });

    test('the in-feed slot carries its layout key on every page that uses it', async ({ page }) => {
      for (const path of ['/', categoryPath('Mat & Dryck')]) {
        const html = await (await page.request.get(path)).text();
        const ins = html.match(new RegExp(`<ins[^>]*data-ad-slot="${ADSENSE_CONFIG.HOME_FEED_MIDDLE}"[^>]*>`));
        expect(ins, `in-feed slot not found on ${path}`).not.toBeNull();
        expect(ins![0], path).toContain(`data-ad-layout-key="${ADSENSE_CONFIG.HOME_FEED_MIDDLE_LAYOUT_KEY}"`);
        expect(ins![0], path).toContain('data-ad-format="fluid"');
      }
    });

    test('display slots declare no layout attributes', async ({ page }) => {
      const html = await (await page.request.get('/')).text();
      for (const slot of [ADSENSE_CONFIG.HEADER_BANNER, ADSENSE_CONFIG.SIDEBAR_RIGHT]) {
        const ins = html.match(new RegExp(`<ins[^>]*data-ad-slot="${slot}"[^>]*>`));
        expect(ins, `display slot ${slot} not found`).not.toBeNull();
        expect(ins![0], slot).not.toContain('data-ad-layout');
      }
    });
  }
});

test.describe('The chrome contains no controls that do nothing', () => {
  test('the top bar offers no subscription or login the site cannot honour', async ({ page }) => {
    await page.goto('/');
    const banner = page.getByRole('banner');
    await expect(banner.getByText('Prenumerera')).toHaveCount(0);
    await expect(banner.getByText('Logga in')).toHaveCount(0);
  });

  test('every header and footer control leads somewhere', async ({ page }) => {
    await page.goto('/');
    // A <button> in the chrome with no handler is the failure mode this catches
    // (the search magnifier was one). Links are exercised by navigation.spec.ts.
    const buttons = page.locator('header button, footer button');
    for (let i = 0; i < (await buttons.count()); i++) {
      const button = buttons.nth(i);
      const label = (await button.getAttribute('aria-label')) || (await button.innerText());
      // Menu toggle and cookie settings are the only two, and both act.
      expect(label.trim().length, 'a chrome button with no accessible label').toBeGreaterThan(0);
    }
  });
});

test.describe('Thin listing pages stay out of the index', () => {
  test('a category below the threshold is noindex and absent from the sitemap', async ({ page }) => {
    const sitemap = await (await page.request.get('/sitemap.xml')).text();

    for (const category of CATEGORIES) {
      const count = countByCategory(ARTICLES, category.name);
      if (count === 0) continue;

      const path = categoryPath(category.name);
      const html = await (await page.request.get(path)).text();
      const noindexed = /<meta name="robots" content="noindex, follow" \/>/.test(html);
      const inSitemap = sitemap.includes(`<loc>${new URL(path, 'https://gotoburg.se').href}</loc>`);

      if (count < MIN_ARTICLES_TO_INDEX_CATEGORY) {
        expect(noindexed, `${path} lists ${count} article(s) and must be noindex`).toBe(true);
        expect(inSitemap, `${path} is noindex and must not be in the sitemap`).toBe(false);
      } else {
        expect(noindexed, `${path} lists ${count} articles and must stay indexable`).toBe(false);
        expect(inSitemap, `${path} is indexable and must be in the sitemap`).toBe(true);
      }
    }
  });
});
