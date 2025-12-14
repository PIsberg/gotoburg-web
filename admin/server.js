import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3001;
const DATA_FILE = path.join(__dirname, '../src/data/articles.ts');

// --- Helper Functions ---

function readArticles() {
  const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
  const jsonStartIndex = fileContent.indexOf('[');
  const jsonEndIndex = fileContent.lastIndexOf(']') + 1;
  const jsonString = fileContent.substring(jsonStartIndex, jsonEndIndex);
  return JSON.parse(jsonString);
}

function saveArticles(articles) {
  const newFileContent = `export const articles = ${JSON.stringify(articles, null, 2)};`;
  fs.writeFileSync(DATA_FILE, newFileContent, 'utf8');
}

function generateSlug(text) {
  return text.toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// --- Server ---

const server = http.createServer((req, res) => {
  // CORS & Preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Parse body for write operations
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', async () => {
    try {
      // 1. GET ALL ARTICLES
      if (req.method === 'GET' && req.url === '/api/articles') {
        const articles = readArticles();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(articles));
      }

      // 2. CREATE NEW ARTICLE
      else if (req.method === 'POST' && req.url === '/api/articles') {
        const formData = JSON.parse(body);
        const articles = readArticles();

        const maxId = articles.reduce((max, art) => Math.max(max, parseInt(art.id) || 0), 0);
        const newId = (maxId + 1).toString();

        const newArticle = {
          id: newId,
          slug: generateSlug(formData.title),
          title: formData.title,
          excerpt: formData.excerpt,
          content: formData.content.split('\n').filter(line => line.trim() !== ''),
          author: formData.author,
          publishedAt: new Date().toISOString().split('T')[0],
          category: formData.category,
          imageUrl: formData.imageUrl || `https://picsum.photos/800/400?random=${newId}`,
          additionalImages: formData.additionalImages || []
        };

        articles.unshift(newArticle);
        saveArticles(articles);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, article: newArticle }));
      }

      // 3. UPDATE EXISTING ARTICLE
      else if (req.method === 'PUT' && req.url.startsWith('/api/articles/')) {
        const id = req.url.split('/').pop();
        const formData = JSON.parse(body);
        const articles = readArticles();

        const index = articles.findIndex(a => a.id === id);
        if (index === -1) {
          throw new Error('Article not found');
        }

        const updatedArticle = {
          ...articles[index],
          title: formData.title,
          slug: generateSlug(formData.title), // Re-generate slug if title changed (optional but consistent)
          category: formData.category,
          author: formData.author,
          excerpt: formData.excerpt,
          imageUrl: formData.imageUrl,
          additionalImages: formData.additionalImages || [],
          content: typeof formData.content === 'string'
            ? formData.content.split('\n').filter(line => line.trim() !== '')
            : formData.content
        };

        // Preserve publishedAt unless explicitly changed (not in this form) but update logic is here

        articles[index] = updatedArticle;
        saveArticles(articles);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, article: updatedArticle }));
      }

      // 4. DELETE ARTICLE
      else if (req.method === 'DELETE' && req.url.startsWith('/api/articles/')) {
        const id = req.url.split('/').pop();
        let articles = readArticles();

        const initialLength = articles.length;
        articles = articles.filter(a => a.id !== id);

        if (articles.length === initialLength) {
          throw new Error('Article not found');
        }

        saveArticles(articles);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      }

      // 5. AI GENERATION
      else if (req.method === 'POST' && req.url === '/api/generate-article') {
        const { source } = JSON.parse(body);
        const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

        if (!apiKey) {
          console.error('API Key missing!');
          throw new Error('Ingen API-nyckel konfigurerad. Kontrollera .env.local');
        } else {
          console.log(`Using API Key: ${apiKey.substring(0, 5)}...`);
        }

        const prompt = `
          Du är journalist på GotoBurg. Skriv nyhetsartikel på svenska.
          VIKTIGT: Svara ENDAST med giltig JSON.
          Använd exakt dessa nycklar: "title", "excerpt", "content".
          Översätt INTE nycklarna.
          KÄLLA: ${source}
        `;

        const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        });

        if (!apiResponse.ok) throw new Error(await apiResponse.text());

        const data = await apiResponse.json();
        let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        console.log('Raw AI Response:', rawText);

        if (!rawText) throw new Error('Ingen text genererades');

        // Robust JSON extraction
        const jsonStartIndex = rawText.indexOf('{');
        const jsonEndIndex = rawText.lastIndexOf('}') + 1;

        try {
          // Parse string to object/array
          let parsed;

          if (jsonStartIndex !== -1 && jsonEndIndex > jsonStartIndex) {
            parsed = JSON.parse(rawText.substring(jsonStartIndex, jsonEndIndex));
          } else {
            const clean = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            parsed = JSON.parse(clean);
          }

          // Handle if AI returned an array [ { ... } ]
          if (Array.isArray(parsed)) {
            console.log('AI returned an array, picking first item.');
            parsed = parsed.length > 0 ? parsed[0] : {};
          }

          if (!parsed.title || !parsed.content) {
            console.warn('Missing keys in JSON:', Object.keys(parsed));
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(parsed));

        } catch (e) {
          console.error('Invalid JSON received:', rawText);
          res.writeHead(200, { 'Content-Type': 'application/json' }); // Send 200 to let frontend show the raw text warning
          res.end(JSON.stringify({ error: "JSON Parse Error", raw: rawText }));
        }
      }

      // 6. SERVE HTML
      else if (req.method === 'GET' && req.url === '/') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
          if (err) {
            res.writeHead(500);
            res.end('Error loading admin page');
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data);
        });
      }

      else {
        res.writeHead(404);
        res.end('Not found');
      }

    } catch (e) {
      console.error(e);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
  });

});

server.listen(PORT, () => {
  console.log(`Admin tool running at http://localhost:${PORT}`);
});