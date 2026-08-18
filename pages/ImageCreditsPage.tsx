import React from 'react';
import { Link } from 'react-router-dom';
import StaticPage, { Section } from '../components/StaticPage';
import { getAllArticles } from '../services/articleService';
import { ImageCredit } from '../types';

/**
 * Every image on the site with its author, licence and source.
 *
 * Article pages credit their own lead image, but the same photographs also
 * appear as thumbnails on the home page, the category pages and in "Läs också".
 * CC BY and CC BY-SA ask for attribution wherever the work is published, and a
 * single page that lists all of it is how publications normally settle that.
 */
const ImageCreditsPage: React.FC = () => {
  const articles = getAllArticles();
  const rows: { credit: ImageCredit; slug: string; title: string }[] = [];

  for (const article of articles) {
    const credits = [
      article.imageCredit,
      ...(article.additionalImageCredits ?? []),
    ].filter(Boolean) as ImageCredit[];
    for (const credit of credits) {
      rows.push({ credit, slug: article.slug, title: article.title });
    }
  }

  return (
    <StaticPage
      title="Bildkrediter"
      intro="Alla foton på GotoBurg kommer från Wikimedia Commons och används under fria licenser. Här är varje bild med fotograf, licens och länk till originalet."
    >
      <Section heading="Så använder vi bilder">
        <p>
          Vi publicerar bara bilder som är licensierade för återanvändning, i praktiken
          Creative Commons-licenser som tillåter kommersiellt bruk, eller verk i public domain.
          Bilderna laddas ned och ligger på vår egen server i stället för att länkas från någon
          annans, och varje bild krediteras både här och i artikeln den hör till.
        </p>
        <p>
          Ser du en bild som du menar används felaktigt? Mejla{' '}
          <a href="mailto:peter@gotoburg.se" className="text-blue-600 hover:underline">
            peter@gotoburg.se
          </a>{' '}
          så tar vi bort den medan vi kontrollerar saken.
        </p>
      </Section>

      <Section heading={`Bilder (${rows.length})`}>
        <ul className="space-y-4 not-prose">
          {rows.map(({ credit, slug, title }) => (
            <li key={`${slug}-${credit.file}`} className="text-sm">
              <a
                href={credit.sourceUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="font-semibold text-gray-900 hover:text-blue-700"
              >
                {credit.file}
              </a>
              <div className="text-gray-600">
                Foto: {credit.author} ·{' '}
                <a
                  href={credit.licenceUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow license"
                  className="text-blue-600 hover:underline"
                >
                  {credit.licence}
                </a>
              </div>
              <div className="text-gray-500">
                Används i{' '}
                <Link to={`/${slug}`} className="text-blue-600 hover:underline">
                  {title}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </Section>
    </StaticPage>
  );
};

export default ImageCreditsPage;
