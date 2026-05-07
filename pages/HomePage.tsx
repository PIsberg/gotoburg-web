import { useLocation, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import ArticleCard from '../components/ArticleCard';
import AdSense from '../components/AdSense';
import { ADSENSE_CONFIG } from '../src/constants';
import { getAllArticles } from '../services/articleService';
import { getCategoryText, getCategoryBadge } from '../src/utils/categoryColors';

const HomePage: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const categoryFilter = searchParams.get('category');

  const allArticles = getAllArticles();
  const articles = categoryFilter
    ? allArticles.filter(a => a.category === categoryFilter)
    : allArticles;

  const featuredArticle = articles[0];
  const secondaryArticles = articles.slice(1, 3);
  const remainingArticles = articles.slice(3);

  if (categoryFilter && articles.length === 0) {
    return (
      <Layout>
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center py-16">
          <div className="w-16 h-1 bg-gray-900 mb-8" />
          <h1 className="text-4xl font-serif font-bold mb-4">Inga artiklar hittades</h1>
          <p className="text-gray-500 mb-8 text-lg">Det finns inga artiklar i kategorin <span className="font-semibold text-gray-700">"{categoryFilter}"</span> än.</p>
          <Link to="/" className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-gray-700 transition-colors">
            ← Till startsidan
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Featured Article */}
      {featuredArticle && (
        <section className="mb-10 pb-10 border-b-2 border-gray-900">
          <ArticleCard article={featuredArticle} featured={true} />
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Feed */}
        <div className="lg:col-span-8">

          {/* Secondary articles grid */}
          {secondaryArticles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 pb-10 border-b border-gray-200">
              {secondaryArticles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}

          <AdSense slot={ADSENSE_CONFIG.HOME_FEED_MIDDLE} format="fluid" className="mb-10" />

          {/* Latest news */}
          {remainingArticles.length > 0 && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-gray-900" />
                <h3 className="font-bold text-sm uppercase tracking-widest text-gray-900">Senaste nytt</h3>
              </div>
              <div className="space-y-0 divide-y divide-gray-100">
                {remainingArticles.map(article => (
                  <div key={article.id} className="flex gap-5 py-5 group">
                    <Link to={`/${article.slug}`} className="flex-shrink-0 overflow-hidden rounded-sm">
                      <img
                        src={article.imageUrl}
                        className="w-28 h-20 md:w-36 md:h-24 object-cover transition-transform duration-500 group-hover:scale-105"
                        alt={article.title}
                      />
                    </Link>
                    <div className="flex flex-col justify-center min-w-0">
                      <span className={`text-xs font-bold uppercase tracking-wider mb-1 ${getCategoryText(article.category)}`}>
                        {article.category}
                      </span>
                      <Link to={`/${article.slug}`} className="block">
                        <h4 className="text-base md:text-lg font-serif font-bold leading-snug mb-1 group-hover:text-blue-700 transition-colors line-clamp-2">
                          {article.title}
                        </h4>
                      </Link>
                      <p className="text-xs text-gray-500 line-clamp-2 font-serif hidden md:block">{article.excerpt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4">
          <div className="sticky top-28 space-y-8">

            {/* Just nu */}
            <div className="border border-gray-200 rounded-sm overflow-hidden">
              <div className="bg-gray-900 px-4 py-2.5">
                <h4 className="text-xs font-bold uppercase tracking-widest text-white">Just nu</h4>
              </div>
              <ol className="divide-y divide-gray-100">
                {allArticles.slice(0, 5).map((article, i) => (
                  <li key={article.id}>
                    <Link to={`/${article.slug}`} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <div className={`text-xs font-bold uppercase tracking-wide mb-0.5 ${getCategoryText(article.category)}`}>
                          {article.category}
                        </div>
                        <p className="text-sm font-serif font-semibold leading-snug text-gray-800 group-hover:text-blue-700 transition-colors line-clamp-2">
                          {article.title}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>

            <AdSense slot={ADSENSE_CONFIG.SIDEBAR_RIGHT} format="rectangle" label="Sponsor" />
          </div>
        </aside>
      </div>
    </Layout>
  );
};

export default HomePage;
