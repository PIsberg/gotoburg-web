import { ARTICLES } from '../constants';
import { Article } from '../types';

export const getAllArticles = (): Article[] => {
  // Sort by date descending
  return [...ARTICLES].sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
};

export const getArticleBySlug = (slug: string): Article | undefined => {
  return ARTICLES.find((article) => article.slug === slug);
};

export const getRelatedArticles = (currentSlug: string, limit: number = 3): Article[] => {
  return ARTICLES
    .filter(article => article.slug !== currentSlug)
    .slice(0, limit);
};