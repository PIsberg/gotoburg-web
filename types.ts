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
}

export interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  className?: string;
  label?: string;
}