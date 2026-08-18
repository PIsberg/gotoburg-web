import { Article } from '../types';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, absoluteUrl } from './site';
import { CATEGORIES, populatedCategories, categoryPath, Category } from './categories';
import { AUTHORS, authorByName, Author } from './authors';

/** Everything the prerenderer needs to build one page's <head> and sitemap row. */
export interface PageMeta {
  path: string;
  title: string;
  description: string;
  canonical: string;
  ogType: 'website' | 'article' | 'profile';
  image?: string;
  /** ISO date used for <lastmod> and article:published_time. */
  published?: string;
  jsonLd: Record<string, unknown>[];
  priority: string;
}

const publisher = {
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: { '@type': 'ImageObject', url: absoluteUrl('/logo.png') },
};

const breadcrumbs = (trail: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
});

const authorNode = (name: string) => {
  const author = authorByName(name);
  if (!author) return { '@type': 'Person', name };
  return {
    '@type': 'Person',
    name: author.name,
    url: absoluteUrl('/redaktionen/' + author.slug),
    jobTitle: author.role,
    description: author.bio,
    ...(author.sameAs && author.sameAs.length ? { sameAs: author.sameAs } : {}),
  };
};

/** og:image and schema.org image must be absolute; article.imageUrl is now /img/... */
const imageUrl = (src?: string) =>
  !src ? undefined : src.startsWith('http') ? src : absoluteUrl(src);

const truncate = (text: string, max = 158) => {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, clean.lastIndexOf(' ', max - 1)) + '...';
};

export const articleMeta = (article: Article): PageMeta => {
  const path = '/' + article.slug;
  const canonical = absoluteUrl(path);
  const category = CATEGORIES.find(c => c.name === article.category);
  const words = article.content.join(' ').split(/\s+/).filter(Boolean).length;

  return {
    path,
    title: article.title + ' | ' + SITE_NAME,
    description: truncate(article.excerpt),
    canonical,
    ogType: 'article',
    image: imageUrl(article.imageUrl),
    published: article.publishedAt,
    priority: '0.8',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
        headline: article.title,
        description: article.excerpt,
        image: [article.imageUrl, ...(article.additionalImages || [])].map(imageUrl),
        datePublished: article.publishedAt,
        dateModified: article.publishedAt,
        author: authorNode(article.author),
        publisher,
        articleSection: article.category,
        inLanguage: 'sv-SE',
        wordCount: words,
        isAccessibleForFree: true,
      },
      breadcrumbs([
        { name: 'Hem', path: '/' },
        ...(category ? [{ name: category.name, path: categoryPath(category.name) }] : []),
        { name: article.title, path },
      ]),
    ],
  };
};

const homeMeta = (articles: Article[]): PageMeta => ({
  path: '/',
  title: SITE_NAME + ' — guide till Göteborg: mat, natur, kultur och evenemang',
  description: truncate(SITE_DESCRIPTION),
  canonical: absoluteUrl('/'),
  ogType: 'website',
  image: imageUrl(articles[0] && articles[0].imageUrl),
  priority: '1.0',
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      inLanguage: 'sv-SE',
      publisher,
    },
    {
      '@context': 'https://schema.org',
      ...publisher,
      description: SITE_DESCRIPTION,
      email: 'peter@gotoburg.se',
      areaServed: { '@type': 'City', name: 'Göteborg' },
      founder: { '@type': 'Person', name: AUTHORS[0].name },
    },
  ],
});

const categoryMeta = (category: Category, articles: Article[]): PageMeta => {
  const inCategory = articles.filter(a => a.category === category.name);
  const path = categoryPath(category.name);
  return {
    path,
    title: category.title + ' | ' + SITE_NAME,
    description: truncate(category.description),
    canonical: absoluteUrl(path),
    ogType: 'website',
    image: imageUrl(inCategory[0] && inCategory[0].imageUrl),
    published: inCategory[0] && inCategory[0].publishedAt,
    priority: '0.6',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: category.title,
        description: category.description,
        url: absoluteUrl(path),
        inLanguage: 'sv-SE',
        isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: inCategory.length,
          itemListElement: inCategory.map((a, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: absoluteUrl('/' + a.slug),
            name: a.title,
          })),
        },
      },
      breadcrumbs([{ name: 'Hem', path: '/' }, { name: category.name, path }]),
    ],
  };
};

interface StaticPageSpec {
  path: string;
  title: string;
  description: string;
  priority: string;
  schemaType?: string;
}

const STATIC_PAGES: StaticPageSpec[] = [
  {
    path: '/om-oss',
    title: 'Om GotoBurg — vilka vi är och hur vi arbetar',
    description:
      'Vem som står bakom GotoBurg, hur artiklarna tas fram och faktakontrolleras, hur vi rättar fel och hur sajten finansieras.',
    priority: '0.7',
    schemaType: 'AboutPage',
  },
  {
    path: '/redaktionen',
    title: 'Redaktionen — skribenterna bakom GotoBurg',
    description:
      'Skribenterna bakom GotoBurg, vad var och en bevakar och hur du kontaktar dem.',
    priority: '0.6',
  },
  {
    path: '/kontakt',
    title: 'Kontakta GotoBurg',
    description:
      'Kontaktuppgifter till GotoBurgs redaktion för tips, rättelser, annonsförfrågningar och samarbeten.',
    priority: '0.5',
    schemaType: 'ContactPage',
  },
  {
    path: '/explore',
    title: 'Utforska Göteborg på karta',
    description:
      'Se var GotoBurgs artiklar utspelar sig. Restauranger, naturreservat och aktiviteter utsatta på karta över Göteborg.',
    priority: '0.6',
  },
  {
    path: '/integritetspolicy',
    title: 'Integritetspolicy',
    description:
      'Hur GotoBurg behandlar personuppgifter, vilka cookies som används och hur du ändrar ditt samtycke.',
    priority: '0.3',
  },
  {
    path: '/bildkredit',
    title: 'Bildkrediter — fotografer och licenser',
    description:
      'Varje bild på GotoBurg med fotograf, licens och länk till originalet på Wikimedia Commons.',
    priority: '0.3',
  },
  {
    path: '/villkor',
    title: 'Användarvillkor',
    description:
      'Villkoren för att använda GotoBurg, upphovsrätt till materialet och ansvarsbegränsning.',
    priority: '0.3',
  },
];

const staticMeta = (spec: StaticPageSpec): PageMeta => ({
  path: spec.path,
  title: spec.title + ' | ' + SITE_NAME,
  description: truncate(spec.description),
  canonical: absoluteUrl(spec.path),
  ogType: 'website',
  priority: spec.priority,
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': spec.schemaType || 'WebPage',
      name: spec.title,
      description: spec.description,
      url: absoluteUrl(spec.path),
      inLanguage: 'sv-SE',
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    },
    breadcrumbs([{ name: 'Hem', path: '/' }, { name: spec.title, path: spec.path }]),
  ],
});

const authorMeta = (author: Author, articles: Article[]): PageMeta => {
  const path = '/redaktionen/' + author.slug;
  const written = articles.filter(a => a.author === author.name);
  return {
    path,
    title: author.name + ' — ' + author.role + ' | ' + SITE_NAME,
    description: truncate(author.bio),
    canonical: absoluteUrl(path),
    ogType: 'profile',
    published: written[0] && written[0].publishedAt,
    priority: '0.5',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        mainEntity: authorNode(author.name),
        url: absoluteUrl(path),
        inLanguage: 'sv-SE',
      },
      breadcrumbs([
        { name: 'Hem', path: '/' },
        { name: 'Redaktionen', path: '/redaktionen' },
        { name: author.name, path },
      ]),
    ],
  };
};

/**
 * Every URL the site publishes, in sitemap order. The prerenderer walks this list
 * to decide which HTML files to write, so a route missing here is a route Google
 * never sees.
 */
export const allRoutes = (articles: Article[]): PageMeta[] => [
  homeMeta(articles),
  ...STATIC_PAGES.map(staticMeta),
  ...AUTHORS.map(a => authorMeta(a, articles)),
  ...populatedCategories(articles).map(c => categoryMeta(c, articles)),
  ...articles.map(articleMeta),
];
