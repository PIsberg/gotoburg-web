import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3001;
// Pointing to the new TS file
const DATA_FILE = path.join(__dirname, '../src/data/articles.ts');

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  
  if (req.method === 'GET' && req.url === '/') {
    // Serve the HTML form
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
  else if (req.method === 'POST' && req.url === '/api/articles') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const formData = JSON.parse(body);
        
        // Read existing file
        const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
        
        // Extract the JSON array part from the TS file
        const jsonStartIndex = fileContent.indexOf('[');
        const jsonEndIndex = fileContent.lastIndexOf(']') + 1;
        const jsonString = fileContent.substring(jsonStartIndex, jsonEndIndex);
        
        const articles = JSON.parse(jsonString);

        // Generate ID (simple logic: max ID + 1)
        const maxId = articles.reduce((max, art) => Math.max(max, parseInt(art.id) || 0), 0);
        const newId = (maxId + 1).toString();

        // Generate Slug
        const slug = formData.title
          .toLowerCase()
          .replace(/[åä]/g, 'a')
          .replace(/ö/g, 'o')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');

        // Use ISO Date format (YYYY-MM-DD)
        const isoDate = new Date().toISOString().split('T')[0];

        // Create new article object
        const newArticle = {
          id: newId,
          slug: slug,
          title: formData.title,
          excerpt: formData.excerpt,
          content: formData.content.split('\n').filter(line => line.trim() !== ''), // Split paragraphs
          author: formData.author,
          publishedAt: isoDate,
          category: formData.category,
          imageUrl: formData.imageUrl || `https://picsum.photos/800/400?random=${newId}`
        };

        // Add to array (unshift to put it at the top/newest)
        articles.unshift(newArticle);

        // Reconstruct the file content
        const newFileContent = `export const articles = ${JSON.stringify(articles, null, 2)};`;

        // Write back to file
        fs.writeFileSync(DATA_FILE, newFileContent, 'utf8');
        
        console.log(`Saved new article "${newArticle.title}" to ${DATA_FILE}`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, article: newArticle }));
      } catch (e) {
        console.error(e);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Admin tool running at http://localhost:${PORT}`);
});