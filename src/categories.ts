import { Article } from '../types';

/**
 * Category identity. The `name` is the exact string stored on each article in
 * src/data/articles.ts; the `slug` is the indexable URL segment. Before this
 * existed the home page filtered on a `?category=` query string, which Google
 * treats as one URL with a parameter rather than as separate pages.
 */
export interface Category {
  name: string;
  slug: string;
  title: string;
  description: string;
}

export const CATEGORIES: Category[] = [
  {
    name: 'Mat & Dryck',
    slug: 'mat-och-dryck',
    title: 'Mat & dryck i Göteborg',
    description:
      'Restauranger, barer, kaféer och bryggerier i Göteborg, besökta och beskrivna av GotoBurgs redaktion.',
  },
  {
    name: 'Natur',
    slug: 'natur',
    title: 'Natur och friluftsliv i Göteborg',
    description:
      'Naturreservat, vandringsleder, badplatser och skärgård i och runt Göteborg.',
  },
  {
    name: 'Arbete',
    slug: 'arbete',
    title: 'Arbete och näringsliv i Göteborg',
    description:
      'Arbetsplatser, branscher och kontorsmiljöer som formar Göteborgs näringsliv.',
  },
  {
    name: 'Aktiviteter',
    slug: 'aktiviteter',
    title: 'Aktiviteter i Göteborg',
    description:
      'Saker att göra i Göteborg — för familjen, för regniga dagar och för långa helger.',
  },
  {
    name: 'Kultur',
    slug: 'kultur',
    title: 'Kultur i Göteborg',
    description:
      'Föreningsliv, museer, scenkonst och stadens kulturella undervegetation.',
  },
  {
    name: 'Sport',
    slug: 'sport',
    title: 'Sport i Göteborg',
    description: 'Klubbar, arenor och idrottsevenemang i Göteborg.',
  },
  {
    name: 'Vad är på gång',
    slug: 'vad-ar-pa-gang',
    title: 'Vad är på gång i Göteborg',
    description:
      'Nyöppnat, ombyggt och på väg: förändringarna som märks i stadsbilden.',
  },
  {
    name: 'Event',
    slug: 'event',
    title: 'Evenemang i Göteborg',
    description: 'Festivaler, marknader och återkommande evenemang i Göteborg.',
  },
];

export const categoryBySlug = (slug: string): Category | undefined =>
  CATEGORIES.find(c => c.slug === slug);

export const categoryByName = (name: string): Category | undefined =>
  CATEGORIES.find(c => c.name === name);

/** URL for a category, by the article's stored category string. */
export const categoryPath = (name: string): string => {
  const category = categoryByName(name);
  return category ? `/kategori/${category.slug}` : '/';
};

/**
 * Only categories that actually have articles. A nav link to an empty category
 * page is a dead end for a visitor and a thin page for a crawler, so the nav and
 * the sitemap are both built from this rather than from the full list.
 */
export const populatedCategories = (articles: Article[]): Category[] => {
  const used = new Set(articles.map(a => a.category));
  return CATEGORIES.filter(c => used.has(c.name));
};

export const countByCategory = (articles: Article[], name: string): number =>
  articles.filter(a => a.category === name).length;
