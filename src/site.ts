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

export const absoluteUrl = (path: string): string =>
  `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
