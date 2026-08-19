# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm install` — install dependencies
- `npm run dev` — start the Vite dev server for the public site
- `npm run build` — full production build: `build:client` (Vite), then `build:ssr` (an SSR bundle of `scripts/entry-server.tsx` into `.ssr/`), then `prerender`. This is what gets deployed to Netlify, not the source folder.
- `npm run prerender` — run `scripts/prerender.mjs` alone against an existing `dist/` and `.ssr/`
- `node scripts/fetch-images.mjs` — re-download the article imagery from Wikimedia Commons and rewrite the attribution into `src/data/articles.ts`. Maintenance tool, not part of the build. Edit `scripts/images.manifest.json` first.
- `npm run serve` — serve `dist/` on port 4173 with Netlify's URL resolution (`scripts/serve-dist.mjs`). Use this, not `npm run preview`, when checking the built site: `vite preview` serves the SPA fallback for every path and hides prerender breakage.
- `npm run preview` — Vite's own preview. Only useful for the client bundle; it does not serve the prerendered per-route files.
- `npm run admin` — start the local admin tool on http://localhost:3001 (loads `.env.local` via `node --env-file`)
- `npm run test:e2e` — run the Playwright suite in `tests/e2e/`. `playwright.config.ts` builds the site and serves it with `scripts/serve-dist.mjs` on port 4173 (`npm run test:e2e:ui` for the UI runner). This also runs in CI on every PR.

There is no linter or typechecker wired into npm scripts. `npx tsc --noEmit` currently fails with TS6305 on `vite.config.ts`, a pre-existing project-reference config issue, not a code error.

## Architecture

GotoBurg is a Swedish-language local-news/lifestyle SPA (Gothenburg, "wetcoasten"). The site is a fully static Vite + React 18 + react-router-dom build with **no backend at runtime** — articles are bundled into the JS at build time. Tailwind is loaded via the CDN script in `index.html` (no PostCSS/Tailwind build step).

### Routing and content flow

- `App.tsx` uses `BrowserRouter`. It used to use `HashRouter`, which put every article behind a URL fragment (`/#/slug`); Google discards fragments, so the whole site was one crawlable URL and AdSense rejected it as low value content. Do not switch back.
- Because there is no server, `scripts/prerender.mjs` writes a real HTML file per route into `dist/` after the build (`dist/om-oss/index.html`, `dist/<slug>/index.html`, …). Netlify resolves `/om-oss` to `dist/om-oss/index.html` on its own, so no `_redirects` rewrite is needed, and unknown paths fall through to `dist/404.html` with a real 404 status.
- Routes: `/` (HomePage), `/explore` (ExplorePage with Google Maps view), `/kategori/:categorySlug` (CategoryPage), `/om-oss`, `/kontakt`, `/integritetspolicy`, `/villkor`, `/redaktionen` (EditorialTeamPage), `/redaktionen/:authorSlug` (AuthorPage), `/:slug` (ArticlePage) as the catch-all, and `*` (NotFoundPage). The static pages share `components/StaticPage.tsx`; react-router ranks literal segments above `:slug`, so declaration order does not matter, but keep the catch-all last for readability.
- `App.tsx` exports `AppRoutes` (the tree without a router) alongside the default `App`. The browser entry wraps it in `BrowserRouter`; `scripts/entry-server.tsx` wraps the same tree in `StaticRouter`. Anything added to one must be visible to the other or the prerendered page will not match what the visitor gets.
- Nothing rendered during the render pass may touch `window`, `document` or `localStorage` — the prerenderer runs in Node and will fail the build. `useEffect` is fine. `components/AdSense.tsx` and `pages/ArticlePage.tsx` both had to be fixed for this.
- `index.tsx` rewrites legacy `/#/slug` URLs to `/slug` before React mounts, so links shared while the site ran on HashRouter still work.
- The article store is a single static array. Read path:
  - `src/data/articles.ts` exports `articles` (array literal).
  - `src/constants.ts` re-exports it as `ARTICLES: Article[]` and also defines `ADSENSE_CONFIG`.
  - `services/articleService.ts` is the only thing UI code should call (`getAllArticles`, `getArticleBySlug`, `getRelatedArticles`); it sorts by `publishedAt` descending.
- `Article` shape is in the root `types.ts`. `content` is `string[]` — one entry per paragraph — specifically so ad slots can be inserted between paragraphs. An entry beginning `## ` renders as an `<h2>` instead (see `Block` in `pages/ArticlePage.tsx`). No other markdown is interpreted: `**bold**` and `*   ` list markers ship as literal asterisks, which is what the pre-2026-08 articles did.
- Categories live in `src/categories.ts`, which maps the exact string stored on articles (`Mat & Dryck`) to a URL slug (`mat-och-dryck`) plus the title and description used on the category page. The nav in `components/Layout.tsx` is built from `populatedCategories()`, so a category with no articles is not linked anywhere; `Sport` and `Event` are currently in that state. Filtering by `?category=` no longer exists.
- Bylines are named and resolve to a person. `src/authors.ts` holds the profiles behind `/redaktionen/<slug>`; `article.author` must match an `AUTHORS[].name` or the byline renders as plain text with no link. Do not reintroduce bylines like `Peter AI assisted` — how AI is used editorially belongs on `/om-oss`, not in an author field.

### SEO and crawlability

This is the part the AdSense rejection was about, so it is worth knowing before changing anything near it.

- `src/site.ts` holds the canonical origin (`SITE_URL`, currently `https://gotoburg.se`, overridable with a `SITE_URL` env var at build time). Every canonical link, Open Graph URL, JSON-LD id and sitemap entry is derived from it. It must name the hostname that actually answers 200: `https://www.gotoburg.se/om-oss` 301s to `https://gotoburg.se/om-oss`, so pointing this at www would send every canonical through a redirect.
- `src/seo.ts` builds the per-route metadata. `allRoutes(articles)` returns every URL the site publishes with its title, description, canonical, OG fields and JSON-LD. It is the single source for both what gets prerendered and what goes in `sitemap.xml`, so a route missing from it is a route Google never sees.
- `scripts/prerender.mjs` walks that list, renders each route via `scripts/entry-server.tsx`, injects the head tags into the built `index.html` shell and writes the file. It also emits `sitemap.xml`, `robots.txt` and `404.html`, and it fails the build if any route renders under 500 bytes.
- Structured data per page type: `NewsArticle` + `BreadcrumbList` on articles, `CollectionPage` on categories, `ProfilePage` on author pages, `WebSite` + `Organization` on the home page.
- `tests/e2e/seo.spec.ts` asserts all of this against the served HTML using `page.request`, which runs no JavaScript. If a change makes the site client-rendered again, those tests go red where the rest of the suite would stay green.

### Images

Every article image is a Wikimedia Commons file under a licence that permits commercial reuse, downloaded into `public/img/` and served from our own origin.

- `scripts/images.manifest.json` maps each article slug to its Commons file titles, lead image first. It is the only place images are chosen.
- `node scripts/fetch-images.mjs` reads that manifest, queries the Commons API for licence and author, **aborts the whole run** if any file is missing, unattributed, or under a licence outside the allowlist (CC0, CC BY, CC BY-SA, public domain), then downloads a 1200px rendition and writes `imageCredit` back onto the article.
- `article.imageUrl` must stay a site-relative `/img/...` path. Do not hotlink. Before August 2026 the articles pulled 25 images from `media.cylex.se`, `scontent.fbcdn.net`, `via.tt.se`, `cms.goteborg.com`, `imageproxy.wolt.com` and the venues' own sites; none was licensed, and two already returned 403.
- CC BY and CC BY-SA require attribution wherever the work appears. `components/ImageCredit.tsx` renders it under the image on the article page, and `/bildkredit` lists every image on the site. Removing either breaks the licence terms, not just the styling.
- Public domain files have no `licenceUrl`. Handle that case rather than rendering an empty `href`.

### Google Search Console

The property is a **URL-prefix property for `https://gotoburg.se/`**, created on 2026-08-19 and verified. URL prefix rather than Domain because Domain requires a DNS TXT record; URL prefix accepts the two methods the site can carry itself.

- It is verified **twice**, both methods confirmed in the console. Google Analytics verified it automatically off the `G-E8GTTBK08V` gtag.js snippet in `index.html`; the HTML tag was confirmed once the meta tag went live in production. Google drops the analytics verification if that snippet ever goes away, which is why both are in place; do not treat either as redundant.
- The ownership token lives in `GOOGLE_SITE_VERIFICATION` in `src/site.ts` (`92VWYdQb...`), emitted by `scripts/prerender.mjs` as `<meta name="google-site-verification">` on every prerendered page. It is public by design. A `GOOGLE_SITE_VERIFICATION` build environment variable overrides it, which is what a second property on another host would use.
- `tests/e2e/seo.spec.ts` asserts the tag on four routes. Without it a dropped tag passes the build silently and nothing notices until the analytics snippet is removed and the property unverifies.
- The build prints whether the tag is present. If it says `NOT SET`, verification will fail no matter what Search Console says.
- The property you verify must match `SITE_URL`. Verifying `gotoburg.netlify.app` does nothing for `gotoburg.se`.
- `sitemap.xml` is submitted and reads **Success, 35 discovered pages**, which matches the route count the build prints. It is regenerated on every build, so it never needs re-submitting after a content change; Google re-fetches it.
- The homepage was already indexed, but with the pre-fix crawl, so it was pushed into the priority crawl queue via URL inspection. Requesting indexing again for the same URL does not improve its queue position, so do not re-request it in the hope of speeding things up.
- Measured immediately before the merge on 2026-08-19, production still served the old SPA: `/sitemap.xml`, `/robots.txt` and `/om-oss` all returned 404 and only `/` answered 200. That was the state AdSense reviewed. After the deploy all 35 routes answer 200 and an unknown path returns a real 404.

### Admin tool (separate process, not part of the deployed site)

`admin/server.js` is a zero-dependency Node http server (port 3001) that mutates `src/data/articles.ts` directly: it reads the file as text, slices between the first `[` and last `]`, JSON-parses, mutates, and rewrites the file as `export const articles = ${JSON.stringify(...)};`. Implications:

- Anything that breaks that "single array literal" shape in `articles.ts` will break the admin tool. Don't add other top-level statements, comments inside the array, or a different export style.
- The admin tool also exposes `POST /api/generate-article`, which calls Gemini (`gemini-2.0-flash-exp`) using `GOOGLE_API_KEY` or `GEMINI_API_KEY` from `.env.local`.
- Workflow: stop `npm run dev`, run `npm run admin`, edit at http://localhost:3001, then restart `npm run dev` (or rely on HMR) — published articles ship by re-running `npm run build`.

### Third-party integrations

- **Google Maps** (`components/GoogleMapSection.tsx`, used by ExplorePage): requires `VITE_GOOGLE_MAPS_API_KEY` in `.env.local` locally, and as a Netlify env var in production. Uses Maps JavaScript API + Geocoding API. Articles can carry an optional `googleMapsUrl`.
- **Google Analytics**: gtag is hardcoded in `index.html` (`G-E8GTTBK08V`). `components/AnalyticsTracker.tsx` fires SPA pageviews on route change.
- **AdSense**: publisher ID `ca-pub-2203695397498260` is wired into `index.html` and `src/constants.ts` (`ADSENSE_CONFIG`). Ad slots are inserted via `components/AdSense.tsx` at: header (`Layout.tsx`), home feed middle + sidebar (`HomePage.tsx`), in-article + sidebar (`ArticlePage.tsx`). The README's "replace ca-pub-XXXX" instructions are stale — the real publisher ID is already in place.
- **Consent Mode v2**: `index.html` sets `ad_storage`, `ad_user_data`, `ad_personalization` and `analytics_storage` to `denied` *before* `gtag.js` and `adsbygoogle.js` load. `components/CookieConsent.tsx` sends the `consent` `update` after the visitor chooses and stores the choice in `localStorage` under `gotoburg:consent`. Anything that loads a Google tag earlier in `<head>`, or that drops the default block, breaks EEA compliance and the AdSense application with it. `playwright.config.ts` pre-answers the banner via `storageState` so it does not overlay the footer during tests; `tests/e2e/consent.spec.ts` opts back out.

### Deployment

Netlify, site `gotoburg` (https://gotoburg.netlify.app/, custom domain `gotoburg.se` with `www.` redirecting to it). Deploy = upload the `dist/` output, not the source. `VITE_GOOGLE_MAPS_API_KEY` must be configured in Netlify env vars; `.env.local` must not be committed.

`dist/` contains a flat `.html` file per route (`dist/om-oss.html`, `dist/kategori/mat-och-dryck.html`), not a directory per route. Netlify serves `/om-oss` from `dist/om-oss.html` with a 200 and no redirect; a directory would have 301ed `/om-oss` to `/om-oss/`, which every canonical URL on the site says is wrong. Unmatched paths serve `dist/404.html` with a real 404 status. Do not add a catch-all `/* /index.html 200` rewrite: it would turn every prerendered page back into the empty SPA shell and every 404 into a soft 200.

Only one hostname should serve the site. Measured on 2026-08-18: `gotoburg.se` answers 200, `www.gotoburg.se` 301s to it (path preserved), and `gotoburg.netlify.app` served an unredirected duplicate. `SITE_URL` therefore names the apex. `goteburg.se` did not resolve at all, so treat the claim that it is a live custom domain as stale.

`netlify.toml` now 301s `gotoburg.netlify.app` to the apex on both schemes. Two things about those rules are load-bearing:

- The host in `from` scopes a rule to that hostname. Deploy previews and branch deploys are served from `deploy-preview-N--gotoburg.netlify.app` and `branch--gotoburg.netlify.app`, which do not match, so previews keep serving themselves.
- `force = true` is required. An unforced rule only fires when no file matches the path, and after prerendering every path has a file.

Never write a rule whose `from` host is `gotoburg.se`: with `force` it redirects the apex to itself and takes the site down with a redirect loop. `tests/e2e/redirects.spec.ts` asserts exactly that, because the Playwright run serves `dist/` with `scripts/serve-dist.mjs`, which implements Netlify's file resolution but not its redirect engine, so no other test can reach these rules.

## Notes on the codebase shape

- `src/constants.ts` + `src/data/articles.ts` are the source of truth for articles. A second `constants.ts` used to sit at the repo root with its own inline `ARTICLES` array; nothing imported it, and its demo entries carried a byline (`Johan Andersson`) that is not in `AUTHORS` and dates in a different format (`24 oktober 2023`, not ISO), so anything that had started importing it would have rendered link-less bylines and broken sorting. Deleted 2026-08-19; do not reintroduce a second article array.
- Articles run roughly 550 to 725 words with `## ` subheadings. They were rewritten from ~350-word stubs in August 2026 because AdSense rejected the site for low value content. Adding a new 300-word stub reopens that problem.
- Production deployment note: the three articles added in May 2026 (Hyssnaleden, Hoze, Activate Nordstan) required a rebuild to include in the production bundle.
- `index.html` contains an unused importmap (CDN versions of React 19 / Vite 7) — the actual build uses the npm React 18 from `package.json`. Don't be misled by it.
