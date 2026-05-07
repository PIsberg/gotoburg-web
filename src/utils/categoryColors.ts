const COLORS: Record<string, { text: string; badge: string; dot: string }> = {
  'Mat & Dryck': { text: 'text-amber-700', badge: 'bg-amber-50 text-amber-700 border border-amber-200', dot: 'bg-amber-500' },
  'Natur':        { text: 'text-green-700',  badge: 'bg-green-50 text-green-700 border border-green-200',  dot: 'bg-green-500' },
  'Arbete':       { text: 'text-blue-700',   badge: 'bg-blue-50 text-blue-700 border border-blue-200',    dot: 'bg-blue-500' },
  'Aktiviteter':  { text: 'text-purple-700', badge: 'bg-purple-50 text-purple-700 border border-purple-200', dot: 'bg-purple-500' },
  'Kultur':       { text: 'text-pink-700',   badge: 'bg-pink-50 text-pink-700 border border-pink-200',    dot: 'bg-pink-500' },
  'Sport':        { text: 'text-red-700',    badge: 'bg-red-50 text-red-700 border border-red-200',       dot: 'bg-red-500' },
  'Vad är på gång': { text: 'text-teal-700', badge: 'bg-teal-50 text-teal-700 border border-teal-200',   dot: 'bg-teal-500' },
  'Event':        { text: 'text-indigo-700', badge: 'bg-indigo-50 text-indigo-700 border border-indigo-200', dot: 'bg-indigo-500' },
};

const DEFAULT = { text: 'text-blue-700', badge: 'bg-blue-50 text-blue-700 border border-blue-200', dot: 'bg-blue-500' };

export const getCategoryText  = (cat: string) => (COLORS[cat] ?? DEFAULT).text;
export const getCategoryBadge = (cat: string) => (COLORS[cat] ?? DEFAULT).badge;
export const getCategoryDot   = (cat: string) => (COLORS[cat] ?? DEFAULT).dot;
