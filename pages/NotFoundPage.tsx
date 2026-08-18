import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { getAllArticles } from '../services/articleService';
import { getCategoryText } from '../src/utils/categoryColors';

/**
 * Shown for any URL that does not resolve. It links onward to real articles so a
 * mistyped or stale URL is a way into the site rather than a dead end.
 */
const NotFoundPage: React.FC = () => {
  const latest = getAllArticles().slice(0, 4);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-12">
        <div className="w-16 h-1 bg-gray-900 mb-8" />
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Sidan hittades inte</h1>
        <p className="text-gray-600 mb-8 text-lg font-serif">
          Adressen du följde leder ingenstans. Artikeln kan ha bytt adress, eller så
          har något blivit fel i länken.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-gray-700 transition-colors"
        >
          Till startsidan
        </Link>

        <div className="mt-14 pt-8 border-t border-gray-200">
          <h2 className="font-bold text-sm uppercase tracking-widest text-gray-900 mb-5">
            Senaste artiklarna
          </h2>
          <ul className="space-y-5">
            {latest.map(article => (
              <li key={article.id}>
                <span className={`block text-xs font-bold uppercase tracking-wider mb-1 ${getCategoryText(article.category)}`}>
                  {article.category}
                </span>
                <Link to={`/${article.slug}`} className="font-serif font-bold text-lg leading-snug hover:text-blue-700 transition-colors">
                  {article.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default NotFoundPage;
