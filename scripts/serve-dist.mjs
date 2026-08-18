import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Static server for dist/ that resolves URLs the way Netlify does.
 *
 * `vite preview` cannot stand in for the deployed site here: it serves the SPA
 * fallback index.html for every path, so /om-oss returns the home page and the
 * per-route HTML that scripts/prerender.mjs writes is never exercised. A suite
 * running against it would pass while the prerender was completely broken.
 *
 * Netlify's rules, and therefore these:
 *   /path        -> dist/path            (exact file)
 *   /path        -> dist/path/index.html (directory index, "pretty URLs")
 *   anything else-> dist/404.html with a 404 status
 */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const port = Number(process.argv[2] ?? 4173);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8',
};

const readable = filePath => {
  try {
    return fs.statSync(filePath).isFile() ? filePath : null;
  } catch {
    return null;
  }
};

const resolve = urlPath => {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  // Reject anything that climbs out of dist/.
  const target = path.normalize(path.join(root, decoded));
  if (!target.startsWith(root)) return null;
  return readable(target) ?? readable(path.join(target, 'index.html'));
};

http
  .createServer((req, res) => {
    const file = resolve(req.url ?? '/');
    if (!file) {
      const notFound = readable(path.join(root, '404.html'));
      res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
      res.end(notFound ? fs.readFileSync(notFound) : 'Not found');
      return;
    }
    res.writeHead(200, {
      'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream',
      'cache-control': 'no-store',
    });
    res.end(fs.readFileSync(file));
  })
  .listen(port, () => {
    console.log(`serving dist/ on http://localhost:${port} (Netlify-style resolution)`);
  });
