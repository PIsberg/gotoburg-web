export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string[]; // Array of paragraphs to allow easier ad insertion
  author: string;
  publishedAt: string;
  category: string;
  imageUrl: string;
  additionalImages?: string[];
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