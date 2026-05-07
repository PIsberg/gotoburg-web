import React from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../types';
import { formatDate } from '../src/utils/dateUtils';
import { getCategoryText, getCategoryBadge } from '../src/utils/categoryColors';

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, featured = false }) => {
  return (
    <div className={`group flex flex-col ${featured ? 'md:grid md:grid-cols-2 md:gap-10' : ''}`}>
      <Link to={`/${article.slug}`} className="block overflow-hidden mb-4 rounded-sm relative">
        <img
          src={article.imageUrl}
          alt={article.title}
          className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${featured ? 'h-72 md:h-full' : 'h-52'}`}
          loading="lazy"
        />
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      <div className="flex flex-col justify-center">
        {/* Category badge */}
        <div className="mb-2">
          <span
            data-testid="article-category"
            className={`inline-block text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded-sm ${getCategoryBadge(article.category)}`}
          >
            {article.category}
          </span>
        </div>

        <Link to={`/${article.slug}`} className="block">
          <h2 className={`${featured ? 'text-3xl md:text-4xl' : 'text-xl'} font-serif font-bold text-gray-900 mb-3 leading-tight group-hover:text-blue-700 transition-colors duration-200`}>
            {article.title}
          </h2>
        </Link>

        <p className={`text-gray-600 font-serif leading-relaxed mb-4 ${featured ? 'text-lg' : 'text-sm line-clamp-3'}`}>
          {article.excerpt}
        </p>

        <div className="flex items-center text-xs text-gray-400 font-sans mt-auto gap-2">
          <span className={`font-semibold ${getCategoryText(article.category)}`}>{article.author}</span>
          <span>•</span>
          <span>{formatDate(article.publishedAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
