import { Article } from './types';
import articlesData from './data/articles.json';

// Load articles from the JSON file
export const ARTICLES: Article[] = articlesData as Article[];
