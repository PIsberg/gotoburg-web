import { test, expect } from '@playwright/test';

import { AUTHORS } from '../../src/authors';
import { CATEGORIES } from '../../src/categories';
import { ARTICLES } from '../../src/constants';
import { SITE_URL as SITE_ORIGIN } from '../../src/site';

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
    // Articles + home + 6 static + 2 authors + the populated categories.
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
        && !['/om-oss', '/kontakt', '/villkor', '/integritetspolicy', '/explore', '/bildkredit'].includes(p));

    expect(articlePaths.length).toBe(ARTICLES.length);

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

  /**
   * The Search Console property is verified twice over: by Google Analytics,
   * which depends on the gtag.js snippet staying in index.html, and by this
   * meta tag. If the tag silently stops being emitted the build still passes
   * and the site still works, so nothing else would notice until the day the
   * analytics snippet is removed and the property unverifies.
   */
  test('every page carries the Search Console verification tag', async ({ page }) => {
    const paths = ['/', ARTICLE_PATH, '/kategori/mat-och-dryck', '/om-oss'];

    for (const path of paths) {
      const html = await fetchHtml(page.request, path);
      const tags = html.match(
        /<meta name="google-site-verification" content="([^"]+)"/g,
      );

      expect(tags?.length, `verification tag on ${path}`).toBe(1);
      expect(tags![0], `token on ${path}`).toContain(
        '92VWYdQb7d01q3BXJtJnAht912sz-uRBpmArZ0Lshh4',
      );
    }
  });
});

/**
 * The articles used to hotlink 25 images from media.cylex.se, fbcdn.net,
 * via.tt.se, cms.goteborg.com, imageproxy.wolt.com and the venues' own sites.
 * None of it was licensed, two already 404'd, and even the freely licensed
 * Wikimedia files carried no attribution, which breaches CC BY and CC BY-SA.
 */
/**
 * The bylines exist to answer "who wrote this and why should I believe them".
 * The weak version of that is prose in a bio, which can claim anything: the
 * redaktionen bio used to say its guides were built on first-hand visits, which
 * nothing evidences and /om-oss contradicts.
 *
 * So the expertise claim is derived rather than asserted, and this pins the two
 * together from opposite ends: knowsAbout comes from the article data via
 * src/seo.ts, the categories checked against it are scraped out of the rendered
 * article list on the same page. Widening one without the other fails here.
 */
/**
 * A byline only links to a profile if article.author matches an AUTHORS entry
 * exactly. A mismatch degrades silently: the name renders as plain text, the
 * article's schema.org author loses its url and jobTitle, and the author page
 * simply does not list the piece. Nothing fails, so nothing tells you.
 *
 * This is not hypothetical. The data has carried "Peter AI assisted" as a
 * byline, and a stray article array at the repo root carried "Johan Andersson",
 * neither of whom is an author.
 */
/**
 * Structured data is not validated by anything at build time: schema.org will
 * happily carry a logo URL that 404s, and the page still renders, the build
 * still passes, and Google quietly drops the rich result. That is exactly what
 * happened — publisher.logo pointed at /logo.png, which had never existed.
 *
 * So this resolves every same-origin asset the head and the JSON-LD reference,
 * rather than trusting that a path written in a string points at a file.
 */
/**
 * /explore is the first item in the nav and its content was a Google map, which
 * renders nothing at all without JavaScript and, as it turned out, nothing with
 * it either: the Cloud project had no billing, so the Maps API answered
 * BillingNotEnabledMapError and the page painted an empty grey box. That left
 * 97 words of prerendered content on the thinnest page in the sitemap, on a
 * site rejected for thin content.
 *
 * The places are now real markup rendered from the same parsed coordinates the
 * markers use, so the page carries its content whether or not the map works.
 * The map itself is Leaflet + OpenStreetMap these days, but a Leaflet canvas is
 * still nothing to a crawler, so everything here holds unchanged.
 */
test.describe('The map page carries its content without the map', () => {
  test('every mapped place is in the served HTML with a link to its article', async ({ page }) => {
    const html = await fetchHtml(page.request, '/explore');
    const places = ARTICLES.filter((article) =>
      /@(-?\d+\.\d+),(-?\d+\.\d+)/.test(article.googleMapsUrl ?? ''),
    );

    expect(places.length, 'articles with coordinates').toBeGreaterThan(0);

    const body = html.slice(html.indexOf('<div id="root">'));
    const missing = places
      .filter((article) => !body.includes(`href="/${article.slug}"`))
      .map((article) => article.slug);

    expect(missing, 'mapped places missing from /explore').toEqual([]);
  });

  test('the page is not a stub around an empty map container', async ({ page }) => {
    const text = visibleText(await fetchHtml(page.request, '/explore'));
    // The map contributes nothing to a crawler, so anything above a stub has to
    // come from the markup around it.
    expect(text.split(' ').length).toBeGreaterThan(400);
  });

  test('no build instruction is shown to visitors', async ({ page }) => {
    // The map fallback used to tell whoever hit it to edit .env.local and read
    // README.md, which is what production would have served had the key gone
    // missing from the Netlify environment.
    const html = await fetchHtml(page.request, '/explore');
    expect(html).not.toContain('.env.local');
    expect(html).not.toContain('README.md');
  });
});

test.describe('Assets referenced by the markup exist', () => {
  const PAGES = ['/', ARTICLE_PATH, '/redaktionen/peter-isberg'];

  test('every same-origin asset in the head and JSON-LD is served', async ({ page }) => {
    const missing: string[] = [];

    for (const path of PAGES) {
      const html = await fetchHtml(page.request, path);
      const head = html.slice(0, html.indexOf('</head>'));

      const refs = new Set<string>();
      // stylesheet/icon hrefs and script srcs
      for (const m of head.matchAll(/(?:href|src)="([^"]+)"/g)) refs.add(m[1]);
      // og:image, and any absolute URL inside the JSON-LD blocks
      for (const m of head.matchAll(/"(https:\/\/[^"]+\.(?:png|jpe?g|webp|svg|ico|css|js))"/g))
        refs.add(m[1]);

      for (const ref of refs) {
        const url = ref.startsWith(SITE_ORIGIN)
          ? ref.slice(SITE_ORIGIN.length)
          : ref;
        // Only same-origin assets; a third-party script is not ours to assert.
        if (!url.startsWith('/')) continue;
        // Routes are covered by the crawlability tests; this is about files.
        if (!/\.[a-z0-9]+$/i.test(url)) continue;

        const response = await page.request.get(url);
        if (response.status() !== 200) {
          missing.push(`${path} references ${url} -> ${response.status()}`);
        }
      }
    }

    expect(missing, 'assets referenced but not served').toEqual([]);
  });

  test('the site declares an icon instead of leaving browsers to guess', async ({ page }) => {
    // Without a declared icon every browser requests /favicon.ico, which 404s.
    const html = await fetchHtml(page.request, '/');
    const head = html.slice(0, html.indexOf('</head>'));

    const icons = [...head.matchAll(/<link[^>]+rel="[^"]*icon[^"]*"[^>]*>/g)];
    expect(icons.length, 'icon link tags').toBeGreaterThan(0);

    for (const icon of icons) {
      const href = icon[0].match(/href="([^"]+)"/)?.[1];
      expect(href, 'icon href').toBeTruthy();
      const response = await page.request.get(href!);
      expect(response.status(), `${href} is served`).toBe(200);
    }
  });
});

test.describe('Every byline resolves to a real person', () => {
  test('no article is signed by someone who has no profile', async ({ page }) => {
    const known = new Set(AUTHORS.map((author) => author.name));
    const orphans = ARTICLES.filter((article) => !known.has(article.author)).map(
      (article) => `${article.slug} signed "${article.author}"`,
    );

    expect(orphans, 'articles whose byline has no profile').toEqual([]);

    // And the byline on a served page is a link, not bare text.
    const html = await fetchHtml(page.request, ARTICLE_PATH);
    const article = ARTICLES.find((entry) => `/${entry.slug}` === ARTICLE_PATH)!;
    const slug = AUTHORS.find((author) => author.name === article.author)!.slug;
    expect(html).toContain(`/redaktionen/${slug}`);
  });
});

test.describe('Author profiles claim only what their own work evidences', () => {
  for (const author of AUTHORS) {
    test(`${author.name} knowsAbout matches the articles listed on the page`, async ({ page }) => {
      const html = await fetchHtml(page.request, `/redaktionen/${author.slug}`);

      const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
        .map((match) => JSON.parse(match[1]));
      const profile = blocks.find((block) => block['@type'] === 'ProfilePage');
      expect(profile, 'ProfilePage block').toBeTruthy();

      const person = profile.mainEntity as Record<string, any>;
      expect(person['@type']).toBe('Person');
      expect(person.worksFor?.name, 'worksFor').toBe('GotoBurg');

      // Only the article listing, so the nav and footer category links do not
      // count as evidence of anything.
      const start = html.indexOf(`Artiklar av ${author.name}`);
      const end = html.indexOf('Tillbaka till redaktionen');
      expect(start, 'article listing heading').toBeGreaterThan(-1);
      expect(end, 'end of listing').toBeGreaterThan(start);
      const listing = html.slice(start, end);

      const evidenced = CATEGORIES.map((category) => category.name).filter((name) =>
        listing.includes(name.replace(/&/g, '&amp;')),
      );

      expect(evidenced.length, `${author.name} has articles listed`).toBeGreaterThan(0);
      expect([...(person.knowsAbout ?? [])].sort()).toEqual([...evidenced].sort());
    });
  }
});

test.describe('Images are self-hosted and attributed', () => {
  const ARTICLE = '/basta-brunchstallena-goteborg';

  const articlePaths = async (request: any) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
      .map(m => new URL(m[1]).pathname)
      .filter(
        p =>
          p !== '/' &&
          !p.startsWith('/kategori/') &&
          !p.startsWith('/redaktionen') &&
          !['/om-oss', '/kontakt', '/villkor', '/integritetspolicy', '/explore', '/bildkredit'].includes(p)
      );
  };

  /**
   * Most lead images are a Commons photograph of the street a venue stands on
   * rather than the venue, because no free photograph of the venue exists.
   * Uncaptioned, and with the headline as alt text, such a photograph asserts
   * that it shows the place. `imageCaption` names what is actually in the
   * frame, and the alt text has to agree with it or a screen reader is told the
   * thing the caption exists to deny.
   */
  test('an image that is not of its subject says what it is of', async ({ page }) => {
    const captioned = ARTICLES.filter(a => a.imageCaption);
    expect(captioned.length, 'no article carries an image caption').toBeGreaterThan(0);

    for (const article of captioned) {
      const html = await fetchHtml(page.request, '/' + article.slug);
      const body = html.slice(html.indexOf('<div id="root">'));

      expect(visibleText(body), `${article.slug} does not show its caption`).toContain(
        article.imageCaption!
      );

      const lead = body.match(/<img[^>]+src="\/img\/[^"]+"[^>]*>/);
      expect(lead, `${article.slug} has no lead image`).not.toBeNull();
      expect(lead![0], `${article.slug} alt text contradicts its caption`).toContain(
        `alt="${article.imageCaption!.replace(/"/g, '&quot;')}"`
      );
    }
  });

  test('no page loads an image from a third-party host', async ({ page }) => {
    for (const path of ['/', ARTICLE, '/kategori/mat-och-dryck']) {
      const html = await fetchHtml(page.request, path);
      const srcs = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map(m => m[1]);
      expect(srcs.length, `images on ${path}`).toBeGreaterThan(0);
      for (const src of srcs) {
        expect(src, `${src} on ${path} is not self-hosted`).toMatch(/^\/img\//);
      }
    }
  });

  test('every article lead image is served and credited', async ({ page }) => {
    const paths = await articlePaths(page.request);
    expect(paths.length).toBe(ARTICLES.length);

    for (const path of paths) {
      const html = await fetchHtml(page.request, path);

      // Search the body only: the head also mentions the image in og:image.
      const body = html.slice(html.indexOf('<div id="root">'));

      const src = body.match(/<img src="(\/img\/[^"]+)"[^>]*loading="eager"/)?.[1];
      expect(src, `lead image on ${path}`).toBeTruthy();
      const img = await page.request.get(src!);
      expect(img.status(), `GET ${src}`).toBe(200);
      expect(img.headers()['content-type']).toContain('image/');

      // Attribution: a named author linking to the Commons file page, and the
      // licence. Public domain files carry no licence URL, so assert the name.
      const figure = body.slice(body.indexOf(src!));
      expect(figure, `credit on ${path}`).toContain('commons.wikimedia.org/wiki/File:');
      expect(figure, `photographer on ${path}`).toContain('Foto:');
      expect(figure, `licence on ${path}`).toMatch(/CC BY|CC0|Public domain/);
    }
  });

  test('og:image and schema.org image are absolute URLs', async ({ page }) => {
    const html = await fetchHtml(page.request, ARTICLE);
    const og = html.match(/property="og:image" content="([^"]+)"/)?.[1];
    expect(og).toBeTruthy();
    // A relative /img/... would be unusable to Facebook, Slack or Google.
    expect(og!.startsWith('https://')).toBe(true);

    const article = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .map(m => JSON.parse(m[1]))
      .find(b => b['@type'] === 'NewsArticle');
    for (const img of article.image) {
      expect(img.startsWith('https://')).toBe(true);
    }
  });

  test('the credits page lists every image on the site', async ({ page }) => {
    const paths = await articlePaths(page.request);
    const html = await fetchHtml(page.request, '/bildkredit');
    const listed = new Set(
      [...html.matchAll(/commons\.wikimedia\.org\/wiki\/(File:[^"]+)/g)].map(m => m[1])
    );
    // One lead image per article, plus any extras.
    expect(listed.size).toBeGreaterThanOrEqual(paths.length);
    expect(visibleText(html)).toContain('Bildkrediter');
  });
});
