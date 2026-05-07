import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import AdSense from '../components/AdSense';
import { getArticleBySlug, getRelatedArticles } from '../services/articleService';
import { ADSENSE_CONFIG } from '../src/constants';
import { formatDate } from '../src/utils/dateUtils';
import { getCategoryText, getCategoryBadge } from '../src/utils/categoryColors';

const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getArticleBySlug(slug) : undefined;
  const related = slug ? getRelatedArticles(slug) : [];

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  if (!article) {
    return (
      <Layout>
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center py-16">
          <div className="w-16 h-1 bg-gray-900 mb-8" />
          <h1 className="text-4xl font-serif font-bold mb-4">Sidan hittades inte</h1>
          <p className="text-gray-500 mb-8">Vi kunde inte hitta artikeln du letade efter.</p>
          <Link to="/" className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-gray-700 transition-colors">
            ← Till startsidan
          </Link>
        </div>
      </Layout>
    );
  }

  const midPoint = Math.ceil(article.content.length / 2);

  return (
    <Layout>
      <article className="max-w-5xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-6">
          <Link to="/" className="text-gray-400 hover:text-gray-700 transition-colors">Hem</Link>
          <span className="text-gray-300">/</span>
          <Link to={`/?category=${article.category}`} className={`${getCategoryText(article.category)} hover:opacity-70 transition-opacity`}>
            {article.category}
          </Link>
        </div>

        {/* Article Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-gray-900 leading-tight mb-6">
            {article.title}
          </h1>

          {/* Meta bar */}
          <div className="flex items-center justify-between border-y border-gray-200 py-4 gap-4">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {article.author.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="font-semibold text-gray-900">{article.author}</span>
                <span className="mx-2 text-gray-300">•</span>
                <span>{formatDate(article.publishedAt)}</span>
              </div>
            </div>

            {/* Share */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-sans uppercase tracking-wider hidden sm:inline">Dela</span>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
                aria-label="Dela på Twitter"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-700 hover:text-blue-700 transition-colors"
                aria-label="Dela på Facebook"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" /></svg>
              </a>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <figure className="mb-10">
          <img src={article.imageUrl} alt={article.title} className="w-full h-[400px] md:h-[520px] object-cover rounded-sm" />
          <figcaption className="text-center text-xs text-gray-400 mt-3 italic">{article.title}</figcaption>
        </figure>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Article Body */}
          <div className="lg:col-span-8">
            <div className="prose prose-lg prose-slate font-serif max-w-none text-gray-800 leading-loose">
              <p className="text-xl font-semibold text-gray-900 mb-6 leading-relaxed first-letter:text-6xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:leading-none first-letter:mt-1">
                {article.excerpt}
              </p>

              {article.content.slice(0, midPoint).map((para, i) => (
                <p key={`p1-${i}`} className="mb-5 leading-[1.85]">{para}</p>
              ))}

              <AdSense slot={ADSENSE_CONFIG.IN_ARTICLE_FLUID} format="fluid" className="my-8 py-4 border-y border-gray-100" label="Annons" />

              {article.content.slice(midPoint).map((para, i) => (
                <p key={`p2-${i}`} className="mb-5 leading-[1.85]">{para}</p>
              ))}
            </div>

            {/* Additional Images */}
            {article.additionalImages && article.additionalImages.length > 0 && (
              <div className="mt-10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-5 bg-gray-900" />
                  <h4 className="font-bold text-sm uppercase tracking-widest">Fler bilder</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {article.additionalImages.map((img, i) => (
                    <img key={i} src={img} alt={`Bild ${i + 1}`} className="w-full h-64 object-cover rounded-sm" />
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="mt-10 pt-8 border-t border-gray-200">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Kategorier</h4>
              <div className="flex flex-wrap gap-2">
                <Link
                  to={`/?category=${article.category}`}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm hover:opacity-80 transition-opacity ${getCategoryBadge(article.category)}`}
                >
                  {article.category}
                </Link>
                <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm bg-gray-100 text-gray-500">
                  Nyheter
                </span>
                <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm bg-gray-100 text-gray-500">
                  {new Date(article.publishedAt).getFullYear()}
                </span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-28 space-y-8">
              <AdSense slot={ADSENSE_CONFIG.ARTICLE_SIDEBAR} format="rectangle" label="Annons" />

              {related.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-200">
                    <div className="w-1 h-5 bg-gray-900" />
                    <h3 className="font-bold text-xs uppercase tracking-widest">Läs också</h3>
                  </div>
                  <div className="space-y-6">
                    {related.map(item => (
                      <div key={item.id} className="group">
                        <Link to={`/${item.slug}`} className="block mb-2 overflow-hidden rounded-sm">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </Link>
                        <span className={`text-xs font-bold uppercase tracking-wider ${getCategoryText(item.category)}`}>
                          {item.category}
                        </span>
                        <Link to={`/${item.slug}`} className="block mt-1">
                          <p className="font-serif font-bold text-base leading-snug group-hover:text-blue-700 transition-colors">
                            {item.title}
                          </p>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </article>
    </Layout>
  );
};

export default ArticlePage;
