import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Replaces the article imagery with Wikimedia Commons files that are actually
 * licensed for reuse, and records the attribution those licences require.
 *
 * Before this existed the articles hotlinked 25 images from media.cylex.se,
 * scontent.fbcdn.net, via.tt.se, cms.goteborg.com, imageproxy.wolt.com and the
 * venues' own sites. None of that was licensed, two of them already returned
 * 403, and even the six Commons images carried no attribution, which breaches
 * CC BY and CC BY-SA on their own.
 *
 * Run with: node scripts/fetch-images.mjs
 * It is a maintenance tool, not part of the build.
 */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public', 'img');
const dataFile = path.join(root, 'src', 'data', 'articles.ts');
const API = 'https://commons.wikimedia.org/w/api.php';
const UA = 'GotoBurg/1.0 (https://www.gotoburg.se; peter@gotoburg.se)';
// The lead image renders at most ~1024px wide (max-w-5xl), so anything larger
// is bytes the visitor pays for and never sees. At 1600 the set came to 15MB.
const WIDTH = 1200;

/**
 * Licences that permit commercial reuse with attribution. Anything outside this
 * list aborts the run rather than being downloaded: a non-commercial or
 * no-derivatives image on an ad-funded site is exactly the problem being fixed.
 */
const ALLOWED = [
  /^CC0/i,
  /^CC BY [0-9.]+$/i,
  /^CC BY-SA [0-9.]+$/i,
  /^Public domain$/i,
  /^PD/i,
];

const strip = s =>
  s ? String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : '';

const chunk = (arr, n) =>
  arr.reduce((acc, x, i) => (i % n ? acc[acc.length - 1].push(x) : acc.push([x]), acc), []);

async function fileInfo(titles) {
  const out = new Map();
  for (const group of chunk(titles, 20)) {
    const url = new URL(API);
    url.searchParams.set('action', 'query');
    url.searchParams.set('format', 'json');
    url.searchParams.set('prop', 'imageinfo');
    url.searchParams.set('iiprop', 'extmetadata|url|size');
    url.searchParams.set('iiurlwidth', String(WIDTH));
    url.searchParams.set('titles', group.join('|'));
    const res = await fetch(url, { headers: { 'user-agent': UA } });
    const json = await res.json();
    const norm = new Map(
      (json.query?.normalized ?? []).map(n => [n.to, n.from])
    );
    for (const page of Object.values(json.query?.pages ?? {})) {
      const key = norm.get(page.title) ?? page.title;
      const ii = page.imageinfo?.[0];
      const em = ii?.extmetadata ?? {};
      out.set(key, {
        title: page.title,
        missing: page.missing !== undefined,
        licence: strip(em.LicenseShortName?.value),
        licenceUrl: strip(em.LicenseUrl?.value),
        artist: strip(em.Artist?.value),
        descriptionUrl: ii?.descriptionurl,
        thumbUrl: ii?.thumburl,
        mime: ii?.thumbmime ?? ii?.mime,
      });
    }
  }
  return out;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

/**
 * Commons rate-limits thumbnail rendering and answers 429 when a run asks for
 * twenty in a row. Back off and retry rather than leaving the download half
 * done, which would rewrite articles.ts against images that are not on disk.
 */
async function download(url, title) {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const res = await fetch(url, { headers: { 'user-agent': UA } });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    if (res.status !== 429 && res.status < 500) {
      console.error('Download failed for ' + title + ': HTTP ' + res.status);
      process.exit(1);
    }
    const wait = 2000 * attempt;
    console.log('  HTTP ' + res.status + ' for ' + title + ', retrying in ' + wait / 1000 + 's');
    await sleep(wait);
  }
  console.error('Download failed for ' + title + ' after 5 attempts');
  process.exit(1);
}

const manifest = JSON.parse(
  fs.readFileSync(path.join(root, 'scripts', 'images.manifest.json'), 'utf8')
);
delete manifest._comment;

const wanted = [...new Set(Object.values(manifest).flat())];
const info = await fileInfo(wanted);

// Verify everything before writing anything, so a bad licence cannot leave the
// repo half-migrated.
const problems = [];
for (const title of wanted) {
  const m = info.get(title);
  if (!m || m.missing) {
    problems.push(title + ': not found on Commons');
    continue;
  }
  if (!m.thumbUrl) problems.push(title + ': no rendition available');
  if (!ALLOWED.some(re => re.test(m.licence))) {
    problems.push(title + ': licence "' + (m.licence || 'unknown') + '" is not on the allowlist');
  }
  if (!m.artist) problems.push(title + ': no author recorded, cannot attribute');
}
if (problems.length) {
  console.error('Refusing to download:\n  ' + problems.join('\n  '));
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

const raw = fs.readFileSync(dataFile, 'utf8');
const articles = JSON.parse(raw.slice(raw.indexOf('['), raw.lastIndexOf(']') + 1));

let downloaded = 0;
for (const [slug, titles] of Object.entries(manifest)) {
  const article = articles.find(a => a.slug === slug);
  if (!article) {
    console.error('No article with slug ' + slug);
    process.exit(1);
  }
  const urls = [];
  const credits = [];
  for (const [i, title] of titles.entries()) {
    const m = info.get(title);
    const ext = m.mime === 'image/png' ? '.png' : '.jpg';
    const name = slug + (i === 0 ? '' : '-' + (i + 1)) + ext;
    const target = path.join(outDir, name);

    const bytes = await download(m.thumbUrl, title);
    fs.writeFileSync(target, bytes);
    downloaded += 1;

    await sleep(700);

    urls.push('/img/' + name);
    credits.push({
      file: title.replace(/^File:/, ''),
      author: m.artist,
      licence: m.licence,
      licenceUrl: m.licenceUrl,
      sourceUrl: m.descriptionUrl,
    });
    console.log(
      String(Math.round(bytes.length / 1024) + 'kB').padStart(7) +
        '  ' + name + '  [' + m.licence + ']'
    );
  }
  article.imageUrl = urls[0];
  article.imageCredit = credits[0];
  if (urls.length > 1) {
    article.additionalImages = urls.slice(1);
    article.additionalImageCredits = credits.slice(1);
  } else {
    article.additionalImages = [];
    delete article.additionalImageCredits;
  }
}

fs.writeFileSync(dataFile, 'export const articles = ' + JSON.stringify(articles, null, 2) + ';\n');
console.log('\nDownloaded ' + downloaded + ' images into public/img/ and rewrote ' + path.relative(root, dataFile));
