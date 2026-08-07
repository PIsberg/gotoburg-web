# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm install` — install dependencies
- `npm run dev` — start the Vite dev server for the public site
- `npm run build` — build the static site to `dist/` (this is what gets deployed to Netlify, not the source folder)
- `npm run preview` — preview the production build
- `npm run admin` — start the local admin tool on http://localhost:3001 (loads `.env.local` via `node --env-file`)
- `npm run test:e2e` — run the Playwright suite in `tests/e2e/` against a production preview build on port 4173 (`npm run test:e2e:ui` for the UI runner). This also runs in CI on every PR.

There is no linter or typechecker wired into npm scripts. `npx tsc --noEmit` currently fails with TS6305 on `vite.config.ts`, a pre-existing project-reference config issue, not a code error.

## Architecture

GotoBurg is a Swedish-language local-news/lifestyle SPA (Gothenburg, "wetcoasten"). The site is a fully static Vite + React 18 + react-router-dom build with **no backend at runtime** — articles are bundled into the JS at build time. Tailwind is loaded via the CDN script in `index.html` (no PostCSS/Tailwind build step).

### Routing and content flow

- `App.tsx` uses `HashRouter` deliberately so the deployed site does not need server-side URL rewrites. Routes: `/` (HomePage), `/explore` (ExplorePage with Google Maps view), the static pages `/om-oss`, `/kontakt`, `/integritetspolicy` and `/villkor`, and `/:slug` (ArticlePage) as the catch-all. The static pages share `components/StaticPage.tsx`; react-router ranks literal segments above `:slug`, so declaration order does not matter, but keep the catch-all last for readability.
- The article store is a single static array. Read path:
  - `src/data/articles.ts` exports `articles` (array literal).
  - `src/constants.ts` re-exports it as `ARTICLES: Article[]` and also defines `ADSENSE_CONFIG`.
  - `services/articleService.ts` is the only thing UI code should call (`getAllArticles`, `getArticleBySlug`, `getRelatedArticles`); it sorts by `publishedAt` descending.
- `Article` shape is in the root `types.ts`. `content` is `string[]` — one entry per paragraph — specifically so ad slots can be inserted between paragraphs.
- The home page reads a `?category=...` query param to filter; categories are hardcoded in `components/Layout.tsx` nav and must match the strings stored on articles (e.g. `Mat & Dryck`, `Natur`, `Arbete`, `Aktiviteter`, `Kultur`, `Sport`, `Vad är på gång`, `Event`).

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

## Notes on the codebase shape

- Two parallel "constants" surfaces exist: root `constants.ts` (older, contains an inline `ARTICLES` array fallback) and `src/constants.ts` (current, what the app imports from). Treat `src/constants.ts` + `src/data/articles.ts` as the source of truth.
- Production deployment note: the three articles added in May 2026 (Hyssnaleden, Hoze, Activate Nordstan) required a rebuild to include in the production bundle.
- `index.html` contains an unused importmap (CDN versions of React 19 / Vite 7) — the actual build uses the npm React 18 from `package.json`. Don't be misled by it.
