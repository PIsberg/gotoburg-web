export interface Author {
  /** Value stored in article.author */
  name: string;
  slug: string;
  role: string;
  /** Short bio shown under the byline. */
  bio: string;
  /** Longer bio for the /redaktionen page, one entry per paragraph. */
  longBio: string[];
  email?: string;
  /** Profile URLs for JSON-LD sameAs. Left empty until real profiles exist. */
  sameAs?: string[];
}

/**
 * Named bylines exist because Google's quality guidelines ask who produced a page
 * and what makes them qualified to write it. Until this file existed the data
 * carried bylines like "Peter AI assisted", which answers neither question and
 * reads as a scaled-content signal. How AI is actually used is stated on /om-oss.
 *
 * Nothing here may claim something the site cannot stand behind. The bios
 * previously said the redaktionen guides were built on "flera besök" — first-hand
 * visits nobody can evidence, and squarely at odds with /om-oss, which discloses
 * that AI tools are used for research and drafting. That claim is gone. What
 * replaces it is either checkable (role, contact address, founding year) or
 * derived from the data: src/seo.ts builds each profile's schema.org knowsAbout
 * from the categories the person actually has bylines in, and the author page
 * lists every one of those articles, so the expertise claim and the evidence for
 * it cannot drift apart.
 *
 * TODO (Peter): only you can supply the rest — a real credential or two, and
 * `sameAs` profile URLs (LinkedIn, Instagram) once they exist. Leave `sameAs`
 * empty rather than pointing it somewhere approximate; empty is omitted from the
 * JSON-LD, wrong is not.
 */
export const AUTHORS: Author[] = [
  {
    name: 'Peter Isberg',
    slug: 'peter-isberg',
    role: 'Grundare, redaktör och ansvarig utgivare',
    bio: 'Grundade GotoBurg 2025 och är ansvarig utgivare. Skriver framför allt om stadens restauranger, barer och nyöppningar.',
    longBio: [
      'Peter Isberg startade GotoBurg 2025 och är sajtens redaktör och ansvarige utgivare. Han skriver framför allt om Göteborgs mat- och dryckesscen, om nyöppningar i stadskärnan och om vad som är värt en resa strax utanför den.',
      'Han läser och redigerar varje text som publiceras på sajten, oavsett vem som står som skribent, och ansvarar för att sakuppgifterna är kontrollerade före publicering. Hur redaktionen arbetar med research, AI-verktyg och faktakontroll står i sin helhet på Om GotoBurg.',
    ],
    email: 'peter@gotoburg.se',
    sameAs: [],
  },
  {
    name: 'GotoBurgs redaktion',
    slug: 'gotoburgs-redaktion',
    role: 'Redaktionen',
    bio: 'Guider och översikter som tas fram gemensamt av redaktionen i stället för av en enskild skribent. Ansvarig utgivare är Peter Isberg.',
    longBio: [
      'Artiklar som tas fram gemensamt, i stället för av en enskild skribent, publiceras under redaktionens namn. Det gäller framför allt guider och översikter som täcker flera platser eller ett helt område.',
      'Öppettider, adresser och priser kontrolleras mot verksamheternas egna kanaler före publicering. Hur redaktionen arbetar med research, AI-verktyg och faktakontroll står i sin helhet på Om GotoBurg.',
      'Ansvarig utgivare för allt material på GotoBurg är Peter Isberg.',
    ],
    sameAs: [],
  },
];

export const authorByName = (name: string): Author | undefined =>
  AUTHORS.find(a => a.name === name);

export const authorBySlug = (slug: string): Author | undefined =>
  AUTHORS.find(a => a.slug === slug);
