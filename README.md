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
2. Run the app:
   `npm run dev`

* How to add a new article manually (deprecated use admin)
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

* To integrate your real Google AdSense account into GotoBurg, you need to perform three specific tasks: Connect your account, Update the Component logic, and Assign specific Ad Slots.
Here are the exact steps:
Step 1: Add your Publisher ID (Global Connection)
This connects the website to your specific AdSense account.
Open index.html.
Locate the commented-out AdSense script section inside the <head> tag.
Uncomment it and replace ca-pub-XXXXXXXXXXXXX with your actual Publisher ID (found in your AdSense Dashboard > Account > Settings > Account Information).
Change this in index.html:
code
Html
<!-- BEFORE -->
<!-- <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXX" crossorigin="anonymous"></script> -->

<!-- AFTER (Replace numbers with yours) -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456" crossorigin="anonymous"></script>
Step 2: Update the Ad Component logic
Currently, components/AdSense.tsx is just a visual placeholder (a grey box). You need to change it to render the actual Google code.
Open components/AdSense.tsx.
Replace the entire file content with the code below. This code handles the injection of the ad into React.
code
Tsx
import React, { useEffect, useRef } from 'react';
import { AdUnitProps } from '../types';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdSense: React.FC<AdUnitProps> = ({ slot, format = 'auto', className = '', label = 'Annons' }) => {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    // This pushes the ad request to Google when the component mounts
    try {
      if (adRef.current && adRef.current.innerHTML === "") {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error("AdSense error", e);
    }
  }, []);

  return (
    <div className={`w-full my-6 flex flex-col items-center justify-center ${className}`}>
      {/* Label for compliance */}
      <span className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">{label}</span>
      
      {/* The actual Google Ad Container */}
      <div className="w-full bg-gray-50 min-h-[100px] flex justify-center">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block', width: '100%' }}
          data-ad-client="ca-pub-YOUR_PUBLISHER_ID_HERE" 
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        ></ins>
      </div>
    </div>
  );
};


export default AdSense;
Note: In the code above, replace ca-pub-YOUR_PUBLISHER_ID_HERE with your actual ID again.
Step 3: Configure your Ad Slots
You need to generate specific "Ad Units" in your AdSense dashboard (e.g., "Homepage Header", "Article Sidebar") and get their Slot IDs.
Go to AdSense Dashboard > Ads > By ad unit.
Create "Display ads" for the different sections of your site.
Copy the data-ad-slot number (e.g., 1234567890) for each unit.
Now, update these files with those numbers:
A. Header Ad
File: components/Layout.tsx
Find: <AdSense slot="header-banner-12345" ... />
Action: Change header-banner-12345 to your real ID.
B. Home Page Feed Ad
File: pages/HomePage.tsx
Find: <AdSense slot="feed-middle-56789" ... />
Action: Change feed-middle-56789 to your real ID.
C. Sidebar Ad
File: pages/HomePage.tsx (and pages/ArticlePage.tsx)
Find: <AdSense slot="sidebar-right-99887" ... />
Action: Change sidebar-right-99887 to your real ID.
D. In-Article Ad
File: pages/ArticlePage.tsx
Find: <AdSense slot="in-article-fluid-777" ... />
Action: Change in-article-fluid-777 to your real ID.


Steps to Deploy:
Download all these files to a folder on your computer.
Open your terminal/command prompt in that folder.
Run the command: npm install (Installs the build tools).
Run the command: npm run build (This creates a dist folder).
Upload the dist folder to Netlify, not your source code folder.


https://gotoburg.netlify.app/
www.gotoburg.se
goteburg.se

How to use your new Article Generator
Stop your current server (Ctrl+C).
Start the admin tool by running:
code
Bash
npm run admin
Open your browser to: http://localhost:3001
Fill out the form and click "Publicera Artikel".
Restart your main website server (npm run dev) to see the changes immediately (or if it's already running, it should auto-refresh).
This creates a new entry in src/data/articles.json automatically. When you are ready to publish to Netlify, just run npm run build as usual, and the new articles will be included in the static site.


Deploy online

https://app.netlify.com/projects/gotoburg/deploys/692cbcd273dabd72fdafbf51