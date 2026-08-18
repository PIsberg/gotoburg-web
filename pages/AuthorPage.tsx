import React from 'react';
import { useParams, Link } from 'react-router-dom';
import StaticPage, { Section } from '../components/StaticPage';
import NotFoundPage from './NotFoundPage';
import { authorBySlug } from '../src/authors';
import { getAllArticles } from '../services/articleService';
import { formatDate } from '../src/utils/dateUtils';
import { getCategoryText } from '../src/utils/categoryColors';

/** One indexable page per byline, linked from every article the person wrote. */
const AuthorPage: React.FC = () => {
  const { authorSlug } = useParams<{ authorSlug: string }>();
  const author = authorSlug ? authorBySlug(authorSlug) : undefined;

  if (!author) return <NotFoundPage />;

  const written = getAllArticles().filter(a => a.author === author.name);

  return (
    <StaticPage title={author.name} intro={author.role}>
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

      <Section heading={`Artiklar av ${author.name}`}>
        {written.length === 0 ? (
          <p>Inga publicerade artiklar än.</p>
        ) : (
          <ul className="space-y-5 not-prose">
            {written.map(article => (
              <li key={article.id}>
                <span className={`block text-xs font-bold uppercase tracking-wider mb-1 ${getCategoryText(article.category)}`}>
                  {article.category} · {formatDate(article.publishedAt)}
                </span>
                <Link to={`/${article.slug}`} className="font-serif font-bold text-lg leading-snug hover:text-blue-700 transition-colors">
                  {article.title}
                </Link>
                <p className="text-sm text-gray-600 font-serif mt-1">{article.excerpt}</p>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <p>
        <Link to="/redaktionen" className="text-blue-600 hover:underline">Tillbaka till redaktionen</Link>
      </p>
    </StaticPage>
  );
};

export default AuthorPage;
