<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1AWguCJdpDURpTzR9ch6KXmygUwPUwP76

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

How to add a new article
Based on the current architecture of the application, the articles are stored as a static array of objects. To add a new article, you need to manually append a new entry to the data file.
Here are the exact steps:
Open the file constants.ts.
Locate the ARTICLES array. It starts with export const ARTICLES: Article[] = [.
Add a new object inside this array (usually at the top if you want it to appear first, or at the bottom).
Ensure the object matches the following structure, specifically using one of your defined categories (Mat & Dryck, Natur, Arbete, or Aktiviteter).
Here is a code snippet you can copy and paste into constants.ts to test it:
code
TypeScript
{
    id: '6', // Ensure this ID is unique
    slug: 'nytt-vinterbadhus-oppnar', // This becomes the URL: domain.com/#/nytt-vinterbadhus-oppnar
    title: 'Nytt kallbadhus öppnar i hamnen',
    excerpt: 'Vinterbadare kan glädjas – nu står stadens modernaste kallbadhus redo för säsongen.',
    author: 'Lars Westkust',
    publishedAt: '26 oktober 2023',
    category: 'Aktiviteter', // Must match one of your header categories exactly
    imageUrl: 'https://picsum.photos/800/400?random=20', // URL to an image
    content: [
      "Intresset för kallbad har exploderat och nu möter staden efterfrågan med en helt ny anläggning vid piren.",
      "Det nya badhuset erbjuder tre olika bastur med panoramafönster ut mot havet, samt direkttrappa ner i det kalla vattnet.",
      "– Vi ville skapa en mötesplats för alla, oavsett om man är en inbiten vinterbadare eller nybörjare, säger projektledaren.",
      "Anläggningen kommer att hålla öppet året runt och har även ett litet café som serverar värmande soppor och kaffe.",
      "Invigningen sker på lördag klockan 10:00 med gratis provbad för de 50 första besökarna."
    ]
  },
Key Fields Explanation:
slug: This acts as the URL link. Use lowercase letters and hyphens (e.g., min-artikel-titel).
content: This is an array of strings. Each string represents a separate paragraph in the article body.
category: Ensure this matches Mat & Dryck, Natur, Arbete, or Aktiviteter so the "Filed Under" logic works correctly.