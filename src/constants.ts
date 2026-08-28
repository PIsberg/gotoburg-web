import { Article } from '../types';
import { articles } from './data/articles';

// Load articles from the TS file
export const ARTICLES: Article[] = articles as Article[];

/**
 * Real ad unit ids, created in the AdSense console on 2026-08-28. Until then
 * these were placeholders (`header-banner-12345`), which cannot fill: AdSense
 * reserved layout height for each one and every page opened with roughly 330px
 * of blank white above the first line of content.
 *
 * The three display units are responsive, so their markup wants
 * `data-ad-format="auto"`. The two native units are not interchangeable with
 * them and each needs one extra attribute that Google generates with the unit:
 * an in-article unit needs `data-ad-layout="in-article"`, and an in-feed unit
 * needs the `data-ad-layout-key` that encodes the layout chosen when it was
 * created. Without those attributes the slot is valid but renders as a plain
 * display ad rather than the native format it was set up as, so they are kept
 * next to the ids here rather than left to the call sites to remember.
 */
export const ADSENSE_CONFIG = {
    PUBLISHER_ID: 'ca-pub-2203695397498260',
    /** Display, responsive. Unit "gotoburg-header-banner". */
    HEADER_BANNER: '8006874685',
    /** In-feed, "image on the side". Unit "gotoburg-home-feed-middle". */
    HOME_FEED_MIDDLE: '7150300033',
    HOME_FEED_MIDDLE_LAYOUT_KEY: '-fb+5w+4e-db+86',
    /** Display, responsive. Unit "gotoburg-sidebar-right". */
    SIDEBAR_RIGHT: '8362097902',
    /** In-article. Unit "gotoburg-in-article". */
    IN_ARTICLE_FLUID: '9483607882',
    /** Display, responsive. Unit "gotoburg-article-sidebar". */
    ARTICLE_SIDEBAR: '7815302996',
};