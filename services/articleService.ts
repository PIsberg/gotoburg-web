import { ARTICLES } from '../src/constants';
import { Article } from '../types';

export const getAllArticles = (): Article[] => {
  // Sort by date descending using proper Date comparison
  return [...ARTICLES].sort((a, b) => {
    const dateA = new Date(a.publishedAt);
    const dateB = new Date(b.publishedAt);
    // Handle potential invalid dates safely
    const timeA = isNaN(dateA.getTime()) ? 0 : dateA.getTime();
    const timeB = isNaN(dateB.getTime()) ? 0 : dateB.getTime();
    return timeB - timeA;
  });
};

export const getArticleBySlug = (slug: string): Article | undefined => {
  return ARTICLES.find((article) => article.slug === slug);
};

export const getRelatedArticles = (currentSlug: string, limit: number = 3): Article[] => {
  return ARTICLES
    .filter(article => article.slug !== currentSlug)
    .slice(0, limit);
};