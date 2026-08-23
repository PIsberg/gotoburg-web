import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/**
 * Writes one real HTML file per route into dist/, plus sitemap.xml and
 * robots.txt.
 *
 * Why this exists: the site is a client-rendered SPA, so `vite build` emits a
 * single index.html whose body is an empty <div id="root">. Under the old
 * HashRouter every article also lived behind a URL fragment, which Google
 * discards. Between them, a crawl of the whole site returned one URL containing
 * no article text. This step is what makes the articles crawlable.
 */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const ssrEntry = path.join(root, '.ssr', 'entry-server.js');

const { render, routes, siteVerification } = await import(pathToFileURL(ssrEntry).href);


const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

const escapeAttr = str =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** JSON-LD sits in a <script>, so the only dangerous sequence is a closing tag. */
const escapeJsonLd = obj => JSON.stringify(obj).split('<').join('\\u003c');

const verification = siteVerification();

const headFor = meta => {
  const tags = [
    `<title>${escapeAttr(meta.title)}</title>`,
    `<meta name="description" content="${escapeAttr(meta.description)}" />`,
    `<link rel="canonical" href="${escapeAttr(meta.canonical)}" />`,
    `<meta property="og:type" content="${meta.ogType}" />`,
    `<meta property="og:site_name" content="GotoBurg" />`,
    `<meta property="og:locale" content="sv_SE" />`,
    `<meta property="og:title" content="${escapeAttr(meta.title)}" />`,
    `<meta property="og:description" content="${escapeAttr(meta.description)}" />`,
    `<meta property="og:url" content="${escapeAttr(meta.canonical)}" />`,
    `<meta name="twitter:card" content="${meta.image ? 'summary_large_image' : 'summary'}" />`,
    `<meta name="twitter:title" content="${escapeAttr(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(meta.description)}" />`,
  ];
  // Search Console checks this on the exact URL being claimed, so it goes on
  // every page rather than only the home page.
  if (verification) {
    tags.push(`<meta name="google-site-verification" content="${escapeAttr(verification)}" />`);
  }
  if (meta.image) {
    tags.push(`<meta property="og:image" content="${escapeAttr(meta.image)}" />`);
    tags.push(`<meta name="twitter:image" content="${escapeAttr(meta.image)}" />`);
  }
  if (meta.ogType === 'article' && meta.published) {
    tags.push(`<meta property="article:published_time" content="${escapeAttr(meta.published)}" />`);
  }
  for (const block of meta.jsonLd) {
    tags.push(`<script type="application/ld+json">${escapeJsonLd(block)}</script>`);
  }
  return tags.map(t => `    ${t}`).join('\n');
};

/**
 * The template's <title> and description are the generic site-wide ones. Strip
 * them before injecting the per-page set, otherwise every page ships two titles
 * and a crawler picks whichever it likes.
 */
const buildPage = (meta, appHtml) => {
  let html = template
    .replace(/\n?\s*<title>[\s\S]*?<\/title>/, '')
    .replace(/\n?\s*<meta\s+name="description"[\s\S]*?\/>/, '');

  html = html.replace('</head>', `${headFor(meta)}\n  </head>`);
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${appHtml}</div>`
  );
  return html;
};

/**
 * Flat files (`dist/some-slug.html`), not `dist/some-slug/index.html`.
 *
 * Netlify serves /some-slug straight from some-slug.html with a 200, but for a
 * directory it 301s /some-slug to /some-slug/ first. The canonical URLs in
 * src/seo.ts carry no trailing slash, so the directory layout made every
 * canonical point at a URL that redirects before it resolves. Verified against
 * the deploy preview, which is the only place this behaviour is observable.
 */
const writePage = (routePath, html) => {
  const target =
    routePath === '/'
      ? path.join(dist, 'index.html')
      : path.join(dist, `${routePath.replace(/^\//, '')}.html`);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, html, 'utf8');
  return path.relative(dist, target).split(path.sep).join('/');
};

const pages = routes();
const siteOrigin = new URL(pages[0].canonical).origin;

let emptyBodies = 0;
for (const meta of pages) {
  const appHtml = render(meta.path);
  // A route that renders nothing would ship as an empty page and undo the point
  // of this step, so fail the build rather than deploy it.
  if (appHtml.trim().length < 500) {
    console.error(`  ! ${meta.path} rendered only ${appHtml.trim().length} bytes`);
    emptyBodies += 1;
  }
  const file = writePage(meta.path, buildPage(meta, appHtml));
  console.log(`  ${file.padEnd(70)} ${String(appHtml.length).padStart(7)} bytes`);
}

if (emptyBodies > 0) {
  console.error(`\nPrerender failed: ${emptyBodies} route(s) rendered no content.`);
  process.exit(1);
}

// Netlify serves 404.html with a 404 status for any path that has no file.
// Every real route above is a real file, so nothing legitimate reaches this.
const notFound = pages.find(p => p.path === '/');
fs.writeFileSync(
  path.join(dist, '404.html'),
  buildPage(
    {
      ...notFound,
      path: '/404',
      title: 'Sidan hittades inte | GotoBurg',
      description: 'Adressen leder ingenstans. Här är det senaste från GotoBurg i stället.',
      canonical: `${siteOrigin}/404`,
      jsonLd: [],
    },
    render('/__not-found__')
  ),
  'utf8'
);

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...pages.map(p =>
    [
      '  <url>',
      `    <loc>${p.canonical}</loc>`,
      p.published ? `    <lastmod>${p.published.slice(0, 10)}</lastmod>` : '',
      `    <priority>${p.priority}</priority>`,
      '  </url>',
    ]
      .filter(Boolean)
      .join('\n')
  ),
  '</urlset>',
  '',
].join('\n');
fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap, 'utf8');

const robots = [
  'User-agent: *',
  'Allow: /',
  '',
  '# AdSense needs to fetch pages to decide what ads to serve on them.',
  'User-agent: Mediapartners-Google',
  'Allow: /',
  '',
  `Sitemap: ${siteOrigin}/sitemap.xml`,
  '',
].join('\n');
fs.writeFileSync(path.join(dist, 'robots.txt'), robots, 'utf8');

console.log(`\nPrerendered ${pages.length} routes + 404.html, sitemap.xml, robots.txt`);
console.log(`Canonical origin: ${siteOrigin}`);
console.log(
  verification
    ? 'Search Console verification tag: present'
    : 'Search Console verification tag: NOT SET (set GOOGLE_SITE_VERIFICATION to emit it)'
);
