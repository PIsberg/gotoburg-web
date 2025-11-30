import { Article } from '../types';
import { articles } from './data/articles';

// Load articles from the TS file
export const ARTICLES: Article[] = articles as Article[];
console.log('Loaded articles:', ARTICLES.length);

export const ADSENSE_CONFIG = {
    PUBLISHER_ID: 'ca-pub-2203695397498260',
    HEADER_BANNER: 'header-banner-12345',
    HOME_FEED_MIDDLE: 'feed-middle-56789',
    SIDEBAR_RIGHT: 'sidebar-right-99887',
    IN_ARTICLE_FLUID: 'in-article-fluid-777',
    ARTICLE_SIDEBAR: 'article-sidebar-333',
};