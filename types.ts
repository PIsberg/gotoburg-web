/**
 * Attribution for one image. CC BY and CC BY-SA both require naming the author
 * and the licence and linking back to the source, so an image without this is
 * an image the site is not allowed to publish. scripts/fetch-images.mjs fills
 * it in from the Wikimedia Commons API; do not hand-write it.
 */
export interface ImageCredit {
  /** Commons file name, e.g. "Haganygata.jpg" */
  file: string;
  author: string;
  licence: string;
  licenceUrl: string;
  /** Commons file description page */
  sourceUrl: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string[]; // Array of paragraphs to allow easier ad insertion
  author: string;
  publishedAt: string;
  category: string;
  /** Site-relative path under /img/. Never an external URL: see scripts/images.manifest.json. */
  imageUrl: string;
  imageCredit?: ImageCredit;
  /**
   * What the lead photograph actually shows, when that is not the subject of
   * the article.
   *
   * Most of the imagery is a Wikimedia Commons photograph of the street a venue
   * stands on rather than the venue itself, because no free photograph of the
   * venue exists. Presented with no caption and with the headline as its alt
   * text, such a photograph reads as a picture of the place, which is a claim
   * the site cannot support. A caption naming what is in the frame keeps the
   * illustration and drops the claim.
   *
   * Absent means the photograph is of the subject, so do not add a caption that
   * merely restates the headline: an empty caption is meaningful here.
   */
  imageCaption?: string;
  additionalImages?: string[];
  additionalImageCredits?: ImageCredit[];
  googleMapsUrl?: string; // Optional Google Maps URL
}

export interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  className?: string;
  label?: string;
}

declare global {
  interface Window {
    google: any;
  }
}

// Fix Property 'env' does not exist on type 'ImportMeta'
interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
  readonly [key: string]: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}