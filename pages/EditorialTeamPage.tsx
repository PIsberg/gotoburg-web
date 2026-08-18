import React from 'react';
import { Link } from 'react-router-dom';
import StaticPage, { Section } from '../components/StaticPage';
import { AUTHORS } from '../src/authors';
import { getAllArticles } from '../services/articleService';

/**
 * Who writes the site. Google's quality guidelines ask a page to make clear who
 * produced it and why they are worth reading; a byline with nothing behind it
 * does not answer that.
 */
const EditorialTeamPage: React.FC = () => {
  const articles = getAllArticles();

  return (
    <StaticPage
      title="Redaktionen"
      intro="GotoBurg skrivs av namngivna personer. Här är vilka de är, vad de bevakar och hur du når dem."
    >
      {AUTHORS.map(author => {
        const written = articles.filter(a => a.author === author.name);
        return (
          <Section key={author.slug} heading={author.name}>
            <p className="text-xs uppercase tracking-widest text-gray-400">{author.role}</p>
            {author.longBio.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
            {author.email && (
              <p>
                Kontakt:{' '}
                <a href={`mailto:${author.email}`} className="text-blue-600 hover:underline">
                  {author.email}
                </a>
              </p>
            )}
            <p>
              <Link to={`/redaktionen/${author.slug}`} className="text-blue-600 hover:underline">
                Alla {written.length} artiklar av {author.name}
              </Link>
            </p>
          </Section>
        );
      })}

      <Section heading="Ansvarig utgivare">
        <p>
          Ansvarig utgivare för allt material på GotoBurg är Peter Isberg. Hur vi arbetar med
          research, faktakontroll och rättelser står på{' '}
          <Link to="/om-oss" className="text-blue-600 hover:underline">Om GotoBurg</Link>.
        </p>
      </Section>
    </StaticPage>
  );
};

export default EditorialTeamPage;
