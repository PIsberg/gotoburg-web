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
 * Google Search Console ownership token for the URL-prefix property
 * https://gotoburg.se/, from the "HTML tag" verification method.
 * scripts/prerender.mjs emits it as <meta name="google-site-verification">
 * on every page.
 *
 * The property is already verified by the Google Analytics method, which
 * works off the gtag.js snippet in index.html. That is the weaker of the two:
 * Google drops the verification if the tracking code is ever removed, and a
 * consent banner or an ad blocker is enough to make people want to remove it.
 * This tag is the second, independent method, so losing one does not
 * unverify the property.
 *
 * The token is public by design; it is a meta tag on every page of the site.
 * GOOGLE_SITE_VERIFICATION as a build environment variable still overrides it,
 * which is what a second property (a staging host, say) would use.
 */
export const GOOGLE_SITE_VERIFICATION =
  (typeof process !== 'undefined' && process.env?.GOOGLE_SITE_VERIFICATION) ||
  '92VWYdQb7d01q3BXJtJnAht912sz-uRBpmArZ0Lshh4';

export const absoluteUrl = (path: string): string =>
  `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
