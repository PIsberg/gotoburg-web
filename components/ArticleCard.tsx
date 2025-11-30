import React from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../types';

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, featured = false }) => {
  return (
    <div className={`group flex flex-col ${featured ? 'md:grid md:grid-cols-2 md:gap-8' : ''}`}>
      <Link to={`/${article.slug}`} className="block overflow-hidden mb-4 rounded-sm">
        <img 
          src={article.imageUrl} 
          alt={article.title} 
          className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${featured ? 'h-64 md:h-full' : 'h-48'}`}
          loading="lazy"
        />
      </Link>
      
      <div className="flex flex-col justify-center">
        <div className="flex items-center text-xs font-bold tracking-wider text-blue-600 uppercase mb-2">
          {article.category}
        </div>
        <Link to={`/${article.slug}`} className="block group-hover:text-blue-700 transition-colors">
          <h2 className={`${featured ? 'text-3xl md:text-4xl' : 'text-xl'} font-serif font-bold text-gray-900 mb-3 leading-tight`}>
            {article.title}
          </h2>
        </Link>
        <p className={`text-gray-600 font-serif leading-relaxed mb-4 ${featured ? 'text-lg' : 'text-sm line-clamp-3'}`}>
          {article.excerpt}
        </p>
        <div className="flex items-center text-xs text-gray-500 font-sans mt-auto">
          <span className="font-semibold text-gray-900 mr-2">{article.author}</span>
          <span>• {article.publishedAt}</span>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;