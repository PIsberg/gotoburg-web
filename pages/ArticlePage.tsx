import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import AdSense from '../components/AdSense';
import { getArticleBySlug, getRelatedArticles } from '../services/articleService';
import { ADSENSE_CONFIG } from '../src/constants';
import { formatDate } from '../src/utils/dateUtils';

const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getArticleBySlug(slug) : undefined;
  const related = slug ? getRelatedArticles(slug) : [];

  // Scroll to top on slug change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!article) {
    return (
      <Layout>
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl font-serif font-bold mb-4">Sidan hittades inte</h1>
          <p className="text-gray-600 mb-8">Vi kunde inte hitta artikeln du letade efter.</p>
          <Link to="/" className="text-blue-600 hover:underline font-bold">Till startsidan</Link>
        </div>
      </Layout>
    );
  }

  // Calculate where to insert an in-article Ad
  const midPoint = Math.ceil(article.content.length / 2);

  return (
    <Layout>
      <article className="max-w-4xl mx-auto">
        {/* Article Header */}
        <header className="mb-8 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-2 text-sm font-bold uppercase tracking-widest text-blue-600 mb-4">
            <Link to="/" className="hover:underline">Hem</Link>
            <span className="text-gray-400">/</span>
            <span>{article.category}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 leading-tight mb-6">
            {article.title}
          </h1>
          <div className="flex items-center justify-center md:justify-start border-y border-gray-100 py-4">
            <div className="flex flex-col md:flex-row md:items-center text-sm font-sans text-gray-600">
              <span className="font-bold text-gray-900 mr-2">Av {article.author}</span>
              <span className="hidden md:inline mx-2">•</span>
              <span>{formatDate(article.publishedAt)}</span>
            </div>
            <div className="flex-grow"></div>
            <div className="flex space-x-3 text-gray-400">
              {/* Share Icons placeholders */}
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 cursor-pointer transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-blue-800 hover:text-white cursor-pointer transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" /></svg>
              </div>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <figure className="mb-10">
          <img src={article.imageUrl} alt={article.title} className="w-full h-[400px] object-cover rounded-sm" />
          <figcaption className="text-center text-xs text-gray-500 mt-2 italic">
            Bild som representerar {article.category}. Källa: Picsum.
          </figcaption>
        </figure>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Text Content */}
          <div className="lg:col-span-8">
            <div className="prose prose-lg prose-slate font-serif max-w-none text-gray-800 leading-loose">
              <p className="font-bold text-xl mb-6 first-letter:text-5xl first-letter:font-bold first-letter:mr-3 first-letter:float-left">
                {article.excerpt}
              </p>

              {/* Render first half of paragraphs */}
              {article.content.slice(0, midPoint).map((paragraph, idx) => (
                <p key={`p1-${idx}`} className="mb-6">{paragraph}</p>
              ))}

              {/* In-Article Ad Unit (FR-03) */}
              <AdSense slot={ADSENSE_CONFIG.IN_ARTICLE_FLUID} format="fluid" className="my-8 py-4 border-y border-gray-100" label="Annons" />

              {/* Render second half of paragraphs */}
              {article.content.slice(midPoint).map((paragraph, idx) => (
                <p key={`p2-${idx}`} className="mb-6">{paragraph}</p>
              ))}
            </div>

            {/* Additional Images Gallery */}
            {article.additionalImages && article.additionalImages.length > 0 && (
              <div className="mt-8 space-y-6">
                <h4 className="font-bold text-lg">Fler bilder</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {article.additionalImages.map((img, idx) => (
                    <img key={idx} src={img} alt={`Bild ${idx + 1}`} className="w-full h-64 object-cover rounded-sm" />
                  ))}
                </div>
              </div>
            )}

            {/* Tags/Categories */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h4 className="text-sm font-bold uppercase mb-4">Kategorier</h4>
              <div className="flex flex-wrap gap-2">
                <Link to={`/?category=${article.category}`} className="bg-gray-100 px-3 py-1 text-xs font-bold uppercase text-gray-600 rounded-sm hover:bg-gray-200">{article.category}</Link>
                <span className="bg-gray-100 px-3 py-1 text-xs font-bold uppercase text-gray-600 rounded-sm">Nyheter</span>
                <span className="bg-gray-100 px-3 py-1 text-xs font-bold uppercase text-gray-600 rounded-sm">2023</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-8">
              <AdSense slot={ADSENSE_CONFIG.ARTICLE_SIDEBAR} format="rectangle" label="Annons" />

              <div>
                <h3 className="font-bold text-sm uppercase tracking-widest border-b border-gray-200 pb-2 mb-4">Läs också</h3>
                <div className="space-y-6">
                  {related.map(item => (
                    <div key={item.id} className="flex flex-col group">
                      <Link to={`/${item.slug}`} className="block mb-2 overflow-hidden rounded-sm">
                        <img src={item.imageUrl} alt={item.title} className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500" />
                      </Link>
                      <Link to={`/${item.slug}`} className="font-serif font-bold text-lg leading-tight group-hover:text-blue-600">
                        {item.title}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </article>
    </Layout>
  );
};

export default ArticlePage;