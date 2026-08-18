/**
 * Single source of truth for the canonical origin used in <link rel="canonical">,
 * Open Graph tags, JSON-LD and sitemap.xml.
 *
 * The apex, not www. Checked against the live site: https://www.gotoburg.se/om-oss
 * returns 301 to https://gotoburg.se/om-oss, so naming www here would have pointed
 * every canonical, every og:url and all 35 sitemap entries at a URL that redirects
 * before it resolves.
 *
 * https://gotoburg.netlify.app/ also serves the site and is a duplicate of it; the
 * canonical tags generated from this value are what tell Google which one counts.
 */
export const SITE_URL = (
  (typeof process !== 'undefined' && process.env?.SITE_URL) ||
  'https://gotoburg.se'
).replace(/\/$/, '');

export const SITE_NAME = 'GotoBurg';
export const SITE_TAGLINE = 'Det senaste från wetcoasten';
export const SITE_DESCRIPTION =
  'GotoBurg är en fristående redaktion som skriver om Göteborg: mat och dryck, natur, kultur, aktiviteter och evenemang i staden och Västsverige.';
export const SITE_LOCALE = 'sv_SE';
export const CONTACT_EMAIL = 'redaktionen@gotoburg.se';

/**
 * Google Search Console ownership token, from the "HTML tag" verification
 * method. scripts/prerender.mjs emits it as
 * <meta name="google-site-verification"> on every page.
 *
 * Set GOOGLE_SITE_VERIFICATION as a Netlify build environment variable, or
 * paste the token here as the fallback if you would rather have it in the repo.
 * Google only reads it on the URL you claim, so the property you verify must
 * match SITE_URL above.
 */
export const GOOGLE_SITE_VERIFICATION =
  (typeof process !== 'undefined' && process.env?.GOOGLE_SITE_VERIFICATION) || '';

export const absoluteUrl = (path: string): string =>
  `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
