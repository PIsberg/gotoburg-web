import { Article } from '../types';
import { articles } from './data/articles';

// Load articles from the TS file
export const ARTICLES: Article[] = articles as Article[];
console.log('Loaded articles:', ARTICLES.length);