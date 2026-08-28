import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import ArticleCard from '../components/ArticleCard';
import AdSense from '../components/AdSense';
import NotFoundPage from './NotFoundPage';
import { ADSENSE_CONFIG } from '../src/constants';
import { getAllArticles } from '../services/articleService';
import { categoryBySlug } from '../src/categories';
import { getCategoryText } from '../src/utils/categoryColors';

/**
 * A real URL per category (/kategori/mat-och-dryck) rather than the old
 * "/?category=Mat & Dryck" query string. Google indexes paths, not query
 * variations of one page, so this turns one URL into one per section.
 */
const CategoryPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const category = categorySlug ? categoryBySlug(categorySlug) : undefined;

  if (!category) return <NotFoundPage />;

  const articles = getAllArticles().filter(a => a.category === category.name);
  const [lead, ...rest] = articles;

  return (
    <Layout>
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-6">
        <Link to="/" className="text-gray-400 hover:text-gray-700 transition-colors">Hem</Link>
        <span className="text-gray-300">/</span>
        <span className={getCategoryText(category.name)}>{category.name}</span>
      </div>

      <header className="mb-10 pb-8 border-b-2 border-gray-900">
        <h1 className="font-serif text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-4">
          {category.title}
        </h1>
        <p className="font-serif text-lg text-gray-600 max-w-2xl leading-relaxed">
          {category.description}
        </p>
        <p className="text-xs uppercase tracking-widest text-gray-400 mt-4">
          {articles.length} {articles.length === 1 ? 'artikel' : 'artiklar'}
        </p>
      </header>

      {articles.length === 0 ? (
        <p className="font-serif text-gray-600 py-10">
          Vi har inte publicerat något i den här kategorin än.{' '}
          <Link to="/" className="text-blue-600 hover:underline">Se det senaste i stället.</Link>
        </p>
      ) : (
        <>
          <section className="mb-10 pb-10 border-b border-gray-200">
            <ArticleCard article={lead} featured={true} />
          </section>

          {rest.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {rest.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}

          <AdSense
            slot={ADSENSE_CONFIG.HOME_FEED_MIDDLE}
            format="fluid"
            layoutKey={ADSENSE_CONFIG.HOME_FEED_MIDDLE_LAYOUT_KEY}
            className="mt-12"
          />
        </>
      )}
    </Layout>
  );
};

export default CategoryPage;
