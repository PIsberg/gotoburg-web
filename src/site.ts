/**
 * Single source of truth for the canonical origin and the site-wide identity used
 * in <link rel="canonical">, Open Graph tags, JSON-LD and sitemap.xml.
 *
 * Google treats https://www.gotoburg.se/ and https://goteburg.se/ as different
 * sites. Every generated URL points at SITE_URL so the AdSense crawl, the sitemap
 * and the social cards all agree on one origin.
 */
export const SITE_URL = (
  (typeof process !== 'undefined' && process.env?.SITE_URL) ||
  'https://www.gotoburg.se'
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
