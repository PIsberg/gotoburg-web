<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# GotoBurg

A Swedish-language local news and lifestyle site for Gothenburg. Built with React 18, Vite, and Tailwind CSS.

- **Live site:** https://gotoburg.netlify.app/
- **Custom domains:** www.gotoburg.se / goteburg.se

## Quick Start

**Prerequisites:** Node.js

1. Install dependencies:
   ```
   npm install
   ```

2. Start the dev server:
   ```
   npm run dev
   ```

## Available Commands

- `npm run dev` — Start Vite dev server for the public site
- `npm run build` — Build static site to `dist/` (deploy this folder to Netlify)
- `npm run preview` — Preview the production build locally
- `npm run admin` — Start the admin tool on http://localhost:3001

## Adding & Managing Articles

Use the admin tool to create, edit, and delete articles:

1. Stop the dev server (Ctrl+C)
2. Run `npm run admin`
3. Open http://localhost:3001 in your browser
4. Fill out the form and click "Publicera Artikel"
5. Restart `npm run dev` to see changes immediately

The admin tool saves articles to `src/data/articles.ts`. When you run `npm run build`, articles are bundled into the static site.

### Generating Articles with AI

The admin tool can generate article drafts using Google's Gemini API:

1. Create or edit `.env.local` in the project root
2. Add your API key: `GEMINI_API_KEY=YOUR_KEY_HERE` (or `GOOGLE_API_KEY`)
3. Use the "Generate med AI" feature in the admin tool

### Article Structure

Articles follow this schema (edit in admin tool):

- **Slug:** URL identifier (lowercase, hyphens) — e.g., `nytt-kallbadhus-oppnar`
- **Category:** One of: Mat & Dryck, Natur, Arbete, Aktiviteter, Kultur, Sport, Vad är på gång, Event
- **Content:** Array of paragraphs (ad slots can be inserted between them)
- **Google Maps URL:** Optional. The `@lat,lng` in the share link supplies the coordinates for the map on the Explore page, and the link itself is shown as "Visa på Google Maps"

## The map on /explore

The map is Leaflet with OpenStreetMap tiles. It needs no API key, no Google Cloud
project and no configuration, locally or in production. Coordinates come from each
article's optional Google Maps URL, parsed by `placeCoordinates()` in
`components/MapSection.tsx`.

The OpenStreetMap attribution shown on the map is a licence requirement (ODbL),
not styling. Do not remove it.

## Deployment

### Build

```
npm run build
```

This creates a `dist/` folder with the static site.

### Deploy to Netlify

1. Upload the `dist/` folder (not the source code)
2. No environment variable is needed for the map; `VITE_ADSENSE_ENABLED=true` goes in once AdSense approves the site
3. Site will be live at https://gotoburg.netlify.app/

## Integrations

- **Google Analytics:** Configured in `index.html` (tracks SPA route changes)
- **Google AdSense:** Publisher ID `ca-pub-2203695397498260` (ads auto-inject between article paragraphs and in sidebars)
- **Map:** Leaflet + OpenStreetMap on the Explore page; articles can include an optional `googleMapsUrl` that supplies the coordinates

## Project Structure

- `src/` — React source code
- `src/data/articles.ts` — Article data (managed via admin tool)
- `src/constants.ts` — Global config (ARTICLES, ADSENSE_CONFIG)
- `src/services/articleService.ts` — Article lookup and filtering
- `dist/` — Built static site (created by `npm run build`)
- `admin/` — Admin tool (separate Node server on port 3001)

## Architecture Notes

- **Static generation:** Articles bundled at build time, no backend at runtime
- **Routing:** Hash-based (`/#/slug`) for deployment without server rewrites
- **Admin mutations:** Direct file edits to `src/data/articles.ts` (shape must be preserved as `export const articles = [...]`)
