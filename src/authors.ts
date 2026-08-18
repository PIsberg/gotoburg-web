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
 * TODO (Peter): the bios below only assert what the site already states publicly
 * (role, contact address, that the site started in 2025). Add the specifics that
 * make the byline worth trusting — how long you have lived in Göteborg, what you
 * did before this, anything you are actually an authority on — and fill in
 * `sameAs` with real profile URLs (LinkedIn, Instagram) once they exist.
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
    bio: 'Guider och översikter som bygger på flera besök och kontroller mot flera källor, framtagna gemensamt av redaktionen.',
    longBio: [
      'Guider och översikter som bygger på flera besök, kontrollerade öppettider och avstämning mot flera källor publiceras under redaktionens namn i stället för under en enskild skribent.',
      'Ansvarig utgivare för allt material på GotoBurg är Peter Isberg.',
    ],
    sameAs: [],
  },
];

export const authorByName = (name: string): Author | undefined =>
  AUTHORS.find(a => a.name === name);

export const authorBySlug = (slug: string): Author | undefined =>
  AUTHORS.find(a => a.slug === slug);
