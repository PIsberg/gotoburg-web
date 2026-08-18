# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm install` — install dependencies
- `npm run dev` — start the Vite dev server for the public site
- `npm run build` — full production build: `build:client` (Vite), then `build:ssr` (an SSR bundle of `scripts/entry-server.tsx` into `.ssr/`), then `prerender`. This is what gets deployed to Netlify, not the source folder.
- `npm run prerender` — run `scripts/prerender.mjs` alone against an existing `dist/` and `.ssr/`
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

- `src/site.ts` holds the canonical origin (`SITE_URL`, currently `https://www.gotoburg.se`, overridable with a `SITE_URL` env var at build time). Every canonical link, Open Graph URL, JSON-LD id and sitemap entry is derived from it. Google treats `www.gotoburg.se` and `goteburg.se` as different sites, so this must name exactly one.
- `src/seo.ts` builds the per-route metadata. `allRoutes(articles)` returns every URL the site publishes with its title, description, canonical, OG fields and JSON-LD. It is the single source for both what gets prerendered and what goes in `sitemap.xml`, so a route missing from it is a route Google never sees.
- `scripts/prerender.mjs` walks that list, renders each route via `scripts/entry-server.tsx`, injects the head tags into the built `index.html` shell and writes the file. It also emits `sitemap.xml`, `robots.txt` and `404.html`, and it fails the build if any route renders under 500 bytes.
- Structured data per page type: `NewsArticle` + `BreadcrumbList` on articles, `CollectionPage` on categories, `ProfilePage` on author pages, `WebSite` + `Organization` on the home page.
- `tests/e2e/seo.spec.ts` asserts all of this against the served HTML using `page.request`, which runs no JavaScript. If a change makes the site client-rendered again, those tests go red where the rest of the suite would stay green.

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

Netlify, site `gotoburg` (https://gotoburg.netlify.app/, custom domains `www.gotoburg.se` / `goteburg.se`). Deploy = upload the `dist/` output, not the source. `VITE_GOOGLE_MAPS_API_KEY` must be configured in Netlify env vars; `.env.local` must not be committed.

`dist/` now contains a directory per route rather than a single `index.html`. Netlify's default static resolution handles that (`/om-oss` serves `dist/om-oss/index.html`, unmatched paths serve `dist/404.html` with a 404 status), so do not add a catch-all `/* /index.html 200` rewrite: it would turn every prerendered page back into the empty SPA shell and every 404 into a soft 200.

Only one hostname should serve the site. `SITE_URL` in `src/site.ts` names `www.gotoburg.se` as canonical, so the other domains should 301 to it in Netlify's domain settings rather than serving duplicate copies.

## Notes on the codebase shape

- Two parallel "constants" surfaces exist: root `constants.ts` (older, contains an inline `ARTICLES` array fallback) and `src/constants.ts` (current, what the app imports from). Treat `src/constants.ts` + `src/data/articles.ts` as the source of truth.
- Articles run roughly 550 to 725 words with `## ` subheadings. They were rewritten from ~350-word stubs in August 2026 because AdSense rejected the site for low value content. Adding a new 300-word stub reopens that problem.
- Production deployment note: the three articles added in May 2026 (Hyssnaleden, Hoze, Activate Nordstan) required a rebuild to include in the production bundle.
- `index.html` contains an unused importmap (CDN versions of React 19 / Vite 7) — the actual build uses the npm React 18 from `package.json`. Don't be misled by it.
