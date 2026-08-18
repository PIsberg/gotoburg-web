import { test, expect } from '@playwright/test';

/**
 * These assert what a crawler receives, not what the browser paints after
 * hydration. Google renders JavaScript but AdSense review and the initial crawl
 * lean on the served HTML, and the site previously served one URL with an empty
 * <div id="root"> for all 19 articles.
 *
 * Every check here uses page.request, which performs a plain HTTP GET with no
 * JavaScript execution, so a regression back to a client-only build fails.
 */

const ARTICLE_PATH = '/basta-brunchstallena-goteborg';

/** Visible text of the served HTML, with scripts and tags stripped. */
const visibleText = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const fetchHtml = async (request: any, path: string) => {
  const response = await request.get(path);
  expect(response.status(), `GET ${path}`).toBe(200);
  return response.text();
};

test.describe('Served HTML is crawlable', () => {
  test('an article ships its body text without running JavaScript', async ({ page }) => {
    const html = await fetchHtml(page.request, ARTICLE_PATH);
    const text = visibleText(html);

    // A sentence from the middle of the article, not the excerpt or the title.
    expect(text).toContain('Brunchoteket passar den som inte vill ha en buffé');
    expect(text.split(' ').length).toBeGreaterThan(300);
  });

  test('the home page ships article headlines without running JavaScript', async ({ page }) => {
    const text = visibleText(await fetchHtml(page.request, '/'));

    expect(text).toContain('Senaste nytt');
    expect(text).toContain('Just nu');
    expect(text.split(' ').length).toBeGreaterThan(300);
  });

  test('each page carries its own title, description and canonical', async ({ page }) => {
    const paths = ['/', ARTICLE_PATH, '/kategori/mat-och-dryck', '/om-oss', '/redaktionen'];
    const titles: string[] = [];

    for (const path of paths) {
      const html = await fetchHtml(page.request, path);

      const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
      expect(title, `title on ${path}`).toBeTruthy();
      // A second <title> would mean the shell's generic one was left behind.
      expect(html.match(/<title>/g)?.length, `one title on ${path}`).toBe(1);
      titles.push(title!);

      const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
      expect(description, `description on ${path}`).toBeTruthy();
      expect(html.match(/<meta name="description"/g)?.length).toBe(1);

      const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
      expect(canonical, `canonical on ${path}`).toBeTruthy();
      expect(canonical!.startsWith('https://')).toBe(true);
      expect(canonical!.endsWith(path === '/' ? '/' : path)).toBe(true);
    }

    expect(new Set(titles).size, 'every page needs a distinct title').toBe(paths.length);
  });

  test('an article carries NewsArticle and BreadcrumbList structured data', async ({ page }) => {
    const html = await fetchHtml(page.request, ARTICLE_PATH);
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .map(m => JSON.parse(m[1]));

    const article = blocks.find(b => b['@type'] === 'NewsArticle');
    expect(article, 'expected NewsArticle JSON-LD').toBeTruthy();
    expect(article.headline).toBeTruthy();
    expect(article.author?.name).toBeTruthy();
    // The bylines used to read "Peter AI assisted", which names no one.
    expect(article.author.name).not.toContain('AI');
    expect(article.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}/);
    expect(article.publisher?.name).toBe('GotoBurg');

    expect(blocks.find(b => b['@type'] === 'BreadcrumbList')).toBeTruthy();
  });

  test('sitemap.xml lists every article and resolves to a real page', async ({ page }) => {
    const response = await page.request.get('/sitemap.xml');
    expect(response.status()).toBe(200);
    const xml = await response.text();

    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    // 19 articles + home + 6 static + 2 authors + 6 populated categories.
    expect(locs.length).toBeGreaterThanOrEqual(30);
    expect(new Set(locs).size, 'sitemap must not repeat a URL').toBe(locs.length);

    for (const loc of locs) {
      const path = new URL(loc).pathname;
      const page404 = await page.request.get(path);
      expect(page404.status(), `sitemap URL ${path}`).toBe(200);
    }
  });

  test('robots.txt allows crawling and points at the sitemap', async ({ page }) => {
    const response = await page.request.get('/robots.txt');
    expect(response.status()).toBe(200);
    const body = await response.text();

    expect(body).toContain('User-agent: *');
    expect(body).toContain('Allow: /');
    expect(body).not.toContain('Disallow: /');
    expect(body).toMatch(/Sitemap: https:\/\/\S+\/sitemap\.xml/);
    // AdSense cannot serve relevant ads on pages it is blocked from reading.
    expect(body).toContain('Mediapartners-Google');
  });

  test('an unknown URL returns a real 404, not a 200 with a not-found page', async ({ page }) => {
    // A soft 404 (status 200 on a missing page) lets junk URLs into the index
    // and counts as thin content against the site.
    const response = await page.request.get('/this-url-does-not-exist');
    expect(response.status()).toBe(404);
    expect(visibleText(await response.text())).toContain('Sidan hittades inte');
  });

  test('every article has real depth and renders its subheadings as headings', async ({ page }) => {
    // Guards the two shapes that made the original articles read as thin:
    // ~350 words of unbroken text, and markdown that shipped as literal
    // asterisks because ArticlePage rendered every content entry as a <p>.
    const xml = await (await page.request.get('/sitemap.xml')).text();
    const articlePaths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
      .map(m => new URL(m[1]).pathname)
      .filter(p => p !== '/' && !p.startsWith('/kategori/') && !p.startsWith('/redaktionen')
        && !['/om-oss', '/kontakt', '/villkor', '/integritetspolicy', '/explore'].includes(p));

    expect(articlePaths.length).toBe(19);

    for (const path of articlePaths) {
      const html = await fetchHtml(page.request, path);
      const body = html.slice(html.indexOf('<div id="root">'));
      const text = visibleText(body);

      expect(text.split(' ').length, `word count on ${path}`).toBeGreaterThan(450);
      // "## " would mean the heading convention leaked through as plain text.
      expect(text, `unrendered heading marker on ${path}`).not.toContain('## ');
      expect(text, `unrendered bold marker on ${path}`).not.toContain('**');
      // At least one subheading, rendered as an h2 the crawler can read.
      expect(
        (body.match(/<h2[^>]*class="font-serif/g) || []).length,
        `subheadings on ${path}`
      ).toBeGreaterThan(0);
    }
  });

  test('ads.txt is served for AdSense verification', async ({ page }) => {
    const response = await page.request.get('/ads.txt');
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain('pub-2203695397498260');
  });
});
