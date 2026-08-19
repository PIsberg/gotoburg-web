/**
 * Renders the brand assets the markup references but the repo never contained:
 * public/logo.png (schema.org Organization logo, on every page) and the two
 * favicon sizes. Both were 404s in production, which silently invalidates the
 * Organization logo property and leaves browsers requesting /favicon.ico.
 *
 * Maintenance tool, not part of the build. Run it after changing the wordmark:
 *
 *   node scripts/make-brand-assets.mjs
 *
 * Chromium does the rasterising because Playwright is already a dependency and
 * nothing else in the toolchain can turn text into a PNG. The type stack and
 * colour match components/Layout.tsx: Tailwind font-serif, font-black,
 * tracking-tight, text-gray-900.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, 'public');

const SERIF = 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif';
const INK = '#111827';

const page = (width, height, body) => `<!doctype html>
<html><head><meta charset="utf-8"><style>
  html, body { margin: 0; padding: 0; }
  body { width: ${width}px; height: ${height}px; display: flex;
         align-items: center; justify-content: center; }
</style></head><body>${body}</body></html>`;

const wordmark = (width, height) =>
  page(
    width,
    height,
    `<div style="background:#fff;width:100%;height:100%;display:flex;
                 align-items:center;justify-content:center;">
       <span style="font-family:${SERIF};font-weight:900;letter-spacing:-0.025em;
                    color:${INK};font-size:${Math.round(height * 0.46)}px;
                    line-height:1;">GotoBurg</span>
     </div>`,
  );

const monogram = (size) =>
  page(
    size,
    size,
    `<div style="background:${INK};width:100%;height:100%;display:flex;
                 align-items:center;justify-content:center;">
       <span style="font-family:${SERIF};font-weight:900;letter-spacing:-0.03em;
                    color:#fff;font-size:${Math.round(size * 0.68)}px;
                    line-height:1;">G</span>
     </div>`,
  );

const ASSETS = [
  // Organization logo. Wide wordmark rather than a square: it is read as a
  // logo, and 160px clears Google's 112px minimum height comfortably.
  { file: 'logo.png', width: 600, height: 160, html: wordmark(600, 160) },
  { file: 'favicon-32.png', width: 32, height: 32, html: monogram(32) },
  { file: 'favicon-180.png', width: 180, height: 180, html: monogram(180) },
];

const browser = await chromium.launch();
try {
  for (const asset of ASSETS) {
    const view = await browser.newPage({
      viewport: { width: asset.width, height: asset.height },
      deviceScaleFactor: 1,
    });
    await view.setContent(asset.html, { waitUntil: 'load' });
    const buffer = await view.screenshot({ type: 'png' });
    fs.writeFileSync(path.join(outDir, asset.file), buffer);
    await view.close();
    console.log(`${asset.file.padEnd(18)} ${asset.width}x${asset.height}  ${buffer.length} bytes`);
  }
} finally {
  await browser.close();
}
